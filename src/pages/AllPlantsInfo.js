import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchPlantStats, fetchPlants } from '../api/mockApis';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce'
import PlantModel from '../components/models/PlantModel'
import { useAuth } from '../hooks/useAuth';
import { url } from '../constants/serverInfo'


const StatCard = ({ title, value, icon, colorClass, onClick, isActive }) => (
    <div
        className={`bg-white p-2 rounded-lg shadow flex items-center cursor-pointer transition-all duration-200 ${isActive ? 'ring-2 ring-orange-300 shadow-lg' : 'hover:shadow-md'}`}
        onClick={onClick}
    >
        <div className={`flex-shrink-0 mr-2 p-1.5 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-[14px] font-medium text-gray-500">{title}</p>
            <p className="text-[16px] font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const FilterComponent = ({ filterText, onFilter }) => (
    <input
        id="search"
        type="text"
        placeholder="Filter by MAC or Address or Product Name"
        aria-label="Search Input"
        className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        // Use value instead of defaultValue for controlled input (or remove filterText prop if debounce handles it)
        // Since we are using debounce, defaultValue is fine to prevent re-render issues.
        defaultValue={filterText}
        onChange={onFilter}
    />
);

// --- Custom Data Table (Replaces react-data-table-component) ---
const CustomDataTable = ({ columns, data, onRowClicked, progressPending }) => {
    if (progressPending) {
        return <div className="text-center p-8 text-gray-500">Loading data...</div>;
    }

    if (!data || !data.length) {
        return <div className="text-center p-8 text-gray-500">No records to display.</div>;
    }

    return (
        // Apply styling to the container for a rounded, lifted look
        <div className="overflow-x-auto rounded-lg  bg-white">
            <table className="min-w-full divide-y divide-orange-200">
                {/* Header Row: Apply the subtle orange background here */}
                <thead className="bg-gradient-to-r from-orange-50 to-amber-100">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.name}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider" // Bold text, darker orange color
                            >
                                {col.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {data.map((row, rowIndex) => (
                        <tr
                            key={row.ID || rowIndex}
                            onClick={() => onRowClicked(row)}
                            // Stronger hover effect with a lighter orange/peach tone
                            className="cursor-pointer transition duration-150 ease-in-out hover:bg-orange-100/50"
                        >
                            {columns.map((col, colIndex) => (
                                <td
                                    key={`${col.name}-${colIndex}`}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                                >
                                    {col.cell ? col.cell(row) : (row[col.selector] || '-')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const Pagination = ({ currentPage, perPage, totalRows, onChangePage, onChangeRowsPerPage }) => {
    const totalPages = Math.max(1, Math.ceil(totalRows / perPage)); // Ensure at least 1 page
    const startRow = Math.max(0, (currentPage - 1) * perPage) + 1;
    const endRow = Math.min(currentPage * perPage, totalRows);

    // If totalRows is 0, don't show the range text
    const rowRangeText = totalRows > 0 ? `${startRow}-${endRow} of ${totalRows}` : `0 of 0`;

    return (
        <div className="flex items-center justify-between py-3 px-4 border-t">
            <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Rows per page:</span>
                <select value={perPage} onChange={(e) => onChangeRowsPerPage(Number(e.target.value), 1)} className="border-gray-300 rounded-md text-sm">
                    {[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
            </div>
            <div className="text-sm text-gray-700">
                {rowRangeText}
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => onChangePage(currentPage - 1)} disabled={currentPage <= 1} className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100">
                    Previous
                </button>
                <button onClick={() => onChangePage(currentPage + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100">
                    Next
                </button>
            </div>
        </div>
    );
}

const AllPlantsInfo = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterText, setFilterText] = useState('');
    const [statusFilter, setStatusFilter] = useState('Total');
    const [typefilter, settypefilter] = useState('All');
    const [subTypegtiFilter, setSubTypegtiFilter] = useState('All');
    const [subTypeHybridFilter, setSubTypeHybridFilter] = useState('All');
    const [unboundModalOpen, setUnboundModalOpen] = useState(false);
    const [unbinding, setUnbinding] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(null);

    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deviceStats, setDeviceStats] = useState({ total: 0, online: 0, offline: 0, withAlerts: 0, noAlerts: 0 });
    const navigate = useNavigate();
    const { user } = useAuth();



    const gtiTypes = [
        "All",
        "Abore_GTI_3Phase",
        "GTI_1_3",
        "ThinkPower_1_3",
        "GTI_Abore_3phase",
        "Abore_1Phase",
        "WATECH"
    ];

    const hybridTypes = ["All","Afore_Hybrid", "SRNE_Hybrid"];


    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = (e, row) => {
        e.stopPropagation();
        setSelectedPlant(row);
        setConfirmText('');
        setDeleteModalOpen(true);
    };
    const handleUnbound = (e, row) => {
        e.stopPropagation();
        setSelectedPlant(row);
        setConfirmText('');
        setUnboundModalOpen(true);
    };

    function openModal() {
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
    }

    // --- Data Fetching ---
    const confirmUnboundPlant = async () => {
        if (confirmText !== 'YES') {
            alert('You must type YES to unbound.');
            return;
        }

        try {
            setUnbinding(true);

            const cleanId = String(selectedPlant.ID).replace(/,/g, '');

            const response = await fetch(`${url}/plantAuth/unboundPlant`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plantId: cleanId   // ✅ sending in body
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            setUnboundModalOpen(false);
            fetchServerData(currentPage, perPage, filterText, statusFilter, typefilter, subTypegtiFilter, subTypeHybridFilter);

            alert('Logger unbound successfully');

        } catch (error) {
            alert('Failed to unbound plant: ' + error.message);
        } finally {
            setUnbinding(false);
        }
    };

    const fetchServerData = useCallback(async (page, pPage, fText, sFilter, tFilter, subTypegtiFilter, subTypeHybridFilter) => {
        setLoading(true);
        const { err, data } = await fetchPlants(page, pPage, fText, sFilter, tFilter, subTypegtiFilter, subTypeHybridFilter);
        console.log('data', data);
        if (!err) {
            setDevices(data.data);
            setTotalRows(data.total);
        } else {
            // Keep current data but update total rows based on the last successful count if available, or 0.
            // For simplicity, we just reset to 0
            setDevices([]);
            setTotalRows(0);
        }
        setLoading(false);
    }, []); // Dependencies are stable, so empty array is fine.

    useEffect(() => {
        // Fetch the main stats only once on component mount
        const getStats = async () => {
            const { stats } = await fetchPlantStats();
            setDeviceStats(stats);

        };
        getStats();
    }, []);

    const confirmDeletePlant = async () => {
        if (confirmText !== 'YES') {
            alert('You must type YES to delete.');
            return;
        }

        try {
            setDeleting(true);

            const cleanId = String(selectedPlant.ID).replace(/,/g, '');

            const response = await fetch(`${url}/plantAuth/deletePlant`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plantId: cleanId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            setDeleteModalOpen(false);
            fetchServerData(currentPage, perPage, filterText, statusFilter, typefilter, subTypegtiFilter, subTypeHybridFilter);

        } catch (error) {
            alert('Failed to delete plant: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        // This effect triggers on page, perPage, or statusFilter changes
        fetchServerData(currentPage, perPage, filterText, statusFilter, typefilter, subTypegtiFilter, subTypeHybridFilter);
    }, [currentPage, perPage, statusFilter, fetchServerData, typefilter, subTypegtiFilter, subTypeHybridFilter]); // Added all filters as dependencies

    const debouncedFetch = useMemo(() =>
        // We debounce the *call* to fetchServerData, which will run the API request.
        debounce((page, pPage, fText, sFilter, tFilter, subTypegtiFilter, subTypeHybridFilter) => {
            fetchServerData(page, pPage, fText, sFilter, tFilter, subTypegtiFilter, subTypeHybridFilter);
        }, 500),
        [fetchServerData]);

    const handleFilterChange = e => {
        const text = e.target.value;
        setFilterText(text);
        // Reset to page 1 when searching
        setCurrentPage(1);
        // Pass the new text to the debounced function, which will eventually call fetchServerData(1, ...)
        debouncedFetch(1, perPage, text, statusFilter, typefilter, subTypegtiFilter, subTypeHybridFilter);
    };

    const handleStatusFilterClick = (status) => {
        setStatusFilter(status);
        // Reset to page 1 when changing status filter
        setCurrentPage(1);
    };

    const handletypefilter = (e) => {
        const type = e;
        settypefilter(type);
    };
    // --- Data Table Handlers ---

    const handlePageChange = page => {
        setCurrentPage(page);
    };

    const handlePerRowsChange = async (newPerPage, page) => {
        setPerPage(newPerPage);
        setCurrentPage(page);
    };

    const handleRowClick = (row) => {
        //here row.ID comes 623,282 so i need to fix this and convert into 623282
        // Remove commas from row.ID to get a valid numeric string
        console.log('rowId', row);
        const cleanId = String(row.ID).replace(/,/g, '');
        navigate(`/users/87898/plants/${cleanId}`);
    };

    // --- Action Handlers ---

    console.log("Create Plant action triggered");
    const handleUpdate = (e, row) => {
        e.stopPropagation(); // Prevent row click event
        console.log("Update action", row.ID);
    };
    // const handleDelete = (e, row) => {
    //     e.stopPropagation(); // Prevent row click event
    //     console.log("Delete action", row.ID);
    // };

    const handleExport = () => {
        if (!devices.length) return;
        const headers = ['ID', 'Address', 'ProductName', 'InverterName', 'RmuStatus', 'Createdon', 'InstalltionCapacity'];

        // Custom function to safely get cell value (matching what's displayed in the table)
        const getCellValue = (device, header) => {
            if (header === 'InstalltionCapacity') {
                const cap = Number(device[header]);
                return isNaN(cap) ? 'N/A' : `${cap} kW`;
            }
            if (header === 'InverterName') return device['InvertName']; // Fix typo InvertName -> InverterName
            if (header === 'Createdon') {
                const date = device[header] ? new Date(device[header]) : null;
                return date ? date.toLocaleDateString() : 'N/A';
            }
            return device[header] || '';
        }

        const csvContent = [
            headers.join(','),
            ...devices.map(device =>
                headers.map(header => JSON.stringify(getCellValue(device, header))).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'devices_page.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenPlant = () => {

    }


    // Abore_GTI_3Phase
    // GTI_1_3
    // ThinkPower_1_3
    // GTI_Abore_3phase
    // Abore_1Phase

    const columns = useMemo(() => [
        // Note: Assuming the backend returns these keys (e.g., ProductName, Address, etc.)
        // Changed 'Inverter Name' selector to correct 'InvertName' based on table cell
        { name: 'Plant Name', selector: 'ProductName', sortable: true, grow: 2 },
        { name: 'MAC', selector: 'IMEI', sortable: false, grow: 2 },
        { name: 'Inverter Type', selector: 'ProductType', sortable: true, grow: 2 },
        // { name: 'Inverter Model', selector: 'InverterModel', sortable: true, grow: 2 },
        // { name: 'Phase', selector: 'phase', sortable: true, grow: 1 },
        // {
        //     name: 'MerchantName Name', selector: 'MerchantName', sortable: true, grow: 2,
        //     cell: row => {
        //         if (row.MerchantID && row.AuthorisedMerchant) {
        //             return row.MerchantName;
        //         } else {
        //             return '-';
        //         }
        //     }
        // },
        // {name: 'Updated On', selector: 'UpdatedOn', sortable: true, grow: 2},
        {
            name: 'Capacity',
            selector: 'InstalltionCapacity',
            sortable: true,
            grow: 2,
            cell: row => {
                const cap = Number(row.InstalltionCapacity);
                if (isNaN(cap)) return '-';
                if(cap>1000 )return `${(cap/1000).toFixed(0)} KW`;
                return `${cap} kW`;
            }
        },
        {
            name: 'Status',
            selector: 'RmuStatus',
            sortable: false,
            cell: row => {
                const status = row.RmuStatus;
                const colorClass = status === 'Online' ? 'text-green-700' : status === 'Offline' ? 'text-red-700' : 'text-gray-700';
                const bgClass = status === 'Online' ? 'bg-green-100' : status === 'Offline' ? 'bg-red-100' : 'bg-gray-100';
                return <span className={`px-2 py-1 rounded-full font-semibold text-xs ${colorClass} ${bgClass}`}>{status}</span>;
            }
        },
        { name: 'Address', selector: 'Address', sortable: true, grow: 2 },
        {
            name: 'Created On',
            selector: 'Createdon',
            sortable: true,
            cell: row => {
                const date = row.Createdon ? new Date(row.Createdon) : null;
                return date ? date.toLocaleDateString() : 'N/A';
            }
        },
        {
            name: 'Actions',
            button: true,
            cell: (row) => {
                const role = user?.role?.toLowerCase();

                if (role !== 'admin' && role !== 'engineer') return null;

                return (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={(e) => handleUnbound(e, row)}
                            className="text-yellow-700 bg-yellow-100 hover:bg-yellow-200 text-[10px] font-semibold px-1 rounded-md"
                        >
                            Unbound
                        </button>

                        <button
                            onClick={(e) => handleDelete(e, row)}
                            className="text-red-600 bg-red-100 hover:bg-red-200 text-[10px] font-semibold px-1 rounded-md"
                        >
                            Delete
                        </button>
                    </div>
                );
            }
        }
    ], [handleUpdate, handleDelete]); // Include handlers as dependencies

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <div className="flex flex-col sm:flex-row justify-between items-center w-full py-2 px-4 space-y-2 sm:space-y-0">
                <FilterComponent onFilter={handleFilterChange} filterText={filterText} />
                <div className="flex items-center space-x-2">
                    <button onClick={handleExport} className="px-4 py-2 bg-orange-600 text-white text-[14px] rounded-md hover:bg-orange-700 flex items-center transition duration-150">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                    </button>
                    {/* <button className='px-4 py-1.5 font-seminbold bg-orange-600 text-white hover:bg-orange-700 shadow rounded-md'
                    onClick={openModal}>
                        Create Plant
                    </button> */}

                </div>
            </div>
        );
    }, [filterText, handleFilterChange, handleExport]);

    //  <button onClick={openModal} className="px-4 py-2 bg-indigo-600 text-white text-[14px] rounded-md hover:bg-indigo-700 transition duration-150">
    //                     Create Plant
    //                 </button>

    console.log('Devices in all plant page:', devices);

    return (
        <>
            {loading && (
                <div className="absolute Z-30 inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            )}
            <div className="p-4 md:p-6 min-h-screen">
                {/* --- STATISTICS DASHBOARD --- */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <StatCard title="Total Plants" value={deviceStats.total} colorClass="bg-blue-100 text-blue-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} onClick={() => handleStatusFilterClick('Total')} isActive={statusFilter === 'Total'} />
                    <StatCard title="Online" value={deviceStats.online} colorClass="bg-green-100 text-green-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} onClick={() => handleStatusFilterClick('Online')} isActive={statusFilter === 'Online'} />
                    <StatCard title="Offline" value={deviceStats.offline} colorClass="bg-red-100 text-red-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} onClick={() => handleStatusFilterClick('Offline')} isActive={statusFilter === 'Offline'} />
                    <StatCard title="With Alerts" value={deviceStats.withAlerts} colorClass="bg-orange-100 text-orange-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} onClick={() => handleStatusFilterClick('With Alerts')} isActive={statusFilter === 'With Alerts'} />
                    <StatCard title="No Alerts" value={deviceStats.noAlerts} colorClass="bg-indigo-100 text-indigo-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M17 12a5 5 0 11-10 0 5 5 0 0110 0z" /></svg>} onClick={() => handleStatusFilterClick('No Alerts')} isActive={statusFilter === 'No Alerts'} />
                </div>

                <div className="flex items-center gap-2 mb-4 p-1 bg-gray-100 rounded-2xl w-fit shadow-sm">
                    {["All", "GTI", "NON GTI", "HYBRID"].map((type) => (
                        <button
                            key={type}
                            onClick={() => handletypefilter(type)}
                            className={`
                px-5 py-2 rounded-xl text-sm font-semibold
                transition-all duration-300
                ${typefilter === type
                                    ? "bg-orange-600 text-white shadow-lg"
                                    : "text-gray-600 hover:bg-white hover:text-orange-600"
                                }
            `}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                {/* {(typefilter == "GTI" || typefilter == "HYBRID") && <div>
                    {typefilter == "GTI" && <div className="flex items-center gap-2 mb-4 p-1 bg-gray-100 rounded-2xl w-fit shadow-sm">
                        {gtiTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setSubTypegtiFilter(type)}
                                className={`
                px-5 py-2 rounded-xl text-sm font-semibold
                transition-all duration-300
                ${subTypegtiFilter === type
                                        ? "bg-orange-600 text-white shadow-lg"
                                        : "text-gray-600 hover:bg-white hover:text-orange-600"
                                    }
            `}
                            >
                                {type}
                            </button>
                        ))}
                    </div>}
                    {typefilter == "HYBRID" && <div className="flex items-center gap-2 mb-4 p-1 bg-gray-100 rounded-2xl w-fit shadow-sm">
                    {hybridTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSubTypeHybridFilter(type)}
                            className={`
                px-5 py-2 rounded-xl text-sm font-semibold
                transition-all duration-300
                ${subTypeHybridFilter === type
                                    ? "bg-orange-600 text-white shadow-lg"
                                    : "text-gray-600 hover:bg-white hover:text-orange-600"
                                }
            `}
                        >
                            {type}
                        </button>
                    ))}
                </div>}
                </div>} */}
                {/* --- DATA TABLE --- */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="flex justify-between items-center w-full p-4">
                        <h2 className="text-lg font-bold text-gray-800">Plants Overview</h2>
                    </div>
                    {subHeaderComponentMemo}
                    <CustomDataTable
                        columns={columns}
                        data={devices}
                        progressPending={loading}
                        onRowClicked={handleRowClick}

                    />
                    <Pagination
                        currentPage={currentPage}
                        perPage={perPage}
                        totalRows={totalRows}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handlePerRowsChange}
                    />
                    <PlantModel isOpen={isModalOpen} closeModal={closeModal} />
                    {deleteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white rounded-lg shadow-xl w-96 p-6">
                                <h3 className="text-lg font-bold text-red-600 mb-3">
                                    Confirm Delete
                                </h3>

                                <p className="text-sm text-gray-600 mb-3">
                                    Are you sure you want to delete plant:
                                    <span className="font-semibold"> {selectedPlant?.ProductName}</span>?
                                </p>

                                <p className="text-sm text-gray-600 mb-2">
                                    Type <span className="font-bold text-red-600">YES</span> to confirm.
                                </p>

                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 mb-4 focus:ring-2 focus:ring-red-300"
                                    placeholder="Type YES"
                                />

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="px-4 py-2 rounded-md border"
                                        disabled={deleting}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={confirmDeletePlant}
                                        disabled={confirmText !== 'YES' || deleting}
                                        className={`px-4 py-2 rounded-md text-white ${confirmText === 'YES'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {deleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {unboundModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white rounded-lg shadow-xl w-96 p-6">
                                <h3 className="text-lg font-bold text-yellow-600 mb-3">
                                    Confirm Unbound
                                </h3>

                                <p className="text-sm text-gray-600 mb-3">
                                    Are you sure you want to unbound logger from plant:
                                    <span className="font-semibold"> {selectedPlant?.ProductName}</span>?
                                </p>

                                <p className="text-sm text-gray-600 mb-2">
                                    Type <span className="font-bold text-yellow-600">YES</span> to confirm.
                                </p>

                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 mb-4 focus:ring-2 focus:ring-yellow-300"
                                    placeholder="Type YES"
                                />

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setUnboundModalOpen(false)}
                                        className="px-4 py-2 rounded-md border"
                                        disabled={unbinding}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={confirmUnboundPlant}
                                        disabled={confirmText !== 'YES' || unbinding}
                                        className={`px-4 py-2 rounded-md text-white ${confirmText === 'YES'
                                            ? 'bg-yellow-600 hover:bg-yellow-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {unbinding ? 'Unbinding...' : 'Unbound'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>

    );
};

export default AllPlantsInfo;
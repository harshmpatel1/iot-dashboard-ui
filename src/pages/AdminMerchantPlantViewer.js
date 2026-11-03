import { useEffect, useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { fetchPlantsForMerchant } from '../api/mockApis'; // Updated import path
import { useNavigate } from 'react-router-dom';
import { url } from '../constants/serverInfo';

// --- Reusable Component for Stat Cards ---
const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white p-2 rounded-lg shadow flex items-center">
        <div className={`flex-shrink-0 mr-2 p-1 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-[14px] font-medium text-gray-500">{title}</p>
            <p className="text-[16px] font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

// --- Helper component for the search/filter input ---
const FilterComponent = ({ filterText, onFilter }) => (
    <input
        id="search"
        type="text"
        placeholder="Filter by Address or Product Name"
        aria-label="Search Input"
        className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        value={filterText}
        onChange={onFilter}
    />
);


const MerchantOnlyPlants = ({ merchantId }) => {

    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDevices = async () => {

            try {

                if (merchantId) {
                    const response = await fetchPlantsForMerchant(merchantId);
                    let plants = response.plants;
                    setDevices(plants);
                }

            } catch (error) {
                console.error("Failed to fetch devices:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, [merchantId]);

    const deviceStats = useMemo(() => {
        const total = devices.length;
        const online = devices.filter(d => d.RmuStatus === 'Online').length;
        const offline = devices.filter(d => d.RmuStatus === 'Offline').length;
        const incomplete = devices.filter(d => d.RmuStatus === 'Incomplete').length;
        const withAlerts = devices.filter(d => d.alerts && d.alerts > 0).length;
        const noAlerts = total - withAlerts;
        return { total, online, offline, incomplete, withAlerts, noAlerts };
    }, [devices]);


    const handleCreate = () => {
        console.log("Create Plant action triggered");
        navigate('/devices/new');
    };

    const handleUpdate = (row) => {
        window.event.stopPropagation();
        console.log("Update action triggered for device:", row.ID);
        navigate(`/devices/${row.ID}/edit`);
    };


    const handleExport = () => {
        if (!devices.length) return;

        const headers = ['ID', 'Address', 'ProductName', 'Inverter Name', 'Status', 'Created On'];

        const csvContent = [
            headers.join(','), // Header row
            ...devices.map(device =>
                headers.map(header => JSON.stringify(device[header])).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'devices.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = (e, row) => {
        e.stopPropagation();
        setSelectedPlant(row);
        setConfirmText('');
        setDeleteModalOpen(true);
    };

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

            // ✅ Update UI without reload
            setDevices((prev) => prev.filter((d) => d.ID !== selectedPlant.ID));

            setDeleteModalOpen(false);

        } catch (error) {
            alert('Failed to delete plant: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    // --- Row Click Handler ---
    const handleRowClick = (row) => {
        // UPDATE: Use the correct ID field from the new data
        if (merchantId) {
            console.log('navigate', merchantId);
            navigate(`/merchants/${merchantId}/plants/${row.ID}`);
        }
    };


    const columns = useMemo(() => [
        { name: 'Product Name', selector: row => row.ProductName, sortable: true, grow: 2 },
        { name: 'Address', selector: row => row.Address, sortable: true, grow: 2 },
        { name: 'Inverter Name', selector: row => row.InvertName, sortable: true, grow: 2 },
        {
            name: 'Status',
            selector: row => row.RmuStatus,
            sortable: true,
            grow: 2,
            cell: row => {
                const status = row.RmuStatus;
                let colorClass = '';
                let bgClass = '';
                if (status === 'Online') {
                    colorClass = 'text-green-700';
                    bgClass = 'bg-green-100';
                } else if (status === 'Offline') {
                    colorClass = 'text-red-700';
                    bgClass = 'bg-red-100';
                } else {
                    colorClass = 'text-gray-700';
                    bgClass = 'bg-gray-100';
                }
                return (
                    <span className={`px-2 py-1 rounded-full font-semibold text-xs ${colorClass} ${bgClass}`}>
                        {status}
                    </span>
                );
            }
        },
        {
            name: 'Created On',
            selector: row => row.Createdon,
            sortable: true,
            grow: 2,
            cell: row => {
                const date = row.Createdon ? new Date(row.Createdon) : null;
                return date
                    ? date.toLocaleString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    : '';
            }
        },
        {
            name: 'Actions', button: true, cell: (row) => (
                <div className="flex items-center space-x-2">
                    {/* <button onClick={() => handleUpdate(row)} className="text-indigo-600 hover:text-indigo-900 text-xl">✎</button> */}
                    <button
                        onClick={(e) => handleDelete(e, row)}
                        className="text-red-900 p-1 bg-red-100 hover:text-red-900 text-[10px]"
                    >
                        delete
                    </button>
                </div>
            )
        },
    ], []);

    const filteredDevices = devices.filter(
        device =>
            (device.Address && device.Address.toLowerCase().includes(filterText.toLowerCase())) ||
            (device.ProductName && device.ProductName.toLowerCase().includes(filterText.toLowerCase()))
    );

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <div className="flex justify-between items-center w-full py-2">
                <FilterComponent onFilter={e => setFilterText(e.target.value)} filterText={filterText} />
                <div className="flex items-center space-x-2">
                    <button onClick={handleExport} className="px-4 py-2 bg-green-600 text-white text-[14px] rounded-md hover:bg-green-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                    </button>
                    {/* <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white text-[14px]  rounded-md hover:bg-indigo-700">
                        Create Plant
                    </button> */}
                </div>
            </div>
        );
    }, [filterText, devices]);

    if (loading) {
        return <div className="text-center p-4">Loading devices...</div>;
    }

    return (
        <div className="px-4 md:px-6  min-h-screen">
            {/* --- STATISTICS DASHBOARD --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <StatCard title="Total Plants" value={deviceStats.total} colorClass="bg-blue-100 text-blue-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
                <StatCard title="Online" value={deviceStats.online} colorClass="bg-green-100 text-green-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Offline" value={deviceStats.offline} colorClass="bg-red-100 text-red-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Incomplete" value={deviceStats.incomplete} colorClass="bg-yellow-100 text-yellow-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
                <StatCard title="With Alerts" value={deviceStats.withAlerts} colorClass="bg-orange-100 text-orange-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} />
                <StatCard title="No Alerts" value={deviceStats.noAlerts} colorClass="bg-indigo-100 text-indigo-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M17 12a5 5 0 11-10 0 5 5 0 0110 0z" /></svg>} />
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <DataTable
                    title={<h2 className="text-[14px] font-bold">Plants</h2>}
                    columns={columns}
                    data={filteredDevices}
                    pagination
                    subHeader
                    subHeaderComponent={subHeaderComponentMemo}
                    persistTableHead
                    onRowClicked={handleRowClick}
                    pointerOnHover
                    highlightOnHover
                    customStyles={{
                        rows: { style: { cursor: 'pointer' } },
                    }}
                />
            </div>

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

        </div>
    );
};

export default MerchantOnlyPlants;
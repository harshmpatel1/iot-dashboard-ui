import { useEffect, useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { fetchPlantsForMerchant } from '../../api/mockApis'; // Updated import path
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthPlant from '../../pages/AuthPlant';
import PlantModel from '../../components/models/PlantModel'
import React, { useContext } from 'react';
import { url } from '../../constants/serverInfo'


// --- Reusable Component for Stat Cards ---
const StatCard = ({ title, value, icon, colorClass }) => (
    <div className=" border-2 border-orange-200 bg-white p-2 rounded-lg shadow flex items-center">
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

const MerchantOnlyPlants = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [showAuthPlant, setShowAuthPlant] = useState(false);
    const [showCreatePlant, setShowCreatePlant] = useState(false);
    const [processingUnauth, setProcessingUnauth] = useState(null);
    const [processingNameUpdate, setProcessingNameUpdate] = useState(null);
    const [processingAddressUpdate, setProcessingAddressUpdate] = useState(null);
    const [editingPlant, setEditingPlant] = useState(null);
    const [editField, setEditField] = useState('');
    const [editValue, setEditValue] = useState('');

    const addPlant = () => {
        setShowAuthPlant(true);
        console.log('d');
    }

    const createPlant = () => {
        navigate('/createPlant');

        // setShowCreatePlant(true)
    }

    const requestedPlants = () => {
        navigate('/requestedPlants');
    }

    const requestedBulkPlants = () => {
        navigate('/requestedBulkPlants');
    }

    const closeCreatePlant = () => {
        setShowCreatePlant(false)
    }

    const closeAuthPlant = () => {
        setShowAuthPlant(false);
    }

    const { user } = useAuth();
    console.log('mds', user);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                if (user) {
                    const response = await fetchPlantsForMerchant(user.ID);
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
    }, [user]);

    // Function to handle unauthorized action
    const handleUnauthorize = async (row) => {
        window.event.stopPropagation();
        setProcessingUnauth(row.ID);

        try {
            console.log("Unauthorize action triggered for device:", row.ID);

            const response = await fetch(`${url}/plantAuth/unAuthPlant`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: row.ID }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Unauthorize successful:', result.message);

                // Update local state to remove the unauthorized plant
                setDevices(prevDevices => prevDevices.filter(device => device.ID !== row.ID));

                // Show success message (you can replace with toast notification)
                alert(`Plant "${row.ProductName}" has been unauthorized successfully.`);
            } else {
                throw new Error('Failed to unauthorize plant');
            }
        } catch (error) {
            console.error('Error unauthorizing plant:', error);
            alert('Failed to unauthorize plant. Please try again.');
        } finally {
            setProcessingUnauth(null);
        }
    };

    // Function to update plant name
    const handleUpdateName = async (row) => {
        window.event.stopPropagation();
        const newName = prompt(`Enter new name for "${row.ProductName}":`, row.ProductName);

        if (newName && newName !== row.ProductName) {
            setProcessingNameUpdate(row.ID);

            try {
                console.log("Updating plant name:", row.ID, newName);

                const response = await fetch(`${url}/plants/changeProductName`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: row.ID,
                        newProductName: newName
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Name update successful:', result.message);

                    // Update local state
                    setDevices(prevDevices =>
                        prevDevices.map(device =>
                            device.ID === row.ID
                                ? { ...device, ProductName: newName }
                                : device
                        )
                    );

                    alert(`Plant name updated successfully to "${newName}".`);
                } else {
                    throw new Error('Failed to update plant name');
                }
            } catch (error) {
                console.error('Error updating plant name:', error);
                alert('Failed to update plant name. Please try again.');
            } finally {
                setProcessingNameUpdate(null);
            }
        }
    };

    // Function to update plant address
    const handleUpdateAddress = async (row) => {
        window.event.stopPropagation();
        const newAddress = prompt(`Enter new address for "${row.ProductName}":`, row.Address);

        if (newAddress && newAddress !== row.Address) {
            setProcessingAddressUpdate(row.ID);

            try {
                console.log("Updating plant address:", row.ID, newAddress);

                const response = await fetch(`${url}/plants/changePlantAddress`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: row.ID,
                        newAddress: newAddress
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Address update successful:', result.message);

                    // Update local state
                    setDevices(prevDevices =>
                        prevDevices.map(device =>
                            device.ID === row.ID
                                ? { ...device, Address: newAddress }
                                : device
                        )
                    );

                    alert(`Plant address updated successfully.`);
                } else {
                    throw new Error('Failed to update plant address');
                }
            } catch (error) {
                console.error('Error updating plant address:', error);
                alert('Failed to update plant address. Please try again.');
            } finally {
                setProcessingAddressUpdate(null);
            }
        }
    };

    const deviceStats = useMemo(() => {
        const total = devices.length;
        const online = devices.filter(d => d.RmuStatus === 'Online').length;
        const offline = devices.filter(d => d.RmuStatus === 'Offline').length;
        const withAlerts = devices.filter(d => d.alerts && d.alerts > 0).length;
        const noAlerts = total - withAlerts;
        return { total, online, offline, withAlerts, noAlerts };
    }, [devices]);



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


    // --- Row Click Handler ---
    const handleRowClick = (row) => {
        // UPDATE: Use the correct ID field from the new data
        if (user.ID) {
            console.log('navigate', user.ID);
            navigate(`/merchants/${user.ID}/plants/${row.ID}`);
        }
    };

    const columns = useMemo(() => [
        { name: 'Plant Name', selector: row => row.ProductName, sortable: true, grow: 4},
        { name: 'Address', selector: row => row.Address, sortable: true, grow: 4 },
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
            name: 'Actions',
            button: true,
            cell: (row) => (
                <div className="flex items-center space-x-2">
                    {/* Update Name Button */}
                    <button
                        onClick={() => handleUpdateName(row)}
                        disabled={processingNameUpdate === row.ID}
                        className="text-blue-600 hover:text-blue-900 text-sm flex items-center disabled:opacity-50"
                        title="Update Plant Name"
                    >
                        {processingNameUpdate === row.ID ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        )}
                    </button>

                    {/* Update Address Button */}
                    <button
                        onClick={() => handleUpdateAddress(row)}
                        disabled={processingAddressUpdate === row.ID}
                        className="text-green-600 hover:text-green-900 text-sm flex items-center disabled:opacity-50"
                        title="Update Plant Address"
                    >
                        {processingAddressUpdate === row.ID ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </button>

                    {/* Unauthorize Button */}
                    <button
                        onClick={() => handleUnauthorize(row)}
                        disabled={processingUnauth === row.ID}
                        className="text-red-600 hover:text-red-900 text-sm flex items-center disabled:opacity-50"
                        title="Unauthorize Plant"
                    >
                        {processingUnauth === row.ID ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className='h-4 w-4' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                <circle cx="12" cy="16" r="6" fill="#FFF" stroke="#FF0000" strokeWidth="2.5" />
                                <line x1="8" y1="20" x2="16" y2="12" stroke="#FF0000" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        )}
                    </button>
                </div>
            )
        },
    ], [processingUnauth, processingNameUpdate, processingAddressUpdate]);

    const filteredDevices = devices.filter(
        device =>
            (device.Address && device.Address.toLowerCase().includes(filterText.toLowerCase())) ||
            (device.ProductName && device.ProductName.toLowerCase().includes(filterText.toLowerCase()))
    );

    const subHeaderComponentMemo = useMemo(() => {
        return (
            <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-2">
                <div><FilterComponent onFilter={e => setFilterText(e.target.value)} filterText={filterText} /></div>
                <div className="grid w-full  gap-2 grid-cols-3 sm:grid-cols-5">
                    <button onClick={handleExport} className="px-4 py-2 bg-orange-600 text-white text-[12px] rounded-md hover:bg-orange-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export CSV
                    </button>
                    <button onClick={addPlant} className="px-2 py-2 bg-orange-600 text-white text-[12px] rounded-md hover:bg-orange-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add plant
                    </button>
                    <button onClick={createPlant} className="px-2 py-2 bg-orange-600 text-white text-[12px] rounded-md hover:bg-orange-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm0 0h16M4 12h16M4 18h16M10 4v16M14 4v16" />
                        </svg>
                        Create plant
                    </button>
                    <button onClick={requestedPlants} className="px-2 py-2 bg-orange-600 text-white text-[12px] rounded-md hover:bg-orange-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Pending Requests
                    </button>
                    <button onClick={requestedBulkPlants} className="px-2 py-2 bg-orange-600 text-white text-[12px] rounded-md hover:bg-orange-700 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="16 17 12 13 8 17" />
                            <line x1="12" y1="13" x2="12" y2="21" />
                            <path d="M20.88 18.09A5 5 0 0 0 18 10h-1.26A8 8 0 1 0 3 14.19" />
                        </svg>
                        Bulk Requests
                    </button>

                </div>
            </div>
        );
    }, [filterText, devices]);

    if (loading) {
        return <div className="text-center p-4">Loading devices...</div>;
    }

    return (
        <div className="  min-h-screen">
            {/* --- STATISTICS DASHBOARD --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <StatCard title="Total Plants" value={deviceStats.total} colorClass="bg-blue-100 text-blue-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
                <StatCard title="Online" value={deviceStats.online} colorClass="bg-green-100 text-green-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Offline" value={deviceStats.offline} colorClass="bg-red-100 text-red-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="With Alerts" value={deviceStats.withAlerts} colorClass="bg-orange-100 text-orange-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} />
                <StatCard title="No Alerts" value={deviceStats.noAlerts} colorClass="bg-indigo-100 text-indigo-600" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M17 12a5 5 0 11-10 0 5 5 0 0110 0z" /></svg>} />
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white p-2 rounded-lg shadow-md  border-2 border-orange-200">
                <DataTable
                    title={<h2 className="text-[14px] font-bold">Plants</h2>}
                    columns={columns}
                    data={filteredDevices}
                    pagination
                    subHeader
                    width={20}
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

            <AuthPlant
                isOpen={showAuthPlant}
                onClose={closeAuthPlant}
            />
            <PlantModel
                isOpen={showCreatePlant}
                closeModal={closeCreatePlant}
            />

        </div>
    );
};

export default MerchantOnlyPlants;
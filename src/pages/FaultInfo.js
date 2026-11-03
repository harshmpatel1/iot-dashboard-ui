import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { fetchFaults } from '../api/mockApis';

const FaultInfo = () => {
    const { plantId } = useParams();
    const [faults, setFaults] = useState([]);
    const [loading, setLoading] = useState(true);

    // Define the columns for the data table
    const columns = [
        {
            name: 'Fault Code',
            selector: row => row.Fault,
            sortable: true,
            width: '150px',
        },
        {
            name: 'Description',
            selector: row => row.Description,
            sortable: true,
            grow: 2, // Allow this column to take more space
        },
        {
            name: 'Date & Time',
            selector: row => row.FaultDate,
            sortable: true,
            // Format the date for better readability
            format: row => {
                // const date = new Date(row.FaultDate);
                const date = row.FaultDate; 
                // date.setHours(date.getHours() + 6);
                let cleaned = date.replace("T", " ").split(".")[0];
                return cleaned;
            },
        },
    ];

    // Custom styles for yellow theme
    const customStyles = {
        header: {
            style: {
                minHeight: '56px',
                backgroundColor: '#fefce8', // Light yellow background
                borderBottom: '2px solid #f59e0b', // Amber border
            },
        },
        headRow: {
            style: {
                backgroundColor: '#fef3c7', // Amber-100 background
                borderBottomColor: '#f59e0b', // Amber-500 border
                color: '#92400e', // Amber-900 text
                fontWeight: 'bold',
                fontSize: '14px',
            },
        },
        headCells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                borderRight: '1px solid #fbbf24', // Amber-300 border between headers
                '&:last-child': {
                    borderRight: 'none',
                },
            },
        },
        rows: {
            style: {
                minHeight: '48px',
                backgroundColor: '#fffbeb', // Amber-50 background for rows
                '&:nth-child(even)': {
                    backgroundColor: '#fef3c7', // Amber-100 for striped rows
                },
                '&:hover': {
                    backgroundColor: '#fde68a', // Amber-200 on hover
                    transition: 'background-color 0.2s ease',
                },
            },
        },
        cells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                borderRight: '1px solid #fef3c7', // Subtle border between cells
                '&:last-child': {
                    borderRight: 'none',
                },
                color: '#78350f', // Amber-950 text color
            },
        },
        pagination: {
            style: {
                backgroundColor: '#fefce8', // Light yellow background
                borderTop: '2px solid #f59e0b', // Amber border
                color: '#92400e', // Amber-900 text
            },
            pageButtonsStyle: {
                color: '#92400e', // Amber-900
                fill: '#92400e',
                '&:disabled': {
                    color: '#d97706', // Amber-600 when disabled
                    fill: '#d97706',
                },
                '&:hover:not(:disabled)': {
                    backgroundColor: '#f59e0b', // Amber-500 on hover
                    color: 'white',
                },
            },
        },
        progress: {
            style: {
                backgroundColor: '#fefce8', // Light yellow background
                color: '#d97706', // Amber-600 progress color
            },
        },
    };

    // Custom conditional row styles for different fault statuses
    const conditionalRowStyles = [
        {
            when: row => row.severity === 'high',
            style: {
                backgroundColor: '#fef3c7', // Amber-100 for high severity
                borderLeft: '4px solid #dc2626', // Red-600 border for critical faults
            },
        },
        {
            when: row => row.severity === 'medium',
            style: {
                backgroundColor: '#fefce8', // Amber-50 for medium severity
                borderLeft: '4px solid #d97706', // Amber-600 border
            },
        },
        {
            when: row => row.severity === 'low',
            style: {
                backgroundColor: '#fffbeb', // Default for low severity
                borderLeft: '4px solid #f59e0b', // Amber-500 border
            },
        },
    ];

    // useEffect to fetch data when the component mounts or plantId changes
    useEffect(() => {
        const getFaults = async () => {
            try {
                setLoading(true);
                const res = await fetchFaults(plantId);
                setFaults(res && res.length > 0 ? res : []);
            } catch (err) {
                console.error('Error fetching faults:', err);
                // Optionally, set an error state here
            } finally {
                setLoading(false);
            }
        };

        getFaults();
    }, [plantId]);

    return (
        <div className="p-4 bg-amber-50 min-h-screen"> {/* Amber-50 background for entire page */}
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 p-6 rounded-lg shadow-lg mb-6">
                <h1 className="text-3xl font-bold text-white text-center">
                    ⚡ Fault Information
                </h1>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-amber-200">
                <DataTable
                    columns={columns}
                    data={faults}
                    progressPending={loading}
                    pagination
                    highlightOnHover
                    striped
                    customStyles={customStyles}
                    conditionalRowStyles={conditionalRowStyles}
                    progressComponent={
                        <div className="p-4 text-amber-700 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-2"></div>
                            Loading faults...
                        </div>
                    }
                    noDataComponent={
                        <div className="p-8 text-amber-700 text-center">
                            <div className="text-4xl mb-2">🔍</div>
                            <div className="text-lg font-semibold">No faults found</div>
                            <div className="text-sm text-amber-600">No fault data available for this plant</div>
                        </div>
                    }
                />
            </div>

            {/* Additional styling for the page */}

        </div>
    );
}

export default FaultInfo;
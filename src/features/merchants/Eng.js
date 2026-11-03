import React, { useEffect, useState } from 'react'
import { url } from '../../constants/serverInfo'
import DataTable from "react-data-table-component";
import { Trash2 } from 'lucide-react';
import DeleteConfirmationModal from '../../components/models/DeleteConformationModel';

const Engineerlist = () => {

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [data, setData] = useState([]);

    const closeDeleteModal = () => setDeleteTarget(null);

    // ---------------------------------------------------
    // FETCH ENGINEER LIST
    // ---------------------------------------------------
    const fetchEnggList = async () => {
        try {
            const res = await fetch(`${url}/eng/engg-list`);

            if (!res.ok) throw new Error('Failed to fetch engineer list');

            const users = await res.json();
            setData(users.body || []);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    useEffect(() => {
        fetchEnggList();
    }, []);

    // ---------------------------------------------------
    // DELETE HANDLER
    // ---------------------------------------------------
    const handleDeleteClick = (row) => {
        setDeleteTarget({ id: row.id, name: row.Name });
    };

    const confirmDeleteMerchant = async () => {
        if (!deleteTarget) return;

        const Engg_Id = deleteTarget.id;

        try {
            const res = await fetch(`${url}/eng/delete/${Engg_Id}`, {
                method: "DELETE",
            });

            const result = await res.json();

            if (result?.deleted) {
                alert(`Successfully deleted engineer: ${deleteTarget.name}`);
                closeDeleteModal();
                fetchEnggList();
            } else {
                alert(`Failed to delete engineer: ${result.error || "Unknown error"}`);
            }

        } catch (err) {
            console.error("Deletion failed:", err);
            alert("An unexpected error occurred during deletion.");
        }
    };

    // ---------------------------------------------------
    // COLUMNS
    // ---------------------------------------------------
    const columns = [
        {
            name: "ID",
            selector: row => row.id,
            sortable: true,
            width: "80px",
        },
        {
            name: "Engineer",
            selector: row => row.Name,
            sortable: true,
        },
        {
            name: "Email",
            selector: row => row.Email,
        },
        {
            name: "State",
            selector: row => row.State,
        },
        {
            name: "Created Date",
            selector: row => row.CreateDate,
        },
        {
            name: 'Actions',
            cell: row => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(row);
                    }}
                    className="p-2 rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md"
                    title="Delete Engineer"
                >
                    <Trash2 size={16} />
                </button>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            minWidth: '80px',
        },
    ];

    // ---------------------------------------------------
    // CUSTOM STYLES
    // ---------------------------------------------------
    const customStyles = {
        tableWrapper: {
            style: {
                backgroundColor: '#FFFDE7',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 15px rgba(0, 0, 0, 0.08)',
            },
        },
        head: {
            style: {
                backgroundColor: '#FF9800', // Primary Orange for a distinct header
                color: '#ab8080ff', // White text for contrast
                fontSize: '16px',
                fontWeight: '700', // Bolder header text
            },
        },
        headCells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)',
            },
        },
        rows: {
            style: {
                cursor: 'pointer',
                color: '#424242',
                borderBottom: '1px solid #FFECB3',
            },
            highlightOnHoverStyle: {
                backgroundColor: '#FFECB3',
                color: '#424242',
                transition: 'all 0.15s ease-in-out',
            },
        },
        cells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        pagination: {
            style: {
                backgroundColor: 'transparent',
                borderTop: '1px solid #FFECB3',
                color: '#424242',
            },
            pageButtonsStyle: {
                "&:hover": {
                    backgroundColor: '#FFB300',
                    color: 'white',
                },
            },
        },
    };

    return (
        <div>
            <h1 className="text-3xl m-3 p-3 font-extrabold text-[#D84315] tracking-tight">
                Engineer List
            </h1>

            <DataTable
                columns={columns}
                data={data}
                pagination
                highlightOnHover
                pointerOnHover
                customStyles={customStyles}
                fixedHeader
                fixedHeaderScrollHeight="400px"
            />

            {deleteTarget && (
                <DeleteConfirmationModal
                    isOpen={!!deleteTarget}
                    closeModal={closeDeleteModal}
                    merchantName={deleteTarget.name}
                    onConfirm={confirmDeleteMerchant}
                />
            )}
        </div>
    );
};

export default Engineerlist;
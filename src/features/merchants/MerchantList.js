import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { getMerchants, deleteMerchant } from '../../api/mockApis'; // Your API function
import CreateMerchantModal from '../../components/models/Model'
import CreateEnggmodel from '../../components/models/CreateEnggmodal'
// Assuming you will create this component
import DeleteConfirmationModal from '../../components/models/DeleteConformationModel';
// Import a feather icon library or use a simple SVG for a cleaner look
import { Trash2, PlusCircle } from 'lucide-react'; // Example using lucide-react (or similar)
import AdminAuthPlant from '../../pages/AdminAuthPlant';

// --- Color Palette for Orange Light Theme ---
// Primary Orange: #FF9800 (Amber)
// Light Background: #FFFDE7 (Lightest Yellow/Cream)
// Secondary Accent: #FFB300 (Darker Amber)
// Text Color: #424242 (Dark Gray)

const MerchantList = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isenggModalOpen, setIsenggModalOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null); // { id: number, name: string }
  const [showAuthPlant, setShowAuthPlant] = useState(false);

  // --- Modal Handlers ---
  const openCreateModal = () => setIsCreateModalOpen(true);
  const openenggModal = () => setIsenggModalOpen(true);

  const closeCreateModal = () => setIsCreateModalOpen(false);
  const closeEnggModal = () => setIsenggModalOpen(false);

  const closeDeleteModal = () => setDeleteTarget(null);
  const addPlant = () => {
    setShowAuthPlant(true);
    console.log('d');
  }
  const closeAuthPlant = () => {
    setShowAuthPlant(false);
  }

  // --- Data Fetching ---
  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate a small delay to show the loading state better with the new design
      await new Promise(resolve => setTimeout(resolve, 500));
      const merchantList = await getMerchants();
      console.log("Fetched merchants:", merchantList);
      setMerchants(merchantList || []); // Ensure we set an empty array if the response is null/undefined 
    } catch (error) {
      console.error("Failed to fetch merchants:", error);
      // Optionally show a user-facing error message here
    } finally {
      setLoading(false);
    }
  }, []);
  const requestedBulkPlants = () => {
    navigate('/requestedBulkPlants');
  }

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);


  // --- Action Handlers ---
  const handleRowClicked = (row) => {
    navigate(`/merchants/${row.ID}/plants`);
  };

  const handleDeleteClick = (row) => {
    setDeleteTarget({ id: row.ID, name: row.MerchantName });
  };

  const createPlant = () => {
        navigate('/createPlant');

        // setShowCreatePlant(true)
    }

  const confirmDeleteMerchant = async () => {
    if (!deleteTarget) return;

    const merchantId = deleteTarget.id;
    console.log("merchant Id: ",merchantId)

    try {
      // Show a temporary loading state or spinner in the modal if needed
      const result = await deleteMerchant({ MerchantId: merchantId });

      if (result.deleted) {
        // You could use a better toast/notification system instead of alert
        alert(`Successfully deleted merchant: ${deleteTarget.name}`);
        closeDeleteModal();
        fetchMerchants();
      } else {
        alert(`Failed to delete merchant: ${result.error || 'An unknown error occurred'}`);
      }

    } catch (error) {
      console.error("Deletion failed:", error);
      alert('An unexpected error occurred during deletion.');
    }
  };

  // Define the columns for the data table
  const columns = [
    {
      name: 'Merchant Name',
      selector: row => row.MerchantName,
      sortable: true,
      minWidth: '50px',
    },
    {
      name: 'Email',
      selector: row => row.MerchantEmail,
      sortable: true,
      minWidth: '220px',
    },
    {
      name: 'Mobile',
      selector: row => row.MerchantMobile,
    },
    {
      name: 'Created Date',
      selector: row => new Date(row.CreatedDate).toLocaleDateString(),
      sortable: true,
    },
    {
      name: 'Status',
      cell: row => (
        // Enhanced status pill classes with Tailwind
        <span className={
          row.isactive
            ? 'px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800'
            : 'px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-red-100 text-red-800'
        }>
          {row.isactive ? 'Active' : 'Inactive'}
        </span>
      ),
      sortable: true,
      selector: row => row.isactive,
    },
    {
      name: 'Actions',
      cell: row => (
        // Style the delete button to fit the orange theme, but keep red for danger
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row);
          }}
          // Used a slightly darker red/orange for the button
          className="p-2 rounded-full text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md"
          title="Delete Merchant"
        >
          {/* Using an icon for a cleaner look */}
          <Trash2 size={16} />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: '80px',
    },
  ];

  // --- Custom Styles for the Orange Light Theme DataTable ---
  const customStyles = {
    // Apply the very light, creamy background to the entire container
    tableWrapper: {
      style: {
        backgroundColor: '#FFFDE7', // Lightest Yellow/Cream
        borderRadius: '12px',
        overflow: 'hidden', // Ensures inner elements respect the rounded corners
        boxShadow: '0 8px 15px rgba(0, 0, 0, 0.08)', // A softer, more prominent shadow
      },
    },
    // Style for the table header
    head: {
      style: {
        backgroundColor: '#FF9800', // Primary Orange for a distinct header
        color: '#ab8080ff', // White text for contrast
        fontSize: '16px',
        fontWeight: '700', // Bolder header text
      },
    },
    // Style for the header cells
    headCells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)', // Light separator
      },
    },
    // Style for the data rows
    rows: {
      style: {
        cursor: 'pointer',
        color: '#424242',
        borderBottom: '1px solid #FFECB3', // Very light orange separator
        // No stripe for a cleaner look, the hover effect will be enough
      },
      highlightOnHoverStyle: {
        backgroundColor: '#FFECB3', // Very light orange hover
        color: '#424242',
        // boxShadow: '0 0 5px rgba(255, 152, 0, 0.3)', // Subtle hover shadow
        transition: 'all 0.15s ease-in-out',
      },
    },
    // Style for the cells (optional, if you need uniform padding)
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      }
    },
    // Style for the pagination bar
    pagination: {
      style: {
        backgroundColor: 'transparent',
        borderTop: '1px solid #FFECB3', // Match the row separator
        color: '#424242',
      },
      pageButtonsStyle: {
        // Style for the page numbers and arrows
        '&:hover': {
          backgroundColor: '#FFB300', // Darker Amber on hover
          color: 'white',
        },
      }
    }
  };


  return (
    <div className=' sm:px-6 lg:px-8 pb-2'>
      <div className="flex justify-between items-center mb-6 lg:flex-row flex-col-reverse gap-4">
        <h1 className="text-3xl font-extrabold text-[#D84315] tracking-tight">Merchants List</h1>

        <div className='flex  items-center gap-1 flex-wrap'>
          {/* Create Engineer Button */}
          <button
            className='flex items-center justify-center bg-orange-500 hover:bg-orange-600 transition-colors px-2 py-2 shadow-lg rounded-md text-white text-sm'
            onClick={openenggModal}
          >
            <PlusCircle size={18} className='mr-2' />
            Create Engineer
          </button>

          {/* Create Merchant Button */}
          <button
            className='flex items-center justify-center bg-orange-500 hover:bg-orange-600 transition-colors px-2 py-2 shadow-lg rounded-md text-white text-sm'
            onClick={openCreateModal}
          >
            <PlusCircle size={18} className='mr-2' />
            Create Merchant
          </button>

          {/* //create plant button */}
          <button onClick={createPlant} className="px-2 py-2 bg-orange-600 text-white  rounded-md hover:bg-orange-700 flex items-center shadow-lg  text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm0 0h16M4 12h16M4 18h16M10 4v16M14 4v16" />
                        </svg>
                        Create plant
                    </button>

          {/* Add Plant Button */}
          <button
            onClick={addPlant}
            className='flex items-center justify-center bg-orange-600 hover:bg-orange-700 transition-colors px-2 py-2 shadow-lg rounded-md text-white text-sm'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Plant
          </button>

          {/* Bulk Requests Button */}
          <button
            onClick={requestedBulkPlants}
            className='flex items-center justify-center bg-orange-600 hover:bg-orange-700 transition-colors px-2 py-2 shadow-lg rounded-md text-white text-sm'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 17 12 13 8 17" />
              <line x1="12" y1="13" x2="12" y2="21" />
              <path d="M20.88 18.09A5 5 0 0 0 18 10h-1.26A8 8 0 1 0 3 14.19" />
            </svg>
            Bulk Requests
          </button>
        </div>
      </div>

      {/* The DataTable component */}
      <div className="relative">
        <DataTable
          columns={columns}
          data={merchants}
          progressPending={loading}
          pagination
          onRowClicked={handleRowClicked}
          pointerOnHover
          customStyles={customStyles}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateEnggmodel isOpen={isenggModalOpen} closeModal={closeEnggModal} />
      <CreateMerchantModal isOpen={isCreateModalOpen} closeModal={closeCreateModal} />
      {deleteTarget && (
        <DeleteConfirmationModal
          isOpen={!!deleteTarget}
          closeModal={closeDeleteModal}
          merchantName={deleteTarget.name}
          onConfirm={confirmDeleteMerchant}
        />
      )}
      <AdminAuthPlant
        isOpen={showAuthPlant}
        onClose={closeAuthPlant}
      />
    </div>
  );
};

export default MerchantList;
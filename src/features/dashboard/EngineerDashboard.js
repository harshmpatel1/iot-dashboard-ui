import React from 'react'
import { Trash2, PlusCircle } from 'lucide-react';
import CreateMerchantModal from '../../components/models/Model'
import { useState,useCallback,useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { getMerchants } from '../../api/mockApis'; // Your API function


import DataTable from 'react-data-table-component';



const EngineerDashboard = () => {
  const { user } = useAuth();
  const [engineerId, setEngineerId] = useState(null);
  console.log('engineer user', user)
    const navigate = useNavigate();
  useEffect(() => {
    if(user && user?.id){
      console.log('Engineer ID:', user.id);
      setEngineerId(user.id);
    }
  }, [user]);
  
//    console.log("hello",user)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);

const handleRowClicked = (row) => {
    navigate(`/merchants/${engineerId}/plants`);
  };

const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate a small delay to show the loading state better with the new design
      await new Promise(resolve => setTimeout(resolve, 500));
      const merchantList = await getMerchants();
      // console.log(merchantList)
      const merchantofEngg=merchantList.filter(merchant  => merchant.E_id === user.id)
      setMerchants(merchantofEngg);
    } catch (error) {
      console.error("Failed to fetch merchants:", error);
      // Optionally show a user-facing error message here
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

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
  ];


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
    <div>
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#D84315] tracking-tight">Merchants List</h1>
        
        <div className='flex  justify-center items-center gap-4'>
          {/* Create Merchant Button - Used the Primary Orange */}
        


        {/* Create Merchant Button - Used the Primary Orange */}
        <button 
          className='flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 transition-colors px-6 py-2 shadow-lg rounded-md text-white font-semibold' 
          onClick={openCreateModal}
        >
          <PlusCircle size={20} />
          <span>Create Merchant</span>
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
                // The title is an easy way to add a secondary header to the DataTable
              />
              {/* Optional: Add a custom loading indicator to fit the theme */}
              {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
              )}
            </div>
      {/* Modal for Creating Merchant */}
      <CreateMerchantModal isOpen={isCreateModalOpen} closeModal={closeCreateModal} e_id={user.id} />
    </div>
  )
}

export default EngineerDashboard
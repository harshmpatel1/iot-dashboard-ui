import { url } from '../constants/serverInfo';
import { useEffect, useState } from "react";
import ReactDatatable from 'react-data-table-component';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const columns = [
    {
        name: 'Plant Name',
        selector: row => row.ProductName,
    },
    {
        name: 'User Email',
        selector: row => row.CustomerEmail,
    },
    {
        name: 'Request Date',
        selector: row => row.AuthorisedRequestDate.split('T')[0],
    }
];

const customStyles = {
    headCells: {
        style: {
            fontWeight: 'bold',
            fontSize: '16px',
        },  
    },
    rows: {
        style: {
            fontSize: '14px',
            color: '#333',
        },
    },
};  

const RequestedPlants = () => {
      const { merchantId } = useParams();
      const { user } = useAuth();
      console.log('Merchant ID from params:', merchantId);
      console.log('Authenticated user:', user);

    const [data, setData] = useState([]);

    useEffect(() => {
        async function fetchRequestedPlants() {
            let res = await fetch( `${url}/merchants/requested-plants/${user.ID}`);
            let data = await res.json();
            console.log('Requested Plants Data:', data);
            if (res.ok) {
                setData(data || []);
            }
        }
        fetchRequestedPlants();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Requested Plants</h1>
            {/* Add more content and functionality as needed */}
            <ReactDatatable
                columns={columns}
                data={data}
                pagination
                highlightOnHover
                customStyles={customStyles}
            />
        </div>
    );
};

export default RequestedPlants;
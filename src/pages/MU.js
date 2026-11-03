import { useParams } from 'react-router-dom';
import PlantList from '../features/plants/PlantList';
import AdminMerchantPlantViewer from './AdminMerchantPlantViewer'
import { Outlet } from 'react-router-dom';
// This component gets the merchantId from the URL and passes it to UserList
const MerchantUsersPage = () => {
  console.log('s')
  const { merchantId } = useParams();
  console.log('mId', merchantId);
  return (
    <div>
      <h1 className="text-[14px] font-semibold text-gray-800 mb-2 text-end mr-12">
        Plants for Merchant: <span className="text-indigo-600">{merchantId}</span>
      </h1>
      <div className=" px-6 py-2">
        {/* Pass the merchantId from the URL as a prop to the UserList */}
        <AdminMerchantPlantViewer merchantId={merchantId} />
      </div>
      <Outlet />
    </div>
  );
};

export default MerchantUsersPage;
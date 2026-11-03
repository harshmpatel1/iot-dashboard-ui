import PlantList from '../plants/PlantList';
import MerchantList from '../../features/merchants/MerchantList'; // Assuming this component exists
import Eng from '../merchants/Eng';
const AdminDashboard = () => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {/* Merchant List Component would go here */}
      <div className="bg-white px-2 pb-2 rounded-lg ">
        <MerchantList />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Eng />
      </div>
      {/* User List Component */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">All Users</h2>
        <UserList />
      </div> */}
    </div>
  );
};

export default AdminDashboard;
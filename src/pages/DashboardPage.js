import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants/index';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../features/dashboard/AdminDashboard';
import MerchantDashboard from './MerchantDashboard';
import EngineerDashboard from '../features/dashboard/EngineerDashboard';
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate()
  
  // user.role = ROLES.MERCHANT;


  const renderDashboard = () => {
    if(user){

      if(user?.role == 'admin'){
        return <AdminDashboard />;
      }else if(user?.role == "engineer"){
        return <EngineerDashboard/>
      }else{
        return <MerchantDashboard />;
      }
    }
    // switch (user.role) {
      
    //   case ROLES.ADMIN:
    //     console.log('admin');
    //   case ROLES.MERCHANT:
    //     console.log('merchant');
    //   // case ROLES.USER:
    //   //   return <UserDashboard />;
    //   default:
    //     return <div>Welcome!</div>;
    // }
  };

  return (
    <div className='font-sans  min-h-screen'>
      {/* <h1 className="text-[14px] font-semibold text-gray-800 mb-2 mt-6">Total Merchants</h1> */}
      {/* <button className='text-[14px] bg-blue-500 px-4 py-2 text-white font-semibold  hover:cursor-pointer rounded-md mr-4'>Create Merchant</button> */}
      {/* <button className='text-[14px] bg-blue-500 px-4 py-2 text-white font-semibold hover:cursor-pointer rounded-md '>Create Plant</button> */}

      <div className="mt-6">{renderDashboard()}</div>
    </div>
  );
};

export default DashboardPage;

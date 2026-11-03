import PlantList from '../features/plants/PlantList';
import { useAuth } from '../hooks/useAuth';

const MerchantDashboard = () => {
  console.log('md rendered');

  const { user } = useAuth();
  console.log('user:', user);
  return (
    <div className='w-full'>
      <div className="flex items-center justify-between mb-4">

      <h3 className="text-4xl ml-6 font-black text-orange-700 pb-2 mb-3 inline-block relative">
        Your Plants
        {/* Decorative bottom line with subtle shadow */}
      </h3>
      <h3 className="text-xl  font-black text-orange-700 pb-2 mb-3 inline-block relative ">
        Merchant ID: {user?.ID}
        {/* Decorative bottom line with subtle shadow */}
      </h3>
      </div>
      <p className="mb-6 text-orange-600 text-lg ml-6">
        Select a plant below to manage its details.
      </p>
      <PlantList />
    </div>
  );
};

export default MerchantDashboard;
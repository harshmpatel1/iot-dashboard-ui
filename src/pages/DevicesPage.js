import { useParams } from 'react-router-dom';
import DeviceList from '../features/devices/DeviceList';

const DevicesPage = () => {
  const { userId } = useParams(); 
  const title = userId ? `Devices for User ${userId}` : "All Devices";

  return (
    <div>
      <h1 className="text-[18px] font-semibold text-gray-800 mb-6">{title}</h1>
      <DeviceList userId={userId} />
    </div>
  );
};

export default DevicesPage;

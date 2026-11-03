import { NavLink } from 'react-router-dom';
import { Outlet, useParams } from 'react-router-dom';
// The required icons are now imported
import { HomeIcon,PencilSquareIcon, InformationCircleIcon, DevicePhoneMobileIcon, LockClosedIcon, BellAlertIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';


const SpecialSidebar = ({ isSidebarOpen, setSidebarOpen }) => {
  // Define links specific to this sidebar
  const { merchantId, plantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const specialNavLinks = [
    { to: `/`, text: 'Home', icon: <HomeIcon className='h-5 w-5' /> },
    { to: `/users/87898/plants/${plantId}`, text: 'Plant Info', icon: <InformationCircleIcon className='h-5 w-5' /> },
    { to: `/merchants/${merchantId}/plants/${plantId}/allDevices`, text: 'Devices', icon: <DevicePhoneMobileIcon className='h-5 w-5' /> },
    { to: `/alerts/${plantId}`, text: 'Alert', icon: <BellAlertIcon className='h-5 w-5' /> },
    { to: `/auth/${plantId}`, text: 'Authorization', icon: <LockClosedIcon className='h-5 w-5' /> },
    { to: `/plant-edit/${plantId}`, text: 'Plant Edit', icon: <PencilSquareIcon className='h-5 w-5' /> },
  ];

  if(user?.role !== 'admin'){
    specialNavLinks.splice(4,1); // Remove Authorization link for non-admin users
  }


  return (
    <aside
      // Use a dark, professional background (gray-900) and gray text for contrast
      className={`absolute inset-y-0 left-0 z-30 w-48 bg-white text-gray-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 border border-yellow-300 shadow-md shadow-yellow-100`}
    >
      {/* Close button for mobile screens - styled for dark background */}
      <div className="absolute top-1 right-1 md:hidden">
        <button
          onClick={() => setSidebarOpen(false)}
          // Use a subtle gray/white color for the close button
          className="p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 rounded-full"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Logo/Header Area - Added padding for spacing */}
      <div className='w-full p-2 itemps-start justify-start flex hover:cursor-pointer' onClick={() => navigate('/')}>
        {/* The yellow logo will stand out strongly against the dark background */}
        <img src="/logo2.png" alt="Logo" className="w-full mr-2 h-12 rounded-md" />
      </div>

      <nav className="mt-4 space-y-2">
        {specialNavLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) =>
              `flex items-center px-4 py-2 transition-colors duration-200 text-sm ` +
              // Active state: Uses a bright yellow text and a subtle, transparent yellow background strip
              (isActive
  ? 'text-orange-500 font-bold'
  : 'text-gray-800 hover:text-orange-500'
)
            }
            onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after click
          >
            {/* The icon will inherit the text color */}
            {link.icon}
            <span className="mx-4 font-semibold">{link.text}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default SpecialSidebar;

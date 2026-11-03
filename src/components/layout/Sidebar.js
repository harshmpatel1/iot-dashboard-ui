import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../constants/index';
// IMPORTANT: Make sure XMarkIcon and ChevronDoubleLeftIcon are included in this import
import {
  HomeIcon,
  UsersIcon,
  BuildingOffice2Icon,
  ComputerDesktopIcon,
  XMarkIcon,
  InformationCircleIcon,
  ChevronDoubleLeftIcon, // Icon for collapse button
  ChevronDoubleRightIcon // Icon for expand button (optional, but good)
} from '@heroicons/react/24/solid';
import { useEffect } from 'react';

// Assume isCollapsed and setIsCollapsed are passed from the parent
const Sidebar = ({ isSidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed }) => {
  const { user } = useAuth();

    const navigate = useNavigate();
  const navLinks = [
    { to: '/', text: 'Dashboard', icon: <HomeIcon className='h-5 w-5 mb-4' />, roles: [ROLES.ADMIN, ROLES.MERCHANT, ROLES.ENGINEER] },
    { to: '/overview', text: 'Overview', icon: <ComputerDesktopIcon className='h-5 w-5 mb-4' />, roles: [ROLES.ADMIN] },
    { to: '/users', text: 'Users', icon: <UsersIcon className='h-5 w-5 mb-4' />, roles: [ROLES.ADMIN] },
    { to: '/plantsAll', text: 'All Plants', icon: <BuildingOffice2Icon className='h-5 w-5 mb-4' />, roles: [ROLES.ADMIN] },
    // { to: '/pageForEngineer', text: 'Merchant List', icon: <UsersIcon className='h-5 w-5 mb-4' />, roles: [ROLES.ENGINEER] },
    { to: '/deviceInfoByMac', text: 'Device', icon: <InformationCircleIcon className='h-5 w-5 mb-4' />, roles: [ROLES.ADMIN, ROLES.MERCHANT,ROLES.ENGINEER] },
    { to: '/plantsMerchantsInfo', text: 'Overview', icon: <ComputerDesktopIcon className='h-5 w-5 mb-4' />, roles: [ROLES.MERCHANT] },
    { to: '/registration', text: 'Registration', icon: <UsersIcon className='h-5 w-5 mb-4' />, roles: [ROLES.ADMIN, ROLES.ENGINEER] },

    
  ];

  if (!user) {
    return <div>no user</div>; // Or <p>Loading...</p>
  }

  return (
    <aside
      className={`
        absolute inset-y-0 left-0 z-30 
        // --- START OF GRADIENT CHANGE ---
        bg-white 
        // --- END OF GRADIENT CHANGE ---
        m-1 border-r shadow-md text-gray-800 
        transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        transition-all duration-300 ease-in-out 
        md:relative md:translate-x-0 font-sans 
        
        // **KEY CHANGES: Conditional Width**
        ${isCollapsed ? 'md:w-16' : 'md:w-48 w-48'} 
      `}
    >
      {/* Collapse/Expand Button for Laptop/Desktop (md and up) */}
      <div
        className={`
          absolute top-2 -right-3.5 p-1 hidden md:block z-40
          // Move button further right when expanded, keep it close when collapsed
          ${isCollapsed ? 'md:-right-3.5' : 'md:-right-3.5'} 
        `}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-gray-500 bg-white border border-gray-300 rounded-full shadow-lg hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className="h-3 opacity-50 w-3 " />
          ) : (
            <ChevronDoubleLeftIcon className="h-3 opacity-50 w-3 " />
          )}
        </button>
      </div>

      {/* Close button for mobile screens */}
      <div className="absolute top-1 right-1 md:hidden">
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-full"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className={`w-full itemps-start justify-start flex ${isCollapsed ? 'mt-2 justify-center' : 'mt-1 ml-1'}`}>
        {/* You can hide the logo text/make it smaller when collapsed */}
        <img
          src="/logo2.png"
          alt="Logo"
          onClick={()=>{navigate("/")}}
          className={`
            ${isCollapsed ? 'hidden' : 'w-full mr-2 h-12 rounded-md'} 
            shadow-md shadow-yellow-100 transition-all duration-300
          `}
        />
      </div>

      <nav className="mt-4 text-xs">
        {navLinks
          .filter(link => link.roles.includes(user?.role))
          .map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `flex items-center font-semibold text-[14px]  py-2 mt-2 transition-colors duration-200 
                  ${isCollapsed ? 'justify-center px-0 mx-1' : 'px-4 mx-1'}
                  ${isActive ? 'text-orange-600 rounded-md' : 'hover:text-orange-600 rounded-md'}
                 `
              }
              onClick={() => setSidebarOpen(false)}
            >
              {link.icon}
              {/* **KEY CHANGE: Conditional Text Display** */}
              <span
                className={`
                   transition-opacity duration-200 mb-4 
                   ${isCollapsed ? 'opacity-0 w-0 h-0 overflow-hidden' : 'opacity-100 mx-4'}
                 `}
              >
                {link.text}
              </span>
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
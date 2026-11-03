import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  console.log('user',user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="flex items-center justify-between px-4 py-1 bg-white border-b shadow-sm">
      {/* --- Hamburger Icon for Mobile --- */}
      <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none md:hidden">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* --- Spacer --- */}
      <div className="flex-1 text-center md:text-left">
        {/* This div is intentionally left empty to push user info to the right */}
      </div>

      {/* --- User Info and Logout Button --- */}
      <div className="flex items-center">
        <span className="text-gray-700 mr-4">Welcome, {user.name || user.Name ||user.MerchantName}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
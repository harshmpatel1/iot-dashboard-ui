import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../constants'; // <-- ADD THIS LINE

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  console.log('ProtectedRoute - user:', user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Without the import, the line below would fail because 'ROLES' is undefined.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/not-found" replace />;
  }

  return children;
};

export default ProtectedRoute;
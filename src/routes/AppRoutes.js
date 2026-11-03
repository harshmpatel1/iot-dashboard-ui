
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardPage from '../pages/DashboardPage';
import AuthPage from '../pages/AuthPage';
import LoginForm from '../features/auth/LoginForm';
import ChangePassword from '../features/auth/ChangePassword';
import ForgotPassword from '../pages/ForgotPassword';
import VerifyOtp from '../pages/VerifyOtp';
import UsersPage from '../pages/UsersPage';
import DevicesPage from '../pages/DevicesPage';
import CreatePlant from '../pages/CreatePlant';
import RequestedPlants from '../pages/RequestedPlants';
import RequestedBulkPlants from '../pages/RequestBulkPlants';
import NotFoundPage from '../pages/NotFoundPage';
import Global from '../pages/Global'
import ProtectedRoute from './ProtectedRoute';
import Ls from '../pages/Ls';
import FaultInfo from '../pages/FaultInfo';
import MU from '../pages/MU'
import { Outlet } from 'react-router-dom';
import AllUserList from '../pages/AllUserList';
import AuthPlantorg from '../pages/AuthPlantorg';
import DeviceFinder from '../pages/DeviceFinder';
import Registration from '../pages/Registration';
// import PlantsMerchantsInfo from '../pages/PlantsMerchantsInfo';
import { ROLES } from '../constants';
import PlantDetailsPage from '../components/layout/PlantDetailsPage'
import AllPlantsInfo from '../pages/AllPlantsInfo';
// import EngineerDashboard from '../features/dashboard/EngineerDashboard';
import Ad from '../pages/Ad'
import PlantsPage from '../pages/PlantsPage';
import UploadForm from '../pages/UploadForm';
import Editpage from '../pages/EditPage';
import EngineerDashboard from '../features/dashboard/EngineerDashboard';
const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'plants',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT]}>
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/plant-edit/:plantId',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT,,ROLES.ENGINEER]}>
            <Editpage />
          </ProtectedRoute>
        ),
      },
      
      // ADD THIS NEW ROUTE for showing users of a specific merchant
      {
        path: 'merchants/:merchantId/plants',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ENGINEER]}>
            <MU />
          </ProtectedRoute>
        ),
      },
      {
        path: '/deviceInfoByMac',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT,ROLES.ENGINEER]}>
            <DeviceFinder />
          </ProtectedRoute>
        )
      },
      
      {
        path: 'overview',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <Global />
          </ProtectedRoute>
        ),
      },
      {
        path: 'alerts/:plantId',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT, ROLES.USER,ROLES.ENGINEER]}>
            <FaultInfo />
          </ProtectedRoute>
        ),
      },
      {
        // This is the NEW, SEPARATE route for the details page
        path: 'merchants/:merchantId/plants/:plantId',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT, ROLES.ENGINEER]}>
            <PlantDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users/:userId/plants/:plantId',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT,,ROLES.ENGINEER]}>
            <PlantDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'merchants/:merchantId/plants/:plantId/allDevices/uploadform/:macId',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT]}>
            <UploadForm />
          </ProtectedRoute>
        ),
      },
      {
        // This is the NEW, SEPARATE route for the details page
        path: 'merchants/:merchantId/plants/:plantId/allDevices',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT, ROLES.ENGINEER]}>
            <Ad />
          </ProtectedRoute>
        ),
      },
      {
        path: 'createPlant',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT]}>
            <CreatePlant/>
          </ProtectedRoute>
        )
      },
      {
        path: 'requestedPlants',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT]}>
            <RequestedPlants/>
          </ProtectedRoute>
        )
      },
      {
        path: 'requestedBulkPlants',
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MERCHANT]}>
            <RequestedBulkPlants/>
          </ProtectedRoute>
        )
      }
      ,
      { path: 'users/:userId/devices', element: <DevicesPage /> },
      ,
      {
        path: 'users/:userId/plants', element: <PlantsPage />
      },
      {
        path: 'users', element: <AllUserList />
      },
      {
        path: 'plantsAll',
        element: <AllPlantsInfo />
      },
      {
        path: 'auth/:plantId',
        element: <AuthPlantorg />
      },
      {
        path: 'plantsMerchantsInfo',
        element: (
          <Ls />
          // <ProtectedRoute allowedRoles={[ROLES.MERCHANT]}>
          //   <PlantsMerchantsInfo />
          // </ProtectedRoute>
        )
      },
      {
        path: "registration",
        element: (
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ENGINEER]}>
            <Registration />
          </ProtectedRoute>
        )
      },
      {
      }
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
  {
        path:'change-password/:role',
        element: (
          <ChangePassword/> 
        )
      },
      {
        path:'forgot-password',
        element: (
          <ForgotPassword/> 
        )
      },
      {
        path:'verify-otp',
        element: (
          <VerifyOtp/> 
        )
      },
    
]);
export const AppRoutes = () => <RouterProvider router={router} />;
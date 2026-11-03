import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import SidebarPlant from '../components/layout/SidebarPlant'
const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // <--- NEW STATE

  const params = useParams();
  const isPlantDetailPage = !!params.plantId;
  console.log('allparamsss', params);
  return (
    <div className="flex h-screen">
      {isPlantDetailPage ? (
        <SidebarPlant isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      ) : (
        <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed} />
      )}
      {/* <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
      <div className="flex-1 flex flex-col overflow-hidden " 
      // style={{
      //   backgroundImage: "url('bgmain.jpg')",
      //   backgroundRepeat: "no-repeat",
      // }}
      >
        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} className="hidden" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto  px-4 md:px-6 py-1">
          <Outlet /> {/* Child routes will render here */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
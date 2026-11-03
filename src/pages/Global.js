import React from 'react';
import { url } from '../constants/serverInfo';
const StatCardIcon = ({ children }) => (
  <div className="p-3 bg-amber-400 rounded-lg">
    {children}
  </div>
);

const Icons = {
  Bolt: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>,
  Building: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><line x1="8" y1="22" x2="8" y2="4"></line><line x1="16" y1="22" x2="16" y2="4"></line><line x1="4" y1="12" x2="20" y2="12"></line></svg>,
  CheckCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  XCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
};

const StatCard = ({ icon, title, value, unit }) => (
  <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 flex items-start space-x-4 transition-all hover:shadow-lg hover:-translate-y-1">
    <StatCardIcon>{icon}</StatCardIcon>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-800">
        {value} <span className="text-base font-normal text-gray-400">{unit}</span>
      </p>
    </div>
  </div>
);

// Bar chart for displaying model counts -- UPDATED
const ModelCountsBarChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    // Add a buffer to the max value so the tallest bar doesn't touch the top edge
    const maxValue = Math.max(...data.map(item => item.CountModel)) * 1.20;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 col-span-1 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Inverter Models Overview</h3>
            <div className="flex justify-around items-end h-80 space-x-4 pt-8">
                {data.map((item, index) => {
                    const barHeightPercent = (item.CountModel / maxValue) * 100;
                    // Threshold for displaying the value inside vs outside the bar
                    const isBarShort = barHeightPercent < 10;

                    return (
                        <div key={index} className="flex flex-col items-center justify-end w-0 flex-1 h-full relative">
                            
                            {/* Value for SHORT bars (displayed above) */}
                            {isBarShort && (
                                <div className="absolute text-center" style={{ bottom: `${barHeightPercent + 2}%` }}>
                                    <span className="text-xs font-bold text-slate-600">
                                        {item.CountModel.toLocaleString()}
                                    </span>
                                </div>
                            )}

                            {/* The bar itself */}
                            <div
                                className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-md transition-all duration-300 hover:from-indigo-600 hover:to-blue-500 relative overflow-hidden"
                                style={{ height: `${barHeightPercent}%` }}
                                title={`${item.Phase.replace(/_/g, ' ')}: ${item.CountModel.toLocaleString()}`}
                            >
                                {/* Value for TALL bars (displayed inside) */}
                                {!isBarShort && (
                                     <span className="absolute top-1.5 left-0 right-0 text-center text-white font-bold text-xs drop-shadow-sm">
                                        {item.CountModel.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            
                            {/* The X-axis label, improved for readability */}
                            <div className="w-full mt-2 text-center h-20">
                                <p 
                                    className="text-xs text-gray-500 inline-block  origin-top-left whitespace-nowrap"
                                    title={item.Phase.replace(/_/g, ' ')}
                                >
                                    {item.Phase.replace(/_/g, ' ')}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


// Donut chart for Grid Export/Import
const GridActivityDonutChart = ({ data }) => {
    if (!data) return null;
    const { ExportGrid, ImportGrid } = data;
    const total = ExportGrid + ImportGrid;
    const exportPercent = total > 0 ? (ExportGrid / total) * 100 : 0;
    
    // Using conic-gradient for the donut chart effect
    const conicGradient = `conic-gradient(#10b981 ${exportPercent}%, #ef4444 0)`;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Grid Activity</h3>
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center" style={{background: conicGradient}}>
                 <div className="absolute w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">{((ExportGrid / total) * 100).toFixed(1)}%</span>
                    <span className="text-xs text-gray-500">Exported</span>
                 </div>
            </div>
            <div className="mt-4 w-full text-sm">
                <div className="flex justify-between items-center">
                    <span className="flex items-center text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>Export</span>
                    <span className="font-medium text-slate-700">{ExportGrid.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between items-center mt-1">
                    <span className="flex items-center text-red-600"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Import</span>
                    <span className="font-medium text-slate-700">{ImportGrid.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};


// --- Skeleton Loader Components ---

const StatCardSkeleton = () => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-start space-x-4">
        <div className="p-3 bg-gray-200 rounded-lg">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>
        <div className="flex-1 mt-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="h-7 bg-gray-300 rounded w-1/2"></div>
        </div>
    </div>
);

const ChartSkeleton = ({ className = "" }) => (
    <div className={`bg-white p-6 rounded-xl border border-gray-200 ${className}`}>
        <div className="h-5 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="flex justify-around items-end h-64 space-x-2">
            <div className="w-full h-4/5 bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-3/5 bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-full bg-gray-200 rounded-t-md"></div>
            <div className="w-full h-2/5 bg-gray-200 rounded-t-md"></div>
        </div>
    </div>
);

const DonutSkeleton = ({ className = "" }) => (
     <div className={`bg-white p-6 rounded-xl border border-gray-200 flex flex-col items-center justify-center ${className}`}>
        <div className="h-5 bg-gray-300 rounded w-2/3 mb-4"></div>
        <div className="w-40 h-40 bg-gray-200 rounded-full"></div>
        <div className="w-full mt-4">
             <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
             <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
    </div>
)

const DashboardSkeleton = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ChartSkeleton className="col-span-1 md:col-span-2 lg:col-span-3" />
        <DonutSkeleton className="col-span-1 md:col-span-2 lg:col-span-1"/>
    </div>
  </div>
);


// --- Main App Component ---

export default function App() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // --- CHANGE 1: Remove the mock delay for a production-ready app ---
                // await new Promise(resolve => setTimeout(resolve, 2000)); 
                // -------------------------------------------------------------------

                // --- CHANGE 2: Call the local proxy endpoint ---
                const response = await fetch(`${url}/display/dashboard-summary`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                        // IMPORTANT: The Bearer Token is now securely handled on the server!
                        // Remove the 'Authorization' header from here:
                        // 'Authorization': 'Bearer mySuperSecretToken123!@#11' 
                    }
                });
                // ------------------------------------------------

                if (!response.ok) {
                    // Check if the server provided an error message
                    const errBody = await response.json().catch(() => ({ message: 'Unknown server error.' }));
                    throw new Error(`HTTP error! Status: ${response.status}. ${errBody.message || ''}`);
                }

                const result = await response.json();

                if (result.success === "1" && result.response) {
                    console.log(result.response);
                    setData(result.response);
                } else {
                    throw new Error(result.message || 'API request was not successful.');
                }

            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); 
  const renderContent = () => {
    if (loading) {
      return <DashboardSkeleton />;
    }

    if (error) {
      return (
        <div className="text-center bg-red-50 border border-red-200 p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-red-700">An Error Occurred</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <p className="text-gray-500 text-sm mt-4">Please try refreshing the page or check the console for more details.</p>
        </div>
      );
    }
    
    if (data) {
        const {
            ModelData, TotalSiteData, TotalGeneration, TotalActiveLastonehour, 
            TotalInActiveLastonehour, TotalExportImportGrid, TotalSyncedSite
        } = data;
        
        const lifetimeGen = TotalGeneration?.[0]?.LifetimeGeneration || 0;
        const todayGen = TotalGeneration?.[0]?.TodayGeneration || 0;
        const totalSites = TotalSiteData?.[0]?.TotalRegisteredSites || 0;
        const activeSites = TotalActiveLastonehour?.[0]?.ActiveSiteCount || 0;
        const inactiveSites = TotalInActiveLastonehour?.[0]?.InactiveSiteCount || 0;
        const syncedSites = TotalSyncedSite?.[0]?.TotalSyncedSite || 0;
        const installCapacity = TotalSyncedSite?.[0]?.InstallationCapacity || 0;
        const gridData = TotalExportImportGrid?.[0];

        return (
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard icon={<Icons.Globe />} title="Lifetime Generation" value={lifetimeGen.toLocaleString(undefined, { maximumFractionDigits: 2 })} unit="kWh" />
                    <StatCard icon={<Icons.Bolt />} title="Current Generation" value={todayGen.toLocaleString(undefined, { maximumFractionDigits: 2 })} unit="kWh" />
                    <StatCard icon={<Icons.Building />} title="Total Registered Sites" value={totalSites.toLocaleString()} unit="sites" />
                    <StatCard icon={<Icons.Zap />} title="Installation Capacity" value={installCapacity.toLocaleString()} unit="kW" />
                    <StatCard icon={<Icons.CheckCircle />} title="Active Sites (1hr)" value={activeSites.toLocaleString()} unit="sites" />
                    <StatCard icon={<Icons.XCircle />} title="Inactive Sites (1hr)" value={inactiveSites.toLocaleString()} unit="sites" />
                    <StatCard icon={<Icons.Building />} title="Synced Sites" value={syncedSites.toLocaleString()} unit="sites" />
                    <StatCard icon={<Icons.Bolt />} title="Total Models" value={ModelData.reduce((acc, m) => acc + m.CountModel, 0).toLocaleString()} unit="inverters" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ModelCountsBarChart data={ModelData} />
                    <GridActivityDonutChart data={gridData} />
                </div>
            </div>
        );
    }
    
    return null; // Should not be reached
  };

  return (
    <div className=" text-slate-900 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="absolute top-0 left-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Eastman Energy</h1>
          <p className="text-gray-600">overview of solar energy production and site status.</p>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
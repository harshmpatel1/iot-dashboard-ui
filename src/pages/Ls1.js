import React, { useState, useEffect, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { useAuth } from '../hooks/useAuth';
import { url } from '../constants/serverInfo';

const PlantsMerchantsInfo = () => {
  const { user } = useAuth();
  console.log('PlantGenerationTable - user:', user);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totals, setTotals] = useState({
    today: 0,
    monthly: 0,
    yearly: 0,
    lifetime: 0
  });

  // Function to extract numeric value from string like "0 KWh"
  const extractNumericValue = (value) => {
    if (!value) return 0;
    const numericPart = parseFloat(value);
    return isNaN(numericPart) ? 0 : numericPart;
  };

  // Function to fetch device dashboard data
  const fetchDeviceDashboardData = async (plantId) => {
    try {
      const response = await fetch(`${url}/fetch-device-dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plantId: plantId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data for plant ${plantId}`);
      }

      const data = await response.json();
      console.log(`Fetched dashboard data for plant ${plantId}:`, data);
      return data;
    } catch (error) {
      console.error(`Error fetching data for plant ${plantId}:`, error);
      return null;
    }
  };

  // Function to export data as CSV
  const exportToCSV = () => {
    if (plants.length === 0) return;

    const headers = ['Device ID', 'Plant Name', 'Today Generation', 'Monthly Generation', 'Yearly Generation', 'Lifetime Generation'];
    
    const csvData = plants.map(plant => [
      String(plant.deviceId) || '',
      String(plant.productName) || '',
      String(plant.todayGeneration) || '',
      String(plant.monthlyGeneration) || '',
      String(plant.yearlyGeneration) || '',
      String(plant.lifetimeGeneration) || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `plants-generation-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchPlantData = async () => {
      if (!user?.ID) return;

      try {
        setLoading(true);
        setError(null);

        const plantResponse = await fetch(`${url}/plants/plantListsByMerchant/${user.ID}`);
        if (!plantResponse.ok) {
          throw new Error('Failed to fetch plant list');
        }

        const plantList = await plantResponse.json();
        console.log('Fetched plant list:', plantList);
        
        if (!plantList || plantList.length === 0) {
          setPlants([]);
          setLoading(false);
          return;
        }

        const plantPromises = plantList.map(async (plant) => {
          try {
            const dashboardData = await fetchDeviceDashboardData(plant.ID);
            console.log(`Processing plant ${plant.ID} with dashboard data:`, dashboardData);
            if (dashboardData && dashboardData.success === "1") {
              return {
                id: plant.ID,
                deviceId: dashboardData.DeviceID,
                productName: dashboardData.ProductName,
                customerId: dashboardData.CustomerID,
                todayGeneration: dashboardData.TodayGeneration,
                monthlyGeneration: dashboardData.MonthlyGeneration,
                yearlyGeneration: dashboardData.YearlyGeneration,
                lifetimeGeneration: dashboardData.LifetimeGeneration,
                todayNumeric: extractNumericValue(dashboardData.TodayGeneration),
                monthlyNumeric: extractNumericValue(dashboardData.MonthlyGeneration),
                yearlyNumeric: extractNumericValue(dashboardData.YearlyGeneration),
                lifetimeNumeric: extractNumericValue(dashboardData.LifetimeGeneration)
              };
            }
            return null;
          } catch (error) {
            console.error(`Error processing plant ${plant.ID}:`, error);
            return null;
          }
        });

        const plantResults = await Promise.all(plantPromises);
        const successfulPlants = plantResults.filter(plant => plant !== null);
        
        setPlants(successfulPlants);

        const newTotals = successfulPlants.reduce((acc, plant) => ({
          today: acc.today + plant.todayNumeric,
          monthly: acc.monthly + plant.monthlyNumeric,
          yearly: acc.yearly + plant.yearlyNumeric,
          lifetime: acc.lifetime + plant.lifetimeNumeric
        }), { today: 0, monthly: 0, yearly: 0, lifetime: 0 });

        setTotals(newTotals);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching plant data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantData();
  }, [user?.ID]);

  // Skeleton loading component for totals
  const SkeletonTotalsRow = () => (
    <div className="grid grid-cols-2 m-4 gap-6 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
          <div className="h-4 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-1 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
        </div>
      ))}
    </div>
  );

  // Skeleton loading for table rows
  const SkeletonTable = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-12 rounded-t-lg mb-2"></div>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex space-x-4 mb-2 p-4 bg-white border-b">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/5"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Table columns configuration
  const columns = [
    {
      name: 'Device ID',
      selector: row => row.deviceId,
      sortable: true,
    },
    {
      name: 'Plant Name',
      selector: row => row.productName,
      sortable: true,
    },
    {
      name: 'Today Generation',
      selector: row => row.todayGeneration,
      sortable: true,
      right: true,
    },
    {
      name: 'Monthly Generation',
      selector: row => row.monthlyGeneration,
      sortable: true,
      right: true,
    },
    {
      name: 'Yearly Generation',
      selector: row => row.yearlyGeneration,
      sortable: true,
      right: true,
    },
    {
      name: 'Lifetime Generation',
      selector: row => row.lifetimeGeneration,
      sortable: true,
      right: true,
    },
  ];

  // Custom component for totals row
  const TotalsRow = () => (
    <div className="grid grid-cols-2 m-4 gap-6 lg:grid-cols-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
        <div className="text-sm font-medium text-blue-600 mb-1">Today</div>
        <div className="text-2xl font-bold text-blue-800">{totals.today.toFixed(1)}</div>
        <div className="text-xs text-gray-500 mt-1">KWh</div>
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
        <div className="text-sm font-medium text-green-600 mb-1">Monthly</div>
        <div className="text-2xl font-bold text-green-800">{totals.monthly.toFixed(1)}</div>
        <div className="text-xs text-gray-500 mt-1">KWh</div>
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-200 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
        <div className="text-sm font-medium text-amber-600 mb-1">Yearly</div>
        <div className="text-2xl font-bold text-amber-800">{totals.yearly.toFixed(1)}</div>
        <div className="text-xs text-gray-500 mt-1">KWh</div>
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-200 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
        <div className="text-sm font-medium text-purple-600 mb-1">Lifetime</div>
        <div className="text-2xl font-bold text-purple-800">{totals.lifetime.toFixed(1)}</div>
        <div className="text-xs text-gray-500 mt-1">KWh</div>
      </div>
    </div>
  );

  // Custom actions component for DataTable
  const CustomActions = () => (
    <button
      onClick={exportToCSV}
      disabled={plants.length === 0}
      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export CSV
    </button>
  );

  if (loading) {
    return (
      <div>
        <SkeletonTotalsRow />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <TotalsRow />
      
      {plants.length > 0 ? (
        <DataTable
          columns={columns}
          data={plants}
          pagination
          highlightOnHover
          striped
          responsive
          defaultSortFieldId="deviceId"
          defaultSortAsc={true}
          actions={<CustomActions />}
          contextMessage={{
            singular: 'plant',
            plural: 'plants',
            message: 'selected'
          }}
        />
      ) : (
        <div className="alert alert-info" role="alert">
          No plants found for this merchant.
        </div>
      )}
    </div>
  );
};

export default PlantsMerchantsInfo;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchDevicesForPlants } from '../api/mockApis';
import Display from '../pages/Display';

const AllDevicePage = () => {
  const { plantId } = useParams();

  const [devices, setDevices] = useState([]);
  const [macId, setMacId] = useState(null);
  const [type, setType] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getDevices = async () => {
      if (!plantId) {
        setError('Plant ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchDevicesForPlants(plantId);

        if (response?.data?.length > 0) {
          const firstDevice = response.data[0];

          setDevices(response.data);
          setMacId(firstDevice?.IMEI || null);
          setType(firstDevice?.Type || null);
        } else {
          setDevices([]);
          setError('No devices found for this plant');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch devices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    getDevices();
  }, [plantId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-10 bg-white rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Loading...</h2>
          <p className="text-gray-600">Fetching device information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="p-10 bg-white rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">An Error Occurred 😞</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto">
      <Display macId={macId} type={type} />
    </div>
  );
};

export default AllDevicePage;
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import {url} from '../constants/serverInfo'

const App = () => {
    const [macId, setMacId] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [deleting, setDeleting] = useState(false);


    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [showDeleteBtn, setShowDeleteBtn] = useState(false);
    const merchantId = 'xyz'; // Static merchant ID as per the requirement
    const { user } = useAuth();
    const handleDelete = (e, row) => {
        e.stopPropagation();
        setSelectedPlant(row);
        setConfirmText('');
        setDeleteModalOpen(true);
    };
    console.log('Authenticated user:', user);
    

useEffect(() => {
    if (user?.role === "engineer") {
        setShowDeleteBtn(true);
    } else {
        setShowDeleteBtn(false);
    }
}, [user]);
    const handleInputChange = (event) => {
        const value = event.target.value.toUpperCase();
        setMacId(value);
        setErrorMessage(''); // Clear error on new input
    };

 const confirmDeletePlant = async () => {
        if (confirmText !== 'YES') {
            alert('You must type YES to delete.');
            return;
        }

        try {
            setDeleting(true);


            const response = await fetch(`${url}/plantAuth/deletePlantByMac`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ macId: macId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            setDeleteModalOpen(false);
            alert('MAC ID and associated data deleted successfully.');


        } catch (error) {
            alert('Failed to delete plant: ' + error.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleSearch = useCallback(() => {

        const fetchPlantIdByMacId = async (macId) => {
            const urls = `${url}/plants/mac/${macId}`;

            try {
                const response = await fetch(urls);

                if (!response.ok) {
                    // Attempt to read the error message from the response body
                    let errorDetail = await response.text();
                    try {
                        const errorJson = JSON.parse(errorDetail);
                        errorDetail = errorJson.message || errorJson.error || errorDetail;
                    } catch (e) {
                        // If it's not JSON, use the raw text
                    }

                    throw new Error(`HTTP error ${response.status}: ${errorDetail}`);
                }

                const data = await response.json();
                console.log('rs',data);
                // The expected response structure is { plantId: '...' }
                if (!data.plantId) {
                    throw new Error('API response is missing the plantId field.');
                }else{
                    navigate(`/merchants/na/plants/${data.plantId}/allDevices`);
                }
                return { plantId: data.plantId };

            } catch (error) {
                // Re-throw the error for the calling component (App) to handle
                console.error('Error in fetchPlantIdByMacId:', error);
                throw new Error(`Network or Server Error: ${error.message}`);
            }
        };

        const trimmedMacId = macId.trim();
        if (!trimmedMacId) {
            setErrorMessage("MAC ID cannot be empty.");
            return;
        }else{
            fetchPlantIdByMacId(trimmedMacId);
        }
        

    }, [macId]);

    // Allow pressing Enter key to submit the form
    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);


    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl">
                <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
                    Device Finder
                </h1>
                <p className="text-center text-gray-500 mb-8">
                    Enter the device's MAC Address to view all associated devices.
                </p>

                <div className="space-y-4">
                    <label htmlFor="macIdInput" className="block text-sm font-medium text-gray-700">
                        MAC Address
                    </label>
                    <input
                        id="macIdInput"
                        type="text"
                        value={macId}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g., AABBCC112233"
                        className={`w-full px-4 py-3 border ${errorMessage ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition duration-150 ease-in-out text-sm uppercase`}
                        maxLength={17}
                    />
                </div>

                {errorMessage && (
                    <p className="mt-2 text-sm text-red-600 font-medium">
                        ⚠️ {errorMessage}
                    </p>
                )}

                <button
                    onClick={handleSearch}
                    className="mt-8 w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-[1.01]"
                >
                    Search Devices
                </button>

                {showDeleteBtn && (
                    <button
                        onClick={handleDelete}
                        className="mt-4 w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out transform hover:scale-[1.01]"
                    >
                        Delete Device
                    </button>
                )}

            </div>
             {deleteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white rounded-lg shadow-xl w-96 p-6">
                                <h3 className="text-lg font-bold text-red-600 mb-3">
                                    Confirm Delete
                                </h3>

                                <p className="text-sm text-gray-600 mb-3">
                                    Are you sure you want to delete plant:
                                    <span className="font-semibold"> {selectedPlant?.ProductName}</span>?
                                </p>

                                <p className="text-sm text-gray-600 mb-2">
                                    Type <span className="font-bold text-red-600">YES</span> to confirm.
                                </p>

                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="w-full border rounded-md px-3 py-2 mb-4 focus:ring-2 focus:ring-red-300"
                                    placeholder="Type YES"
                                />

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="px-4 py-2 rounded-md border"
                                        disabled={deleting}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={confirmDeletePlant}
                                        disabled={confirmText !== 'YES' || deleting}
                                        className={`px-4 py-2 rounded-md text-white ${confirmText === 'YES'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {deleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
        </div>
    );
};

export default App;

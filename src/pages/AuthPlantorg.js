import React, { useState, useEffect, useRef } from 'react';
// These would be your actual imports
import { getMerchants, apiAuthorizeRequest, apiAuthorizeDirect, getPlantNameByPlantId, getCurrentMerchantsByPlantId } from "../api/mockApis";
import { useParams } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const AuthPlant = () => {
    const { plantId } = useParams();
    const [plantName, setPlantName] = useState(null);
    const [currentMerchants, setCurrentMerchants] = useState([]);
    const [isLoadingCurrentMerchants, setIsLoadingCurrentMerchants] = useState(false);

    // Fetch plant name and current merchants on component mount
    useEffect(() => {
        async function getPlantData() {
            try {
                if (plantId) {
                    // Fetch plant name
                    let plantName = await getPlantNameByPlantId(plantId);
                    console.log('Plant Name:', plantName);
                    setPlantName(plantName['data'][0]['ProductName']);

                    // Fetch current merchants for this plant
                    await fetchCurrentMerchants();
                }
            } catch (err) {
                console.error('Error fetching plant data:', err);
                setPlantName(null);
                setCurrentMerchants([]);
            }
        }

        getPlantData();
    }, [plantId]);

    // Function to fetch current merchants
    const fetchCurrentMerchants = async () => {
        if (!plantId) return;
        
        setIsLoadingCurrentMerchants(true);
        try {
            const merchantsData = await getCurrentMerchantsByPlantId(plantId);
            console.log('Current Merchants:', merchantsData);
            setCurrentMerchants(merchantsData||[]);
        } catch (err) {
            console.error('Error fetching current merchants:', err);
            setMessage({ text: 'Failed to load current merchants.', type: 'error' });
            setCurrentMerchants([]);
        } finally {
            setIsLoadingCurrentMerchants(false);
        }
    };

    const [allMerchants, setAllMerchants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    // State for authorization
    const [userType, setUserType] = useState("ADMIN");
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Ref for detecting clicks outside the search component
    const searchContainerRef = useRef(null);

    // Fetch all merchants on initial render
    useEffect(() => {
        const fetchMerchants = async () => {
            try {
                const merchantsData = await getMerchants();
                console.log('All Merchants:', merchantsData);
                setAllMerchants(merchantsData);
            } catch (err) {
                console.error('Error fetching merchants:', err);
                setMessage({ text: 'Failed to load merchants.', type: 'error' });
            }
        };

        fetchMerchants();
    }, []);

    // Authorization logic
    const handleAuth = async () => {
        setMessage({ text: '', type: '' });
        if (!selectedMerchant) {
            setMessage({ text: 'Please select a merchant from the list.', type: 'error' });
            return;
        }
        if (!plantId) {
            setMessage({ text: 'Plant ID is invalid.', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiAuthorizeRequest(selectedMerchant.ID, userType, plantId);
            if (res.success) {
                setMessage({ text: 'Authorization request sent successfully!', type: 'success' });
                setSelectedMerchant(null);
                setSearchTerm("");
                // Refresh current merchants list after successful authorization
                await fetchCurrentMerchants();
            } else {
                setMessage({ text: res.message || 'Authorization failed.', type: 'error' });
            }
        } catch (err) {
            console.error('Authorization error:', err);
            setMessage({ text: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDirectAuth = async () => {
        setMessage({ text: '', type: '' });
        if (!selectedMerchant) {
            setMessage({ text: 'Please select a merchant from the list.', type: 'error' });
            return;
        }
        if (!plantId) {
            setMessage({ text: 'Plant ID is invalid.', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiAuthorizeDirect(selectedMerchant.ID, userType, plantId);
            if (res.success) {
                setMessage({ text: 'Authorized successfully!', type: 'success' });
                setSelectedMerchant(null);
                setSearchTerm("");
                // Refresh current merchants list after successful authorization
                await fetchCurrentMerchants();
            } else {
                setMessage({ text: res.message || 'Authorization failed.', type: 'error' });
            }
        } catch (err) {
            console.error('Authorization error:', err);
            setMessage({ text: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handler for selecting a merchant from the dropdown
    const handleMerchantSelect = (merchant) => {
        setSelectedMerchant(merchant);
        setSearchTerm(merchant.MerchantName);
        setIsDropdownVisible(false);
    };

    // Handler for changes in the search input
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (!isDropdownVisible) {
            setIsDropdownVisible(true);
        }
        if (selectedMerchant) {
            setSelectedMerchant(null);
        }
    }

    // Filter merchants based on search term (exclude already authorized merchants)
    const filteredMerchants = searchTerm
        ? allMerchants.filter(merchant =>
            merchant.MerchantName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !currentMerchants.some(current => current.ID === merchant.ID)
        )
        : [];

    // A check to ensure the button is enabled only when a valid merchant is selected
    const isSelectionValid = selectedMerchant && searchTerm === selectedMerchant.MerchantName;

    console.log("present merchant:",currentMerchants)

    return (
        <div className="flex items-center justify-center w-full min-h-screen bg-gray-50 font-sans">
            <div className="flex flex-col items-center p-8 md:p-12 rounded-xl shadow-2xl bg-white border border-gray-200 w-full max-w-2xl mx-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Authorize Plant Access</h1>
                <p className="text-gray-500 mb-8 text-center">
                    Select a merchant to grant access for Plant:{" "}
                    <span className="font-semibold text-blue-600">
                        {typeof plantName === "string" && plantName.trim() !== "" ? plantName : "N/A"}
                    </span>
                </p>

                {/* Current Authorized Merchants Section */}
                <div className="w-full mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Currently Authorized Merchants</h3>
                    {isLoadingCurrentMerchants ? (
                        <div className="text-center text-gray-500">Loading current merchants...</div>
                    ) : currentMerchants.length > 0 ? (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {currentMerchants.map((merchant) => (
                                <div key={merchant.ID} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                    <div>
                                        <p className="font-medium text-gray-800">{merchant.MerchantName}</p>
                                        <p className="text-sm text-gray-600">{merchant.MerchantEmail}</p>
                                        <p className="text-sm text-gray-600">{merchant.MerchantMobile}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                        Authorized
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-200">
                            No merchants are currently authorized for this plant.
                        </div>
                    )}
                </div>

                {/* Merchant Search Section */}
                <div className="w-full mb-6" ref={searchContainerRef}>
                    <label htmlFor="merchant-search" className="block text-sm font-medium text-gray-700 mb-2">
                        Add New Merchant
                    </label>
                    <div className="relative">
                        <SearchIcon />
                        <input
                            id="merchant-search"
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setIsDropdownVisible(true)}
                            placeholder="Search for a merchant to authorize..."
                            autoComplete="off"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        {isDropdownVisible && searchTerm && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredMerchants.length > 0 ? (
                                    filteredMerchants.map((merchant) => (
                                        <li
                                            key={merchant.ID}
                                            onClick={() => handleMerchantSelect(merchant)}
                                            className="px-4 py-2 text-gray-700 hover:bg-blue-50 cursor-pointer"
                                        >
                                            {merchant.MerchantName}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-2 text-gray-500">
                                        {searchTerm ? 'No merchants found or merchant is already authorized.' : 'Start typing to search for merchants.'}
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                {/* User Type Selection */}
                <div className="w-full mb-8">
                    <p className="block text-sm font-medium text-gray-700 mb-3">Authorize as:</p>
                    <div className="flex items-center justify-start space-x-6">
                        <label className="flex items-center space-x-2 text-gray-600 font-medium cursor-pointer transition-transform hover:scale-105">
                            <input
                                type="radio"
                                name="userType"
                                value="ADMIN"
                                checked={userType === "ADMIN"}
                                onChange={() => setUserType("ADMIN")}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span>Admin</span>
                        </label>
                        <label className="flex items-center space-x-2 text-gray-600 font-medium cursor-pointer transition-transform hover:scale-105">
                            <input
                                type="radio"
                                name="userType"
                                value="MEMBER"
                                checked={userType === "MEMBER"}
                                onChange={() => setUserType("MEMBER")}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span>Member</span>
                        </label>
                    </div>
                    <div className='flex items-center justify-start'>
                        {userType === 'ADMIN' ? (
                            <p className='px-4 py-2 mt-4 border border-gray-300 text-sm text-gray-400 rounded-md'>
                                ⚠️ Administrators can also edit plant information and configure plants and devices, but are not authorized to delete or remove a plant.
                            </p>
                        ) : (
                            <p className='px-4 py-2 mt-4 border border-gray-300 text-sm text-gray-400 rounded-md'>
                                ⚠️ Members can view generation data, detailed information, alarm information, and device details, but cannot edit or configure the plant.
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-2 w-full'>
                    <button
                        onClick={handleAuth}
                        disabled={!isSelectionValid || isLoading}
                        className="text-sm w-full px-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600 flex items-center justify-center"
                    >
                        Send Authorization Request
                    </button>

                    <button
                        onClick={handleDirectAuth}
                        disabled={!isSelectionValid || isLoading}
                        className="w-full px-2 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600 flex items-center justify-center"
                    >
                        Merchant Direct Authorize
                    </button>
                </div>

                {/* Message Display */}
                {message.text && (
                    <div className={`mt-4 text-sm text-center font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AuthPlant;
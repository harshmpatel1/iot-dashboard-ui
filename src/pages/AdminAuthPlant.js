import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getFilteredPlants, apiAuthorizeRequest, getFilteredMerchants } from "../api/mockApis";
import { useParams } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const AuthPlant = ({ isOpen, onClose }) => {
    console.log('AuthPlant component rendered, isOpen:', isOpen);
    
    const { plantId } = useParams();
    const [plantName, setPlantName] = useState(null);
    const [allPlants, setAllPlants] = useState([]);
    const [allMerchants, setAllMerchants] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermMerchant, setSearchTermMerchant] = useState("");
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isDropdownVisibleForMerchant, setIsDropdownVisibleForMerchant] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchingForMerchant, setIsSearchingForMerchant] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [searchErrorForMerchant, setSearchErrorForMerchant] = useState('');
    const { user } = useAuth();

    // State for authorization
    const [userType, setUserType] = useState("ADMIN");
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Refs for detecting clicks outside the search components
    const searchContainerRef = useRef(null);
    const searchMerchantRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    const searchMerchantTimeoutRef = useRef(null);

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            // Reset form state when opening
            setSelectedPlant(null);
            setSelectedMerchant(null);
            setSearchTerm("");
            setSearchTermMerchant("");
            setAllPlants([]);
            setAllMerchants([]);
            setMessage({ text: '', type: '' });
            setUserType("ADMIN");
        }
    }, [isOpen]);

    // Debounced search function for plants
    const performSearch = useCallback(async (searchValue) => {
        if (!searchValue.trim()) {
            setAllPlants([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        setSearchError('');

        try {
            const plantsData = await getFilteredPlants(searchValue);
            setAllPlants(plantsData);
        } catch (err) {
            console.error('Error searching plants:', err);
            setSearchError('Failed to search plants. Please try again.');
            setAllPlants([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Debounced search function for merchants
    const performSearchForMerchant = useCallback(async (searchValue) => {
        if (!searchValue.trim()) {
            setAllMerchants([]);
            setIsSearchingForMerchant(false);
            return;
        }

        setIsSearchingForMerchant(true);
        setSearchErrorForMerchant('');

        try {
            const merchantData = await getFilteredMerchants(searchValue);
            setAllMerchants(merchantData);
        } catch (err) {
            console.error('Error searching merchants:', err);
            setSearchErrorForMerchant('Failed to search merchants. Please try again.');
            setAllMerchants([]);
        } finally {
            setIsSearchingForMerchant(false);
        }
    }, []);

    // Handle plant search input changes with debouncing
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Reset selection if search term changes
        if (selectedPlant && value !== getPlantDisplayName(selectedPlant)) {
            setSelectedPlant(null);
        }

        // Show dropdown when typing
        if (!isDropdownVisible) {
            setIsDropdownVisible(true);
        }

        // Debounce search API call
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(value);
        }, 300); // 300ms debounce delay
    };

    // Handle merchant search input changes with debouncing
    const handleSearchMerchantChange = (e) => {
        const value = e.target.value;
        setSearchTermMerchant(value);

        // Clear previous timeout
        if (searchMerchantTimeoutRef.current) {
            clearTimeout(searchMerchantTimeoutRef.current);
        }

        // Reset selection if search term changes
        if (selectedMerchant && value !== getMerchantDisplayName(selectedMerchant)) {
            setSelectedMerchant(null);
        }

        // Show dropdown when typing
        if (!isDropdownVisibleForMerchant) {
            setIsDropdownVisibleForMerchant(true);
        }

        // Debounce search API call
        searchMerchantTimeoutRef.current = setTimeout(() => {
            performSearchForMerchant(value);
        }, 300); // 300ms debounce delay
    };

    // Helper function to get display name for plant
    const getPlantDisplayName = (plant) => {
        return `${plant.Email} - ${plant.IMEI} (Plant ID: ${plant.ID})`;
    };

    // Helper function to get display name for merchant
    const getMerchantDisplayName = (merchant) => {
        return `${merchant.MerchantEmail} - ${merchant.MerchantName || 'N/A'} (Merchant ID: ${merchant.ID})`;
    };

    // Handler for selecting a plant from the dropdown
    const handlePlantSelect = (plant) => {
        setSelectedPlant(plant);
        setSearchTerm(getPlantDisplayName(plant));
        setIsDropdownVisible(false);
        setSearchError('');
    };

    // Handler for selecting a merchant from the dropdown
    const handleMerchantSelect = (merchant) => {
        setSelectedMerchant(merchant);
        setSearchTermMerchant(getMerchantDisplayName(merchant));
        setIsDropdownVisibleForMerchant(false);
        setSearchErrorForMerchant('');
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
            if (searchMerchantRef.current && !searchMerchantRef.current.contains(event.target)) {
                setIsDropdownVisibleForMerchant(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (searchMerchantTimeoutRef.current) {
                clearTimeout(searchMerchantTimeoutRef.current);
            }
        };
    }, []);

    // Close modal when clicking on backdrop
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Authorization logic
    const handleAuth = async () => {
        setMessage({ text: '', type: '' });
        if (!selectedPlant) {
            setMessage({ text: 'Please select a plant from the list.', type: 'error' });
            return;
        }
        if(!selectedMerchant){
           setMessage({ text: 'Please select a Merchant from the list.', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            console.log('Authorization request:', {
                userType: userType,
                plantId: selectedPlant.ID
            });

            if(!selectedMerchant || !userType || !selectedPlant.ID){
                setMessage({ text: 'Missing required information.', type: 'error' });
                return;
            }

            const res = await apiAuthorizeRequest(
                selectedMerchant.ID,
                userType,
                selectedPlant.ID,
                true
            );

            if (res.success) {
                setMessage({ text: 'Authorization successfully!', type: 'success' });
                setSelectedPlant(null);
                setSearchTerm("");
                setAllPlants([]);
                
                // Close the modal after success
                setTimeout(() => {
                    onClose();
                }, 2000);
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

    // Filter plants and merchants based on search term (now handled by backend)
    const filteredPlants = allPlants;
    const filteredMerchants = allMerchants;

    // A check to ensure the button is enabled only when a valid plant is selected
    const isSelectionValid = selectedPlant && searchTerm === getPlantDisplayName(selectedPlant);

    // If modal is not open, don't render anything
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center w-full min-h-screen bg-gray-900 bg-opacity-50 font-sans z-50"
            onClick={handleBackdropClick}
        >
            <div className="flex flex-col items-center p-8 md:p-12 rounded-xl shadow-2xl bg-white border border-gray-200 w-full max-w-3xl mx-4 relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Authorize Plant Access</h1>
                <p className="text-gray-500 mb-8 text-sm">
                    Direct Authorization! permissions are applied based on the chosen role.
                </p>
                
                {/* Plant Search Section */}
                <div className="w-full mb-6" ref={searchContainerRef}>
                    <label htmlFor="plant-search" className="block text-sm font-medium text-gray-700 mb-2">
                        Plant
                    </label>
                    <div className="relative">
                        <SearchIcon />
                        <input
                            id="plant-search"
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setIsDropdownVisible(true)}
                            placeholder="Search by email, IMEI or MAC..."
                            autoComplete="off"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />

                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {isDropdownVisible && searchTerm && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {isSearching ? (
                                    <li className="px-4 py-2 text-gray-500">Searching...</li>
                                ) : searchError ? (
                                    <li className="px-4 py-2 text-red-500">{searchError}</li>
                                ) : filteredPlants.length > 0 ? (
                                    filteredPlants.map((plant) => (
                                        <li
                                            key={plant.ID}
                                            onClick={() => handlePlantSelect(plant)}
                                            className="px-4 py-2 text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="font-medium">Plant ID: {plant.ID}</div>
                                            <div className="text-sm text-gray-500">Email: {plant.Email}</div>
                                            <div className="text-sm text-gray-500">IMEI: {plant.IMEI}</div>
                                            <div className="text-sm text-gray-500">Capacity: {plant.InstalltionCapacity} kW</div>
                                            <div className="text-sm text-gray-500">Location: {plant.Address}</div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-2 text-gray-500">No plants found.</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Merchant Search Section */}
                <div className="w-full mb-6" ref={searchMerchantRef}>
                    <label htmlFor="merchant-search" className="block text-sm font-medium text-gray-700 mb-2">
                        Merchant
                    </label>
                    <div className="relative">
                        <SearchIcon />
                        <input
                            id="merchant-search"
                            type="text"
                            value={searchTermMerchant}
                            onChange={handleSearchMerchantChange}
                            onFocus={() => setIsDropdownVisibleForMerchant(true)}
                            placeholder="Search by email or Name"
                            autoComplete="off"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />

                        {isSearchingForMerchant && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {isDropdownVisibleForMerchant && searchTermMerchant && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {isSearchingForMerchant ? (
                                    <li className="px-4 py-2 text-gray-500">Searching...</li>
                                ) : searchErrorForMerchant ? (
                                    <li className="px-4 py-2 text-red-500">{searchErrorForMerchant}</li>
                                ) : filteredMerchants.length > 0 ? (
                                    filteredMerchants.map((merchant) => (
                                        <li
                                            key={merchant.ID}
                                            onClick={() => handleMerchantSelect(merchant)}
                                            className="px-4 py-2 text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="font-medium">Merchant ID: {merchant.ID}</div>
                                            <div className="text-sm text-gray-500">Email: {merchant.MerchantEmail}</div>
                                            <div className="text-sm text-gray-500">Name: {merchant.MerchantName || 'N/A'}</div>
                                            {merchant.Phone && (
                                                <div className="text-sm text-gray-500">Phone: {merchant.Phone}</div>
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-2 text-gray-500">No merchants found.</li>
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

                <button
                    onClick={handleAuth}
                    disabled={!isSelectionValid || isLoading}
                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600 flex items-center justify-center"
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Send Authorization'}
                </button>

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
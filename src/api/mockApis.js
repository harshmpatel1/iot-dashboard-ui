import { mockData } from './mockData';
import {url} from '../constants/serverInfo'
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
// In your mockApis.js file
export const getCurrentMerchantsByPlantId = async (plantId) => {
    try {
        const response = await fetch(`${url}/plants/fromPlantIdToMerchantInfo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ plantId }),
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch current merchants');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching current merchants:', error);
        throw error;
    }
};
export const createMerchant = async ({ MerchantName, MerchantEmail, MerchantMobile, isactive, Password,E_id }) => {
    try {
        
        if(!MerchantName || !MerchantEmail || !MerchantMobile || isactive === undefined || !Password){
            return {created: false, error: 'Missing required fields.'};
        }
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({MerchantName,MerchantEmail,MerchantMobile,isactive,Password,E_id}),
        };
        const response = await fetch(`${url}/merchants/createMerchant`, fetchOptions);
         if (!response.ok) {
            // The server is expected to send a JSON body with a 'message' property on error
            const errorData = await response.json();
            // Return the specific error message from the server (e.g., "The Merchant Name is already taken...")
            return { created: false, error: errorData.message || `HTTP error! Status: ${response.status}` };
        }
        
        const res = await response.json();
        return {created: true, res};

    } catch (error) {
        console.error('Fetch error:', error);
        // Catch network errors or unexpected issues
        return {created: false, error: error.message || 'Network or configuration error occurred.'};
    }
}

export const createPlant = async ({ 
    Product, ModelOfProduct, NameOfPlant, TimeZone, InstallationType, 
    SystemType, InstalledCapacityKwp, OperatingDate, Currency,
    UnitCostInrKwh, TotalCostInr, RegisterByType, RegisterByID,
    CustomerID, LoggerId  // Add new parameters
}) => {

    console.log('created plant')

    try {
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                Product, ModelOfProduct, NameOfPlant, TimeZone, InstallationType, 
                SystemType, InstalledCapacityKwp, OperatingDate, Currency,
                UnitCostInrKwh, TotalCostInr, RegisterByType, RegisterByID,
                CustomerID, LoggerId  // Include new parameters
            }),
        };
        
        const response = await fetch(`${url}/plants/createPlant`, fetchOptions);
        
        if (!response.ok) {
            const errorData = await response.json();
            return { created: false, error: errorData.message || `HTTP error! Status: ${response.status}` };
        }
        
        const res = await response.json();
        return { created: true, res };

    } catch (error) {
        console.error('Fetch error:', error);
        return { created: false, error: error.message || 'Network or configuration error occurred.' };
    }
}

export const deleteMerchant = async ({ MerchantId }) => {
    try {
        // Basic client-side validation
        if (!MerchantId || typeof MerchantId !== 'number' || MerchantId <= 0) {
            return { deleted: false, error: 'Missing or invalid Merchant ID. Must be a positive number.' };
        }

        if (!url) {
            return { deleted: false, error: 'API base URL is not provided.' };
        }

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // The API expects MerchantId in the body
            body: JSON.stringify({ MerchantId }),
        };

        const response = await fetch(`${url}/merchants/deleteMerchant`, fetchOptions);

        if (!response.ok) {
            // The server is expected to send a JSON body with a 'message' property on error (400, 500)
            const errorData = await response.json();
            // Return the specific error message from the server (e.g., "Missing or invalid parameter...")
            return { deleted: false, error: errorData.message || `HTTP error! Status: ${response.status}` };
        }

        const res = await response.json();
        // Return successful response object
        return { deleted: true, res };

    } catch (error) {
        console.error('Fetch error in deleteMerchant:', error);
        // Catch network errors or unexpected issues
        return { deleted: false, error: error.message || 'Network or configuration error occurred.' };
    }
}
export const apiLogin = async (email, password, role) => {
    const response = await fetch(`${url}/auth/admins/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ← ADD THIS: Ensures cookies are sent/received
        body: JSON.stringify({ username: email, password, role }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    //console.log('data',data);
    data['user']['role'] = role;
    //console.log('data',data);
    return data.user;
};

export const apiCheckAuth = async () => {
    const response = await fetch(`${url}/auth/me`, {
        method: 'GET',
        credentials: 'include' // ← KEEP THIS: Important for cookie auth
    });

    if (response.ok) {
        const data = await response.json();
        return data.user;
    } 
    return null;
};

export const getCreatePlantData = async (productType) => {
    try{

        const response = await fetch(`${url}/plants/combined-data/m-1/${productType}`);
        
        if (!response.ok) {
            // If the server responded with an error, throw an error to be caught by the catch block
            throw new Error(result.message || `Request failed with status ${response.status}`);
        }
        let result = await response.json();
        console.log("return model",result)
        // Return a structured success object
        return result;
    } catch (error) {
        // Handle network errors or errors thrown from a non-ok response
        console.error('API call failed:', error);
        return {
            success: false,
            // Use a status of 0 or a more specific error code for non-HTTP errors
            status: error.response ? error.response.status : 0,
            data: { message: error.message || 'A network error occurred. Could not connect to the server.' }
        };
    }
    
};

export const apiLogout = async () => {
    const response = await fetch(`${url}/auth/logout`, {
        method: 'POST',
        credentials: 'include' // ← ADD THIS: So server can clear the cookie
    });
    
    if (!response.ok) {
        console.error('Server failed to clear token, client state cleared anyway.');
    }
    return true;
};

export const apiAuthorizeRequest = async (merchantId, authAs, id, directAuth) => {
    const apiUrl = `${url}/plantAuth/authreq`;
    const requestData = {
        merchantId: merchantId,
        AuthorisedType: authAs,
        id: id,
        directAuth:directAuth
    };
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    };

    try {
        const response = await fetch(apiUrl, fetchOptions);
        const result = await response.json(); // Attempt to parse JSON body regardless of status

        if (!response.ok) {
            throw new Error(result.message || `Request failed with status ${response.status}`);
        }
        return {
            success: true,
            status: response.status,
            data: result,
        };
    } catch (error) {
        console.error('API call failed:', error);
        return {
            success: false,
            status: error.response ? error.response.status : 0,
            data: { message: error.message || 'A network error occurred. Could not connect to the server.' }
        };
    }
}

export const apiAuthorizeDirect = async (merchantId, authAs, id) => {
    const apiUrl = `${url}/plantAuth/authComplete`;
    const requestData = {
        merchantId: merchantId,
        AuthorisedType: authAs,
        id: id
    };
    const fetchOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    };

    try {
        const response = await fetch(apiUrl, fetchOptions);
        const result = await response.json(); // Attempt to parse JSON body regardless of status

        if (!response.ok) {
            throw new Error(result.message || `Request failed with status ${response.status}`);
        }
        return {
            success: true,
            status: response.status,
            data: result,
        };
    } catch (error) {
        console.error('API call failed:', error);
        return {
            success: false,
            status: error.response ? error.response.status : 0,
            data: { message: error.message || 'A network error occurred. Could not connect to the server.' }
        };
    }
}



export const fetchFaults = async (plantId) => {
    try {
        const response = await fetch(`${url}/iot/faults/${plantId}`);
        if (!response.ok) {
            const errorData = await response.json(); // Try to parse error details from the server
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const faults = await response.json();
        //console.log('faults', faults);
        return faults;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function fetchMerchantsAll() {
    try {
        const response = await fetch(`${url}/merchants`);
        //console.log('res', response);
        if (!response.ok) {
            const errorData = await response.json(); // Try to parse error details from the server
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const merchants = await response.json();
        console.log('mc', merchants);
        return { error: null, merchantsArr: merchants }
    } catch (error) {
        console.error('Fetch error:', error);
        return { error, merchants: [] }
    }
}
async function fetchUsersAll() {
    try {
        const response = await fetch(`${url}/users`);
        //console.log('res', response);
        if (!response.ok) {
            const errorData = await response.json(); // Try to parse error details from the server
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        //console.log('mc', users);
        return { error: null, usersArr: users }
    } catch (error) {
        console.error('Fetch error:', error);
        return { error, users: [] }
    }
}
/**
 * Mock function to get users based on the logged-in user's role and ID.
 */
export const getUsers = async (currentUser, merchantId) => {
    await delay(300);
    if (!currentUser) return [];

    switch (currentUser.role) {
        case 'admin':
            //console.log('iddd', merchantId)
            if (merchantId) {
                //console.log('wrong condi')

                return mockData.users.filter(user => user.merchantId == merchantId)
            }
            let { error, merchantsArr } = await fetchMerchantsAll()
            //console.log('good cond', merchantsArr);
            if (error) {
                return []
            }
            return merchantsArr
        // return mockData.users.concat(mockData.merchants);
        case 'merchant':

            // Merchant can see only their associated users
            return mockData.users.filter(user => user.merchantId === currentUser.id);
        default:
            // Regular users cannot see other users
            return [];
    }
}

// export const getAllUsers = async () => {
//     try {
//         let response = await fetch(`${url}/users`)
//         if (!response.ok) {
//             return new Error('error to find all users')
//         }
//         let users = await response.json();
//         return users
//     } catch (err) {
//         console.error('Fetch error:', err);
//         return [];
//     }
// }

export const getAllUsers = async ({ pageno, limit, search, filter }) => {
    const urls = new URL(`${url}/users/paginated`);

    urls.searchParams.append("page", pageno);
    urls.searchParams.append("limit", limit);
    if (search) urls.searchParams.append("search", search);
    if (filter) urls.searchParams.append("filter", filter);

    const res = await fetch(urls);

    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
};





export const getFilteredPlants = async (filterText = '') => {
    try {
        //console.log('Fetching filtered plants with filter:', filterText);
        
        // Build URL with query parameter
        const urls = new URL(`${url}/plants/filtered-plants`);
        if (filterText) {
            urls.searchParams.append('filterText', filterText);
        }
        
        let response = await fetch(urls.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let result = await response.json();
        return result.data || []; // Return the data array from the response
    } catch (err) {
        console.error('Fetch error:', err);
        throw err; // Re-throw to handle in component
    }
}



export const getFilteredMerchants = async (filterText = '') => {
    try {
        //console.log('Fetching filtered plants with filter:', filterText);
        
        // Build URL with query parameter
        const urls = new URL(`${url}/merchants/filtered-merchants`);
        if (filterText) {
            urls.searchParams.append('filterText', filterText);
        }
        
        let response = await fetch(urls.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let result = await response.json();
        return result.data || []; // Return the data array from the response
    } catch (err) {
        console.error('Fetch error:', err);
        throw err; // Re-throw to handle in component
    }
}



export const getIMEIFromPlant = async (plantId) => {
     if (!plantId) {
        //console.log('No PlantId provided to API call');
        throw new Error('PlantId is required');
    }

    try {
        const response = await fetch(`${url}/iot/IMEI`, {
            method: 'POST', // Specify the POST method
            headers: {
                'Content-Type': 'application/json', // Set the content type
            },
            body: JSON.stringify(plantId), // An empty JSON object as the body
        });

        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON data from the response
        const data = await response.json();
        //console.log('API Response:', data);
        return {data:data};

    } catch (error) {
        console.error('Error fetching data:', error);
        return {data: null};
    }
}
export const getPlantNameByPlantId = async (plantId) => {
     if (!plantId) {
        //console.log('No PlantId provided to API call');
        throw new Error('PlantId is required');
    }
    //console.log('plantId',plantId);

    try {
        const response = await fetch(`${url}/plants/getPlantName`, {
            method: 'POST', // Specify the POST method
            headers: {
                'Content-Type': 'application/json', // Set the content type
            },
            body: JSON.stringify({plantId}), // An empty JSON object as the body
        });
        // console.log('response1234',response);

        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON data from the response
        const data = await response.json();
        // console.log('API Response:', data);
        return {data:data};

    } catch (error) {
        console.error('Error fetching data:', error);
        return {data: null};
    }
}
export const fetchPlantsForMerchant = async (merchantId) => {
    try {
        if (!merchantId) {
            return { err: 'No merchantId provided', plants: [] }
        }
        let response = await fetch(`${url}/merchants/${merchantId}/users`)
        if (!response.ok) {
            return new Error('error to find devices for merchants')
        }
        let plants = await response.json();
        //console.log('plants',plants,merchantId);
        return { err: null, plants }

    } catch (err) {
        return { err, plants: [] }
    }
}

export const fetchPlantsForUser = async (userId) => {
    console.log('fm', userId);
    try {
        //console.log('mids', userId);
        let response = await fetch(`${url}/users/${userId}/plants`)
        if (!response.ok) {
            return new Error('error to find devices for merchants')
        }
        let plants = await response.json();
        return { err: null, plants }
    } catch (err) {
        return { err, plants: [] }
    }
}

export const fetchPlants = async (page = 1, perPage = 10, filterText = '', statusFilter = 'Total', typeFilter = 'All', subTypegtiFilter = 'All', subTypeHybridFilter = 'All') => {
    try {
        //console.log(`Fetching plants: page=${page}, perPage=${perPage}, filterText='${filterText}', status='${statusFilter}'`);
        const queryParams = new URLSearchParams({
            page,
            perPage,
            // Pass empty string for no text filter
            filterText: filterText, 
            // Pass the status string. Backend handles 'Total' vs actual status.
            statusFilter: statusFilter, 
            // Pass the type filter
            typeFilter: typeFilter,
            // Pass the sub-type filters
            subTypegtiFilter: subTypegtiFilter,
            subTypeHybridFilter: subTypeHybridFilter
        });

        const response = await fetch(`${url}/plants?${queryParams}`);
        if (!response.ok) {
            // Throw the server's error message if available
            const errorData = await response.json().catch(() => ({ message: 'Failed to fetch plant data' }));
            throw new Error(errorData.message || 'Failed to fetch plant data');
        }
        const plantsData = await response.json();
        return { err: null, data: plantsData };
    } catch (err) {
        console.error("API Error:", err);
        return { err, data: { data: [], total: 0 } };
    }
};
export const fetchPlantStats = async () => {
    try {
        // NOTE: This endpoint is not provided, assuming it exists
        const response = await fetch(`${url}/plants/plant-stats`); 
        if (!response.ok) {
            throw new Error('Failed to fetch plant stats');
        }
        const stats = await response.json();
        return { err: null, stats };
    } catch (err) {
        return { err, stats: { total: 0, online: 0, offline: 0, withAlerts: 0, noAlerts: 0 } };
    }
};
export const fetchPlantInfoFromPlantId = async (plantId) => {
    //console.log('fm', plantId);
    try {
        //console.log('mids', plantId);
        let response = await fetch(`${url}/plants/${plantId}`)
        if (!response.ok) {
            return new Error('error to find devices for merchants')
        }
        let plants = await response.json();
        console.log('plant info',plants);
        return { err: null, plants }

    } catch (err) {
        return { err, plants: [] }
    }
}

// In your mockApis.js file
export const fetchInverterLoggerDataWithMacId = async (macId, type) => {

  // ✅ FIXED CONDITION
  if (!macId || !type) {
    throw new Error('MAC ID and Inverter Type are required');
  }

  try {
    const response = await fetch(
      `${url}/plants/devices/${macId}/${type}`,
      {
        method: 'POST', // keeping POST to match backend
        headers: {
          'Content-Type': 'application/json',
        }
        // ❌ No body needed
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      inverterData: [],
      loggerData: []
    };
  }
};


export const downloadInverterDataCSV = async (macId, type) => {
    if (!macId || !type) {
        //console.log('No macId or type provided for CSV download');
        throw new Error('MAC ID and Inverter Type are required');
    }

    try {
        const response = await fetch(`${url}/display/downloadInverterData/${macId}/${type}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the blob data
        const blob = await response.blob();
        
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `inverter_data_${macId}_${type}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        return true;

    } catch (error) {
        console.error('Error downloading CSV:', error);
        throw error;
    }
}

export const fetchDevicesForPlants = async (plantId) => {

    try {
        const response = await fetch(`${url}/plants/${plantId}/devices`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        // Parse the JSON data from the response
        const data = await response.json();
        //console.log('dd', data);
        return { error: null, data }
    } catch (e) {
        return { error: e, data: [] }
        console.error("Fetch error:", e);
    } finally {
        // Set loading to false once the fetch is complete (either success or failure)
    }
};
/**
 * Mock function to get devices based on the logged-in user's role and ID.
 */
export const getDevices = async (currentUser, targetUserId = null) => {
    //console.log('cu', currentUser, 'tgId', targetUserId);
    await delay(300);
    if (!currentUser) return [];

    // If a specific user's devices are requested (e.g., from a user list click)
    if (targetUserId) {
        return mockData.devices.filter(device => device.ownerId === targetUserId);
    }

    // Otherwise, fetch devices based on the logged-in user's role
    switch (currentUser.role) {
        case 'admin':
            // Admin can see all devices
            return mockData.devices;
        case 'merchant':
            // Merchant can see devices of their associated users
            const merchantUserIds = currentUser.userIds || [];
            return mockData.devices.filter(device => merchantUserIds.includes(device.ownerId));
        case 'user':
            // User can see only their own devices
            return mockData.devices.filter(device => device.ownerId === currentUser.id);
        default:
            return [];
    }
}

export const getMerchants = async () => {
    // Assuming your mockData object has a 'merchants' array
    let { error, merchantsArr } = await fetchMerchantsAll()
    //console.log('err', error);
    //console.log('mar', merchantsArr);
    if (error) {
        return []
    }
    return merchantsArr
}

export const users = async () => {
    // Assuming your mockData object has a 'merchants' array
    let { error, usersArr } = await fetchUsersAll()
    //console.log('err', error);
    //console.log('mar', usersArr);
    if (error) {
        return []
    }
    return usersArr
}
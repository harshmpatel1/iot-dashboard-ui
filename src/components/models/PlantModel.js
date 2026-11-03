import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState, useMemo, useCallback } from 'react'
import { getCreatePlantData, createPlant } from '../../api/mockApis'
import { useAuth } from '../../hooks/useAuth';
import { url } from '../../constants/serverInfo';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const initialOptions = {
  Product: [],
  ModelOfProduct: [],
  InstallationType: [],
  SystemType: [],
  Users: [],
};

const SelectField = ({ 
  label, 
  name, 
  value, 
  optionsList, 
  required = false, 
  disabled = false, 
  handleChange,
  isSearchable = false,
  onSearch = null,
  searchValue = '',
  isLoading = false
}) => (
  <div>
    <label className="block text-sm font-medium text-orange-700">{label}</label>
    
    {isSearchable && onSearch ? (
      // Searchable dropdown for users
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          className="mt-1 block w-full px-3 py-2 text-base border border-orange-300 rounded-lg shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600 sm:text-sm"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
    ) : (
      // Regular select dropdown for other fields
      <select
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`
          mt-1 block w-full
          px-3 py-2
          text-base
          border rounded-lg
          shadow-sm text-gray-800
          focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600
          sm:text-sm appearance-none bg-white pr-8
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-orange-300'}
        `}
        required={required}
      >
        <option value="" disabled>Please Select</option>
        {optionsList.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    )}
    
    {/* User list dropdown */}
    {isSearchable && onSearch && optionsList.length > 0 && (
      <div className="mt-1 max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg">
        {optionsList.map((user) => (
          <div
            key={user.value}
            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
              value === user.value ? 'bg-orange-100 text-orange-700' : ''
            }`}
            onClick={() => handleChange({ target: { name, value: user.value } })}
          >
            <div className="font-medium">{user.label}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);
const InputField = ({
  label,
  name,
  value,
  placeholder,
  required = false,
  readOnly = false,
  handleChange,
  type = "text"
}) => {
  const inputId = `input-${name}`;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-orange-700">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`mt-1 px-3 py-1.5 text-orange-800 block w-full h-[32px] border ${readOnly
          ? 'border-gray-200 bg-gray-50 text-gray-500'
          : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm`}
        required={required && !readOnly}
      />
    </div>
  );
};
const CreateUserSection = ({ 
  showCreateUser, 
  toggleCreateUser, 
  newUserData, 
  handleNewUserChange,
  isCreatingUser 
}) => (
  <div className="sm:col-span-3 border rounded-lg p-4 bg-gray-50 mt-2">
    <div className="flex items-center justify-between mb-3">
      <h5 className="text-sm font-medium text-orange-700">Create New User</h5>
      <button
        type="button"
        onClick={toggleCreateUser}
        className="text-sm text-orange-600 hover:text-orange-800 font-medium"
      >
        {showCreateUser ? 'Cancel' : '+ Create New User'}
      </button>
    </div>
    
    {showCreateUser && (
      <div className="grid sm:grid-cols-3 gap-4 mt-3">
        <InputField
          label="Username"
          name="newUsername"
          value={newUserData.username}
          placeholder="Enter username"
          handleChange={handleNewUserChange}
          required={isCreatingUser}
        />
        
        <InputField
          label="Email"
          name="newEmail"
          value={newUserData.email}
          placeholder="Enter email"
          handleChange={handleNewUserChange}
          type="email"
          required={isCreatingUser}
        />
        
        <InputField
          label="Password"
          name="newPassword"
          value={newUserData.password}
          placeholder="Enter password"
          handleChange={handleNewUserChange}
          type="password"
          required={isCreatingUser}
        />
      </div>
    )}
  </div>
);

export default function MyModal({ isOpen, closeModal }) {
  const defaultDate = new Date().toLocaleDateString('en-US');
  const defaultTimeZone = '(UTC+5:30) Chennai,kolkata,mumbai, New Delhi';
  const defaultCurrency = 'INR';
  const { user } = useAuth();
  
  // --- STATE FOR API DATA AND STATUS ---
  const [options, setOptions] = useState(initialOptions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [registerByType, setRegisterByType] = useState(null);

  // --- STATE FOR USER SEARCH ---
  const [userSearch, setUserSearch] = useState('');
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [users, setUsers] = useState([]);

  // --- STATE FOR NEW FEATURES ---
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // --- STATE FOR FORM DATA ---
  const [formData, setFormData] = useState({
    SelectedUser: '',
    LoggerId: '',
    Product: '',
    ModelOfProduct: '',
    NameOfPlant: '',
    TimeZone: defaultTimeZone,
    InstallationType: '',
    SystemType: '',
    InstalledCapacityKwp: '',
    OperatingDate: defaultDate,
    Currency: defaultCurrency,
    UnitCostInrKwh: '',
    TotalCostInr: '',
    RegisterByType: '',
    RegisterByID: ''
  });

  // Debounce the search term
  const debouncedSearch = useDebounce(userSearch, 300);

  // Fetch users with search
  const fetchUsers = useCallback(async (searchTerm = '') => {
    try {
      setIsSearchingUsers(true);
      const response = await fetch(`${url}/users/usersList?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const usersData = await response.json();
      
      // Transform users for dropdown
      const userOptions = usersData.map(user => ({
        value: user.CustomerID || user.ID,
        label: user.CustomerName || user.Email,
        email: user.Email
      }));
      
      setUsers(userOptions);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setIsSearchingUsers(false);
    }
  }, []);

  // Fetch users when debounced search changes
  useEffect(() => {
    if (isOpen) {
      fetchUsers(debouncedSearch);
    }
  }, [debouncedSearch, isOpen, fetchUsers]);

  // Set user data immediately when user is available
  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      let userType = '';
      let userId = '';

      if (user.MerchantName) {
        userType = 'MERCHANT';
        userId = user.ID;
      } else {
        userType = 'ADMIN';
        userId = user.ID;
      }

      setRegisterByType(userType);
      setId(userId);
      
      setFormData(prevData => ({
        ...prevData,
        RegisterByType: userType || 'admin',
        RegisterByID: userId || 1
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prevData) => ({
      ...prevData,
      [name.replace('new', '').toLowerCase()]: value,
    }));
  };

  const handleUserSearch = (searchTerm) => {
    setUserSearch(searchTerm);
  };

  const toggleCreateUser = () => {
    setShowCreateUser(!showCreateUser);
    if (showCreateUser) {
      setNewUserData({ username: '', email: '', password: '' });
      setIsCreatingUser(false);
    } else {
      setIsCreatingUser(true);
    }
  };

  async function fetchOptions() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCreatePlantData();
      const data = response?.data;

      if (!data || !data.inverterModelList || !data.installationType || !data.systemType) {
        throw new Error('Incomplete data received from server.');
      }

      const productOptions = Array.from(
        new Set(
          data.inverterModelList.data.ModelList.map(item => item.InverterName)
        )
      );

      const modelOptions = data.inverterModelList.data.ModelList.map(item => item.ModelName);
      const installationOptions = data.installationType.data.InstallationTypeList.map(item => item.PlantType);
      const systemOptions = data.systemType.data.SystemTypeList.map(item => item.SystemType);

      setOptions({
        Product: productOptions,
        ModelOfProduct: modelOptions,
        InstallationType: installationOptions,
        SystemType: systemOptions,
        Users: users, // This will be populated separately
      });

    } catch (e) {
      console.error('Error fetching plant data:', e);
      setError('Failed to load form options. Please try again.');
      setOptions(initialOptions);
    } finally {
      setIsLoading(false);
    }
  }
 
  useEffect(() => {
    if (isOpen) {
      fetchOptions();
      // Fetch initial users when modal opens
      fetchUsers('');
    }
  }, [isOpen]);

  const getOptionsForSelect = (name) => {
    switch (name) {
      case 'Product':
        return options.Product;
      case 'ModelOfProduct':
        return options.ModelOfProduct;
      case 'InstallationType':
        return options.InstallationType;
      case 'SystemType':
        return options.SystemType;
      case 'SelectedUser':
        return users; // Use the separate users state
      default:
        return [];
    }
  }

  // Add a loading state for the submission process
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Function to validate form before submission
  const validateForm = () => {
    const requiredFields = [
      'Product', 
      'ModelOfProduct', 
      'NameOfPlant', 
      'InstallationType', 
      'SystemType', 
      'InstalledCapacityKwp',
      'SelectedUser',
      'LoggerId'
    ];
    
    const missingField = requiredFields.find(field => !formData[field]);

    if (missingField) {
      alert(`Please select/enter the ${missingField.replace(/([A-Z])/g, ' $1').trim()}`);
      return false;
    }

    if (isCreatingUser && showCreateUser) {
      const userRequiredFields = ['username', 'email', 'password'];
      const missingUserField = userRequiredFields.find(field => !newUserData[field]);
      
      if (missingUserField) {
        alert(`Please enter the new user's ${missingUserField}`);
        return false;
      }
    }

    if (!formData.RegisterByID || !formData.RegisterByType) {
      console.error('Missing registration data:', {
        RegisterByID: formData.RegisterByID,
        RegisterByType: formData.RegisterByType,
        user: user
      });
      alert('User authentication data is missing.');
      return false;
    }

    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitError(null);

  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);
  try {
    const submissionData = {
      ...formData,
      CustomerID: formData.SelectedUser, // This is the CustomerID
      LoggerId: formData.LoggerId,
      RegisterByType: formData.RegisterByType || registerByType,
      RegisterByID: formData.RegisterByID || id
    };

    if (isCreatingUser && showCreateUser) {
      submissionData.NewUser = newUserData;
    }

    if (!submissionData.RegisterByID || !submissionData.RegisterByType || !submissionData.CustomerID) {
      throw new Error('Registration data or CustomerID is missing after validation');
    }

    let res = await createPlant(submissionData);
    
    if (res?.created) {
      alert('Plant Created Successfully');
      closeModal();
      // Reset form
      setFormData({
        SelectedUser: '',
        LoggerId: '',
        Product: '',
        ModelOfProduct: '',
        NameOfPlant: '',
        TimeZone: defaultTimeZone,
        InstallationType: '',
        SystemType: '',
        InstalledCapacityKwp: '',
        OperatingDate: defaultDate,
        Currency: defaultCurrency,
        UnitCostInrKwh: '',
        TotalCostInr: '',
        RegisterByType: '',
        RegisterByID: ''
      });
      setNewUserData({ username: '', email: '', password: '' });
      setShowCreateUser(false);
      setIsCreatingUser(false);
      setUserSearch('');
    } else {
      setSubmitError(res?.error ? res.error : 'Failed to save plant information.');
    }
  } catch (e) {
    console.error('Submission error:', e);
    setSubmitError('A network error occurred while submitting.');
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-md sm:max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">

              {/* Header */}
              <div className="flex items-center space-x-2 pb-4 border-b">
                <button onClick={closeModal} className="text-gray-600 hover:text-gray-900">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-orange-900 flex-grow">
                  Create Plant
                </Dialog.Title>
              </div>

              {isLoading && (
                <div className="p-10 flex flex-col items-center justify-center text-indigo-600">
                  <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2 text-sm font-medium">Loading Plant Options...</p>
                </div>
              )}

              {error && (
                <div className="p-10 flex flex-col items-center justify-center text-red-600 bg-red-50 border border-red-200 rounded-md my-4">
                  <p className="text-lg font-medium">Error!</p>
                  <p className="mt-1 text-sm text-center">{error}</p>
                  <button
                    onClick={() => fetchOptions()}
                    className="mt-3 text-sm font-medium text-red-700 hover:text-red-900 underline"
                  >
                    Retry Loading Options
                  </button>
                </div>
              )}

              {!isLoading && !error && (
                <form onSubmit={handleSubmit} className="mt-4 grid sm:grid-cols-3 gap-4 bg-white">

                  {submitError && (
                    <div className="sm:col-span-3 text-center p-3 text-red-700 bg-red-100 border border-red-300 rounded-lg">
                      {submitError}
                    </div>
                  )}


                   <CreateUserSection
                    showCreateUser={showCreateUser}
                    toggleCreateUser={toggleCreateUser}
                    newUserData={newUserData}
                    handleNewUserChange={handleNewUserChange}
                    isCreatingUser={isCreatingUser}
                  />


                  {/* --- User Selection Section --- */}
                  <h4 className="sm:col-span-3 text-sm font-bold text-orange-500 pt-2 border-t mt-4">User Information</h4>

                  <div className="sm:col-span-3">
                    <SelectField
                      label="Select User"
                      name="SelectedUser"
                      value={formData.SelectedUser}
                      optionsList={getOptionsForSelect('SelectedUser')}
                      handleChange={handleChange}
                      isSearchable={true}
                      onSearch={handleUserSearch}
                      searchValue={userSearch}
                      isLoading={isSearchingUsers}
                      required
                    />
                    {formData.SelectedUser && (
                      <div className="mt-2 text-sm text-green-600">
                        Selected: {users.find(u => u.value === formData.SelectedUser)?.label}
                      </div>
                    )}
                  </div>

                  <InputField
                    label="Add Logger"
                    name="LoggerId"
                    value={formData.LoggerId}
                    placeholder="Enter logger ID"
                    handleChange={handleChange}
                    required
                  />

                  {/* Create User Section */}
                 

                  {/* Rest of the form remains the same */}
                  <h4 className="sm:col-span-3 text-sm font-bold text-orange-500 pt-2 border-t mt-4">Basic Info</h4>

                  <SelectField
                    label="Product"
                    name="Product"
                    value={formData.Product}
                    optionsList={getOptionsForSelect('Product')}
                    handleChange={handleChange}
                    required
                  />

                  <SelectField
                    label="Model of product"
                    name="ModelOfProduct"
                    value={formData.ModelOfProduct}
                    optionsList={getOptionsForSelect('ModelOfProduct')}
                    handleChange={handleChange}
                    required
                  />

                  <InputField
                    label="Name of plant"
                    name="NameOfPlant"
                    value={formData.NameOfPlant}
                    placeholder="Please enter"
                    handleChange={handleChange}
                    required
                  />

                  <InputField
                    label="Time Zone"
                    name="TimeZone"
                    value={formData.TimeZone}
                    handleChange={handleChange}
                    readOnly
                  />

                  {/* System Info Section */}
                  <h4 className="sm:col-span-3 text-sm font-bold text-orange-500 pt-2 border-t mt-4">System Info</h4>

                  <SelectField
                    label="Installation Type"
                    name="InstallationType"
                    value={formData.InstallationType}
                    optionsList={getOptionsForSelect('InstallationType')}
                    handleChange={handleChange}
                    required
                  />

                  <SelectField
                    label="System Type"
                    name="SystemType"
                    value={formData.SystemType}
                    optionsList={getOptionsForSelect('SystemType')}
                    handleChange={handleChange}
                    required
                  />

                  <InputField
                    label="Installed Capacity(kwp)"
                    name="InstalledCapacityKwp"
                    value={formData.InstalledCapacityKwp}
                    placeholder="Please enter"
                    handleChange={handleChange}
                    required
                    type='number'
                  />

                  <InputField
                    label="Operating Date"
                    name="OperatingDate"
                    value={formData.OperatingDate}
                    handleChange={handleChange}
                    readOnly
                  />

                  {/* Yield Info Section */}
                  <h4 className="sm:col-span-3 text-sm font-bold text-orange-500 pt-2 border-t mt-4">Yield Info</h4>

                  <InputField
                    label="Currency"
                    name="Currency"
                    value={formData.Currency}
                    handleChange={handleChange}
                    readOnly
                  />

                  <InputField
                    label="Unit Price(INR/kwh)"
                    name="UnitCostInrKwh"
                    value={formData.UnitCostInrKwh}
                    placeholder="Please enter"
                    handleChange={handleChange}
                    type='number'
                    required
                  />

                  <InputField
                    label="Total Cost(INR)"
                    name="TotalCostInr"
                    value={formData.TotalCostInr}
                    placeholder="Please enter"
                    handleChange={handleChange}
                    required
                    type='number'
                  />

                  {/* Action Button */}
                  <div className="pt-6 sm:col-span-3">
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className={`w-full mt-6 rounded-md border border-transparent px-4 py-3 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
                        ${isSubmitting || isLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                        }`}
                    >
                      {isSubmitting ? 'Saving...' : 'Done'}
                    </button>
                  </div>
                </form>
              )}
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

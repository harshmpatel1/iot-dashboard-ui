import { Fragment, useEffect, useState, useCallback } from 'react'
import { getCreatePlantData, createPlant } from '../api/mockApis'
import { useAuth } from '../hooks/useAuth';
import { url } from '../constants/serverInfo';
// Mock API functions - replace with your actual imports

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

// SelectField component
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
}) => {
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    if (isSearchable && onSearch && optionsList.length > 0 && searchValue) {
      setShowUserList(true);
    } else {
      setShowUserList(false);
    }
  }, [isSearchable, onSearch, optionsList.length, searchValue]);

  const handleUserSelect = (userValue) => {
    handleChange({ target: { name, value: userValue } });
    setShowUserList(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-orange-700">{label}</label>
      
      {isSearchable && onSearch ? (
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => optionsList.length > 0 && setShowUserList(true)}
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
      
      {showUserList && optionsList.length > 0 && (
        <div className="mt-1 max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg">
          {optionsList.map((user) => (
            <div
              key={user.value}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                value === user.value ? 'bg-orange-100 text-orange-700' : ''
              }`}
              onClick={() => handleUserSelect(user.value)}
            >
              <div className="font-medium">{user.label}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

// OTP Verification Component
const OTPVerification = ({ 
  email, 
  onVerify, 
  onResend, 
  isVerifying = false, 
  isResending = false,
  verificationError = null 
}) => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  const handleResend = () => {
    onResend();
    setTimeLeft(60);
    setCanResend(false);
    setOtp('');
  };

  return (
    <div className="border border-orange-200 rounded-lg p-4 bg-orange-50 mt-4">
      <h4 className="text-sm font-medium text-orange-800 mb-3">OTP Verification Required</h4>
      <p className="text-xs text-gray-600 mb-3">
        We've sent a 6-digit OTP to <span className="font-medium">{email}</span>. 
        Please enter it below to verify your account.
      </p>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-orange-700 mb-1">
            Enter OTP
          </label>
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            className="w-full px-3 py-2 text-sm border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {verificationError && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {verificationError}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
            className={`px-4 py-2 text-sm rounded-md font-medium ${
              otp.length === 6 && !isVerifying
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isVerifying ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-right">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-xs text-orange-600 hover:text-orange-800 font-medium disabled:text-gray-400"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            ) : (
              <span className="text-xs text-gray-500">
                Resend OTP in {timeLeft}s
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 1: User Selection/Creation Component
const UserStep = ({ 
  formData, 
  handleChange, 
  users, 
  userSearch, 
  handleUserSearch, 
  isSearchingUsers,
  showCreateUser, 
  toggleCreateUser, 
  newUserData, 
  handleNewUserChange,
  isCreatingUser,
  createdUserId,
  onNext,
  canProceedToNext,
  isVerifyingOTP = false,
  isResendingOTP = false,
  verificationError = null,
  onVerifyOTP = () => {},
  onResendOTP = () => {},
  isOTPVerified = false,
  onCreateUser = () => {}
}) => {
  const isExistingUserSelected = formData.SelectedUser && !showCreateUser;
  const canProceed = isExistingUserSelected || (showCreateUser && isOTPVerified);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-orange-900">Step 1: Select or Create User</h3>
        <p className="text-sm text-gray-600 mt-1">Choose an existing user or create a new one</p>
      </div>

      {/* Create User Section */}
      <div className="border rounded-lg p-4 bg-gray-50">
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
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                label="Username"
                name="newUsername"
                value={newUserData.username}
                placeholder="Enter username"
                handleChange={handleNewUserChange}
                required={true}
              />
              
              <InputField
                label="Email"
                name="newEmail"
                value={newUserData.email}
                placeholder="Enter email"
                handleChange={handleNewUserChange}
                type="email"
                required={true}
              />

              <InputField
                label="Mobile"
                name="newMobile"
                value={newUserData.mobile}
                placeholder="Enter mobile number"
                handleChange={handleNewUserChange}
                type="tel"
                required={true}
              />

              <InputField
                label="Password"
                name="newPassword"
                value={newUserData.password}
                placeholder="Enter password"
                handleChange={handleNewUserChange}
                type="password"
                required={true}
              />
            </div>

            {/* Create User Button - Show only if user not created yet */}
            {!createdUserId && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onCreateUser}
                  disabled={isCreatingUser || !newUserData.username || !newUserData.email || !newUserData.mobile || !newUserData.password}
                  className={`px-4 py-2 text-sm rounded-md font-medium ${
                    (!isCreatingUser && newUserData.username && newUserData.email && newUserData.mobile && newUserData.password)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isCreatingUser ? 'Creating User...' : 'Create User & Send OTP'}
                </button>
              </div>
            )}

            {/* OTP Verification for new user */}
            {createdUserId && !isOTPVerified && (
              <OTPVerification
                email={newUserData.email}
                onVerify={onVerifyOTP}
                onResend={onResendOTP}
                isVerifying={isVerifyingOTP}
                isResending={isResendingOTP}
                verificationError={verificationError}
              />
            )}

            {/* OTP Verified Success */}
            {isOTPVerified && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-green-700 font-medium">
                    Email verified successfully! You can now proceed to the next step.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Selection Section */}
      {!showCreateUser && (
        <div className="space-y-4">
          <SelectField
            label="Select User"
            name="SelectedUser"
            value={formData.SelectedUser}
            optionsList={users}
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
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-md font-medium ${
            canProceed
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Step 2: Logger Information Component
const LoggerStep = ({
  formData,
  handleChange,
  onBack,
  onNext,
  canProceedToNext
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-orange-900">Step 2: Add Logger</h3>
        <p className="text-sm text-gray-600 mt-1">Configure the logger for the plant</p>
      </div>

      <InputField
        label="Add Logger"
        name="LoggerId"
        value={formData.LoggerId}
        placeholder="Enter logger ID"
        handleChange={handleChange}
        required
      />

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceedToNext}
          className={`px-6 py-2 rounded-md font-medium ${
            canProceedToNext
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Step 3: Plant Details Component
const PlantDetailsStep = ({
  formData,
  handleChange,
  options,
  getOptionsForSelect,
  onBack,
  onSubmit,
  isSubmitting
}) => {
  const defaultDate = new Date().toLocaleDateString('en-US');
  const defaultTimeZone = '(UTC+5:30) Chennai,kolkata,mumbai, New Delhi';
  const defaultCurrency = 'INR';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-orange-900">Step 3: Plant Details</h3>
        <p className="text-sm text-gray-600 mt-1">Configure the plant specifications</p>
      </div>

      <form onSubmit={onSubmit} className="grid sm:grid-cols-3 gap-4">
        <h4 className="sm:col-span-3 text-sm font-bold text-orange-500 pt-2 border-t">Basic Info</h4>

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
          value={formData.TimeZone || defaultTimeZone}
          handleChange={handleChange}
          readOnly
        />

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
          value={formData.OperatingDate || defaultDate}
          handleChange={handleChange}
          readOnly
        />

        <h4 className="sm:col-span-3 text-sm font-bold text-orange-500 pt-2 border-t mt-4">Yield Info</h4>

        <InputField
          label="Currency"
          name="Currency"
          value={formData.Currency || defaultCurrency}
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

        <div className="sm:col-span-3 flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-md font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {isSubmitting ? 'Creating Plant...' : 'Create Plant'}
          </button>
        </div>
      </form>
    </div>
  );
};









// Main Component
export default function CreatePlantPage() {
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [options, setOptions] = useState(initialOptions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [id, setId] = useState(null);
  const [registerByType, setRegisterByType] = useState(null);
  const [productTypeList, setProductTypeList] = useState([]);

  const [userSearch, setUserSearch] = useState('');
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createdUserId, setCreatedUserId] = useState(null);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    mobile: ''
  });

  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(null);

  const [formData, setFormData] = useState({
    SelectedUser: '',
    LoggerId: '',
    Product: '',
    ModelOfProduct: '',
    NameOfPlant: '',
    TimeZone: '',
    InstallationType: '',
    SystemType: '',
    InstalledCapacityKwp: '',
    OperatingDate: '',
    Currency: '',
    UnitCostInrKwh: '',
    TotalCostInr: '',
    RegisterByType: '',
    RegisterByID: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const debouncedSearch = useDebounce(userSearch, 300);

  const fetchUsers = useCallback(async (searchTerm = '') => {
    try {
      setIsSearchingUsers(true);
      console.log("searching term",searchTerm)
      const response = await fetch(`${url}/users/usersList?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const usersData = await response.json();
      
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

  useEffect(() => {
    if (currentStep === 1) {
      fetchUsers(debouncedSearch);
    }
  }, [debouncedSearch, currentStep, fetchUsers]);

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      let userType = '';
      let userId = '';

      if (user.MerchantName) {
        userType = 'MERCHANT';
        userId = user.ID;
      } else {
        userType = 'ADMIN';
        userId = user.ID || 1;
      }

      setRegisterByType(userType);
      setId(userId);
      
      setFormData(prevData => ({
        ...prevData,
        RegisterByType: userType,
        RegisterByID: userId
      }));
    }
  }, [user]);


  useEffect(() => {
    const producttype=async()=>{
      try{
        const productTypeRes=await fetch(`${url}/plants/edit-palnt/product-type`)
        const typeJson = await productTypeRes.json();
        // console.log("listtt",productTypeRes)
                const inverterList = typeJson?.data?.InverterList || [];

                setProductTypeList(inverterList.map(item => item.InverterName));
                // console.log("listtt",inverterList.map(item => item.InverterName))
                

      }catch(err){
        console.warn(err)
      }

    }
  producttype()
    
  }, [])
  

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

  console.log('formData.SelectedUser', formData.SelectedUser);
  console.log("searchTerm", userSearch);

  const toggleCreateUser = () => {
    setShowCreateUser(!showCreateUser);
    if (showCreateUser) {
      setNewUserData({ username: '', email: '', password: '', mobile: '' });
      setIsCreatingUser(false);
      setCreatedUserId(null);
      setIsOTPVerified(false);
      setVerificationError(null);
    }
  };

  const createUser = async () => {
    try {
      setIsCreatingUser(true);
      setVerificationError(null);
      
      const userData = {
        CustomerName: newUserData.username,
        CustomerEmail: newUserData.email,
        CustomerMobile: newUserData.mobile,
        isactive: true,
        Password: newUserData.password
      };

      const response = await fetch(`${url}/users/createUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if(!response.ok && response.status == 409) {
        setSubmitError('Email Already Registered')
        return;
        // throw new Error('User allready registered!') 
      }
      if (!response.ok) throw new Error('Failed to create user');

      const result = await response.json();
      
      if (result.success && result.created) {
        const newUserId = result.userId;
        setCreatedUserId(newUserId);
        setFormData(prev => ({ ...prev, SelectedUser: newUserId }));
        return newUserId;
      } else {
        throw new Error(result.message || 'Failed to create user');
      }
    } catch (err) {
      alert(err.message);
      console.error('Error creating user:', err);
      setVerificationError(err.message || 'Failed to create user');
      return null;
    } finally {
      setIsCreatingUser(false);
    }
  };

  const verifyOTP = async (otp) => {
    try {
      setIsVerifyingOTP(true);
      setVerificationError(null);

      const response = await fetch(`${url}/users/verifyOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserData.email,
          otp: otp
        }),
      });

      const result = await response.json();

      if (result.success && result.verified) {
        setIsOTPVerified(true);
        setVerificationError(null);
      } else {
        setVerificationError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setVerificationError('Failed to verify OTP. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const resendOTP = async () => {
    try {
      setIsResendingOTP(true);
      setVerificationError(null);

      const response = await fetch(`${url}/users/resendOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserData.email
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setVerificationError(result.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
      setVerificationError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResendingOTP(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const canProceed = formData.SelectedUser && (showCreateUser ? isOTPVerified : true);
      if (!canProceed) {
        if (showCreateUser && createdUserId && !isOTPVerified) {
          setVerificationError('Please verify your email with OTP before proceeding.');
        } else if (showCreateUser && !createdUserId) {
          alert('Please create the user first by clicking "Create User & Send OTP"');
        } else {
          alert('Please select a user or create and verify a new user');
        }
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.LoggerId) {
        alert('Please enter Logger ID');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.SelectedUser && (showCreateUser ? isOTPVerified : true);
      case 2:
        return formData.LoggerId;
      default:
        return true;
    }
  };

  async function fetchOptions() {
    setIsLoading(true);
    setError(null);
    try {
      const productType=formData?.Product || "GTI"
      const response = await getCreatePlantData(productType);
      const data = response?.data;
      console.log("models",data)

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
        Users: users,
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
    fetchOptions();
    fetchUsers('');
  }, [formData.Product]);

  const getOptionsForSelect = (name) => {
    switch (name) {
      case 'Product':
        return productTypeList;
      case 'ModelOfProduct':
        return options.ModelOfProduct;
      case 'InstallationType':
        return options.InstallationType;
      case 'SystemType':
        return options.SystemType;
      case 'SelectedUser':
        return users;
      default:
        return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!formData.RegisterByID || !formData.RegisterByType || !formData.SelectedUser) {
      alert('Registration data is missing.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        ...formData,
        CustomerID: formData.SelectedUser,
        LoggerId: formData.LoggerId,
        RegisterByType: formData.RegisterByType || registerByType,
        RegisterByID: formData.RegisterByID || id
      };

      let res = await createPlant(submissionData);
      
      if (res?.created) {
        setSuccessMessage('Plant Created Successfully!');
        setFormData({
          SelectedUser: '',
          LoggerId: '',
          Product: '',
          ModelOfProduct: '',
          NameOfPlant: '',
          TimeZone: '',
          InstallationType: '',
          SystemType: '',
          InstalledCapacityKwp: '',
          OperatingDate: '',
          Currency: '',
          UnitCostInrKwh: '',
          TotalCostInr: '',
          RegisterByType: formData.RegisterByType,
          RegisterByID: formData.RegisterByID
        });
        setNewUserData({ username: '', email: '', password: '', mobile: '' });
        setShowCreateUser(false);
        setCreatedUserId(null);
        setIsOTPVerified(false);
        setVerificationError(null);
        setCurrentStep(1);
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

  const resetForm = () => {
    setFormData({
      SelectedUser: '',
      LoggerId: '',
      Product: '',
      ModelOfProduct: '',
      NameOfPlant: '',
      TimeZone: '',
      InstallationType: '',
      SystemType: '',
      InstalledCapacityKwp: '',
      OperatingDate: '',
      Currency: '',
      UnitCostInrKwh: '',
      TotalCostInr: '',
      RegisterByType: formData.RegisterByType,
      RegisterByID: formData.RegisterByID
    });
    setNewUserData({ username: '', email: '', password: '', mobile: '' });
    setShowCreateUser(false);
    setCreatedUserId(null);
    setIsOTPVerified(false);
    setVerificationError(null);
    setCurrentStep(1);
    setSuccessMessage(null);
    setSubmitError(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UserStep
            formData={formData}
            handleChange={handleChange}
            users={users}
            userSearch={userSearch}
            handleUserSearch={handleUserSearch}
            isSearchingUsers={isSearchingUsers}
            showCreateUser={showCreateUser}
            toggleCreateUser={toggleCreateUser}
            newUserData={newUserData}
            handleNewUserChange={handleNewUserChange}
            isCreatingUser={isCreatingUser}
            createdUserId={createdUserId}
            onNext={nextStep}
            canProceedToNext={canProceedToNext()}
            isVerifyingOTP={isVerifyingOTP}
            isResendingOTP={isResendingOTP}
            verificationError={verificationError}
            onVerifyOTP={verifyOTP}
            onResendOTP={resendOTP}
            isOTPVerified={isOTPVerified}
            onCreateUser={createUser}
          />
        );
      case 2:
        return (
          <LoggerStep
            formData={formData}
            handleChange={handleChange}
            onBack={prevStep}
            onNext={nextStep}
            canProceedToNext={canProceedToNext()}
          />
        );
      case 3:
        return (
          <PlantDetailsStep
            formData={formData}
            handleChange={handleChange}
            options={options}
            getOptionsForSelect={getOptionsForSelect}
            onBack={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-900">Create New Plant</h1>
          <p className="text-gray-600 mt-2">Complete the following steps to create a new solar plant</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <Fragment key={step}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-1 ${
                      currentStep > step ? 'bg-orange-600' : 'bg-gray-300'
                    }`} />
                  )}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-orange-900">
              Step {currentStep} of 3 - {
                currentStep === 1 ? 'User Selection' :
                currentStep === 2 ? 'Logger Setup' :
                'Plant Details'
              }
            </h2>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-green-700 font-medium">{successMessage}</p>
                <button
                  onClick={resetForm}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Create Another Plant
                </button>
              </div>
            </div>
          )}

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
            <div className="p-6 flex flex-col items-center justify-center text-red-600 bg-red-50 border border-red-200 rounded-md my-4">
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

          {submitError && (
            <div className="text-center p-3 text-red-700 bg-red-100 border border-red-300 rounded-lg mb-4">
              {submitError}
            </div>
          )}

          {!isLoading && !error && !successMessage && renderStep()}
        </div>
      </div>
    </div>
  );
}
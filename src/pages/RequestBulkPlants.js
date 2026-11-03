import React, { useState, useCallback } from 'react';
import { CloudUpload, XCircle, CheckCircle, AlertTriangle, Send } from 'lucide-react';
import { url } from '../constants/serverInfo';
import { useAuth } from '../hooks/useAuth';

// API Endpoints for different user roles
const API_URL_REQ = `${url}/plantAuth/makeAuthReq`;
const API_URL = `${url}/plantAuth/makeAuth`;

// --- Main App Component ---
const App = () => {
  const [file, setFile] = useState(null);
  const { user } = useAuth();
  console.log('user', user);
  const [extractedData, setExtractedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  // --- Constants ---
  const MAX_ROWS = 302;
  const REQUIRED_COLUMNS = 3;

  /**
   * Determines which API URL to use based on user role
   */
  const getApiUrl = () => {
    return user?.role === 'admin' ? API_URL : API_URL_REQ;
  };

  /**
   * Determines the submission message based on user role
   */
  const getSubmissionMessage = () => {
    if (user?.role === 'admin') {
      return 'Direct authorization completed by admin.';
    } else {
      return 'Authorization request sent to user device for approval.';
    }
  };

  /**
   * Resets submission state and reads the file content.
   */
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      // Basic file type check
      if (uploadedFile.type !== 'text/csv' && !uploadedFile.name.endsWith('.csv')) {
        setValidationErrors(['Invalid file type. Please upload a CSV file (.csv).']);
        setFile(null);
        setExtractedData(null);
        setApiResponse(null); // Reset API response
        return;
      }
      setFile(uploadedFile);
      setExtractedData(null);
      setValidationErrors(null);
      setApiResponse(null); // Reset API response
    }
  };

  /**
   * Validates a single row of data based on the strict requirements.
   * @param {Array<string>} cells - An array of strings representing the cells in the row.
   * @param {number} rowIndex - The index of the row (1-based for display).
   * @returns {string | null} - An error message or null if the row is valid.
   */
  const validateRow = (cells, rowIndex) => {
    // 1. Column Count Check (must be exactly 3)
    if (cells.length !== REQUIRED_COLUMNS) {
      return `Row ${rowIndex}: Requires exactly ${REQUIRED_COLUMNS} columns, but found ${cells.length}.`;
    }

    const [col1, col2, col3] = cells.map(cell => cell.trim());

    // 2. Data Null/Empty Check
    if (!col1 || !col2 || !col3) {
      return `Row ${rowIndex}: All three columns must have data (found empty/null value).`;
    }

    // 3. Column 1: Must be a number (This will be merchantId)
    const num1 = Number(col1);
    if (isNaN(num1) || !Number.isInteger(num1)) { // Added check for integer as IDs usually are
      return `Row ${rowIndex}, Column 1 (merchantId): Must be an integer number. Found "${col1}".`;
    }

    // 4. Column 2: Must be a number (This will be plantId)
    const num2 = Number(col2);
    if (isNaN(num2) || !Number.isInteger(num2)) { // Added check for integer as IDs usually are
      return `Row ${rowIndex}, Column 2 (plantId): Must be an integer number. Found "${col2}".`;
    }

    // 5. Column 3: Must be "merchant" or "admin" (case-sensitive)
    if (col3 !== 'merchant' && col3 !== 'admin') {
      return `Row ${rowIndex}, Column 3 (role): Must be "merchant" or "admin". Found "${col3}".`;
    }

    return null; // Row is valid
  };

  /**
   * Main function to read, parse, and validate the CSV file.
   */
  const processFile = useCallback(() => {
    if (!file) {
      setValidationErrors(['Please select a CSV file first.']);
      return;
    }

    setIsLoading(true);
    setExtractedData(null);
    setValidationErrors(null);
    setApiResponse(null); // Reset API response

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      // Split content by newline to get rows
      let rows = content.split(/\r?\n/).filter(line => line.trim() !== '');

      if (rows.length === 0) {
        setValidationErrors(['The selected file is empty.']);
        setIsLoading(false);
        return;
      }

      // Assume first row is header, validation starts from row 2 (index 1)
      const dataRows = rows.slice(1);
      const rowCount = dataRows.length;

      // --- Global Validation 1: Max Row Count ---
      if (rowCount > MAX_ROWS) {
        setValidationErrors([`File exceeds maximum row limit. Found ${rowCount} data rows, but the limit is ${MAX_ROWS}.`]);
        setIsLoading(false);
        return;
      }

      const allRowErrors = [];
      const validObjects = [];

      // Iterate over data rows
      dataRows.forEach((row, index) => {
        // Simple comma-separated split (assumes no commas within fields)
        const cells = row.split(',');
        const displayRowIndex = index + 2; // Row number in file (1-based, skipping header)

        const error = validateRow(cells, displayRowIndex);

        if (error) {
          allRowErrors.push(error);
        } else {
          // If valid, create the object with the API's expected keys
          const [col1, col2, col3] = cells.map(cell => cell.trim());
          validObjects.push({
            merchantId: Number(col1), // Column 1: merchantId
            plantId: col2,    // Column 2: plantId (ID in your UPDATE query)
            role: col3,               // Column 3: role
          });
        }
      });

      if (allRowErrors.length > 0) {
        setValidationErrors(allRowErrors);
        setExtractedData(null);
      } else {
        setExtractedData(validObjects);
        setValidationErrors(null);
      }

      setIsLoading(false);
    };

    reader.onerror = (e) => {
      console.error('File reading error:', e);
      setValidationErrors(['Error reading the file. Please try again.']);
      setIsLoading(false);
    };

    reader.readAsText(file);
  }, [file]);

  /**
   * Submits the extracted and validated data to the backend API.
   */
  const handleSubmit = useCallback(async () => {
    if (!extractedData || extractedData.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setApiResponse(null);

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any necessary authorization headers here
        },
        body: JSON.stringify(extractedData),
      });

      const data = await response.json();

      if (response.ok) {
        // HTTP 200 range
        setApiResponse({
          success: true,
          message: data.message || getSubmissionMessage(),
          details: `Processed ${data.count || extractedData.length} records. ${user?.role === 'admin' ? 'Changes applied directly.' : 'Request sent for approval.'}`,
          roleSpecific: user?.role === 'admin' 
            ? `Rows affected: ${data.rowsAffected ? data.rowsAffected.reduce((a, b) => a + b, 0) : 'N/A'}`
            : 'Pending user authorization'
        });
      } else {
        // HTTP error range (4xx, 5xx)
        setApiResponse({
          success: false,
          message: data.message || `API Error: Status ${response.status}`,
          details: data.error || 'Server reported an error. All changes were rolled back.',
        });
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      setApiResponse({
        success: false,
        message: 'Network error or unable to reach the server.',
        details: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [extractedData, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-8 font-['Inter']">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-6 md:p-10">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-2">
          Bulk Authorization Update
        </h1>

        {/* User Role Info */}
        {user && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
            user.role === 'admin' 
              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            <p>
              Logged in as: <span className="font-bold capitalize">{user.role}</span>
              {user.role === 'admin' 
                ? ' - You have direct authorization privileges'
                : ' - Authorization requests will be sent for approval'
              }
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-200">
          <p className="font-semibold text-indigo-800 mb-2 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-indigo-600" />
            File Format Requirements (Max {MAX_ROWS} Rows)
          </p>
          <ul className="list-disc list-inside text-sm text-indigo-700 space-y-1 ml-4">
            <li>File must be a **CSV** (Comma Separated Values).</li>
            <li>Max **{MAX_ROWS} data rows** (excluding header).</li>
            <li>Must have exactly **3 columns** in this order:</li>
            <ul className="list-circle list-inside ml-6 mt-1">
              <li>Column 1: **Merchant ID** (Integer Number, e.g., `101`).</li>
              <li>Column 2: **MAC Address** (Integer Number, e.g., `2050`).</li>
              <li>Column 3: **Role** (Text: **"merchant"** or **"admin"**).</li>
            </ul>
            <li>**No cell can be empty or null.**</li>
          </ul>
        </div>

        {/* File Input and Validation Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <label className="flex flex-col items-center justify-center w-full sm:w-2/3 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-300">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <CloudUpload className="w-6 h-6 text-gray-500 mb-1" />
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">{file ? file.name : 'CSV file only'}</p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <button
            onClick={processFile}
            disabled={!file || isLoading || isSubmitting}
            className={`w-full sm:w-1/3 py-3 px-4 text-white font-semibold rounded-lg shadow-md transition duration-300 transform ${
              !file || isLoading || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 hover:scale-[1.01] active:scale-[0.99] shadow-green-400/50'
            }`}
          >
            {isLoading ? 'Processing...' : 'Validate & Prepare Data'}
          </button>
        </div>

        {/* Validation Results */}
        {validationErrors && validationErrors.length > 0 && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-bold flex items-center mb-2">
              <XCircle className="w-5 h-5 mr-2" />
              Validation Failed: {validationErrors.length} Errors
            </p>
            <ul className="text-sm list-disc list-inside max-h-48 overflow-y-auto">
              {validationErrors.slice(0, 10).map((error, index) => (
                <li key={index} className="truncate">{error}</li>
              ))}
              {validationErrors.length > 10 && (
                <li>... and {validationErrors.length - 10} more errors.</li>
              )}
            </ul>
          </div>
        )}

        {/* Successful Validation and Submission Button */}
        {extractedData && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg w-full md:w-2/3">
              <p className="font-bold flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Validation Successful!
              </p>
              <p className="text-sm mt-1">
                Successfully prepared **{extractedData.length}** valid records for submission.
              </p>
              <p className="text-xs mt-2 font-medium">
                {user?.role === 'admin' 
                  ? 'As an admin, this will apply changes directly.' 
                  : 'This will send authorization requests for approval.'}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full md:w-1/3 py-3 px-4 text-white font-semibold rounded-lg shadow-lg transition duration-300 transform ${
                isSubmitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] shadow-blue-400/50'
              }`}
            >
              <div className="flex items-center justify-center">
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </div>
            </button>
          </div>
        )}

        {/* API Response Display */}
        {apiResponse && (
          <div className={`p-4 rounded-lg mb-6 border-l-4 ${
            apiResponse.success
              ? 'bg-green-100 border-green-500 text-green-700'
              : 'bg-red-100 border-red-500 text-red-700'
          }`}>
            <p className="font-bold flex items-center mb-1">
              {apiResponse.success ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
              {apiResponse.success ? 'Submission Complete' : 'Submission Failed'}
            </p>
            <p className="text-sm font-semibold">{apiResponse.message}</p>
            <p className="text-xs mt-1 italic">{apiResponse.details}</p>
            {apiResponse.roleSpecific && (
              <p className="text-xs mt-1 font-medium">{apiResponse.roleSpecific}</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
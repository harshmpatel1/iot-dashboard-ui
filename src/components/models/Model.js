import { Dialog, Transition, Switch } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { createMerchant } from '../../api/mockApis';

// Custom component for displaying error/success messages (replacing alert())
const MessageDisplay = ({ message, type }) => {
    if (!message) return null;
    const baseClasses = "mt-4 p-3 rounded-lg font-medium text-sm text-center shadow-md";
    const successClasses = "bg-green-100 text-green-800 border border-green-300";
    const errorClasses = "bg-red-100 text-red-800 border border-red-300";

    return (
        <div className={`${baseClasses} ${type === 'success' ? successClasses : errorClasses}`}>
            {message}
        </div>
    );
};

export default function MyModal({ isOpen, closeModal ,e_id }) {
    const [formData, setFormData] = useState({
        MerchantName: '',
        MerchantEmail: '',
        MerchantMobile: '',
        isactive: true, // Default to active
        Password: '',
        E_id:e_id,
    });
    const [errorMessage, setErrorMessage] = useState(''); // State for displaying specific errors
    const [successMessage, setSuccessMessage] = useState(''); // State for success message
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Clear messages on user input
        setErrorMessage('');
        setSuccessMessage('');
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handler for the 'isactive' toggle switch
    const handleActiveChange = (checked) => {
        setFormData((prevData) => ({
            ...prevData,
            isactive: checked,
        }));
    };

    // What happens when you click the "Submit" button
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous messages
        setSuccessMessage('');
        setIsLoading(true);

        try {
            // Call the integrated API function
            let res = await createMerchant({ ...formData });

            if (res.created) {
                setSuccessMessage('Merchant Created Successfully!');
                // Optionally clear form after success
                setFormData({ MerchantName: '', MerchantEmail: '', MerchantMobile: '', isactive: true, Password: '',E_id:e_id, });
                // You might choose to call closeModal() after a short delay
            } else if (res.error) {
                // Display the specific error message returned from the API (e.g., unique name/email)
                setErrorMessage(res.error);
            } else {
                setErrorMessage('Failed to create merchant due to an unknown error.');
            }
        } catch (e) {
            // Catch catastrophic errors like network failure
            setErrorMessage(e.message || 'Cannot create Merchant. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                            <Dialog.Title as="h3" className="text-2xl text-center font-extrabold leading-6 text-orange-800 border-b pb-2 border-orange-200">
                                Create New Merchant
                            </Dialog.Title>

                            {/* Display Messages */}
                            <MessageDisplay message={errorMessage} type="error" />
                            <MessageDisplay message={successMessage} type="success" />

                            <form onSubmit={handleSubmit} className="mt-6 space-y-5 bg-white">

                                {/* Merchant Name */}
                                <div>
                                    <label htmlFor="MerchantName" className="block text-sm font-semibold text-orange-700">Merchant Name (Unique)</label>
                                    <input
                                        id="MerchantName"
                                        type="text"
                                        name="MerchantName"
                                        value={formData.MerchantName}
                                        onChange={handleChange}
                                        className="mt-1 px-3 py-2 block w-full border border-orange-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition duration-150 ease-in-out h-[38px]"
                                        placeholder="e.g., UniqueUserName"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="MerchantEmail" className="block text-sm font-semibold text-orange-700">Email (Unique)</label>
                                    <input
                                        id="MerchantEmail"
                                        type="email"
                                        name="MerchantEmail"
                                        value={formData.MerchantEmail}
                                        onChange={handleChange}
                                        className="mt-1 px-3 py-2 block w-full border border-orange-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition duration-150 ease-in-out h-[38px]"
                                        placeholder="e.g., unique@merchant.com"
                                        required
                                    />
                                </div>

                                {/* Mobile */}
                                <div>
                                    <label htmlFor="MerchantMobile" className="block text-sm font-semibold text-orange-700">Mobile</label>
                                    <input
                                        id="MerchantMobile"
                                        type="tel"
                                        name="MerchantMobile"
                                        value={formData.MerchantMobile}
                                        onChange={handleChange}
                                        className="mt-1 px-3 py-2 block w-full border border-orange-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition duration-150 ease-in-out h-[38px]"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label htmlFor="Password" className="block text-sm font-semibold text-orange-700">Password</label>
                                    <input
                                        id="Password"
                                        type="password"
                                        name="Password"
                                        value={formData.Password}
                                        onChange={handleChange}
                                        className="mt-1 px-3 py-2 block w-full border border-orange-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition duration-150 ease-in-out h-[38px]"
                                        required
                                    />
                                </div>

                                {/* Is Active Toggle */}
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-sm font-semibold text-orange-700">Is Active</span>
                                    <Switch
                                        checked={formData.isactive}
                                        onChange={handleActiveChange}
                                        className={`${formData.isactive ? 'bg-orange-600' : 'bg-orange-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
                                    >
                                        <span className="sr-only">Toggle Active Status</span>
                                        <span
                                            aria-hidden="true"
                                            className={`${formData.isactive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </Switch>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-8 flex justify-end space-x-4 border-t pt-4 border-orange-200">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-lg border border-orange-300 bg-white px-5 py-2 text-sm font-medium text-orange-700 shadow-sm hover:bg-orange-50 transition duration-150"
                                        onClick={closeModal}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex justify-center rounded-lg border border-transparent bg-orange-600 px-5 py-2 text-sm font-medium text-white shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition duration-150 disabled:opacity-50"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating...' : 'Create Merchant'}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
import React, { useState, useEffect, useRef } from 'react';

const DeleteConfirmationModal = ({ isOpen, closeModal, merchantName, onConfirm }) => {
  const [confirmationText, setConfirmationText] = useState('');
  // Use a case-insensitive check for a slight usability improvement
  const isConfirmed = confirmationText.trim().toLowerCase() === merchantName.trim().toLowerCase();
  const inputRef = useRef(null);

  // Focus management and Escape key handler
  useEffect(() => {
    if (isOpen) {
      // Auto-focus the input when the modal opens
      inputRef.current?.focus();

      const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
          handleClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      handleClose(); // Call handleClose to clear state and close the modal
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    closeModal();
  };

  return (
    // Backdrop with ARIA attributes
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true">
      {/* Modal content container */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 transform transition-all p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          {/* Danger Icon (Optional, but good visual cue) */}
          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.398 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-gray-900" id="modal-title">
            Permanently Delete {merchantName}?
          </h3>
        </div>

        {/* Body */}
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            This action **cannot be undone**. All data associated with **{merchantName}** will be immediately deleted.
          </p>
          <p className="mt-3 text-sm font-medium text-gray-700">
            To proceed, please confirm by typing the full name: 
            <strong className='block mt-1 p-2 bg-red-50 text-red-700 rounded-md select-all font-mono tracking-wider'>
              {merchantName}
            </strong>
          </p>
        </div>
        
        {/* Input Field */}
        <div className="mt-4">
          <label htmlFor="confirm-delete" className="sr-only">Type {merchantName} to confirm</label>
          <input
            ref={inputRef} // Set the ref here
            id="confirm-delete"
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={merchantName}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:ring-red-500 focus:border-red-500 transition-colors"
            autoComplete="off" // Prevent browser from filling this in
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 space-y-reverse">
          <button
            onClick={handleClose}
            type="button"
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmed}
            type="button"
            className={`w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:text-sm transition-colors ${
                !isConfirmed
                ? 'bg-red-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
            }`}
          >
            I Understand, Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
import React from 'react';
import { X, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
          icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
          headerClass: 'border-red-800'
        };
      case 'warning':
        return {
          confirmButton: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-gray-900',
          icon: <AlertCircle className="h-6 w-6 text-amber-500" />,
          headerClass: 'border-amber-800'
        };
      case 'info':
        return {
          confirmButton: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
          icon: <Info className="h-6 w-6 text-blue-500" />,
          headerClass: 'border-blue-800'
        };
      default:
        return {
          confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
          icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
          headerClass: 'border-red-800'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75" aria-hidden="true"></div>

        {/* Modal panel */}
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-gray-900 rounded-lg shadow-xl border border-gray-800 sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className={`px-4 pt-5 pb-4 bg-gray-900 sm:p-6 sm:pb-4 border-b ${styles.headerClass}`}>
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-gray-800 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                {styles.icon}
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium leading-6 text-gray-100" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-400">
                    {message}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
                onClick={onCancel}
              >
                <span className="sr-only">Close</span>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-800 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 font-medium sm:ml-3 sm:w-auto sm:text-sm ${styles.confirmButton}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
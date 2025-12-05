/**
 * App Registration Dialog
 *
 * UI for setting up Azure App Registration with automatic credential import.
 *
 * Pattern from GUI/Views/MainWindow.xaml.cs:AppRegistrationButton_Click
 */

import React, { useState, useEffect } from 'react';

import { useAppRegistration } from '../../hooks/useAppRegistration';
import LoadingSpinner from '../atoms/LoadingSpinner';

import { Modal } from './Modal';

interface AppRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyName?: string;
}

export const AppRegistrationDialog: React.FC<AppRegistrationDialogProps> = ({
  isOpen,
  onClose,
  defaultCompanyName = ''
}) => {
  const {
    state,
    launchAppRegistration,
    checkExistingCredentials,
    importExistingCredentials,
    stopMonitoring,
    reset
  } = useAppRegistration();

  // Form state
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [showWindow, setShowWindow] = useState(true);
  const [autoInstallModules, setAutoInstallModules] = useState(true);
  const [secretValidityYears, setSecretValidityYears] = useState(2);
  const [skipAzureRoles, setSkipAzureRoles] = useState(false);

  // Existing credentials state
  const [hasExistingCredentials, setHasExistingCredentials] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Check for existing credentials when company name changes
  useEffect(() => {
    if (companyName.trim()) {
      setCheckingExisting(true);
      checkExistingCredentials(companyName.trim())
        .then(setHasExistingCredentials)
        .finally(() => setCheckingExisting(false));
    } else {
      setHasExistingCredentials(false);
    }
  }, [companyName, checkExistingCredentials]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      reset();
      if (!defaultCompanyName) {
        setCompanyName('');
      }
    }
  }, [isOpen, reset, defaultCompanyName]);

  const handleLaunch = () => {
    if (!companyName.trim()) {
      return;
    }

    launchAppRegistration({
      companyName: companyName.trim(),
      showWindow,
      autoInstallModules,
      secretValidityYears,
      skipAzureRoles
    });
  };

  const handleImportExisting = () => {
    if (!companyName.trim()) {
      return;
    }

    importExistingCredentials(companyName.trim());
  };

  const handleClose = () => {
    if (state.isMonitoring) {
      stopMonitoring();
    }
    onClose();
  };

  const isFormDisabled = state.isRunning || state.isMonitoring;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Azure App Registration Setup"
      size="md"
    >
      <div className="space-y-6">
        {/* Success Message */}
        {state.success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  App Registration Complete
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Azure credentials have been imported successfully and are ready to use.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {(state.isRunning || state.isMonitoring) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <LoadingSpinner size="sm" />
              <div className="ml-3">
                <p className="text-sm text-blue-800">{state.progress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isFormDisabled}
            placeholder="Enter company name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">
            This name will be used to organize credentials in C:\DiscoveryData\[CompanyName]
          </p>
        </div>

        {/* Existing Credentials Warning */}
        {hasExistingCredentials && !state.success && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800">
                  Existing Credentials Found
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  App registration credentials already exist for this company. You can import
                  them or create new ones.
                </p>
                <button
                  onClick={handleImportExisting}
                  disabled={isFormDisabled}
                  className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import Existing Credentials
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Options</h3>

          {/* Show Window */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showWindow}
              onChange={(e) => setShowWindow(e.target.checked)}
              disabled={isFormDisabled}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">
              Show PowerShell window (recommended for first-time setup)
            </span>
          </label>

          {/* Auto Install Modules */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoInstallModules}
              onChange={(e) => setAutoInstallModules(e.target.checked)}
              disabled={isFormDisabled}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">
              Automatically install required PowerShell modules
            </span>
          </label>

          {/* Skip Azure Roles */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={skipAzureRoles}
              onChange={(e) => setSkipAzureRoles(e.target.checked)}
              disabled={isFormDisabled}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">
              Skip Azure role assignments (for limited admin access)
            </span>
          </label>

          {/* Secret Validity */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Client Secret Validity (years)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={secretValidityYears}
              onChange={(e) => setSecretValidityYears(parseInt(e.target.value) || 2)}
              disabled={isFormDisabled}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              Azure recommends 2 years maximum
            </p>
          </div>
        </div>

        {/* Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            What this script does:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Creates an Azure AD app registration</li>
            <li>Configures Microsoft Graph API permissions</li>
            <li>Generates a client secret</li>
            <li>Saves encrypted credentials to C:\DiscoveryData\[CompanyName]\Credentials</li>
            <li>Automatically imports credentials into your profile</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            You will need Global Administrator rights in Azure AD to complete this setup.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={state.isRunning || state.isMonitoring}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.success ? 'Close' : 'Cancel'}
          </button>

          {!state.success && (
            <button
              onClick={handleLaunch}
              disabled={!companyName.trim() || isFormDisabled}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.isRunning || state.isMonitoring
                ? 'Setting Up...'
                : 'Launch App Registration'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

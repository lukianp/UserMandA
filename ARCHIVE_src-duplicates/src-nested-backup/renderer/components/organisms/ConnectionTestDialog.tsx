/**
 * Connection Test Dialog
 *
 * UI for testing connections to various services (AD, Exchange, Azure AD)
 * Implements T-000 environment detection pattern
 */

import React, { useState } from 'react';

import { useConnectionTest } from '../../hooks/useConnectionTest';
import { useProfileStore } from '../../store/useProfileStore';
import LoadingSpinner from '../atoms/LoadingSpinner';

import { Modal } from './Modal';

interface ConnectionTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionTestDialog: React.FC<ConnectionTestDialogProps> = ({ isOpen, onClose }) => {
  const { state, testActiveDirectory, testExchange, testAzureAD, testEnvironment, clearResults } =
    useConnectionTest();
  const { selectedSourceProfile } = useProfileStore();

  const [testMode, setTestMode] = useState<'individual' | 'environment'>('environment');
  const [formData, setFormData] = useState({
    domainController: '',
    exchangeServer: '',
    tenantId: '',
    clientId: '',
    clientSecret: '',
    username: '',
    password: ''
  });

  const handleTestEnvironment = async () => {
    if (!selectedSourceProfile) {
      alert('Please select a source profile first');
      return;
    }

    await testEnvironment({
      profileName: selectedSourceProfile.companyName,
      domainController: formData.domainController || undefined,
      exchangeServer: formData.exchangeServer || undefined,
      tenantId: formData.tenantId || undefined,
      clientId: formData.clientId || undefined,
      clientSecret: formData.clientSecret || undefined,
      credential:
        formData.username && formData.password
          ? { username: formData.username, password: formData.password }
          : undefined
    });
  };

  const handleTestActiveDirectory = async () => {
    if (!formData.domainController) {
      alert('Please enter a domain controller');
      return;
    }

    await testActiveDirectory(
      formData.domainController,
      formData.username && formData.password
        ? { username: formData.username, password: formData.password }
        : undefined
    );
  };

  const handleTestExchange = async () => {
    if (!formData.exchangeServer) {
      alert('Please enter an Exchange server URL');
      return;
    }

    await testExchange(
      formData.exchangeServer,
      formData.username && formData.password
        ? { username: formData.username, password: formData.password }
        : undefined
    );
  };

  const handleTestAzureAD = async () => {
    if (!formData.tenantId || !formData.clientId || !formData.clientSecret) {
      alert('Please enter Azure AD credentials');
      return;
    }

    await testAzureAD(formData.tenantId, formData.clientId, formData.clientSecret);
  };

  const handleClose = () => {
    clearResults();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Connection Testing (T-000)" size="lg">
      <div className="space-y-6">
        {/* Test Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Test Mode</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={testMode === 'environment'}
                onChange={() => setTestMode('environment')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm">Comprehensive Environment Test</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={testMode === 'individual'}
                onChange={() => setTestMode('individual')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm">Individual Service Tests</span>
            </label>
          </div>
        </div>

        {/* Progress Indicator */}
        {state.isRunning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <LoadingSpinner size="sm" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">Testing Connection</p>
                <p className="text-xs text-blue-600">{state.progress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Configuration Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Configuration</h3>

          {/* Active Directory */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Controller
            </label>
            <input
              type="text"
              value={formData.domainController}
              onChange={e => setFormData({ ...formData, domainController: e.target.value })}
              placeholder="dc.example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Exchange Server */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exchange Server URL
            </label>
            <input
              type="text"
              value={formData.exchangeServer}
              onChange={e => setFormData({ ...formData, exchangeServer: e.target.value })}
              placeholder="https://exchange.example.com/ews/exchange.asmx"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Azure AD */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Azure AD Credentials</label>
            <input
              type="text"
              value={formData.tenantId}
              onChange={e => setFormData({ ...formData, tenantId: e.target.value })}
              placeholder="Tenant ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              placeholder="Client ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={formData.clientSecret}
              onChange={e => setFormData({ ...formData, clientSecret: e.target.value })}
              placeholder="Client Secret"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Credentials (Optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Credentials (Optional)
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              placeholder="Username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Test Results */}
        {state.environmentResult && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Test Results</h3>

            {/* Overall Status */}
            <div
              className={`p-4 rounded-lg ${
                state.environmentResult.overallSuccess
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <p className="text-sm font-medium">
                {state.environmentResult.overallSuccess
                  ? '✓ All tests passed'
                  : '⚠ Some tests failed'}
              </p>
            </div>

            {/* Individual Test Results */}
            {state.environmentResult.tests.map((test, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  test.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{test.serviceType}</span>
                  <span className="text-sm">
                    {test.success ? '✓ Available' : '✗ Unavailable'}
                  </span>
                </div>
                {test.responseTime && (
                  <p className="text-xs text-gray-600 mt-1">
                    Response time: {test.responseTime}ms
                  </p>
                )}
                {test.error && <p className="text-xs text-red-600 mt-1">{test.error}</p>}
              </div>
            ))}

            {/* Capabilities */}
            {state.environmentResult.capabilities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {state.environmentResult.capabilities.map((capability, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {state.environmentResult.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {state.environmentResult.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>

          {testMode === 'environment' ? (
            <button
              onClick={handleTestEnvironment}
              disabled={state.isRunning}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run Environment Test
            </button>
          ) : (
            <>
              <button
                onClick={handleTestActiveDirectory}
                disabled={state.isRunning || !formData.domainController}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test AD
              </button>
              <button
                onClick={handleTestExchange}
                disabled={state.isRunning || !formData.exchangeServer}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test Exchange
              </button>
              <button
                onClick={handleTestAzureAD}
                disabled={
                  state.isRunning ||
                  !formData.tenantId ||
                  !formData.clientId ||
                  !formData.clientSecret
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Test Azure AD
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

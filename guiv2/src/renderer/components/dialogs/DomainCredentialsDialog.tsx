/**
 * Domain Credentials Dialog Component
 * Form for entering/updating domain credentials for Active Directory authentication
 */

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Key, CheckCircle, AlertCircle, TestTube, Shield, Eye, EyeOff } from 'lucide-react';

import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

export interface DomainCredentialsDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close dialog handler */
  onClose: () => void;
  /** Save credentials handler */
  onSave: (credentials: { username: string; password: string }) => Promise<void>;
  /** Clear credentials handler */
  onClear?: () => Promise<void>;
  /** Test credentials handler */
  onTest?: (credentials: { username: string; password: string }) => Promise<{
    valid: boolean;
    domain?: string;
    error?: string;
  }>;
  /** Profile information */
  profile?: {
    id: string;
    companyName: string;
  } | null;
  /** Existing credential status */
  credentialStatus?: {
    hasCredentials: boolean;
    username?: string;
    validationStatus?: 'valid' | 'invalid' | 'unknown';
    lastValidated?: string;
    validationError?: string;
  };
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * Domain Credentials Dialog Component
 */
const DomainCredentialsDialog: React.FC<DomainCredentialsDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onClear,
  onTest,
  profile = null,
  credentialStatus,
  'data-cy': dataCy = 'domain-credentials-dialog',
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    domain?: string;
    error?: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing username when dialog opens
  useEffect(() => {
    if (isOpen && credentialStatus?.hasCredentials && credentialStatus.username) {
      setFormData({
        username: credentialStatus.username,
        password: '', // Never populate password from storage
      });
    } else if (isOpen) {
      setFormData({
        username: '',
        password: '',
      });
    }
    setTestResult(null);
    setErrors({});
    setShowPassword(false);
  }, [isOpen, credentialStatus]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else {
      // Validate DOMAIN\username format
      const domainUserRegex = /^([^\\]+)\\([^\\]+)$/;
      if (!domainUserRegex.test(formData.username)) {
        newErrors.username = 'Username must be in DOMAIN\\username format (e.g., CONTOSO\\jdoe)';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      setFormData({ username: formData.username, password: '' }); // Clear password after save
      setTestResult(null);
      onClose();
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to save credentials' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!onClear) return;

    setIsClearing(true);
    try {
      await onClear();
      setFormData({ username: '', password: '' });
      setTestResult(null);
      onClose();
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to clear credentials' });
    } finally {
      setIsClearing(false);
    }
  };

  const handleTest = async () => {
    if (!validate() || !onTest) return;

    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await onTest(formData);
      setTestResult({
        success: result.valid,
        domain: result.domain,
        error: result.error,
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getValidationStatusColor = (status?: string): string => {
    switch (status) {
      case 'valid':
        return 'text-green-600';
      case 'invalid':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getValidationStatusIcon = (status?: string): React.ReactNode => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Key className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50" data-cy={dataCy}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-xl pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Domain Authentication
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {profile && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Profile:</span> {profile.companyName}
                </p>
              </div>
            )}

            {/* Current Status */}
            {credentialStatus?.hasCredentials && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  {getValidationStatusIcon(credentialStatus.validationStatus)}
                  <span className="text-sm font-medium text-gray-700">Current Status</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Username:</span> {credentialStatus.username}
                  </p>
                  {credentialStatus.validationStatus && (
                    <p className={getValidationStatusColor(credentialStatus.validationStatus)}>
                      <span className="font-medium">Validation:</span>{' '}
                      {credentialStatus.validationStatus === 'valid' && 'Valid'}
                      {credentialStatus.validationStatus === 'invalid' && 'Invalid'}
                      {credentialStatus.validationStatus === 'unknown' && 'Not tested'}
                    </p>
                  )}
                  {credentialStatus.lastValidated && (
                    <p className="text-xs">
                      Last tested: {new Date(credentialStatus.lastValidated).toLocaleString()}
                    </p>
                  )}
                  {credentialStatus.validationError && (
                    <p className="text-xs text-red-600">
                      Error: {credentialStatus.validationError}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Domain Username *
                </label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="DOMAIN\username"
                  className={errors.username ? 'border-red-500' : ''}
                  data-cy="domain-username-input"
                  autoComplete="off"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Example: CONTOSO\jdoe
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    data-cy="domain-password-input"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 8 characters
                </p>
              </div>

              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              )}

              {testResult && (
                <div
                  className={`border rounded-md p-3 ${
                    testResult.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <p
                      className={`text-sm font-medium ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {testResult.success ? 'Authentication Successful' : 'Authentication Failed'}
                    </p>
                  </div>
                  {testResult.domain && (
                    <p className="mt-1 text-sm text-green-700">Domain: {testResult.domain}</p>
                  )}
                  {testResult.error && (
                    <p className="mt-1 text-sm text-red-700">{testResult.error}</p>
                  )}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex gap-2">
                  <Shield className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Security Note:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Password is encrypted using OS-level keystore</li>
                      <li>Never logged or transmitted in plaintext</li>
                      <li>Used only for Active Directory authentication</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              {credentialStatus?.hasCredentials && onClear && (
                <Button
                  variant="secondary"
                  onClick={handleClear}
                  disabled={isClearing || isSaving || isTesting}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-cy="clear-credentials-button"
                >
                  {isClearing ? 'Clearing...' : 'Clear Credentials'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSaving || isClearing || isTesting}
                data-cy="cancel-button"
              >
                Cancel
              </Button>
              {onTest && (
                <Button
                  variant="secondary"
                  onClick={handleTest}
                  disabled={isSaving || isClearing || isTesting}
                  data-cy="test-credentials-button"
                >
                  {isTesting ? (
                    <>
                      <TestTube className="w-4 h-4 mr-2 animate-pulse" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Test
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || isClearing || isTesting}
                data-cy="save-credentials-button"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default DomainCredentialsDialog;



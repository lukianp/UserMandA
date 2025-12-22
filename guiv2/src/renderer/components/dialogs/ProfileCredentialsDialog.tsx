/**
 * Profile Credentials Dialog Component
 * Form for entering/updating Azure AD app registration credentials
 */

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Key, CheckCircle, AlertCircle, TestTube } from 'lucide-react';

import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

export interface ProfileCredentialsDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close dialog handler */
  onClose: () => void;
  /** Save credentials handler */
  onSave: (credentials: { clientId: string, clientSecret: string }) => Promise<void>;
  /** Test connection handler */
  onTestConnection?: (credentials: { clientId: string, clientSecret: string }) => Promise<boolean>;
  /** Profile information */
  profile?: {
    id: string;
    companyName: string;
    tenantId?: string;
  } | null;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * Profile Credentials Dialog Component
 */
const ProfileCredentialsDialog: React.FC<ProfileCredentialsDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onTestConnection,
  profile = null,
  'data-cy': dataCy = 'profile-credentials-dialog',
}) => {
  const [formData, setFormData] = useState({
    clientId: '',
    clientSecret: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing credentials when dialog opens
  useEffect(() => {
    if (isOpen && profile) {
      // Note: In a real implementation, you might want to load existing credentials
      // For now, we start with empty fields
      setFormData({
        clientId: '',
        clientSecret: '',
      });
    } else if (isOpen) {
      setFormData({
        clientId: '',
        clientSecret: '',
      });
    }
    setTestResult(null);
    setErrors({});
  }, [isOpen, profile]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId.trim()) {
      newErrors.clientId = 'Client ID is required';
    }

    if (!formData.clientSecret.trim()) {
      newErrors.clientSecret = 'Client Secret is required';
    }

    // Basic UUID validation for Client ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (formData.clientId && !uuidRegex.test(formData.clientId)) {
      newErrors.clientId = 'Client ID must be a valid UUID';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: 'Failed to save credentials. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!validate() || !onTestConnection) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const success = await onTestConnection(formData);
      setTestResult(success ? 'success' : 'error');
    } catch (error) {
      setTestResult('error');
    } finally {
      setIsTesting(false);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50" data-cy={dataCy}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Azure AD Credentials
                </Dialog.Title>
                {profile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {profile.companyName}
                    {profile.tenantId && (
                      <span className="block text-xs text-gray-500">
                        Tenant: {profile.tenantId}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              data-cy="close-credentials-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Setup Instructions
              </h4>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Go to Azure Portal → Azure Active Directory → App registrations</li>
                <li>Create a new app registration or select an existing one</li>
                <li>Copy the Application (client) ID below</li>
                <li>Create a client secret under Certificates & secrets</li>
                <li>Copy the client secret value below</li>
                <li>Grant Microsoft Graph permissions for Intune discovery</li>
              </ol>
            </div>

            {/* Credentials Form */}
            <div className="space-y-4">
              {/* Client ID */}
              <Input
                label="Client ID"
                value={formData.clientId}
                onChange={(e) => updateFormData('clientId', e.target.value)}
                error={errors.clientId}
                required
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                data-cy="client-id-input"
              />

              {/* Client Secret */}
              <Input
                label="Client Secret"
                type="password"
                value={formData.clientSecret}
                onChange={(e) => updateFormData('clientSecret', e.target.value)}
                error={errors.clientSecret}
                required
                placeholder="••••••••••••••••••••••••••••••••"
                data-cy="client-secret-input"
              />
            </div>

            {/* Test Connection Result */}
            {testResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  testResult === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {testResult === 'success' ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connection successful!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connection failed. Please check your credentials and permissions.</span>
                  </>
                )}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{errors.submit}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {onTestConnection && (
                <Button
                  variant="ghost"
                  onClick={handleTestConnection}
                  loading={isTesting}
                  disabled={isSaving}
                  data-cy="test-connection-btn"
                  className="flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  Test Connection
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSaving || isTesting}
                data-cy="cancel-credentials-btn"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={isSaving}
                disabled={isTesting}
                data-cy="save-credentials-btn"
              >
                Save Credentials
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ProfileCredentialsDialog;
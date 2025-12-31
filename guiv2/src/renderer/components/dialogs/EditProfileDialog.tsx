/**
 * Edit Profile Dialog Component
 * Form for creating or editing connection profiles
 */

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, User, Key, CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';

export interface Profile {
  id?: string;
  name: string;
  type: 'azuread' | 'ad' | 'exchange' | 'sharepoint' | 'custom';
  credentials: {
    username: string;
    password: string;
    tenantId?: string;
    domain?: string;
  };
}

export interface EditProfileDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close dialog handler */
  onClose: () => void;
  /** Save profile handler */
  onSave: (profile: Profile) => Promise<void>;
  /** Profile to edit (null for new profile) */
  profile?: Profile | null;
  /** Test connection handler */
  onTestConnection?: (profile: Profile) => Promise<boolean>;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * Edit Profile Dialog Component
 */
const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  profile = null,
  onTestConnection,
  'data-cy': dataCy = 'edit-profile-dialog',
}) => {
  const isEditing = !!profile?.id;

  const [formData, setFormData] = useState<Profile>({
    name: '',
    type: 'azuread',
    credentials: {
      username: '',
      password: '',
      tenantId: '',
      domain: '',
    },
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load profile data when dialog opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData(profile);
    } else if (isOpen) {
      setFormData({
        name: '',
        type: 'azuread',
        credentials: {
          username: '',
          password: '',
          tenantId: '',
          domain: '',
        },
      });
    }
    setTestResult(null);
    setErrors({});
  }, [isOpen, profile]);

  const connectionTypes = [
    { value: 'azuread', label: 'Azure Active Directory' },
    { value: 'ad', label: 'Active Directory' },
    { value: 'exchange', label: 'Exchange Online' },
    { value: 'sharepoint', label: 'SharePoint Online' },
    { value: 'custom', label: 'Custom Connection' },
  ];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Profile name is required';
    }

    if (!formData.credentials.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.credentials.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (formData.type === 'azuread' && !formData.credentials.tenantId?.trim()) {
      newErrors.tenantId = 'Tenant ID is required for Azure AD';
    }

    if (formData.type === 'ad' && !formData.credentials.domain?.trim()) {
      newErrors.domain = 'Domain is required for Active Directory';
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
      setErrors({ submit: 'Failed to save profile. Please try again.' });
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

  const updateFormData = (updates: Partial<Profile>) => {
    setFormData({ ...formData, ...updates });
  };

  const updateCredentials = (updates: Partial<Profile['credentials']>) => {
    setFormData({
      ...formData,
      credentials: { ...formData.credentials, ...updates },
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50" data-cy={dataCy}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {isEditing ? 'Edit Profile' : 'New Profile'}
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              data-cy="close-profile-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Profile Name */}
            <Input
              label="Profile Name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              error={errors.name}
              required
              placeholder="My Azure AD Connection"
              data-cy="profile-name-input"
            />

            {/* Connection Type */}
            <Select
              label="Connection Type"
              value={formData.type}
              onChange={(value) => updateFormData({ type: value as Profile['type'] })}
              options={connectionTypes}
              required
              data-cy="profile-type-select"
            />

            {/* Credentials Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Credentials</h3>
              </div>

              <div className="space-y-4">
                {/* Azure AD Tenant ID */}
                {formData.type === 'azuread' && (
                  <Input
                    label="Tenant ID"
                    value={formData.credentials.tenantId || ''}
                    onChange={(e) => updateCredentials({ tenantId: e.target.value })}
                    error={errors.tenantId}
                    required
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    data-cy="profile-tenant-input"
                  />
                )}

                {/* AD Domain */}
                {formData.type === 'ad' && (
                  <Input
                    label="Domain"
                    value={formData.credentials.domain || ''}
                    onChange={(e) => updateCredentials({ domain: e.target.value })}
                    error={errors.domain}
                    required
                    placeholder="contoso.local"
                    data-cy="profile-domain-input"
                  />
                )}

                {/* Username */}
                <Input
                  label="Username"
                  value={formData.credentials.username}
                  onChange={(e) => updateCredentials({ username: e.target.value })}
                  error={errors.username}
                  required
                  placeholder="admin@contoso.com"
                  data-cy="profile-username-input"
                />

                {/* Password */}
                <Input
                  label="Password"
                  type="password"
                  value={formData.credentials.password}
                  onChange={(e) => updateCredentials({ password: e.target.value })}
                  error={errors.password}
                  required
                  placeholder="••••••••"
                  data-cy="profile-password-input"
                />
              </div>
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
                    <span className="text-sm font-medium">Connection failed. Please check your credentials.</span>
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
                >
                  Test Connection
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isSaving || isTesting}
                data-cy="cancel-profile-btn"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={isSaving}
                disabled={isTesting}
                data-cy="save-profile-btn"
              >
                {isEditing ? 'Save Changes' : 'Create Profile'}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditProfileDialog;



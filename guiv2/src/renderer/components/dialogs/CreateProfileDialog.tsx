/**
 * Create Profile Dialog
 * Form dialog for creating new connection profiles
 */

import React, { useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

import { useModalStore } from '../../store/useModalStore';
import { useProfileStore } from '../../store/useProfileStore';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';

interface ProfileFormData {
  name: string;
  type: 'source' | 'target';
  connectionType: 'AD' | 'Azure' | 'Exchange' | 'SharePoint';
  server: string;
  domain: string;
  username: string;
  password: string;
}

const CreateProfileDialog: React.FC = () => {
  const { modals, closeModal } = useModalStore();
  const { createSourceProfile, testConnection } = useProfileStore();

  const isOpen = modals.some((m) => m.id === 'createProfile') || false;

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    type: 'source',
    connectionType: 'AD',
    server: '',
    domain: '',
    username: '',
    password: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const updateField = useCallback(<K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTestResult(null); // Clear test result when form changes
  }, []);

  const handleTestConnection = useCallback(async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const profile: any = {
        id: '',
        companyName: formData.name,
        domainController: formData.server,
        isActive: true,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        configuration: {},
      };

      const result = await testConnection(profile);

      setTestResult({
        success: result.success,
        message: result.message || (result.success ? 'Connection successful!' : 'Connection failed'),
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsTesting(false);
    }
  }, [formData, testConnection]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      await createSourceProfile({
        companyName: formData.name,
        domainController: formData.server,
        isActive: true,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        configuration: {
          type: formData.type,
          connectionType: formData.connectionType,
          domain: formData.domain,
          username: formData.username,
          password: formData.password,
        },
      } as any);

      // Reset form and close
      setFormData({
        name: '',
        type: 'source',
        connectionType: 'AD',
        server: '',
        domain: '',
        username: '',
        password: '',
      });
      setTestResult(null);
      closeModal('createProfile');
    } catch (error) {
      console.error('Failed to create profile:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, createSourceProfile, closeModal]);

  const handleClose = useCallback(() => {
    setFormData({
      name: '',
      type: 'source',
      connectionType: 'AD',
      server: '',
      domain: '',
      username: '',
      password: '',
    });
    setTestResult(null);
    closeModal('createProfile');
  }, [closeModal]);

  const isFormValid = formData.name && formData.server && formData.username;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Profile
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              data-cy="close-dialog-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
            <Input
              label="Profile Name"
              placeholder="e.g., Contoso Source"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
              data-cy="profile-name-input"
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Profile Type"
                value={formData.type}
                onChange={(value: string) => updateField('type', value as 'source' | 'target')}
                options={[
                  { value: 'source', label: 'Source Environment' },
                  { value: 'target', label: 'Target Environment' },
                ]}
                data-cy="profile-type-select"
              />

              <Select
                label="Connection Type"
                value={formData.connectionType}
                onChange={(value: string) => updateField('connectionType', value as ProfileFormData['connectionType'])}
                options={[
                  { value: 'AD', label: 'Active Directory' },
                  { value: 'Azure', label: 'Azure AD / Microsoft 365' },
                  { value: 'Exchange', label: 'Exchange Server' },
                  { value: 'SharePoint', label: 'SharePoint' },
                ]}
                data-cy="connection-type-select"
              />
            </div>

            <Input
              label="Server / Endpoint"
              placeholder={formData.connectionType === 'Azure' ? 'Tenant ID or domain' : 'server.domain.com'}
              value={formData.server}
              onChange={(e) => updateField('server', e.target.value)}
              required
              data-cy="server-input"
            />

            <Input
              label="Domain"
              placeholder="CONTOSO"
              value={formData.domain}
              onChange={(e) => updateField('domain', e.target.value)}
              helperText="Leave empty for Azure AD"
              data-cy="domain-input"
            />

            <Input
              label="Username"
              placeholder="administrator@contoso.com"
              value={formData.username}
              onChange={(e) => updateField('username', e.target.value)}
              required
              data-cy="username-input"
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
              data-cy="password-input"
            />

            {/* Test Connection Result */}
            {testResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-md ${
                  testResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <Button
              variant="secondary"
              onClick={handleTestConnection}
              disabled={!isFormValid || isTesting}
              loading={isTesting}
              data-cy="test-connection-btn"
            >
              Test Connection
            </Button>
            <Button
              variant="secondary"
              onClick={handleClose}
              data-cy="cancel-btn"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!isFormValid || isSaving}
              loading={isSaving}
              data-cy="save-profile-btn"
            >
              Create Profile
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateProfileDialog;

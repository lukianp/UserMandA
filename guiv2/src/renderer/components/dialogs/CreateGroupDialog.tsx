/**
 * Create Group Dialog
 *
 * Modal dialog for creating a new group in Active Directory or Azure AD
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { useModalStore } from '../../store/useModalStore';
import { useProfileStore } from '../../store/useProfileStore';
import { GroupType, GroupScope } from '../../types/models/group';

export interface CreateGroupDialogProps {
  onGroupCreated?: (group: any) => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ onGroupCreated }) => {
  const { closeModal } = useModalStore();
  const { selectedSourceProfile } = useProfileStore();

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    email: '',
    groupType: GroupType.Security,
    scope: GroupScope.Universal,
    isMailEnabled: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate displayName from name
    if (field === 'name' && !formData.displayName) {
      setFormData(prev => ({ ...prev, displayName: value }));
    }

    // Auto-enable mail if email is provided
    if (field === 'email' && value) {
      setFormData(prev => ({ ...prev, isMailEnabled: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name) {
      setError('Group name is required');
      return;
    }

    if (formData.isMailEnabled && (!formData.email || !formData.email.includes('@'))) {
      setError('Valid email address is required for mail-enabled groups');
      return;
    }

    if (!selectedSourceProfile) {
      setError('No profile selected');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call PowerShell module to create group
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Management/GroupManagement.psm1',
        functionName: 'New-Group',
        parameters: {
          Name: formData.name,
          DisplayName: formData.displayName || formData.name,
          Description: formData.description,
          Email: formData.email,
          GroupType: formData.groupType,
          Scope: formData.scope,
          IsMailEnabled: formData.isMailEnabled,
          ProfileId: selectedSourceProfile.id,
        },
      });

      if (result.success) {
        console.log('[CreateGroupDialog] Group created successfully:', result.data);

        // Call callback if provided
        if (onGroupCreated) {
          onGroupCreated(result.data);
        }

        // Close modal
        closeModal();
      } else {
        throw new Error(result.error || 'Failed to create group');
      }
    } catch (err) {
      console.error('[CreateGroupDialog] Failed to create group:', err);
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Group</h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <Input
            label="Group Name *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="IT-Department"
            required
            disabled={isSubmitting}
          />

          {/* Display Name */}
          <Input
            label="Display Name"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Auto-generated from name"
            disabled={isSubmitting}
          />

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Group for IT department members"
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Group Type and Scope */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Group Type"
              value={formData.groupType}
              onChange={(value) => handleInputChange('groupType', value)}
              options={[
                { value: GroupType.Security, label: 'Security' },
                { value: GroupType.Distribution, label: 'Distribution' },
                { value: GroupType.MailEnabled, label: 'Mail-Enabled Security' },
                { value: GroupType.Office365, label: 'Office 365' },
                { value: GroupType.Dynamic, label: 'Dynamic' },
              ]}
              disabled={isSubmitting}
            />

            <Select
              label="Scope"
              value={formData.scope}
              onChange={(value) => handleInputChange('scope', value)}
              options={[
                { value: GroupScope.Universal, label: 'Universal' },
                { value: GroupScope.Global, label: 'Global' },
                { value: GroupScope.DomainLocal, label: 'Domain Local' },
              ]}
              disabled={isSubmitting}
            />
          </div>

          {/* Mail-Enabled */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isMailEnabled}
              onChange={(e) => handleInputChange('isMailEnabled', e.target.checked)}
              disabled={isSubmitting}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Mail-Enabled Group</span>
          </label>

          {/* Email (conditional) */}
          {formData.isMailEnabled && (
            <Input
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="it-department@company.com"
              required={formData.isMailEnabled}
              disabled={isSubmitting}
            />
          )}

          {/* Profile info */}
          {selectedSourceProfile && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Group will be created in: <strong>{selectedSourceProfile.companyName}</strong>
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={closeModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Group
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupDialog;

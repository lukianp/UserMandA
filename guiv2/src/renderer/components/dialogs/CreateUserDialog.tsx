/**
 * Create User Dialog
 *
 * Modal dialog for creating a new user in Active Directory or Azure AD
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { useModalStore } from '../../store/useModalStore';
import { useProfileStore } from '../../store/useProfileStore';

export interface CreateUserDialogProps {
  onUserCreated?: (user: any) => void;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ onUserCreated }) => {
  const { closeModal } = useModalStore();
  const { selectedSourceProfile } = useProfileStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    userPrincipalName: '',
    email: '',
    department: '',
    jobTitle: '',
    officeLocation: '',
    password: '',
    confirmPassword: '',
    accountEnabled: true,
    changePasswordAtNextLogon: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate displayName if firstName or lastName changes
    if (field === 'firstName' || field === 'lastName') {
      const firstName = field === 'firstName' ? value : formData.firstName;
      const lastName = field === 'lastName' ? value : formData.lastName;
      if (firstName && lastName) {
        setFormData(prev => ({ ...prev, displayName: `${firstName} ${lastName}` }));
      }
    }

    // Auto-generate UPN from email
    if (field === 'email') {
      setFormData(prev => ({ ...prev, userPrincipalName: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError('Valid email address is required');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!selectedSourceProfile) {
      setError('No profile selected');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call PowerShell module to create user
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Management/UserManagement.psm1',
        functionName: 'New-User',
        parameters: {
          FirstName: formData.firstName,
          LastName: formData.lastName,
          DisplayName: formData.displayName,
          UserPrincipalName: formData.userPrincipalName,
          Email: formData.email,
          Department: formData.department,
          JobTitle: formData.jobTitle,
          OfficeLocation: formData.officeLocation,
          Password: formData.password,
          AccountEnabled: formData.accountEnabled,
          ChangePasswordAtNextLogon: formData.changePasswordAtNextLogon,
          ProfileId: selectedSourceProfile.id,
        },
      });

      if (result.success) {
        console.log('[CreateUserDialog] User created successfully:', result.data);

        // Call callback if provided
        if (onUserCreated) {
          onUserCreated(result.data);
        }

        // Close modal
        closeModal();
      } else {
        throw new Error(result.error || 'Failed to create user');
      }
    } catch (err) {
      console.error('[CreateUserDialog] Failed to create user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New User</h2>
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

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="John"
              required
              disabled={isSubmitting}
            />
            <Input
              label="Last Name *"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Doe"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Display Name */}
          <Input
            label="Display Name"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder="Auto-generated from first and last name"
            disabled={isSubmitting}
          />

          {/* Email / UPN */}
          <Input
            label="Email / User Principal Name *"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="john.doe@company.com"
            required
            disabled={isSubmitting}
          />

          {/* Department and Job Title */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              placeholder="IT"
              disabled={isSubmitting}
            />
            <Input
              label="Job Title"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              placeholder="Software Engineer"
              disabled={isSubmitting}
            />
          </div>

          {/* Office Location */}
          <Input
            label="Office Location"
            value={formData.officeLocation}
            onChange={(e) => handleInputChange('officeLocation', e.target.value)}
            placeholder="New York"
            disabled={isSubmitting}
          />

          {/* Password fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Password *"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Min 8 characters"
              required
              disabled={isSubmitting}
            />
            <Input
              label="Confirm Password *"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Re-enter password"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Account options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.accountEnabled}
                onChange={(e) => handleInputChange('accountEnabled', e.target.checked)}
                disabled={isSubmitting}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Account Enabled</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.changePasswordAtNextLogon}
                onChange={(e) => handleInputChange('changePasswordAtNextLogon', e.target.checked)}
                disabled={isSubmitting}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                User must change password at next logon
              </span>
            </label>
          </div>

          {/* Profile info */}
          {selectedSourceProfile && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                User will be created in: <strong>{selectedSourceProfile.companyName}</strong>
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
            Create User
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserDialog;

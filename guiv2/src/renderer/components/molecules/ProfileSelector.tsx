/**
 * ProfileSelector Component
 *
 * Dropdown selector for source/target profiles with connection testing and management.
 * Integrates with useProfileStore for state management.
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Plus, Trash2, TestTube, RefreshCw } from 'lucide-react';
import { useProfileStore } from '../../store/useProfileStore';
import { Select } from '../atoms/Select';
import { Button } from '../atoms/Button';
import { StatusIndicator } from '../atoms/StatusIndicator';
import type { CompanyProfile, TargetProfile } from '../../store/useProfileStore';
import type { StatusType } from '../atoms/StatusIndicator';

export interface ProfileSelectorProps {
  /** Profile type: source or target */
  type: 'source' | 'target';
  /** Label text */
  label?: string;
  /** Show action buttons (create, delete, test) */
  showActions?: boolean;
  /** Create profile handler */
  onCreateProfile?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

/**
 * ProfileSelector Component
 */
export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  type,
  label,
  showActions = true,
  onCreateProfile,
  className,
  'data-cy': dataCy,
}) => {
  const {
    sourceProfiles,
    targetProfiles,
    selectedSourceProfile,
    selectedTargetProfile,
    connectionStatus,
    isLoading,
    error,
    setSelectedSourceProfile,
    setSelectedTargetProfile,
    deleteSourceProfile,
    testConnection,
    loadSourceProfiles,
  } = useProfileStore();

  const [isTesting, setIsTesting] = useState(false);

  const profiles = type === 'source' ? sourceProfiles : targetProfiles;
  const selectedProfile = type === 'source' ? selectedSourceProfile : selectedTargetProfile;
  const setProfile = type === 'source' ? setSelectedSourceProfile : setSelectedTargetProfile;

  const handleProfileChange = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (!profile) return;

    if (type === 'source') {
      setSelectedSourceProfile(profile as CompanyProfile);
    } else {
      setSelectedTargetProfile(profile as TargetProfile);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedProfile) return;

    setIsTesting(true);
    try {
      await testConnection(selectedProfile as CompanyProfile);
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfile) return;

    // Get profile name - CompanyProfile uses companyName, TargetProfile uses name
    const profileName = 'companyName' in selectedProfile
      ? (selectedProfile as CompanyProfile).companyName
      : 'name' in selectedProfile
        ? (selectedProfile as TargetProfile).name
        : selectedProfile.id;

    if (confirm(`Are you sure you want to delete profile "${profileName}"?`)) {
      try {
        await deleteSourceProfile(selectedProfile.id);
      } catch (error) {
        console.error('Failed to delete profile:', error);
      }
    }
  };

  const handleRefreshProfiles = async () => {
    try {
      await loadSourceProfiles();
    } catch (error) {
      console.error('Failed to refresh profiles:', error);
    }
  };

  const handleCreateProfile = () => {
    if (onCreateProfile) {
      onCreateProfile();
    }
  };

  // Get status for indicator
  const getConnectionStatus = (): StatusType => {
    if (isTesting) return 'info'; // Use 'info' for loading state
    switch (connectionStatus) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'info'; // Use 'info' for connecting state
      case 'error':
        return 'error';
      default:
        return 'unknown'; // Use 'unknown' for neutral/disconnected state
    }
  };

  const getConnectionLabel = () => {
    if (isTesting) return 'Testing...';
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Not Connected';
    }
  };

  return (
    <div className={clsx('flex flex-col gap-3', className)} data-cy={dataCy}>
      {/* Header with label and status */}
      <div className="flex items-center justify-between">
        {label && <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>}
        {selectedProfile && (
          <StatusIndicator
            status={getConnectionStatus()}
            text={getConnectionLabel()}
            size="sm"
            animate={isTesting || connectionStatus === 'connecting'}
          />
        )}
      </div>

      {/* Profile selector */}
      <Select
        value={selectedProfile?.id || ''}
        onChange={handleProfileChange}
        options={profiles.map(profile => {
          // CompanyProfile uses companyName, TargetProfile uses name
          const profileName = 'companyName' in profile
            ? (profile as CompanyProfile).companyName
            : 'name' in profile
              ? (profile as TargetProfile).name
              : profile.id;
          // Both types have environment property
          const envLabel = profile.environment ? ` (${profile.environment})` : '';
          return {
            value: profile.id,
            label: `${profileName}${envLabel}`,
          };
        })}
        placeholder={profiles.length > 0 ? "Select a profile..." : "No profiles found - click Refresh"}
        disabled={isLoading || profiles.length === 0}
        error={error || undefined}
        data-cy={`profile-select-${type}`}
      />

      {/* Action buttons */}
      {showActions && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCreateProfile}
            icon={<Plus className="h-4 w-4" />}
            disabled={isLoading}
            data-cy="create-profile-btn"
          >
            Create
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshProfiles}
            icon={<RefreshCw className={clsx('h-4 w-4', { 'animate-spin': isLoading })} />}
            disabled={isLoading}
            data-cy="refresh-profiles-btn"
          >
            Refresh
          </Button>

          {selectedProfile && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleTestConnection}
                icon={<TestTube className="h-4 w-4" />}
                disabled={isLoading || isTesting}
                loading={isTesting}
                data-cy="test-connection-btn"
              >
                Test
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteProfile}
                icon={<Trash2 className="h-4 w-4" />}
                disabled={isLoading}
                data-cy="delete-profile-btn"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      )}

      {/* Selected profile details */}
      {selectedProfile && (
        <div className="px-3 py-2 bg-gray-800 rounded-md border border-gray-700 text-sm">
          <div className="grid grid-cols-1 gap-1">
            {'environment' in selectedProfile && selectedProfile.environment && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Environment:</span>
                <span className="text-gray-300">{selectedProfile.environment}</span>
              </div>
            )}
            {'companyName' in selectedProfile && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Company:</span>
                <span className="text-gray-300">{selectedProfile.companyName}</span>
              </div>
            )}
            {selectedProfile.tenantId && (
              <div className="col-span-2">
                <span className="font-medium text-gray-400">Tenant:</span>
                <div className="mt-1 text-gray-300 font-mono text-xs break-all">{selectedProfile.tenantId}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelector;

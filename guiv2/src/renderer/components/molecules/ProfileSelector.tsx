/**
 * ProfileSelector Component
 *
 * Dropdown selector for source/target profiles with connection testing and management.
 * Integrates with useProfileStore for state management.
 */

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Plus, Trash2, TestTube, RefreshCw } from 'lucide-react';

import { useProfileStore } from '../../store/useProfileStore';
import { useModalStore } from '../../store/useModalStore';
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

  // Auto-load profiles on component mount
  useEffect(() => {
    if (type === 'source' && sourceProfiles.length === 0) {
      loadSourceProfiles();
    }
  }, [type]); // Only run when type changes or on mount

  const handleProfileChange = async (profileId: string) => {
    if (!profileId) return;

    const profile = profiles.find(p => p.id === profileId);
    if (!profile) {
      console.error(`[ProfileSelector] Profile not found: ${profileId}`);
      return;
    }

    console.log(`[ProfileSelector] Switching to profile: ${getProfileDisplayName(profile)}`);

    try {
      if (type === 'source') {
        await setSelectedSourceProfile(profile as CompanyProfile);
        console.log(`[ProfileSelector] Successfully switched to source profile: ${getProfileDisplayName(profile)}`);
      } else {
        setSelectedTargetProfile(profile as TargetProfile);
        console.log(`[ProfileSelector] Successfully switched to target profile: ${getProfileDisplayName(profile)}`);
      }
    } catch (error) {
      console.error('[ProfileSelector] Failed to switch profile:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedProfile) {
      console.warn('[ProfileSelector] No profile selected for testing');
      return;
    }

    const profileName = getProfileDisplayName(selectedProfile);
    console.log(`[ProfileSelector] Testing connection for profile: ${profileName}`);

    setIsTesting(true);
    try {
      const result = await testConnection(selectedProfile as CompanyProfile);
      console.log('[ProfileSelector] ✅ Connection test successful:', result);
      alert(`✅ Connection test successful for profile "${profileName}"\n\nCredentials are valid and Azure API is accessible.`);
    } catch (error) {
      console.error('[ProfileSelector] ❌ Connection test failed:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(`❌ Connection test failed for profile "${profileName}"\n\n${errorMsg}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfile) {
      console.warn('[ProfileSelector] No profile selected for deletion');
      return;
    }

    const profileName = getProfileDisplayName(selectedProfile);
    const profileId = selectedProfile.id;

    if (!confirm(`Are you sure you want to delete profile "${profileName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      if (type === 'source') {
        await deleteSourceProfile(profileId);
        console.log(`[ProfileSelector] ✅ Successfully deleted profile: ${profileName}`);

        // Reload profiles to update UI
        await loadSourceProfiles();
      } else {
        // TODO: Add deleteTargetProfile action to store
        console.warn('[ProfileSelector] Target profile deletion not yet implemented');
        alert('Target profile deletion is not yet implemented');
      }
    } catch (error) {
      console.error('[ProfileSelector] Failed to delete profile:', error);
      alert(`Failed to delete profile: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Helper function to get profile display name
  const getProfileDisplayName = (profile: CompanyProfile | TargetProfile): string => {
    if ('companyName' in profile && profile.companyName) {
      return profile.companyName;
    }
    if ('name' in profile && profile.name) {
      return profile.name;
    }
    if ('id' in profile) {
      return profile.id;
    }
    return 'Unknown Profile';
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
    } else {
      // Open the create profile modal
      const { openModal } = useModalStore.getState();
      openModal({
        type: 'createProfile',
        title: 'Create New Profile',
        dismissable: true,
        size: 'lg',
      });
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

    const { consecutiveHeartbeatFailures } = useProfileStore.getState();

    switch (connectionStatus) {
      case 'connected':
        return 'Online';
      case 'connecting':
        // 'connecting' is used for degraded state (1 failure)
        if (consecutiveHeartbeatFailures > 0) {
          return 'Degraded';
        }
        return 'Connecting...';
      case 'error':
        return 'Offline';
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
          // Get profile display name
          const profileName = getProfileDisplayName(profile);
          // Both types have environment property
          const envLabel = profile.environment ? ` (${profile.environment})` : '';
          return {
            value: profile.id,
            label: `${profileName}${envLabel}`,
          };
        })}
        placeholder={profiles.length > 0 ? "Select a profile..." : "No profiles found - click Refresh"}
        disabled={isLoading}
        error={type === 'source' && error ? error : undefined}
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
            {'companyName' in selectedProfile && selectedProfile.companyName && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Company:</span>
                <span className="text-gray-300">{selectedProfile.companyName}</span>
              </div>
            )}
            {selectedProfile.environment && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Environment:</span>
                <span className="text-gray-300">{selectedProfile.environment}</span>
              </div>
            )}
            {'domainController' in selectedProfile && selectedProfile.domainController && (
              <div className="flex justify-between">
                <span className="font-medium text-gray-400">Domain:</span>
                <span className="text-gray-300">{selectedProfile.domainController}</span>
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

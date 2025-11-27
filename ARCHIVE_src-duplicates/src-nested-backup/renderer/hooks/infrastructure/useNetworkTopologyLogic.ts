import { useState, useEffect, useCallback } from 'react';

import { useProfileStore } from '../../store/useProfileStore';

export interface NetworkTopologyData {
  deviceName: string;
  ipAddress: string;
  deviceType: string;
  location: string;
  status: string;
}

export const useNetworkTopologyLogic = () => {
  const [data, setData] = useState<NetworkTopologyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/NetworkTopology.psm1',
        functionName: 'Get-NetworkTopology',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load network topology data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading network topology');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};

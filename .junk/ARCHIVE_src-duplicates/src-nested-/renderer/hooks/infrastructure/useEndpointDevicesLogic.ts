import { useState, useEffect, useCallback } from 'react';

import { useProfileStore } from '../../store/useProfileStore';

export interface EndpointDevicesData {
  deviceName: string;
  type: string;
  user: string;
  os: string;
  lastSeen: string;
  status: string;
}

export const useEndpointDevicesLogic = () => {
  const [data, setData] = useState<EndpointDevicesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/EndpointDevices.psm1',
        functionName: 'Get-EndpointDevices',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load endpoint devices data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading endpoint devices');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};

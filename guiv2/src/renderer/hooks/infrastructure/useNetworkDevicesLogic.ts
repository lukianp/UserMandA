import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '../../store/useProfileStore';

export interface NetworkDevicesData {
  deviceName: string;
  type: string;
  model: string;
  ports: number;
  management: string;
  status: string;
}

export const useNetworkDevicesLogic = () => {
  const [data, setData] = useState<NetworkDevicesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/NetworkDevices.psm1',
        functionName: 'Get-NetworkDevices',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load network devices data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading network devices');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};

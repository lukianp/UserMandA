import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '../../store/useProfileStore';

export interface VirtualizationData {
  vmName: string;
  host: string;
  vCPU: number;
  memory: string;
  storage: string;
  status: string;
}

export const useVirtualizationLogic = () => {
  const [data, setData] = useState<VirtualizationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/Virtualization.psm1',
        functionName: 'Get-VirtualizationInfo',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load virtualization data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading virtualization info');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};

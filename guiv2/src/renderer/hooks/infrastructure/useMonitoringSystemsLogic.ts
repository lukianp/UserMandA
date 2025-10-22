import { useState, useEffect, useCallback } from 'react';

import { useProfileStore } from '../../store/useProfileStore';

export interface MonitoringSystemsData {
  systemName: string;
  type: string;
  monitoredItems: number;
  alerts: number;
  status: string;
}

export const useMonitoringSystemsLogic = () => {
  const [data, setData] = useState<MonitoringSystemsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/MonitoringSystems.psm1',
        functionName: 'Get-MonitoringSystems',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load monitoring systems data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading monitoring systems');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};

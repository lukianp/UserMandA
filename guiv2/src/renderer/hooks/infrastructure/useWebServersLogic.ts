import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '../../store/useProfileStore';

export interface WebServersData {
  serverName: string;
  webServer: string;
  sites: number;
  port: number;
  ssl: string;
  status: string;
}

export const useWebServersLogic = () => {
  const [data, setData] = useState<WebServersData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/WebServers.psm1',
        functionName: 'Get-WebServers',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load web servers data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading web servers');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};

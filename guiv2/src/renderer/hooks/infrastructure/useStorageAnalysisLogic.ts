import { useState, useEffect, useCallback } from 'react';
import { useProfileStore } from '../../store/useProfileStore';

export interface StorageAnalysisData {
  storageSystem: string;
  type: string;
  capacity: string;
  used: string;
  available: string;
  status: string;
}

export const useStorageAnalysisLogic = () => {
  const [data, setData] = useState<StorageAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/StorageAnalysis.psm1',
        functionName: 'Get-StorageAnalysis',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load storage analysis data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading storage analysis');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};

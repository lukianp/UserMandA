import { useState, useEffect, useCallback } from 'react';

import { useProfileStore } from '../../store/useProfileStore';

export interface CloudResourcesData {
  resourceName: string;
  type: string;
  provider: string;
  region: string;
  cost: string;
  status: string;
}

export const useCloudResourcesLogic = () => {
  const [data, setData] = useState<CloudResourcesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/CloudResources.psm1',
        functionName: 'Get-CloudResources',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load cloud resources data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading cloud resources');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};

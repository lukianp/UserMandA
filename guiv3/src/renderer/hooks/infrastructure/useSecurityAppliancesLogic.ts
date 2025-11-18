import { useState, useEffect, useCallback } from 'react';

import { useProfileStore } from '../../store/useProfileStore';

export interface SecurityAppliancesData {
  applianceName: string;
  type: string;
  model: string;
  version: string;
  status: string;
}

export const useSecurityAppliancesLogic = () => {
  const [data, setData] = useState<SecurityAppliancesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedSourceProfile } = useProfileStore();

  const loadData = useCallback(async () => {
    if (!selectedSourceProfile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Infrastructure/SecurityAppliances.psm1',
        functionName: 'Get-SecurityAppliances',
        parameters: {
          ProfileName: selectedSourceProfile.companyName
        }
      });

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load security appliances data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading security appliances');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSourceProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, reload: loadData };
};

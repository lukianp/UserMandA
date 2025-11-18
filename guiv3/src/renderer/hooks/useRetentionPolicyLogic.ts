import { useState, useCallback } from 'react';

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  retentionPeriod: number; // in days
  enabled: boolean;
  appliesTo: string[];
  lastModified: Date;
  createdBy: string;
}

export interface RetentionPolicyLogicReturn {
  policies: RetentionPolicy[];
  isLoading: boolean;
  error: string | null;
  selectedPolicy: RetentionPolicy | null;
  createPolicy: (policy: Omit<RetentionPolicy, 'id' | 'lastModified'>) => Promise<void>;
  updatePolicy: (id: string, updates: Partial<RetentionPolicy>) => Promise<void>;
  deletePolicy: (id: string) => Promise<void>;
  enablePolicy: (id: string) => Promise<void>;
  disablePolicy: (id: string) => Promise<void>;
  selectPolicy: (policy: RetentionPolicy | null) => void;
  refreshPolicies: () => Promise<void>;
}

export function useRetentionPolicyLogic(): RetentionPolicyLogicReturn {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([
    {
      id: 'policy-1',
      name: 'Default User Retention',
      description: 'Standard retention policy for user accounts',
      retentionPeriod: 365,
      enabled: true,
      appliesTo: ['users'],
      lastModified: new Date(),
      createdBy: 'admin',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(null);

  const createPolicy = useCallback(async (policyData: Omit<RetentionPolicy, 'id' | 'lastModified'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newPolicy: RetentionPolicy = {
        ...policyData,
        id: `policy-${Date.now()}`,
        lastModified: new Date(),
      };

      setPolicies(prev => [...prev, newPolicy]);
    } catch (err) {
      setError('Failed to create retention policy');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePolicy = useCallback(async (id: string, updates: Partial<RetentionPolicy>) => {
    setIsLoading(true);
    setError(null);

    try {
      setPolicies(prev =>
        prev.map(policy =>
          policy.id === id
            ? { ...policy, ...updates, lastModified: new Date() }
            : policy
        )
      );
    } catch (err) {
      setError('Failed to update retention policy');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePolicy = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      setPolicies(prev => prev.filter(policy => policy.id !== id));
      if (selectedPolicy?.id === id) {
        setSelectedPolicy(null);
      }
    } catch (err) {
      setError('Failed to delete retention policy');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enablePolicy = useCallback(async (id: string) => {
    await updatePolicy(id, { enabled: true });
  }, [updatePolicy]);

  const disablePolicy = useCallback(async (id: string) => {
    await updatePolicy(id, { enabled: false });
  }, [updatePolicy]);

  const selectPolicy = useCallback((policy: RetentionPolicy | null) => {
    setSelectedPolicy(policy);
  }, []);

  const refreshPolicies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock refresh - in real app would fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('Failed to refresh retention policies');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    policies,
    isLoading,
    error,
    selectedPolicy,
    createPolicy,
    updatePolicy,
    deletePolicy,
    enablePolicy,
    disablePolicy,
    selectPolicy,
    refreshPolicies,
  };
}
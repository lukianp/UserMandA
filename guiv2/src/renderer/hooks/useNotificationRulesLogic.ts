import { useState, useCallback } from 'react';

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggerType: 'event' | 'threshold' | 'schedule' | 'error';
  triggerConditions: Record<string, any>;
  notificationChannels: string[];
  recipients: string[];
  messageTemplate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRulesLogicReturn {
  rules: NotificationRule[];
  isLoading: boolean;
  error: string | null;
  createRule: (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRule: (id: string, updates: Partial<NotificationRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  enableRule: (id: string) => Promise<void>;
  disableRule: (id: string) => Promise<void>;
  testRule: (id: string) => Promise<void>;
  exportRules: () => Promise<void>;
  importRules: (rules: NotificationRule[]) => Promise<void>;
}

export function useNotificationRulesLogic(): NotificationRulesLogicReturn {
  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: 'rule-1',
      name: 'High Severity Error Alert',
      description: 'Alert when high severity errors occur',
      enabled: true,
      triggerType: 'error',
      triggerConditions: { severity: 'high', source: 'discovery' },
      notificationChannels: ['email', 'teams'],
      recipients: ['admin@company.com', 'security@company.com'],
      messageTemplate: 'High severity error detected: {error.message}',
      priority: 'high',
      lastTriggered: new Date('2025-01-15'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-10'),
    },
    {
      id: 'rule-2',
      name: 'Weekly Summary Report',
      description: 'Send weekly summary of system activities',
      enabled: true,
      triggerType: 'schedule',
      triggerConditions: { frequency: 'weekly', dayOfWeek: 'monday', time: '09:00' },
      notificationChannels: ['email'],
      recipients: ['management@company.com'],
      messageTemplate: 'Weekly system summary: {summary.totalEvents} events, {summary.errors} errors',
      priority: 'medium',
      lastTriggered: new Date('2025-01-13'),
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-12'),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRule = useCallback(async (ruleData: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newRule: NotificationRule = {
        ...ruleData,
        id: `rule-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setRules(prev => [...prev, newRule]);
    } catch (err) {
      setError('Failed to create notification rule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRule = useCallback(async (id: string, updates: Partial<NotificationRule>) => {
    setIsLoading(true);
    setError(null);

    try {
      setRules(prev =>
        prev.map(rule =>
          rule.id === id
            ? { ...rule, ...updates, updatedAt: new Date() }
            : rule
        )
      );
    } catch (err) {
      setError('Failed to update notification rule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteRule = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      setRules(prev => prev.filter(rule => rule.id !== id));
    } catch (err) {
      setError('Failed to delete notification rule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enableRule = useCallback(async (id: string) => {
    await updateRule(id, { enabled: true });
  }, [updateRule]);

  const disableRule = useCallback(async (id: string) => {
    await updateRule(id, { enabled: false });
  }, [updateRule]);

  const testRule = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate testing the rule
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful test
      console.log(`Rule ${id} tested successfully`);
    } catch (err) {
      setError('Failed to test notification rule');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportRules = useCallback(async () => {
    setError(null);

    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Notification rules exported');
    } catch (err) {
      setError('Failed to export notification rules');
    }
  }, []);

  const importRules = useCallback(async (importedRules: NotificationRule[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate import
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRules(prev => [...prev, ...importedRules]);
    } catch (err) {
      setError('Failed to import notification rules');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    rules,
    isLoading,
    error,
    createRule,
    updateRule,
    deleteRule,
    enableRule,
    disableRule,
    testRule,
    exportRules,
    importRules,
  };
}
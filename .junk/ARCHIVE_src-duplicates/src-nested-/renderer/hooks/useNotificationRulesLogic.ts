import { useState, useCallback, useEffect, useRef } from 'react';

// Enhanced interfaces for comprehensive notification management
export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'webhook' | 'teams' | 'slack' | 'push' | 'in-app';
  config: Record<string, any>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  subject?: string;
  body: string;
  variables: string[];
  channelType: NotificationChannel['type'];
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationEscalation {
  id: string;
  name: string;
  description: string;
  steps: EscalationStep[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscalationStep {
  id: string;
  delay: number; // minutes
  channels: string[]; // channel IDs
  recipients: string[];
  messageOverride?: string;
}

export interface NotificationAnalytics {
  ruleId: string;
  totalSent: number;
  totalFailed: number;
  totalDelivered: number;
  averageDeliveryTime: number;
  lastSent?: Date;
  deliveryHistory: DeliveryAttempt[];
}

export interface DeliveryAttempt {
  id: string;
  ruleId: string;
  channelId: string;
  recipient: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  timestamp: Date;
  errorMessage?: string;
  deliveryTime?: number; // milliseconds
}

export interface NotificationPreference {
  userId: string;
  ruleTypes: string[]; // enabled rule types
  channels: string[]; // preferred channels
  quietHours: { start: string; end: string } | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSchedule {
  id: string;
  ruleId: string;
  cronExpression: string;
  timezone: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggerType: 'event' | 'threshold' | 'schedule' | 'error' | 'custom';
  triggerConditions: Record<string, any>;
  notificationChannels: string[]; // channel IDs
  recipients: string[];
  templateId?: string;
  escalationId?: string;
  scheduleId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  throttling: {
    maxPerHour: number;
    maxPerDay: number;
    cooldownMinutes: number;
  };
  tags: string[];
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
  analytics: NotificationAnalytics;
}

export interface NotificationRulesLogicReturn {
  // Core rules
  rules: NotificationRule[];
  isLoading: boolean;
  error: string | null;

  // Channels
  channels: NotificationChannel[];
  templates: NotificationTemplate[];
  escalations: NotificationEscalation[];
  schedules: NotificationSchedule[];
  preferences: NotificationPreference[];
  analytics: NotificationAnalytics[];

  // Rule operations
  createRule: (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt' | 'analytics'>) => Promise<void>;
  updateRule: (id: string, updates: Partial<NotificationRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  enableRule: (id: string) => Promise<void>;
  disableRule: (id: string) => Promise<void>;
  testRule: (id: string, testData?: any) => Promise<TestResult>;
  validateRule: (rule: Partial<NotificationRule>) => ValidationResult;
  duplicateRule: (id: string, newName: string) => Promise<void>;

  // Channel operations
  createChannel: (channel: Omit<NotificationChannel, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateChannel: (id: string, updates: Partial<NotificationChannel>) => Promise<void>;
  deleteChannel: (id: string) => Promise<void>;
  testChannel: (id: string) => Promise<boolean>;

  // Template operations
  createTemplate: (template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<NotificationTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  renderTemplate: (templateId: string, variables: Record<string, any>) => string;

  // Escalation operations
  createEscalation: (escalation: Omit<NotificationEscalation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEscalation: (id: string, updates: Partial<NotificationEscalation>) => Promise<void>;
  deleteEscalation: (id: string) => Promise<void>;

  // Schedule operations
  createSchedule: (schedule: Omit<NotificationSchedule, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<NotificationSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  // Preference operations
  createPreference: (preference: Omit<NotificationPreference, 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePreference: (userId: string, updates: Partial<NotificationPreference>) => Promise<void>;
  deletePreference: (userId: string) => Promise<void>;

  // Analytics operations
  getAnalytics: (ruleId: string) => NotificationAnalytics | undefined;
  clearAnalytics: (ruleId: string) => Promise<void>;

  // Bulk operations
  exportRules: () => Promise<string>;
  importRules: (data: string) => Promise<void>;
  bulkEnable: (ruleIds: string[]) => Promise<void>;
  bulkDisable: (ruleIds: string[]) => Promise<void>;
  bulkDelete: (ruleIds: string[]) => Promise<void>;

  // Rule engine
  evaluateRule: (rule: NotificationRule, eventData: any) => boolean;
  triggerRule: (ruleId: string, eventData?: any) => Promise<void>;
  processEscalation: (escalationId: string, ruleId: string) => Promise<void>;
}

export interface TestResult {
  success: boolean;
  message: string;
  deliveryAttempts: DeliveryAttempt[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function useNotificationRulesLogic(): NotificationRulesLogicReturn {
  // Core state
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
      templateId: 'template-1',
      escalationId: 'escalation-1',
      priority: 'high',
      throttling: { maxPerHour: 10, maxPerDay: 100, cooldownMinutes: 5 },
      tags: ['error', 'security'],
      lastTriggered: new Date('2025-01-15'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-10'),
      analytics: {
        ruleId: 'rule-1',
        totalSent: 45,
        totalFailed: 2,
        totalDelivered: 43,
        averageDeliveryTime: 1250,
        lastSent: new Date('2025-01-15'),
        deliveryHistory: []
      }
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
      templateId: 'template-2',
      scheduleId: 'schedule-1',
      priority: 'medium',
      throttling: { maxPerHour: 5, maxPerDay: 10, cooldownMinutes: 0 },
      tags: ['report', 'weekly'],
      lastTriggered: new Date('2025-01-13'),
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-12'),
      analytics: {
        ruleId: 'rule-2',
        totalSent: 12,
        totalFailed: 0,
        totalDelivered: 12,
        averageDeliveryTime: 800,
        lastSent: new Date('2025-01-13'),
        deliveryHistory: []
      }
    },
  ]);

  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'email',
      name: 'Company Email',
      type: 'email',
      config: { smtpServer: 'smtp.company.com', port: 587 },
      enabled: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      type: 'teams',
      config: { webhookUrl: 'https://outlook.office.com/webhook/...' },
      enabled: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    }
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: 'template-1',
      name: 'Error Alert Template',
      description: 'Template for error notifications',
      subject: 'Alert: {error.severity} Error Detected',
      body: 'A {error.severity} severity error has occurred:\n\nError: {error.message}\nSource: {error.source}\nTime: {timestamp}\n\nPlease investigate immediately.',
      variables: ['error.severity', 'error.message', 'error.source', 'timestamp'],
      channelType: 'email',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'template-2',
      name: 'Weekly Summary Template',
      description: 'Template for weekly summary reports',
      subject: 'Weekly System Summary - {week}',
      body: 'Weekly system activity summary:\n\nTotal Events: {summary.totalEvents}\nErrors: {summary.errors}\nWarnings: {summary.warnings}\nSuccess Rate: {summary.successRate}%',
      variables: ['week', 'summary.totalEvents', 'summary.errors', 'summary.warnings', 'summary.successRate'],
      channelType: 'email',
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-05')
    }
  ]);

  const [escalations, setEscalations] = useState<NotificationEscalation[]>([
    {
      id: 'escalation-1',
      name: 'Critical Error Escalation',
      description: 'Escalate critical errors to multiple teams',
      enabled: true,
      steps: [
        {
          id: 'step-1',
          delay: 0,
          channels: ['email', 'teams'],
          recipients: ['admin@company.com', 'security@company.com']
        },
        {
          id: 'step-2',
          delay: 30,
          channels: ['sms', 'teams'],
          recipients: ['oncall@company.com', 'manager@company.com'],
          messageOverride: 'URGENT: Critical error not acknowledged. Immediate attention required.'
        }
      ],
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    }
  ]);

  const [schedules, setSchedules] = useState<NotificationSchedule[]>([
    {
      id: 'schedule-1',
      ruleId: 'rule-2',
      cronExpression: '0 9 * * 1', // Every Monday at 9:00
      timezone: 'UTC',
      enabled: true,
      lastRun: new Date('2025-01-13'),
      nextRun: new Date('2025-01-20'),
      createdAt: new Date('2025-01-05'),
      updatedAt: new Date('2025-01-05')
    }
  ]);

  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [analytics, setAnalytics] = useState<NotificationAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Throttling and scheduling refs
  const throttleMap = useRef<Map<string, { hour: number; day: number; lastSent: Date }>>(new Map());
  const scheduleInterval = useRef<NodeJS.Timeout>();

  // Initialize analytics from rules
  useEffect(() => {
    const ruleAnalytics = rules.map(rule => rule.analytics);
    setAnalytics(ruleAnalytics);
  }, []);

  // Schedule processor
  useEffect(() => {
    const processSchedules = () => {
      const now = new Date();
      schedules.forEach(schedule => {
        if (schedule.enabled && schedule.nextRun <= now) {
          const rule = rules.find(r => r.id === schedule.ruleId);
          if (rule?.enabled) {
            triggerRule(schedule.ruleId);
            // Calculate next run
            const nextRun = calculateNextRun(schedule.cronExpression, schedule.timezone);
            updateSchedule(schedule.id, { lastRun: now, nextRun });
          }
        }
      });
    };

    if (schedules.length > 0) {
      scheduleInterval.current = setInterval(processSchedules, 60000); // Check every minute
    }

    return () => {
      if (scheduleInterval.current) {
        clearInterval(scheduleInterval.current);
      }
    };
  }, [schedules, rules]);

  // Rule operations
  const createRule = useCallback(async (ruleData: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt' | 'analytics'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const newRule: NotificationRule = {
        ...ruleData,
        id: `rule-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        analytics: {
          ruleId: `rule-${Date.now()}`,
          totalSent: 0,
          totalFailed: 0,
          totalDelivered: 0,
          averageDeliveryTime: 0,
          deliveryHistory: []
        }
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
      // Also remove associated schedules
      setSchedules(prev => prev.filter(s => s.ruleId !== id));
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

  const testRule = useCallback(async (id: string, testData?: any): Promise<TestResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const rule = rules.find(r => r.id === id);
      if (!rule) throw new Error('Rule not found');

      const testEventData = testData || generateTestData(rule.triggerType);
      const deliveryAttempts: DeliveryAttempt[] = [];

      for (const channelId of rule.notificationChannels) {
        const channel = channels.find(c => c.id === channelId);
        if (channel) {
          const attempt: DeliveryAttempt = {
            id: `attempt-${Date.now()}-${Math.random()}`,
            ruleId: id,
            channelId,
            recipient: rule.recipients[0] || 'test@example.com',
            status: Math.random() > 0.1 ? 'delivered' : 'failed', // 90% success rate for testing
            timestamp: new Date(),
            deliveryTime: Math.floor(Math.random() * 3000) + 500 // 500-3500ms
          };
          deliveryAttempts.push(attempt);
        }
      }

      // Update analytics
      const updatedAnalytics = { ...rule.analytics };
      deliveryAttempts.forEach(attempt => {
        updatedAnalytics.totalSent++;
        if (attempt.status === 'delivered') updatedAnalytics.totalDelivered++;
        if (attempt.status === 'failed') updatedAnalytics.totalFailed++;
      });
      updatedAnalytics.deliveryHistory.push(...deliveryAttempts);

      await updateRule(id, { analytics: updatedAnalytics });

      return {
        success: deliveryAttempts.every(a => a.status === 'delivered'),
        message: `Test completed. ${deliveryAttempts.filter(a => a.status === 'delivered').length}/${deliveryAttempts.length} deliveries successful.`,
        deliveryAttempts
      };
    } catch (err) {
      setError('Failed to test notification rule');
      return {
        success: false,
        message: 'Test failed',
        deliveryAttempts: []
      };
    } finally {
      setIsLoading(false);
    }
  }, [rules, channels, updateRule]);

  const validateRule = useCallback((rule: Partial<NotificationRule>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rule.name?.trim()) errors.push('Rule name is required');
    if (!rule.triggerType) errors.push('Trigger type is required');
    if (!rule.notificationChannels?.length) errors.push('At least one notification channel is required');
    if (!rule.recipients?.length) warnings.push('No recipients specified');

    if (rule.triggerType === 'threshold' && !rule.triggerConditions?.threshold) {
      errors.push('Threshold value is required for threshold triggers');
    }

    if (rule.templateId && !templates.find(t => t.id === rule.templateId)) {
      errors.push('Selected template does not exist');
    }

    if (rule.escalationId && !escalations.find(e => e.id === rule.escalationId)) {
      errors.push('Selected escalation does not exist');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [templates, escalations]);

  const duplicateRule = useCallback(async (id: string, newName: string) => {
    const originalRule = rules.find(r => r.id === id);
    if (!originalRule) return;

    const duplicatedRule = {
      ...originalRule,
      name: newName,
      enabled: false,
      analytics: {
        ...originalRule.analytics,
        ruleId: '',
        totalSent: 0,
        totalFailed: 0,
        totalDelivered: 0,
        deliveryHistory: []
      }
    };

    delete (duplicatedRule as any).id;
    delete (duplicatedRule as any).createdAt;
    delete (duplicatedRule as any).updatedAt;

    await createRule(duplicatedRule);
  }, [rules, createRule]);

  // Channel operations
  const createChannel = useCallback(async (channelData: Omit<NotificationChannel, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newChannel: NotificationChannel = {
      ...channelData,
      id: `channel-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setChannels(prev => [...prev, newChannel]);
  }, []);

  const updateChannel = useCallback(async (id: string, updates: Partial<NotificationChannel>) => {
    setChannels(prev =>
      prev.map(channel =>
        channel.id === id
          ? { ...channel, ...updates, updatedAt: new Date() }
          : channel
      )
    );
  }, []);

  const deleteChannel = useCallback(async (id: string) => {
    setChannels(prev => prev.filter(channel => channel.id !== id));
    // Remove from rules that use this channel
    setRules(prev =>
      prev.map(rule => ({
        ...rule,
        notificationChannels: rule.notificationChannels.filter(c => c !== id)
      }))
    );
  }, []);

  const testChannel = useCallback(async (id: string): Promise<boolean> => {
    const channel = channels.find(c => c.id === id);
    if (!channel) return false;

    // Simulate channel testing
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.1; // 90% success rate
  }, [channels]);

  // Template operations
  const createTemplate = useCallback(async (templateData: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: NotificationTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTemplates(prev => [...prev, newTemplate]);
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<NotificationTemplate>) => {
    setTemplates(prev =>
      prev.map(template =>
        template.id === id
          ? { ...template, ...updates, updatedAt: new Date() }
          : template
      )
    );
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
    // Remove from rules that use this template
    setRules(prev =>
      prev.map(rule =>
        rule.templateId === id ? { ...rule, templateId: undefined } : rule
      )
    );
  }, []);

  const renderTemplate = useCallback((templateId: string, variables: Record<string, any>): string => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return '';

    let content = template.body;
    if (template.subject) {
      content = `${template.subject}\n\n${content}`;
    }

    // Replace variables
    template.variables.forEach(variable => {
      const value = getNestedValue(variables, variable);
      content = content.replace(new RegExp(`{${variable}}`, 'g'), value || '');
    });

    return content;
  }, [templates]);

  // Escalation operations
  const createEscalation = useCallback(async (escalationData: Omit<NotificationEscalation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEscalation: NotificationEscalation = {
      ...escalationData,
      id: `escalation-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setEscalations(prev => [...prev, newEscalation]);
  }, []);

  const updateEscalation = useCallback(async (id: string, updates: Partial<NotificationEscalation>) => {
    setEscalations(prev =>
      prev.map(escalation =>
        escalation.id === id
          ? { ...escalation, ...updates, updatedAt: new Date() }
          : escalation
      )
    );
  }, []);

  const deleteEscalation = useCallback(async (id: string) => {
    setEscalations(prev => prev.filter(escalation => escalation.id !== id));
    // Remove from rules that use this escalation
    setRules(prev =>
      prev.map(rule =>
        rule.escalationId === id ? { ...rule, escalationId: undefined } : rule
      )
    );
  }, []);

  // Schedule operations
  const createSchedule = useCallback(async (scheduleData: Omit<NotificationSchedule, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>) => {
    const nextRun = calculateNextRun(scheduleData.cronExpression, scheduleData.timezone);
    const newSchedule: NotificationSchedule = {
      ...scheduleData,
      id: `schedule-${Date.now()}`,
      nextRun,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSchedules(prev => [...prev, newSchedule]);
  }, []);

  const updateSchedule = useCallback(async (id: string, updates: Partial<NotificationSchedule>) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === id
          ? { ...schedule, ...updates, updatedAt: new Date() }
          : schedule
      )
    );
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  }, []);

  // Preference operations
  const createPreference = useCallback(async (preferenceData: Omit<NotificationPreference, 'createdAt' | 'updatedAt'>) => {
    const newPreference: NotificationPreference = {
      ...preferenceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPreferences(prev => {
      const existing = prev.findIndex(p => p.userId === preferenceData.userId);
      if (existing >= 0) {
        return prev.map((p, i) => i === existing ? newPreference : p);
      }
      return [...prev, newPreference];
    });
  }, []);

  const updatePreference = useCallback(async (userId: string, updates: Partial<NotificationPreference>) => {
    setPreferences(prev =>
      prev.map(preference =>
        preference.userId === userId
          ? { ...preference, ...updates, updatedAt: new Date() }
          : preference
      )
    );
  }, []);

  const deletePreference = useCallback(async (userId: string) => {
    setPreferences(prev => prev.filter(preference => preference.userId !== userId));
  }, []);

  // Analytics operations
  const getAnalytics = useCallback((ruleId: string) => {
    return analytics.find(a => a.ruleId === ruleId);
  }, [analytics]);

  const clearAnalytics = useCallback(async (ruleId: string) => {
    setAnalytics(prev =>
      prev.map(analytic =>
        analytic.ruleId === ruleId
          ? { ...analytic, totalSent: 0, totalFailed: 0, totalDelivered: 0, deliveryHistory: [] }
          : analytic
      )
    );
  }, []);

  // Bulk operations
  const exportRules = useCallback(async (): Promise<string> => {
    const exportData = {
      rules,
      channels,
      templates,
      escalations,
      schedules,
      preferences,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(exportData, null, 2);
  }, [rules, channels, templates, escalations, schedules, preferences]);

  const importRules = useCallback(async (data: string) => {
    try {
      const importData = JSON.parse(data);

      if (importData.rules) setRules(importData.rules);
      if (importData.channels) setChannels(importData.channels);
      if (importData.templates) setTemplates(importData.templates);
      if (importData.escalations) setEscalations(importData.escalations);
      if (importData.schedules) setSchedules(importData.schedules);
      if (importData.preferences) setPreferences(importData.preferences);
    } catch (err) {
      setError('Failed to import notification rules');
    }
  }, []);

  const bulkEnable = useCallback(async (ruleIds: string[]) => {
    setRules(prev =>
      prev.map(rule =>
        ruleIds.includes(rule.id) ? { ...rule, enabled: true, updatedAt: new Date() } : rule
      )
    );
  }, []);

  const bulkDisable = useCallback(async (ruleIds: string[]) => {
    setRules(prev =>
      prev.map(rule =>
        ruleIds.includes(rule.id) ? { ...rule, enabled: false, updatedAt: new Date() } : rule
      )
    );
  }, []);

  const bulkDelete = useCallback(async (ruleIds: string[]) => {
    setRules(prev => prev.filter(rule => !ruleIds.includes(rule.id)));
  }, []);

  // Rule engine
  const evaluateRule = useCallback((rule: NotificationRule, eventData: any): boolean => {
    switch (rule.triggerType) {
      case 'event':
        return evaluateEventCondition(rule.triggerConditions, eventData);
      case 'threshold':
        return evaluateThresholdCondition(rule.triggerConditions, eventData);
      case 'error':
        return evaluateErrorCondition(rule.triggerConditions, eventData);
      case 'custom':
        return evaluateCustomCondition(rule.triggerConditions, eventData);
      default:
        return false;
    }
  }, []);

  const triggerRule = useCallback(async (ruleId: string, eventData?: any) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || !rule.enabled) return;

    // Check throttling
    if (!checkThrottling(rule)) return;

    // Send notifications
    const deliveryAttempts: DeliveryAttempt[] = [];
    for (const channelId of rule.notificationChannels) {
      const channel = channels.find(c => c.id === channelId);
      if (channel) {
        const attempt = await sendNotification(channel, rule, eventData);
        deliveryAttempts.push(attempt);
      }
    }

    // Update analytics
    const updatedAnalytics = { ...rule.analytics };
    deliveryAttempts.forEach(attempt => {
      updatedAnalytics.totalSent++;
      if (attempt.status === 'delivered') updatedAnalytics.totalDelivered++;
      if (attempt.status === 'failed') updatedAnalytics.totalFailed++;
    });
    updatedAnalytics.deliveryHistory.push(...deliveryAttempts);
    updatedAnalytics.lastSent = new Date();

    await updateRule(ruleId, {
      lastTriggered: new Date(),
      analytics: updatedAnalytics
    });

    // Start escalation if configured
    if (rule.escalationId) {
      processEscalation(rule.escalationId, ruleId);
    }

    // Update throttling
    updateThrottling(rule.id);
  }, [rules, channels, updateRule]);

  const processEscalation = useCallback(async (escalationId: string, ruleId: string) => {
    const escalation = escalations.find(e => e.id === escalationId);
    if (!escalation || !escalation.enabled) return;

    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;

    escalation.steps.forEach((step, index) => {
      setTimeout(async () => {
        for (const channelId of step.channels) {
          const channel = channels.find(c => c.id === channelId);
          if (channel) {
            const recipients = step.recipients.length > 0 ? step.recipients : rule.recipients;
            await sendNotification(channel, rule, {}, recipients, step.messageOverride);
          }
        }
      }, step.delay * 60 * 1000); // Convert minutes to milliseconds
    });
  }, [escalations, rules, channels]);

  // Helper functions
  const evaluateEventCondition = (conditions: Record<string, any>, eventData: any): boolean => {
    for (const [key, value] of Object.entries(conditions)) {
      if (getNestedValue(eventData, key) !== value) return false;
    }
    return true;
  };

  const evaluateThresholdCondition = (conditions: Record<string, any>, eventData: any): boolean => {
    const { field, operator, threshold } = conditions;
    const actualValue = getNestedValue(eventData, field);

    switch (operator) {
      case '>': return actualValue > threshold;
      case '<': return actualValue < threshold;
      case '>=': return actualValue >= threshold;
      case '<=': return actualValue <= threshold;
      case '==': return actualValue === threshold;
      case '!=': return actualValue !== threshold;
      default: return false;
    }
  };

  const evaluateErrorCondition = (conditions: Record<string, any>, eventData: any): boolean => {
    return evaluateEventCondition(conditions, eventData);
  };

  const evaluateCustomCondition = (conditions: Record<string, any>, eventData: any): boolean => {
    // Custom evaluation logic can be implemented here
    return conditions.function ? conditions.function(eventData) : false;
  };

  const checkThrottling = (rule: NotificationRule): boolean => {
    const throttle = throttleMap.current.get(rule.id);
    if (!throttle) return true;

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (throttle.lastSent > hourAgo && throttle.hour >= rule.throttling.maxPerHour) return false;
    if (throttle.lastSent > dayAgo && throttle.day >= rule.throttling.maxPerDay) return false;

    const cooldownTime = new Date(throttle.lastSent.getTime() + rule.throttling.cooldownMinutes * 60 * 1000);
    if (now < cooldownTime) return false;

    return true;
  };

  const updateThrottling = (ruleId: string) => {
    const now = new Date();
    const throttle = throttleMap.current.get(ruleId) || { hour: 0, day: 0, lastSent: now };

    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    throttle.hour = throttle.lastSent > hourAgo ? throttle.hour + 1 : 1;
    throttle.day = throttle.lastSent > dayAgo ? throttle.day + 1 : 1;
    throttle.lastSent = now;

    throttleMap.current.set(ruleId, throttle);
  };

  const sendNotification = async (
    channel: NotificationChannel,
    rule: NotificationRule,
    eventData: any = {},
    recipients?: string[],
    messageOverride?: string
  ): Promise<DeliveryAttempt> => {
    const attempt: DeliveryAttempt = {
      id: `attempt-${Date.now()}-${Math.random()}`,
      ruleId: rule.id,
      channelId: channel.id,
      recipient: recipients?.[0] || rule.recipients[0] || '',
      status: 'pending',
      timestamp: new Date()
    };

    try {
      // Simulate sending notification
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

      attempt.status = Math.random() > 0.05 ? 'delivered' : 'failed'; // 95% success rate
      attempt.deliveryTime = Date.now() - attempt.timestamp.getTime();

      if (attempt.status === 'failed') {
        attempt.errorMessage = 'Delivery failed';
      }
    } catch (err) {
      attempt.status = 'failed';
      attempt.errorMessage = 'Network error';
    }

    return attempt;
  };

  const calculateNextRun = (cronExpression: string, timezone: string): Date => {
    // Simple cron parser for demo - in real app, use a proper cron library
    const parts = cronExpression.split(' ');
    const minute = parseInt(parts[0]);
    const hour = parseInt(parts[1]);

    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(hour, minute, 0, 0);

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun;
  };

  const generateTestData = (triggerType: string): any => {
    switch (triggerType) {
      case 'error':
        return { severity: 'high', message: 'Test error', source: 'discovery' };
      case 'threshold':
        return { value: 95, threshold: 90 };
      case 'event':
        return { type: 'test', data: 'sample data' };
      default:
        return {};
    }
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  return {
    // Core
    rules,
    isLoading,
    error,
    channels,
    templates,
    escalations,
    schedules,
    preferences,
    analytics,

    // Rule operations
    createRule,
    updateRule,
    deleteRule,
    enableRule,
    disableRule,
    testRule,
    validateRule,
    duplicateRule,

    // Channel operations
    createChannel,
    updateChannel,
    deleteChannel,
    testChannel,

    // Template operations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    renderTemplate,

    // Escalation operations
    createEscalation,
    updateEscalation,
    deleteEscalation,

    // Schedule operations
    createSchedule,
    updateSchedule,
    deleteSchedule,

    // Preference operations
    createPreference,
    updatePreference,
    deletePreference,

    // Analytics operations
    getAnalytics,
    clearAnalytics,

    // Bulk operations
    exportRules,
    importRules,
    bulkEnable,
    bulkDisable,
    bulkDelete,

    // Rule engine
    evaluateRule,
    triggerRule,
    processEscalation,
  };
}
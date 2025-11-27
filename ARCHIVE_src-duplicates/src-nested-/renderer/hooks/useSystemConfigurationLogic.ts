/**
 * System Configuration Logic Hook
 *
 * Manages system-wide configuration settings.
 */

import { useState, useEffect } from 'react';

export interface ConfigSection {
  id: string;
  name: string;
  description: string;
  settings: ConfigSetting[];
}

export interface ConfigSetting {
  key: string;
  label: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'select' | 'password';
  options?: string[];
  description?: string;
  required?: boolean;
  validation?: (value: any) => boolean;
  sensitive?: boolean;
}

export function useSystemConfigurationLogic() {
  const [configSections, setConfigSections] = useState<ConfigSection[]>([]);
  const [activeSection, setActiveSection] = useState<string>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Load from IPC
      const mockConfig: ConfigSection[] = [
        {
          id: 'general',
          name: 'General Settings',
          description: 'Basic application configuration',
          settings: [
            {
              key: 'appName',
              label: 'Application Name',
              value: 'M&A Discovery Suite',
              type: 'string',
              description: 'Display name of the application',
              required: true,
            },
            {
              key: 'defaultLanguage',
              label: 'Default Language',
              value: 'en',
              type: 'select',
              options: ['en', 'es', 'fr', 'de'],
              description: 'Default UI language',
            },
            {
              key: 'enableTelemetry',
              label: 'Enable Telemetry',
              value: true,
              type: 'boolean',
              description: 'Send anonymous usage data',
            },
          ],
        },
        {
          id: 'discovery',
          name: 'Discovery Settings',
          description: 'Configuration for discovery modules',
          settings: [
            {
              key: 'discoveryTimeout',
              label: 'Default Timeout (seconds)',
              value: 300,
              type: 'number',
              description: 'Default timeout for discovery operations',
              required: true,
            },
            {
              key: 'maxConcurrentDiscoveries',
              label: 'Max Concurrent Discoveries',
              value: 5,
              type: 'number',
              description: 'Maximum number of concurrent discovery operations',
            },
            {
              key: 'autoRetry',
              label: 'Auto Retry on Failure',
              value: true,
              type: 'boolean',
              description: 'Automatically retry failed discoveries',
            },
          ],
        },
        {
          id: 'security',
          name: 'Security Settings',
          description: 'Security and authentication configuration',
          settings: [
            {
              key: 'sessionTimeout',
              label: 'Session Timeout (minutes)',
              value: 60,
              type: 'number',
              description: 'Auto-logout after inactivity',
              required: true,
            },
            {
              key: 'requireMFA',
              label: 'Require Multi-Factor Authentication',
              value: false,
              type: 'boolean',
              description: 'Enforce MFA for all users',
            },
            {
              key: 'passwordPolicy',
              label: 'Password Policy',
              value: 'strong',
              type: 'select',
              options: ['weak', 'medium', 'strong'],
              description: 'Password complexity requirements',
            },
          ],
        },
        {
          id: 'logging',
          name: 'Logging Settings',
          description: 'Application logging configuration',
          settings: [
            {
              key: 'logLevel',
              label: 'Log Level',
              value: 'INFO',
              type: 'select',
              options: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
              description: 'Minimum log level to record',
            },
            {
              key: 'enableFileLogging',
              label: 'Enable File Logging',
              value: true,
              type: 'boolean',
              description: 'Write logs to file',
            },
            {
              key: 'maxLogFileSize',
              label: 'Max Log File Size (MB)',
              value: 10,
              type: 'number',
              description: 'Maximum size of log files before rotation',
            },
          ],
        },
        {
          id: 'performance',
          name: 'Performance Settings',
          description: 'Performance and optimization settings',
          settings: [
            {
              key: 'enableCaching',
              label: 'Enable Data Caching',
              value: true,
              type: 'boolean',
              description: 'Cache frequently accessed data',
            },
            {
              key: 'cacheSize',
              label: 'Cache Size (MB)',
              value: 100,
              type: 'number',
              description: 'Maximum cache size in memory',
            },
            {
              key: 'cacheExpiration',
              label: 'Cache Expiration (minutes)',
              value: 30,
              type: 'number',
              description: 'How long to keep cached data',
            },
          ],
        },
      ];

      setConfigSections(mockConfig);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (sectionId: string, settingKey: string, value: any) => {
    setConfigSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              settings: section.settings.map(setting =>
                setting.key === settingKey
                  ? { ...setting, value }
                  : setting
              ),
            }
          : section
      )
    );
    setHasChanges(true);
    setSuccess(null);
    setError(null);
  };

  const saveConfiguration = async () => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      // Validate all settings
      for (const section of configSections) {
        for (const setting of section.settings) {
          if (setting.required && !setting.value) {
            throw new Error(`${setting.label} is required`);
          }
          if (setting.validation && !setting.validation(setting.value)) {
            throw new Error(`Invalid value for ${setting.label}`);
          }
        }
      }

      // TODO: Save via IPC
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update IPC config if available
      if (window.electronAPI) {
        for (const section of configSections) {
          for (const setting of section.settings) {
            await window.electronAPI.setConfig(setting.key, setting.value);
          }
        }
      }

      setHasChanges(false);
      setSuccess('Configuration saved successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    setError(null);
    try {
      await loadConfiguration();
      setHasChanges(false);
      setSuccess('Configuration reset to defaults');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset configuration');
    }
  };

  const getActiveSection = (): ConfigSection | undefined => {
    return configSections.find(s => s.id === activeSection);
  };

  const getSetting = (sectionId: string, settingKey: string): ConfigSetting | undefined => {
    const section = configSections.find(s => s.id === sectionId);
    return section?.settings.find(s => s.key === settingKey);
  };

  const exportConfiguration = () => {
    const config: Record<string, any> = {};
    configSections.forEach(section => {
      section.settings.forEach(setting => {
        if (!setting.sensitive) {
          config[setting.key] = setting.value;
        }
      });
    });

    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system-configuration.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    configSections,
    activeSection,
    isLoading,
    isSaving,
    hasChanges,
    error,
    success,
    setActiveSection,
    updateSetting,
    saveConfiguration,
    resetToDefaults,
    getActiveSection,
    getSetting,
    exportConfiguration,
    refresh: loadConfiguration,
  };
}

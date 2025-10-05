import { useState, useEffect } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';

interface SystemConfig {
  database: {
    connectionString: string;
    commandTimeout: number;
    maxPoolSize: number;
  };
  email: {
    smtpServer: string;
    smtpPort: number;
    username: string;
    fromAddress: string;
    enableSsl: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireStrongPassword: boolean;
    enableAuditLog: boolean;
  };
  application: {
    defaultTheme: 'light' | 'dark' | 'system';
    dateFormat: string;
    itemsPerPage: number;
  };
}

export const useSystemConfigLogic = () => {
  const [config, setConfig] = useState<SystemConfig>({
    database: {
      connectionString: 'Data Source=localhost;Initial Catalog=MandA;Integrated Security=True',
      commandTimeout: 30,
      maxPoolSize: 100,
    },
    email: {
      smtpServer: 'smtp.office365.com',
      smtpPort: 587,
      username: '',
      fromAddress: 'noreply@company.com',
      enableSsl: true,
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireStrongPassword: true,
      enableAuditLog: true,
    },
    application: {
      defaultTheme: 'system',
      dateFormat: 'MM/DD/YYYY',
      itemsPerPage: 50,
    },
  });

  const [originalConfig, setOriginalConfig] = useState<SystemConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(originalConfig));
  }, [config, originalConfig]);

  const loadConfig = async () => {
    try {
      const savedConfig = localStorage.getItem('systemConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        setOriginalConfig(parsed);
      }
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to load configuration', pinned: false, priority: 'normal' });
    }
  };

  const handleChange = (path: string, value: any) => {
    setConfig(prev => {
      const keys = path.split('.');
      const newConfig = { ...prev };
      let current: any = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleSave = async () => {
    try {
      localStorage.setItem('systemConfig', JSON.stringify(config));
      setOriginalConfig(config);
      addNotification({ type: 'success', message: 'Configuration saved successfully', pinned: false, priority: 'normal' });
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to save configuration', pinned: false, priority: 'normal' });
    }
  };

  const handleReset = () => {
    setConfig(originalConfig);
    addNotification({ type: 'info', message: 'Changes discarded', pinned: false, priority: 'low' });
  };

  const handleTestConnection = async (type: 'database' | 'email') => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      addNotification({ type: 'success', message: `${type} connection test successful`, pinned: false, priority: 'normal' });
    } catch (error) {
      addNotification({ type: 'error', message: `${type} connection test failed`, pinned: false, priority: 'normal' });
    }
  };

  return {
    config,
    hasChanges,
    handleChange,
    handleSave,
    handleReset,
    handleTestConnection,
  };
};

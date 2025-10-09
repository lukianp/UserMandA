import React from 'react';
import { Settings, Save, RotateCcw, Database, Mail, Shield, Globe } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { Checkbox } from '../../components/atoms/Checkbox';
import { useSystemConfigLogic } from '../../hooks/useSystemConfigLogic';

export const SystemConfigurationView: React.FC = () => {
  const {
    config,
    hasChanges,
    handleChange,
    handleSave,
    handleReset,
    handleTestConnection,
  } = useSystemConfigLogic();

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Configuration</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure global application settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<RotateCcw />} onClick={handleReset} disabled={!hasChanges}>
            Reset
          </Button>
          <Button variant="primary" icon={<Save />} onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Database Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Settings
        </h2>
        <div className="space-y-4">
          <Input
            label="Connection String"
            value={config.database.connectionString}
            onChange={(value) => handleChange('database.connectionString', value)}
            placeholder="Data Source=..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Command Timeout (seconds)"
              type="number"
              value={config.database.commandTimeout}
              onChange={(e) => handleChange('database.commandTimeout', parseInt(e.target.value))}
            />
            <Input
              label="Max Pool Size"
              type="number"
              value={config.database.maxPoolSize}
              onChange={(e) => handleChange('database.maxPoolSize', parseInt(e.target.value))}
            />
          </div>
          <Button variant="secondary" onClick={() => handleTestConnection('database')}>
            Test Connection
          </Button>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Settings
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SMTP Server"
              value={config.email.smtpServer}
              onChange={(value) => handleChange('email.smtpServer', value)}
            />
            <Input
              label="SMTP Port"
              type="number"
              value={config.email.smtpPort}
              onChange={(e) => handleChange('email.smtpPort', parseInt(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Username"
              value={config.email.username}
              onChange={(value) => handleChange('email.username', value)}
            />
            <Input
              label="From Address"
              type="email"
              value={config.email.fromAddress}
              onChange={(value) => handleChange('email.fromAddress', value)}
            />
          </div>
          <Checkbox
            label="Enable SSL"
            checked={config.email.enableSsl}
            onChange={(checked) => handleChange('email.enableSsl', checked)}
          />
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Settings
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Session Timeout (minutes)"
              type="number"
              value={config.security.sessionTimeout}
              onChange={(e) => handleChange('security.sessionTimeout', parseInt(e.target.value))}
            />
            <Input
              label="Max Login Attempts"
              type="number"
              value={config.security.maxLoginAttempts}
              onChange={(e) => handleChange('security.maxLoginAttempts', parseInt(e.target.value))}
            />
          </div>
          <Checkbox
            label="Require Strong Passwords"
            checked={config.security.requireStrongPassword}
            onChange={(checked) => handleChange('security.requireStrongPassword', checked)}
          />
          <Checkbox
            label="Enable Audit Logging"
            checked={config.security.enableAuditLog}
            onChange={(checked) => handleChange('security.enableAuditLog', checked)}
          />
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Application Settings
        </h2>
        <div className="space-y-4">
          <Select
            label="Default Theme"
            value={config.application.defaultTheme}
            onChange={(value) => handleChange('application.defaultTheme', value)}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ]}
          />
          <Select
            label="Date Format"
            value={config.application.dateFormat}
            onChange={(value) => handleChange('application.dateFormat', value)}
            options={[
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
            ]}
          />
          <Input
            label="Items Per Page"
            type="number"
            value={config.application.itemsPerPage}
            onChange={(e) => handleChange('application.itemsPerPage', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};


export default SystemConfigurationView;

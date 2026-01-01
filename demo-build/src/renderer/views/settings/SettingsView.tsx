/**
 * Settings View
 * Application settings and preferences
 */

import * as React from 'react';
import { useState } from 'react';
import { Save, RotateCcw, Settings as SettingsIcon, CheckCircle, Cloud } from 'lucide-react';

import { useSettingsLogic } from '../../hooks/useSettingsLogic';
import { useThemeStore } from '../../store/useThemeStore';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { Checkbox } from '../../components/atoms/Checkbox';
import { AppRegistrationDialog } from '../../components/organisms/AppRegistrationDialog';

const SettingsView: React.FC = () => {
  const {
    settings,
    updateSetting,
    updateThemeSetting,
    saveSettings,
    resetSettings,
    isSaving,
    hasChanges,
    saveSuccess,
  } = useSettingsLogic();

  const { mode, setMode } = useThemeStore();
  const [isAppRegistrationDialogOpen, setIsAppRegistrationDialogOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="settings-view" data-testid="settings-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure application preferences and behavior
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={resetSettings}
              icon={<RotateCcw className="w-4 h-4" />}
              data-cy="reset-btn" data-testid="reset-btn"
            >
              Reset to Defaults
            </Button>
            <Button
              variant="primary"
              onClick={saveSettings}
              disabled={!hasChanges}
              loading={isSaving}
              icon={<Save className="w-4 h-4" />}
              data-cy="save-btn" data-testid="save-btn"
            >
              Save Changes
            </Button>
          </div>
        </div>
        {saveSuccess && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Appearance
            </h2>
            <div className="space-y-4">
              <Select
                label="Theme Mode"
                value={mode}
                onChange={(value) => setMode(value as 'light' | 'dark' | 'system')}
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark (Default)' },
                  { value: 'system', label: 'System' },
                ]}
                data-cy="theme-mode-select" data-testid="theme-mode-select"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Accent Color"
                  type="color"
                  value={settings.theme.accentColor}
                  onChange={(e) => updateThemeSetting('accentColor', e.target.value)}
                  data-cy="accent-color-input" data-testid="accent-color-input"
                />

                <Input
                  label="Font Size (px)"
                  type="number"
                  value={settings.theme.fontSize.toString()}
                  onChange={(e) => updateThemeSetting('fontSize', parseInt(e.target.value) || 14)}
                  min={10}
                  max={24}
                  data-cy="font-size-input" data-testid="font-size-input"
                />
              </div>

              <Input
                label="Font Family"
                value={settings.theme.fontFamily}
                onChange={(e) => updateThemeSetting('fontFamily', e.target.value)}
                data-cy="font-family-input" data-testid="font-family-input"
              />

              <Checkbox
                label="Enable Animations"
                checked={settings.theme.useAnimations}
                onChange={(checked) => updateThemeSetting('useAnimations', checked)}
                data-cy="animations-checkbox" data-testid="animations-checkbox"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Window Opacity
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={settings.theme.windowOpacity}
                  onChange={(e) => updateThemeSetting('windowOpacity', parseFloat(e.target.value))}
                  className="w-full"
                  data-cy="opacity-slider" data-testid="opacity-slider"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(settings.theme.windowOpacity * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Dashboard Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Dashboard
            </h2>
            <div className="space-y-4">
              <Checkbox
                label="Auto-refresh Dashboard"
                checked={settings.autoRefreshDashboard}
                onChange={(checked) => updateSetting('autoRefreshDashboard', checked)}
                data-cy="auto-refresh-checkbox" data-testid="auto-refresh-checkbox"
              />

              {settings.autoRefreshDashboard && (
                <Input
                  label="Refresh Interval (seconds)"
                  type="number"
                  value={settings.refreshInterval.toString()}
                  onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value) || 30)}
                  min={10}
                  max={300}
                  data-cy="refresh-interval-input" data-testid="refresh-interval-input"
                />
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notifications
            </h2>
            <Checkbox
              label="Enable Notifications"
              checked={settings.enableNotifications}
              onChange={(checked) => updateSetting('enableNotifications', checked)}
              description="Receive notifications for completed operations and errors"
              data-cy="notifications-checkbox" data-testid="notifications-checkbox"
            />
          </div>

          {/* Export Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Data Export
            </h2>
            <Select
              label="Default Export Format"
              value={settings.defaultExportFormat}
              onChange={(value) => updateSetting('defaultExportFormat', value as 'CSV' | 'JSON' | 'XLSX')}
              options={[
                { value: 'CSV', label: 'CSV (Comma-Separated Values)' },
                { value: 'JSON', label: 'JSON (JavaScript Object Notation)' },
                { value: 'XLSX', label: 'XLSX (Excel Workbook)' },
              ]}
              data-cy="export-format-select" data-testid="export-format-select"
            />
          </div>

          {/* Azure/Cloud Integration */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Azure & Cloud Integration
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure Azure AD app registrations for cloud discovery and migration tasks.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsAppRegistrationDialogOpen(true)}
                icon={<Cloud className="w-4 h-4" />}
                data-cy="setup-app-registration-btn" data-testid="setup-app-registration-btn"
              >
                Setup Azure App Registration
              </Button>
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> You need Global Administrator rights in Azure AD to complete this setup.
                  The script will create an app registration with the necessary Microsoft Graph API permissions.
                </p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Application:</strong> Enterprise Discovery & Migration Suite</p>
              <p><strong>Version:</strong> 2.0.0</p>
              <p><strong>Framework:</strong> Electron + React + TypeScript</p>
              <p><strong>Build:</strong> {process.env.NODE_ENV}</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Registration Dialog */}
      <AppRegistrationDialog
        isOpen={isAppRegistrationDialogOpen}
        onClose={() => setIsAppRegistrationDialogOpen(false)}
      />
    </div>
  );
};

export default SettingsView;



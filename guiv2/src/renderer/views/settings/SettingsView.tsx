/**
 * Settings View
 * Application settings and preferences
 */

import React from 'react';
import { useSettingsLogic } from '../../hooks/useSettingsLogic';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import Checkbox from '../../components/atoms/Checkbox';
import { Save, RotateCcw, Settings as SettingsIcon, CheckCircle } from 'lucide-react';

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

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="settings-view">
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
              data-cy="reset-btn"
            >
              Reset to Defaults
            </Button>
            <Button
              variant="primary"
              onClick={saveSettings}
              disabled={!hasChanges}
              loading={isSaving}
              icon={<Save className="w-4 h-4" />}
              data-cy="save-btn"
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
              <Checkbox
                label="Dark Theme"
                checked={settings.theme.isDarkTheme}
                onChange={(checked) => updateThemeSetting('isDarkTheme', checked)}
                data-cy="dark-theme-checkbox"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Accent Color"
                  type="color"
                  value={settings.theme.accentColor}
                  onChange={(e) => updateThemeSetting('accentColor', e.target.value)}
                  data-cy="accent-color-input"
                />

                <Input
                  label="Font Size (px)"
                  type="number"
                  value={settings.theme.fontSize.toString()}
                  onChange={(e) => updateThemeSetting('fontSize', parseInt(e.target.value) || 14)}
                  min={10}
                  max={24}
                  data-cy="font-size-input"
                />
              </div>

              <Input
                label="Font Family"
                value={settings.theme.fontFamily}
                onChange={(e) => updateThemeSetting('fontFamily', e.target.value)}
                data-cy="font-family-input"
              />

              <Checkbox
                label="Enable Animations"
                checked={settings.theme.useAnimations}
                onChange={(checked) => updateThemeSetting('useAnimations', checked)}
                data-cy="animations-checkbox"
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
                  data-cy="opacity-slider"
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
                data-cy="auto-refresh-checkbox"
              />

              {settings.autoRefreshDashboard && (
                <Input
                  label="Refresh Interval (seconds)"
                  type="number"
                  value={settings.refreshInterval.toString()}
                  onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value) || 30)}
                  min={10}
                  max={300}
                  data-cy="refresh-interval-input"
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
              data-cy="notifications-checkbox"
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
              data-cy="export-format-select"
            />
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Application:</strong> M&A Discovery Suite</p>
              <p><strong>Version:</strong> 2.0.0</p>
              <p><strong>Framework:</strong> Electron + React + TypeScript</p>
              <p><strong>Build:</strong> {process.env.NODE_ENV}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

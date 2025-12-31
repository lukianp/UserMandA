/**
 * Settings Dialog Component
 * Application settings modal with tabs for different settings categories
 */

import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';

import { Button } from '../atoms/Button';
import Checkbox from '../atoms/Checkbox';
import { Select } from '../atoms/Select';
import { Input } from '../atoms/Input';

export interface SettingsDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close dialog handler */
  onClose: () => void;
  /** Save settings handler */
  onSave: (settings: any) => void;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * Settings Dialog Component
 */
const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  'data-cy': dataCy = 'settings-dialog',
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'discovery' | 'migration'>('general');
  const [settings, setSettings] = useState({
    theme: 'system',
    autoSave: true,
    notifications: true,
    defaultTimeout: 60000,
    maxRetries: 3,
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" data-cy={dataCy}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            data-cy="close-settings-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('discovery')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'discovery'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            Discovery
          </button>
          <button
            onClick={() => setActiveTab('migration')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'migration'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            Migration
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <Select
                label="Theme"
                value={settings.theme}
                onChange={(value: string) => setSettings({ ...settings, theme: value })}
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'system', label: 'System' },
                ]}
              />
              <Checkbox
                label="Auto-save settings"
                checked={settings.autoSave}
                onChange={(value: boolean) => setSettings({ ...settings, autoSave: value })}
              />
              <Checkbox
                label="Enable notifications"
                checked={settings.notifications}
                onChange={(value: boolean) => setSettings({ ...settings, notifications: value })}
              />
            </div>
          )}

          {activeTab === 'discovery' && (
            <div className="space-y-4">
              <Input
                label="Default Timeout (ms)"
                type="number"
                value={settings.defaultTimeout.toString()}
                onChange={(e) => setSettings({ ...settings, defaultTimeout: parseInt(e.target.value) })}
              />
              <Input
                label="Max Retries"
                type="number"
                value={settings.maxRetries.toString()}
                onChange={(e) => setSettings({ ...settings, maxRetries: parseInt(e.target.value) })}
              />
            </div>
          )}

          {activeTab === 'migration' && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">Migration settings coming soon...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose} data-cy="cancel-settings-btn">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} data-cy="save-settings-btn">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;



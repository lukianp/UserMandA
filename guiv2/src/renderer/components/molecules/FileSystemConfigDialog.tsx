/**
 * File System Discovery Configuration Dialog
 * Modal dialog for configuring file system discovery parameters
 */

import * as React from 'react';
import { X, Server, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import Checkbox from '../atoms/Checkbox';
import type { FileSystemDiscoveryConfig } from '../../types/models/filesystem';

export interface FileSystemConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: FileSystemDiscoveryConfig;
  onSave: (config: FileSystemDiscoveryConfig) => void;
}

export const FileSystemConfigDialog: React.FC<FileSystemConfigDialogProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [localConfig, setLocalConfig] = React.useState<FileSystemDiscoveryConfig>(config);
  const [newServer, setNewServer] = React.useState('');
  const [errors, setErrors] = React.useState<string[]>([]);

  // Update local config when prop changes
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleAddServer = () => {
    if (!newServer.trim()) {
      setErrors(['Server name cannot be empty']);
      return;
    }

    // Validate server format (basic check)
    const serverName = newServer.trim();
    if (localConfig.servers.includes(serverName)) {
      setErrors([`Server "${serverName}" is already in the list`]);
      return;
    }

    setLocalConfig({
      ...localConfig,
      servers: [...localConfig.servers, serverName],
    });
    setNewServer('');
    setErrors([]);
  };

  const handleRemoveServer = (index: number) => {
    setLocalConfig({
      ...localConfig,
      servers: localConfig.servers.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    // Validate configuration
    const validationErrors: string[] = [];

    if (localConfig.servers.length === 0) {
      validationErrors.push('At least one server must be configured');
    }

    if (localConfig.largeFileThresholdMB < 1) {
      validationErrors.push('Large file threshold must be at least 1 MB');
    }

    if (localConfig.maxDepth < 1) {
      validationErrors.push('Max depth must be at least 1');
    }

    if (localConfig.timeout < 60) {
      validationErrors.push('Timeout must be at least 60 seconds');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave(localConfig);
    setErrors([]);
    onClose();
  };

  const handleCancel = () => {
    setLocalConfig(config);
    setErrors([]);
    setNewServer('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            File System Discovery Configuration
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Error Display */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                    Configuration Errors
                  </h3>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Servers Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Servers
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Add server names or IP addresses to scan. Supports UNC paths (e.g., \\SERVER01) or FQDN (e.g., fileserver.domain.com)
            </p>

            {/* Add Server Input */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <Input
                  type="text"
                  value={newServer}
                  onChange={(e) => setNewServer(e.target.value)}
                  placeholder="\\SERVER01 or fileserver.domain.com"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddServer();
                    }
                  }}
                />
              </div>
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddServer}
              >
                Add
              </Button>
            </div>

            {/* Server List */}
            <div className="space-y-2">
              {localConfig.servers.length === 0 ? (
                <div className="text-center py-4 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Server className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No servers configured. Add at least one server to begin discovery.
                  </p>
                </div>
              ) : (
                localConfig.servers.map((server, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {server}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveServer(index)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scan Options */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Scan Options
            </h3>
            <div className="space-y-3">
              <Checkbox
                label="Include Hidden Shares"
                checked={localConfig.includeHiddenShares}
                onChange={(checked) =>
                  setLocalConfig({ ...localConfig, includeHiddenShares: checked })
                }
              />
              <Checkbox
                label="Include Administrative Shares (C$, ADMIN$, etc.)"
                checked={localConfig.includeAdministrativeShares}
                onChange={(checked) =>
                  setLocalConfig({ ...localConfig, includeAdministrativeShares: checked })
                }
              />
              <Checkbox
                label="Scan Permissions"
                checked={localConfig.scanPermissions}
                onChange={(checked) =>
                  setLocalConfig({ ...localConfig, scanPermissions: checked })
                }
              />
              <Checkbox
                label="Scan for Large Files"
                checked={localConfig.scanLargeFiles}
                onChange={(checked) =>
                  setLocalConfig({ ...localConfig, scanLargeFiles: checked })
                }
              />
              <Checkbox
                label="Analyze Storage Statistics"
                checked={localConfig.analyzeStorage}
                onChange={(checked) =>
                  setLocalConfig({ ...localConfig, analyzeStorage: checked })
                }
              />
              <Checkbox
                label="Detect Security Risks"
                checked={localConfig.detectSecurityRisks}
                onChange={(checked) =>
                  setLocalConfig({ ...localConfig, detectSecurityRisks: checked })
                }
              />
            </div>
          </div>

          {/* Advanced Options */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Advanced Options
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Large File Threshold (MB)"
                type="number"
                value={localConfig.largeFileThresholdMB.toString()}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    largeFileThresholdMB: parseInt(e.target.value) || 100,
                  })
                }
                min={1}
                max={10000}
              />
              <Input
                label="Max Scan Depth"
                type="number"
                value={localConfig.maxDepth.toString()}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    maxDepth: parseInt(e.target.value) || 5,
                  })
                }
                min={1}
                max={20}
                helperText="Maximum directory depth to scan"
              />
              <Input
                label="Timeout (seconds)"
                type="number"
                value={localConfig.timeout.toString()}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    timeout: parseInt(e.target.value) || 3600,
                  })
                }
                min={60}
                max={7200}
              />
              <Input
                label="Parallel Scans"
                type="number"
                value={localConfig.parallelScans.toString()}
                onChange={(e) =>
                  setLocalConfig({
                    ...localConfig,
                    parallelScans: parseInt(e.target.value) || 4,
                  })
                }
                min={1}
                max={10}
                helperText="Number of concurrent share scans"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileSystemConfigDialog;

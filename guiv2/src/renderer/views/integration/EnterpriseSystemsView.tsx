/**
 * Enterprise Systems Integration View
 *
 * Provides UI for connecting to and extracting data from enterprise systems:
 * - ServiceNow (ITSM, CMDB)
 * - Jira/Atlassian
 * - Workday (HCM)
 * - LeanIX (Enterprise Architecture)
 *
 * Phase 10: Enterprise Systems Integration
 */

import React, { useState, useCallback } from 'react';
import {
  Cloud,
  Database,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  Loader,
  RefreshCw,
  Download,
  Settings,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

import { useEnterpriseSystemsLogic } from '../../hooks/useEnterpriseSystemsLogic';
import { Button } from '../../components/atoms/Button';

// ===== CONFIG FORM COMPONENTS =====

interface ServiceNowFormProps {
  onSave: (config: any) => void;
  onCancel: () => void;
  initialConfig?: any;
}

const ServiceNowConfigForm: React.FC<ServiceNowFormProps> = ({ onSave, onCancel, initialConfig }) => {
  const [config, setConfig] = useState({
    instanceUrl: initialConfig?.instanceUrl || '',
    username: initialConfig?.username || '',
    password: initialConfig?.password || '',
    useOAuth: initialConfig?.useOAuth || false,
    clientId: initialConfig?.clientId || '',
    clientSecret: initialConfig?.clientSecret || '',
  });

  return (
    <div className="space-y-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
      <h4 className="font-medium text-[var(--text-primary)]">ServiceNow Configuration</h4>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">Instance URL</label>
        <input
          type="text"
          value={config.instanceUrl}
          onChange={(e) => setConfig({ ...config, instanceUrl: e.target.value })}
          placeholder="https://yourinstance.service-now.com"
          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Username</label>
          <input
            type="text"
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Password</label>
          <input
            type="password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="useOAuth"
          checked={config.useOAuth}
          onChange={(e) => setConfig({ ...config, useOAuth: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="useOAuth" className="text-sm text-[var(--text-secondary)]">
          Use OAuth Authentication
        </label>
      </div>

      {config.useOAuth && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Client ID</label>
            <input
              type="text"
              value={config.clientId}
              onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Client Secret</label>
            <input
              type="password"
              value={config.clientSecret}
              onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={() => onSave(config)}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

const JiraConfigForm: React.FC<ServiceNowFormProps> = ({ onSave, onCancel, initialConfig }) => {
  const [config, setConfig] = useState({
    baseUrl: initialConfig?.baseUrl || '',
    email: initialConfig?.email || '',
    apiToken: initialConfig?.apiToken || '',
  });

  return (
    <div className="space-y-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
      <h4 className="font-medium text-[var(--text-primary)]">Jira Configuration</h4>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">Jira URL</label>
        <input
          type="text"
          value={config.baseUrl}
          onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
          placeholder="https://yourcompany.atlassian.net"
          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">Email</label>
        <input
          type="email"
          value={config.email}
          onChange={(e) => setConfig({ ...config, email: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">API Token</label>
        <input
          type="password"
          value={config.apiToken}
          onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
          placeholder="Generate from Atlassian Account Settings"
          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={() => onSave(config)}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

const WorkdayConfigForm: React.FC<ServiceNowFormProps> = ({ onSave, onCancel, initialConfig }) => {
  const [config, setConfig] = useState({
    tenantUrl: initialConfig?.tenantUrl || '',
    username: initialConfig?.username || '',
    password: initialConfig?.password || '',
    clientId: initialConfig?.clientId || '',
    clientSecret: initialConfig?.clientSecret || '',
  });

  return (
    <div className="space-y-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
      <h4 className="font-medium text-[var(--text-primary)]">Workday Configuration</h4>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">Tenant URL</label>
        <input
          type="text"
          value={config.tenantUrl}
          onChange={(e) => setConfig({ ...config, tenantUrl: e.target.value })}
          placeholder="https://wd2-impl-services1.workday.com/ccx/service/tenant"
          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Integration Username</label>
          <input
            type="text"
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Password</label>
          <input
            type="password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Client ID (OAuth)</label>
          <input
            type="text"
            value={config.clientId}
            onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Client Secret</label>
          <input
            type="password"
            value={config.clientSecret}
            onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={() => onSave(config)}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

const LeanIXConfigForm: React.FC<ServiceNowFormProps> = ({ onSave, onCancel, initialConfig }) => {
  const [config, setConfig] = useState({
    instanceUrl: initialConfig?.instanceUrl || '',
    apiToken: initialConfig?.apiToken || '',
    workspaceId: initialConfig?.workspaceId || '',
  });

  return (
    <div className="space-y-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
      <h4 className="font-medium text-[var(--text-primary)]">LeanIX Configuration</h4>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">Instance URL</label>
        <input
          type="text"
          value={config.instanceUrl}
          onChange={(e) => setConfig({ ...config, instanceUrl: e.target.value })}
          placeholder="https://yourworkspace.leanix.net"
          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">API Token</label>
        <input
          type="password"
          value={config.apiToken}
          onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
          placeholder="Generate from LeanIX Administration"
          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--text-secondary)] mb-1">Workspace ID (Optional)</label>
        <input
          type="text"
          value={config.workspaceId}
          onChange={(e) => setConfig({ ...config, workspaceId: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={() => onSave(config)}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

// ===== MAIN VIEW COMPONENT =====

const EnterpriseSystemsView: React.FC = () => {
  const {
    configs,
    connectionStatus,
    extractionResults,
    isExtracting,
    currentExtraction,
    progress,
    error,
    updateConfig,
    clearConfig,
    testServiceNowConnection,
    testJiraConnection,
    testWorkdayConnection,
    testLeanIXConnection,
    extractServiceNowData,
    extractJiraData,
    extractWorkdayData,
    extractLeanIXData,
    clearResults,
    exportResultsToCSV,
    connectedSystems,
    totalExtractedRecords,
    selectedProfile,
  } = useEnterpriseSystemsLogic();

  const [expandedSystems, setExpandedSystems] = useState<Record<string, boolean>>({
    serviceNow: false,
    jira: false,
    workday: false,
    leanIX: false,
  });

  const [showConfigForm, setShowConfigForm] = useState<string | null>(null);

  const toggleSystem = useCallback((system: string) => {
    setExpandedSystems((prev) => ({ ...prev, [system]: !prev[system] }));
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'connecting':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Cloud className="w-5 h-5 text-gray-400" />;
    }
  };

  const systemConfigs = [
    {
      id: 'serviceNow',
      name: 'ServiceNow',
      icon: <Database className="w-6 h-6" />,
      description: 'IT Service Management, CMDB, HR Service Delivery',
      dataTypes: ['cmdb', 'incidents', 'users', 'requests', 'changes'],
      testConnection: testServiceNowConnection,
      extractData: extractServiceNowData,
      ConfigForm: ServiceNowConfigForm,
    },
    {
      id: 'jira',
      name: 'Jira / Atlassian',
      icon: <Building2 className="w-6 h-6" />,
      description: 'Project Management, Service Desk, Agile Boards',
      dataTypes: ['projects', 'issues', 'users', 'boards'],
      testConnection: testJiraConnection,
      extractData: extractJiraData,
      ConfigForm: JiraConfigForm,
    },
    {
      id: 'workday',
      name: 'Workday',
      icon: <Users className="w-6 h-6" />,
      description: 'Human Capital Management, Finance, Payroll',
      dataTypes: ['employees', 'costCenters', 'organizations', 'positions'],
      testConnection: testWorkdayConnection,
      extractData: extractWorkdayData,
      ConfigForm: WorkdayConfigForm,
    },
    {
      id: 'leanIX',
      name: 'LeanIX',
      icon: <Cloud className="w-6 h-6" />,
      description: 'Enterprise Architecture Management',
      dataTypes: ['Application', 'ITComponent', 'Interface', 'DataObject', 'BusinessCapability'],
      testConnection: testLeanIXConnection,
      extractData: extractLeanIXData,
      ConfigForm: LeanIXConfigForm,
    },
  ];

  return (
    <div className="p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Enterprise Systems Integration</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Connect to enterprise systems for comprehensive M&A due diligence data extraction
          </p>
        </div>
        <div className="flex items-center gap-4">
          {connectedSystems.length > 0 && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-sm">
              {connectedSystems.length} system{connectedSystems.length > 1 ? 's' : ''} connected
            </span>
          )}
          {totalExtractedRecords > 0 && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm">
              {totalExtractedRecords.toLocaleString()} records extracted
            </span>
          )}
        </div>
      </div>

      {/* Profile Warning */}
      {!selectedProfile && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-yellow-700 dark:text-yellow-400">
            Please select a source profile before configuring enterprise system integrations.
          </span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* Extraction Progress */}
      {isExtracting && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Extracting data from {currentExtraction}...
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-300">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-blue-200 dark:bg-blue-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Systems Grid */}
      <div className="space-y-4">
        {systemConfigs.map((system) => {
          const isExpanded = expandedSystems[system.id];
          const status = connectionStatus[system.id];
          const config = configs[system.id as keyof typeof configs];
          const isShowingConfig = showConfigForm === system.id;

          return (
            <div
              key={system.id}
              className="border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-primary)]"
            >
              {/* System Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-secondary)]"
                onClick={() => toggleSystem(system.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-[var(--bg-secondary)]">{system.icon}</div>
                  <div>
                    <h3 className="font-medium text-[var(--text-primary)]">{system.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{system.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusIcon(status)}
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 border-t border-[var(--border)] space-y-4">
                  {/* Config Form */}
                  {isShowingConfig ? (
                    <system.ConfigForm
                      onSave={(newConfig) => {
                        updateConfig(system.id as any, newConfig);
                        setShowConfigForm(null);
                      }}
                      onCancel={() => setShowConfigForm(null)}
                      initialConfig={config}
                    />
                  ) : (
                    <>
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowConfigForm(system.id);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          {config ? 'Edit Config' : 'Configure'}
                        </Button>

                        {config && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                system.testConnection();
                              }}
                              disabled={status === 'connecting'}
                            >
                              <RefreshCw
                                className={`w-4 h-4 mr-2 ${status === 'connecting' ? 'animate-spin' : ''}`}
                              />
                              Test Connection
                            </Button>

                            {status === 'connected' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  system.extractData(system.dataTypes as any);
                                }}
                                disabled={isExtracting}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Extract All Data
                              </Button>
                            )}

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearConfig(system.id as any);
                              }}
                            >
                              Clear Config
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Data Types */}
                      {status === 'connected' && (
                        <div className="grid grid-cols-5 gap-2">
                          {system.dataTypes.map((dataType) => (
                            <button
                              key={dataType}
                              className="px-3 py-2 text-sm bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border)] rounded transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                system.extractData([dataType] as any);
                              }}
                              disabled={isExtracting}
                            >
                              {dataType}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Results for this system */}
                      {extractionResults.filter((r) => r.system === system.id).length > 0 && (
                        <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg">
                          <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                            Extraction Results
                          </h4>
                          <div className="space-y-1">
                            {extractionResults
                              .filter((r) => r.system === system.id)
                              .map((result, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <span className="text-[var(--text-secondary)]">
                                    {result.dataType}
                                  </span>
                                  <span
                                    className={
                                      result.status === 'success'
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                    }
                                  >
                                    {result.recordCount} records
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Results Summary */}
      {extractionResults.length > 0 && (
        <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[var(--text-primary)]">All Extraction Results</h3>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => exportResultsToCSV(extractionResults)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export All to CSV
              </Button>
              <Button variant="secondary" size="sm" onClick={clearResults}>
                Clear Results
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 text-[var(--text-secondary)]">System</th>
                  <th className="text-left py-2 text-[var(--text-secondary)]">Data Type</th>
                  <th className="text-right py-2 text-[var(--text-secondary)]">Records</th>
                  <th className="text-left py-2 text-[var(--text-secondary)]">Status</th>
                  <th className="text-left py-2 text-[var(--text-secondary)]">Extracted At</th>
                </tr>
              </thead>
              <tbody>
                {extractionResults.map((result, idx) => (
                  <tr key={idx} className="border-b border-[var(--border)]">
                    <td className="py-2 text-[var(--text-primary)] capitalize">{result.system}</td>
                    <td className="py-2 text-[var(--text-primary)]">{result.dataType}</td>
                    <td className="py-2 text-right text-[var(--text-primary)]">
                      {result.recordCount.toLocaleString()}
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          result.status === 'success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {result.status}
                      </span>
                    </td>
                    <td className="py-2 text-[var(--text-secondary)]">
                      {result.extractedAt.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseSystemsView;

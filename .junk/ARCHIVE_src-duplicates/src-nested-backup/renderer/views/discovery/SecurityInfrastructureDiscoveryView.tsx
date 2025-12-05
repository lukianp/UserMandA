/**
 * Security Infrastructure Discovery View
 * Comprehensive UI for discovering security infrastructure, policies, incidents, and vulnerabilities
 */

import React from 'react';
import {
  Download,
  Play,
  Square,
  Save,
  Settings,
  RefreshCw,
  Shield,
  Server,
  FileText,
  AlertTriangle,
  Bug,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity,
  Award,
} from 'lucide-react';

import { useSecurityInfrastructureDiscoveryLogic } from '../../hooks/useSecurityInfrastructureDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import SearchBar from '../../components/molecules/SearchBar';
import { Button } from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';
import ProgressBar from '../../components/molecules/ProgressBar';

/**
 * Security Infrastructure Discovery View Component
 */
const SecurityInfrastructureDiscoveryView: React.FC = () => {
  const {
    config,
    templates,
    currentResult,
    isDiscovering,
    progress,
    selectedTab,
    searchText,
    filteredData,
    columnDefs,
    errors,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    loadTemplate,
    saveAsTemplate,
    exportResults,
    setSelectedTab,
    setSearchText,
  } = useSecurityInfrastructureDiscoveryLogic();

  const getSeverityColor = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="security-discovery-view" data-testid="security-discovery-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Security Infrastructure Discovery
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover security devices, policies, incidents, vulnerabilities, and compliance status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Template Selector */}
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                if (template) loadTemplate(template);
              }}
              disabled={isDiscovering}
            >
              <option value="">Select Template...</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>

            <Button
              variant="secondary"
              icon={<Settings />}
              onClick={() => {/* TODO: Open config dialog */}}
              disabled={isDiscovering}
              data-cy="config-btn" data-testid="config-btn"
            >
              Configure
            </Button>

            <Button
              variant="secondary"
              icon={<Save />}
              onClick={() => {/* TODO: Open save template dialog */}}
              disabled={isDiscovering}
              data-cy="save-template-btn" data-testid="save-template-btn"
            >
              Save Template
            </Button>

            {isDiscovering ? (
              <Button
                variant="danger"
                icon={<Square />}
                onClick={cancelDiscovery}
                data-cy="cancel-btn" data-testid="cancel-btn"
              >
                Cancel
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={<Play />}
                onClick={startDiscovery}
                data-cy="start-discovery-btn" data-testid="start-discovery-btn"
              >
                Start Discovery
              </Button>
            )}

            <Button
              variant="secondary"
              icon={<Download />}
              onClick={() => exportResults('excel')}
              disabled={!currentResult || isDiscovering}
              data-cy="export-results-btn" data-testid="export-results-btn"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="px-4 pb-4 flex flex-wrap gap-2">
          {config.discoverDevices && (
            <Badge variant="info" data-cy="config-devices-badge" data-testid="config-devices-badge">
              <Server className="w-3 h-3" /> Devices
            </Badge>
          )}
          {config.discoverPolicies && (
            <Badge variant="info" data-cy="config-policies-badge" data-testid="config-policies-badge">
              <FileText className="w-3 h-3" /> Policies
            </Badge>
          )}
          {config.discoverIncidents && (
            <Badge variant="warning" data-cy="config-incidents-badge" data-testid="config-incidents-badge">
              <AlertTriangle className="w-3 h-3" /> Incidents
            </Badge>
          )}
          {config.discoverVulnerabilities && (
            <Badge variant="danger" data-cy="config-vulnerabilities-badge" data-testid="config-vulnerabilities-badge">
              <Bug className="w-3 h-3" /> Vulnerabilities
            </Badge>
          )}
          {config.performVulnerabilityScan && (
            <Badge variant="success" data-cy="config-scan-badge" data-testid="config-scan-badge">
              <Shield className="w-3 h-3" /> Vulnerability Scan
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      {isDiscovering && progress && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-4" data-cy="progress-section" data-testid="progress-section">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {progress.currentOperation}
              </span>
            </div>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {progress.overallProgress}% Complete
            </span>
          </div>
          <ProgressBar
            value={progress.overallProgress}
            variant="default"
            showLabel
          />
          <div className="mt-2 grid grid-cols-5 gap-4 text-xs text-blue-800 dark:text-blue-200">
            <div>Devices: {progress.devicesProcessed}</div>
            <div>Policies: {progress.policiesProcessed}</div>
            <div>Incidents: {progress.incidentsProcessed}</div>
            <div>Vulnerabilities: {progress.vulnerabilitiesProcessed}</div>
            <div>
              {progress.estimatedTimeRemaining
                ? `ETA: ${Math.ceil(progress.estimatedTimeRemaining / 60)}m`
                : 'Calculating...'}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 p-4" data-cy="error-section" data-testid="error-section">
          <div className="flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                Discovery Errors
              </h3>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {currentResult && currentResult.statistics && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-5 gap-4">
            {/* Security Devices */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800" data-cy="stat-devices" data-testid="stat-devices">
              <div className="flex items-center justify-between mb-2">
                <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <Badge variant="info" className="text-xs">
                  {currentResult.statistics.onlineDevices} online
                </Badge>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {currentResult.statistics.totalDevices}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Security Devices
              </div>
            </div>

            {/* Active Policies */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800" data-cy="stat-policies" data-testid="stat-policies">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                <Badge variant="success" className="text-xs">
                  {currentResult.statistics.nonCompliantPolicies} non-compliant
                </Badge>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {currentResult.statistics.activePolicies}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                Active Policies
              </div>
            </div>

            {/* Open Incidents */}
            <div className={`bg-gradient-to-br rounded-lg p-4 border ${getSeverityColor(currentResult.statistics.criticalIncidents > 0 ? 'critical' : 'medium')}`} data-cy="stat-incidents" data-testid="stat-incidents">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5" />
                <Badge variant="danger" className="text-xs">
                  {currentResult.statistics.criticalIncidents} critical
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {currentResult.statistics.openIncidents}
              </div>
              <div className="text-xs mt-1">
                Open Incidents
              </div>
            </div>

            {/* Vulnerabilities */}
            <div className={`bg-gradient-to-br rounded-lg p-4 border ${getSeverityColor(currentResult.statistics.criticalVulnerabilities > 0 ? 'critical' : 'high')}`} data-cy="stat-vulnerabilities" data-testid="stat-vulnerabilities">
              <div className="flex items-center justify-between mb-2">
                <Bug className="w-5 h-5" />
                <Badge variant="danger" className="text-xs">
                  {currentResult.statistics.criticalVulnerabilities + currentResult.statistics.highVulnerabilities} high/critical
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {currentResult.statistics.totalVulnerabilities}
              </div>
              <div className="text-xs mt-1">
                Vulnerabilities
              </div>
            </div>

            {/* Compliance Score */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800" data-cy="stat-compliance" data-testid="stat-compliance">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <Badge
                  variant={currentResult.statistics.complianceScore >= 80 ? 'success' : currentResult.statistics.complianceScore >= 60 ? 'warning' : 'danger'}
                  className="text-xs"
                >
                  {currentResult.statistics.securityPosture}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {currentResult.statistics.complianceScore}%
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                Compliance Score
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4">
            <div className="flex space-x-1" role="tablist">
              <button
                role="tab"
                aria-selected={selectedTab === 'overview'}
                onClick={() => setSelectedTab('overview')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'overview'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                data-cy="tab-overview" data-testid="tab-overview"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Overview
                </div>
              </button>

              <button
                role="tab"
                aria-selected={selectedTab === 'devices'}
                onClick={() => setSelectedTab('devices')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'devices'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                data-cy="tab-devices" data-testid="tab-devices"
              >
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  Devices
                  {currentResult && (
                    <Badge variant="default" className="text-xs">
                      {currentResult.devices.length}
                    </Badge>
                  )}
                </div>
              </button>

              <button
                role="tab"
                aria-selected={selectedTab === 'policies'}
                onClick={() => setSelectedTab('policies')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'policies'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                data-cy="tab-policies" data-testid="tab-policies"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Policies
                  {currentResult && (
                    <Badge variant="default" className="text-xs">
                      {currentResult.policies.length}
                    </Badge>
                  )}
                </div>
              </button>

              <button
                role="tab"
                aria-selected={selectedTab === 'incidents'}
                onClick={() => setSelectedTab('incidents')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'incidents'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                data-cy="tab-incidents" data-testid="tab-incidents"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Incidents
                  {currentResult && (
                    <Badge variant="default" className="text-xs">
                      {currentResult.incidents.length}
                    </Badge>
                  )}
                </div>
              </button>

              <button
                role="tab"
                aria-selected={selectedTab === 'vulnerabilities'}
                onClick={() => setSelectedTab('vulnerabilities')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === 'vulnerabilities'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                data-cy="tab-vulnerabilities" data-testid="tab-vulnerabilities"
              >
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Vulnerabilities
                  {currentResult && (
                    <Badge variant="default" className="text-xs">
                      {currentResult.vulnerabilities.length}
                    </Badge>
                  )}
                </div>
              </button>
            </div>

            {selectedTab !== 'overview' && (
              <div className="py-2">
                <SearchBar
                  value={searchText}
                  onChange={setSearchText}
                  placeholder={`Search ${selectedTab}...`}
                  data-cy={`search-${selectedTab}`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
          {selectedTab === 'overview' && currentResult ? (
            <div className="h-full overflow-y-auto p-6" data-cy="overview-content" data-testid="overview-content">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Discovery Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Discovery Summary
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Configuration</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {currentResult.configName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Security Posture</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {currentResult.statistics.securityPosture.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Started</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {new Date(currentResult.startTime).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {formatDuration(currentResult.duration)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Risk Assessment
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Overall Risk Score</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {currentResult.statistics.overallRiskScore}/100
                        </span>
                      </div>
                      <ProgressBar
                        value={currentResult.statistics.overallRiskScore}
                        variant={currentResult.statistics.overallRiskScore > 70 ? 'danger' : currentResult.statistics.overallRiskScore > 40 ? 'warning' : 'success'}
                        showLabel
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                          <Bug className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Critical Vulnerabilities</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {currentResult.statistics.criticalVulnerabilities}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Open Incidents</div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {currentResult.statistics.openIncidents}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Dashboard */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Compliance & Governance
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentResult.statistics.complianceScore}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Compliance Gaps</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentResult.statistics.complianceGaps}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Frameworks</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentResult.statistics.complianceFrameworks.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedTab !== 'overview' ? (
            <div className="h-full p-4">
              <VirtualizedDataGrid
                data={filteredData}
                columns={columnDefs}
                loading={isDiscovering}
                enableColumnReorder
                data-cy={`${selectedTab}-grid`}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No discovery results yet. Click "Start Discovery" to begin.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function
const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export default SecurityInfrastructureDiscoveryView;

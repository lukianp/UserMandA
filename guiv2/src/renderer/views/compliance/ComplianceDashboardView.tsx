/**
 * Compliance Dashboard View
 * Comprehensive compliance monitoring and reporting for M&A discovery
 */

import React from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle, FileText, TrendingUp, Activity } from 'lucide-react';
import { useComplianceDashboardLogic } from '../../hooks/useComplianceDashboardLogic';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import VirtualizedDataGrid from '../../components/organisms/VirtualizedDataGrid';

export const ComplianceDashboardView: React.FC = () => {
  const {
    complianceData,
    isLoading,
    stats,
    selectedFramework,
    setSelectedFramework,
    handleExport,
    handleRefresh,
    handleRunAudit,
    columnDefs,
  } = useComplianceDashboardLogic();

  const frameworks = [
    { id: 'all', label: 'All Frameworks', color: 'blue' },
    { id: 'gdpr', label: 'GDPR', color: 'purple' },
    { id: 'hipaa', label: 'HIPAA', color: 'green' },
    { id: 'sox', label: 'SOX', color: 'red' },
    { id: 'iso27001', label: 'ISO 27001', color: 'orange' },
    { id: 'pci', label: 'PCI-DSS', color: 'cyan' },
  ];

  const complianceStatus = [
    {
      status: 'Compliant',
      count: stats.compliant,
      percentage: stats.compliantPercentage,
      icon: CheckCircle,
      color: 'green',
    },
    {
      status: 'Non-Compliant',
      count: stats.nonCompliant,
      percentage: stats.nonCompliantPercentage,
      icon: XCircle,
      color: 'red',
    },
    {
      status: 'At Risk',
      count: stats.atRisk,
      percentage: stats.atRiskPercentage,
      icon: AlertTriangle,
      color: 'yellow',
    },
  ];

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900" data-cy="compliance-dashboard-view">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor regulatory compliance across all frameworks</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            icon={<Activity className="w-4 h-4" />}
            disabled={isLoading}
            data-cy="refresh-btn"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={handleRunAudit}
            disabled={isLoading}
            data-cy="run-audit-btn"
          >
            Run Compliance Audit
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            icon={<FileText className="w-4 h-4" />}
            data-cy="export-btn"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Compliance Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {complianceStatus.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.status}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {item.status}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {item.count}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${item.color}-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className={`p-3 bg-${item.color}-100 dark:bg-${item.color}-900 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Framework Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {frameworks.map((framework) => {
          const isSelected = selectedFramework === framework.id;
          return (
            <button
              key={framework.id}
              onClick={() => setSelectedFramework(framework.id)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                ${
                  isSelected
                    ? `bg-${framework.color}-100 dark:bg-${framework.color}-900 text-${framework.color}-700 dark:text-${framework.color}-300 ring-2 ring-${framework.color}-500`
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              data-cy={`framework-${framework.id}`}
            >
              {framework.label}
            </button>
          );
        })}
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Controls</p>
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalControls}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Audit Findings</p>
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.auditFindings}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Score</p>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.riskScore}</p>
            <Badge variant={stats.riskScore > 70 ? 'error' : stats.riskScore > 40 ? 'warning' : 'success'}>
              {stats.riskScore > 70 ? 'High' : stats.riskScore > 40 ? 'Medium' : 'Low'}
            </Badge>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Audit</p>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{stats.lastAuditDate}</p>
        </div>
      </div>

      {/* Compliance Data Grid */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <VirtualizedDataGrid
          data={complianceData}
          columns={columnDefs}
          loading={isLoading}
          enableExport
          enableGrouping
          enableFiltering
          data-cy="compliance-grid"
        />
      </div>
    </div>
  );
};

export default ComplianceDashboardView;

/**
 * Compliance Dashboard View
 * Enterprise compliance monitoring and regulatory framework management
 */

import React, { useState, useMemo } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useComplianceDashboardLogic } from '../../hooks/security/useComplianceDashboardLogic';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';

export const ComplianceDashboardView: React.FC = () => {
  const {
    dashboardData,
    isLoading,
    error,
    lastRefresh,
    handleRefresh,
    handleExportReport,
    handleRunAssessment,
  } = useComplianceDashboardLogic();

  const [activeTab, setActiveTab] = useState<'overview' | 'frameworks' | 'findings' | 'deadlines'>('overview');

  // Metric cards configuration
  const metricCards = useMemo(() => {
    if (!dashboardData) return [];
    const { metrics } = dashboardData;

    return [
      {
        label: 'Overall Compliance Score',
        value: `${metrics.overallScore}%`,
        icon: Shield,
        color: metrics.overallScore >= 80 ? 'green' as const : metrics.overallScore >= 60 ? 'yellow' as const : 'red' as const,
        trend: metrics.complianceTrend,
        description: `${metrics.compliantControls}/${metrics.totalControls} controls`,
      },
      {
        label: 'Critical Findings',
        value: metrics.criticalFindings.toString(),
        icon: AlertTriangle,
        color: 'red' as const,
        description: 'Require immediate attention',
      },
      {
        label: 'Upcoming Deadlines',
        value: metrics.upcomingDeadlines.toString(),
        icon: Clock,
        color: 'yellow' as const,
        description: 'Within next 30 days',
      },
      {
        label: 'Compliant Controls',
        value: metrics.compliantControls.toString(),
        icon: CheckCircle2,
        color: 'green' as const,
        description: `${Math.round((metrics.compliantControls / metrics.totalControls) * 100)}% of total`,
      },
    ];
  }, [dashboardData]);

  // Framework columns
  const frameworkColumns = useMemo(() => [
    {
      field: 'frameworkName',
      headerName: 'Framework',
      width: 200,
      pinned: 'left' as const,
    },
    {
      field: 'version',
      headerName: 'Version',
      width: 120,
    },
    {
      field: 'compliancePercentage',
      headerName: 'Compliance',
      width: 150,
      cellRenderer: (params: any) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                params.value >= 80 ? 'bg-green-500' : params.value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${params.value}%` }}
            />
          </div>
          <span className="text-sm font-medium">{params.value}%</span>
        </div>
      ),
    },
    {
      field: 'certificationStatus',
      headerName: 'Status',
      width: 140,
      cellRenderer: (params: any) => {
        const variantMap: Record<string, 'success' | 'warning' | 'default' | 'danger'> = {
          Certified: 'success',
          InProgress: 'warning',
          NotCertified: 'default',
          Expired: 'danger',
        };
        return (
          <Badge variant={variantMap[params.value] || 'default'} size="sm">
            {params.value}
          </Badge>
        );
      },
    },
    {
      field: 'totalControls',
      headerName: 'Total Controls',
      width: 130,
    },
    {
      field: 'compliantControls',
      headerName: 'Compliant',
      width: 120,
    },
    {
      field: 'nonCompliantControls',
      headerName: 'Non-Compliant',
      width: 140,
    },
    {
      field: 'lastAuditDate',
      headerName: 'Last Audit',
      width: 150,
      valueFormatter: (params: any) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return date.toLocaleDateString();
      },
    },
  ], []);

  // Findings columns
  const findingsColumns = useMemo(() => [
    {
      field: 'title',
      headerName: 'Finding',
      width: 300,
      pinned: 'left' as const,
    },
    {
      field: 'framework',
      headerName: 'Framework',
      width: 150,
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      cellRenderer: (params: any) => {
        const variantMap: Record<string, 'danger' | 'warning' | 'default'> = {
          Critical: 'danger',
          High: 'danger',
          Medium: 'warning',
          Low: 'default',
        };
        return (
          <Badge variant={variantMap[params.value] || 'default'} size="sm">
            {params.value}
          </Badge>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      cellRenderer: (params: any) => {
        const variantMap: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
          Resolved: 'success',
          InRemediation: 'warning',
          Open: 'danger',
          Accepted: 'default',
        };
        return (
          <Badge variant={variantMap[params.value] || 'default'} size="sm">
            {params.value}
          </Badge>
        );
      },
    },
    {
      field: 'owner',
      headerName: 'Owner',
      width: 200,
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 150,
      valueFormatter: (params: any) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return date.toLocaleDateString();
      },
    },
  ], []);

  // Deadlines columns
  const deadlinesColumns = useMemo(() => [
    {
      field: 'title',
      headerName: 'Control',
      width: 300,
      pinned: 'left' as const,
    },
    {
      field: 'framework',
      headerName: 'Framework',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
    },
    {
      field: 'owner',
      headerName: 'Owner',
      width: 200,
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 150,
      valueFormatter: (params: any) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return date.toLocaleDateString();
      },
    },
    {
      field: 'timeToDeadline',
      headerName: 'Time Remaining',
      width: 140,
    },
  ], []);

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Error Loading Data</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <Button variant="primary" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

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
            <p className="text-gray-600 dark:text-gray-400">
              Regulatory framework monitoring and control management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            icon={<RefreshCw className="w-4 h-4" />}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExportReport('PDF')}
            icon={<Download className="w-4 h-4" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map((metric) => (
          <div
            key={metric.label}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.label}
              </span>
              <div className={`p-2 bg-${metric.color}-100 dark:bg-${metric.color}-900 rounded`}>
                <metric.icon className={`w-5 h-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </div>
              {metric.trend !== undefined && (
                <div className={`flex items-center text-sm ${metric.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="ml-1">{Math.abs(metric.trend).toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {metric.description}
            </div>
          </div>
        ))}
      </div>

      {/* Control Categories Chart */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Control Categories
          </h3>
          <div className="space-y-4">
            {dashboardData.controlCategories.map((category) => (
              <div key={category.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category.category}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {category.compliantControls}/{category.totalControls} ({category.compliancePercentage}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      category.compliancePercentage >= 80 ? 'bg-green-500' :
                        category.compliancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${category.compliancePercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('frameworks')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'frameworks'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Frameworks ({dashboardData.frameworks.length})
        </button>
        <button
          onClick={() => setActiveTab('findings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'findings'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Findings ({dashboardData.findings.length})
        </button>
        <button
          onClick={() => setActiveTab('deadlines')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'deadlines'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Upcoming Deadlines ({dashboardData.upcomingDeadlines.length})
        </button>
      </div>

      {/* Data Grid */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {activeTab === 'frameworks' && (
          <VirtualizedDataGrid
            data={dashboardData.frameworks}
            columns={frameworkColumns}
          />
        )}
        {activeTab === 'findings' && (
          <VirtualizedDataGrid
            data={dashboardData.findings}
            columns={findingsColumns}
          />
        )}
        {activeTab === 'deadlines' && (
          <VirtualizedDataGrid
            data={dashboardData.upcomingDeadlines}
            columns={deadlinesColumns}
          />
        )}
        {activeTab === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Assessments</h3>
            <div className="space-y-4">
              {dashboardData.recentAssessments.map((assessment) => (
                <div
                  key={assessment.assessmentId}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{assessment.framework}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{assessment.scope}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{assessment.overallScore}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(assessment.assessmentDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Auditor: {assessment.auditor}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDashboardView;

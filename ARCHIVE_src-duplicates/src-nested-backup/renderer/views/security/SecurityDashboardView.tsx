/**
 * Security Dashboard View
 * Real-time security posture monitoring and threat intelligence
 */

import React from 'react';
import { Shield, AlertTriangle, Lock, Unlock, Activity, Eye, Bug, TrendingDown } from 'lucide-react';

import { useSecurityDashboardLogic } from '../../hooks/useSecurityDashboardLogic';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';

export const SecurityDashboardView: React.FC = () => {
  const {
    securityData,
    isLoading,
    stats,
    selectedCategory,
    setSelectedCategory,
    handleExport,
    handleRefresh,
    handleRunScan,
    columnDefs,
  } = useSecurityDashboardLogic();

  const securityCategories = [
    { id: 'all', label: 'All Threats', icon: Shield, color: 'blue' },
    { id: 'critical', label: 'Critical', icon: AlertTriangle, color: 'red' },
    { id: 'high', label: 'High Risk', icon: Bug, color: 'orange' },
    { id: 'medium', label: 'Medium Risk', icon: Eye, color: 'yellow' },
    { id: 'low', label: 'Low Risk', icon: Lock, color: 'green' },
  ];

  const securityMetrics = [
    {
      label: 'Critical Vulnerabilities',
      value: (stats?.criticalVulnerabilities ?? 0),
      icon: AlertTriangle,
      color: 'red',
      change: (stats?.criticalChange ?? 0),
    },
    {
      label: 'Active Threats',
      value: (stats?.activeThreats ?? 0),
      icon: Bug,
      color: 'orange',
      change: (stats?.threatsChange ?? 0),
    },
    {
      label: 'Security Score',
      value: `${stats?.securityScore ?? 0}/100`,
      icon: Shield,
      color: 'blue',
      change: (stats?.scoreChange ?? 0),
    },
    {
      label: 'Exposed Services',
      value: (stats?.exposedServices ?? 0),
      icon: Unlock,
      color: 'yellow',
      change: (stats?.exposedChange ?? 0),
    },
  ];

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900" data-cy="security-dashboard-view" data-testid="security-dashboard-view">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Real-time security posture and threat monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            icon={<Activity className="w-4 h-4" />}
            disabled={isLoading}
            data-cy="refresh-btn" data-testid="refresh-btn"
          >
            Refresh
          </Button>
          <Button
            variant="danger"
            onClick={handleRunScan}
            disabled={isLoading}
            data-cy="run-scan-btn" data-testid="run-scan-btn"
          >
            Run Security Scan
          </Button>
          <Button
            variant="secondary"
            onClick={handleExport}
            data-cy="export-results-btn" data-testid="export-results-btn"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Security Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {securityMetrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          return (
            <div
              key={metric.label}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 bg-${metric.color}-100 dark:bg-${metric.color}-900 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown
                  className={`w-4 h-4 ${isPositive ? 'text-green-500 transform rotate-180' : 'text-red-500'}`}
                />
                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-sm text-gray-500">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {securityCategories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                ${
                  isSelected
                    ? `bg-${category.color}-100 dark:bg-${category.color}-900 text-${category.color}-700 dark:text-${category.color}-300 ring-2 ring-${category.color}-500`
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              data-cy={`category-${category.id}`}
            >
              <Icon className="w-5 h-5" />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Threat Intelligence Grid */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Security Threats & Vulnerabilities
          </h3>
        </div>
        <VirtualizedDataGrid
          data={securityData}
          columns={columnDefs}
          loading={isLoading}
         
        />
      </div>
    </div>
  );
};

export default SecurityDashboardView;

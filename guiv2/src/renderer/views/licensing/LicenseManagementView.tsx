/**
 * License Management View
 * License tracking, compliance, and cost optimization
 */

import React from 'react';
import { Key, TrendingUp, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useLicenseManagementLogic } from '../../hooks/useLicenseManagementLogic';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';

export const LicenseManagementView: React.FC = () => {
  const {
    licenses,
    isLoading,
    stats,
    selectedCategory,
    setSelectedCategory,
    handleExport,
    handleOptimize,
    columnDefs,
  } = useLicenseManagementLogic();

  const licenseMetrics = [
    { label: 'Total Licenses', value: stats.totalLicenses, icon: Key, color: 'blue' },
    { label: 'Active', value: stats.activeLicenses, icon: CheckCircle, color: 'green' },
    { label: 'Expiring Soon', value: stats.expiringSoon, icon: Clock, color: 'yellow' },
    { label: 'Non-Compliant', value: stats.nonCompliant, icon: AlertCircle, color: 'red' },
    { label: 'Total Cost', value: `$${stats.totalCost.toLocaleString()}`, icon: DollarSign, color: 'purple' },
    { label: 'Potential Savings', value: `$${stats.potentialSavings.toLocaleString()}`, icon: TrendingUp, color: 'green' },
  ];

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900" data-cy="license-management-view">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Key className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">License Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Track, optimize, and ensure license compliance</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleOptimize} data-cy="optimize-btn">
            Optimize Licenses
          </Button>
          <Button variant="secondary" onClick={handleExport} data-cy="export-btn">
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {licenseMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <Icon className={`w-6 h-6 text-${metric.color}-500 mb-2`} />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <VirtualizedDataGrid
          data={licenses}
          columns={columnDefs}
          loading={isLoading}
         
        />
      </div>
    </div>
  );
};

export default LicenseManagementView;

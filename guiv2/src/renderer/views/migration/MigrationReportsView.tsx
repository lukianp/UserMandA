/**
 * Migration Reports View
 *
 * Comprehensive reporting and audit trail with:
 * - Progress reports and dashboards
 * - Risk assessment reports
 * - Audit trail export
 * - Success/failure statistics
 * - Timeline visualizations
 */

import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../components/atoms/Button';

export const MigrationReportsView: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reportTypes = [
    {
      id: 'progress',
      name: 'Progress Report',
      description: 'Overall migration progress and status',
      icon: TrendingUp,
      color: 'bg-blue-500',
    },
    {
      id: 'risk',
      name: 'Risk Assessment',
      description: 'Issues, blockers, and risk analysis',
      icon: AlertTriangle,
      color: 'bg-orange-500',
    },
    {
      id: 'audit',
      name: 'Audit Trail',
      description: 'Complete history of all migration activities',
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      id: 'summary',
      name: 'Executive Summary',
      description: 'High-level overview for stakeholders',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ];

  const mockStats = {
    totalWaves: 5,
    completedWaves: 2,
    activeWaves: 1,
    totalUsers: 12500,
    migratedUsers: 8750,
    successRate: 97.3,
    averageDuration: '3.5 hours',
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Migration Reports</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Progress tracking and audit trail
            </p>
          </div>
        </div>
        <Button variant="primary" icon={<Download size={18} />}>
          Export Report
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Waves</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockStats.totalWaves}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600">{mockStats.completedWaves}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Users Migrated</p>
            <p className="text-2xl font-bold text-blue-600">{mockStats.migratedUsers.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
            <p className="text-2xl font-bold text-green-600">{mockStats.successRate}%</p>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={clsx(
                  'p-6 rounded-lg border-2 text-left transition-all',
                  selectedReport === report.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800'
                )}
              >
                <div className={clsx('w-12 h-12 rounded-lg flex items-center justify-center mb-4', report.color)}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{report.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
              </button>
            );
          })}
        </div>

        {/* Report Preview Area */}
        {selectedReport && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Preview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Preview for {reportTypes.find((r) => r.id === selectedReport)?.name} will be displayed here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationReportsView;



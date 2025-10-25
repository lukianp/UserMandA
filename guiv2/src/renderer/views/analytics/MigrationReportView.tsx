import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, FileText, CheckCircle, XCircle, Clock, AlertCircle, Filter } from 'lucide-react';

import { useMigrationReportLogic } from '../../hooks/useMigrationReportLogic';
import { Button } from '../../components/atoms/Button';
import { Select } from '../../components/atoms/Select';

// Statistics Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  'data-cy'?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle, 'data-cy': dataCy }) => (
  <div
    className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
    data-cy={dataCy}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div className="text-right">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

// Loading Skeleton
const ReportSkeleton: React.FC = () => (
  <div className="h-full p-6 space-y-6 animate-pulse">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      ))}
    </div>
  </div>
);

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
          <span style={{ color: entry.color }}>{entry.name}: </span>
          <span className="font-semibold">
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// Gantt-style Timeline Component
const WaveTimeline: React.FC<{ data: any[] }> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {(data ?? []).map((wave, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{wave.waveName}</span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  wave.status === 'completed'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : wave.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : wave.status === 'failed'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                }`}
              >
                {getStatusLabel(wave.status)}
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {wave.startDate} → {wave.endDate}
              {wave.duration > 0 && ` (${wave.duration} days)`}
            </div>
          </div>
          <div className="relative w-full h-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full ${getStatusColor(wave.status)} transition-all duration-500`}
              style={{ width: `${wave.progress}%` }}
            >
              <div className="flex items-center justify-center h-full">
                <span className="text-xs font-medium text-white">{wave.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Success Rate Gauge Component
const SuccessGauge: React.FC<{ successRate: number }> = ({ successRate }) => {
  const data = [{ name: 'Success Rate', value: successRate, fill: successRate >= 90 ? '#10b981' : successRate >= 75 ? '#f59e0b' : '#ef4444' }];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="60%"
        outerRadius="90%"
        barSize={30}
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          background
          dataKey="value"
          cornerRadius={10}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-4xl font-bold fill-gray-900 dark:fill-gray-100">
          {successRate}%
        </text>
        <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-gray-500">
          Success Rate
        </text>
      </RadialBarChart>
    </ResponsiveContainer>
  );
};

const MigrationReportView: React.FC = () => {
  const {
    reportData,
    isLoading,
    error,
    isExporting,
    selectedWave,
    setSelectedWave,
    availableWaves,
    overallProgress,
    handleExportPDF,
    handleExportExcel,
  } = useMigrationReportLogic();

  const isDarkMode = document.documentElement.classList.contains('dark');

  // Chart theme
  const chartTheme = {
    textColor: isDarkMode ? '#f9fafb' : '#1f2937',
    gridColor: isDarkMode ? '#374151' : '#e5e7eb',
  };

  // Color palette
  const COLORS = {
    success: isDarkMode ? '#34d399' : '#10b981',
    danger: isDarkMode ? '#f87171' : '#ef4444',
    warning: isDarkMode ? '#fbbf24' : '#f59e0b',
    primary: isDarkMode ? '#60a5fa' : '#3b82f6',
    purple: isDarkMode ? '#a78bfa' : '#8b5cf6',
  };

  const PIE_COLORS = [COLORS.danger, COLORS.warning, COLORS.primary, COLORS.purple, '#f472b6'];

  if (isLoading) {
    return <ReportSkeleton />;
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center" data-cy="report-error">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No report data available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="migration-report-view">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Migration Report</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overall Progress: {overallProgress}%
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select
              value={selectedWave}
              onChange={(value) => setSelectedWave(value)}
              className="w-48"
              data-cy="wave-filter"
              options={[
                { value: 'all', label: 'All Waves' },
                ...availableWaves.map(wave => ({ value: wave.id, label: wave.name }))
              ]}
            />
          </div>
          <Button
            onClick={handleExportExcel}
            variant="secondary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            disabled={isExporting}
            data-cy="export-excel-btn"
          >
            Export Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="primary"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
            disabled={isExporting}
            data-cy="export-pdf-btn"
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Migrations"
            value={reportData.statistics.totalAttempted}
            icon={<Clock className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            subtitle="Attempted"
            data-cy="stat-total"
          />
          <StatCard
            title="Successful"
            value={reportData.statistics.totalSucceeded}
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            color="bg-green-500"
            subtitle={`${reportData.statistics.successRate}% success rate`}
            data-cy="stat-success"
          />
          <StatCard
            title="Failed"
            value={reportData.statistics.totalFailed}
            icon={<XCircle className="w-6 h-6 text-white" />}
            color="bg-red-500"
            subtitle={`${reportData.statistics.totalErrors} errors`}
            data-cy="stat-failed"
          />
          <StatCard
            title="Avg. Duration"
            value={`${reportData.statistics.averageDurationMinutes} min`}
            icon={<Clock className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            subtitle="Per migration"
            data-cy="stat-duration"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Success Rate Gauge */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Overall Success Rate</h2>
            <SuccessGauge successRate={reportData.statistics.successRate} />
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {reportData.statistics.totalSucceeded.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Succeeded</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {reportData.statistics.totalFailed.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
              </div>
            </div>
          </div>

          {/* Success Rate by Type */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Success Rate by Type</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={reportData.successRateByType} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
                <XAxis type="number" domain={[0, 100]} stroke={chartTheme.textColor} />
                <YAxis type="category" dataKey="type" stroke={chartTheme.textColor} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="successRate" fill={COLORS.success} radius={[0, 8, 8, 0]} name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Wave Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Migration Timeline</h2>
            <WaveTimeline data={reportData.waveTimeline} />
          </div>

          {/* Error Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Error Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.errorBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ errorType, percentage }) => `${errorType}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {reportData.errorBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top Errors Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Top Errors
            </h2>
            <div className="space-y-3">
              {reportData.topErrors.map((error, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
                      {error.errorMessage}
                    </p>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400 ml-2">
                      {error.count}×
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{error.affectedUsers} users affected</span>
                    <span>•</span>
                    <span>Last: {error.lastOccurrence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Preview Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Export Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Includes:</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Executive summary with key metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Detailed wave-by-wave analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Complete error log with recommendations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Success rate breakdown by resource type
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Visual charts and timeline graphs
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <Button
                onClick={handleExportPDF}
                variant="primary"
                size="lg"
                icon={<FileText className="w-5 h-5" />}
                disabled={isExporting}
                data-cy="download-pdf-report"
              >
                {isExporting ? 'Generating...' : 'Download PDF Report'}
              </Button>
              <Button
                onClick={handleExportExcel}
                variant="secondary"
                size="lg"
                icon={<Download className="w-5 h-5" />}
                disabled={isExporting}
                data-cy="download-excel-report"
              >
                {isExporting ? 'Exporting...' : 'Export to Excel'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationReportView;

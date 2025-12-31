/**
 * Cost Analysis View
 * Financial tracking and cost optimization for M&A migrations
 */

import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, PieChart, BarChart3, Calculator } from 'lucide-react';
import { useCostAnalysisLogic } from '@hooks/useCostAnalysisLogic';
import { Button } from '@components/atoms/Button';
import { Badge } from '@components/atoms/Badge';
import { VirtualizedDataGrid } from '@components/organisms/VirtualizedDataGrid';

export const CostAnalysisView: React.FC = () => {
  const {
    costData,
    isLoading,
    error,
    selectedTimeRange,
    setSelectedTimeRange,
    filteredProjections,
    potentialSavings,
    refreshData,
  } = useCostAnalysisLogic();

  const costMetrics = [
    { label: 'Monthly Cost', value: `$${(costData?.totalMonthlyCost || 0).toLocaleString()}`, icon: DollarSign, color: 'blue' },
    { label: 'Annual Cost', value: `$${(costData?.totalAnnualCost || 0).toLocaleString()}`, icon: BarChart3, color: 'purple' },
    { label: 'Optimizations', value: (costData?.optimizations?.length || 0).toString(), icon: PieChart, color: 'green' },
    { label: 'Potential Savings', value: `$${(potentialSavings ?? 0).toLocaleString()}`, icon: Calculator, color: 'orange' },
  ];

  const timeRanges = [
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' },
  ];

  const columnDefs = [
    { field: 'category', headerName: 'Category', sortable: true, filter: true },
    { field: 'cost', headerName: 'Cost', sortable: true },
    { field: 'trend', headerName: 'Trend', sortable: true },
    { field: 'projection', headerName: 'Projection', sortable: true },
  ];

  return (
    <div className="flex flex-col h-full p-6 bg-gray-50 dark:bg-gray-900" data-cy="cost-analysis-view" data-testid="cost-analysis-view">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cost Analysis</h1>
            <p className="text-gray-600 dark:text-gray-400">Financial tracking and cost optimization</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2">
            {timeRanges.map((range) => (
              <Button
                key={range.id}
                variant={selectedTimeRange === range.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedTimeRange(range.id as any)}
                data-cy={`timerange-${range.id}`}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <Button variant="primary" onClick={refreshData} data-cy="forecast-btn" data-testid="forecast-btn">
            Refresh Data
          </Button>
          <Button variant="secondary" onClick={refreshData} data-cy="export-btn">
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {costMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
                </div>
                <Icon className={`w-6 h-6 text-${metric.color}-500`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost Breakdown & Trends</h3>
        </div>
        <VirtualizedDataGrid
          data={filteredProjections}
          columns={columnDefs}
          loading={isLoading}

        />
      </div>
    </div>
  );
};

export default CostAnalysisView;



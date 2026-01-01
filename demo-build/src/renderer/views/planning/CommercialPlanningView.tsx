/**
 * Commercial Planning View
 *
 * Provides cost analysis, license overlap detection, migration cost projections,
 * and ROI calculations for M&A integration planning.
 *
 * Phase 10: Commercial Planning for M&A Integration
 */

import React, { useMemo } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar,
  Target,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Layers,
} from 'lucide-react';

import { useCommercialPlanningLogic } from '../../hooks/useCommercialPlanningLogic';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';

// ===== HELPER COMPONENTS =====

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className = '',
}) => (
  <div className={`p-4 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg ${className}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-[var(--text-secondary)]">{title}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</p>
        )}
      </div>
      <div className="p-2 bg-[var(--bg-secondary)] rounded-lg">{icon}</div>
    </div>
    {trend && trendValue && (
      <div className={`flex items-center gap-1 mt-2 text-sm ${
        trend === 'down' ? 'text-green-500' : trend === 'up' ? 'text-red-500' : 'text-gray-500'
      }`}>
        {trend === 'down' ? (
          <TrendingDown className="w-4 h-4" />
        ) : trend === 'up' ? (
          <TrendingUp className="w-4 h-4" />
        ) : null}
        <span>{trendValue}</span>
      </div>
    )}
  </div>
);

// ===== MAIN VIEW COMPONENT =====

const CommercialPlanningView: React.FC = () => {
  const {
    isLoading,
    error,
    sourceLicenses,
    overlaps,
    migrationCosts,
    costProjections,
    commercialSummary,
    licensesByCategory,
    exportToCSV,
    selectedSourceProfile,
  } = useCommercialPlanningLogic();

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate category percentages for pie chart display
  const categoryPercentages = useMemo(() => {
    const totalCost = licensesByCategory.reduce((sum, c) => sum + c.cost, 0);
    return licensesByCategory.map((c) => ({
      ...c,
      percentage: totalCost > 0 ? (c.cost / totalCost) * 100 : 0,
    }));
  }, [licensesByCategory]);

  // Color palette for categories
  const categoryColors: Record<string, string> = {
    M365: 'bg-blue-500',
    Office365: 'bg-blue-400',
    EntraID: 'bg-purple-500',
    EMS: 'bg-green-500',
    Exchange: 'bg-orange-500',
    SharePoint: 'bg-teal-500',
    Teams: 'bg-indigo-500',
    Power: 'bg-yellow-500',
    Intune: 'bg-pink-500',
    Azure: 'bg-sky-500',
    Other: 'bg-gray-500',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading commercial data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-[var(--danger)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Failed to Load Commercial Data
          </h2>
          <p className="text-[var(--danger)] mb-6">{error}</p>
        </div>
      </div>
    );
  }

  // No data state
  if (sourceLicenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center max-w-md">
          <DollarSign className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No License Data Available
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Run a Licensing Discovery first to generate commercial planning data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Commercial Planning</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Cost analysis and migration planning for {selectedSourceProfile?.companyName || 'selected company'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Annual Spend"
          value={formatCurrency(commercialSummary.totalCurrentAnnualCost)}
          subtitle={`${formatCurrency(commercialSummary.totalCurrentMonthlyCost)}/month`}
          icon={<DollarSign className="w-5 h-5 text-blue-500" />}
        />
        <StatCard
          title="Savings Opportunity"
          value={formatCurrency(commercialSummary.totalSavingsOpportunity)}
          subtitle="Potential annual savings"
          icon={<TrendingDown className="w-5 h-5 text-green-500" />}
          trend="down"
          trendValue={`${((commercialSummary.totalSavingsOpportunity / commercialSummary.totalCurrentAnnualCost) * 100).toFixed(1)}% reduction`}
        />
        <StatCard
          title="Migration Investment"
          value={formatCurrency(commercialSummary.totalMigrationCost)}
          subtitle="One-time costs"
          icon={<Target className="w-5 h-5 text-orange-500" />}
        />
        <StatCard
          title="Break-Even Point"
          value={`${commercialSummary.breakEvenMonths} months`}
          subtitle={`${commercialSummary.roiPercent.toFixed(0)}% 3-year ROI`}
          icon={<Calendar className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* License Cost Distribution */}
        <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            License Cost Distribution
          </h3>
          <div className="space-y-3">
            {categoryPercentages.map((cat) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-primary)]">{cat.category}</span>
                  <span className="text-[var(--text-secondary)]">
                    {formatCurrency(cat.cost)}/mo ({cat.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${categoryColors[cat.category] || 'bg-gray-500'}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Projections */}
        <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Cost Projections by Category
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 text-[var(--text-secondary)]">Category</th>
                  <th className="text-right py-2 text-[var(--text-secondary)]">Current</th>
                  <th className="text-right py-2 text-[var(--text-secondary)]">Projected</th>
                  <th className="text-right py-2 text-[var(--text-secondary)]">Savings</th>
                </tr>
              </thead>
              <tbody>
                {costProjections.map((proj) => (
                  <tr key={proj.category} className="border-b border-[var(--border)]">
                    <td className="py-2 text-[var(--text-primary)]">{proj.category}</td>
                    <td className="py-2 text-right text-[var(--text-primary)]">
                      {formatCurrency(proj.currentAnnual)}
                    </td>
                    <td className="py-2 text-right text-[var(--text-primary)]">
                      {formatCurrency(proj.projectedAnnual)}
                    </td>
                    <td className="py-2 text-right text-green-500">
                      {formatCurrency(proj.savings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* License Overlaps */}
      {overlaps.length > 0 && (
        <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4">
          <h3 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            License Optimization Opportunities
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-2 text-[var(--text-secondary)]">License</th>
                  <th className="text-right py-2 text-[var(--text-secondary)]">Source</th>
                  <th className="text-right py-2 text-[var(--text-secondary)]">Target</th>
                  <th className="text-right py-2 text-[var(--text-secondary)]">Overlap</th>
                  <th className="text-right py-2 text-[var(--text-secondary)]">Annual Savings</th>
                  <th className="text-left py-2 text-[var(--text-secondary)]">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {overlaps.slice(0, 10).map((overlap, idx) => (
                  <tr key={idx} className="border-b border-[var(--border)]">
                    <td className="py-2 text-[var(--text-primary)]">{overlap.displayName}</td>
                    <td className="py-2 text-right text-[var(--text-primary)]">{overlap.sourceCount}</td>
                    <td className="py-2 text-right text-[var(--text-primary)]">{overlap.targetCount}</td>
                    <td className="py-2 text-right text-[var(--text-primary)]">{overlap.overlapCount}</td>
                    <td className="py-2 text-right text-green-500">
                      {formatCurrency(overlap.savingsOpportunity)}
                    </td>
                    <td className="py-2 text-[var(--text-secondary)] max-w-xs truncate">
                      {overlap.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Migration Costs */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4">
        <h3 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Migration Cost Breakdown
        </h3>
        <div className="space-y-4">
          {migrationCosts.map((cost, idx) => (
            <div key={idx} className="p-4 bg-[var(--bg-secondary)] rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--text-primary)]">{cost.category}</h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{cost.description}</p>
                  {cost.notes && (
                    <p className="text-xs text-[var(--text-secondary)] mt-2 italic">{cost.notes}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {formatCurrency(cost.oneTimeCost)}
                  </p>
                  {cost.recurringMonthlyCost > 0 && (
                    <p className="text-sm text-[var(--text-secondary)]">
                      +{formatCurrency(cost.recurringMonthlyCost)}/mo
                    </p>
                  )}
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {cost.estimatedDuration}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-400">Total Migration Investment</p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Break-even in {commercialSummary.breakEvenMonths} months with {commercialSummary.roiPercent.toFixed(0)}% 3-year ROI
              </p>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {formatCurrency(commercialSummary.totalMigrationCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Top Licenses */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg p-4">
        <h3 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Top License Costs
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 text-[var(--text-secondary)]">License</th>
                <th className="text-left py-2 text-[var(--text-secondary)]">Category</th>
                <th className="text-right py-2 text-[var(--text-secondary)]">Units</th>
                <th className="text-right py-2 text-[var(--text-secondary)]">Price/User</th>
                <th className="text-right py-2 text-[var(--text-secondary)]">Monthly</th>
                <th className="text-right py-2 text-[var(--text-secondary)]">Annual</th>
              </tr>
            </thead>
            <tbody>
              {sourceLicenses.slice(0, 15).map((lic, idx) => (
                <tr key={idx} className="border-b border-[var(--border)]">
                  <td className="py-2 text-[var(--text-primary)]">{lic.displayName}</td>
                  <td className="py-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${categoryColors[lic.category]?.replace('bg-', 'bg-opacity-20 text-') || 'bg-gray-100 text-gray-700'}`}>
                      {lic.category}
                    </span>
                  </td>
                  <td className="py-2 text-right text-[var(--text-primary)]">
                    {lic.consumedUnits} / {lic.prepaidUnits}
                  </td>
                  <td className="py-2 text-right text-[var(--text-secondary)]">
                    ${lic.pricePerMonth.toFixed(2)}
                  </td>
                  <td className="py-2 text-right text-[var(--text-primary)]">
                    {formatCurrency(lic.monthlyTotal)}
                  </td>
                  <td className="py-2 text-right font-medium text-[var(--text-primary)]">
                    {formatCurrency(lic.annualTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-medium">
                <td colSpan={4} className="py-3 text-right text-[var(--text-primary)]">
                  Total:
                </td>
                <td className="py-3 text-right text-[var(--text-primary)]">
                  {formatCurrency(commercialSummary.totalCurrentMonthlyCost)}
                </td>
                <td className="py-3 text-right text-[var(--text-primary)]">
                  {formatCurrency(commercialSummary.totalCurrentAnnualCost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommercialPlanningView;



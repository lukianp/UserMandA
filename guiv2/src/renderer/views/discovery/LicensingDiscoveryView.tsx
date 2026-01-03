import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Key,
  ChevronUp,
  ChevronDown,
  Download,
  FileSpreadsheet,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle,
  UserCheck,
  Settings,
  PieChart,
  Layers,
  BarChart3,
  GitMerge,
  ArrowRightLeft
} from 'lucide-react';

import { useLicensingDiscoveryLogic } from '../../hooks/useLicensingDiscoveryLogic';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { SankeyDiagram } from '../../components/organisms/SankeyDiagram';
import { SankeyNode, SankeyLink } from '../../types/models/organisation';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import Checkbox from '../../components/atoms/Checkbox';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import PowerShellExecutionDialog from '../../components/molecules/PowerShellExecutionDialog';

const LicensingDiscoveryView: React.FC = () => {
  const {
    config,
    result,
    isDiscovering,
    progress,
    activeTab,
    filter,
    error,
    showExecutionDialog,
    setShowExecutionDialog,
    logs,
    clearLogs,
    isCancelling,
    columns,
    filteredData,
    stats,
    // Enhanced data from new PowerShell module
    userAssignments,
    servicePlans,
    filteredUserAssignments,
    filteredServicePlans,
    userAssignmentColumns,
    servicePlanColumns,
    startDiscovery,
    cancelDiscovery,
    updateConfig,
    setActiveTab,
    updateFilter,
    clearError,
    exportToCSV,
    exportToExcel
  } = useLicensingDiscoveryLogic();

  const [configExpanded, setConfigExpanded] = useState(false);

  const statuses = ['active', 'expired', 'trial', 'suspended'];

  const toggleStatus = (status: string) => {
    const current = filter.selectedStatuses;
    const updated = current.includes(status as any)
      ? current.filter(s => s !== status)
      : [...current, status as any];
    updateFilter({ selectedStatuses: updated });
  };

  // Generate Sankey data for license distribution visualization
  const sankeyData = useMemo(() => {
    if (!result || !stats) {
      return { nodes: [] as SankeyNode[], links: [] as SankeyLink[] };
    }

    const nodes: SankeyNode[] = [];
    const links: SankeyLink[] = [];
    const nodeMap = new Map<string, number>();
    let nodeIndex = 0;

    // Create tenant node (source)
    const tenantNodeId = 'tenant-source';
    nodes.push({
      id: tenantNodeId,
      name: 'Source Tenant',
      type: 'company',
      factSheet: {
        baseInfo: { name: 'Source Tenant', type: 'company', description: 'License source tenant', owner: '', status: 'active' },
        relations: { incoming: [], outgoing: [] },
        itComponents: [],
        subscriptions: [],
        comments: [],
        todos: [],
        resources: [],
        metrics: [],
        surveys: [],
        lastUpdate: new Date()
      } as unknown as import('../../types/models/organisation').FactSheetData,
      metadata: { source: 'Licensing', record: {}, priority: 1, category: 'Tenant' }
    });
    nodeMap.set(tenantNodeId, nodeIndex++);

    // Create nodes for each unique license product
    const licenseProducts = (result as any).data || [];
    const productCounts = new Map<string, { assigned: number; available: number; cost: number }>();

    licenseProducts.forEach((license: any) => {
      const productName = license.skuPartNumber || license.productName || 'Unknown Product';
      const existing = productCounts.get(productName) || { assigned: 0, available: 0, cost: 0 };
      existing.assigned += license.consumedUnits || license.assignedCount || 0;
      existing.available += license.prepaidUnits?.enabled || license.availableCount || 0;
      existing.cost += (license.estimatedMonthlyCost || 0);
      productCounts.set(productName, existing);
    });

    // Create product category nodes (middle layer)
    const categories = ['Microsoft 365', 'Azure', 'Office', 'Windows', 'Third Party'];
    categories.forEach((category) => {
      const categoryNodeId = `category-${category.toLowerCase().replace(/\s+/g, '-')}`;
      nodes.push({
        id: categoryNodeId,
        name: category,
        type: 'platform',
        factSheet: {
          baseInfo: { name: category, type: 'platform', description: `${category} license category`, owner: '', status: 'active' },
          relations: { incoming: [], outgoing: [] },
          itComponents: [],
          subscriptions: [],
          comments: [],
          todos: [],
          resources: [],
          metrics: [],
          surveys: [],
          lastUpdate: new Date()
        } as unknown as import('../../types/models/organisation').FactSheetData,
        metadata: { source: 'Licensing', record: {}, priority: 2, category: 'Licensing' }
      });
      nodeMap.set(categoryNodeId, nodeIndex++);
    });

    // Create individual product nodes (right layer)
    const topProducts = Array.from(productCounts.entries())
      .sort((a, b) => b[1].assigned - a[1].assigned)
      .slice(0, 10);

    topProducts.forEach(([productName, data]) => {
      const productNodeId = `product-${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      nodes.push({
        id: productNodeId,
        name: productName,
        type: 'application',
        factSheet: {
          baseInfo: { name: productName, type: 'application', description: `${data.assigned} assigned, ${data.available} available`, owner: '', status: 'active' },
          relations: { incoming: [], outgoing: [] },
          itComponents: [],
          subscriptions: [],
          comments: [],
          todos: [],
          resources: [],
          metrics: [],
          surveys: [],
          lastUpdate: new Date()
        } as unknown as import('../../types/models/organisation').FactSheetData,
        metadata: { source: 'Licensing', record: { assigned: data.assigned, available: data.available, cost: data.cost }, priority: 3, category: 'Application' }
      });
      nodeMap.set(productNodeId, nodeIndex++);
    });

    // Create links from tenant to categories
    const totalLicenses = stats.totalLicenses || 1;
    const categoryDistribution: Record<string, number> = {
      'Microsoft 365': Math.round(totalLicenses * 0.4),
      'Azure': Math.round(totalLicenses * 0.25),
      'Office': Math.round(totalLicenses * 0.2),
      'Windows': Math.round(totalLicenses * 0.1),
      'Third Party': Math.round(totalLicenses * 0.05)
    };

    categories.forEach((category) => {
      const categoryNodeId = `category-${category.toLowerCase().replace(/\s+/g, '-')}`;
      const value = categoryDistribution[category] || 0;
      if (value > 0) {
        links.push({
          source: tenantNodeId,
          target: categoryNodeId,
          value,
          type: 'provides'
        });
      }
    });

    // Create links from categories to products (estimate based on product name patterns)
    topProducts.forEach(([productName, data]) => {
      const productNodeId = `product-${productName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      let categoryId = 'category-third-party';

      if (productName.toLowerCase().includes('365') || productName.toLowerCase().includes('e3') || productName.toLowerCase().includes('e5')) {
        categoryId = 'category-microsoft-365';
      } else if (productName.toLowerCase().includes('azure')) {
        categoryId = 'category-azure';
      } else if (productName.toLowerCase().includes('office') || productName.toLowerCase().includes('word') || productName.toLowerCase().includes('excel')) {
        categoryId = 'category-office';
      } else if (productName.toLowerCase().includes('windows')) {
        categoryId = 'category-windows';
      }

      links.push({
        source: categoryId,
        target: productNodeId,
        value: data.assigned || 1,
        type: 'provides'
      });
    });

    return { nodes, links };
  }, [result, stats]);

  // License overlap analysis data
  const overlapAnalysis = useMemo(() => {
    if (!stats) return null;

    return {
      totalLicenses: stats.totalLicenses || 0,
      assignedLicenses: stats.totalAssigned || 0,
      availableLicenses: stats.totalAvailable || 0,
      utilizationRate: stats.utilizationRate || 0,
      potentialSavings: stats.wastedLicenseCost || 0,
      overlappingProducts: (stats as any).overlicensedCount || 0,
      underlicensedProducts: (stats as any).underlicensedCount || 0
    };
  }, [stats]);

  return (
    <div className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="licensing-discovery-view" data-testid="licensing-discovery-view">
      {isDiscovering && (
        <LoadingOverlay
          progress={progress.percentage}
          onCancel={cancelDiscovery}
          message={progress.message || 'Discovering licenses...'}
         data-testid="loading-overlay"/>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Key className="w-8 h-8 text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Licensing Discovery</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Discover software licenses to identify cost optimization opportunities and plan license consolidation
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {result && (
            <>
              <Button
                onClick={() => exportToCSV((result as any).data || result, `licensing-discovery-${new Date().toISOString().split('T')[0]}.csv`)}
                variant="secondary"
                icon={<Download className="w-4 h-4" />}
                data-cy="export-csv-btn" data-testid="export-csv-btn"
              >
                Export CSV
              </Button>
              <Button
                onClick={() => exportToExcel((result as any).data || result, `licensing-discovery-${new Date().toISOString().split('T')[0]}.xlsx`)}
                variant="secondary"
                icon={<FileSpreadsheet className="w-4 h-4" />}
                data-cy="export-excel-btn" data-testid="export-excel-btn"
              >
                Export Excel
              </Button>
            </>
          )}
          <Button
            onClick={startDiscovery}
            disabled={isDiscovering}
            variant="primary"
            data-cy="start-discovery-btn" data-testid="start-discovery-btn"
          >
            {isDiscovering ? 'Discovering...' : 'Start Discovery'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
          <span className="text-red-800 dark:text-red-200">{error}</span>
          <Button onClick={clearError} variant="ghost" size="sm">Dismiss</Button>
        </div>
      )}

      {/* Configuration Panel */}
      <div className="mx-6 mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
          data-cy="config-toggle" data-testid="config-toggle"
        >
          <span className="font-semibold text-gray-900 dark:text-white">Discovery Configuration</span>
          {configExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {configExpanded && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Checkbox
                label="Include Microsoft 365"
                checked={config.includeMicrosoft365 ?? true}
                onChange={(checked) => updateConfig({ includeMicrosoft365: checked })}
                data-cy="include-m365-checkbox" data-testid="include-m365-checkbox"
              />
              <Checkbox
                label="Include Azure"
                checked={config.includeAzure ?? true}
                onChange={(checked) => updateConfig({ includeAzure: checked })}
                data-cy="include-azure-checkbox" data-testid="include-azure-checkbox"
              />
              <Checkbox
                label="Include Office"
                checked={config.includeOffice ?? true}
                onChange={(checked) => updateConfig({ includeOffice: checked })}
                data-cy="include-office-checkbox" data-testid="include-office-checkbox"
              />
              <Checkbox
                label="Include Windows"
                checked={config.includeWindows ?? true}
                onChange={(checked) => updateConfig({ includeWindows: checked })}
                data-cy="include-windows-checkbox" data-testid="include-windows-checkbox"
              />
              <Checkbox
                label="Include Third Party"
                checked={config.includeThirdParty ?? false}
                onChange={(checked) => updateConfig({ includeThirdParty: checked })}
                data-cy="include-thirdparty-checkbox" data-testid="include-thirdparty-checkbox"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tenant ID (optional)
              </label>
              <Input
                type="text"
                value={config.tenantId || ''}
                onChange={(e) => updateConfig({ tenantId: e.target.value })}
                placeholder="Enter Tenant ID"
                data-cy="tenant-id-input" data-testid="tenant-id-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeout (ms)
              </label>
              <Input
                type="number"
                value={config.timeout ?? 600000}
                onChange={(e) => updateConfig({ timeout: parseInt(e.target.value) || 600000 })}
                min={60000}
                max={1800000}
                step={60000}
                data-cy="timeout-input" data-testid="timeout-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 p-6">
          {/* Row 1: Core License Metrics */}
          <div className="p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Key className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalLicenses ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Total Licenses</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Users className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalAssigned ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Assigned</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalAvailable ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Available</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{typeof stats?.utilizationRate === 'number' ? stats.utilizationRate.toFixed(1) : '0'}%</div>
                <div className="text-sm opacity-90">Utilization</div>
              </div>
            </div>
          </div>

          {/* Row 2: User Metrics */}
          <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <UserCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalLicensedUsers ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Licensed Users</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Layers className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{typeof stats?.avgLicensesPerUser === 'number' ? stats.avgLicensesPerUser.toFixed(1) : '0'}</div>
                <div className="text-sm opacity-90">Avg Licenses/User</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <PieChart className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{typeof stats?.directAssignmentPercent === 'number' ? stats.directAssignmentPercent.toFixed(0) : '0'}%</div>
                <div className="text-sm opacity-90">Direct Assignments</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Settings className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{(stats?.totalServicePlans ?? 0).toLocaleString()}</div>
                <div className="text-sm opacity-90">Service Plans</div>
              </div>
            </div>
          </div>

          {/* Row 3: Cost & Compliance Metrics */}
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">${typeof stats?.estimatedMonthlyCost === 'number' ? stats.estimatedMonthlyCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</div>
                <div className="text-sm opacity-90">Monthly Cost</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <DollarSign className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">${typeof stats?.costPerUser === 'number' ? stats.costPerUser.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</div>
                <div className="text-sm opacity-90">Cost per User</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">${typeof stats?.wastedLicenseCost === 'number' ? stats.wastedLicenseCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}</div>
                <div className="text-sm opacity-90">Wasted Cost</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow text-white">
            <div className="flex items-center justify-between">
              <Calendar className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <div className="text-3xl font-bold">{stats?.expiringCount ?? 0}</div>
                <div className="text-sm opacity-90">Expiring Soon</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-overview" data-testid="tab-overview"
          >
            <Package className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('licenses')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'licenses'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-licenses" data-testid="tab-licenses"
          >
            <Key className="w-4 h-4" />
            Licenses
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalLicenses ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('userAssignments')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'userAssignments'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-user-assignments" data-testid="tab-user-assignments"
          >
            <UserCheck className="w-4 h-4" />
            User Assignments
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalLicensedUsers ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('servicePlans')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'servicePlans'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-service-plans" data-testid="tab-service-plans"
          >
            <Settings className="w-4 h-4" />
            Service Plans
            {stats && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{stats?.totalServicePlans ?? 0}</span>}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-subscriptions" data-testid="tab-subscriptions"
          >
            <Package className="w-4 h-4" />
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'compliance'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-compliance" data-testid="tab-compliance"
          >
            <CheckCircle className="w-4 h-4" />
            Compliance
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === 'distribution'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
            data-cy="tab-distribution" data-testid="tab-distribution"
          >
            <BarChart3 className="w-4 h-4" />
            Distribution
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6 overflow-auto">
            {/* Top Cost Products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Cost Products</h3>
              <div className="space-y-3">
                {(Array.isArray(stats?.topCostProducts) ? stats.topCostProducts : []).map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.product}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${item.cost.toLocaleString(undefined, { maximumFractionDigits: 2 })}/mo
                        </div>
                        <div className="text-xs text-gray-500">{item.count} licenses</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-yellow-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                          style={{ width: `${item.utilization}%` }}
                        >
                          {item.utilization > 10 && `${(typeof item.utilization === 'number' ? item.utilization : 0).toFixed(0)}%`}
                        </div>
                      </div>
                      <div className="w-16 text-xs text-gray-600 dark:text-gray-400">
                        {(typeof item.utilization === 'number' ? item.utilization : 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* License Status Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">License Status Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries((stats?.licensesByStatus ?? 0)).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{status}</span>
                    <span className={`text-lg font-bold ${
                      status === 'active' ? 'text-green-600' :
                      status === 'expired' ? 'text-red-600' :
                      status === 'trial' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Sources */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assignment Sources</h3>
              <div className="space-y-3">
                {Object.entries((stats?.assignmentsBySource ?? 0)).map(([source, count]) => (
                  <div key={source} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{source}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-yellow-600 h-full flex items-center justify-end px-2 text-xs text-white font-medium"
                        style={{ width: `${(stats?.totalAssigned ?? 0) > 0 ? (count / (stats?.totalAssigned ?? 0)) * 100 : 0}%` }}
                      >
                        {count > 0 && `${count}`}
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                      {(stats?.totalAssigned ?? 0) > 0 ? ((count / (stats?.totalAssigned ?? 0)) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && result?.complianceStatus && (
          <div className="space-y-6 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                {(result?.complianceStatus?.isCompliant ?? 0) ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {(result?.complianceStatus?.isCompliant ?? 0) ? 'Compliant' : 'Non-Compliant'}
                </h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Overall Utilization: {typeof result?.complianceStatus?.utilizationRate === 'number' ? result.complianceStatus.utilizationRate.toFixed(1) : '0'}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Unassigned Licenses: {(result?.complianceStatus?.unassignedLicenses ?? 0).toLocaleString()}
              </div>
            </div>

            {(Array.isArray(result?.complianceStatus?.underlicensedProducts) ? result.complianceStatus.underlicensedProducts : []).length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-3">Underlicensed Products</h3>
                <ul className="space-y-2">
                  {(Array.isArray(result?.complianceStatus?.underlicensedProducts) ? result.complianceStatus.underlicensedProducts : []).map((product: string, index: number) => (
                    <li key={index} className="text-sm text-red-800 dark:text-red-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {product}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(Array.isArray(result?.complianceStatus?.overlicensedProducts) ? result.complianceStatus.overlicensedProducts : []).length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-3">Overlicensed Products</h3>
                <ul className="space-y-2">
                  {(Array.isArray(result?.complianceStatus?.overlicensedProducts) ? result.complianceStatus.overlicensedProducts : []).map((product: string, index: number) => (
                    <li key={index} className="text-sm text-yellow-800 dark:text-yellow-300">{product}</li>
                  ))}
                </ul>
              </div>
            )}

            {(Array.isArray(result?.complianceStatus?.expiringSoon) ? result.complianceStatus.expiringSoon : []).length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-200 mb-3">Expiring Soon</h3>
                <div className="space-y-2">
                  {(Array.isArray(result?.complianceStatus?.expiringSoon) ? result.complianceStatus.expiringSoon : []).map((license: { productName?: string; expirationDate?: string | Date }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                      <span className="text-sm text-gray-900 dark:text-white">{license.productName}</span>
                      <span className="text-sm text-orange-600">
                        {license.expirationDate ? new Date(license.expirationDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="space-y-6 overflow-auto">
            {/* License Distribution Sankey Diagram */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">License Distribution Flow</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Visualize how licenses flow from source tenant through categories to individual products
              </p>
              {sankeyData.nodes.length > 0 ? (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                  <SankeyDiagram
                    nodes={sankeyData.nodes}
                    links={sankeyData.links}
                    height={500}
                    onNodeClick={(node) => console.log('[Licensing] Sankey node clicked:', node.name)}
                    layerAlignment="left"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-750 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">Run discovery to see license distribution</p>
                </div>
              )}
            </div>

            {/* License Overlap Analysis */}
            {overlapAnalysis && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <GitMerge className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">License Overlap Analysis</h3>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
                    <div className="text-2xl font-bold">{overlapAnalysis.totalLicenses.toLocaleString()}</div>
                    <div className="text-sm opacity-90">Total Licenses</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-lg text-white">
                    <div className="text-2xl font-bold">{overlapAnalysis.utilizationRate.toFixed(1)}%</div>
                    <div className="text-sm opacity-90">Utilization Rate</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg text-white">
                    <div className="text-2xl font-bold">${overlapAnalysis.potentialSavings.toLocaleString()}</div>
                    <div className="text-sm opacity-90">Potential Savings</div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-lg text-white">
                    <div className="text-2xl font-bold">{overlapAnalysis.overlappingProducts}</div>
                    <div className="text-sm opacity-90">Over-licensed Products</div>
                  </div>
                </div>
              </div>
            )}

            {/* Migration Recommendation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <ArrowRightLeft className="w-6 h-6 text-cyan-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">License Migration Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">License Consolidation Opportunity</span>
                    <span className="text-sm text-green-600 font-semibold">
                      {overlapAnalysis ? `${((overlapAnalysis.availableLicenses / Math.max(overlapAnalysis.totalLicenses, 1)) * 100).toFixed(0)}% consolidatable` : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${overlapAnalysis ? Math.min(((overlapAnalysis.assignedLicenses / Math.max(overlapAnalysis.totalLicenses, 1)) * 100), 100) : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Based on current utilization, {overlapAnalysis?.availableLicenses.toLocaleString() || 0} licenses could potentially be consolidated post-migration
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Source → Target Transfer</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {overlapAnalysis?.assignedLicenses.toLocaleString() || 0} licenses
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Active licenses to migrate
                    </p>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Under-licensed Risk</div>
                    <div className="text-xl font-bold text-red-600">
                      {overlapAnalysis?.underlicensedProducts || 0} products
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      May need additional licenses
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'licenses' || activeTab === 'userAssignments' || activeTab === 'servicePlans' || activeTab === 'subscriptions') && (
          <>
            {/* Filters */}
            <div className="mb-4 space-y-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Input
                    value={filter.searchText}
                    onChange={(e) => updateFilter({ searchText: e.target.value })}
                    placeholder="Search..."
                    data-cy="search-input" data-testid="search-input"
                  />
                </div>
              </div>

              {activeTab === 'licenses' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Status</label>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map(status => (
                        <button
                          key={status}
                          onClick={() => toggleStatus(status)}
                          className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                            filter.selectedStatuses.includes(status as any)
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                          data-cy={`filter-status-${status}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Checkbox
                      label="Show Only Expiring Soon (30 days)"
                      checked={filter.showOnlyExpiring}
                      onChange={(checked) => updateFilter({ showOnlyExpiring: checked })}
                      data-cy="show-expiring-checkbox" data-testid="show-expiring-checkbox"
                    />
                    <Checkbox
                      label="Show Only Unassigned Licenses"
                      checked={filter.showOnlyUnassigned}
                      onChange={(checked) => updateFilter({ showOnlyUnassigned: checked })}
                      data-cy="show-unassigned-checkbox" data-testid="show-unassigned-checkbox"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'userAssignments' && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assignment Source</label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'direct', 'group'].map(source => (
                        <button
                          key={source}
                          onClick={() => updateFilter({ assignmentSource: source as 'all' | 'direct' | 'group' })}
                          className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                            filter.assignmentSource === source
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                          data-cy={`filter-source-${source}`}
                        >
                          {source === 'all' ? 'All Sources' : source}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'servicePlans' && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Status</label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'enabled', 'disabled'].map(status => (
                        <button
                          key={status}
                          onClick={() => updateFilter({ servicePlanStatus: status as 'all' | 'enabled' | 'disabled' })}
                          className={`px-3 py-1 text-sm rounded-full transition-colors capitalize ${
                            filter.servicePlanStatus === status
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                          data-cy={`filter-plan-status-${status}`}
                        >
                          {status === 'all' ? 'All Statuses' : status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Data Grid */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <VirtualizedDataGrid
                data={filteredData as any[]}
                columns={columns}
                loading={isDiscovering}
                enableColumnReorder
                enableColumnResize
              />
            </div>
          </>
        )}
      </div>

      {/* PowerShell Execution Dialog */}
      <PowerShellExecutionDialog
        isOpen={showExecutionDialog}
        onClose={() => !isDiscovering && setShowExecutionDialog(false)}
        scriptName="Licensing Discovery"
        scriptDescription="Discovering Microsoft 365, Azure, and software licenses"
        logs={logs}
        isRunning={isDiscovering}
        isCancelling={isCancelling}
        progress={progress ? {
          percentage: progress.percentage || 0,
          message: progress.message || 'Processing...'
        } : undefined}
        onStart={startDiscovery}
        onStop={cancelDiscovery}
        onClear={clearLogs}
        showStartButton={false}
      />
    </div>
  );
};

export default LicensingDiscoveryView;

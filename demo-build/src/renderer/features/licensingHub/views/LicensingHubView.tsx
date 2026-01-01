import React, { useState } from 'react';
import { FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { useLicensingHub } from '../hooks/useLicensingHub';
import { DashboardCard } from '../components/DashboardCard';
import { AlertsList } from '../components/AlertsList';
import { ShortcutsCard } from '../components/ShortcutsCard';
import { InventoriedComputersChart, InventoryStatusChart, ApplicationsUsageChart } from '../components/charts';
import { Button } from '../../../components/atoms/Button';

type TabType = 'overview' | 'applications' | 'agreements' | 'microsoft-entra' | 'azure-consumption' | 'imports-admin';

export const LicensingHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const {
    isLoading,
    error,
    metrics,
    alerts,
    effectivePositions,
    runIngestion,
    reloadData,
    lastIngestedAt
  } = useLicensingHub();

  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'agreements', label: 'Agreements', icon: FileText },
    { id: 'microsoft-entra', label: 'Microsoft & Entra', icon: FileText },
    { id: 'azure-consumption', label: 'Azure Consumption', icon: FileText },
    { id: 'imports-admin', label: 'Imports & Admin', icon: FileText },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Top Row - Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventoried Computers Chart */}
        <div className="lg:col-span-2">
          <DashboardCard
            title="Inventoried Computers per Month"
            icon={FileText}
          >
            <InventoriedComputersChart data={metrics?.inventoriedComputersPerMonth || []} />
          </DashboardCard>
        </div>

        {/* Shortcuts */}
        <div>
          <ShortcutsCard />
        </div>
      </div>

      {/* Middle Row - Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts List */}
        <DashboardCard title="Recent Alerts" icon={AlertTriangle}>
          <AlertsList alerts={alerts} maxItems={8} />
        </DashboardCard>

        {/* Inventory Status Chart */}
        <DashboardCard title="Computer Inventory Status" icon={FileText}>
          <InventoryStatusChart data={metrics?.inventoryStatus || []} />
        </DashboardCard>
      </div>

      {/* Bottom Row - Applications */}
      <DashboardCard title="Most Used Applications" icon={FileText}>
        <ApplicationsUsageChart data={metrics?.mostUsedApplications || []} />
      </DashboardCard>
    </div>
  );

  const renderApplicationsTab = () => (
    <DashboardCard title="Applications - Coming Soon">
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Applications Management
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Product catalog, entitlement tracking, and license optimization features coming soon.
        </p>
      </div>
    </DashboardCard>
  );

  const renderAgreementsTab = () => (
    <DashboardCard title="Agreements - Coming Soon">
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Contract Management
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          License agreements, renewals, and vendor management features coming soon.
        </p>
      </div>
    </DashboardCard>
  );

  const renderMicrosoftEntraTab = () => (
    <DashboardCard title="Microsoft & Entra - Coming Soon">
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Microsoft 365 & Entra ID
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          User assignments, group-based licensing, and service plans coming soon.
        </p>
      </div>
    </DashboardCard>
  );

  const renderAzureConsumptionTab = () => (
    <DashboardCard title="Azure Consumption - Coming Soon">
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Azure Cost Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Subscription spend tracking, migration cost estimation, and optimization features coming soon.
        </p>
      </div>
    </DashboardCard>
  );

  const renderImportsAdminTab = () => (
    <DashboardCard title="Imports & Administration - Coming Soon">
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Data Management
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          CSV import, data normalization, and administrative settings coming soon.
        </p>
      </div>
    </DashboardCard>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'applications':
        return renderApplicationsTab();
      case 'agreements':
        return renderAgreementsTab();
      case 'microsoft-entra':
        return renderMicrosoftEntraTab();
      case 'azure-consumption':
        return renderAzureConsumptionTab();
      case 'imports-admin':
        return renderImportsAdminTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Licensing Hub
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enterprise license management and optimization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastIngestedAt && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {lastIngestedAt.toLocaleString()}
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => runIngestion()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Run Ingestion
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => reloadData()}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="mt-1 text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading licensing data...</span>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default LicensingHubView;
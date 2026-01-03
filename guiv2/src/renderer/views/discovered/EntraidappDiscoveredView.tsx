/**
 * Entra ID Applications Discovered View
 *
 * Rich discovered view with statistics, breakdowns, and data grids
 */

import React from 'react';
import {
  Settings,
  Shield,
  Server,
  Key,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  Lock,
  FileText,
} from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { useEntraIDAppDiscoveredLogic } from '../../hooks/useEntraIDAppDiscoveredLogic';
import { DiscoverySuccessCard } from '../../components/molecules/DiscoverySuccessCard';

export const EntraidappDiscoveredView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    filteredData,
    statistics,
    columns,
    exportToCSV,
  } = useEntraIDAppDiscoveredLogic();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Entra ID Applications data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <XCircle className="w-12 h-12 mx-auto mb-4" />
          <p>Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Entra ID Applications
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Application registrations, enterprise apps, service principals, and secrets
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid (3 rows × 4 columns = 12 cards) */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 - Discovery Success FIRST */}
        <DiscoverySuccessCard
          percentage={statistics.discoverySuccessPercentage ?? 0}
          received={statistics.dataSourcesReceivedCount ?? 0}
          total={statistics.dataSourcesTotal ?? 4}
          showAnimation={true}
        />
        <StatCard
          icon={Settings}
          label="App Registrations"
          value={statistics.totalAppRegistrations}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          icon={Server}
          label="Enterprise Apps"
          value={statistics.totalEnterpriseApps}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          icon={Shield}
          label="Service Principals"
          value={statistics.totalServicePrincipals}
          gradient="from-purple-500 to-purple-600"
        />
        <StatCard
          icon={Key}
          label="Application Secrets"
          value={statistics.totalSecrets}
          gradient="from-yellow-500 to-yellow-600"
        />

        {/* Row 2 */}
        <StatCard
          icon={AlertTriangle}
          label="Secrets Expiring Soon"
          value={statistics.secretsExpiringSoon}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Valid Secrets"
          value={statistics.secretsValid}
          gradient="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={XCircle}
          label="Expired Secrets"
          value={statistics.secretsExpired}
          gradient="from-red-500 to-red-600"
        />
        <StatCard
          icon={Lock}
          label="Apps with Secrets"
          value={statistics.appsWithSecrets}
          gradient="from-indigo-500 to-indigo-600"
        />

        {/* Row 3 */}
        <StatCard
          icon={FileText}
          label="Apps with Certificates"
          value={statistics.appsWithCertificates}
          gradient="from-cyan-500 to-cyan-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Enabled Service Principals"
          value={statistics.enabledServicePrincipals}
          gradient="from-teal-500 to-teal-600"
        />
        <StatCard
          icon={Shield}
          label="High Privilege Apps"
          value={statistics.appsWithHighPrivileges}
          gradient="from-rose-500 to-rose-600"
        />
      </div>

      {/* Tabs */}
      <div className="px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex gap-2">
          <TabButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={FileText}
            label="Overview"
          />
          <TabButton
            active={activeTab === 'app-registrations'}
            onClick={() => setActiveTab('app-registrations')}
            icon={Settings}
            label={`App Registrations (${statistics.totalAppRegistrations})`}
          />
          <TabButton
            active={activeTab === 'enterprise-apps'}
            onClick={() => setActiveTab('enterprise-apps')}
            icon={Server}
            label={`Enterprise Apps (${statistics.totalEnterpriseApps})`}
          />
          <TabButton
            active={activeTab === 'service-principals'}
            onClick={() => setActiveTab('service-principals')}
            icon={Shield}
            label={`Service Principals (${statistics.totalServicePrincipals})`}
          />
          <TabButton
            active={activeTab === 'secrets'}
            onClick={() => setActiveTab('secrets')}
            icon={Key}
            label={`Secrets (${statistics.totalSecrets})`}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'overview' && (
          <OverviewTab statistics={statistics} />
        )}

        {activeTab !== 'overview' && (
          <div className="h-screen flex flex-col p-6 overflow-hidden">
            {/* Search and Export */}
            <div className="flex gap-4 mb-4 flex-shrink-0">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Export CSV
              </button>
            </div>

            {/* Data Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden" style={{ minHeight: "600px" }}>
              <VirtualizedDataGrid
                data={filteredData}
                columns={columns}
                enableFiltering={true}
                enableColumnResize={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, gradient }) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">{label}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        </div>
        <Icon className="w-12 h-12 opacity-80" />
      </div>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<any>;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );
};

interface OverviewTabProps {
  statistics: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ statistics }) => {
  return (
    <div className="p-6 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sign-In Audience Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Sign-In Audience Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(statistics.signInAudienceBreakdown).map(([audience, count]) => {
              const countNum = count as number;
              return (
                <div key={audience}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{audience}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {countNum}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(countNum / statistics.totalAppRegistrations) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Principal Type Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Service Principal Type Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(statistics.spTypeBreakdown).map(([type, count]) => {
              const countNum = count as number;
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {countNum}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(countNum / statistics.totalServicePrincipals) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Apps by Secrets */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-600" />
            Top Apps by Credential Count
          </h3>
          <div className="space-y-3">
            {statistics.topAppsBySecrets.slice(0, 10).map((app: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {app.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {app.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(app.count / statistics.topAppsBySecrets[0]?.count || 1) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Publishers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            Top Publishers
          </h3>
          <div className="space-y-3">
            {statistics.topPublishers.slice(0, 10).map((publisher: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {publisher.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {publisher.count}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(publisher.count / statistics.topPublishers[0]?.count || 1) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function getCSVFileName(activeTab: string): string {
  switch (activeTab) {
    case 'app-registrations':
      return 'EntraIDAppRegistrations.csv';
    case 'enterprise-apps':
      return 'EntraIDEnterpriseApps.csv';
    case 'service-principals':
      return 'EntraIDServicePrincipals.csv';
    case 'secrets':
      return 'EntraIDApplicationSecrets.csv';
    default:
      return 'EntraIDApp.csv';
  }
}

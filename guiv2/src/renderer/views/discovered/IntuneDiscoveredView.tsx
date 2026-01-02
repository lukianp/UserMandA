/**
 * IntuneDiscoveredView.tsx
 * Rich discovered view for Intune data with statistics, tabs, and data grids
 * Version: 1.1.0
 */

import React from 'react';
import {
  Smartphone,
  Monitor,
  Shield,
  ShieldCheck,
  ShieldX,
  Package,
  Settings,
  Lock,
  Laptop,
  Download,
  RefreshCw,
  Search
} from 'lucide-react';

import { useIntuneDiscoveredLogic } from '../../hooks/useIntuneDiscoveredLogic';
import { DiscoverySuccessCard } from '../../components/molecules/DiscoverySuccessCard';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';

const IntuneDiscoveredView: React.FC = () => {
  const {
    devices,
    configurations,
    compliancePolicies,
    appProtectionPolicies,
    apps,
    allDevices,
    allConfigurations,
    allCompliancePolicies,
    allAppProtectionPolicies,
    allApps,
    statistics,
    activeTab,
    setActiveTab,
    searchText,
    setSearchText,
    isLoading,
    error,
    lastUpdated,
    refresh,
    exportToCSV,
    deviceColumns,
    configurationColumns,
    compliancePolicyColumns,
    appProtectionColumns,
    appColumns
  } = useIntuneDiscoveredLogic();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Smartphone },
    { id: 'devices', label: `Devices (${allDevices.length})`, icon: Monitor },
    { id: 'configurations', label: `Configurations (${allConfigurations.length})`, icon: Settings },
    { id: 'compliance', label: `Compliance (${allCompliancePolicies.length})`, icon: ShieldCheck },
    { id: 'appProtection', label: `App Protection (${allAppProtectionPolicies.length})`, icon: Shield },
    { id: 'apps', label: `Apps (${allApps.length})`, icon: Package }
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading Intune data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <Smartphone size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Intune Discovered Data</h1>
              <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                v1.1.0
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {allDevices.length} devices, {allConfigurations.length} configurations, {allApps.length} apps
              {lastUpdated && ` | Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={refresh} variant="secondary" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          {activeTab !== 'overview' && (
            <Button
              onClick={() => {
                const data = activeTab === 'devices' ? devices :
                  activeTab === 'configurations' ? configurations :
                  activeTab === 'compliance' ? compliancePolicies :
                  activeTab === 'appProtection' ? appProtectionPolicies : apps;
                exportToCSV(data, `intune-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
              }}
              variant="secondary"
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search (for data tabs) */}
      {activeTab !== 'overview' && (
        <div className="px-6 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search..."
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 pt-4">
            {/* Statistics Cards - Row 1 */}
            <div className="grid grid-cols-4 gap-4">
              {/* Discovery Success - Using standardized component */}
              <DiscoverySuccessCard
                percentage={statistics.discoverySuccessPercent}
                received={statistics.receivedDataSources}
                total={statistics.expectedDataSources}
                showAnimation={true}
              />

              {/* Total Devices */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Devices</p>
                    <p className="text-3xl font-bold">{statistics.totalDevices}</p>
                    <p className="text-xs opacity-75">Managed endpoints</p>
                  </div>
                  <Monitor size={32} className="opacity-80" />
                </div>
              </div>

              {/* Compliant Devices */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Compliant</p>
                    <p className="text-3xl font-bold">{statistics.compliantDevices}</p>
                    <p className="text-xs opacity-75">{statistics.totalDevices > 0 ? Math.round((statistics.compliantDevices / statistics.totalDevices) * 100) : 0}% of devices</p>
                  </div>
                  <ShieldCheck size={32} className="opacity-80" />
                </div>
              </div>

              {/* Non-Compliant Devices */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Non-Compliant</p>
                    <p className="text-3xl font-bold">{statistics.nonCompliantDevices}</p>
                    <p className="text-xs opacity-75">Requires attention</p>
                  </div>
                  <ShieldX size={32} className="opacity-80" />
                </div>
              </div>
            </div>

            {/* Statistics Cards - Row 2 */}
            <div className="grid grid-cols-4 gap-4">
              {/* Windows Devices */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Windows</p>
                    <p className="text-3xl font-bold">{statistics.windowsDevices}</p>
                    <p className="text-xs opacity-75">Windows devices</p>
                  </div>
                  <Laptop size={32} className="opacity-80" />
                </div>
              </div>

              {/* iOS Devices */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">iOS</p>
                    <p className="text-3xl font-bold">{statistics.iosDevices}</p>
                    <p className="text-xs opacity-75">iOS devices</p>
                  </div>
                  <Smartphone size={32} className="opacity-80" />
                </div>
              </div>

              {/* Android Devices */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Android</p>
                    <p className="text-3xl font-bold">{statistics.androidDevices}</p>
                    <p className="text-xs opacity-75">Android devices</p>
                  </div>
                  <Smartphone size={32} className="opacity-80" />
                </div>
              </div>

              {/* Encrypted Devices */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Encrypted</p>
                    <p className="text-3xl font-bold">{statistics.encryptedDevices}</p>
                    <p className="text-xs opacity-75">{statistics.totalDevices > 0 ? Math.round((statistics.encryptedDevices / statistics.totalDevices) * 100) : 0}% encrypted</p>
                  </div>
                  <Lock size={32} className="opacity-80" />
                </div>
              </div>
            </div>

            {/* Statistics Cards - Row 3 */}
            <div className="grid grid-cols-4 gap-4">
              {/* Configurations */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Configurations</p>
                    <p className="text-3xl font-bold">{statistics.totalConfigurations}</p>
                    <p className="text-xs opacity-75">{statistics.assignedConfigurations} assigned</p>
                  </div>
                  <Settings size={32} className="opacity-80" />
                </div>
              </div>

              {/* Compliance Policies */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Compliance Policies</p>
                    <p className="text-3xl font-bold">{statistics.totalCompliancePolicies}</p>
                    <p className="text-xs opacity-75">Policy definitions</p>
                  </div>
                  <ShieldCheck size={32} className="opacity-80" />
                </div>
              </div>

              {/* App Protection */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">App Protection</p>
                    <p className="text-3xl font-bold">{statistics.totalAppProtectionPolicies}</p>
                    <p className="text-xs opacity-75">iOS: {statistics.iosAppPolicies}, Android: {statistics.androidAppPolicies}</p>
                  </div>
                  <Shield size={32} className="opacity-80" />
                </div>
              </div>

              {/* Managed Apps */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Managed Apps</p>
                    <p className="text-3xl font-bold">{statistics.totalApps}</p>
                    <p className="text-xs opacity-75">{statistics.assignedApps} assigned</p>
                  </div>
                  <Package size={32} className="opacity-80" />
                </div>
              </div>
            </div>

            {/* Breakdown Panels */}
            <div className="grid grid-cols-2 gap-6">
              {/* Devices by OS */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Devices by Operating System</h3>
                <div className="space-y-3">
                  {statistics.devicesByOS.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                            style={{ width: `${statistics.totalDevices > 0 ? (item.count / statistics.totalDevices) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {statistics.devicesByOS.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No device data available</p>
                  )}
                </div>
              </div>

              {/* Devices by Compliance State */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Devices by Compliance State</h3>
                <div className="space-y-3">
                  {statistics.devicesByComplianceState.slice(0, 5).map((item, idx) => {
                    const stateColor = item.name.toLowerCase() === 'compliant' ? 'from-green-500 to-green-600' :
                      item.name.toLowerCase() === 'noncompliant' ? 'from-red-500 to-red-600' :
                      'from-yellow-500 to-yellow-600';
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{item.name}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${stateColor} rounded-full`}
                              style={{ width: `${statistics.totalDevices > 0 ? (item.count / statistics.totalDevices) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {statistics.devicesByComplianceState.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No compliance data available</p>
                  )}
                </div>
              </div>

              {/* Top Manufacturers */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Device Manufacturers</h3>
                <div className="space-y-3">
                  {statistics.topManufacturers.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                            style={{ width: `${statistics.totalDevices > 0 ? (item.count / statistics.totalDevices) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {statistics.topManufacturers.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No manufacturer data available</p>
                  )}
                </div>
              </div>

              {/* Top App Types */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apps by Type</h3>
                <div className="space-y-3">
                  {statistics.topAppTypes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full"
                            style={{ width: `${statistics.totalApps > 0 ? (item.count / statistics.totalApps) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {statistics.topAppTypes.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">No app data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Tabs */}
        {activeTab === 'devices' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid
              data={devices}
              columns={deviceColumns}
              getRowId={(row) => row.DeviceId || Math.random().toString()}
            />
          </div>
        )}

        {activeTab === 'configurations' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid
              data={configurations}
              columns={configurationColumns}
              getRowId={(row) => row.ConfigurationId || Math.random().toString()}
            />
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid
              data={compliancePolicies}
              columns={compliancePolicyColumns}
              getRowId={(row) => row.PolicyId || Math.random().toString()}
            />
          </div>
        )}

        {activeTab === 'appProtection' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid
              data={appProtectionPolicies}
              columns={appProtectionColumns}
              getRowId={(row) => row.PolicyId || Math.random().toString()}
            />
          </div>
        )}

        {activeTab === 'apps' && (
          <div className="h-[calc(100vh-320px)]">
            <VirtualizedDataGrid
              data={apps}
              columns={appColumns}
              getRowId={(row) => row.AppId || Math.random().toString()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IntuneDiscoveredView;

/**
 * ComputerDetailView Component
 *
 * Comprehensive computer detail view with 6-tab structure.
 * Replicates UserDetailView pattern for computers.
 *
 * Features:
 * - Computer summary card with 3-column layout
 * - 6 data correlation tabs (Overview, Users, Software, Hardware, Security, Network)
 * - Action buttons (Refresh, Add to Wave, Export, Remote Connect, Close)
 * - Loading overlay with progress messages
 * - Full keyboard navigation and accessibility
 *
 * Epic 1 Task 1.3: ComputerDetailView Component
 *
 * @param computerId - Computer identifier passed via route params
 */

import React, { useEffect, useMemo } from 'react';
import { RefreshCw, UserPlus, Download, X, MonitorPlay } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

import { useComputerDetailLogic } from '../../hooks/useComputerDetailLogic';
import { Button } from '../../components/atoms/Button';
import LoadingOverlay from '../../components/molecules/LoadingOverlay';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { ModernCard } from '../../components/atoms/ModernCard';
import type {
  ComputerDetailProjection,
  ComputerUserData,
  SoftwareInstallation,
  HardwareSpec,
  SecurityComplianceStatus,
  NetworkAdapter,
  ComputerRiskItem,
} from '../../types/models/computerDetail';

export interface ComputerDetailViewProps {
  computerId: string;
}

export const ComputerDetailView: React.FC<ComputerDetailViewProps> = ({ computerId }) => {
  const {
    computerDetail,
    isLoading,
    error,
    loadingMessage,
    selectedTab,
    setSelectedTab,
    refreshData,
    addToMigrationWave,
    exportSnapshot,
    remoteConnect,
    closeView,
  } = useComputerDetailLogic(computerId);

  // Keyboard shortcuts (Ctrl+R, Ctrl+E, Ctrl+C, Ctrl+W, Ctrl+1-6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            refreshData();
            break;
          case 'e':
            e.preventDefault();
            exportSnapshot('json');
            break;
          case 'c':
            e.preventDefault();
            remoteConnect();
            break;
          case 'w':
            e.preventDefault();
            closeView();
            break;
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
            e.preventDefault();
            setSelectedTab(parseInt(e.key) - 1);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshData, exportSnapshot, remoteConnect, closeView, setSelectedTab]);

  // Render error state
  if (error && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <ModernCard className="p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Error Loading Computer Details
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={refreshData} variant="primary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col p-6" data-cy="computer-detail-view" data-testid="computer-detail-view">
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}

      {/* Header Section */}
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <span>🖥️</span>
            {computerDetail?.computer.name || 'Computer Details'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive computer information and related assets
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={refreshData}
            variant="secondary"
            disabled={isLoading}
            title="Refresh computer data (Ctrl+R)"
            data-cy="refresh-computer-detail" data-testid="refresh-computer-detail"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            onClick={remoteConnect}
            variant="secondary"
            disabled={isLoading || !computerDetail}
            title="Remote connect (Ctrl+C)"
            data-cy="remote-connect" data-testid="remote-connect"
          >
            <MonitorPlay className="mr-2 h-4 w-4" />
            Connect
          </Button>

          <Button
            onClick={addToMigrationWave}
            variant="secondary"
            disabled={isLoading || !computerDetail}
            title="Add computer to migration wave"
            data-cy="add-to-wave" data-testid="add-to-wave"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add to Wave
          </Button>

          <Button
            onClick={() => exportSnapshot('json')}
            variant="secondary"
            disabled={isLoading || !computerDetail}
            title="Export computer details (Ctrl+E)"
            data-cy="export-computer-detail" data-testid="export-computer-detail"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            onClick={closeView}
            variant="danger"
            title="Close computer details (Ctrl+W)"
            data-cy="close-computer-detail" data-testid="close-computer-detail"
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </header>

      {/* Computer Summary Card */}
      {computerDetail && (
        <ModernCard className="mb-6 p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">💻</span>
                System Information
              </h3>
              <div className="space-y-3">
                <LabelValuePair label="Computer Name" value={computerDetail.computer.name} />
                <LabelValuePair label="DNS Name" value={computerDetail.computer.dns} />
                <LabelValuePair label="IP Address" value={computerDetail.computer.ipAddress} />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">🏢</span>
                Domain & OU
              </h3>
              <div className="space-y-3">
                <LabelValuePair label="Domain" value={computerDetail.computer.domain} />
                <LabelValuePair label="Organizational Unit" value={computerDetail.computer.ou} />
                <LabelValuePair
                  label="Status"
                  value={
                    <span
                      className={
                        computerDetail.computer.status === 'Online'
                          ? 'text-green-600 dark:text-green-400 font-semibold'
                          : computerDetail.computer.status === 'Offline'
                          ? 'text-red-600 dark:text-red-400 font-semibold'
                          : 'text-gray-600 dark:text-gray-400'
                      }
                    >
                      {computerDetail.computer.status}
                    </span>
                  }
                />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                <span className="mr-2">📅</span>
                Activity Status
              </h3>
              <div className="space-y-3">
                <LabelValuePair label="OS" value={computerDetail.computer.os} />
                <LabelValuePair label="OS Version" value={computerDetail.computer.osVersion} />
                <LabelValuePair label="Last Seen" value={formatDateTime(computerDetail.computer.lastSeen)} />
              </div>
            </div>
          </div>
        </ModernCard>
      )}

      {/* 6-Tab Control */}
      {computerDetail && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            {TAB_CONFIG.map((tab, index) => (
              <button
                key={index}
                onClick={() => setSelectedTab(index)}
                className={`
                  px-4 py-3 font-medium text-sm transition-colors
                  ${
                    selectedTab === index
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
                data-cy={`computer-detail-tab-${tab.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">{renderTabContent(selectedTab, computerDetail)}</div>
        </div>
      )}

      {/* Status Bar */}
      <footer className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">{isLoading ? loadingMessage : 'Ready'}</p>
      </footer>
    </div>
  );
};

const TAB_CONFIG = [
  { label: 'Overview', icon: '📊' },
  { label: 'Users', icon: '👥' },
  { label: 'Software', icon: '📦' },
  { label: 'Hardware', icon: '⚙️' },
  { label: 'Security', icon: '🛡️' },
  { label: 'Network', icon: '🌐' },
];

function renderTabContent(tabIndex: number, computerDetail: ComputerDetailProjection): React.ReactNode {
  switch (tabIndex) {
    case 0:
      return <OverviewTab computerDetail={computerDetail} />;
    case 1:
      return <UsersTab users={computerDetail.users} />;
    case 2:
      return <SoftwareTab software={computerDetail.software} />;
    case 3:
      return <HardwareTab hardware={computerDetail.hardware} />;
    case 4:
      return <SecurityTab security={computerDetail.security} />;
    case 5:
      return <NetworkTab network={computerDetail.network} />;
    default:
      return null;
  }
}

// ===== Tab Components =====

const OverviewTab: React.FC<{ computerDetail: ComputerDetailProjection }> = React.memo(
  ({ computerDetail }) => (
    <ModernCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Computer Overview Summary</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">Resource Summary</h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Assigned Users: {computerDetail.overview.userCount}</li>
            <li>Installed Software: {computerDetail.overview.softwareCount}</li>
            <li>Group Memberships: {computerDetail.overview.groupCount}</li>
            <li>Network Adapters: {computerDetail.overview.networkAdapterCount}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">System Status</h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Last Boot: {formatDateTime(computerDetail.overview.lastBootTime)}</li>
            <li>Uptime: {computerDetail.overview.uptime || 'N/A'}</li>
            <li>Install Date: {formatDate(computerDetail.overview.installDate)}</li>
            <li>
              Risk Items:{' '}
              <span
                className={
                  computerDetail.risks.length > 0
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : 'text-green-600 dark:text-green-400'
                }
              >
                {computerDetail.risks.length}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </ModernCard>
  )
);

const UsersTab: React.FC<{ users: ComputerUserData[] }> = React.memo(({ users }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'displayName', headerName: 'Display Name', width: 200, sortable: true, filter: true },
      { field: 'userPrincipalName', headerName: 'UPN', width: 250, sortable: true, filter: true },
      { field: 'assignmentType', headerName: 'Type', width: 120, sortable: true },
      {
        field: 'isPrimaryUser',
        headerName: 'Primary',
        width: 100,
        cellRenderer: (params: any) => (params.value ? '✓' : ''),
      },
      {
        field: 'lastLogon',
        headerName: 'Last Logon',
        width: 150,
        sortable: true,
        valueFormatter: (params) => (params.value ? formatDateTime(params.value) : 'N/A'),
      },
    ],
    []
  );

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">No users assigned to this computer.</p>
      </div>
    );
  }

  return <VirtualizedDataGrid data={users} columns={columnDefs} loading={false} height="100%" />;
});

const SoftwareTab: React.FC<{ software: SoftwareInstallation[] }> = React.memo(({ software }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'name', headerName: 'Software Name', width: 300, sortable: true, filter: true },
      { field: 'version', headerName: 'Version', width: 120, sortable: true },
      { field: 'publisher', headerName: 'Publisher', width: 200, sortable: true, filter: true },
      {
        field: 'installDate',
        headerName: 'Install Date',
        width: 120,
        valueFormatter: (params) => (params.value ? formatDate(params.value) : 'N/A'),
      },
    ],
    []
  );

  if (software.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">No software installed on this computer.</p>
      </div>
    );
  }

  return <VirtualizedDataGrid data={software} columns={columnDefs} loading={false} height="100%" />;
});

const HardwareTab: React.FC<{ hardware: HardwareSpec }> = React.memo(({ hardware }) => (
  <ModernCard className="p-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Hardware Specifications</h3>
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-3">
        <LabelValuePair label="Processor" value={hardware.processor} />
        <LabelValuePair label="Cores" value={hardware.processorCores?.toString()} />
        <LabelValuePair label="RAM (GB)" value={hardware.ramGB?.toString()} />
        <LabelValuePair label="Total Disk (GB)" value={hardware.totalDiskGB?.toString()} />
        <LabelValuePair label="Free Disk (GB)" value={hardware.freeDiskGB?.toString()} />
      </div>
      <div className="space-y-3">
        <LabelValuePair label="Disk Type" value={hardware.diskType} />
        <LabelValuePair label="Graphics Card" value={hardware.graphicsCard} />
        <LabelValuePair label="System Type" value={hardware.systemType} />
        <LabelValuePair label="Virtual Machine" value={hardware.virtualMachine ? 'Yes' : 'No'} />
        <LabelValuePair label="Hypervisor" value={hardware.hypervisor} />
      </div>
    </div>
  </ModernCard>
));

const SecurityTab: React.FC<{ security: SecurityComplianceStatus }> = React.memo(({ security }) => (
  <ModernCard className="p-6">
    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Security & Compliance Status</h3>
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-3">
        <LabelValuePair label="Antivirus Product" value={security.antivirusProduct} />
        <LabelValuePair label="AV Up-to-Date" value={security.antivirusUpToDate ? 'Yes' : 'No'} />
        <LabelValuePair label="Firewall Enabled" value={security.firewallEnabled ? 'Yes' : 'No'} />
        <LabelValuePair label="Encryption Enabled" value={security.encryptionEnabled ? 'Yes' : 'No'} />
        <LabelValuePair label="TPM Enabled" value={security.tpmEnabled ? 'Yes' : 'No'} />
      </div>
      <div className="space-y-3">
        <LabelValuePair label="Secure Boot" value={security.secureBoot ? 'Yes' : 'No'} />
        <LabelValuePair label="Last Patch Date" value={formatDate(security.lastPatchDate)} />
        <LabelValuePair label="Patch Level" value={security.patchLevel} />
        <LabelValuePair label="Compliance Status" value={security.complianceStatus} />
        <LabelValuePair label="Vulnerability Count" value={security.vulnerabilityCount.toString()} />
      </div>
    </div>
  </ModernCard>
));

const NetworkTab: React.FC<{ network: any }> = React.memo(({ network }) => {
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'name', headerName: 'Adapter Name', width: 200, sortable: true },
      { field: 'type', headerName: 'Type', width: 120, sortable: true },
      { field: 'macAddress', headerName: 'MAC Address', width: 150 },
      { field: 'status', headerName: 'Status', width: 120 },
      { field: 'speed', headerName: 'Speed', width: 120 },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <ModernCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Network Configuration</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <LabelValuePair label="IP Address" value={network.ipAddress} />
            <LabelValuePair label="MAC Address" value={network.macAddress} />
            <LabelValuePair label="Subnet" value={network.subnet} />
            <LabelValuePair label="Gateway" value={network.gateway} />
          </div>
          <div className="space-y-3">
            <LabelValuePair label="DHCP Enabled" value={network.dhcpEnabled ? 'Yes' : 'No'} />
            <LabelValuePair label="DHCP Server" value={network.dhcpServer} />
            <LabelValuePair label="Connection Type" value={network.connectionType} />
            <LabelValuePair label="Network Speed" value={network.networkSpeed} />
          </div>
        </div>
      </ModernCard>

      {network.adapters && network.adapters.length > 0 && (
        <div className="h-64">
          <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Network Adapters</h3>
          <VirtualizedDataGrid data={network.adapters} columns={columnDefs} loading={false} height="100%" />
        </div>
      )}
    </div>
  );
});

// ===== Helper Components =====

const LabelValuePair: React.FC<{ label: string; value: string | null | undefined | React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-40">{label}:</span>
    <span className="text-sm text-gray-900 dark:text-gray-100">{value || 'N/A'}</span>
  </div>
);

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default ComputerDetailView;

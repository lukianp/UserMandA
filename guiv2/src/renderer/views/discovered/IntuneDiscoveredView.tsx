/**
 * Intune Discovered View
 *
 * Displays Intune discovery results from CSV export
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';

import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';
import { IntuneDiscoveryData, parsePowerShellDate } from '../../types/discoveryData';

const INTUNE_COLUMNS: ColDef<IntuneDiscoveryData>[] = [
  { field: 'DeviceName', headerName: 'Device Name', sortable: true, filter: true, pinned: 'left', width: 200 },
  { field: 'UserPrincipalName', headerName: 'User', sortable: true, filter: true, width: 200 },
  { field: 'OperatingSystem', headerName: 'OS', sortable: true, filter: true, width: 100 },
  { field: 'OsVersion', headerName: 'OS Version', sortable: true, filter: true, width: 120 },
  { field: 'ComplianceState', headerName: 'Compliance', sortable: true, filter: true, width: 120 },
  { field: 'ManagedDeviceOwnerType', headerName: 'Owner Type', sortable: true, filter: true, width: 120 },
  {
    field: 'EnrollmentDate',
    headerName: 'Enrolled',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 120,
    valueFormatter: (params) => {
      if (!params.value) return 'N/A';
      const date = parsePowerShellDate(params.value);
      return date ? date.toLocaleDateString() : 'Invalid';
    },
  },
  {
    field: 'LastSyncDateTime',
    headerName: 'Last Sync',
    sortable: true,
    filter: 'agDateColumnFilter',
    width: 120,
    valueFormatter: (params) => {
      if (!params.value) return 'Never';
      const date = parsePowerShellDate(params.value);
      return date ? date.toLocaleDateString() : 'Invalid';
    },
  },
  { field: 'DeviceId', headerName: 'Device ID', sortable: true, filter: true, width: 250 },
];

export const IntuneDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewTemplate<IntuneDiscoveryData>
      moduleName="Intune"
      csvPath="intune/results.csv"
      columns={INTUNE_COLUMNS}
      title="Intune Managed Devices"
      description="Discovered data of Microsoft Intune managed devices"
      data-cy="intune-discovered-view"
    />
  );
};

export default IntuneDiscoveredView;

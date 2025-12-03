/**
 * VMware Discovered View
 *
 * Displays VMware discovery results from CSV export
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';

import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';
import { VmwareDiscoveryData } from '../../types/discoveryData';

const VMWARE_COLUMNS: ColDef<VmwareDiscoveryData>[] = [
  { field: 'VmName', headerName: 'VM Name', sortable: true, filter: true, pinned: 'left', width: 200 },
  { field: 'PowerState', headerName: 'Power State', sortable: true, filter: true, width: 120 },
  { field: 'VCenterServer', headerName: 'vCenter', sortable: true, filter: true, width: 150 },
  { field: 'Datacenter', headerName: 'Datacenter', sortable: true, filter: true, width: 130 },
  { field: 'Cluster', headerName: 'Cluster', sortable: true, filter: true, width: 130 },
  { field: 'Host', headerName: 'Host', sortable: true, filter: true, width: 150 },
  { field: 'NumCpu', headerName: 'CPUs', sortable: true, filter: 'agNumberColumnFilter', width: 80 },
  { field: 'MemoryMB', headerName: 'Memory (MB)', sortable: true, filter: 'agNumberColumnFilter', width: 120 },
  { field: 'GuestOS', headerName: 'Guest OS', sortable: true, filter: true, width: 150 },
  { field: 'IpAddress', headerName: 'IP Address', sortable: true, filter: true, width: 130 },
];

export const VMwareDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewTemplate<VmwareDiscoveryData>
      moduleName="VMware"
      csvPath="vmware/results.csv"
      columns={VMWARE_COLUMNS}
      title="VMware Virtual Machines"
      description="Discovered data of VMware vSphere virtual machines"
      data-cy="vmware-discovered-view"
    />
  );
};

export default VMwareDiscoveredView;

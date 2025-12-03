/**
 * Hyper-V Discovered View
 *
 * Displays Hyper-V discovery results from CSV export
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';

import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';
import { HyperVDiscoveryData } from '../../types/discoveryData';

const HYPERV_COLUMNS: ColDef<HyperVDiscoveryData>[] = [
  { field: 'VmName', headerName: 'VM Name', sortable: true, filter: true, pinned: 'left', width: 200 },
  { field: 'State', headerName: 'State', sortable: true, filter: true, width: 100 },
  { field: 'HostName', headerName: 'Host', sortable: true, filter: true, width: 150 },
  { field: 'ProcessorCount', headerName: 'CPUs', sortable: true, filter: 'agNumberColumnFilter', width: 80 },
  { field: 'MemoryMB', headerName: 'Memory (MB)', sortable: true, filter: 'agNumberColumnFilter', width: 120 },
  { field: 'Generation', headerName: 'Generation', sortable: true, filter: 'agNumberColumnFilter', width: 100 },
  { field: 'Version', headerName: 'Version', sortable: true, filter: true, width: 120 },
  { field: 'NetworkAdapters', headerName: 'Network Adapters', sortable: true, filter: true, width: 150 },
];

export const HyperVDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewTemplate<HyperVDiscoveryData>
      moduleName="Hyper-V"
      csvPath="hyperv/results.csv"
      columns={HYPERV_COLUMNS}
      title="Hyper-V Virtual Machines"
      description="Discovered data of Hyper-V virtual machines"
      data-cy="hyperv-discovered-view"
    />
  );
};

export default HyperVDiscoveredView;

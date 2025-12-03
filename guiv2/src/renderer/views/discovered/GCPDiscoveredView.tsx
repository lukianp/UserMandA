/**
 * GCP Discovered View
 *
 * Displays GCP discovery results from CSV export
 */

import React from 'react';
import { ColDef } from 'ag-grid-community';

import { DiscoveredViewTemplate } from '../../components/organisms/DiscoveredViewTemplate';
import { GcpDiscoveryData } from '../../types/discoveryData';

const GCP_COLUMNS: ColDef<GcpDiscoveryData>[] = [
  { field: 'Name', headerName: 'Resource Name', sortable: true, filter: true, pinned: 'left', width: 200 },
  { field: 'ResourceType', headerName: 'Type', sortable: true, filter: true, width: 150 },
  { field: 'ProjectId', headerName: 'Project ID', sortable: true, filter: true, width: 200 },
  { field: 'Zone', headerName: 'Zone', sortable: true, filter: true, width: 120 },
  { field: 'ResourceId', headerName: 'Resource ID', sortable: true, filter: true, width: 200 },
  { field: 'MachineType', headerName: 'Machine Type', sortable: true, filter: true, width: 130 },
  { field: 'Network', headerName: 'Network', sortable: true, filter: true, width: 150 },
  { field: 'Status', headerName: 'Status', sortable: true, filter: true, width: 100 },
  { field: 'Labels', headerName: 'Labels', sortable: true, filter: true, width: 200 },
];

export const GCPDiscoveredView: React.FC = () => {
  return (
    <DiscoveredViewTemplate<GcpDiscoveryData>
      moduleName="GCP"
      csvPath="gcp/results.csv"
      columns={GCP_COLUMNS}
      title="GCP Resources"
      description="Discovered data of Google Cloud Platform resources"
      data-cy="gcp-discovered-view"
    />
  );
};

export default GCPDiscoveredView;

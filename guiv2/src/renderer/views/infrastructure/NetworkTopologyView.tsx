import React from 'react';
import DataTable from '../../components/organisms/DataTable';
import { useNetworkTopologyLogic } from '../../hooks/infrastructure/useNetworkTopologyLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColDef } from 'ag-grid-community';
import type { NetworkTopologyData } from '../../hooks/infrastructure/useNetworkTopologyLogic';

const NetworkTopologyView: React.FC = () => {
  const { data, isLoading, error, reload } = useNetworkTopologyLogic();

  const columns: ColDef<NetworkTopologyData>[] = [
    {
      field: 'deviceName',
      headerName: 'Device Name',
      sortable: true,
      filter: true,
    },
    {
      field: 'ipAddress',
      headerName: 'IP Address',
      sortable: true,
      filter: true,
    },
    {
      field: 'deviceType',
      headerName: 'Device Type',
      sortable: true,
      filter: true,
    },
    {
      field: 'location',
      headerName: 'Location',
      sortable: true,
      filter: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: true,
      cellRenderer: ({ value }: any) => {
        const status = value as string;
        const statusClass =
          status === 'Online'
            ? 'text-success'
            : status === 'Offline'
            ? 'text-danger'
            : 'text-warning';
        return <span className={statusClass}>{status}</span>;
      },
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Network Topology</h1>
        <Button onClick={reload} variant="secondary" size="sm" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded">
          {error}
        </div>
      )}

      <DataTable
        data={data}
        columns={columns as any}
        loading={isLoading}
        emptyMessage="No network topology data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default NetworkTopologyView;

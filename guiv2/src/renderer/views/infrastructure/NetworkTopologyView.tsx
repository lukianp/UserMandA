import React from 'react';
import DataTable from '../../components/organisms/DataTable';
import { useNetworkTopologyLogic } from '../../hooks/infrastructure/useNetworkTopologyLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { NetworkTopologyData } from '../../hooks/infrastructure/useNetworkTopologyLogic';

const NetworkTopologyView: React.FC = () => {
  const { data, isLoading, error, reload } = useNetworkTopologyLogic();

  const columns: ColumnDef<NetworkTopologyData>[] = [
    {
      accessorKey: 'deviceName',
      header: 'Device Name',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'deviceType',
      header: 'Device Type',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const status = getValue() as string;
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
        columns={columns}
        loading={isLoading}
        emptyMessage="No network topology data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default NetworkTopologyView;

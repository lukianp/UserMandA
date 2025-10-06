import React from 'react';
import { DataTable } from '../../components/organisms/DataTable';
import { useNetworkDevicesLogic } from '../../hooks/infrastructure/useNetworkDevicesLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { NetworkDevicesData } from '../../hooks/infrastructure/useNetworkDevicesLogic';

const NetworkDevicesView: React.FC = () => {
  const { data, isLoading, error, reload } = useNetworkDevicesLogic();

  const columns: ColumnDef<NetworkDevicesData>[] = [
    {
      accessorKey: 'deviceName',
      header: 'Device Name',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'model',
      header: 'Model',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'ports',
      header: 'Ports',
      enableSorting: true,
    },
    {
      accessorKey: 'management',
      header: 'Management',
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
        <h1 className="text-2xl font-bold">Network Devices</h1>
        <Button onClick={reload} variant="outline" size="sm" disabled={isLoading}>
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
        isLoading={isLoading}
        emptyMessage="No network devices data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default NetworkDevicesView;

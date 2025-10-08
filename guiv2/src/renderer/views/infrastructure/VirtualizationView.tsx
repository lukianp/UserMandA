import React from 'react';
import DataTable from '../../components/organisms/DataTable';
import { useVirtualizationLogic } from '../../hooks/infrastructure/useVirtualizationLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { VirtualizationData } from '../../hooks/infrastructure/useVirtualizationLogic';

const VirtualizationView: React.FC = () => {
  const { data, isLoading, error, reload } = useVirtualizationLogic();

  const columns: ColumnDef<VirtualizationData>[] = [
    {
      accessorKey: 'vmName',
      header: 'VM Name',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'host',
      header: 'Host',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'vCPU',
      header: 'vCPU',
      enableSorting: true,
    },
    {
      accessorKey: 'memory',
      header: 'Memory',
      enableSorting: true,
    },
    {
      accessorKey: 'storage',
      header: 'Storage',
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const status = getValue() as string;
        const statusClass =
          status === 'Running'
            ? 'text-success'
            : status === 'Stopped'
            ? 'text-danger'
            : 'text-warning';
        return <span className={statusClass}>{status}</span>;
      },
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Virtualization Infrastructure</h1>
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
        emptyMessage="No virtualization data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default VirtualizationView;

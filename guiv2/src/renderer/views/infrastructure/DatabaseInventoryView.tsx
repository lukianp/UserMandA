import React from 'react';
import { DataTable } from '../../components/organisms/DataTable';
import { useDatabaseInventoryLogic } from '../../hooks/infrastructure/useDatabaseInventoryLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { DatabaseInventoryData } from '../../hooks/infrastructure/useDatabaseInventoryLogic';

const DatabaseInventoryView: React.FC = () => {
  const { data, isLoading, error, reload } = useDatabaseInventoryLogic();

  const columns: ColumnDef<DatabaseInventoryData>[] = [
    {
      accessorKey: 'databaseName',
      header: 'Database Name',
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
      accessorKey: 'server',
      header: 'Server',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'size',
      header: 'Size',
      enableSorting: true,
    },
    {
      accessorKey: 'version',
      header: 'Version',
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
        <h1 className="text-2xl font-bold">Database Inventory</h1>
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
        emptyMessage="No database inventory data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default DatabaseInventoryView;

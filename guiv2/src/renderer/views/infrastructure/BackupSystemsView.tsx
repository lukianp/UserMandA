import React from 'react';
import { DataTable } from '../../components/organisms/DataTable';
import { useBackupSystemsLogic } from '../../hooks/infrastructure/useBackupSystemsLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { BackupSystemsData } from '../../hooks/infrastructure/useBackupSystemsLogic';

const BackupSystemsView: React.FC = () => {
  const { data, isLoading, error, reload } = useBackupSystemsLogic();

  const columns: ColumnDef<BackupSystemsData>[] = [
    {
      accessorKey: 'systemName',
      header: 'System Name',
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
      accessorKey: 'lastBackup',
      header: 'Last Backup',
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
          status === 'Success'
            ? 'text-success'
            : status === 'Failed'
            ? 'text-danger'
            : 'text-warning';
        return <span className={statusClass}>{status}</span>;
      },
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      enableSorting: true,
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Backup Systems</h1>
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
        emptyMessage="No backup systems data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default BackupSystemsView;

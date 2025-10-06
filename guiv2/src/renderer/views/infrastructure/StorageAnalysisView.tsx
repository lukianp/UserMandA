import React from 'react';
import DataTable from '../../components/organisms/DataTable';
import { useStorageAnalysisLogic } from '../../hooks/infrastructure/useStorageAnalysisLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { StorageAnalysisData } from '../../hooks/infrastructure/useStorageAnalysisLogic';

const StorageAnalysisView: React.FC = () => {
  const { data, isLoading, error, reload } = useStorageAnalysisLogic();

  const columns: ColumnDef<StorageAnalysisData>[] = [
    {
      accessorKey: 'storageSystem',
      header: 'Storage System',
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
      accessorKey: 'capacity',
      header: 'Capacity',
      enableSorting: true,
    },
    {
      accessorKey: 'used',
      header: 'Used',
      enableSorting: true,
    },
    {
      accessorKey: 'available',
      header: 'Available',
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
          status === 'Healthy'
            ? 'text-success'
            : status === 'Critical'
            ? 'text-danger'
            : 'text-warning';
        return <span className={statusClass}>{status}</span>;
      },
    },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Storage Analysis</h1>
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
        emptyMessage="No storage analysis data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default StorageAnalysisView;

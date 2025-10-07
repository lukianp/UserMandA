import React from 'react';
import DataTable, { DataTableColumn } from '../../components/organisms/DataTable';
import { useDatabaseInventoryLogic } from '../../hooks/infrastructure/useDatabaseInventoryLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { DatabaseInventoryData } from '../../hooks/infrastructure/useDatabaseInventoryLogic';

const DatabaseInventoryView: React.FC = () => {
  const { data, isLoading, error, reload } = useDatabaseInventoryLogic();

  const columns: DataTableColumn<DatabaseInventoryData>[] = [
    {
      id: 'databaseName',
      header: 'Database Name',
      accessor: 'databaseName',
      sortable: true,
      filterable: true,
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'type',
      sortable: true,
      filterable: true,
    },
    {
      id: 'server',
      header: 'Server',
      accessor: 'server',
      sortable: true,
      filterable: true,
    },
    {
      id: 'size',
      header: 'Size',
      accessor: 'size',
      sortable: true,
    },
    {
      id: 'version',
      header: 'Version',
      accessor: 'version',
      sortable: true,
      filterable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      filterable: true,
      cell: (value: string) => {
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
        <h1 className="text-2xl font-bold">Database Inventory</h1>
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
        emptyMessage="No database inventory data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default DatabaseInventoryView;

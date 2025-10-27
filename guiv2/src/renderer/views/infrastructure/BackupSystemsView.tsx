import React from 'react';
import { RefreshCw } from 'lucide-react';

import DataTable, { DataTableColumn } from '../../components/organisms/DataTable';
import { useBackupSystemsLogic } from '../../hooks/infrastructure/useBackupSystemsLogic';
import { Button } from '../../components/atoms/Button';
import type { BackupSystemsData } from '../../hooks/infrastructure/useBackupSystemsLogic';

const BackupSystemsView: React.FC = () => {
  const { data, isLoading, error, reload } = useBackupSystemsLogic();

  const columns: DataTableColumn<BackupSystemsData>[] = [
    {
      id: 'systemName',
      accessor: 'systemName',
      header: 'System Name',
      sortable: true,
      filterable: true,
    },
    {
      id: 'type',
      accessor: 'type',
      header: 'Type',
      sortable: true,
      filterable: true,
    },
    {
      id: 'lastBackup',
      accessor: 'lastBackup',
      header: 'Last Backup',
      sortable: true,
    },
    {
      id: 'status',
      accessor: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      cell: (value: any, row: BackupSystemsData) => {
        const status = value as string;
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
      id: 'capacity',
      accessor: 'capacity',
      header: 'Capacity',
      sortable: true,
    },
  ];

  return (
    <div className="p-6 space-y-4" data-testid="backup-systems-view" data-cy="backup-systems-view">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Backup Systems</h1>
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
        emptyMessage="No backup systems data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default BackupSystemsView;

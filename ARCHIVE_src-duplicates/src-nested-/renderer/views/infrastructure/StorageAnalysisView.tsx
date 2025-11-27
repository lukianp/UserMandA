import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { ColDef } from 'ag-grid-community';

import DataTable from '../../components/organisms/DataTable';
import { useStorageAnalysisLogic } from '../../hooks/infrastructure/useStorageAnalysisLogic';
import { Button } from '../../components/atoms/Button';
import type { StorageAnalysisData } from '../../hooks/infrastructure/useStorageAnalysisLogic';

const StorageAnalysisView: React.FC = () => {
  const { data, isLoading, error, reload } = useStorageAnalysisLogic();

  const columns: ColDef<StorageAnalysisData>[] = [
    {
      field: 'storageSystem',
      headerName: 'Storage System',
      sortable: true,
      filter: true,
    },
    {
      field: 'type',
      headerName: 'Type',
      sortable: true,
      filter: true,
    },
    {
      field: 'capacity',
      headerName: 'Capacity',
      sortable: true,
    },
    {
      field: 'used',
      headerName: 'Used',
      sortable: true,
    },
    {
      field: 'available',
      headerName: 'Available',
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: true,
      cellRenderer: ({ value }: any) => {
        const status = value as string;
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
    <div className="p-6 space-y-4" data-testid="storage-analysis-view" data-cy="storage-analysis-view">
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
        columns={columns as any}
        loading={isLoading}
        emptyMessage="No storage analysis data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default StorageAnalysisView;

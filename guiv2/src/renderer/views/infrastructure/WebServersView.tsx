import React from 'react';
import DataTable from '../../components/organisms/DataTable';
import { useWebServersLogic } from '../../hooks/infrastructure/useWebServersLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColDef } from 'ag-grid-community';
import type { WebServersData } from '../../hooks/infrastructure/useWebServersLogic';

const WebServersView: React.FC = () => {
  const { data, isLoading, error, reload } = useWebServersLogic();

  const columns: ColDef<WebServersData>[] = [
    {
      field: 'serverName',
      headerName: 'Server Name',
      sortable: true,
      filter: true,
    },
    {
      field: 'webServer',
      headerName: 'Web Server',
      sortable: true,
      filter: true,
    },
    {
      field: 'sites',
      headerName: 'Sites',
      sortable: true,
    },
    {
      field: 'port',
      headerName: 'Port',
      sortable: true,
    },
    {
      field: 'ssl',
      headerName: 'SSL',
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
        <h1 className="text-2xl font-bold">Web Servers</h1>
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
        emptyMessage="No web servers data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default WebServersView;

import React from 'react';
import DataTable from '../../components/organisms/DataTable';
import { useApplicationServersLogic } from '../../hooks/infrastructure/useApplicationServersLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { ApplicationServersData } from '../../hooks/infrastructure/useApplicationServersLogic';

const ApplicationServersView: React.FC = () => {
  const { data, isLoading, error, reload } = useApplicationServersLogic();

  const columns: ColumnDef<ApplicationServersData>[] = [
    {
      accessorKey: 'serverName',
      header: 'Server Name',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'application',
      header: 'Application',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'version',
      header: 'Version',
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: 'port',
      header: 'Port',
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
        <h1 className="text-2xl font-bold">Application Servers</h1>
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
        emptyMessage="No application servers data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default ApplicationServersView;

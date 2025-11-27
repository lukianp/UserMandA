import React from 'react';
import { RefreshCw } from 'lucide-react';

import DataTable, { DataTableColumn } from '../../components/organisms/DataTable';
import { useApplicationServersLogic } from '../../hooks/infrastructure/useApplicationServersLogic';
import { Button } from '../../components/atoms/Button';
import type { ApplicationServersData } from '../../hooks/infrastructure/useApplicationServersLogic';

const ApplicationServersView: React.FC = () => {
  const { data, isLoading, error, reload } = useApplicationServersLogic();

  const columns: DataTableColumn<ApplicationServersData>[] = [
    {
      id: 'serverName',
      accessor: 'serverName',
      header: 'Server Name',
      sortable: true,
      filterable: true,
    },
    {
      id: 'application',
      accessor: 'application',
      header: 'Application',
      sortable: true,
      filterable: true,
    },
    {
      id: 'version',
      accessor: 'version',
      header: 'Version',
      sortable: true,
      filterable: true,
    },
    {
      id: 'port',
      accessor: 'port',
      header: 'Port',
      sortable: true,
    },
    {
      id: 'status',
      accessor: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      cell: (value: any, row: ApplicationServersData) => {
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
    <div className="p-6 space-y-4" data-testid="application-servers-view" data-cy="application-servers-view">
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

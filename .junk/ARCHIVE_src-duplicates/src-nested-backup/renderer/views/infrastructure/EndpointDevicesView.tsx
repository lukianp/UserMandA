import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { ColDef } from 'ag-grid-community';

import DataTable from '../../components/organisms/DataTable';
import { useEndpointDevicesLogic } from '../../hooks/infrastructure/useEndpointDevicesLogic';
import { Button } from '../../components/atoms/Button';
import type { EndpointDevicesData } from '../../hooks/infrastructure/useEndpointDevicesLogic';

const EndpointDevicesView: React.FC = () => {
  const { data, isLoading, error, reload } = useEndpointDevicesLogic();

  const columns: ColDef<EndpointDevicesData>[] = [
    {
      field: 'deviceName',
      headerName: 'Device Name',
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
      field: 'user',
      headerName: 'User',
      sortable: true,
      filter: true,
    },
    {
      field: 'os',
      headerName: 'OS',
      sortable: true,
      filter: true,
    },
    {
      field: 'lastSeen',
      headerName: 'Last Seen',
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
          status === 'Active'
            ? 'text-success'
            : status === 'Inactive'
            ? 'text-danger'
            : 'text-warning';
        return <span className={statusClass}>{status}</span>;
      },
    },
  ];

  return (
    <div className="p-6 space-y-4" data-testid="endpoint-devices-view" data-cy="endpoint-devices-view">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Endpoint Devices</h1>
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
        emptyMessage="No endpoint devices data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default EndpointDevicesView;

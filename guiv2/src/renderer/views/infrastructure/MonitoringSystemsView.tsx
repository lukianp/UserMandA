import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { ColDef } from 'ag-grid-community';

import DataTable from '../../components/organisms/DataTable';
import { useMonitoringSystemsLogic } from '../../hooks/infrastructure/useMonitoringSystemsLogic';
import { Button } from '../../components/atoms/Button';
import type { MonitoringSystemsData } from '../../hooks/infrastructure/useMonitoringSystemsLogic';

const MonitoringSystemsView: React.FC = () => {
  const { data, isLoading, error, reload } = useMonitoringSystemsLogic();

  const columns: ColDef<MonitoringSystemsData>[] = [
    {
      field: 'systemName',
      headerName: 'System Name',
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
      field: 'monitoredItems',
      headerName: 'Monitored Items',
      sortable: true,
    },
    {
      field: 'alerts',
      headerName: 'Alerts',
      sortable: true,
      cellRenderer: ({ value }: any) => {
        const alerts = value as number;
        const alertClass = alerts > 0 ? 'text-warning font-semibold' : 'text-success';
        return <span className={alertClass}>{alerts}</span>;
      },
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
    <div className="p-6 space-y-4" data-testid="monitoring-systems-view" data-cy="monitoring-systems-view">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Monitoring Systems</h1>
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
        emptyMessage="No monitoring systems data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default MonitoringSystemsView;

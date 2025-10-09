import React from 'react';
import DataTable from '../../components/organisms/DataTable';
import { useSecurityAppliancesLogic } from '../../hooks/infrastructure/useSecurityAppliancesLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColDef } from 'ag-grid-community';
import type { SecurityAppliancesData } from '../../hooks/infrastructure/useSecurityAppliancesLogic';

const SecurityAppliancesView: React.FC = () => {
  const { data, isLoading, error, reload } = useSecurityAppliancesLogic();

  const columns: ColDef<SecurityAppliancesData>[] = [
    {
      field: 'applianceName',
      headerName: 'Appliance Name',
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
      field: 'model',
      headerName: 'Model',
      sortable: true,
      filter: true,
    },
    {
      field: 'version',
      headerName: 'Version',
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
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Security Appliances</h1>
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
        emptyMessage="No security appliances data available. Run infrastructure discovery to populate this view."
      />
    </div>
  );
};

export default SecurityAppliancesView;

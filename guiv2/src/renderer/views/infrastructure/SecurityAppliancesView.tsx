import React from 'react';
import DataTable from '../../components/organisms/DataTable';
import { useSecurityAppliancesLogic } from '../../hooks/infrastructure/useSecurityAppliancesLogic';
import { Button } from '../../components/atoms/Button';
import { RefreshCw } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { SecurityAppliancesData } from '../../hooks/infrastructure/useSecurityAppliancesLogic';

const SecurityAppliancesView: React.FC = () => {
  const { data, isLoading, error, reload } = useSecurityAppliancesLogic();

  const columns: ColumnDef<SecurityAppliancesData>[] = [
    {
      accessorKey: 'applianceName',
      header: 'Appliance Name',
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
      accessorKey: 'model',
      header: 'Model',
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
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const status = getValue() as string;
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

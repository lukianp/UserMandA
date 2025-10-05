/**
 * Computers View
 *
 * Main view for managing computers and workstations.
 * Features: search, filter, export, view details.
 *
 * Epic 1 Task 1.3: Computers View Integration
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Monitor, Eye } from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { ColDef } from 'ag-grid-community';

/**
 * ComputersView Component
 */
export const ComputersView: React.FC = () => {
  const navigate = useNavigate();

  // TODO: Replace with actual useComputersViewLogic hook when implemented
  const computers: any[] = [];
  const isLoading = false;

  const handleViewDetails = (computer: any) => {
    navigate(`/computers/${computer.id}`);
  };

  const columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Computer Name', width: 200, sortable: true, filter: true },
    { field: 'os', headerName: 'Operating System', width: 180, sortable: true, filter: true },
    { field: 'domain', headerName: 'Domain', width: 120, sortable: true },
    { field: 'ipAddress', headerName: 'IP Address', width: 130 },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      sortable: true,
      cellRenderer: (params: any) => {
        const status = params.value;
        const colorClass =
          status === 'Online'
            ? 'text-green-600 dark:text-green-400'
            : status === 'Offline'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-600 dark:text-gray-400';
        return <span className={`font-semibold ${colorClass}`}>{status}</span>;
      },
    },
    {
      field: 'lastSeen',
      headerName: 'Last Seen',
      width: 150,
      sortable: true,
      valueFormatter: (params) => {
        if (!params.value) return 'N/A';
        const date = new Date(params.value);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
      },
    },
    {
      headerName: 'Actions',
      width: 150,
      cellRenderer: (params: any) => (
        <Button onClick={() => handleViewDetails(params.data)} variant="secondary" size="sm" data-cy="view-computer-details">
          <Eye className="mr-1 h-3 w-3" />
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" data-cy="computers-view">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Monitor className="h-6 w-6" />
              Computers
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage computers and workstations</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="info" size="lg">
              {computers.length} computers
            </Badge>

            <Button variant="secondary" size="md" icon={<RefreshCw className="h-4 w-4" />} disabled={isLoading}>
              Refresh
            </Button>

            <Button variant="secondary" size="md" icon={<Download className="h-4 w-4" />} disabled={isLoading}>
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 px-6 py-4 overflow-hidden">
        <div className="h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <VirtualizedDataGrid
            data={computers}
            columns={columnDefs}
            loading={isLoading}
            enableExport={true}
            enableGrouping={true}
            enableFiltering={true}
            data-cy="computers-grid"
          />
        </div>
      </div>
    </div>
  );
};

export default ComputersView;

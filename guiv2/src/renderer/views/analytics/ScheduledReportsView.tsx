/**
 * Scheduled Reports View
 * Manage automated report generation and delivery
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Mail, Play, Pause, Trash2, Plus, Edit2 } from 'lucide-react';
import Button from '../../components/atoms/Button';
import VirtualizedDataGrid from '../../components/organisms/VirtualizedDataGrid';
import { ColDef } from 'ag-grid-community';

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  schedule: string; // Cron expression
  nextRun: Date;
  lastRun?: Date;
  status: 'active' | 'paused' | 'error';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  reportConfig: any;
}

const ScheduledReportsView: React.FC = () => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Weekly User Report',
      description: 'Active users report sent every Monday',
      schedule: '0 9 * * 1', // Every Monday at 9 AM
      nextRun: new Date(Date.now() + 86400000),
      lastRun: new Date(Date.now() - 604800000),
      status: 'active',
      recipients: ['admin@company.com'],
      format: 'pdf',
      reportConfig: {},
    },
  ]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      { field: 'name', headerName: 'Report Name', sortable: true, filter: true, flex: 2 },
      { field: 'schedule', headerName: 'Schedule', sortable: true, flex: 1 },
      {
        field: 'nextRun',
        headerName: 'Next Run',
        sortable: true,
        valueFormatter: params => new Date(params.value).toLocaleString(),
        flex: 1,
      },
      {
        field: 'status',
        headerName: 'Status',
        sortable: true,
        cellRenderer: (params: any) => {
          const colors = { active: 'bg-green-100 text-green-800', paused: 'bg-yellow-100 text-yellow-800', error: 'bg-red-100 text-red-800' };
          return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colors[params.value]}">${params.value}</span>`;
        },
      },
      {
        field: 'recipients',
        headerName: 'Recipients',
        valueFormatter: params => params.value.join(', '),
        flex: 2,
      },
    ],
    []
  );

  const handlePause = (id: string) => {
    setScheduledReports(reports => reports.map(r => (r.id === id ? { ...r, status: 'paused' as const } : r)));
  };

  const handleResume = (id: string) => {
    setScheduledReports(reports => reports.map(r => (r.id === id ? { ...r, status: 'active' as const } : r)));
  };

  const handleDelete = (id: string) => {
    setScheduledReports(reports => reports.filter(r => r.id !== id));
  };

  const handleRunNow = async (id: string) => {
    console.log('Running report immediately:', id);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Reports</h1>
            <p className="mt-1 text-sm text-gray-500">Automate report generation and delivery</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />}>New Schedule</Button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <VirtualizedDataGrid data={scheduledReports} columns={columnDefs} enableExport data-cy="scheduled-reports-grid" />
      </div>
    </div>
  );
};

export default ScheduledReportsView;

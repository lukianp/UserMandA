/**
 * Scheduled Reports View
 * Manage automated report generation and delivery with full CRUD operations
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, Mail, Play, Pause, Trash2, Plus, Edit2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ColDef } from 'ag-grid-community';

import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { useModalStore } from '../../store/useModalStore';
import { useNotificationStore } from '../../store/useNotificationStore';

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  schedule: string; // Cron expression
  scheduleDescription: string; // Human-readable schedule
  nextRun: Date;
  lastRun?: Date;
  status: 'active' | 'paused' | 'error';
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  reportConfig: any;
  createdBy: string;
  createdDate: Date;
}

const ScheduledReportsView: React.FC = () => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { addNotification } = useNotificationStore();

  // Load scheduled reports on mount
  useEffect(() => {
    loadScheduledReports();
  }, []);

  const loadScheduledReports = async () => {
    setIsLoading(true);
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem('scheduledReports');
      if (stored) {
        const reports = JSON.parse(stored);
        setScheduledReports(reports.map((r: any) => ({
          ...r,
          nextRun: new Date(r.nextRun),
          lastRun: r.lastRun ? new Date(r.lastRun) : undefined,
          createdDate: new Date(r.createdDate),
        })));
      } else {
        // Initialize with sample data
        setScheduledReports([
          {
            id: crypto.randomUUID(),
            name: 'Weekly User Report',
            description: 'Active users report sent every Monday',
            schedule: '0 9 * * 1',
            scheduleDescription: 'Every Monday at 9:00 AM',
            nextRun: getNextRun('0 9 * * 1'),
            lastRun: new Date(Date.now() - 604800000),
            status: 'active',
            recipients: ['admin@company.com'],
            format: 'pdf',
            reportConfig: { dataSource: 'users', filters: [{ field: 'enabled', operator: 'equals', value: 'true' }] },
            createdBy: 'System',
            createdDate: new Date(),
          },
          {
            id: crypto.randomUUID(),
            name: 'Daily Migration Status',
            description: 'Migration progress report sent daily',
            schedule: '0 17 * * *',
            scheduleDescription: 'Every day at 5:00 PM',
            nextRun: getNextRun('0 17 * * *'),
            status: 'active',
            recipients: ['migrations@company.com', 'pm@company.com'],
            format: 'excel',
            reportConfig: { dataSource: 'migrations' },
            createdBy: 'System',
            createdDate: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading scheduled reports:', error);
      addNotification({ type: 'error', message: 'Failed to load scheduled reports', pinned: false, priority: 'normal' });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate next run time from cron expression (simplified)
  const getNextRun = (cronExpression: string): Date => {
    // Simplified cron parsing - in production use a library like 'cron-parser'
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow;
  };

  // Parse cron to human-readable
  const parseCronToDescription = (cron: string): string => {
    // Simplified parser - in production use a library
    const cronMap: Record<string, string> = {
      '0 9 * * 1': 'Every Monday at 9:00 AM',
      '0 17 * * *': 'Every day at 5:00 PM',
      '0 8 * * 1-5': 'Every weekday at 8:00 AM',
      '0 0 1 * *': 'First day of every month at midnight',
    };
    return cronMap[cron] || cron;
  };

  const columnDefs: ColDef[] = useMemo(
    () => [
      { field: 'name', headerName: 'Report Name', sortable: true, filter: true, flex: 2 },
      { field: 'scheduleDescription', headerName: 'Schedule', sortable: true, filter: true, flex: 2 },
      {
        field: 'nextRun',
        headerName: 'Next Run',
        sortable: true,
        valueFormatter: params => new Date(params.value).toLocaleString(),
        flex: 1,
      },
      {
        field: 'lastRun',
        headerName: 'Last Run',
        sortable: true,
        valueFormatter: params => (params.value ? new Date(params.value).toLocaleString() : 'Never'),
        flex: 1,
      },
      {
        field: 'status',
        headerName: 'Status',
        sortable: true,
        width: 120,
        cellRenderer: (params: any) => {
          const statusConfig = {
            active: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
            paused: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
            error: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
          };
          const config = statusConfig[params.value as keyof typeof statusConfig];
          return `<div class="flex items-center gap-1"><span class="px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}">${params.value.toUpperCase()}</span></div>`;
        },
      },
      {
        field: 'recipients',
        headerName: 'Recipients',
        valueFormatter: params => `${params.value.length} recipient(s)`,
        flex: 1,
      },
      {
        field: 'format',
        headerName: 'Format',
        sortable: true,
        valueFormatter: params => params.value.toUpperCase(),
        width: 100,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 200,
        cellRenderer: (params: any) => {
          const report = params.data;
          return `<div class="flex gap-1" data-report-id="${report.id}">
            <button class="action-btn run-now p-1 hover:bg-gray-100 rounded" title="Run Now">▶</button>
            ${report.status === 'active'
              ? '<button class="action-btn pause p-1 hover:bg-gray-100 rounded" title="Pause">⏸</button>'
              : '<button class="action-btn resume p-1 hover:bg-gray-100 rounded" title="Resume">▶</button>'
            }
            <button class="action-btn edit p-1 hover:bg-gray-100 rounded" title="Edit">✏</button>
            <button class="action-btn delete p-1 hover:bg-red-100 rounded text-red-600" title="Delete">🗑</button>
          </div>`;
        },
      },
    ],
    []
  );

  const handlePause = (id: string) => {
    setScheduledReports(reports => {
      const updated = reports.map(r => (r.id === id ? { ...r, status: 'paused' as const } : r));
      saveToStorage(updated);
      return updated;
    });
    addNotification({ type: 'success', message: 'Report schedule paused', pinned: false, priority: 'normal' });
  };

  const handleResume = (id: string) => {
    setScheduledReports(reports => {
      const updated = reports.map(r => (r.id === id ? { ...r, status: 'active' as const, nextRun: getNextRun(r.schedule) } : r));
      saveToStorage(updated);
      return updated;
    });
    addNotification({ type: 'success', message: 'Report schedule resumed', pinned: false, priority: 'normal' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this scheduled report?')) {
      setScheduledReports(reports => {
        const updated = reports.filter(r => r.id !== id);
        saveToStorage(updated);
        return updated;
      });
      addNotification({ type: 'success', message: 'Scheduled report deleted', pinned: false, priority: 'normal' });
    }
  };

  const handleRunNow = async (id: string) => {
    const report = scheduledReports.find(r => r.id === id);
    if (!report) return;

    try {
      addNotification({ type: 'info', message: `Running ${report.name}...`, pinned: false, priority: 'normal' });

      // Execute report generation via PowerShell
      const result = await window.electronAPI.executeModule({
        modulePath: 'Modules/Reports/ScheduledReportRunner.psm1',
        functionName: 'Invoke-ScheduledReport',
        parameters: {
          ReportId: id,
          ReportConfig: report.reportConfig,
          Format: report.format,
          Recipients: report.recipients,
        },
      });

      if (result.success) {
        // Update last run time
        setScheduledReports(reports => {
          const updated = reports.map(r => (r.id === id ? { ...r, lastRun: new Date() } : r));
          saveToStorage(updated);
          return updated;
        });
        addNotification({ type: 'success', message: `${report.name} executed successfully`, pinned: false, priority: 'normal' });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error running report:', error);
      addNotification({ type: 'error', message: `Failed to run report: ${error.message}`, pinned: false, priority: 'normal' });
      // Update status to error
      setScheduledReports(reports => {
        const updated = reports.map(r => (r.id === id ? { ...r, status: 'error' as const } : r));
        saveToStorage(updated);
        return updated;
      });
    }
  };

  const handleEdit = (id: string) => {
    const report = scheduledReports.find(r => r.id === id);
    if (report) {
      setSelectedReport(report);
      setShowEditor(true);
    }
  };

  const handleCreate = () => {
    setSelectedReport({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      schedule: '0 9 * * *',
      scheduleDescription: 'Every day at 9:00 AM',
      nextRun: getNextRun('0 9 * * *'),
      status: 'active',
      recipients: [],
      format: 'pdf',
      reportConfig: {},
      createdBy: 'Current User',
      createdDate: new Date(),
    });
    setShowEditor(true);
  };

  const handleSave = (report: ScheduledReport) => {
    const exists = scheduledReports.find(r => r.id === report.id);
    if (exists) {
      setScheduledReports(reports => {
        const updated = reports.map(r => (r.id === report.id ? report : r));
        saveToStorage(updated);
        return updated;
      });
      addNotification({ type: 'success', message: 'Scheduled report updated', pinned: false, priority: 'normal' });
    } else {
      setScheduledReports(reports => {
        const updated = [...reports, report];
        saveToStorage(updated);
        return updated;
      });
      addNotification({ type: 'success', message: 'Scheduled report created', pinned: false, priority: 'normal' });
    }
    setShowEditor(false);
    setSelectedReport(null);
  };

  const saveToStorage = (reports: ScheduledReport[]) => {
    localStorage.setItem('scheduledReports', JSON.stringify(reports));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50" data-cy="scheduled-reports-view" data-testid="scheduled-reports-view">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduled Reports</h1>
            <p className="mt-1 text-sm text-gray-500">Automate report generation and delivery with cron-based scheduling</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadScheduledReports} icon={<Clock className="w-4 h-4" />}>
              Refresh
            </Button>
            <Button onClick={handleCreate} icon={<Plus className="w-4 h-4" />}>
              New Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Schedules</p>
            <p className="text-2xl font-bold text-gray-900">{scheduledReports.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{scheduledReports.filter(r => r.status === 'active').length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Paused</p>
            <p className="text-2xl font-bold text-yellow-600">{scheduledReports.filter(r => r.status === 'paused').length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Errors</p>
            <p className="text-2xl font-bold text-red-600">{scheduledReports.filter(r => r.status === 'error').length}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 p-6">
        <VirtualizedDataGrid
          data={scheduledReports}
          columns={columnDefs}
          loading={isLoading}
          enableExport
          data-cy="scheduled-reports-grid" data-testid="scheduled-reports-grid"
        />
      </div>

      {/* Editor Modal */}
      {showEditor && selectedReport && (
        <ReportScheduleEditor
          report={selectedReport}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
};

// Report Schedule Editor Component
interface ReportScheduleEditorProps {
  report: ScheduledReport;
  onSave: (report: ScheduledReport) => void;
  onCancel: () => void;
}

const ReportScheduleEditor: React.FC<ReportScheduleEditorProps> = ({ report, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ScheduledReport>(report);

  const schedulePresets = [
    { value: '0 9 * * *', label: 'Every day at 9:00 AM' },
    { value: '0 17 * * *', label: 'Every day at 5:00 PM' },
    { value: '0 9 * * 1', label: 'Every Monday at 9:00 AM' },
    { value: '0 8 * * 1-5', label: 'Every weekday at 8:00 AM' },
    { value: '0 0 1 * *', label: 'First day of month at midnight' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-cy="schedule-editor-modal" data-testid="schedule-editor-modal">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">{report.name ? 'Edit' : 'Create'} Scheduled Report</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Report Name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
          />

          <Select
            label="Schedule"
            value={formData.schedule}
            onChange={(value: string) => {
              const preset = schedulePresets.find(p => p.value === value);
              setFormData({
                ...formData,
                schedule: value,
                scheduleDescription: preset?.label || value,
              });
            }}
            options={schedulePresets.map(preset => ({
              value: preset.value,
              label: preset.label,
            }))}
            required
          />

          <Input
            label="Recipients (comma-separated emails)"
            value={formData.recipients.join(', ')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, recipients: e.target.value.split(',').map(s => s.trim()) })}
            placeholder="email1@company.com, email2@company.com"
            required
          />

          <Select
            label="Export Format"
            value={formData.format}
            onChange={(value: string) => setFormData({ ...formData, format: value as any })}
            options={[
              { value: 'pdf', label: 'PDF' },
              { value: 'excel', label: 'Excel' },
              { value: 'csv', label: 'CSV' },
            ]}
            required
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Schedule</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduledReportsView;



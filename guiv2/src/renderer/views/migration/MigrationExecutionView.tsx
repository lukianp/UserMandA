import React from 'react';
import { useMigrationExecutionLogic } from '../../hooks/useMigrationExecutionLogic';
import { Button } from '../../components/atoms/Button';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Play, Pause, Square, RotateCcw, Save, AlertCircle } from 'lucide-react';

const MigrationExecutionView: React.FC = () => {
  const logic = useMigrationExecutionLogic();

  const columnDefs = [
    { field: 'name', headerName: 'Item', flex: 1 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'progress', headerName: 'Progress', width: 100 },
  ];

  return (
    <div className="h-full flex flex-col" data-cy="execution-view">
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900">
        <div>
          <h1 className="text-2xl font-bold">Migration Execution</h1>
          <p className="text-sm text-gray-600 mt-1">{logic.selectedWave && logic.selectedWave.name}</p>
        </div>
        <div className="flex gap-2">
          <Button icon={<Play />} onClick={logic.handleStart} disabled={logic.isExecuting} data-cy="start-btn">Start</Button>
          <Button variant="secondary" icon={<Pause />} onClick={logic.handlePause} disabled={!logic.isExecuting} data-cy="pause-btn">Pause</Button>
          <Button variant="secondary" icon={<Square />} onClick={logic.handleCancel} disabled={!logic.isExecuting} data-cy="cancel-btn">Cancel</Button>
          <Button variant="secondary" icon={<RotateCcw />} onClick={logic.handleRetry} data-cy="retry-btn">Retry</Button>
          <Button variant="secondary" icon={<Save />} onClick={logic.handleCreateRollbackPoint} data-cy="rollback-btn">Rollback Point</Button>
        </div>
      </div>

      {logic.error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{logic.error}</span>
        </div>
      )}

      <div className="p-4 bg-gray-50 border-b">
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-medium">{logic.progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: `${logic.progressPercent}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-3 rounded shadow-sm"><div className="text-2xl font-bold">{logic.(stats?.total ?? 0)}</div><div className="text-xs">Total</div></div>
          <div className="bg-white p-3 rounded shadow-sm"><div className="text-2xl font-bold text-green-600">{logic.(stats?.completed ?? 0)}</div><div className="text-xs">Completed</div></div>
          <div className="bg-white p-3 rounded shadow-sm"><div className="text-2xl font-bold text-red-600">{logic.(stats?.failed ?? 0)}</div><div className="text-xs">Failed</div></div>
          <div className="bg-white p-3 rounded shadow-sm"><div className="text-2xl font-bold text-blue-600">{logic.(stats?.inProgress ?? 0)}</div><div className="text-xs">In Progress</div></div>
          <div className="bg-white p-3 rounded shadow-sm"><div className="text-2xl font-bold text-gray-600">{logic.(stats?.pending ?? 0)}</div><div className="text-xs">Pending</div></div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="flex-1 bg-white rounded shadow-sm border">
          <VirtualizedDataGrid data={logic.executionProgress?.items || []} columns={columnDefs} loading={false} data-cy="items-grid" />
        </div>
        <div className="w-1/3 bg-white rounded shadow-sm border p-4 overflow-y-auto">
          <h3 className="font-semibold mb-3">Live Logs</h3>
          <div className="space-y-1 font-mono text-xs">
            {logic.logs.map((log, i) => (
              <div key={i} className="text-gray-700">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigrationExecutionView;

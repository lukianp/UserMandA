import React from 'react';
import { Code, Play, Edit2, Trash2, Plus, Search, RefreshCw, Settings, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

import DataTableOrganism from '../../components/organisms/DataTable';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Badge } from '../../components/atoms/Badge';

import { useScriptLibraryLogic } from '../../hooks/useScriptLibraryLogic';

export const ScriptLibraryView: React.FC = () => {
  const {
    libraryData,
    isLoading,
    error,
    listScripts,
    queueScriptExecution,
    getExecutionStatus,
    getExecutionQueue,
    createScript,
    updateScript,
    deleteScript,
    refreshLibrary,
  } = useScriptLibraryLogic();

  const [selectedScripts, setSelectedScripts] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  const scripts = listScripts();
  const executionQueue = getExecutionQueue();

  const scriptColumns: any[] = [
    {
      id: 'title',
      header: 'Script Name',
      accessor: 'metadata.title',
      sortable: true,
      cell: (value: any, row: any) => (
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-gray-400" />
          <div>
            <span className="font-medium">{value}</span>
            <p className="text-xs text-gray-500">{row.metadata.description}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'metadata.category',
      sortable: true,
      width: '120px',
      cell: (value: any) => (
        <Badge variant="info" className="text-xs capitalize">
          {value}
        </Badge>
      ),
    },
    {
      id: 'language',
      header: 'Language',
      accessor: 'metadata.language',
      sortable: true,
      width: '100px',
      cell: (value: any) => (
        <Badge variant="primary" className="text-xs">
          {value}
        </Badge>
      ),
    },
    {
      id: 'executionCount',
      header: 'Executions',
      accessor: 'executionCount',
      sortable: true,
      width: '100px',
      cell: (value: any) => (
        <span className="text-sm text-gray-600">{value}</span>
      ),
    },
    {
      id: 'successRate',
      header: 'Success Rate',
      accessor: 'successRate',
      sortable: true,
      width: '110px',
      cell: (value: any) => {
        const rate = (value || 0) * 100;
        return (
          <div className="flex items-center gap-1">
            <span className="text-sm">{Math.round(rate)}%</span>
            <div className="w-8 h-1 bg-gray-200 rounded">
              <div
                className="h-full bg-green-500 rounded"
                style={{ width: `${rate}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'lastExecuted',
      header: 'Last Executed',
      accessor: 'lastExecuted',
      sortable: true,
      width: '140px',
      cell: (value: any) => value ? new Date(value).toLocaleString() : 'Never',
    },
    {
      id: 'modified',
      header: 'Modified',
      accessor: 'metadata.modified',
      sortable: true,
      width: '140px',
      cell: (value: any) => new Date(value).toLocaleString(),
    },
  ];

  const handleRunScript = React.useCallback(async (scriptId: string) => {
    const executionId = await queueScriptExecution(scriptId);
    console.log('Script execution queued:', executionId);
  }, [queueScriptExecution]);

  const handleDeleteScript = React.useCallback(async (scriptId: string) => {
    if (window.confirm('Are you sure you want to delete this script?')) {
      await deleteScript(scriptId);
    }
  }, [deleteScript]);

  const handleBulkRun = React.useCallback(async () => {
    for (const scriptId of selectedScripts) {
      await handleRunScript(scriptId);
    }
  }, [selectedScripts, handleRunScript]);

  const filteredScripts = scripts.filter(script =>
    script.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.metadata.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.metadata.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <XCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-200">Error loading script library</p>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Script Library</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage, version, and execute automation scripts
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={refreshLibrary}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateDialog(true)}
          >
            New Script
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <FileText className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Total Scripts</h3>
          <div className="text-2xl font-bold">{scripts.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {libraryData?.categories.length || 0} categories
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <Play className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Executions Today</h3>
          <div className="text-2xl font-bold">
            {scripts.reduce((sum, script) => sum + script.executionCount, 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {executionQueue.filter(e => e.status === 'running').length} running
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <CheckCircle className="w-8 h-8 text-purple-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Success Rate</h3>
          <div className="text-2xl font-bold">
            {scripts.length > 0
              ? Math.round(scripts.reduce((sum, script) => sum + (script.successRate || 0), 0) / scripts.length * 100)
              : 0}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Average across all scripts
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <Clock className="w-8 h-8 text-orange-500 mb-3" />
          <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1">Queued</h3>
          <div className="text-2xl font-bold">{executionQueue.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {executionQueue.filter(e => e.status === 'completed').length} completed
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search scripts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Play className="w-4 h-4" />}
            onClick={handleBulkRun}
            disabled={selectedScripts.length === 0}
          >
            Run Selected ({selectedScripts.length})
          </Button>
          <Button variant="secondary" icon={<Settings className="w-4 h-4" />}>
            Settings
          </Button>
        </div>
      </div>

      {/* Scripts Table */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
        <DataTableOrganism
          data={filteredScripts}
          columns={scriptColumns}
          loading={isLoading}
          selectable={true}
          onSelectionChange={(selectedRows: any[]) => setSelectedScripts(selectedRows.map(r => r.id))}
          emptyMessage="No scripts found in the library"
        />
      </div>
    </div>
  );
};


export default ScriptLibraryView;

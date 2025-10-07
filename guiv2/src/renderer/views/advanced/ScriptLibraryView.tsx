import React from 'react';
import { Code, Play, Edit2, Trash2, Plus, Search } from 'lucide-react';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Badge } from '../../components/atoms/Badge';

export const ScriptLibraryView: React.FC = () => {
  const [scripts] = React.useState([
    { id: '1', name: 'User Discovery', category: 'Discovery', language: 'PowerShell', lastRun: new Date(), runs: 245 },
    { id: '2', name: 'License Report', category: 'Reports', language: 'PowerShell', lastRun: new Date(), runs: 87 },
    { id: '3', name: 'Migration Validation', category: 'Migration', language: 'PowerShell', lastRun: new Date(), runs: 34 },
  ]);

  const columns = [
    { field: 'name', headerName: 'Script Name', sortable: true, flex: 1 },
    { field: 'category', headerName: 'Category', sortable: true, cellRenderer: (p: any) => <Badge variant="info">{p.value}</Badge> },
    { field: 'language', headerName: 'Language', sortable: true },
    { field: 'runs', headerName: 'Executions', sortable: true },
    { field: 'lastRun', headerName: 'Last Run', sortable: true, valueFormatter: (p: any) => p.value.toLocaleString() },
    { field: 'actions', headerName: 'Actions', sortable: false, cellRenderer: () => (
      <div className="flex gap-2">
        <Button size="sm" variant="primary" icon={<Play />}>Run</Button>
        <Button size="sm" variant="secondary" icon={<Edit2 />} />
      </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Script Library</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage and execute PowerShell scripts</p>
        </div>
        <Button variant="primary" icon={<Plus />}>New Script</Button>
      </div>
      
      <div className="flex gap-4">
        <Input placeholder="Search scripts..." startIcon={<Search />} className="flex-1" />
      </div>

      <div className="flex-1">
        <VirtualizedDataGrid data={scripts} columns={columns} loading={false} />
      </div>
    </div>
  );
};

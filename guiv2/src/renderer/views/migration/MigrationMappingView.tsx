import React, { useRef } from 'react';
import { Upload, Download, Wand2, AlertTriangle, Filter, FileType, AlertCircle } from 'lucide-react';

import { useMigrationMappingLogic } from '../../hooks/useMigrationMappingLogic';
import { Button } from '../../components/atoms/Button';
import { SearchBar } from '../../components/molecules/SearchBar';
import { Select } from '../../components/atoms/Select';
import { VirtualizedDataGrid } from '../../components/organisms/VirtualizedDataGrid';

const MigrationMappingView: React.FC = () => {
  const logic = useMigrationMappingLogic();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="min-h-full flex flex-col" data-cy="migration-mapping-view" data-testid="migration-mapping-view">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Resource Mapping</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {logic.selectedWave ? `Mapping for: ${logic.selectedWave.name}` : 'Select a wave'}
          </p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.json" onChange={logic.handleFileUpload} className="hidden" data-cy="file-input" data-testid="file-input" />
          <Button variant="secondary" icon={<Upload className="w-4 h-4" />} onClick={() => fileInputRef.current?.click()} disabled={!logic.hasWaveSelected} data-cy="import-btn">Import</Button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={logic.handleExport} disabled={!logic.hasMappings} data-cy="export-btn" data-testid="export-btn">Export</Button>
          <Button icon={<Wand2 className="w-4 h-4" />} onClick={logic.handleAutoMap} disabled={!logic.hasWaveSelected || logic.isLoading} loading={logic.isLoading} data-cy="automap-btn" data-testid="automap-btn">Auto-Map</Button>
        </div>
      </div>
      {logic.error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-md flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700">{logic.error}</span>
        </div>
      )}
      {logic.hasWaveSelected && (
        <div className="p-4 bg-gray-50 dark:border-gray-800 border-b">
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'Total', value: logic.statusCounts.total, color: 'gray' },
              { label: 'Pending', value: logic.statusCounts.pending, color: 'gray' },
              { label: 'Mapped', value: logic.statusCounts.mapped, color: 'blue' },
              { label: 'Validated', value: (logic.statusCounts as any).validated || logic.statusCounts.valid, color: 'green' },
              { label: 'Errors', value: (logic.statusCounts as any).error || logic.statusCounts.invalid, color: 'red' },
              { label: 'Conflicts', value: logic.statusCounts.conflicts, color: 'yellow' },
            ].map(stat => (
              <div key={stat.label} className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm border">
                <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {logic.hasWaveSelected && (
        <div className="p-4 bg-white border-b">
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchBar value={logic.searchText} onChange={logic.setSearchText} placeholder="Search mappings..." data-cy="search" data-testid="search" />
            </div>
            <Select value={logic.filterType} onChange={logic.setFilterType} options={[
              { value: 'all', label: 'All Types' },
              { value: 'user', label: 'Users' },
              { value: 'group', label: 'Groups' },
            ]} data-cy="type-filter" data-testid="type-filter" />
            <Select value={logic.filterStatus} onChange={logic.setFilterStatus} options={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'mapped', label: 'Mapped' },
            ]} data-cy="status-filter" data-testid="status-filter" />
          </div>
        </div>
      )}
      <div className="flex-1 p-4 overflow-hidden">
        {!logic.hasWaveSelected ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No Wave Selected</p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            <VirtualizedDataGrid data={logic.mappings} columns={logic.columnDefs} loading={logic.isLoading} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationMappingView;

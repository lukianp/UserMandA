/**
 * InventoryList Component
 *
 * Displays consolidated inventory entities with filtering, selection,
 * and migration wave assignment capabilities.
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  SelectionChangedEvent,
  RowClickedEvent,
  ICellRendererParams
} from 'ag-grid-community';
import 'ag-grid-enterprise';
import { clsx } from 'clsx';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Users,
  Building2,
  Server,
  Package,
  Mail,
  Cloud,
  Database,
  Network,
  Shield,
  ChevronDown,
  X,
  Check,
  AlertTriangle,
  Layers
} from 'lucide-react';

import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';
import { StatusBadgeCellRenderer } from '../atoms/StatusBadgeCellRenderer';
import '../../styles/ag-grid-custom.css';

// Entity type icons mapping
const ENTITY_TYPE_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  USER: Users,
  GROUP: Users,
  APPLICATION: Package,
  INFRASTRUCTURE: Server,
  MAILBOX: Mail,
  SHAREPOINT_SITE: Cloud,
  TEAMS_TEAM: Users,
  DEVICE: Server,
  SERVER: Server,
  DATABASE: Database,
  VIRTUAL_MACHINE: Cloud,
  STORAGE: Database,
  NETWORK_RESOURCE: Network,
};

// Entity type labels
const ENTITY_TYPE_LABELS: Record<string, string> = {
  USER: 'Users',
  GROUP: 'Groups',
  APPLICATION: 'Applications',
  INFRASTRUCTURE: 'Infrastructure',
  MAILBOX: 'Mailboxes',
  SHAREPOINT_SITE: 'SharePoint Sites',
  TEAMS_TEAM: 'Teams',
  DEVICE: 'Devices',
  SERVER: 'Servers',
  DATABASE: 'Databases',
  VIRTUAL_MACHINE: 'Virtual Machines',
  STORAGE: 'Storage',
  NETWORK_RESOURCE: 'Network Resources',
};

// Status colors
const STATUS_COLORS: Record<string, string> = {
  DISCOVERED: 'bg-gray-100 text-gray-700',
  TRIAGED: 'bg-blue-100 text-blue-700',
  VERIFIED: 'bg-indigo-100 text-indigo-700',
  ENRICHED: 'bg-purple-100 text-purple-700',
  MAPPED: 'bg-cyan-100 text-cyan-700',
  MIGRATION_READY: 'bg-green-100 text-green-700',
  MIGRATION_PLANNED: 'bg-amber-100 text-amber-700',
  MIGRATING: 'bg-orange-100 text-orange-700',
  MIGRATED: 'bg-emerald-100 text-emerald-700',
  BLOCKED: 'bg-red-100 text-red-700',
  EXCLUDED: 'bg-gray-100 text-gray-500',
};

interface InventoryEntity {
  id: string;
  entityType: string;
  canonicalName: string;
  displayName: string;
  status: string;
  sourceProfileId: string;
  readinessScore: number;
  riskScore: number;
  waveId?: string;
  waveName?: string;
  discoveryModules: string[];
  createdAt: string;
  updatedAt: string;
  attributes: Record<string, any>;
  externalIds: Record<string, string>;
}

interface InventoryListProps {
  /** Entities to display */
  entities: InventoryEntity[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Selected entity IDs */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (ids: string[]) => void;
  /** Callback when entity is clicked */
  onEntityClick?: (entity: InventoryEntity) => void;
  /** Callback to refresh data */
  onRefresh?: () => void;
  /** Callback to assign selected to wave */
  onAssignToWave?: (entityIds: string[]) => void;
  /** Entity type filter (if viewing single type) */
  entityTypeFilter?: string;
  /** Show entity type column */
  showEntityType?: boolean;
  /** Show wave column */
  showWaveColumn?: boolean;
  /** Custom class name */
  className?: string;
}

// Custom cell renderer for entity type
const EntityTypeCellRenderer: React.FC<ICellRendererParams> = (params) => {
  const entityType = params.value as string;
  const Icon = ENTITY_TYPE_ICONS[entityType] || Package;
  const label = ENTITY_TYPE_LABELS[entityType] || entityType;

  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-gray-500" />
      <span>{label}</span>
    </div>
  );
};

// Custom cell renderer for readiness/risk scores
const ScoreCellRenderer: React.FC<ICellRendererParams & { type: 'readiness' | 'risk' }> = (params) => {
  const score = params.value as number;
  const percentage = Math.round(score * 100);

  let colorClass = 'bg-gray-200';
  if (params.type === 'readiness') {
    if (score >= 0.8) colorClass = 'bg-green-500';
    else if (score >= 0.6) colorClass = 'bg-yellow-500';
    else if (score >= 0.4) colorClass = 'bg-orange-500';
    else colorClass = 'bg-red-500';
  } else {
    // Risk: higher is worse
    if (score >= 0.8) colorClass = 'bg-red-500';
    else if (score >= 0.6) colorClass = 'bg-orange-500';
    else if (score >= 0.4) colorClass = 'bg-yellow-500';
    else colorClass = 'bg-green-500';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">{percentage}%</span>
    </div>
  );
};

// Custom cell renderer for status
const InventoryStatusCellRenderer: React.FC<ICellRendererParams> = (params) => {
  const status = params.value as string;
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
  const displayStatus = status.replace(/_/g, ' ');

  return (
    <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', colorClass)}>
      {displayStatus}
    </span>
  );
};

// Custom cell renderer for discovery modules
const ModulesCellRenderer: React.FC<ICellRendererParams> = (params) => {
  const modules = params.value as string[];
  if (!modules || modules.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {modules.slice(0, 3).map((mod, idx) => (
        <span
          key={idx}
          className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs"
        >
          {mod}
        </span>
      ))}
      {modules.length > 3 && (
        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
          +{modules.length - 3}
        </span>
      )}
    </div>
  );
};

export const InventoryList: React.FC<InventoryListProps> = ({
  entities,
  loading = false,
  error,
  selectedIds = [],
  onSelectionChange,
  onEntityClick,
  onRefresh,
  onAssignToWave,
  entityTypeFilter,
  showEntityType = true,
  showWaveColumn = true,
  className,
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [quickFilter, setQuickFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  // Column definitions
  const columnDefs = useMemo<ColDef[]>(() => {
    const cols: ColDef[] = [
      {
        headerName: 'Name',
        field: 'displayName',
        flex: 2,
        minWidth: 200,
        filter: 'agTextColumnFilter',
        sortable: true,
        checkboxSelection: true,
        headerCheckboxSelection: true,
      },
    ];

    if (showEntityType) {
      cols.push({
        headerName: 'Type',
        field: 'entityType',
        width: 160,
        cellRenderer: EntityTypeCellRenderer,
        filter: 'agSetColumnFilter',
        sortable: true,
      });
    }

    cols.push(
      {
        headerName: 'Status',
        field: 'status',
        width: 150,
        cellRenderer: InventoryStatusCellRenderer,
        filter: 'agSetColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Readiness',
        field: 'readinessScore',
        width: 140,
        cellRenderer: (params: ICellRendererParams) => (
          <ScoreCellRenderer {...params} type="readiness" />
        ),
        filter: 'agNumberColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Risk',
        field: 'riskScore',
        width: 140,
        cellRenderer: (params: ICellRendererParams) => (
          <ScoreCellRenderer {...params} type="risk" />
        ),
        filter: 'agNumberColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Sources',
        field: 'discoveryModules',
        width: 200,
        cellRenderer: ModulesCellRenderer,
        filter: 'agSetColumnFilter',
        sortable: false,
      }
    );

    if (showWaveColumn) {
      cols.push({
        headerName: 'Wave',
        field: 'waveName',
        width: 150,
        filter: 'agSetColumnFilter',
        sortable: true,
        cellRenderer: (params: ICellRendererParams) => {
          if (!params.value) {
            return <span className="text-gray-400 italic">Unassigned</span>;
          }
          return (
            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
              {params.value}
            </span>
          );
        },
      });
    }

    cols.push({
      headerName: 'Updated',
      field: 'updatedAt',
      width: 160,
      valueFormatter: (params) => {
        if (!params.value) return '';
        try {
          return new Date(params.value).toLocaleDateString();
        } catch {
          return params.value;
        }
      },
      filter: 'agDateColumnFilter',
      sortable: true,
    });

    return cols;
  }, [showEntityType, showWaveColumn]);

  // Default column settings
  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  // Handle grid ready
  const onGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
    event.api.sizeColumnsToFit();
  }, []);

  // Handle selection change
  const handleSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    if (onSelectionChange) {
      const selectedRows = event.api.getSelectedRows();
      onSelectionChange(selectedRows.map((row: InventoryEntity) => row.id));
    }
  }, [onSelectionChange]);

  // Handle row click
  const handleRowClicked = useCallback((event: RowClickedEvent) => {
    if (onEntityClick && event.data) {
      onEntityClick(event.data);
    }
  }, [onEntityClick]);

  // Apply quick filter
  useEffect(() => {
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', quickFilter);
    }
  }, [gridApi, quickFilter]);

  // Export to CSV
  const handleExport = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `inventory-export-${new Date().toISOString().split('T')[0]}.csv`,
      });
    }
  }, [gridApi]);

  // Get unique entity types from data
  const entityTypes = useMemo(() => {
    const types = new Set(entities.map(e => e.entityType));
    return Array.from(types).sort();
  }, [entities]);

  // Get unique statuses from data
  const statuses = useMemo(() => {
    const statusSet = new Set(entities.map(e => e.status));
    return Array.from(statusSet).sort();
  }, [entities]);

  // Statistics
  const stats = useMemo(() => {
    const total = entities.length;
    const avgReadiness = entities.length > 0
      ? entities.reduce((sum, e) => sum + e.readinessScore, 0) / entities.length
      : 0;
    const avgRisk = entities.length > 0
      ? entities.reduce((sum, e) => sum + e.riskScore, 0) / entities.length
      : 0;
    const unassigned = entities.filter(e => !e.waveId).length;

    return { total, avgReadiness, avgRisk, unassigned };
  }, [entities]);

  if (error) {
    return (
      <div className={clsx('flex flex-col items-center justify-center p-8', className)}>
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Inventory</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="secondary">
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search entities..."
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {quickFilter && (
              <button
                onClick={() => setQuickFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(showFilters && 'bg-blue-50 border-blue-200')}
          >
            <Filter size={16} />
          </Button>
        </div>

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-4 text-sm text-gray-600">
          <span>{stats.total.toLocaleString()} entities</span>
          <span className="text-gray-300">|</span>
          <span>Avg Readiness: {Math.round(stats.avgReadiness * 100)}%</span>
          <span className="text-gray-300">|</span>
          <span>{stats.unassigned} unassigned</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && onAssignToWave && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onAssignToWave(selectedIds)}
            >
              <Layers size={16} className="mr-1" />
              Assign to Wave ({selectedIds.length})
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={16} />
          </Button>
          {onRefresh && (
            <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 p-4 border-b border-gray-200 bg-gray-50">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <div className="flex flex-wrap gap-1">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => {
                    if (statusFilter.includes(status)) {
                      setStatusFilter(statusFilter.filter(s => s !== status));
                    } else {
                      setStatusFilter([...statusFilter, status]);
                    }
                  }}
                  className={clsx(
                    'px-2 py-1 rounded text-xs font-medium transition-colors',
                    statusFilter.includes(status)
                      ? STATUS_COLORS[status]
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter (if showing all types) */}
          {showEntityType && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Type:</span>
              <div className="flex flex-wrap gap-1">
                {entityTypes.map(type => {
                  const Icon = ENTITY_TYPE_ICONS[type] || Package;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        if (typeFilter.includes(type)) {
                          setTypeFilter(typeFilter.filter(t => t !== type));
                        } else {
                          setTypeFilter([...typeFilter, type]);
                        }
                      }}
                      className={clsx(
                        'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
                        typeFilter.includes(type)
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <Icon size={12} />
                      {ENTITY_TYPE_LABELS[type] || type}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {(statusFilter.length > 0 || typeFilter.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter([]);
                setTypeFilter([]);
              }}
            >
              <X size={14} className="mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1 ag-theme-alpine">
        {loading && entities.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" />
          </div>
        ) : (
          <AgGridReact
            ref={gridRef}
            rowData={entities}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            onSelectionChanged={handleSelectionChanged}
            onRowClicked={handleRowClicked}
            rowSelection="multiple"
            suppressRowClickSelection={false}
            enableCellTextSelection={true}
            animateRows={true}
            pagination={true}
            paginationPageSize={50}
            paginationPageSizeSelector={[25, 50, 100, 500]}
            domLayout="normal"
            getRowId={(params) => params.data.id}
            overlayNoRowsTemplate="<span class='text-gray-500'>No inventory entities found</span>"
          />
        )}
      </div>
    </div>
  );
};

export default InventoryList;

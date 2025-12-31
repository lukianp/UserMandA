/**
 * VirtualizedDataGrid Component
 *
 * Enterprise-grade data grid using AG Grid Enterprise
 * Handles 100,000+ rows with virtual scrolling at 60 FPS
 */

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridApi, GridReadyEvent, SelectionChangedEvent, RowClickedEvent } from 'ag-grid-community';
import 'ag-grid-enterprise';
import { clsx } from 'clsx';
import { Download, Printer, Eye, EyeOff, Filter, RotateCcw } from 'lucide-react';

import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';
import { StatusBadgeCellRenderer } from '../atoms/StatusBadgeCellRenderer';
import '../../styles/ag-grid-custom.css';

// Lazy load AG Grid CSS - only load once when first grid mounts
let agGridStylesLoaded = false;
const loadAgGridStyles = () => {
  if (agGridStylesLoaded) return;

  // Dynamically import AG Grid styles
  import('ag-grid-community/styles/ag-grid.css');
  import('ag-grid-community/styles/ag-theme-alpine.css');

  agGridStylesLoaded = true;
};

/**
 * Enhance column definitions with auto-detected cell renderers and formatters
 * - Status columns → StatusBadgeCellRenderer with colored badges
 * - Date columns → formatted date/time display
 * - Boolean columns → StatusBadgeCellRenderer with Yes/No
 */
const enhanceColumns = (columns: ColDef[]): ColDef[] => {
  return columns.map(col => {
    const field = col.field?.toLowerCase() || '';
    const headerName = col.headerName?.toLowerCase() || '';

    // Auto-detect status/state columns and apply badge renderer
    if (
      field.includes('status') ||
      field.includes('state') ||
      field.includes('enabled') ||
      field.includes('compliant') ||
      field.includes('active') ||
      field.includes('health') ||
      field.includes('condition') ||
      headerName.includes('status') ||
      headerName.includes('state')
    ) {
      return {
        ...col,
        cellRenderer: StatusBadgeCellRenderer,
        cellClass: 'ag-cell-status',
        width: col.width || 150,
      };
    }

    // Format date columns
    if (
      field.includes('date') ||
      field.includes('datetime') ||
      field.includes('created') ||
      field.includes('modified') ||
      field.includes('updated') ||
      field.includes('timestamp') ||
      field.includes('expires') ||
      field.includes('lastrun') ||
      field.includes('nextrun') ||
      headerName.includes('date') ||
      headerName.includes('time')
    ) {
      return {
        ...col,
        valueFormatter: (params) => {
          if (!params.value) return '';
          try {
            const date = new Date(params.value);
            if (isNaN(date.getTime())) return params.value;
            return date.toLocaleString();
          } catch {
            return params.value;
          }
        },
        width: col.width || 180,
      };
    }

    // Format boolean columns as badges
    if (
      field.startsWith('is') ||
      field.startsWith('has') ||
      field.startsWith('can') ||
      field === 'enabled' ||
      field === 'active' ||
      field === 'disabled' ||
      field === 'synced' ||
      headerName.startsWith('is ') ||
      headerName.startsWith('has ')
    ) {
      return {
        ...col,
        cellRenderer: StatusBadgeCellRenderer,
        valueFormatter: (params) => {
          if (params.value === null || params.value === undefined) return 'N/A';
          // Handle string boolean values
          if (typeof params.value === 'string') {
            const lower = params.value.toLowerCase();
            if (lower === 'true' || lower === 'yes' || lower === '1') return 'Yes';
            if (lower === 'false' || lower === 'no' || lower === '0') return 'No';
            return params.value;
          }
          return params.value ? 'Yes' : 'No';
        },
        width: col.width || 120,
      };
    }

    // Format numeric columns
    if (
      field.includes('count') ||
      field.includes('total') ||
      field.includes('size') ||
      field.includes('bytes') ||
      headerName.includes('count') ||
      headerName.includes('total')
    ) {
      return {
        ...col,
        valueFormatter: (params) => {
          if (params.value === null || params.value === undefined) return '';
          if (typeof params.value === 'number') {
            return params.value.toLocaleString();
          }
          return params.value;
        },
        type: 'numericColumn',
        width: col.width || 130,
      };
    }

    return col;
  });
};

export interface VirtualizedDataGridProps<T = any> {
  /** Data rows to display */
  data?: T[] | null;
  /** Column definitions */
  columns: ColDef[];
  /** Loading state */
  loading?: boolean;
  /** Height of virtual rows */
  virtualRowHeight?: number;
  /** Enable column reordering */
  enableColumnReorder?: boolean;
  /** Enable column resizing */
  enableColumnResize?: boolean;
  /** Enable CSV/Excel export */
  enableExport?: boolean;
  /** Enable printing */
  enablePrint?: boolean;
  /** Enable row grouping */
  enableGrouping?: boolean;
  /** Enable filtering */
  enableFiltering?: boolean;
  /** Enable row selection */
  enableSelection?: boolean;
  /** Selection mode */
  selectionMode?: 'singleRow' | 'multiRow';
  /** Pagination settings */
  pagination?: boolean;
  paginationPageSize?: number;
  /** Row clicked handler */
  onRowClick?: (row: T) => void;
  /** Selection changed handler */
  onSelectionChange?: (rows: T[]) => void;
  /** Additional CSS classes */
  className?: string;
  /** Height of the grid */
  height?: string;
  /** Data attribute for Cypress testing */
  'data-cy'?: string;
  /** Unique key for persisting grid state (columns, filters, sorting, pagination) */
  persistenceKey?: string;
}

type VirtualizedDataGridComponent = <T = any>(
  props: VirtualizedDataGridProps<T> & React.RefAttributes<HTMLDivElement>
) => JSX.Element;

/**
 * High-performance data grid component
 */
function VirtualizedDataGridInner<T = any>(
  {
    data,
    columns,
    loading = false,
    virtualRowHeight = 32,
    enableColumnReorder = true,
    enableColumnResize = true,
    enableExport = true,
    enablePrint = true,
    enableGrouping = false,
    enableFiltering = true,
    enableSelection = true,
    selectionMode = 'multiRow',
    pagination = true,
    paginationPageSize = 100,
    onRowClick,
    onSelectionChange,
    className,
    height = '600px',
    'data-cy': dataCy,
    persistenceKey,
  }: VirtualizedDataGridProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [showColumnPanel, setShowColumnPanel] = React.useState(false);

  // Simplified state persistence
  const [savedState, setSavedState] = useState<any>(null);
  const hasRestoredStateRef = useRef(false);

  // Load state on mount
  useEffect(() => {
    if (persistenceKey) {
      try {
        const stored = localStorage.getItem(`ag-grid-state-${persistenceKey}`);
        if (stored) {
          setSavedState(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('Failed to load grid state:', error);
      }
    }
  }, [persistenceKey]);

  // Save state function
  const saveState = useCallback((state: any) => {
    if (persistenceKey) {
      try {
        localStorage.setItem(`ag-grid-state-${persistenceKey}`, JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save grid state:', error);
      }
    }
  }, [persistenceKey]);

  const clearState = useCallback(() => {
    if (persistenceKey) {
      localStorage.removeItem(`ag-grid-state-${persistenceKey}`);
    }
  }, [persistenceKey]);

  const rowData = useMemo(() => {
    const result = data ?? [];
    console.log('[VirtualizedDataGrid] rowData computed:', result.length, 'rows');
    return result;
  }, [data]);

  // Enhanced columns with auto-detected cell renderers
  const enhancedColumns = useMemo(() => {
    return enhanceColumns(columns);
  }, [columns]);

  // Load AG Grid styles on component mount
  useEffect(() => {
    loadAgGridStyles();
  }, []);

  // Default column definition
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: enableFiltering,
      resizable: enableColumnResize,
      floatingFilter: enableFiltering,
      minWidth: 100,
    }),
    [enableFiltering, enableColumnResize]
  );

  // Grid options
  const gridOptions = useMemo(
    () => ({
      rowHeight: virtualRowHeight,
      headerHeight: 40,
      floatingFiltersHeight: 40,

      rowSelection: enableSelection ? {
        mode: selectionMode,
        enableClickSelection: true,
      } : undefined,
      animateRows: true,
      // FIX: Disable charts to avoid error #200 (requires IntegratedChartsModule)
      enableCharts: false,
      // FIX: Use cellSelection instead of deprecated enableRangeSelection
      cellSelection: true,
      // Use default theme - remove legacy theme override
      theme: 'legacy' as any, // FIX: Use legacy theme to avoid conflict with CSS themes (AG Grid v34+)
      statusBar: {
        statusPanels: [
          { statusPanel: 'agTotalAndFilteredRowCountComponent', align: 'left' },
          { statusPanel: 'agSelectedRowCountComponent', align: 'center' },
          { statusPanel: 'agAggregationComponent', align: 'right' },
        ],
      },
      sideBar: enableGrouping
        ? {
            toolPanels: [
              {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
              },
              {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
              },
            ],
            defaultToolPanel: '',
          }
        : false,
    }),
    [virtualRowHeight, enableSelection, selectionMode, enableGrouping]
  );

  // Handle grid ready event with state restoration
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);

    // Restore saved state if available
    if (savedState && !hasRestoredStateRef.current && persistenceKey) {
      try {
        console.log(`[VirtualizedDataGrid] Restoring saved state for ${persistenceKey}`);

        // Restore column state (order, width, visibility, pinned)
        if (savedState.columnState && savedState.columnState.length > 0) {
          params.api.applyColumnState({
            state: savedState.columnState,
            applyOrder: true,
          });
          console.log(`[VirtualizedDataGrid] Restored ${savedState.columnState.length} column states`);
        }

        // Restore filter model
        if (savedState.filterModel && Object.keys(savedState.filterModel).length > 0) {
          params.api.setFilterModel(savedState.filterModel);
          console.log(`[VirtualizedDataGrid] Restored filter model`);
        }

        // Note: Sort state is typically included in columnState for AG Grid

        hasRestoredStateRef.current = true;
      } catch (error) {
        console.error('[VirtualizedDataGrid] Error restoring state:', error);
        // Fall back to default sizing
        params.api.sizeColumnsToFit();
      }
    } else {
      // Default behavior - size columns to fit
      params.api.sizeColumnsToFit();
    }
  }, [savedState, persistenceKey]);

  // Reset state restoration flag when persistenceKey changes
  useEffect(() => {
    hasRestoredStateRef.current = false;
  }, [persistenceKey]);

  // Restore saved state when both gridApi and savedState are available
  // This handles the case where state loads from localStorage AFTER grid is ready
  useEffect(() => {
    if (
      gridApi &&
      savedState &&
      !hasRestoredStateRef.current &&
      persistenceKey
    ) {
      try {
        console.log(`[VirtualizedDataGrid] Restoring saved state (after load) for ${persistenceKey}`);

        // Restore column state (order, width, visibility, pinned)
        if (savedState.columnState && savedState.columnState.length > 0) {
          gridApi.applyColumnState({
            state: savedState.columnState,
            applyOrder: true,
          });
          console.log(`[VirtualizedDataGrid] Restored ${savedState.columnState.length} column states`);
        }

        // Restore filter model
        if (savedState.filterModel && Object.keys(savedState.filterModel).length > 0) {
          gridApi.setFilterModel(savedState.filterModel);
          console.log(`[VirtualizedDataGrid] Restored filter model`);
        }

        hasRestoredStateRef.current = true;
      } catch (error) {
        console.error('[VirtualizedDataGrid] Error restoring state:', error);
      }
    }
  }, [gridApi, savedState, persistenceKey]);

  // Handle row click
  const handleRowClick = useCallback(
    (event: RowClickedEvent) => {
      if (onRowClick && event.data) {
        onRowClick(event.data);
      }
    },
    [onRowClick]
  );

  // Handle selection change
  const handleSelectionChange = useCallback(
    (event: SelectionChangedEvent) => {
      if (onSelectionChange) {
        const selectedRows = event.api.getSelectedRows();
        onSelectionChange(selectedRows);
      }
    },
    [onSelectionChange]
  );

  // Export to CSV
  const exportToCsv = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `export-${new Date().toISOString()}.csv`,
      });
    }
  }, [gridApi]);

  // Export to Excel
  const exportToExcel = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsExcel({
        fileName: `export-${new Date().toISOString()}.xlsx`,
        sheetName: 'Data',
      });
    }
  }, [gridApi]);

  // Print grid
  const printGrid = useCallback(() => {
    if (gridApi) {
      gridApi.setGridOption('domLayout', 'print');
      setTimeout(() => {
        window.print();
        gridApi.setGridOption('domLayout', undefined);
      }, 100);
    }
  }, [gridApi]);

  // Toggle column visibility panel
  const toggleColumnPanel = useCallback(() => {
    setShowColumnPanel(!showColumnPanel);
  }, [showColumnPanel]);

  // Auto-size all columns
  const autoSizeColumns = useCallback(() => {
    if (gridApi) {
      const allColumnIds = enhancedColumns.map(c => c.field).filter(Boolean) as string[];
      gridApi.autoSizeColumns(allColumnIds);
    }
  }, [gridApi, enhancedColumns]);

  // Reset grid state to defaults
  const resetGridState = useCallback(() => {
    if (gridApi) {
      console.log(`[VirtualizedDataGrid] Resetting grid state for ${persistenceKey}`);

      // Reset column state (order, visibility, width)
      gridApi.resetColumnState();

      // Clear all filters
      gridApi.setFilterModel(null);

      // Size columns to fit
      gridApi.sizeColumnsToFit();

      // Clear saved state from localStorage
      clearState();

      // Reset the restoration flag so next time we don't try to restore cleared state
      hasRestoredStateRef.current = false;
    }
  }, [gridApi, clearState, persistenceKey]);

  // State change event listeners - save state when columns/filters/sort change
  useEffect(() => {
    if (!gridApi || !persistenceKey) return;

    // Debounced save for column state changes
    let columnSaveTimeout: NodeJS.Timeout | null = null;

    const handleColumnStateChange = () => {
      // Debounce to avoid excessive saves during drag operations
      if (columnSaveTimeout) {
        clearTimeout(columnSaveTimeout);
      }
      columnSaveTimeout = setTimeout(() => {
        const columnState = gridApi.getColumnState();
        if (columnState) {
          saveState({ columnState });
        }
      }, 500); // 500ms debounce for column changes
    };

    const handleFilterChanged = () => {
      const filterModel = gridApi.getFilterModel();
      saveState({ filterModel: filterModel || {} });
    };

    const handleSortChanged = () => {
      // Sort state is included in column state, so we save column state
      const columnState = gridApi.getColumnState();
      if (columnState) {
        saveState({ columnState });
      }
    };

    // Attach event listeners
    gridApi.addEventListener('columnMoved', handleColumnStateChange);
    gridApi.addEventListener('columnResized', handleColumnStateChange);
    gridApi.addEventListener('columnVisible', handleColumnStateChange);
    gridApi.addEventListener('columnPinned', handleColumnStateChange);
    gridApi.addEventListener('filterChanged', handleFilterChanged);
    gridApi.addEventListener('sortChanged', handleSortChanged);

    console.log(`[VirtualizedDataGrid] Attached state persistence listeners for ${persistenceKey}`);

    // Cleanup
    return () => {
      if (columnSaveTimeout) {
        clearTimeout(columnSaveTimeout);
      }

      if (gridApi) {
        try {
          gridApi.removeEventListener('columnMoved', handleColumnStateChange);
          gridApi.removeEventListener('columnResized', handleColumnStateChange);
          gridApi.removeEventListener('columnVisible', handleColumnStateChange);
          gridApi.removeEventListener('columnPinned', handleColumnStateChange);
          gridApi.removeEventListener('filterChanged', handleFilterChanged);
          gridApi.removeEventListener('sortChanged', handleSortChanged);
        } catch (e) {
          // Grid may already be destroyed
        }
      }
    };
  }, [gridApi, persistenceKey, saveState]);

  // Container classes
  const containerClasses = clsx(
    'flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm',
    className
  );

  return (
    <div
      ref={ref}
      className={containerClasses}
      data-cy={dataCy}
      role="region"
      aria-label="Data grid"
      aria-live="polite"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? (
              <Spinner size="sm" />
            ) : (
              `${rowData.length.toLocaleString()} rows`
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {enableFiltering && (
            <Button
              size="sm"
              variant="ghost"
              icon={<Filter size={16} />}
              onClick={() => {
                // Note: setFloatingFiltersHeight is deprecated in AG Grid v34
                // Floating filters are now controlled through column definitions
                console.warn('Filter toggle not yet implemented for AG Grid v34');
              }}
              title="Toggle filters"
              data-cy="toggle-filters"
            >
              Filters
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            icon={showColumnPanel ? <EyeOff size={16} /> : <Eye size={16} />}
            onClick={toggleColumnPanel}
            title="Toggle column visibility"
            data-cy="toggle-columns"
          >
            Columns
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={autoSizeColumns}
            title="Auto-size columns"
            data-cy="auto-size"
          >
            Auto Size
          </Button>

          {persistenceKey && (
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw size={16} />}
              onClick={resetGridState}
              title="Reset grid to default state"
              data-cy="reset-grid-state"
            >
              Reset
            </Button>
          )}

          {enableExport && (
            <>
              <Button
                size="sm"
                variant="ghost"
                icon={<Download size={16} />}
                onClick={exportToCsv}
                title="Export to CSV"
                data-cy="export-csv"
              >
                CSV
              </Button>
              <Button
                size="sm"
                variant="ghost"
                icon={<Download size={16} />}
                onClick={exportToExcel}
                title="Export to Excel"
                data-cy="export-excel"
              >
                Excel
              </Button>
            </>
          )}

          {enablePrint && (
            <Button
              size="sm"
              variant="ghost"
              icon={<Printer size={16} />}
              onClick={printGrid}
              title="Print"
              data-cy="print"
            >
              Print
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 relative">
        {loading && (
          <div
            data-testid="grid-loading"
            role="status"
            aria-label="Loading data"
            className="absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-10 flex items-center justify-center">
            <Spinner size="lg" label="Loading data..." />
          </div>
        )}

        <div
          className={clsx(
            'ag-theme-alpine',
            'dark:ag-theme-alpine-dark',
            'w-full'
          )}
          style={{ height }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={enhancedColumns}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
            onGridReady={onGridReady}
            onRowClicked={handleRowClick}
            onSelectionChanged={handleSelectionChange}
            rowBuffer={20}
            rowModelType="clientSide"
            pagination={pagination}
            paginationPageSize={paginationPageSize}
            paginationAutoPageSize={false}
            suppressCellFocus={false}
            enableCellTextSelection={true}
            ensureDomOrder={true}
          />
        </div>

        {/* Column visibility panel */}
        {showColumnPanel && (
          <div className="absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto z-20">
            <h3 className="font-semibold text-sm mb-3">Column Visibility</h3>
            {enhancedColumns.map((col) => (
              <label key={col.field} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  className="rounded"
                  defaultChecked
                  onChange={(e) => {
                    if (gridApi && col.field) {
                      gridApi.setColumnsVisible([col.field], e.target.checked);
                    }
                  }}
                />
                <span className="text-sm">{col.headerName || col.field}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const VirtualizedDataGrid = React.forwardRef(VirtualizedDataGridInner) as VirtualizedDataGridComponent;

// Set displayName for React DevTools
(VirtualizedDataGrid as any).displayName = 'VirtualizedDataGrid';



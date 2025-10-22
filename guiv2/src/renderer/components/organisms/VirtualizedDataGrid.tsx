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
import { Download, Printer, Eye, EyeOff, Filter } from 'lucide-react';

import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';

// Lazy load AG Grid CSS - only load once when first grid mounts
let agGridStylesLoaded = false;
const loadAgGridStyles = () => {
  if (agGridStylesLoaded) return;

  // Dynamically import AG Grid styles
  import('ag-grid-community/styles/ag-grid.css');
  import('ag-grid-community/styles/ag-theme-alpine.css');

  agGridStylesLoaded = true;
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
  selectionMode?: 'single' | 'multiple';
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
}

/**
 * High-performance data grid component
 */
export function VirtualizedDataGrid<T = any>({
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
  selectionMode = 'multiple',
  pagination = true,
  paginationPageSize = 100,
  onRowClick,
  onSelectionChange,
  className,
  height = '600px',
  'data-cy': dataCy,
}: VirtualizedDataGridProps<T>) {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = React.useState<GridApi | null>(null);
  const [showColumnPanel, setShowColumnPanel] = React.useState(false);
  const rowData = useMemo(() => data ?? [], [data]);

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
      suppressRowClickSelection: !enableSelection,
      rowSelection: enableSelection ? selectionMode : undefined,
      animateRows: true,
      enableRangeSelection: true,
      enableCharts: true,
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

  // Handle grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  }, []);

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
      const allColumnIds = columns.map(c => c.field).filter(Boolean) as string[];
      gridApi.autoSizeColumns(allColumnIds);
    }
  }, [gridApi, columns]);

  // Container classes
  const containerClasses = clsx(
    'flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm',
    className
  );

  return (
    <div className={containerClasses} data-cy={dataCy}>
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
            columnDefs={columns}
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
            {columns.map((col) => (
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

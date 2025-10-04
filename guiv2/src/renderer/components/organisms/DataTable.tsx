/**
 * Data Table Component
 * Simpler alternative to AG Grid with built-in sorting, filtering, and pagination
 */

import React, { useState, useMemo, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, ChevronLeft, ChevronRight, Columns, Download, Copy, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import Papa from 'papaparse';
import { Menu, Item, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import Checkbox from '../atoms/Checkbox';
import { Button } from '../atoms/Button';
import { useTabStore } from '../../store/useTabStore';

export interface DataTableColumn<T = any> {
  /** Column identifier */
  id: string;
  /** Column header text */
  header: string;
  /** Accessor function or property name */
  accessor: keyof T | ((row: T) => any);
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Enable filtering for this column */
  filterable?: boolean;
  /** Custom cell renderer */
  cell?: (value: any, row: T) => React.ReactNode;
  /** Column width */
  width?: string;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Default visibility state */
  visible?: boolean;
}

export interface DataTableProps<T = any> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Enable row selection */
  selectable?: boolean;
  /** Selection change handler */
  onSelectionChange?: (selectedRows: T[]) => void;
  /** Enable pagination */
  pagination?: boolean;
  /** Items per page (default: 25) */
  pageSize?: number;
  /** Enable search/filter */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Get unique row key */
  getRowId?: (row: T, index: number) => string;
  /** Additional table classes */
  className?: string;
  /** Data attribute for testing */
  'data-cy'?: string;
  /** Enable column visibility control */
  columnVisibility?: boolean;
  /** Enable export functionality */
  exportable?: boolean;
  /** Export filename (without extension) */
  exportFilename?: string;
  /** Enable context menu */
  contextMenu?: boolean;
  /** Context menu handler for "View Details" */
  onViewDetails?: (row: T) => void;
  /** Detail view component name (for tab opening) */
  detailViewComponent?: string;
  /** Detail view title generator */
  getDetailViewTitle?: (row: T) => string;
}

type SortDirection = 'asc' | 'desc' | null;

/**
 * Data Table Component
 */
function DataTable<T = any>({
  data,
  columns,
  selectable = false,
  onSelectionChange,
  pagination = true,
  pageSize = 25,
  searchable = true,
  searchPlaceholder = 'Search...',
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  getRowId = (_, index) => index.toString(),
  className,
  'data-cy': dataCy = 'data-table',
  columnVisibility = true,
  exportable = true,
  exportFilename = 'export',
  contextMenu = true,
  onViewDetails,
  detailViewComponent,
  getDetailViewTitle,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [columnVisibilityState, setColumnVisibilityState] = useState<Record<string, boolean>>(
    () => columns.reduce((acc, col) => ({ ...acc, [col.id]: col.visible !== false }), {})
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement>(null);
  const { openTab } = useTabStore();

  // Context menu setup
  const MENU_ID = `data-table-${dataCy}`;
  const { show } = useContextMenu({ id: MENU_ID });

  // Get cell value
  const getCellValue = (row: T, column: DataTableColumn<T>): any => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((row) => {
      return columns.some((column) => {
        if (!column.filterable) return false;
        const value = getCellValue(row, column);
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    const column = columns.find((col) => col.id === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getCellValue(a, column);
      const bValue = getCellValue(b, column);

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    if (sortColumn === columnId) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleRowSelect = (rowId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);

    if (onSelectionChange) {
      const selected = data.filter((row, index) => newSelected.has(getRowId(row, index)));
      onSelectionChange(selected);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(paginatedData.map((row, index) => getRowId(row, index)));
      setSelectedRows(allIds);
      onSelectionChange?.(paginatedData);
    }
  };

  const allSelected = selectedRows.size === paginatedData.length && paginatedData.length > 0;
  const someSelected = selectedRows.size > 0 && selectedRows.size < paginatedData.length;

  // Get visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter(col => columnVisibilityState[col.id]);
  }, [columns, columnVisibilityState]);

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibilityState(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  // Handle context menu
  const handleContextMenu = (event: React.MouseEvent, row: T) => {
    if (!contextMenu) return;
    event.preventDefault();
    show({ event, props: { row } });
  };

  // Handle view details
  const handleViewDetails = ({ props }: any) => {
    const row = props.row as T;

    if (onViewDetails) {
      onViewDetails(row);
    } else if (detailViewComponent && getDetailViewTitle) {
      openTab({
        title: getDetailViewTitle(row),
        component: detailViewComponent,
        icon: 'Eye',
        closable: true,
        data: row
      });
    }
  };

  // Handle copy row
  const handleCopyRow = ({ props }: any) => {
    const row = props.row as T;
    const rowText = visibleColumns
      .map(col => {
        const value = getCellValue(row, col);
        return `${col.header}: ${value}`;
      })
      .join('\n');

    navigator.clipboard.writeText(rowText).then(() => {
      // Could show a toast notification here
      console.log('Row copied to clipboard');
    });
  };

  // Handle export selected
  const handleExportSelected = ({ props }: any) => {
    const row = props.row as T;
    const rowsToExport = selectedRows.size > 0
      ? data.filter((_, index) => selectedRows.has(getRowId(_, index)))
      : [row];

    exportToCSV(rowsToExport);
  };

  // Export data to CSV
  const exportToCSV = (dataToExport: T[] = sortedData) => {
    const csvData = dataToExport.map(row => {
      const csvRow: any = {};
      visibleColumns.forEach(col => {
        const value = getCellValue(row, col);
        csvRow[col.header] = value;
      });
      return csvRow;
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFilename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Close column menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    };

    if (showColumnMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColumnMenu]);

  return (
    <div className={clsx('flex flex-col h-full', className)} data-cy={dataCy}>
      {/* Toolbar */}
      {(searchable || columnVisibility || exportable) && (
        <div className="mb-4 flex items-center gap-3">
          {searchable && (
            <div className="flex-1">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                startIcon={<Search className="w-4 h-4" />}
                data-cy="table-search"
              />
            </div>
          )}

          {/* Column Visibility Button */}
          {columnVisibility && (
            <div className="relative" ref={columnMenuRef}>
              <Button
                variant="secondary"
                size="md"
                icon={<Columns className="w-4 h-4" />}
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                data-cy="column-visibility-btn"
              >
                Columns
              </Button>

              {/* Column Visibility Dropdown */}
              {showColumnMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Show/Hide Columns
                    </div>
                    <div className="space-y-1">
                      {columns.map(column => (
                        <label
                          key={column.id}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                          data-cy={`column-toggle-${column.id}`}
                        >
                          <Checkbox
                            checked={columnVisibilityState[column.id]}
                            onChange={() => toggleColumnVisibility(column.id)}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-200">
                            {column.header}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export Button */}
          {exportable && (
            <Button
              variant="secondary"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={() => exportToCSV()}
              data-cy="export-btn"
            >
              Export
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Header */}
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    data-cy="select-all-checkbox"
                  />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={clsx(
                    'px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.id)}
                  data-cy={`column-header-${column.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="text-gray-400">
                        {sortColumn === column.id ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const rowId = getRowId(row, rowIndex);
                const isSelected = selectedRows.has(rowId);

                return (
                  <tr
                    key={rowId}
                    className={clsx(
                      'transition-colors',
                      onRowClick && 'cursor-pointer',
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                    onClick={() => onRowClick?.(row)}
                    onContextMenu={(e) => handleContextMenu(e, row)}
                    data-cy={`table-row-${rowIndex}`}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleRowSelect(rowId)}
                          data-cy={`row-checkbox-${rowIndex}`}
                        />
                      </td>
                    )}
                    {visibleColumns.map((column) => {
                      const value = getCellValue(row, column);
                      const content = column.cell ? column.cell(value, row) : value;

                      return (
                        <td
                          key={column.id}
                          className={clsx(
                            'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                          data-cy={`cell-${column.id}-${rowIndex}`}
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              data-cy="prev-page-btn"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              data-cy="next-page-btn"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <Menu id={MENU_ID} theme="dark">
          {(onViewDetails || detailViewComponent) && (
            <Item onClick={handleViewDetails} data-cy="context-menu-view-details">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>View Details</span>
              </div>
            </Item>
          )}
          <Item onClick={handleCopyRow} data-cy="context-menu-copy">
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              <span>Copy Row</span>
            </div>
          </Item>
          {exportable && (
            <Item onClick={handleExportSelected} data-cy="context-menu-export">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Export Selection</span>
              </div>
            </Item>
          )}
        </Menu>
      )}
    </div>
  );
}

export default DataTable;

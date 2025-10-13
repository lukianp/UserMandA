/**
 * Simple DataTable Wrapper
 * Auto-generates columns from data for use in auto-generated discovery views
 */

import React, { useMemo } from 'react';
import DataTableOrganism, { DataTableColumn } from './organisms/DataTable';

export interface SimpleDataTableProps {
  rows: any[];
  loading?: boolean;
  emptyMessage?: string;
}

/**
 * Simple wrapper around DataTable that auto-generates columns from row data
 */
export function DataTable({ rows, loading = false, emptyMessage = 'No data available' }: SimpleDataTableProps) {
  // Auto-generate columns from first row
  const columns: DataTableColumn[] = useMemo(() => {
    if (!rows || rows.length === 0) return [];

    const firstRow = rows[0];
    return Object.keys(firstRow).map((key) => ({
      id: key,
      header: key
        .replace(/([A-Z])/g, ' $1') // Add space before capitals
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
        .trim(),
      accessor: key,
      sortable: true,
      filterable: true,
      visible: true,
    }));
  }, [rows]);

  if (!rows || rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <DataTableOrganism
      data={rows}
      columns={columns}
      pagination={true}
      pageSize={50}
      searchable={true}
      searchPlaceholder="Search data..."
      loading={loading}
      emptyMessage={emptyMessage}
      exportable={true}
      exportFilename="discovery-data"
      columnVisibility={true}
    />
  );
}

export default DataTable;

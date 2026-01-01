import React from 'react';

export const VirtualizedDataGrid = ({ columns, data, onRowClick, loading, enableExport, 'data-cy': dataCy }: any) => {
  if (loading) {
    return React.createElement('div', { 'data-testid': 'virtualized-data-grid-loading' }, 'Loading...');
  }

  const rowData = data ?? [];

  return React.createElement('div', { 'data-testid': 'virtualized-data-grid', 'data-cy': dataCy },
    enableExport && React.createElement('div', { 'data-testid': 'grid-toolbar' },
      React.createElement('button', { 'data-testid': 'export-csv-btn' }, 'Export CSV'),
      React.createElement('button', { 'data-testid': 'export-excel-btn' }, 'Export Excel')
    ),
    React.createElement('table', { 'data-testid': 'grid-table' },
      React.createElement('thead', {},
        React.createElement('tr', {},
          columns?.map((col: any, i: number) =>
            React.createElement('th', { key: i, 'data-testid': `grid-header-${col.field}` }, col.headerName || col.field)
          )
        )
      ),
      React.createElement('tbody', {},
        rowData.map((row: any, i: number) =>
          React.createElement('tr', { key: i, onClick: () => onRowClick?.(row), 'data-testid': `grid-row-${i}` },
            columns?.map((col: any, j: number) =>
              React.createElement('td', { key: j, 'data-testid': `grid-cell-${i}-${col.field}` },
                col.valueGetter ? col.valueGetter({ row }) : row[col.field]
              )
            )
          )
        )
      )
    ),
    rowData.length === 0 && React.createElement('div', { 'data-testid': 'grid-no-data' }, 'No data available')
  );
};

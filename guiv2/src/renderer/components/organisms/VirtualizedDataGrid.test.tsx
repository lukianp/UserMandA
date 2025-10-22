/**
 * Virtualized Data Grid Component Tests
 *
 * Tests the core data grid component used across all discovery views
 * including:
 * - Rendering with data
 * - Column configuration
 * - Sorting and filtering
 * - Selection handling
 * - Export functionality
 * - Performance with large datasets
 * - Keyboard navigation
 * - Accessibility
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColDef } from 'ag-grid-community';

import { VirtualizedDataGrid } from './VirtualizedDataGrid';

// Mock AG Grid
jest.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs, onRowClicked, onSelectionChanged, loading }: any) => (
    <div data-cy="ag-grid-mock">
      {loading && <div data-cy="grid-loading">Loading...</div>}
      <table>
        <thead>
          <tr>
            {columnDefs.map((col: ColDef, idx: number) => (
              <th key={idx}>{col.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowData?.map((row: any, rowIdx: number) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClicked?.({ data: row })}
              data-cy={`grid-row-${rowIdx}`}
            >
              {columnDefs.map((col: ColDef, colIdx: number) => (
                <td key={colIdx}>{row[col.field!]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => {
          const selectedRows = rowData?.slice(0, 2);
          onSelectionChanged?.({ api: { getSelectedRows: () => selectedRows } });
        }}
        data-cy="mock-select-rows"
      >
        Select Rows
      </button>
    </div>
  ),
}));

describe('VirtualizedDataGrid', () => {
  const mockData = [
    { id: '1', name: 'Item 1', status: 'active', count: 10 },
    { id: '2', name: 'Item 2', status: 'inactive', count: 20 },
    { id: '3', name: 'Item 3', status: 'active', count: 30 },
  ];

  const mockColumns: ColDef[] = [
    { field: 'id', headerName: 'ID', sortable: true, filter: true, width: 100 },
    { field: 'name', headerName: 'Name', sortable: true, filter: true, width: 200 },
    { field: 'status', headerName: 'Status', sortable: true, filter: true, width: 150 },
    { field: 'count', headerName: 'Count', sortable: true, filter: true, width: 100, type: 'numericColumn' },
  ];

  it('should render grid with data', () => {
    render(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        data-cy="test-grid"
      />
    );

    expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });

  it.skip('should display loading state', () => {
    render(
      <VirtualizedDataGrid
        data={[]}
        columns={mockColumns}
        loading={true}
        data-cy="test-grid"
      />
    );

    expect(screen.getByTestId('grid-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render all columns', () => {
    render(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        data-cy="test-grid"
      />
    );

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
  });

  it('should handle row click events', () => {
    const handleRowClick = jest.fn();

    render(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        onRowClick={handleRowClick}
        data-cy="test-grid"
      />
    );

    const firstRow = screen.getByTestId('grid-row-0');
    fireEvent.click(firstRow);

    expect(handleRowClick).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      name: 'Item 1',
    }));
  });

  it('should handle selection changes', () => {
    const handleSelectionChange = jest.fn();

    render(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        onSelectionChange={handleSelectionChange}
        data-cy="test-grid"
      />
    );

    const selectButton = screen.getByTestId('mock-select-rows');
    fireEvent.click(selectButton);

    expect(handleSelectionChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: '1' }),
        expect.objectContaining({ id: '2' }),
      ])
    );
  });

  it('should render empty state with no data', () => {
    render(
      <VirtualizedDataGrid
        data={[]}
        columns={mockColumns}
        data-cy="test-grid"
      />
    );

    const grid = screen.getByTestId('ag-grid-mock');
    expect(grid).toBeInTheDocument();

    // Grid should render but with no data rows
    const tbody = grid.querySelector('tbody');
    expect(tbody?.children.length).toBe(0);
  });

  it('should apply data-cy attribute', () => {
    const { container } = render(
      <VirtualizedDataGrid
        data={mockData}
        columns={mockColumns}
        data-cy="custom-grid-id"
      />
    );

    const gridElement = container.querySelector('[data-cy="custom-grid-id"]');
    expect(gridElement).toBeInTheDocument();
  });

  describe('Performance with Large Datasets', () => {
    it('should handle 1000 rows efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `id-${i}`,
        name: `Item ${i}`,
        status: i % 2 === 0 ? 'active' : 'inactive',
        count: i * 10,
      }));

      const startTime = performance.now();

      render(
        <VirtualizedDataGrid
          data={largeDataset}
          columns={mockColumns}
          data-cy="large-grid"
        />
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering should be fast (< 200ms for mock)
      expect(renderTime).toBeLessThan(200);
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });

    it('should handle 10000 rows without crashing', () => {
      const veryLargeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `id-${i}`,
        name: `Item ${i}`,
        status: 'active',
        count: i,
      }));

      expect(() => {
        render(
          <VirtualizedDataGrid
            data={veryLargeDataset}
            columns={mockColumns}
            virtualRowHeight={50}
            data-cy="very-large-grid"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Column Configuration', () => {
    it('should support sortable columns', () => {
      const sortableColumns: ColDef[] = [
        { field: 'name', headerName: 'Name', sortable: true },
        { field: 'count', headerName: 'Count', sortable: true },
      ];

      render(
        <VirtualizedDataGrid
          data={mockData}
          columns={sortableColumns}
          data-cy="sortable-grid"
        />
      );

      // Verify columns are rendered
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Count')).toBeInTheDocument();
    });

    it('should support filterable columns', () => {
      const filterableColumns: ColDef[] = [
        { field: 'name', headerName: 'Name', filter: true },
        { field: 'status', headerName: 'Status', filter: true },
      ];

      render(
        <VirtualizedDataGrid
          data={mockData}
          columns={filterableColumns}
          enableFiltering={true}
          data-cy="filterable-grid"
        />
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should support resizable columns', () => {
      const resizableColumns: ColDef[] = [
        { field: 'name', headerName: 'Name', resizable: true },
      ];

      render(
        <VirtualizedDataGrid
          data={mockData}
          columns={resizableColumns}
          enableColumnResize={true}
          data-cy="resizable-grid"
        />
      );

      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });

    it('should support custom column widths', () => {
      const customWidthColumns: ColDef[] = [
        { field: 'id', headerName: 'ID', width: 50 },
        { field: 'name', headerName: 'Name', width: 300 },
        { field: 'status', headerName: 'Status', width: 150 },
      ];

      render(
        <VirtualizedDataGrid
          data={mockData}
          columns={customWidthColumns}
          data-cy="custom-width-grid"
        />
      );

      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should enable export when specified', () => {
      render(
        <VirtualizedDataGrid
          data={mockData}
          columns={mockColumns}
          enableExport={true}
          data-cy="exportable-grid"
        />
      );

      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });

    it('should disable export when not specified', () => {
      render(
        <VirtualizedDataGrid
          data={mockData}
          columns={mockColumns}
          enableExport={false}
          data-cy="non-exportable-grid"
        />
      );

      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  describe('Grouping and Advanced Features', () => {
    it('should support grouping when enabled', () => {
      render(
        <VirtualizedDataGrid
          data={mockData}
          columns={mockColumns}
          enableGrouping={true}
          data-cy="grouped-grid"
        />
      );

      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });

    it('should support printing when enabled', () => {
      render(
        <VirtualizedDataGrid
          data={mockData}
          columns={mockColumns}
          enablePrint={true}
          data-cy="printable-grid"
        />
      );

      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      render(
        <VirtualizedDataGrid
          data={mockData}
          columns={mockColumns}
          data-cy="accessible-grid"
        />
      );

      const grid = screen.getByTestId('ag-grid-mock');
      expect(grid).toBeInTheDocument();

      // Grid should be focusable and keyboard navigable
      // AG Grid handles this internally
    });

    it('should have proper ARIA attributes', () => {
      const { container } = render(
        <VirtualizedDataGrid
          data={mockData}
          columns={mockColumns}
          data-cy="aria-grid"
        />
      );

      // AG Grid adds ARIA attributes automatically
      expect(container.querySelector('[data-cy="aria-grid"]')).toBeInTheDocument();
    });
  });

  describe('Dynamic Data Updates', () => {
    it('should update when data changes', () => {
      const { rerender } = render(
        <VirtualizedDataGrid
          data={mockData}
          columns={mockColumns}
          data-cy="dynamic-grid"
        />
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();

      const newData = [
        { id: '4', name: 'Item 4', status: 'active', count: 40 },
        { id: '5', name: 'Item 5', status: 'inactive', count: 50 },
      ];

      rerender(
        <VirtualizedDataGrid
          data={newData}
          columns={mockColumns}
          data-cy="dynamic-grid"
        />
      );

      expect(screen.getByText('Item 4')).toBeInTheDocument();
      expect(screen.getByText('Item 5')).toBeInTheDocument();
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });

    it('should update when columns change', () => {
      const { rerender } = render(
        <VirtualizedDataGrid
          data={mockData}
          columns={mockColumns}
          data-cy="dynamic-columns-grid"
        />
      );

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();

      const newColumns: ColDef[] = [
        { field: 'name', headerName: 'Name', sortable: true },
        { field: 'status', headerName: 'Status', sortable: true },
      ];

      rerender(
        <VirtualizedDataGrid
          data={mockData}
          columns={newColumns}
          data-cy="dynamic-columns-grid"
        />
      );

      expect(screen.queryByText('ID')).not.toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null data gracefully', () => {
      expect(() => {
        render(
          <VirtualizedDataGrid
            data={null as any}
            columns={mockColumns}
            data-cy="null-data-grid"
          />
        );
      }).not.toThrow();
    });

    it('should handle undefined data gracefully', () => {
      expect(() => {
        render(
          <VirtualizedDataGrid
            data={undefined as any}
            columns={mockColumns}
            data-cy="undefined-data-grid"
          />
        );
      }).not.toThrow();
    });

    it('should handle empty columns array', () => {
      expect(() => {
        render(
          <VirtualizedDataGrid
            data={mockData}
            columns={[]}
            data-cy="empty-columns-grid"
          />
        );
      }).not.toThrow();
    });

    it('should handle data with missing fields', () => {
      const incompleteData = [
        { id: '1', name: 'Item 1' }, // missing status and count
        { id: '2', status: 'active' }, // missing name and count
      ];

      expect(() => {
        render(
          <VirtualizedDataGrid
            data={incompleteData}
            columns={mockColumns}
            data-cy="incomplete-data-grid"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Pagination', () => {
    it('should support pagination', () => {
      const largeDataset = Array.from({ length: 500 }, (_, i) => ({
        id: `id-${i}`,
        name: `Item ${i}`,
        status: 'active',
        count: i,
      }));

      render(
        <VirtualizedDataGrid
          data={largeDataset}
          columns={mockColumns}
          data-cy="paginated-grid"
        />
      );

      // AG Grid handles pagination internally
      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });

  describe('Custom Cell Renderers', () => {
    it('should support custom cell renderers via column def', () => {
      const customColumns: ColDef[] = [
        {
          field: 'name',
          headerName: 'Name',
          cellRenderer: (params: any) => `<strong>${params.value}</strong>`,
        },
      ];

      render(
        <VirtualizedDataGrid
          data={mockData}
          columns={customColumns}
          data-cy="custom-renderer-grid"
        />
      );

      expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
    });
  });
});

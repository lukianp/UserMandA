/**
 * Column Visibility Dialog
 * Toggle visibility of data grid columns
 */

import React, { useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import Button from '../atoms/Button';
import Checkbox from '../atoms/Checkbox';
import { X, Eye } from 'lucide-react';

interface ColumnVisibilityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Array<{ id: string; label: string; visible: boolean }>;
  onApply: (visibleColumnIds: string[]) => void;
}

const ColumnVisibilityDialog: React.FC<ColumnVisibilityDialogProps> = ({
  isOpen,
  onClose,
  columns,
  onApply,
}) => {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(c => c.visible).map(c => c.id))
  );

  const toggleColumn = useCallback((columnId: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  }, []);

  const handleShowAll = useCallback(() => {
    setVisibleColumns(new Set(columns.map(c => c.id)));
  }, [columns]);

  const handleHideAll = useCallback(() => {
    setVisibleColumns(new Set());
  }, []);

  const handleApply = useCallback(() => {
    onApply(Array.from(visibleColumns));
    onClose();
  }, [visibleColumns, onApply, onClose]);

  const handleReset = useCallback(() => {
    setVisibleColumns(new Set(columns.filter(c => c.visible).map(c => c.id)));
  }, [columns]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                Column Visibility
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              data-cy="close-dialog-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {visibleColumns.size} of {columns.length} columns visible
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleShowAll}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  data-cy="show-all-btn"
                >
                  Show All
                </button>
                <button
                  onClick={handleHideAll}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  data-cy="hide-all-btn"
                >
                  Hide All
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {columns.map((column) => (
                <Checkbox
                  key={column.id}
                  label={column.label}
                  checked={visibleColumns.has(column.id)}
                  onChange={() => toggleColumn(column.id)}
                  data-cy={`column-toggle-${column.id}`}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <Button
              variant="secondary"
              onClick={handleReset}
              data-cy="reset-btn"
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              data-cy="cancel-btn"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApply}
              data-cy="apply-btn"
            >
              Apply
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ColumnVisibilityDialog;

/**
 * Export Dialog
 * Format selection and export options for data grids
 */

import React, { useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Download } from 'lucide-react';

import { Button } from '../atoms/Button';
import { Select } from '../atoms/Select';
import Checkbox from '../atoms/Checkbox';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  availableColumns?: string[];
  defaultFormat?: 'CSV' | 'Excel' | 'JSON' | 'PDF';
}

export interface ExportOptions {
  format: 'CSV' | 'Excel' | 'JSON' | 'PDF';
  selectedColumns: string[];
  includeHeaders: boolean;
  filename: string;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  availableColumns = [],
  defaultFormat = 'CSV',
}) => {
  const [format, setFormat] = useState<ExportOptions['format']>(defaultFormat);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(availableColumns);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [filename, setFilename] = useState(`export-${Date.now()}`);
  const [isExporting, setIsExporting] = useState(false);

  const handleSelectAll = useCallback(() => {
    setSelectedColumns(availableColumns);
  }, [availableColumns]);

  const handleDeselectAll = useCallback(() => {
    setSelectedColumns([]);
  }, []);

  const toggleColumn = useCallback((column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      await onExport({
        format,
        selectedColumns,
        includeHeaders,
        filename,
      });
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [format, selectedColumns, includeHeaders, filename, onExport, onClose]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Export Data
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              data-cy="close-dialog-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            <Select
              label="Export Format"
              value={format}
              onChange={(value: string) => setFormat(value as ExportOptions['format'])}
              options={[
                { value: 'CSV', label: 'CSV (Comma-Separated Values)' },
                { value: 'Excel', label: 'Excel Workbook (.xlsx)' },
                { value: 'JSON', label: 'JSON (JavaScript Object Notation)' },
                { value: 'PDF', label: 'PDF Document' },
              ]}
              data-cy="format-select"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filename
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                data-cy="filename-input"
              />
            </div>

            <Checkbox
              label="Include Headers"
              checked={includeHeaders}
              onChange={setIncludeHeaders}
              data-cy="include-headers-checkbox"
            />

            {/* Column Selection */}
            {availableColumns.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Columns to Export
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      data-cy="select-all-btn"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      data-cy="deselect-all-btn"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-3 space-y-2">
                  {availableColumns.map((column) => (
                    <Checkbox
                      key={column}
                      label={column}
                      checked={selectedColumns.includes(column)}
                      onChange={() => toggleColumn(column)}
                      data-cy={`column-checkbox-${column}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isExporting}
              data-cy="cancel-btn"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={selectedColumns.length === 0 || !filename}
              loading={isExporting}
              icon={<Download className="w-4 h-4" />}
              data-cy="export-btn"
            >
              Export
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ExportDialog;



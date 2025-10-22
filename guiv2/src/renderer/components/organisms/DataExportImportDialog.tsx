/**
 * Data Export/Import Dialog
 *
 * UI for exporting and importing data in various formats
 */

import React, { useState } from 'react';

import { useDataExportImport } from '../../hooks/useDataExportImport';
import LoadingSpinner from '../atoms/LoadingSpinner';
import type { ExportFormat } from '../../hooks/useDataExportImport';

import { Modal } from './Modal';

interface DataExportImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data?: any[];
  dataType?: 'users' | 'groups' | 'computers' | 'generic';
  availableFields?: string[];
}

export const DataExportImportDialog: React.FC<DataExportImportDialogProps> = ({
  isOpen,
  onClose,
  data = [],
  dataType = 'generic',
  availableFields = []
}) => {
  const { state, exportData, importData, exportUsers, exportGroups, exportComputers } =
    useDataExportImport();

  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('CSV');
  const [fileName, setFileName] = useState('');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Auto-detect fields from data
  const detectedFields =
    availableFields.length > 0
      ? availableFields
      : data.length > 0
        ? Object.keys(data[0])
        : [];

  const handleExport = async () => {
    if (!fileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    const fileNameWithExtension = fileName.endsWith(`.${exportFormat.toLowerCase()}`)
      ? fileName
      : `${fileName}.${exportFormat.toLowerCase()}`;

    try {
      let result;

      // Use specialized export methods if available
      if (dataType === 'users' && exportFormat === 'CSV') {
        result = await exportUsers(data, fileNameWithExtension);
      } else if (dataType === 'groups' && exportFormat === 'CSV') {
        result = await exportGroups(data, fileNameWithExtension);
      } else if (dataType === 'computers' && exportFormat === 'CSV') {
        result = await exportComputers(data, fileNameWithExtension);
      } else {
        result = await exportData(data, fileNameWithExtension, exportFormat, {
          includeHeaders,
          includeMetadata,
          filterFields: selectedFields.length > 0 ? selectedFields : undefined
        });
      }

      if (result?.success) {
        alert(
          `Successfully exported ${result.recordCount} records to ${result.filePath}`
        );
      }
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    }
  };

  const handleImport = async () => {
    try {
      const result = await importData(exportFormat);

      if (result?.success) {
        const message = [`Successfully imported ${result.recordCount} records`];

        if (result.warnings.length > 0) {
          message.push(`\n\nWarnings:\n${result.warnings.join('\n')}`);
        }

        if (result.errors.length > 0) {
          message.push(`\n\nErrors:\n${result.errors.join('\n')}`);
        }

        alert(message.join(''));
      }
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    }
  };

  const handleToggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handleSelectAllFields = () => {
    if (selectedFields.length === detectedFields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(detectedFields);
    }
  };

  const handleClose = () => {
    setMode('export');
    setFileName('');
    setSelectedFields([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Data Export/Import" size="lg">
      <div className="space-y-4">
        {/* Mode Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
          <div className="flex space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={mode === 'export'}
                onChange={() => setMode('export')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm">Export Data</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={mode === 'import'}
                onChange={() => setMode('import')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm">Import Data</span>
            </label>
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
          <div className="flex space-x-4">
            {(['CSV', 'JSON', 'XLSX'] as ExportFormat[]).map(format => (
              <label key={format} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={exportFormat === format}
                  onChange={() => setExportFormat(format)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm">{format}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Progress Indicator */}
        {(state.isExporting || state.isImporting) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <LoadingSpinner size="sm" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  {mode === 'export' ? 'Exporting' : 'Importing'} Data
                </p>
                <p className="text-xs text-blue-600">{state.progress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Export-Specific Options */}
        {mode === 'export' && (
          <>
            {/* File Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Name
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder={`data-export`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">
                  .{exportFormat.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Data Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-700">Records to Export:</span>{' '}
                  <span className="font-medium text-blue-800">{data.length}</span>
                </div>
                <div>
                  <span className="text-gray-700">Available Fields:</span>{' '}
                  <span className="font-medium text-blue-800">{detectedFields.length}</span>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={e => setIncludeHeaders(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">Include column headers</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={e => setIncludeMetadata(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm">Include metadata (export date, source, etc.)</span>
              </label>
            </div>

            {/* Field Selection */}
            {detectedFields.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Fields to Export
                  </label>
                  <button
                    onClick={handleSelectAllFields}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedFields.length === detectedFields.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {detectedFields.map(field => (
                      <label key={field} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(field)}
                          onChange={() => handleToggleField(field)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm truncate">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave all unchecked to export all fields
                </p>
              </div>
            )}
          </>
        )}

        {/* Import-Specific Options */}
        {mode === 'import' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Import Notice</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Importing will overwrite existing data. Make sure to backup your data before
                  proceeding.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Last Result */}
        {mode === 'export' && state.lastExport && (
          <div
            className={`border rounded-lg p-4 ${
              state.lastExport.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                state.lastExport.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {state.lastExport.success
                ? `✓ Exported ${state.lastExport.recordCount} records`
                : `✗ Export failed: ${state.lastExport.error}`}
            </p>
            {state.lastExport.filePath && (
              <p className="text-xs text-gray-600 mt-1">{state.lastExport.filePath}</p>
            )}
          </div>
        )}

        {mode === 'import' && state.lastImport && (
          <div
            className={`border rounded-lg p-4 ${
              state.lastImport.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                state.lastImport.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {state.lastImport.success
                ? `✓ Imported ${state.lastImport.recordCount} records`
                : `✗ Import failed`}
            </p>
            {state.lastImport.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-red-700 font-medium">Errors:</p>
                <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
                  {state.lastImport.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {state.lastImport.errors.length > 5 && (
                    <li>... and {state.lastImport.errors.length - 5} more</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          {mode === 'export' ? (
            <button
              onClick={handleExport}
              disabled={state.isExporting || data.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.isExporting ? 'Exporting...' : 'Export Data'}
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={state.isImporting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {state.isImporting ? 'Importing...' : 'Import Data'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

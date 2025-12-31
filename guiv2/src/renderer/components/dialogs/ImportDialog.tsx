/**
 * Import Dialog Component
 * File upload/drop zone with format selection and data preview
 */

import React, { useState, useRef, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Upload, File, AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from '../atoms/Button';
import { Select } from '../atoms/Select';

export interface ImportDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close dialog handler */
  onClose: () => void;
  /** Import handler - receives file and format */
  onImport: (file: File, format: string) => Promise<void>;
  /** Supported file formats */
  formats?: Array<{ value: string; label: string; extensions: string[] }>;
  /** Show data preview */
  showPreview?: boolean;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * Import Dialog Component
 */
const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  formats = [
    { value: 'csv', label: 'CSV', extensions: ['.csv'] },
    { value: 'json', label: 'JSON', extensions: ['.json'] },
    { value: 'excel', label: 'Excel', extensions: ['.xlsx', '.xls'] },
  ],
  showPreview = true,
  'data-cy': dataCy = 'import-dialog',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>(formats[0]?.value || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string>('');
  const [previewData, setPreviewData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const format = formats.find((f) => f.value === selectedFormat);
    if (!format) return false;

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!format.extensions.includes(extension)) {
      setError(`Invalid file type. Expected: ${format.extensions.join(', ')}`);
      return false;
    }

    // Max file size: 50MB
    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit');
      return false;
    }

    setError('');
    return true;
  };

  const loadPreview = async (file: File) => {
    if (!showPreview) return;

    try {
      const text = await file.text();
      // Show first 500 characters as preview
      setPreviewData(text.substring(0, 500));
    } catch (err) {
      console.error('Failed to load preview:', err);
    }
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      loadPreview(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [selectedFormat]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setError('');

    try {
      await onImport(selectedFile, selectedFormat);
      onClose();
      // Reset state
      setSelectedFile(null);
      setPreviewData('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50" data-cy={dataCy}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Import Data
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              data-cy="close-import-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <Select
              label="File Format"
              value={selectedFormat}
              onChange={setSelectedFormat}
              options={formats}
              data-cy="import-format-select"
            />

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
              data-cy="import-drop-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                accept={formats.find((f) => f.value === selectedFormat)?.extensions.join(',')}
              />

              {!selectedFile ? (
                <>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Drop file here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supported formats: {formats.find((f) => f.value === selectedFormat)?.extensions.join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Maximum file size: 50MB
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreviewData('');
                    }}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    data-cy="remove-file-btn"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Preview */}
            {showPreview && previewData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Preview
                </label>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-48 overflow-auto">
                  <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                    {previewData}
                    {previewData.length >= 500 && '\n...'}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={handleClose} data-cy="cancel-import-btn">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              loading={isImporting}
              data-cy="import-btn"
            >
              Import
            </Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImportDialog;



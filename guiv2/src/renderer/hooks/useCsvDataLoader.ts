/**
 * CSV Data Loader Hook
 *
 * Provides standardized CSV loading functionality for discovered data views
 * with error handling, validation, and local file restrictions.
 */

import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';

/**
 * CSV loading options
 */
export interface CsvLoaderOptions {
  /** Maximum file size in bytes (default: 50MB) */
  maxFileSize?: number;
  /** Maximum number of rows to load (default: 100,000) */
  maxRows?: number;
  /** Enable data transformation/validation */
  transform?: (data: any[]) => any[];
  /** Custom error handler */
  onError?: (error: Error) => void;
}

/**
 * CSV loader hook result
 */
export interface CsvLoaderResult<T> {
  /** Parsed data array */
  data: T[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Raw CSV text (for debugging) */
  rawCsv?: string;
  /** Reload function */
  reload: () => void;
}

/**
 * Load and parse CSV data from local file path
 *
 * Security: Only loads files from guiv2/public/discovery/ directory
 * Performance: Implements row limits and file size restrictions
 *
 * @param csvPath - Relative path to CSV file (e.g., 'aws/results.csv')
 * @param options - Loading options
 * @returns CSV loader result with data, loading, and error states
 */
export function useCsvDataLoader<T = any>(
  csvPath: string | null,
  options: CsvLoaderOptions = {}
): CsvLoaderResult<T> {
  const {
    maxFileSize = 50 * 1024 * 1024, // 50MB
    maxRows = 100000,
    transform,
    onError,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rawCsv, setRawCsv] = useState<string>();
  const [reloadCounter, setReloadCounter] = useState(0);

  const reload = useCallback(() => {
    setReloadCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!csvPath) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Validate path - only allow files in discovery directory
    if (csvPath.includes('..') || csvPath.startsWith('/') || csvPath.startsWith('\\')) {
      const err = new Error('Invalid CSV path: Path must be relative and within discovery directory');
      setError(err);
      onError?.(err);
      return;
    }

    const loadCsvData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construct safe file path (relative to public/discovery/)
        const safePath = `/discovery/${csvPath.replace(/^\/+/, '')}`;

        console.log(`[useCsvDataLoader] Loading CSV from: ${safePath}`);

        // Fetch CSV file
        const response = await fetch(safePath);

        if (!response.ok) {
          throw new Error(`Failed to load CSV: ${response.statusText} (${response.status})`);
        }

        // Check file size
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > maxFileSize) {
          throw new Error(`CSV file exceeds maximum size of ${maxFileSize / 1024 / 1024}MB`);
        }

        // Read CSV text
        const csvText = await response.text();
        setRawCsv(csvText);

        console.log(`[useCsvDataLoader] CSV loaded, size: ${csvText.length} bytes`);

        // Parse CSV with PapaParse
        Papa.parse<T>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => {
            // Preserve PascalCase from PowerShell output
            return header.trim();
          },
          complete: (results) => {
            console.log(`[useCsvDataLoader] Parsed ${results.data.length} rows`);

            // Check row limit
            if (results.data.length > maxRows) {
              console.warn(`[useCsvDataLoader] Row count ${results.data.length} exceeds limit ${maxRows}, truncating`);
              results.data = results.data.slice(0, maxRows);
            }

            // Apply transformation if provided
            let finalData = results.data;
            if (transform) {
              try {
                finalData = transform(results.data);
                console.log(`[useCsvDataLoader] Transformed data: ${finalData.length} rows`);
              } catch (transformError) {
                console.error('[useCsvDataLoader] Transform error:', transformError);
                throw new Error(`Data transformation failed: ${transformError instanceof Error ? transformError.message : 'Unknown error'}`);
              }
            }

            // Log parsing errors (non-fatal)
            if (results.errors.length > 0) {
              console.warn('[useCsvDataLoader] Parse warnings:', results.errors);
            }

            setData(finalData);
            setLoading(false);
          },
          error: (parseError) => {
            const err = new Error(`CSV parse error: ${parseError.message}`);
            console.error('[useCsvDataLoader] Parse error:', parseError);
            setError(err);
            setLoading(false);
            onError?.(err);
          },
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error loading CSV');
        console.error('[useCsvDataLoader] Load error:', error);
        setError(error);
        setLoading(false);
        onError?.(error);
      }
    };

    loadCsvData();
  }, [csvPath, maxFileSize, maxRows, transform, onError, reloadCounter]);

  return {
    data,
    loading,
    error,
    rawCsv,
    reload,
  };
}

/**
 * Validate CSV data against expected schema
 *
 * @param data - Parsed CSV data
 * @param requiredFields - Array of required field names
 * @returns Validation result
 */
export function validateCsvSchema(
  data: any[],
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  if (!data || data.length === 0) {
    return { valid: true, missingFields: [] };
  }

  const firstRow = data[0];
  const actualFields = Object.keys(firstRow);
  const missingFields = requiredFields.filter((field) => !actualFields.includes(field));

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

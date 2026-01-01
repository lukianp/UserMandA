/**
 * CSV Data Loader Hook
 *
 * Provides standardized CSV loading functionality for discovered data views
 * with error handling, validation, auto-refresh, and local file restrictions.
 *
 * Features:
 * - 30-second auto-refresh cycles (configurable)
 * - Exponential backoff retry on failure
 * - PascalCase-aware column generation
 * - Memory-efficient cleanup
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { ColDef } from 'ag-grid-community';
import { useProfileStore } from '../store/useProfileStore';

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
  /** Enable auto-refresh (default: true) */
  enableAutoRefresh?: boolean;
  /** Refresh interval in milliseconds (default: 30000 = 30 seconds) */
  refreshInterval?: number;
  /** Success callback */
  onSuccess?: (data: any[], columns: ColDef[]) => void;
  /** Return empty data instead of error for missing files (default: false) */
  gracefulDegradation?: boolean;
}

/**
 * CSV loader hook result
 */
export interface CsvLoaderResult<T> {
  /** Parsed data array */
  data: T[];
  /** AG Grid column definitions */
  columns: ColDef[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Raw CSV text (for debugging) */
  rawCsv?: string;
  /** Last refresh timestamp */
  lastRefresh: Date | null;
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
    enableAutoRefresh = true,
    refreshInterval = 120000, // 2 minutes - reduce server load
    onSuccess,
    gracefulDegradation = false,
  } = options;

  // Get current profile to determine data path
  const { selectedSourceProfile } = useProfileStore();

  const [data, setData] = useState<T[]>([]);
  const [columns, setColumns] = useState<ColDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rawCsv, setRawCsv] = useState<string>();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const isUnmountedRef = useRef(false);
  const mountCountRef = useRef(0);
  const lastMountTimeRef = useRef(0);
  const prevCsvPathRef = useRef<string | null>(null);
  const loadInProgressRef = useRef(false);

  const reload = useCallback(() => {
    retryCountRef.current = 0; // Reset retry count on manual reload
    setReloadCounter((c) => c + 1);
  }, []);

  // CRITICAL DEBUG: Track loading state changes
  useEffect(() => {
  }, [loading]);

  // CRITICAL DEBUG: Track data state changes
  useEffect(() => {
  }, [data]);

  useEffect(() => {
    mountCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastMount = now - lastMountTimeRef.current;


    lastMountTimeRef.current = now;
    isUnmountedRef.current = false;

    // CRITICAL: Reset loadInProgressRef on each mount to prevent stale state from React Strict Mode double-mount
    if (mountCountRef.current > 1 && loadInProgressRef.current) {
      loadInProgressRef.current = false;
    }

    if (!csvPath) {
      setData([]);
      setColumns([]);
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

    const loadCsvData = async (isRetry = false) => {
      if (loadInProgressRef.current || isUnmountedRef.current) {
        return;
      }

      loadInProgressRef.current = true;

      // CRITICAL: Check if unmounted BEFORE setting loading to true
      if (isUnmountedRef.current) {
        console.warn('[useCsvDataLoader] ⚠️  Component unmounted before setLoading, aborting');
        loadInProgressRef.current = false;
        return;
      }

      setLoading(true);

      if (!isRetry) {
        setError(null);
      }

      try {
        // Get base path from profile
        const basePath = selectedSourceProfile?.dataPath || 'C:\\DiscoveryData\\ljpops';
        const rawDir = `${basePath}\\Raw`;

        // Construct full file path
        const fullPath = `${rawDir}\\${csvPath.replace(/^\/+/, '')}`;

        // Read CSV file using Electron API
        // Check if file exists before reading (for graceful degradation)
        const fs = window.electronAPI.fs;
        const exists = await window.electronAPI.fileExists(fullPath);

        if (!exists) {
          if (gracefulDegradation) {
            if (!isUnmountedRef.current) {
              setData([]);
              setColumns([]);
              setLastRefresh(new Date());
              setError(null);
              setLoading(false);
              loadInProgressRef.current = false;
              onSuccess?.([], []);
            }
            return;
          } else {
            throw new Error(`Discovery data file not found: ${csvPath}`);
          }
        }

        // Read CSV file using Electron API (with graceful degradation for missing files)
        let csvText: string;
        try {
          csvText = await window.electronAPI.fs.readFile(fullPath, 'utf8');
        } catch (fileError: any) {
          // Handle file not found gracefully
          if (gracefulDegradation && fileError?.message?.includes('ENOENT')) {
            if (!isUnmountedRef.current) {
              setData([]);
              setColumns([]);
              setLastRefresh(new Date());
              setError(null);
              setLoading(false);
              loadInProgressRef.current = false;
              onSuccess?.([], []);
            }
            return;
          } else {
            throw new Error(`Discovery data file not found: ${csvPath}`);
          }
        }

        // CRITICAL: Check again after async operation
        if (isUnmountedRef.current) {
          console.warn('[useCsvDataLoader] ⚠️  Component unmounted after readFile, aborting');
          loadInProgressRef.current = false;
          return;
        }

        if (!csvText || csvText.length === 0) {
          throw new Error(`CSV file is empty: ${fullPath}`);
        }

        // Check file size
        if (csvText.length > maxFileSize) {
          throw new Error(`CSV file exceeds maximum size of ${maxFileSize / 1024 / 1024}MB`);
        }

        setRawCsv(csvText);

        // Parse CSV with PapaParse
        Papa.parse<T>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => {
            // Preserve PascalCase from PowerShell output
            return header.trim();
          },
          complete: (results: Papa.ParseResult<T>) => {
            if (isUnmountedRef.current) return;

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
              } catch (transformError) {
                console.error('[useCsvDataLoader] Transform error:', transformError);
                throw new Error(`Data transformation failed: ${transformError instanceof Error ? transformError.message : 'Unknown error'}`);
              }
            }

            // Generate AG Grid columns from CSV headers (CRITICAL: preserve PascalCase)
            const fields = results.meta.fields || [];
            const generatedColumns: ColDef[] = fields.map((field: string) => {
              // Convert PascalCase to readable header: "DisplayName" → "Display Name"
              const headerName = field
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .replace(/^./, (str: string) => str.toUpperCase());

              return {
                field: field, // CRITICAL: Keep original PascalCase field name
                headerName: headerName,
                sortable: true,
                filter: true,
                width: 150,
                resizable: true
              };
            });

            // Log parsing errors (non-fatal)
            if (results.errors.length > 0) {
              console.warn('[useCsvDataLoader] Parse warnings:', results.errors);
            }

            // CRITICAL: Update state in correct order to prevent race conditions
            if (!isUnmountedRef.current) {
              setData(finalData);
              setColumns(generatedColumns);
              setLastRefresh(new Date());
              setError(null);
              retryCountRef.current = 0;

              // CRITICAL: Set loading to false LAST and log it
              setLoading(false);
              loadInProgressRef.current = false;

              onSuccess?.(finalData, generatedColumns);
            } else {
              console.warn('[useCsvDataLoader] ⚠️  Component unmounted during parse, skipping state update');
            }
          },
          error: (parseError: Error) => {
            const err = new Error(`CSV parse error: ${parseError.message}`);
            console.error('[useCsvDataLoader] Parse error:', parseError);
            setError(err);
            setLoading(false);
            loadInProgressRef.current = false;
            onError?.(err);
          },
        });
      } catch (err) {
        if (isUnmountedRef.current) return;

        const error = err instanceof Error ? err : new Error('Unknown error loading CSV');
        console.error('[useCsvDataLoader] Load error:', error);
        setError(error);

        // Retry logic with exponential backoff
        if (!isRetry && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 5000);

          setTimeout(() => {
            if (!isUnmountedRef.current) {
              loadCsvData(true);
            }
          }, retryDelay);

          return;
        }

        setLoading(false);
        loadInProgressRef.current = false;
        onError?.(error);
      }
    };

    // Only load on first mount or when csvPath changes
    const shouldLoad = mountCountRef.current === 1 || csvPath !== prevCsvPathRef.current;
    prevCsvPathRef.current = csvPath;

    if (shouldLoad) {
      loadCsvData();
    } else {
      // CRITICAL: Ensure loading stays false when we skip the load
      setLoading(false);
    }

    // Setup auto-refresh ONLY on first mount
    if (enableAutoRefresh && mountCountRef.current === 1) {
      intervalRef.current = setInterval(() => {
        if (!isUnmountedRef.current && !loadInProgressRef.current) {
          loadCsvData();
        }
      }, refreshInterval);
    }

    // Cleanup on unmount
    return () => {
      isUnmountedRef.current = true;
      loadInProgressRef.current = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [csvPath, reloadCounter]); // MINIMAL dependencies to prevent loops

  return {
    data,
    columns,
    loading,
    error,
    rawCsv,
    lastRefresh,
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



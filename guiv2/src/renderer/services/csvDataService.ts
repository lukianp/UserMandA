/**
 * Enhanced CSV Data Service
 * Handles large CSV files with streaming, custom delimiters, and data type inference
 */

import Papa, { ParseConfig, ParseResult } from 'papaparse';

/**
 * CSV parsing options
 */
export interface CsvParseOptions {
  /** Custom delimiter (default: auto-detect) */
  delimiter?: string;
  /** First row contains headers */
  header?: boolean;
  /** Skip empty lines */
  skipEmptyLines?: boolean;
  /** Dynamically infer data types */
  dynamicTyping?: boolean;
  /** Character encoding (default: UTF-8) */
  encoding?: string;
  /** Transform function for each row */
  transform?: (value: string, field: string | number) => string | number | boolean | null | undefined;
  /** Progress callback for large files */
  onProgress?: (progress: number, rows: number) => void;
  /** Chunk size for streaming (default: 10000 rows) */
  chunkSize?: number;
}

/**
 * CSV export options
 */
export interface CsvExportOptions {
  /** Field delimiter (default: comma) */
  delimiter?: string;
  /** Quote character (default: double quote) */
  quotes?: boolean | string[];
  /** Include header row */
  header?: boolean;
  /** Line ending (default: \r\n) */
  newline?: string;
  /** Quote all fields */
  quoteAll?: boolean;
  /** Columns to export (null = all) */
  columns?: string[];
}

/**
 * Parsed CSV result with metadata
 */
export interface ParsedCsvData<T = Record<string, string | number | boolean | null>> {
  /** Parsed data rows */
  data: T[];
  /** Column headers */
  headers: string[];
  /** Detected delimiter */
  delimiter: string;
  /** Total rows processed */
  rowCount: number;
  /** Inferred column types */
  columnTypes: Record<string, 'string' | 'number' | 'boolean' | 'date'>;
  /** Parse errors */
  errors: Array<{ row: number; message: string }>;
}

/**
 * Enhanced CSV Data Service
 */
export class CsvDataService {
  private static instance: CsvDataService;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): CsvDataService {
    if (!CsvDataService.instance) {
      CsvDataService.instance = new CsvDataService();
    }
    return CsvDataService.instance;
  }

  /**
   * Parse CSV data from string
   * @param csvString CSV content as string
   * @param options Parsing options
   * @returns Parsed CSV data with metadata
   */
  async parseFromString<T = Record<string, string | number | boolean | null | undefined>>(
    csvString: string,
    options: CsvParseOptions = {}
  ): Promise<ParsedCsvData<T>> {
    return new Promise((resolve, reject) => {
      const parseConfig: ParseConfig = {
        delimiter: options.delimiter || '',
        header: options.header !== false,
        skipEmptyLines: options.skipEmptyLines !== false,
        dynamicTyping: options.dynamicTyping !== false,
        transform: options.transform,
        complete: (results: ParseResult<T>) => {
          try {
            const parsed = this.processParseResults(results, options);
            resolve(parsed);
          } catch (error: unknown) {
            reject(new Error(`CSV parse error: ${error instanceof Error ? error.message : String(error)}`));
          }
        },
        error: (error: Error) => {
          reject(new Error(`CSV parse error: ${error.message}`));
        },
      } as any; // TODO: Fix ParseConfig type to include error callback

      Papa.parse(csvString, parseConfig);
    });
  }

  /**
   * Parse CSV file with streaming for large files
   * @param file File object or path
   * @param options Parsing options
   * @returns Parsed CSV data with metadata
   */
  async parseFromFile<T = Record<string, string | number | boolean | null | undefined>>(
    file: File | string,
    options: CsvParseOptions = {}
  ): Promise<ParsedCsvData<T>> {
    return new Promise((resolve, reject) => {
      const allData: T[] = [];
      const errors: Array<{ row: number; message: string }> = [];
      let headers: string[] = [];
      let detectedDelimiter = ',';
      let rowCount = 0;

      const chunkSize = options.chunkSize || 10000;

      const parseConfig: ParseConfig = {
        delimiter: options.delimiter || '',
        header: options.header !== false,
        skipEmptyLines: options.skipEmptyLines !== false,
        dynamicTyping: options.dynamicTyping !== false,
        transform: options.transform,
        chunk: (results: ParseResult<T>, parser: Papa.Parser) => {
          // Collect data from chunk
          allData.push(...results.data);
          rowCount += results.data.length;

          // Extract headers from first chunk
          if (headers.length === 0 && results.meta.fields) {
            headers = results.meta.fields;
          }

          // Track delimiter
          if (results.meta.delimiter) {
            detectedDelimiter = results.meta.delimiter;
          }

          // Collect errors
          if (results.errors.length > 0) {
            errors.push(
              ...results.errors.map((err) => ({
                row: err.row || 0,
                message: err.message,
              }))
            );
          }

          // Report progress
          if (options.onProgress) {
            const progress = Math.min(100, (rowCount / 1000000) * 100); // Rough estimate
            options.onProgress(progress, rowCount);
          }
        },
        complete: () => {
          try {
            // Infer column types
            const columnTypes = this.inferColumnTypes(allData, headers);

            const parsed: ParsedCsvData<T> = {
              data: allData,
              headers,
              delimiter: detectedDelimiter,
              rowCount,
              columnTypes,
              errors,
            };

            resolve(parsed);
          } catch (error: any) {
            reject(new Error(`CSV processing error: ${error.message}`));
          }
        },
        error: (error: Error) => {
          reject(new Error(`CSV parse error: ${error.message}`));
        },
      } as any; // TODO: Fix ParseConfig type to include chunk and error callbacks

      // Parse file or string
      if (typeof file === 'string') {
        // File path - would need to read via Electron IPC
        reject(new Error('File path parsing not implemented. Use parseFromString with file content.'));
      } else {
        Papa.parse(file as any, parseConfig); // TODO: Fix Papa.parse to accept File type
      }
    });
  }

  /**
   * Parse CSV with auto-detection of delimiter and encoding
   * @param csvString CSV content
   * @param options Parsing options
   * @returns Parsed CSV data
   */
  async parseWithAutoDetection<T = Record<string, string | number | boolean | null | undefined>>(
    csvString: string,
    options: CsvParseOptions = {}
  ): Promise<ParsedCsvData<T>> {
    // Auto-detect delimiter
    const delimiter = this.detectDelimiter(csvString);

    return this.parseFromString<T>(csvString, {
      ...options,
      delimiter,
    });
  }

  /**
   * Detect delimiter from CSV sample
   * @param csvSample Sample of CSV data (first few lines)
   * @returns Detected delimiter
   */
  detectDelimiter(csvSample: string): string {
    const delimiters = [',', ';', '\t', '|'];
    const lines = csvSample.split('\n').slice(0, 5); // Use first 5 lines

    let bestDelimiter = ',';
    let maxConsistency = 0;

    for (const delimiter of delimiters) {
      const counts = lines.map((line) => line.split(delimiter).length);
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length;

      // Lower variance = more consistent = better delimiter
      const consistency = avg / (variance + 1);

      if (consistency > maxConsistency) {
        maxConsistency = consistency;
        bestDelimiter = delimiter;
      }
    }

    return bestDelimiter;
  }

  /**
   * Infer column data types from parsed data
   * @param data Parsed data rows
   * @param headers Column headers
   * @returns Map of column name to inferred type
   */
  private inferColumnTypes<T = Record<string, string | number | boolean | null | undefined>>(
    data: T[],
    headers: string[]
  ): Record<string, 'string' | 'number' | 'boolean' | 'date'> {
    const types: Record<string, 'string' | 'number' | 'boolean' | 'date'> = {};

    if (data.length === 0) {
      return types;
    }

    // Sample first 100 rows for type inference
    const sample = data.slice(0, 100);

    for (const header of headers) {
      let numberCount = 0;
      let booleanCount = 0;
      let dateCount = 0;
      let totalNonNull = 0;

      for (const row of sample) {
        const value = (row as Record<string, unknown>)[header];

        if (value === null || value === undefined || value === '') {
          continue;
        }

        totalNonNull++;

        // Check if number
        if (typeof value === 'number' || (!isNaN(Number(value)) && value !== '')) {
          numberCount++;
        }

        // Check if boolean
        if (
          value === true ||
          value === false ||
          value === 'true' ||
          value === 'false' ||
          value === 'TRUE' ||
          value === 'FALSE'
        ) {
          booleanCount++;
        }

        // Check if date
        if (this.isDateString(value)) {
          dateCount++;
        }
      }

      // Determine type based on majority
      if (totalNonNull === 0) {
        types[header] = 'string';
      } else if (booleanCount / totalNonNull > 0.8) {
        types[header] = 'boolean';
      } else if (numberCount / totalNonNull > 0.8) {
        types[header] = 'number';
      } else if (dateCount / totalNonNull > 0.8) {
        types[header] = 'date';
      } else {
        types[header] = 'string';
      }
    }

    return types;
  }

  /**
   * Check if string is a date
   */
  private isDateString(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    // Common date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
    ];

    if (!datePatterns.some((pattern) => pattern.test(value))) {
      return false;
    }

    const parsed = Date.parse(value);
    return !isNaN(parsed);
  }

  /**
   * Process Papa Parse results
   */
  private processParseResults<T = Record<string, string | number | boolean | null | undefined>>(
    results: ParseResult<T>,
    options: CsvParseOptions
  ): ParsedCsvData<T> {
    const headers = results.meta.fields || [];
    const delimiter = results.meta.delimiter || ',';
    const data = results.data;
    const errors = results.errors.map((err) => ({
      row: err.row || 0,
      message: err.message,
    }));

    const columnTypes = this.inferColumnTypes(data, headers);

    return {
      data,
      headers,
      delimiter,
      rowCount: data.length,
      columnTypes,
      errors,
    };
  }

  /**
   * Export data to CSV string
   * @param data Data to export
   * @param options Export options
   * @returns CSV string
   */
  exportToString<T = Record<string, string | number | boolean | null | undefined>>(data: T[], options: CsvExportOptions = {}): string {
    const delimiter = options.delimiter || ',';
    const newline = options.newline || '\r\n';
    const quoteAll = options.quoteAll || false;
    const includeHeader = options.header !== false;

    if (data.length === 0) {
      return '';
    }

    // Get columns
    const allColumns = Object.keys(data[0] as Record<string, unknown>);
    const columns = options.columns || allColumns;

    const lines: string[] = [];

    // Add header row
    if (includeHeader) {
      lines.push(this.formatCsvRow(columns, delimiter, quoteAll));
    }

    // Add data rows
    for (const row of data) {
      const values = columns.map((col) => (row as Record<string, unknown>)[col]);
      lines.push(this.formatCsvRow(values, delimiter, quoteAll));
    }

    return lines.join(newline);
  }

  /**
   * Format a CSV row with proper quoting
   */
  private formatCsvRow(values: unknown[], delimiter: string, quoteAll: boolean): string {
    return values
      .map((value) => {
        if (value === null || value === undefined) {
          return '';
        }

        const stringValue = String(value);

        // Quote if contains delimiter, quotes, or newlines, or if quoteAll is true
        const needsQuotes =
          quoteAll ||
          stringValue.includes(delimiter) ||
          stringValue.includes('"') ||
          stringValue.includes('\n') ||
          stringValue.includes('\r');

        if (needsQuotes) {
          // Escape double quotes by doubling them
          const escaped = stringValue.replace(/"/g, '""');
          return `"${escaped}"`;
        }

        return stringValue;
      })
      .join(delimiter);
  }

  /**
   * Export data to CSV file (via Electron IPC)
   * @param data Data to export
   * @param filePath File path to save
   * @param options Export options
   */
  async exportToFile<T = Record<string, string | number | boolean | null | undefined>>(
    data: T[],
    filePath: string,
    options: CsvExportOptions = {}
  ): Promise<void> {
    const csv = this.exportToString(data, options);

    // Would need to call Electron IPC to write file
    // For now, trigger download in browser
    if (typeof window !== 'undefined' && (window.electronAPI as any)?.saveFile) {
      await (window.electronAPI as any).saveFile(filePath, csv);
    } else {
      throw new Error('File export not available. Use exportToString and handle file write separately.');
    }
  }

  /**
   * Export data to CSV blob for download
   * @param data Data to export
   * @param options Export options
   * @returns Blob object
   */
  exportToBlob<T = Record<string, string | number | boolean | null | undefined>>(data: T[], options: CsvExportOptions = {}): Blob {
    const csv = this.exportToString(data, options);
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Trigger CSV download in browser
   * @param data Data to export
   * @param filename Download filename
   * @param options Export options
   */
  downloadCsv<T = Record<string, string | number | boolean | null | undefined>>(data: T[], filename: string, options: CsvExportOptions = {}): void {
    const blob = this.exportToBlob(data, options);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Validate CSV structure
   * @param data Parsed CSV data
   * @param requiredColumns Required column names
   * @returns Validation result
   */
  validateStructure<T = Record<string, string | number | boolean | null | undefined>>(
    data: ParsedCsvData<T>,
    requiredColumns: string[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required columns
    for (const col of requiredColumns) {
      if (!data.headers.includes(col)) {
        errors.push(`Missing required column: ${col}`);
      }
    }

    // Check for data
    if (data.rowCount === 0) {
      errors.push('CSV file contains no data rows');
    }

    // Check for parse errors
    if (data.errors.length > 0) {
      errors.push(`CSV contains ${data.errors.length} parse errors`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default CsvDataService.getInstance();

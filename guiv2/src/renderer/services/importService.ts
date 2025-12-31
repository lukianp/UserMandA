/**
 * Import Service
 * Multi-format import (CSV, Excel, JSON, XML, Text) with validation and field mapping
 */

import * as XLSX from 'xlsx';
import Papa from 'papaparse';

import csvDataService from './csvDataService';
import dataValidationService, { ValidationRule } from './dataValidationService';

/**
 * Import format
 */
export type ImportFormat = 'csv' | 'excel' | 'json' | 'xml' | 'text';

/**
 * Import options
 */
export interface ImportOptions {
  /** Expected format (auto-detect if not specified) */
  format?: ImportFormat;
  /** Field mapping (source -> destination) */
  fieldMapping?: Record<string, string>;
  /** Validation rules */
  validationRules?: ValidationRule[];
  /** Skip validation */
  skipValidation?: boolean;
  /** Preview mode (return first N rows) */
  preview?: boolean;
  /** Preview row count */
  previewRows?: number;
  /** Progress callback */
  onProgress?: (progress: number, message: string) => void;
}

/**
 * CSV import options
 */
export interface CsvImportOptions extends ImportOptions {
  /** Custom delimiter */
  delimiter?: string;
  /** Has header row */
  header?: boolean;
  /** Skip empty lines */
  skipEmptyLines?: boolean;
  /** Dynamic typing */
  dynamicTyping?: boolean;
}

/**
 * Excel import options
 */
export interface ExcelImportOptions extends ImportOptions {
  /** Sheet name or index to import */
  sheet?: string | number;
  /** Import all sheets */
  allSheets?: boolean;
}

/**
 * Text import options
 */
export interface TextImportOptions extends ImportOptions {
  /** Fixed-width field positions */
  fixedWidths?: number[];
  /** Field names */
  fieldNames?: string[];
}

/**
 * Import result
 */
export interface ImportResult<T = any> {
  /** Imported data */
  data: T[];
  /** Total rows imported */
  rowCount: number;
  /** Column headers */
  headers: string[];
  /** Validation errors */
  errors: Array<{ row: number; message: string }>;
  /** Warnings */
  warnings: Array<{ row: number; message: string }>;
  /** Import metadata */
  metadata: {
    format: ImportFormat;
    filename?: string;
    importedAt: Date;
    validationPassed: boolean;
  };
}

/**
 * Import preview result
 */
export interface ImportPreview<T = any> {
  /** Preview data */
  data: T[];
  /** Detected headers */
  headers: string[];
  /** Detected format */
  format: ImportFormat;
  /** Total estimated rows */
  estimatedRows: number;
  /** Sample from different parts of file */
  samples: T[];
}

/**
 * Import Service
 */
class ImportService {
  private static instance: ImportService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ImportService {
    if (!ImportService.instance) {
      ImportService.instance = new ImportService();
    }
    return ImportService.instance;
  }

  /**
   * Import data from file
   * @param file File object
   * @param options Import options
   * @returns Import result
   */
  async importFromFile<T = any>(file: File, options: ImportOptions = {}): Promise<ImportResult<T>> {
    const format = options.format || this.detectFormat(file.name);

    if (options.onProgress) {
      options.onProgress(10, 'Reading file...');
    }

    let data: any[];
    let headers: string[];

    switch (format) {
      case 'csv':
        ({ data, headers } = await this.importCSV(file, options as CsvImportOptions));
        break;
      case 'excel':
        ({ data, headers } = await this.importExcel(file, options as ExcelImportOptions));
        break;
      case 'json':
        ({ data, headers } = await this.importJSON(file, options));
        break;
      case 'xml':
        ({ data, headers } = await this.importXML(file, options));
        break;
      case 'text':
        ({ data, headers } = await this.importText(file, options as TextImportOptions));
        break;
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }

    if (options.onProgress) {
      options.onProgress(50, 'Processing data...');
    }

    // Apply field mapping
    if (options.fieldMapping) {
      data = this.applyFieldMapping(data, options.fieldMapping);
      headers = this.mapHeaders(headers, options.fieldMapping);
    }

    if (options.onProgress) {
      options.onProgress(70, 'Validating data...');
    }

    // Validate data
    const errors: Array<{ row: number; message: string }> = [];
    const warnings: Array<{ row: number; message: string }> = [];
    let validationPassed = true;

    if (!options.skipValidation && options.validationRules && options.validationRules.length > 0) {
      const validationResult = dataValidationService.validateDataset(data, options.validationRules);

      validationPassed = validationResult.valid;
      errors.push(...validationResult.errors.map((e) => ({ row: e.row || 0, message: e.message })));
      warnings.push(...validationResult.warnings.map((w) => ({ row: w.row || 0, message: w.message })));
    }

    if (options.onProgress) {
      options.onProgress(100, 'Import complete');
    }

    // Return preview if requested
    if (options.preview) {
      const previewCount = options.previewRows || 10;
      data = data.slice(0, previewCount);
    }

    return {
      data: data as T[],
      rowCount: data.length,
      headers,
      errors,
      warnings,
      metadata: {
        format,
        filename: file.name,
        importedAt: new Date(),
        validationPassed,
      },
    };
  }

  /**
   * Preview import without full processing
   * @param file File object
   * @param options Import options
   * @returns Import preview
   */
  async previewImport<T = any>(file: File, options: ImportOptions = {}): Promise<ImportPreview<T>> {
    const format = options.format || this.detectFormat(file.name);

    const previewResult = await this.importFromFile<T>(file, {
      ...options,
      preview: true,
      previewRows: 100,
      skipValidation: true,
    });

    // Get samples from different parts
    const samples: T[] = [];
    const sampleIndices = [0, Math.floor(previewResult.data.length / 2), previewResult.data.length - 1];

    for (const index of sampleIndices) {
      if (index >= 0 && index < previewResult.data.length) {
        samples.push(previewResult.data[index]);
      }
    }

    return {
      data: previewResult.data,
      headers: previewResult.headers,
      format,
      estimatedRows: previewResult.rowCount,
      samples,
    };
  }

  /**
   * Import CSV file
   */
  private async importCSV(file: File, options: CsvImportOptions = {}): Promise<{ data: any[]; headers: string[] }> {
    const result = await csvDataService.parseFromFile(file, {
      delimiter: options.delimiter,
      header: options.header !== false,
      skipEmptyLines: options.skipEmptyLines !== false,
      dynamicTyping: options.dynamicTyping !== false,
      onProgress: options.onProgress as any,
    });

    return {
      data: result.data,
      headers: result.headers,
    };
  }

  /**
   * Import Excel file
   */
  private async importExcel(
    file: File,
    options: ExcelImportOptions = {}
  ): Promise<{ data: any[]; headers: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });

          if (options.allSheets) {
            // Import all sheets
            const allData: any[] = [];
            const allHeaders: string[] = [];

            for (const sheetName of workbook.SheetNames) {
              const worksheet = workbook.Sheets[sheetName];
              const sheetData: any[] = XLSX.utils.sheet_to_json(worksheet);

              if (sheetData.length > 0) {
                // Add sheet name to each row
                const dataWithSheet = sheetData.map((row) => ({ ...row, _sheet: sheetName }));
                allData.push(...dataWithSheet);

                // Collect headers
                const sheetHeaders = Object.keys(sheetData[0]);
                for (const header of sheetHeaders) {
                  if (!allHeaders.includes(header)) {
                    allHeaders.push(header);
                  }
                }
              }
            }

            resolve({ data: allData, headers: allHeaders });
          } else {
            // Import single sheet
            const sheetName =
              typeof options.sheet === 'string'
                ? options.sheet
                : workbook.SheetNames[options.sheet || 0];

            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
              reject(new Error(`Sheet not found: ${sheetName}`));
              return;
            }

            const data: any[] = XLSX.utils.sheet_to_json(worksheet);
            const headers = data.length > 0 ? Object.keys(data[0]) : [];

            resolve({ data, headers });
          }
        } catch (error: any) {
          reject(new Error(`Failed to parse Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Import JSON file
   */
  private async importJSON(file: File, options: ImportOptions = {}): Promise<{ data: any[]; headers: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const json = JSON.parse(text);

          let data: any[];

          // Handle different JSON structures
          if (Array.isArray(json)) {
            data = json;
          } else if (typeof json === 'object' && json !== null) {
            // Try to find array in object
            const arrayKey = Object.keys(json).find((key) => Array.isArray(json[key]));
            if (arrayKey) {
              data = json[arrayKey];
            } else {
              // Treat single object as array with one item
              data = [json];
            }
          } else {
            reject(new Error('JSON file must contain an array or object'));
            return;
          }

          const headers = data.length > 0 ? Object.keys(data[0]) : [];

          resolve({ data, headers });
        } catch (error: any) {
          reject(new Error(`Failed to parse JSON file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read JSON file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Import XML file
   */
  private async importXML(file: File, options: ImportOptions = {}): Promise<{ data: any[]; headers: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, 'text/xml');

          // Check for parse errors
          const parserError = xmlDoc.querySelector('parsererror');
          if (parserError) {
            reject(new Error('Invalid XML file'));
            return;
          }

          // Find data rows (assume first repeating element)
          const rootElement = xmlDoc.documentElement;
          const firstChild = rootElement.firstElementChild;

          if (!firstChild) {
            reject(new Error('XML file contains no data'));
            return;
          }

          const rowElements = rootElement.querySelectorAll(firstChild.tagName);
          const data: any[] = [];

          for (const rowElement of Array.from(rowElements)) {
            const row: any = {};

            for (const child of Array.from(rowElement.children)) {
              row[child.tagName] = child.textContent;
            }

            data.push(row);
          }

          const headers = data.length > 0 ? Object.keys(data[0]) : [];

          resolve({ data, headers });
        } catch (error: any) {
          reject(new Error(`Failed to parse XML file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read XML file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Import fixed-width text file
   */
  private async importText(file: File, options: TextImportOptions = {}): Promise<{ data: any[]; headers: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter((line) => line.trim());

          if (lines.length === 0) {
            reject(new Error('Text file contains no data'));
            return;
          }

          const data: any[] = [];
          const fieldNames = options.fieldNames || [];

          if (options.fixedWidths) {
            // Fixed-width parsing
            for (const line of lines) {
              const row: any = {};
              let position = 0;

              for (let i = 0; i < options.fixedWidths.length; i++) {
                const width = options.fixedWidths[i];
                const value = line.substr(position, width).trim();
                const fieldName = fieldNames[i] || `field_${i + 1}`;

                row[fieldName] = value;
                position += width;
              }

              data.push(row);
            }
          } else {
            // Try to parse as delimited (tab-separated)
            const delimiter = '\t';

            for (const line of lines) {
              const values = line.split(delimiter);
              const row: any = {};

              for (let i = 0; i < values.length; i++) {
                const fieldName = fieldNames[i] || `field_${i + 1}`;
                row[fieldName] = values[i].trim();
              }

              data.push(row);
            }
          }

          const headers = data.length > 0 ? Object.keys(data[0]) : [];

          resolve({ data, headers });
        } catch (error: any) {
          reject(new Error(`Failed to parse text file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read text file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Detect format from filename
   */
  private detectFormat(filename: string): ImportFormat {
    const ext = filename.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'csv':
        return 'csv';
      case 'xlsx':
      case 'xls':
        return 'excel';
      case 'json':
        return 'json';
      case 'xml':
        return 'xml';
      case 'txt':
        return 'text';
      default:
        return 'csv'; // Default to CSV
    }
  }

  /**
   * Apply field mapping to data
   */
  private applyFieldMapping(data: any[], mapping: Record<string, string>): any[] {
    return data.map((row) => {
      const mapped: any = {};

      for (const [sourceField, targetField] of Object.entries(mapping)) {
        if (sourceField in row) {
          mapped[targetField] = row[sourceField];
        }
      }

      // Include unmapped fields
      for (const key of Object.keys(row)) {
        if (!(key in mapping)) {
          mapped[key] = row[key];
        }
      }

      return mapped;
    });
  }

  /**
   * Map headers using field mapping
   */
  private mapHeaders(headers: string[], mapping: Record<string, string>): string[] {
    return headers.map((header) => mapping[header] || header);
  }

  /**
   * Validate import file before processing
   * @param file File to validate
   * @returns Validation result
   */
  async validateFile(file: File): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(`File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB (max: 100 MB)`);
    }

    // Check file extension
    const format = this.detectFormat(file.name);
    const validFormats: ImportFormat[] = ['csv', 'excel', 'json', 'xml', 'text'];

    if (!validFormats.includes(format)) {
      errors.push(`Unsupported file format: ${format}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get available field mappings from preview
   * @param preview Import preview
   * @param targetSchema Target schema (expected fields)
   * @returns Suggested field mapping
   */
  suggestFieldMapping(preview: ImportPreview, targetSchema: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};

    for (const sourceField of preview.headers) {
      // Try exact match
      if (targetSchema.includes(sourceField)) {
        mapping[sourceField] = sourceField;
        continue;
      }

      // Try case-insensitive match
      const lowerSource = sourceField.toLowerCase();
      const match = targetSchema.find((target) => target.toLowerCase() === lowerSource);

      if (match) {
        mapping[sourceField] = match;
        continue;
      }

      // Try partial match
      const partialMatch = targetSchema.find((target) =>
        target.toLowerCase().includes(lowerSource) || lowerSource.includes(target.toLowerCase())
      );

      if (partialMatch) {
        mapping[sourceField] = partialMatch;
      }
    }

    return mapping;
  }
}

export default ImportService.getInstance();



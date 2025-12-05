/**
 * Data Export/Import Service
 *
 * Handles exporting discovery data to various formats (CSV, JSON, XLSX)
 * and importing data for migration or analysis.
 *
 * Pattern from GUI/Services/ExportService.cs
 */

import * as fs from 'fs';
import * as path from 'path';

export type ExportFormat = 'CSV' | 'JSON' | 'XLSX';

export interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  includeMetadata: boolean;
  filterFields?: string[];
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  recordCount?: number;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  recordCount?: number;
  errors: string[];
  warnings: string[];
}

/**
 * Data Export/Import Service
 */
export class DataExportImportService {
  /**
   * Export data to CSV format
   */
  async exportToCSV(data: any[], filePath: string, options?: ExportOptions): Promise<ExportResult> {
    try {
      console.log(`[DataExport] Exporting ${data.length} records to CSV: ${filePath}`);

      if (data.length === 0) {
        return { success: false, error: 'No data to export' };
      }

      // Get headers from first record
      const headers = options?.filterFields || Object.keys(data[0]);

      // Build CSV content
      const rows: string[] = [];

      // Add headers
      if (options?.includeHeaders !== false) {
        rows.push(headers.map(h => this.escapeCSV(h)).join(','));
      }

      // Add data rows
      for (const record of data) {
        const values = headers.map(header => {
          const value = this.getNestedValue(record, header);
          return this.escapeCSV(this.formatValue(value));
        });
        rows.push(values.join(','));
      }

      // Write to file
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, rows.join('\n'), 'utf8');

      console.log(`[DataExport] Successfully exported to CSV: ${filePath}`);
      return { success: true, filePath, recordCount: data.length };
    } catch (error: any) {
      console.error(`[DataExport] CSV export failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export data to JSON format
   */
  async exportToJSON(data: any[], filePath: string, options?: ExportOptions): Promise<ExportResult> {
    try {
      console.log(`[DataExport] Exporting ${data.length} records to JSON: ${filePath}`);

      // Filter fields if specified
      let exportData = data;
      if (options?.filterFields && options.filterFields.length > 0) {
        exportData = data.map(record => {
          const filtered: any = {};
          options.filterFields.forEach(field => {
            filtered[field] = this.getNestedValue(record, field);
          });
          return filtered;
        });
      }

      // Build export object
      const exportObject: any = {
        data: exportData,
        recordCount: data.length
      };

      // Add metadata if requested
      if (options?.includeMetadata) {
        exportObject.metadata = {
          exportDate: new Date().toISOString(),
          version: '2.0.0',
          source: 'M&A Discovery Suite'
        };
      }

      // Write to file
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
      await fs.promises.writeFile(filePath, JSON.stringify(exportObject, null, 2), 'utf8');

      console.log(`[DataExport] Successfully exported to JSON: ${filePath}`);
      return { success: true, filePath, recordCount: data.length };
    } catch (error: any) {
      console.error(`[DataExport] JSON export failed:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import data from CSV file
   */
  async importFromCSV(filePath: string): Promise<ImportResult> {
    try {
      console.log(`[DataImport] Importing from CSV: ${filePath}`);

      const content = await fs.promises.readFile(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());

      if (lines.length === 0) {
        return { success: false, errors: ['File is empty'], warnings: [] };
      }

      // Parse headers
      const headers = this.parseCSVLine(lines[0]);

      // Parse data rows
      const records: any[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);

          if (values.length !== headers.length) {
            warnings.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
            continue;
          }

          const record: any = {};
          headers.forEach((header, index) => {
            record[header] = values[index];
          });

          records.push(record);
        } catch (error: any) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        }
      }

      console.log(`[DataImport] Successfully imported ${records.length} records from CSV`);
      return {
        success: true,
        recordCount: records.length,
        errors,
        warnings
      };
    } catch (error: any) {
      console.error(`[DataImport] CSV import failed:`, error);
      return { success: false, errors: [error.message], warnings: [] };
    }
  }

  /**
   * Import data from JSON file
   */
  async importFromJSON(filePath: string): Promise<ImportResult> {
    try {
      console.log(`[DataImport] Importing from JSON: ${filePath}`);

      const content = await fs.promises.readFile(filePath, 'utf8');
      const parsed = JSON.parse(content);

      // Handle different JSON structures
      let data: any[];
      if (Array.isArray(parsed)) {
        data = parsed;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        data = parsed.data;
      } else {
        return {
          success: false,
          errors: ['Invalid JSON structure: expected array or object with "data" property'],
          warnings: []
        };
      }

      console.log(`[DataImport] Successfully imported ${data.length} records from JSON`);
      return {
        success: true,
        recordCount: data.length,
        errors: [],
        warnings: []
      };
    } catch (error: any) {
      console.error(`[DataImport] JSON import failed:`, error);
      return { success: false, errors: [error.message], warnings: [] };
    }
  }

  /**
   * Escape CSV field value
   */
  private escapeCSV(value: string): string {
    if (!value) return '';

    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }

  /**
   * Parse CSV line respecting quoted values
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        // Check if it's an escaped quote
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add last value
    values.push(current);

    return values;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let value = obj;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return null;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Format value for export
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }
}

// Singleton instance
let dataExportImportService: DataExportImportService | null = null;

export function getDataExportImportService(): DataExportImportService {
  if (!dataExportImportService) {
    dataExportImportService = new DataExportImportService();
  }
  return dataExportImportService;
}

export default DataExportImportService;

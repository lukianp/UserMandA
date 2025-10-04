/**
 * Enhanced Export Service
 * Multi-format export (CSV, Excel, PDF, JSON, XML, HTML) with templates and progress tracking
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export format
 */
export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf' | 'xml' | 'html';

/**
 * Export options
 */
export interface ExportOptions {
  /** Selected columns to export (null = all) */
  columns?: string[];
  /** Column headers (override default field names) */
  headers?: Record<string, string>;
  /** Include header row */
  includeHeaders?: boolean;
  /** Custom filename */
  filename?: string;
  /** Progress callback */
  onProgress?: (progress: number) => void;
}

/**
 * CSV export options
 */
export interface CsvExportOptions extends ExportOptions {
  /** Field delimiter */
  delimiter?: string;
  /** Line ending */
  lineEnding?: '\n' | '\r\n';
  /** Quote all fields */
  quoteAll?: boolean;
}

/**
 * Excel export options
 */
export interface ExcelExportOptions extends ExportOptions {
  /** Sheet name */
  sheetName?: string;
  /** Multiple sheets */
  sheets?: Array<{ name: string; data: any[] }>;
  /** Auto-size columns */
  autoSize?: boolean;
  /** Freeze header row */
  freezeHeader?: boolean;
}

/**
 * PDF export options
 */
export interface PdfExportOptions extends ExportOptions {
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
  /** Title */
  title?: string;
  /** Include page numbers */
  pageNumbers?: boolean;
  /** Font size */
  fontSize?: number;
}

/**
 * Export template
 */
export interface ExportTemplate {
  id: string;
  name: string;
  format: ExportFormat;
  options: ExportOptions;
}

/**
 * Enhanced Export Service
 */
class ExportService {
  private templates: Map<string, ExportTemplate> = new Map();

  /**
   * Export data to specified format
   * @param data Data to export
   * @param format Export format
   * @param options Export options
   */
  async export(data: any[], format: ExportFormat, options: ExportOptions = {}): Promise<void> {
    const filename = options.filename || `export_${Date.now()}`;

    switch (format) {
      case 'csv':
        return this.exportToCSV(data, filename, options as CsvExportOptions);
      case 'excel':
        return this.exportToExcel(data, filename, options as ExcelExportOptions);
      case 'json':
        return this.exportToJSON(data, filename, options);
      case 'pdf':
        return this.exportToPDF(data, filename, options as PdfExportOptions);
      case 'xml':
        return this.exportToXML(data, filename, options);
      case 'html':
        return this.exportToHTML(data, filename, options);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export data to CSV
   */
  async exportToCSV(data: any[], filename: string, options: CsvExportOptions = {}): Promise<void> {
    const csv = this.convertToCSV(data, options);
    this.downloadBlob(csv, `${filename}.csv`, 'text/csv;charset=utf-8');

    if (options.onProgress) {
      options.onProgress(100);
    }
  }

  /**
   * Export data to Excel with enhanced features
   */
  async exportToExcel(data: any[], filename: string, options: ExcelExportOptions = {}): Promise<void> {
    const workbook = XLSX.utils.book_new();

    if (options.sheets && options.sheets.length > 0) {
      // Multiple sheets
      for (const sheet of options.sheets) {
        const ws = this.createWorksheet(sheet.data, options);
        XLSX.utils.book_append_sheet(workbook, ws, sheet.name);
      }
    } else {
      // Single sheet
      const ws = this.createWorksheet(data, options);
      const sheetName = options.sheetName || 'Sheet1';
      XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    }

    // Write file
    XLSX.writeFile(workbook, `${filename}.xlsx`);

    if (options.onProgress) {
      options.onProgress(100);
    }
  }

  /**
   * Create Excel worksheet
   */
  private createWorksheet(data: any[], options: ExcelExportOptions): XLSX.WorkSheet {
    const filtered = this.filterColumns(data, options);
    const ws = XLSX.utils.json_to_sheet(filtered, {
      header: options.columns,
      skipHeader: !options.includeHeaders,
    });

    // Auto-size columns
    if (options.autoSize) {
      const colWidths = this.calculateColumnWidths(filtered);
      ws['!cols'] = colWidths.map((width) => ({ wch: width }));
    }

    // Freeze header row
    if (options.freezeHeader && options.includeHeaders !== false) {
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };
    }

    return ws;
  }

  /**
   * Calculate optimal column widths
   */
  private calculateColumnWidths(data: any[]): number[] {
    if (data.length === 0) return [];

    const keys = Object.keys(data[0]);
    const widths = keys.map((key) => {
      const values = data.map((row) => String(row[key] || ''));
      const maxLength = Math.max(key.length, ...values.map((v) => v.length));
      return Math.min(maxLength + 2, 50); // Cap at 50 characters
    });

    return widths;
  }

  /**
   * Export data to JSON
   */
  async exportToJSON(data: any[], filename: string, options: ExportOptions = {}): Promise<void> {
    const filtered = this.filterColumns(data, options);
    const json = JSON.stringify(filtered, null, 2);
    this.downloadBlob(json, `${filename}.json`, 'application/json');

    if (options.onProgress) {
      options.onProgress(100);
    }
  }

  /**
   * Export data to PDF with tables
   */
  async exportToPDF(data: any[], filename: string, options: PdfExportOptions = {}): Promise<void> {
    const orientation = options.orientation || 'portrait';
    const doc = new jsPDF({ orientation, unit: 'pt' });

    // Add title
    if (options.title) {
      doc.setFontSize(16);
      doc.text(options.title, 40, 40);
    }

    // Prepare table data
    const filtered = this.filterColumns(data, options);
    const columns = options.columns || Object.keys(filtered[0] || {});
    const headers = columns.map((col) => options.headers?.[col] || col);

    const rows = filtered.map((row) => columns.map((col) => String(row[col] || '')));

    // Add table
    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: options.title ? 60 : 40,
      theme: 'grid',
      styles: {
        fontSize: options.fontSize || 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      didDrawPage: (data: any) => {
        // Add page numbers
        if (options.pageNumbers !== false) {
          const pageCount = doc.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          doc.setFontSize(10);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            data.settings.margin.left,
            pageHeight - 10
          );
        }
      },
    });

    // Save PDF
    doc.save(`${filename}.pdf`);

    if (options.onProgress) {
      options.onProgress(100);
    }
  }

  /**
   * Export data to XML
   */
  async exportToXML(data: any[], filename: string, options: ExportOptions = {}): Promise<void> {
    const filtered = this.filterColumns(data, options);
    const xml = this.convertToXML(filtered);
    this.downloadBlob(xml, `${filename}.xml`, 'application/xml');

    if (options.onProgress) {
      options.onProgress(100);
    }
  }

  /**
   * Export data to HTML table
   */
  async exportToHTML(data: any[], filename: string, options: ExportOptions = {}): Promise<void> {
    const filtered = this.filterColumns(data, options);
    const html = this.convertToHTML(filtered, options);
    this.downloadBlob(html, `${filename}.html`, 'text/html');

    if (options.onProgress) {
      options.onProgress(100);
    }
  }

  /**
   * Convert data to CSV string
   */
  private convertToCSV(data: any[], options: CsvExportOptions = {}): string {
    if (data.length === 0) return '';

    const filtered = this.filterColumns(data, options);
    const delimiter = options.delimiter || ',';
    const lineEnding = options.lineEnding || '\r\n';
    const quoteAll = options.quoteAll || false;

    const columns = options.columns || Object.keys(filtered[0]);
    const headers = columns.map((col) => options.headers?.[col] || col);

    const lines: string[] = [];

    // Add header row
    if (options.includeHeaders !== false) {
      lines.push(this.formatCSVRow(headers, delimiter, quoteAll));
    }

    // Add data rows
    for (const row of filtered) {
      const values = columns.map((col) => row[col]);
      lines.push(this.formatCSVRow(values, delimiter, quoteAll));
    }

    return lines.join(lineEnding);
  }

  /**
   * Format CSV row with proper quoting
   */
  private formatCSVRow(values: any[], delimiter: string, quoteAll: boolean): string {
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
          const escaped = stringValue.replace(/"/g, '""');
          return `"${escaped}"`;
        }

        return stringValue;
      })
      .join(delimiter);
  }

  /**
   * Convert data to XML string
   */
  private convertToXML(data: any[]): string {
    const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', '<data>'];

    for (const row of data) {
      lines.push('  <row>');
      for (const [key, value] of Object.entries(row)) {
        const escaped = this.escapeXML(String(value || ''));
        lines.push(`    <${key}>${escaped}</${key}>`);
      }
      lines.push('  </row>');
    }

    lines.push('</data>');
    return lines.join('\n');
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Convert data to HTML table
   */
  private convertToHTML(data: any[], options: ExportOptions = {}): string {
    const columns = options.columns || Object.keys(data[0] || {});
    const headers = columns.map((col) => options.headers?.[col] || col);

    const lines: string[] = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <title>Export</title>',
      '  <style>',
      '    table { border-collapse: collapse; width: 100%; }',
      '    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }',
      '    th { background-color: #4CAF50; color: white; }',
      '    tr:nth-child(even) { background-color: #f2f2f2; }',
      '  </style>',
      '</head>',
      '<body>',
      '  <table>',
    ];

    // Add header row
    if (options.includeHeaders !== false) {
      lines.push('    <thead>');
      lines.push('      <tr>');
      for (const header of headers) {
        lines.push(`        <th>${this.escapeHTML(header)}</th>`);
      }
      lines.push('      </tr>');
      lines.push('    </thead>');
    }

    // Add data rows
    lines.push('    <tbody>');
    for (const row of data) {
      lines.push('      <tr>');
      for (const col of columns) {
        const value = row[col] || '';
        lines.push(`        <td>${this.escapeHTML(String(value))}</td>`);
      }
      lines.push('      </tr>');
    }
    lines.push('    </tbody>');

    lines.push('  </table>');
    lines.push('</body>');
    lines.push('</html>');

    return lines.join('\n');
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Filter columns based on options
   */
  private filterColumns(data: any[], options: ExportOptions): any[] {
    if (!options.columns) {
      return data;
    }

    return data.map((row) => {
      const filtered: any = {};
      for (const col of options.columns!) {
        if (col in row) {
          filtered[col] = row[col];
        }
      }
      return filtered;
    });
  }

  /**
   * Download blob as file
   */
  private downloadBlob(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
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
   * Save export template
   */
  saveTemplate(template: Omit<ExportTemplate, 'id'>): ExportTemplate {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullTemplate: ExportTemplate = { ...template, id };
    this.templates.set(id, fullTemplate);
    return fullTemplate;
  }

  /**
   * Get export template
   */
  getTemplate(id: string): ExportTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get all templates
   */
  getTemplates(): ExportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  /**
   * Export using template
   */
  async exportWithTemplate(data: any[], templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Export template not found: ${templateId}`);
    }

    return this.export(data, template.format, template.options);
  }
}

export default new ExportService();

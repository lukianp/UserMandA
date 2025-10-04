/**
 * Export Service
 * Multi-format export (CSV, Excel, PDF, JSON)
 */

import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

class ExportService {
  /**
   * Export data to CSV
   */
  async exportToCSV(data: any[], filename: string): Promise<void> {
    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${filename}.csv`);
  }

  /**
   * Export data to Excel
   */
  async exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1'): Promise<void> {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  /**
   * Export data to JSON
   */
  async exportToJSON(data: any, filename: string): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `${filename}.json`);
  }

  /**
   * Export data to PDF (basic implementation)
   */
  async exportToPDF(data: any[], filename: string): Promise<void> {
    // Would integrate with jsPDF or similar
    console.log('PDF export not yet implemented');
    throw new Error('PDF export requires jsPDF integration');
  }

  /**
   * Convert array of objects to CSV string
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        const escaped = ('' + value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

export default new ExportService();

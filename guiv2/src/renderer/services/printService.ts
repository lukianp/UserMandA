/**
 * Print Service
 * Handles printing of views, data grids, and reports
 * Supports print preview, PDF export, and custom templates
 */

import { PrintOptions, PrintTemplate, PrintMargins } from '../types/uiux';

/**
 * Print Service Class
 */
class PrintService {
  private templates: Map<string, PrintTemplate> = new Map();
  private currentPrintWindow: Window | null = null;

  constructor() {
    this.loadTemplates();
    this.registerDefaultTemplates();
  }

  // ========================================
  // Print Operations
  // ========================================

  /**
   * Print current view
   */
  async printView(
    content: HTMLElement | string,
    options: PrintOptions = {}
  ): Promise<void> {
    const html = this.generatePrintHTML(content, options);

    // Create print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Failed to open print window. Popup blocker may be enabled.');
    }

    this.currentPrintWindow = printWindow;

    // Write content
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load
    await new Promise<void>((resolve) => {
      printWindow.onload = () => {
        // Give browser time to render
        setTimeout(() => {
          printWindow.print();
          resolve();
        }, 250);
      };
    });

    // Close window after printing (user can cancel)
    printWindow.onafterprint = () => {
      printWindow.close();
      this.currentPrintWindow = null;
    };
  }

  /**
   * Print data grid
   */
  async printDataGrid(
    data: any[],
    columns: string[],
    options: PrintOptions = {}
  ): Promise<void> {
    const tableHTML = this.generateTableHTML(data, columns, options);
    await this.printView(tableHTML, options);
  }

  /**
   * Export to PDF (uses browser's print to PDF)
   */
  async exportToPDF(
    content: HTMLElement | string,
    options: PrintOptions = {}
  ): Promise<void> {
    // Browser will show print dialog with PDF option
    await this.printView(content, options);
  }

  /**
   * Show print preview
   */
  async showPrintPreview(
    content: HTMLElement | string,
    options: PrintOptions = {}
  ): Promise<void> {
    const html = this.generatePrintHTML(content, options);

    // Create preview window
    const previewWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!previewWindow) {
      throw new Error('Failed to open preview window. Popup blocker may be enabled.');
    }

    // Add preview controls
    const previewHTML = `
      ${html.replace('</head>', `
        <style>
          .print-preview-controls {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #333;
            color: white;
            padding: 12px;
            display: flex;
            gap: 12px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          .print-preview-controls button {
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          .print-preview-controls button:hover {
            background: #0056b3;
          }
          .print-content {
            margin-top: 60px;
          }
          @media print {
            .print-preview-controls {
              display: none;
            }
            .print-content {
              margin-top: 0;
            }
          }
        </style>
      </head>`)}
    `.replace('<body>', `<body>
      <div class="print-preview-controls">
        <button onclick="window.print()">Print</button>
        <button onclick="window.close()">Close</button>
      </div>
      <div class="print-content">
    `).replace('</body>', '</div></body>');

    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
  }

  // ========================================
  // HTML Generation
  // ========================================

  /**
   * Generate complete print HTML
   */
  private generatePrintHTML(content: HTMLElement | string, options: PrintOptions): string {
    const contentHTML = typeof content === 'string' ? content : content.outerHTML;

    const styles = this.generatePrintStyles(options);
    const header = options.includeHeader ? this.generateHeader(options) : '';
    const footer = options.includeFooter ? this.generateFooter(options) : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${options.title || 'Print'}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${header}
        <div class="print-content">
          ${contentHTML}
        </div>
        ${footer}
      </body>
      </html>
    `;
  }

  /**
   * Generate table HTML for data grid
   */
  private generateTableHTML(
    data: any[],
    columns: string[],
    options: PrintOptions
  ): string {
    const selectedColumns = options.columns || columns;

    const thead = `
      <thead>
        <tr>
          ${selectedColumns.map((col) => `<th>${this.formatColumnName(col)}</th>`).join('')}
        </tr>
      </thead>
    `;

    const tbody = `
      <tbody>
        ${data
          .map(
            (row) => `
          <tr>
            ${selectedColumns.map((col) => `<td>${this.formatCellValue(row[col])}</td>`).join('')}
          </tr>
        `
          )
          .join('')}
      </tbody>
    `;

    return `
      <table class="data-grid-print">
        ${thead}
        ${tbody}
      </table>
    `;
  }

  /**
   * Generate print styles
   */
  private generatePrintStyles(options: PrintOptions): string {
    const margins = options.margins || {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
      unit: 'mm',
    };

    return `
      @page {
        size: ${options.paperSize || 'A4'} ${options.orientation || 'portrait'};
        margin: ${margins.top}${margins.unit} ${margins.right}${margins.unit} ${margins.bottom}${margins.unit} ${margins.left}${margins.unit};
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000;
        background: white;
      }

      .print-header {
        text-align: center;
        border-bottom: 2px solid #333;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }

      .print-header h1 {
        margin: 0;
        font-size: 20pt;
      }

      .print-footer {
        text-align: center;
        border-top: 1px solid #999;
        padding-top: 10px;
        margin-top: 20px;
        font-size: 10pt;
        color: #666;
      }

      .print-content {
        page-break-inside: avoid;
      }

      .data-grid-print {
        width: 100%;
        border-collapse: collapse;
        font-size: 10pt;
      }

      .data-grid-print th {
        background: #f0f0f0;
        font-weight: bold;
        text-align: left;
        padding: 8px;
        border: 1px solid #ddd;
      }

      .data-grid-print td {
        padding: 6px 8px;
        border: 1px solid #ddd;
      }

      .data-grid-print tr:nth-child(even) {
        background: #f9f9f9;
      }

      /* Prevent orphan headers */
      table thead {
        display: table-header-group;
      }

      table tbody {
        display: table-row-group;
      }

      /* Page breaks */
      .page-break {
        page-break-after: always;
      }

      .avoid-break {
        page-break-inside: avoid;
      }

      /* Hide elements not needed in print */
      .no-print {
        display: none !important;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
        }
      }
    `;
  }

  /**
   * Generate header HTML
   */
  private generateHeader(options: PrintOptions): string {
    const content = options.headerContent || options.title || 'Enterprise Discovery & Migration Suite';

    return `
      <div class="print-header">
        <h1>${content}</h1>
        <div class="print-date">${new Date().toLocaleDateString()}</div>
      </div>
    `;
  }

  /**
   * Generate footer HTML
   */
  private generateFooter(options: PrintOptions): string {
    const content = options.footerContent || 'Enterprise Discovery & Migration Suite';
    const pageNumbers = options.pageNumbers
      ? '<span class="page-number">Page <span class="page"></span> of <span class="pages"></span></span>'
      : '';

    return `
      <div class="print-footer">
        <div>${content}</div>
        ${pageNumbers}
      </div>
    `;
  }

  // ========================================
  // Templates
  // ========================================

  /**
   * Get all templates
   */
  getTemplates(): PrintTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): PrintTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get templates for a view
   */
  getTemplatesForView(viewType: string): PrintTemplate[] {
    return this.getTemplates().filter((t) => t.viewType === viewType);
  }

  /**
   * Save template
   */
  saveTemplate(template: PrintTemplate): void {
    this.templates.set(template.id, template);
    this.saveTemplatesToStorage();
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): void {
    this.templates.delete(id);
    this.saveTemplatesToStorage();
  }

  /**
   * Apply template
   */
  async printWithTemplate(
    content: HTMLElement | string,
    templateId: string
  ): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    await this.printView(content, template.options);
  }

  /**
   * Register default templates
   */
  private registerDefaultTemplates(): void {
    // Default data grid template
    this.templates.set('default-grid', {
      id: 'default-grid',
      name: 'Default Grid',
      description: 'Standard data grid print layout',
      viewType: 'grid',
      options: {
        orientation: 'landscape',
        paperSize: 'A4',
        includeHeader: true,
        includeFooter: true,
        pageNumbers: true,
        margins: { top: 15, right: 15, bottom: 15, left: 15, unit: 'mm' },
      },
    });

    // Compact report template
    this.templates.set('compact-report', {
      id: 'compact-report',
      name: 'Compact Report',
      description: 'Compact layout with minimal margins',
      viewType: 'report',
      options: {
        orientation: 'portrait',
        paperSize: 'A4',
        includeHeader: true,
        includeFooter: false,
        pageNumbers: false,
        margins: { top: 10, right: 10, bottom: 10, left: 10, unit: 'mm' },
      },
    });
  }

  // ========================================
  // Helpers
  // ========================================

  /**
   * Format column name for display
   */
  private formatColumnName(column: string): string {
    return column
      .replace(/([A-Z])/g, ' $1') // Add space before capitals
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  /**
   * Format cell value for display
   */
  private formatCellValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  // ========================================
  // Persistence
  // ========================================

  /**
   * Load templates from localStorage
   */
  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem('print-templates');
      if (stored) {
        const parsed: PrintTemplate[] = JSON.parse(stored);
        parsed.forEach((template) => {
          this.templates.set(template.id, template);
        });
      }
    } catch (error) {
      console.error('Failed to load print templates:', error);
    }
  }

  /**
   * Save templates to localStorage
   */
  private saveTemplatesToStorage(): void {
    try {
      const templates = Array.from(this.templates.values());
      localStorage.setItem('print-templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save print templates:', error);
    }
  }
}

// Export singleton instance
export const printService = new PrintService();

// Export class for testing
export default PrintService;

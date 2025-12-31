/**
 * Clipboard Service
 * Advanced clipboard operations with multiple formats, history, and transformations
 * Supports text, HTML, JSON, CSV, TSV, and Markdown
 */

import {
  ClipboardData,
  ClipboardFormat,
  ClipboardFormatType,
  ClipboardHistoryEntry,
  PasteTransformation,
} from '../types/uiux';

import { notificationService } from './notificationService';

/**
 * Clipboard Service Class
 */
class ClipboardService {
  private history: ClipboardHistoryEntry[] = [];
  private maxHistorySize = 10;
  private transformations: Map<string, PasteTransformation> = new Map();
  private listeners: Set<(data: ClipboardData) => void> = new Set();

  constructor() {
    this.loadHistory();
    this.registerDefaultTransformations();
  }

  // ========================================
  // Copy Operations
  // ========================================

  /**
   * Copy text to clipboard
   */
  async copyText(text: string, options: { showNotification?: boolean } = {}): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);

      const data = this.createClipboardData([
        { type: 'text', data: text },
      ]);

      this.addToHistory(data);

      if (options.showNotification) {
        notificationService.showSuccess('Copied to clipboard', { duration: 2000 });
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
      notificationService.showError('Failed to copy to clipboard');
      throw error;
    }
  }

  /**
   * Copy with multiple formats
   */
  async copy(
    formats: ClipboardFormat[],
    options: { showNotification?: boolean; source?: string } = {}
  ): Promise<void> {
    try {
      // Write to clipboard (browsers only support text/html natively)
      const textFormat = formats.find((f) => f.type === 'text');
      const htmlFormat = formats.find((f) => f.type === 'html');

      if (htmlFormat) {
        // Use Clipboard API for HTML
        const blob = new Blob([htmlFormat.data], { type: 'text/html' });
        const clipboardItem = new ClipboardItem({
          'text/html': blob,
          'text/plain': new Blob([textFormat?.data || htmlFormat.data], { type: 'text/plain' }),
        });
        await navigator.clipboard.write([clipboardItem]);
      } else if (textFormat) {
        await navigator.clipboard.writeText(textFormat.data);
      }

      const data = this.createClipboardData(formats, options.source);
      this.addToHistory(data);

      if (options.showNotification) {
        notificationService.showSuccess('Copied to clipboard', { duration: 2000 });
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      notificationService.showError('Failed to copy to clipboard');
      throw error;
    }
  }

  /**
   * Copy data grid selection
   */
  async copyGridSelection(
    rows: any[],
    columns: string[],
    options: { showNotification?: boolean } = {}
  ): Promise<void> {
    const formats: ClipboardFormat[] = [
      { type: 'text', data: this.gridToText(rows, columns) },
      { type: 'csv', data: this.gridToCSV(rows, columns) },
      { type: 'tsv', data: this.gridToTSV(rows, columns) },
      { type: 'html', data: this.gridToHTML(rows, columns) },
      { type: 'json', data: JSON.stringify(rows, null, 2) },
      { type: 'markdown', data: this.gridToMarkdown(rows, columns) },
    ];

    await this.copy(formats, { ...options, source: 'data-grid' });
  }

  /**
   * Copy object as JSON
   */
  async copyJSON(
    obj: any,
    options: { showNotification?: boolean; pretty?: boolean } = {}
  ): Promise<void> {
    const json = options.pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);

    const formats: ClipboardFormat[] = [
      { type: 'text', data: json },
      { type: 'json', data: json },
    ];

    await this.copy(formats, options);
  }

  // ========================================
  // Paste Operations
  // ========================================

  /**
   * Read text from clipboard
   */
  async readText(): Promise<string> {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      throw error;
    }
  }

  /**
   * Read all available formats from clipboard
   */
  async read(): Promise<ClipboardData> {
    try {
      const items = await navigator.clipboard.read();
      const formats: ClipboardFormat[] = [];

      for (const item of items) {
        for (const type of item.types) {
          const blob = await item.getType(type);
          const text = await blob.text();

          if (type === 'text/plain') {
            formats.push({ type: 'text', data: text });
          } else if (type === 'text/html') {
            formats.push({ type: 'html', data: text });
          }
        }
      }

      return this.createClipboardData(formats);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      throw error;
    }
  }

  /**
   * Paste with transformation
   */
  async pasteWithTransform(transformationName: string): Promise<any> {
    const transformation = this.transformations.get(transformationName);
    if (!transformation) {
      throw new Error(`Transformation not found: ${transformationName}`);
    }

    const data = await this.read();
    return transformation.transform(data);
  }

  // ========================================
  // History Management
  // ========================================

  /**
   * Get clipboard history
   */
  getHistory(): ClipboardHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Get history entry by index
   */
  getHistoryEntry(index: number): ClipboardHistoryEntry | undefined {
    return this.history[index];
  }

  /**
   * Copy from history
   */
  async copyFromHistory(index: number): Promise<void> {
    const entry = this.history[index];
    if (!entry) return;

    await this.copy(entry.formats, { showNotification: true });
  }

  /**
   * Pin history entry
   */
  pinHistoryEntry(id: string): void {
    const entry = this.history.find((e) => e.id === id);
    if (entry) {
      entry.isPinned = true;
      this.saveHistory();
    }
  }

  /**
   * Unpin history entry
   */
  unpinHistoryEntry(id: string): void {
    const entry = this.history.find((e) => e.id === id);
    if (entry) {
      entry.isPinned = false;
      this.saveHistory();
    }
  }

  /**
   * Delete history entry
   */
  deleteHistoryEntry(id: string): void {
    this.history = this.history.filter((e) => e.id !== id);
    this.saveHistory();
  }

  /**
   * Clear history (except pinned)
   */
  clearHistory(): void {
    this.history = this.history.filter((e) => e.isPinned);
    this.saveHistory();
  }

  /**
   * Add to history
   */
  private addToHistory(data: ClipboardData): void {
    const entry: ClipboardHistoryEntry = {
      ...data,
      isPinned: false,
    };

    // Remove duplicate if exists (same text content)
    const textFormat = data.formats.find((f) => f.type === 'text');
    if (textFormat) {
      this.history = this.history.filter((e) => {
        const eText = e.formats.find((f) => f.type === 'text');
        return !eText || eText.data !== textFormat.data;
      });
    }

    // Add to front
    this.history.unshift(entry);

    // Limit size (keep pinned items)
    const pinned = this.history.filter((e) => e.isPinned);
    const unpinned = this.history.filter((e) => !e.isPinned);
    this.history = [...pinned, ...unpinned.slice(0, this.maxHistorySize - pinned.length)];

    this.saveHistory();
    this.notifyListeners(data);
  }

  // ========================================
  // Transformations
  // ========================================

  /**
   * Register paste transformation
   */
  registerTransformation(transformation: PasteTransformation): void {
    this.transformations.set(transformation.name, transformation);
  }

  /**
   * Get all transformations
   */
  getTransformations(): PasteTransformation[] {
    return Array.from(this.transformations.values());
  }

  /**
   * Register default transformations
   */
  private registerDefaultTransformations(): void {
    // Parse JSON
    this.registerTransformation({
      name: 'parse-json',
      transform: (data) => {
        const text = data.formats.find((f) => f.type === 'text' || f.type === 'json')?.data;
        if (!text) throw new Error('No text data found');
        return JSON.parse(text);
      },
    });

    // Parse CSV
    this.registerTransformation({
      name: 'parse-csv',
      transform: (data) => {
        const text = data.formats.find((f) => f.type === 'text' || f.type === 'csv')?.data;
        if (!text) throw new Error('No text data found');
        return this.parseCSV(text);
      },
    });

    // Strip HTML
    this.registerTransformation({
      name: 'strip-html',
      transform: (data) => {
        const html = data.formats.find((f) => f.type === 'html')?.data;
        if (!html) throw new Error('No HTML data found');
        return this.stripHTML(html);
      },
    });
  }

  // ========================================
  // Format Converters
  // ========================================

  /**
   * Convert grid to plain text
   */
  private gridToText(rows: any[], columns: string[]): string {
    const header = columns.join('\t');
    const body = rows.map((row) => columns.map((col) => row[col] || '').join('\t')).join('\n');
    return `${header}\n${body}`;
  }

  /**
   * Convert grid to CSV
   */
  private gridToCSV(rows: any[], columns: string[]): string {
    const escape = (val: any) => {
      const str = String(val || '');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const header = columns.map(escape).join(',');
    const body = rows
      .map((row) => columns.map((col) => escape(row[col])).join(','))
      .join('\n');

    return `${header}\n${body}`;
  }

  /**
   * Convert grid to TSV
   */
  private gridToTSV(rows: any[], columns: string[]): string {
    return this.gridToText(rows, columns);
  }

  /**
   * Convert grid to HTML table
   */
  private gridToHTML(rows: any[], columns: string[]): string {
    const header = `<thead><tr>${columns.map((col) => `<th>${col}</th>`).join('')}</tr></thead>`;
    const body = `<tbody>${rows
      .map(
        (row) =>
          `<tr>${columns.map((col) => `<td>${row[col] || ''}</td>`).join('')}</tr>`
      )
      .join('')}</tbody>`;

    return `<table>${header}${body}</table>`;
  }

  /**
   * Convert grid to Markdown table
   */
  private gridToMarkdown(rows: any[], columns: string[]): string {
    const header = `| ${columns.join(' | ')} |`;
    const separator = `| ${columns.map(() => '---').join(' | ')} |`;
    const body = rows
      .map((row) => `| ${columns.map((col) => row[col] || '').join(' | ')} |`)
      .join('\n');

    return `${header}\n${separator}\n${body}`;
  }

  /**
   * Parse CSV text
   */
  private parseCSV(text: string): any[] {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return [];

    const headers = this.parseCSVLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const values = this.parseCSVLine(line);
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj;
    });

    return rows;
  }

  /**
   * Parse single CSV line
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  }

  /**
   * Strip HTML tags
   */
  private stripHTML(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  // ========================================
  // Helpers
  // ========================================

  /**
   * Create clipboard data object
   */
  private createClipboardData(
    formats: ClipboardFormat[],
    source?: string
  ): ClipboardData {
    return {
      id: this.generateId(),
      timestamp: new Date(),
      formats,
      source,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========================================
  // Persistence
  // ========================================

  /**
   * Load history from localStorage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem('clipboard-history');
      if (stored) {
        const parsed: ClipboardHistoryEntry[] = JSON.parse(stored);
        this.history = parsed.map((entry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load clipboard history:', error);
    }
  }

  /**
   * Save history to localStorage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem('clipboard-history', JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save clipboard history:', error);
    }
  }

  // ========================================
  // Listeners
  // ========================================

  /**
   * Subscribe to clipboard changes
   */
  subscribe(listener: (data: ClipboardData) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(data: ClipboardData): void {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('Clipboard listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const clipboardService = new ClipboardService();

// Export class for testing
export default ClipboardService;



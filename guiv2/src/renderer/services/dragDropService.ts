/**
 * Drag & Drop Service
 * Manages drag-drop state, drop zones, and provides utilities for drag operations
 * Supports file drops, multi-item drag, and nested drop zones
 */

import { DragState, DraggedItem, DragItemType, DropZone, DragConstraints } from '../types/uiux';

/**
 * Drag & Drop Service Class
 */
class DragDropService {
  private dragState: DragState = {
    isDragging: false,
    draggedItem: null,
    draggedItems: [],
  };

  private dropZones: Map<string, DropZone> = new Map();
  private activeDropZone: DropZone | null = null;
  private listeners: Set<(state: DragState) => void> = new Set();

  constructor() {
    this.registerGlobalListeners();
  }

  // ========================================
  // Drag Operations
  // ========================================

  /**
   * Start dragging an item
   */
  startDrag(
    item: DraggedItem,
    event: DragEvent,
    options: {
      ghostElement?: HTMLElement;
      constraints?: DragConstraints;
    } = {}
  ): void {
    this.dragState = {
      isDragging: true,
      draggedItem: item,
      draggedItems: [item],
      ghostElement: options.ghostElement,
      constraints: options.constraints,
    };

    // Set drag data
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copyMove';
      event.dataTransfer.setData('application/json', JSON.stringify(item));

      // Set custom ghost image if provided
      if (options.ghostElement) {
        event.dataTransfer.setDragImage(options.ghostElement, 0, 0);
      }
    }

    this.notifyListeners();
  }

  /**
   * Start dragging multiple items
   */
  startMultiDrag(
    items: DraggedItem[],
    event: DragEvent,
    options: {
      ghostElement?: HTMLElement;
      constraints?: DragConstraints;
    } = {}
  ): void {
    if (items.length === 0) return;

    this.dragState = {
      isDragging: true,
      draggedItem: items[0],
      draggedItems: items,
      ghostElement: options.ghostElement,
      constraints: options.constraints,
    };

    // Set drag data
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copyMove';
      event.dataTransfer.setData('application/json', JSON.stringify(items));

      // Set custom ghost image if provided
      if (options.ghostElement) {
        event.dataTransfer.setDragImage(options.ghostElement, 0, 0);
      }
    }

    this.notifyListeners();
  }

  /**
   * End drag operation
   */
  endDrag(): void {
    this.dragState = {
      isDragging: false,
      draggedItem: null,
      draggedItems: [],
    };

    this.activeDropZone = null;
    this.notifyListeners();
  }

  /**
   * Get current drag state
   */
  getDragState(): DragState {
    return { ...this.dragState };
  }

  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this.dragState.isDragging;
  }

  /**
   * Get dragged items
   */
  getDraggedItems(): DraggedItem[] {
    return [...this.dragState.draggedItems];
  }

  // ========================================
  // Drop Zone Management
  // ========================================

  /**
   * Register a drop zone
   */
  registerDropZone(dropZone: DropZone): () => void {
    this.dropZones.set(dropZone.id, dropZone);

    // Add event listeners to the element
    const element = dropZone.element;

    const handleDragOver = (e: DragEvent) => {
      if (dropZone.disabled) return;

      e.preventDefault();
      e.stopPropagation();

      if (this.canDropInZone(dropZone)) {
        e.dataTransfer!.dropEffect = 'copy';
        this.setActiveDropZone(dropZone);

        if (dropZone.onDragOver) {
          dropZone.onDragOver(this.dragState.draggedItems, e);
        }
      } else {
        e.dataTransfer!.dropEffect = 'none';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Only trigger if leaving the drop zone (not child elements)
      if (!element.contains(e.relatedTarget as Node)) {
        if (this.activeDropZone?.id === dropZone.id) {
          this.activeDropZone = null;

          if (dropZone.onDragLeave) {
            dropZone.onDragLeave();
          }
        }
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (dropZone.disabled) return;

      e.preventDefault();
      e.stopPropagation();

      if (this.canDropInZone(dropZone)) {
        // Get dropped items
        const items = this.extractDroppedItems(e);

        // Call drop handler
        dropZone.onDrop(items, e);
      }

      this.endDrag();
    };

    element.addEventListener('dragover', handleDragOver as any);
    element.addEventListener('dragleave', handleDragLeave as any);
    element.addEventListener('drop', handleDrop as any);

    // Return cleanup function
    return () => {
      element.removeEventListener('dragover', handleDragOver as any);
      element.removeEventListener('dragleave', handleDragLeave as any);
      element.removeEventListener('drop', handleDrop as any);
      this.dropZones.delete(dropZone.id);
    };
  }

  /**
   * Unregister a drop zone
   */
  unregisterDropZone(dropZoneId: string): void {
    this.dropZones.delete(dropZoneId);
  }

  /**
   * Get all drop zones
   */
  getDropZones(): DropZone[] {
    return Array.from(this.dropZones.values());
  }

  /**
   * Get active drop zone
   */
  getActiveDropZone(): DropZone | null {
    return this.activeDropZone;
  }

  /**
   * Set active drop zone
   */
  private setActiveDropZone(zone: DropZone): void {
    if (this.activeDropZone?.id !== zone.id) {
      // Leave previous zone
      if (this.activeDropZone?.onDragLeave) {
        this.activeDropZone.onDragLeave();
      }

      this.activeDropZone = zone;
    }
  }

  /**
   * Check if items can be dropped in zone
   */
  private canDropInZone(zone: DropZone): boolean {
    if (!this.dragState.isDragging) return false;

    const items = this.dragState.draggedItems;

    // Check if zone accepts these item types
    const allAccepted = items.every((item) => zone.accepts.includes(item.type));
    if (!allAccepted) return false;

    // Check constraints
    const constraints = this.dragState.constraints;
    if (constraints) {
      // Check allowed types
      if (constraints.allowedTypes) {
        const typesMatch = items.every((item) =>
          constraints.allowedTypes!.includes(item.type)
        );
        if (!typesMatch) return false;
      }

      // Check max items
      if (constraints.maxItems && items.length > constraints.maxItems) {
        return false;
      }
    }

    return true;
  }

  // ========================================
  // File Drop Handling
  // ========================================

  /**
   * Handle file drop
   */
  handleFileDrop(
    event: DragEvent,
    options: {
      maxFileSize?: number;
      allowedTypes?: string[];
      onFiles: (files: File[]) => void;
      onError?: (error: string) => void;
    }
  ): void {
    event.preventDefault();

    const files = this.extractFiles(event);

    if (files.length === 0) {
      options.onError?.('No files detected');
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Check file size
      if (options.maxFileSize && file.size > options.maxFileSize) {
        errors.push(`File too large: ${file.name} (max ${this.formatBytes(options.maxFileSize)})`);
        continue;
      }

      // Check file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        errors.push(`Invalid file type: ${file.name} (${file.type})`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0 && options.onError) {
      options.onError(errors.join(', '));
    }

    if (validFiles.length > 0) {
      options.onFiles(validFiles);
    }
  }

  /**
   * Extract files from drag event
   */
  private extractFiles(event: DragEvent): File[] {
    const files: File[] = [];

    if (event.dataTransfer?.files) {
      Array.from(event.dataTransfer.files).forEach((file) => {
        files.push(file);
      });
    }

    if (event.dataTransfer?.items) {
      Array.from(event.dataTransfer.items).forEach((item) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      });
    }

    return files;
  }

  /**
   * Format bytes for display
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ========================================
  // Helpers
  // ========================================

  /**
   * Extract dropped items from event
   */
  private extractDroppedItems(event: DragEvent): DraggedItem[] {
    // Try to get items from our drag state first
    if (this.dragState.isDragging) {
      return this.dragState.draggedItems;
    }

    // Try to parse from dataTransfer
    try {
      const data = event.dataTransfer?.getData('application/json');
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch {
      // Failed to parse
    }

    return [];
  }

  /**
   * Register global drag event listeners
   */
  private registerGlobalListeners(): void {
    if (typeof window === 'undefined') return;

    // Global drag end
    window.addEventListener('dragend', () => {
      this.endDrag();
    });

    // Prevent default drag over (prevents browser from opening files)
    window.addEventListener('dragover', (e) => {
      if (this.dragState.isDragging || e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
      }
    });

    // Prevent default drop (prevents browser from opening files)
    window.addEventListener('drop', (e) => {
      if (this.dragState.isDragging || e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
        this.endDrag();
      }
    });
  }

  // ========================================
  // Utilities
  // ========================================

  /**
   * Create a ghost element for dragging
   */
  createGhostElement(content: string | HTMLElement, className?: string): HTMLElement {
    const ghost = document.createElement('div');
    ghost.className = className || 'drag-ghost';
    ghost.style.position = 'absolute';
    ghost.style.pointerEvents = 'none';
    ghost.style.zIndex = '9999';

    if (typeof content === 'string') {
      ghost.textContent = content;
    } else {
      ghost.appendChild(content.cloneNode(true));
    }

    document.body.appendChild(ghost);

    return ghost;
  }

  /**
   * Remove ghost element
   */
  removeGhostElement(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  /**
   * Create multi-item ghost element
   */
  createMultiItemGhost(items: DraggedItem[], className?: string): HTMLElement {
    const ghost = this.createGhostElement('', className);
    ghost.textContent = `${items.length} items`;
    return ghost;
  }

  // ========================================
  // Listeners
  // ========================================

  /**
   * Subscribe to drag state changes
   */
  subscribe(listener: (state: DragState) => void): () => void {
    this.listeners.add(listener);

    // Immediately notify with current state
    listener(this.getDragState());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const state = this.getDragState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('Drag-drop listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const dragDropService = new DragDropService();

// Export class for testing
export default DragDropService;



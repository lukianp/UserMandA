/**
 * UI/UX Service Type Definitions
 * Types for layout, progress, commands, shortcuts, drag-drop, print, clipboard, and undo/redo
 */

// ========================================
// Layout Service Types
// ========================================

/**
 * Layout configuration for different UI areas
 */
export interface LayoutConfig {
  window: WindowLayout;
  panels: PanelLayout;
  grid: GridLayout;
  splitPanes: SplitPaneLayout;
}

/**
 * Window size and position
 */
export interface WindowLayout {
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
  isFullScreen: boolean;
}

/**
 * Panel dimensions and visibility
 */
export interface PanelLayout {
  sidebarWidth: number;
  sidebarVisible: boolean;
  detailsPanelWidth: number;
  detailsPanelVisible: boolean;
  footerHeight: number;
  footerVisible: boolean;
}

/**
 * Data grid column configuration
 */
export interface GridLayout {
  columnWidths: Record<string, number>;
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  sortState?: { field: string; direction: 'asc' | 'desc' };
  filterState?: Record<string, any>;
}

/**
 * Split pane positions
 */
export interface SplitPaneLayout {
  positions: Record<string, number>; // Key is pane ID, value is size/position
}

/**
 * Named layout profile
 */
export interface LayoutProfile {
  id: string;
  name: string;
  description?: string;
  config: LayoutConfig;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// Progress Service Types
// ========================================

/**
 * Progress task tracking
 */
export interface ProgressTask {
  id: string;
  title: string;
  description?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  type: 'determinate' | 'indeterminate';
  percentage?: number; // 0-100 for determinate
  currentItem?: string;
  itemsProcessed?: number;
  totalItems?: number;
  startTime: Date;
  endTime?: Date;
  estimatedTimeRemaining?: number; // milliseconds
  cancellable: boolean;
  onCancel?: () => void;
  error?: string;
  subtasks?: ProgressSubtask[];
}

/**
 * Subtask for hierarchical progress
 */
export interface ProgressSubtask {
  id: string;
  title: string;
  percentage: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

/**
 * Progress notification options
 */
export interface ProgressNotificationOptions {
  showToast?: boolean;
  showModal?: boolean;
  showInline?: boolean;
  position?: 'top-right' | 'bottom-right' | 'center';
}

// ========================================
// Command Palette Types
// ========================================

/**
 * Command definition
 */
export interface Command {
  id: string;
  label: string;
  description?: string;
  category: CommandCategory;
  icon?: string;
  shortcut?: KeyboardShortcut;
  handler: (context?: CommandContext) => void | Promise<void>;
  condition?: (context?: CommandContext) => boolean; // Visibility condition
  keywords?: string[]; // For fuzzy search
}

/**
 * Command category
 */
export type CommandCategory =
  | 'navigation'
  | 'discovery'
  | 'migration'
  | 'users'
  | 'groups'
  | 'reports'
  | 'settings'
  | 'file'
  | 'edit'
  | 'view'
  | 'help'
  | 'custom';

/**
 * Command execution context
 */
export interface CommandContext {
  view?: string;
  selectedItems?: any[];
  metadata?: Record<string, any>;
}

/**
 * Command history entry
 */
export interface CommandHistoryEntry {
  commandId: string;
  executedAt: Date;
  context?: CommandContext;
}

// ========================================
// Keyboard Shortcut Types
// ========================================

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string; // e.g., 's', 'Enter', 'ArrowDown'
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Command on Mac, Windows key on Windows
  description?: string;
}

/**
 * Shortcut binding
 */
export interface ShortcutBinding {
  id: string;
  shortcut: KeyboardShortcut;
  commandId: string;
  context?: 'global' | string; // 'global' or view name
  priority?: number; // Higher priority wins conflicts
}

/**
 * Chord shortcut (multi-key sequence)
 */
export interface ChordShortcut {
  id: string;
  sequence: KeyboardShortcut[]; // e.g., [Ctrl+K, Ctrl+S]
  commandId: string;
  timeout?: number; // Time to complete sequence (default 2000ms)
}

/**
 * Shortcut conflict
 */
export interface ShortcutConflict {
  shortcut: KeyboardShortcut;
  bindings: ShortcutBinding[];
}

// ========================================
// Drag & Drop Types
// ========================================

/**
 * Drag state
 */
export interface DragState {
  isDragging: boolean;
  draggedItem: DraggedItem | null;
  draggedItems: DraggedItem[]; // For multi-item drag
  ghostElement?: HTMLElement;
  constraints?: DragConstraints;
}

/**
 * Dragged item
 */
export interface DraggedItem {
  id: string;
  type: DragItemType;
  data: any;
  element?: HTMLElement;
}

/**
 * Drag item type
 */
export type DragItemType = 'file' | 'user' | 'group' | 'wave' | 'resource' | 'column' | 'tab' | 'custom';

/**
 * Drop zone configuration
 */
export interface DropZone {
  id: string;
  element: HTMLElement;
  accepts: DragItemType[];
  onDrop: (items: DraggedItem[], event: DragEvent) => void;
  onDragOver?: (items: DraggedItem[], event: DragEvent) => void;
  onDragLeave?: () => void;
  disabled?: boolean;
}

/**
 * Drag constraints
 */
export interface DragConstraints {
  allowedTypes?: DragItemType[];
  maxItems?: number;
  maxFileSize?: number; // bytes
  allowedFileTypes?: string[]; // MIME types
}

// ========================================
// Print Service Types
// ========================================

/**
 * Print options
 */
export interface PrintOptions {
  title?: string;
  orientation?: 'portrait' | 'landscape';
  paperSize?: PaperSize;
  margins?: PrintMargins;
  includeHeader?: boolean;
  includeFooter?: boolean;
  headerContent?: string;
  footerContent?: string;
  pageNumbers?: boolean;
  columns?: string[]; // For data grids
  filters?: Record<string, any>; // Current filters to include
}

/**
 * Paper size
 */
export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'Tabloid';

/**
 * Print margins
 */
export interface PrintMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: 'mm' | 'in';
}

/**
 * Print template
 */
export interface PrintTemplate {
  id: string;
  name: string;
  description?: string;
  viewType: string; // Which view this template is for
  options: PrintOptions;
  customStyles?: string; // CSS
}

// ========================================
// Clipboard Service Types
// ========================================

/**
 * Clipboard data with multiple formats
 */
export interface ClipboardData {
  id: string;
  timestamp: Date;
  formats: ClipboardFormat[];
  source?: string; // Where it was copied from
}

/**
 * Clipboard format
 */
export interface ClipboardFormat {
  type: ClipboardFormatType;
  data: string;
}

/**
 * Clipboard format type
 */
export type ClipboardFormatType = 'text' | 'html' | 'json' | 'csv' | 'tsv' | 'markdown';

/**
 * Clipboard history entry
 */
export interface ClipboardHistoryEntry extends ClipboardData {
  isPinned?: boolean;
}

/**
 * Paste transformation
 */
export interface PasteTransformation {
  name: string;
  transform: (data: ClipboardData) => any;
}

// ========================================
// Undo/Redo Service Types
// ========================================

/**
 * Undoable command (Command Pattern)
 */
export interface UndoableCommand {
  id: string;
  name: string;
  description?: string;
  timestamp: Date;
  execute: () => void | Promise<void>;
  undo: () => void | Promise<void>;
  redo?: () => void | Promise<void>; // Optional, defaults to execute
  groupId?: string; // For batch undo/redo
  canUndo?: () => boolean; // Check if undo is still valid
}

/**
 * Command group for batch operations
 */
export interface CommandGroup {
  id: string;
  name: string;
  commands: UndoableCommand[];
  timestamp: Date;
}

/**
 * Undo/Redo state
 */
export interface UndoRedoState {
  undoStack: (UndoableCommand | CommandGroup)[];
  redoStack: (UndoableCommand | CommandGroup)[];
  maxStackSize: number;
  currentGroupId?: string; // For batching
}

/**
 * State snapshot for complex operations
 */
export interface StateSnapshot<T = any> {
  id: string;
  timestamp: Date;
  state: T;
  description?: string;
}



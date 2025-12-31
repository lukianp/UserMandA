**Author:** ljpops.com (Lukian Poleschtschuk)

**Last Updated:** 30/12/2025

**Status:** Production

**Version:** 1.0
# UI/UX Services Documentation

This directory contains all UI/UX services for the M&A Discovery Suite application. These services provide core functionality for user interface interactions, layout management, progress tracking, and more.

## Services Overview

### 1. Layout Service (`layoutService.ts`)

**Purpose:** Manages window layout, panel sizes, grid configurations, and layout profiles with persistence.

**Key Features:**
- Window size and position management
- Panel visibility and dimensions (sidebar, details panel, footer)
- Data grid column configuration (widths, order, visibility)
- Split pane position tracking
- Layout profiles (save/load/apply custom layouts)
- Layout presets (compact, wide, focus mode)

**Usage:**
```typescript
import { layoutService } from '@/services';

// Window management
layoutService.setWindowMaximized(true);
layoutService.updateWindowLayout({ width: 1920, height: 1080 });

// Panel management
layoutService.setSidebarWidth(300);
layoutService.toggleSidebar();

// Grid layout
layoutService.setColumnWidth('users-grid', 'email', 200);
layoutService.setColumnVisibility('users-grid', 'id', false);

// Profiles
const profileId = layoutService.saveAsProfile('My Layout', 'Custom layout for reports');
layoutService.applyProfile(profileId);

// Presets
layoutService.applyCompactLayout();
layoutService.applyFocusMode();

// Subscribe to changes
const unsubscribe = layoutService.subscribe((layout) => {
  console.log('Layout changed:', layout);
});
```

---

### 2. Progress Service (`progressService.ts`)

**Purpose:** Global progress tracking for long-running operations with support for indeterminate/determinate progress, multi-task tracking, and hierarchical progress.

**Key Features:**
- Task creation (determinate/indeterminate)
- Progress updates with ETA calculation
- Task completion/failure/cancellation
- Hierarchical progress (subtasks)
- Task history
- Convenience methods for common operations

**Usage:**
```typescript
import { progressService } from '@/services';

// Start a task
const taskId = progressService.startTask('Discovering users', {
  type: 'determinate',
  totalItems: 1000,
  cancellable: true,
  notification: { showToast: true },
});

// Update progress
progressService.updateProgress(taskId, {
  percentage: 50,
  currentItem: 'user@example.com',
  itemsProcessed: 500,
});

// Complete task
progressService.completeTask(taskId, { showToast: true });

// Or fail task
progressService.failTask(taskId, 'Network error', { showToast: true });

// Hierarchical progress
const subtaskId = progressService.addSubtask(taskId, 'Validating users');
progressService.updateSubtask(taskId, subtaskId, {
  percentage: 100,
  status: 'completed',
});

// Convenience wrapper
await progressService.runTask(
  'Processing data',
  async (updateProgress) => {
    for (let i = 0; i < 100; i++) {
      await doWork(i);
      updateProgress(i + 1, `Processing item ${i + 1}`);
    }
  },
  { notification: { showToast: true } }
);

// Subscribe to updates
const unsubscribe = progressService.subscribe((tasks) => {
  console.log('Active tasks:', tasks);
});
```

---

### 3. Command Palette Service (`commandPaletteService.ts`)

**Purpose:** Centralized command registry with fuzzy search, history, and favorites.

**Key Features:**
- Command registration with metadata
- Fuzzy search with scoring
- Command history
- Favorites/pinned commands
- Category grouping
- Visibility conditions
- Default commands (navigation, settings, etc.)

**Usage:**
```typescript
import { commandPaletteService, Command } from '@/services';

// Register a command
commandPaletteService.registerCommand({
  id: 'export.users',
  label: 'Export Users to CSV',
  description: 'Export all users to a CSV file',
  category: 'file',
  icon: 'Download',
  shortcut: { key: 'e', ctrl: true, shift: true },
  keywords: ['export', 'csv', 'download', 'users'],
  handler: async () => {
    await exportUsers();
  },
  condition: (context) => context?.selectedItems?.length > 0, // Only show if items selected
});

// Search commands
const results = commandPaletteService.searchCommands('export');

// Execute command
await commandPaletteService.executeCommand('export.users', {
  view: 'users',
  selectedItems: [/* ... */],
});

// Favorites
commandPaletteService.addFavorite('export.users');
const favorites = commandPaletteService.getFavorites();

// History
const recent = commandPaletteService.getRecentCommands(10);
commandPaletteService.clearHistory();

// Subscribe to changes
const unsubscribe = commandPaletteService.subscribe(() => {
  console.log('Command registry changed');
});
```

---

### 4. Keyboard Shortcut Service (`keyboardShortcutService.ts`)

**Purpose:** Global and context-specific shortcut management with conflict detection and chord support.

**Key Features:**
- Global and context-specific shortcuts
- Chord shortcuts (multi-key sequences like Ctrl+K Ctrl+S)
- Conflict detection
- User customization
- Platform-specific handling (Mac vs Windows)
- Shortcut help overlay

**Usage:**
```typescript
import { keyboardShortcutService } from '@/services';

// Register a shortcut
const bindingId = keyboardShortcutService.registerShortcut(
  'export.users',
  { key: 'e', ctrl: true, shift: true },
  { context: 'users-view', priority: 10 }
);

// Register chord shortcut (Ctrl+K, Ctrl+E)
keyboardShortcutService.registerChordShortcut(
  'export.users',
  [
    { key: 'k', ctrl: true },
    { key: 'e', ctrl: true },
  ],
  { timeout: 2000 }
);

// Context management
keyboardShortcutService.setContext('users-view');
keyboardShortcutService.resetContext(); // Back to global

// Check for conflicts
const conflicts = keyboardShortcutService.getAllConflicts();

// Update shortcut
keyboardShortcutService.updateShortcut(bindingId, { key: 'x', ctrl: true });

// Enable/disable
keyboardShortcutService.disable();
keyboardShortcutService.enable();

// Format for display
const binding = keyboardShortcutService.getShortcutForCommand('export.users');
const display = keyboardShortcutService.shortcutToString(binding.shortcut);
// Output: "Ctrl+Shift+E"

// Subscribe to events
const unsubscribe = keyboardShortcutService.subscribe((event, binding) => {
  console.log('Shortcut executed:', binding.commandId);
});
```

---

### 5. Drag & Drop Service (`dragDropService.ts`)

**Purpose:** Manages drag-drop state, drop zones, and provides utilities for drag operations.

**Key Features:**
- Single and multi-item drag
- Drop zone registration with validation
- File drop handling with validation
- Visual feedback (ghost elements)
- Drag constraints (types, max items, file size)
- Nested drop zones

**Usage:**
```typescript
import { dragDropService, DraggedItem, DropZone } from '@/services';

// Start dragging
const item: DraggedItem = {
  id: 'user-123',
  type: 'user',
  data: { email: 'user@example.com', name: 'John Doe' },
};

dragDropService.startDrag(item, event, {
  ghostElement: dragDropService.createGhostElement('1 user'),
  constraints: {
    allowedTypes: ['user'],
    maxItems: 100,
  },
});

// Multi-item drag
dragDropService.startMultiDrag([item1, item2, item3], event);

// Register drop zone
const unregister = dragDropService.registerDropZone({
  id: 'wave-dropzone',
  element: document.getElementById('wave-container')!,
  accepts: ['user', 'group'],
  onDrop: (items, event) => {
    console.log('Dropped items:', items);
    items.forEach(item => addUserToWave(item.data));
  },
  onDragOver: (items, event) => {
    // Show visual feedback
    event.currentTarget.classList.add('drop-target-active');
  },
  onDragLeave: () => {
    // Remove visual feedback
  },
});

// File drop handling
dragDropService.handleFileDrop(event, {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['text/csv', 'application/json'],
  onFiles: (files) => {
    console.log('Files dropped:', files);
    files.forEach(file => importFile(file));
  },
  onError: (error) => {
    console.error('File drop error:', error);
  },
});

// Subscribe to drag state
const unsubscribe = dragDropService.subscribe((state) => {
  console.log('Dragging:', state.isDragging);
  console.log('Items:', state.draggedItems);
});
```

---

### 6. Print Service (`printService.ts`)

**Purpose:** Handles printing of views, data grids, and reports with support for templates and PDF export.

**Key Features:**
- Print current view with options
- Print data grids with column selection
- Print preview
- PDF export (via browser)
- Custom print templates
- Page setup (orientation, margins, paper size)
- Headers and footers

**Usage:**
```typescript
import { printService } from '@/services';

// Print current view
await printService.printView(document.getElementById('users-view')!, {
  title: 'Users Report',
  orientation: 'landscape',
  paperSize: 'A4',
  includeHeader: true,
  includeFooter: true,
  pageNumbers: true,
  margins: { top: 20, right: 20, bottom: 20, left: 20, unit: 'mm' },
});

// Print data grid
await printService.printDataGrid(
  users,
  ['email', 'name', 'department', 'status'],
  {
    title: 'User List',
    orientation: 'landscape',
  }
);

// Export to PDF
await printService.exportToPDF(content, options);

// Show print preview
await printService.showPrintPreview(content, options);

// Templates
const template = printService.getTemplate('default-grid');
await printService.printWithTemplate(content, 'default-grid');

// Save custom template
printService.saveTemplate({
  id: 'my-template',
  name: 'My Template',
  description: 'Custom print layout',
  viewType: 'users',
  options: {
    orientation: 'portrait',
    paperSize: 'Letter',
    includeHeader: true,
    margins: { top: 15, right: 15, bottom: 15, left: 15, unit: 'mm' },
  },
});
```

---

### 7. Clipboard Service (`clipboardService.ts`)

**Purpose:** Advanced clipboard operations with multiple formats, history, and transformations.

**Key Features:**
- Copy/paste with multiple formats (text, HTML, JSON, CSV, TSV, Markdown)
- Clipboard history (last 10 items)
- Pinned items
- Paste transformations
- Data grid copy with formatting
- Security (HTML sanitization)

**Usage:**
```typescript
import { clipboardService } from '@/services';

// Copy text
await clipboardService.copyText('Hello World', { showNotification: true });

// Copy with multiple formats
await clipboardService.copy([
  { type: 'text', data: 'Plain text' },
  { type: 'html', data: '<strong>Bold text</strong>' },
  { type: 'json', data: JSON.stringify({ key: 'value' }) },
]);

// Copy data grid
await clipboardService.copyGridSelection(
  users,
  ['email', 'name', 'department'],
  { showNotification: true }
);

// Copy JSON
await clipboardService.copyJSON({ users, count: users.length }, {
  pretty: true,
  showNotification: true,
});

// Read clipboard
const text = await clipboardService.readText();
const data = await clipboardService.read(); // All formats

// Paste with transformation
const parsed = await clipboardService.pasteWithTransform('parse-json');
const csvData = await clipboardService.pasteWithTransform('parse-csv');

// History
const history = clipboardService.getHistory();
await clipboardService.copyFromHistory(0); // Copy most recent

// Pin/unpin
clipboardService.pinHistoryEntry(historyId);
clipboardService.clearHistory(); // Clears all except pinned

// Subscribe to changes
const unsubscribe = clipboardService.subscribe((data) => {
  console.log('Clipboard changed:', data);
});
```

---

### 8. Undo/Redo Service (`undoRedoService.ts`)

**Purpose:** Implements Command Pattern for undo/redo functionality with batching and snapshots.

**Key Features:**
- Command execution with undo/redo
- Command grouping (batch operations)
- Selective undo
- State snapshots for complex operations
- Stack size limits
- Integration helpers for forms and arrays

**Usage:**
```typescript
import { undoRedoService, UndoableCommand } from '@/services';

// Execute a command
await undoRedoService.executeCommand(
  'Change user email',
  () => { user.email = 'new@example.com'; }, // execute
  () => { user.email = 'old@example.com'; }, // undo
  { description: 'old@example.com → new@example.com' }
);

// Undo/Redo
await undoRedoService.undo();
await undoRedoService.redo();

// Check availability
const canUndo = undoRedoService.canUndo();
const canRedo = undoRedoService.canRedo();

// Command grouping (batch undo/redo)
const groupId = undoRedoService.startGroup('Bulk user update');
await undoRedoService.execute(command1);
await undoRedoService.execute(command2);
await undoRedoService.execute(command3);
undoRedoService.endGroup();

// Or use convenience method
await undoRedoService.executeGroup('Bulk update', [
  command1,
  command2,
  command3,
]);

// State snapshots
const snapshotId = undoRedoService.createSnapshot(currentState, 'Before changes');

const restoreCommand = undoRedoService.createRestoreCommand(
  snapshotId,
  () => getCurrentState(),
  (state) => restoreState(state),
  'Restore to snapshot'
);

await undoRedoService.execute(restoreCommand);

// Integration helpers

// Form field change
const fieldCommand = undoRedoService.createFieldChangeCommand(
  'email',
  oldEmail,
  newEmail,
  (value) => { user.email = value; }
);

await undoRedoService.execute(fieldCommand);

// Array operations
const arrayCommand = undoRedoService.createArrayCommand(
  'Add user to wave',
  wave.users,
  'add',
  newUser
);

await undoRedoService.execute(arrayCommand);

// Get history
const undoHistory = undoRedoService.getUndoHistory();
const redoHistory = undoRedoService.getRedoHistory();

// Subscribe to changes
const unsubscribe = undoRedoService.subscribe((state) => {
  console.log('Can undo:', state.undoStack.length > 0);
  console.log('Can redo:', state.redoStack.length > 0);
});
```

---

## Integration with Components

### Using Services in React Components

```typescript
import { useEffect, useState } from 'react';
import { progressService, layoutService, clipboardService } from '@/services';

function MyComponent() {
  const [tasks, setTasks] = useState([]);
  const [layout, setLayout] = useState(null);

  useEffect(() => {
    // Subscribe to progress updates
    const unsubProgress = progressService.subscribe(setTasks);

    // Subscribe to layout changes
    const unsubLayout = layoutService.subscribe(setLayout);

    // Cleanup
    return () => {
      unsubProgress();
      unsubLayout();
    };
  }, []);

  const handleExport = async () => {
    const taskId = progressService.startTask('Exporting users', {
      type: 'determinate',
      totalItems: users.length,
    });

    try {
      // Export logic
      for (let i = 0; i < users.length; i++) {
        await exportUser(users[i]);
        progressService.updateProgress(taskId, { itemsProcessed: i + 1 });
      }

      progressService.completeTask(taskId);
    } catch (error) {
      progressService.failTask(taskId, error.message);
    }
  };

  const handleCopy = async () => {
    await clipboardService.copyGridSelection(
      selectedUsers,
      ['email', 'name', 'department'],
      { showNotification: true }
    );
  };

  return (
    <div>
      {/* Component UI */}
    </div>
  );
}
```

### Using Services in Zustand Stores

```typescript
import { create } from 'zustand';
import { undoRedoService } from '@/services';

interface UserStore {
  users: User[];
  updateUser: (id: string, updates: Partial<User>) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],

  updateUser: async (id, updates) => {
    const user = get().users.find(u => u.id === id);
    if (!user) return;

    // Create undo command
    const command = undoRedoService.createFieldChangeCommand(
      `user.${id}`,
      user,
      { ...user, ...updates },
      (value) => {
        set({
          users: get().users.map(u => u.id === id ? value : u),
        });
      }
    );

    await undoRedoService.execute(command);
  },
}));
```

---

## Best Practices

1. **Always clean up subscriptions** - Use `useEffect` cleanup functions
2. **Handle errors gracefully** - Services throw errors, wrap in try-catch
3. **Use notifications** - Show user feedback for operations
4. **Test with edge cases** - Empty arrays, null values, large datasets
5. **Respect user preferences** - Save/load settings from localStorage
6. **Provide keyboard shortcuts** - Register shortcuts for common actions
7. **Enable undo/redo** - For data modifications
8. **Track progress** - For long-running operations
9. **Use command palette** - For discoverability
10. **Persist layout** - Save user's window/panel preferences

---

## Performance Considerations

- **Layout Service**: Updates are debounced to avoid excessive re-renders
- **Progress Service**: Limit update frequency (e.g., every 100ms)
- **Clipboard Service**: History limited to 10 items
- **Undo/Redo Service**: Stack size limited to 50 commands
- **Keyboard Shortcuts**: Use event delegation, not individual listeners
- **Drag & Drop**: Remove ghost elements after drag ends

---

## Testing

All services are designed to be testable:

```typescript
import LayoutService from '@/services/layoutService';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    service = new LayoutService();
    localStorage.clear();
  });

  test('should save and load layout', () => {
    service.setSidebarWidth(300);
    const layout = service.getCurrentLayout();
    expect(layout.panels.sidebarWidth).toBe(300);
  });

  test('should apply layout profiles', () => {
    const profileId = service.saveAsProfile('Test Profile');
    service.applyProfile(profileId);
    const profile = service.getProfile(profileId);
    expect(profile?.name).toBe('Test Profile');
  });
});
```

---

## Future Enhancements

- [ ] Cloud sync for layout profiles
- [ ] Command palette fuzzy search improvements
- [ ] Drag & drop touch support
- [ ] Print service: Custom CSS templates
- [ ] Clipboard service: Rich text support
- [ ] Undo/redo: Conflict resolution for concurrent operations
- [ ] Progress service: Parallel task coordination
- [ ] Keyboard shortcuts: Macro recording

---

## Support

For issues or questions, contact the development team or file an issue in the repository.


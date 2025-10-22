/**
 * Undo/Redo Service
 * Implements Command Pattern for undo/redo functionality
 * Supports batching, selective undo, and state snapshots
 */

import {
  UndoableCommand,
  CommandGroup,
  UndoRedoState,
  StateSnapshot,
} from '../types/uiux';

import { notificationService } from './notificationService';

/**
 * Undo/Redo Service Class
 */
class UndoRedoService {
  private state: UndoRedoState = {
    undoStack: [],
    redoStack: [],
    maxStackSize: 50,
    currentGroupId: undefined,
  };

  private snapshots: Map<string, StateSnapshot> = new Map();
  private listeners: Set<(state: UndoRedoState) => void> = new Set();
  private isExecuting = false;

  // ========================================
  // Command Execution
  // ========================================

  /**
   * Execute a command and add to undo stack
   */
  async execute(command: UndoableCommand): Promise<void> {
    if (this.isExecuting) {
      console.warn('Cannot execute command while another is executing');
      return;
    }

    this.isExecuting = true;

    try {
      // Execute the command
      await command.execute();

      // Add to undo stack
      if (this.state.currentGroupId) {
        // Add to current group
        this.addToCurrentGroup(command);
      } else {
        // Add as standalone command
        this.state.undoStack.push(command);
        this.limitStackSize(this.state.undoStack);
      }

      // Clear redo stack (new action invalidates redo history)
      this.state.redoStack = [];

      this.notifyListeners();
    } catch (error) {
      console.error('Command execution failed:', error);
      notificationService.showError('Operation failed');
      throw error;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Create and execute a command from callbacks
   */
  async executeCommand(
    name: string,
    execute: () => void | Promise<void>,
    undo: () => void | Promise<void>,
    options: {
      description?: string;
      redo?: () => void | Promise<void>;
    } = {}
  ): Promise<void> {
    const command: UndoableCommand = {
      id: this.generateCommandId(),
      name,
      description: options.description,
      timestamp: new Date(),
      execute,
      undo,
      redo: options.redo,
    };

    await this.execute(command);
  }

  // ========================================
  // Undo/Redo Operations
  // ========================================

  /**
   * Undo last command
   */
  async undo(): Promise<boolean> {
    if (!this.canUndo()) return false;

    this.isExecuting = true;

    try {
      const item = this.state.undoStack.pop()!;

      if (this.isCommandGroup(item)) {
        // Undo all commands in group (reverse order)
        for (let i = item.commands.length - 1; i >= 0; i--) {
          await item.commands[i].undo();
        }
      } else {
        // Check if command can still be undone
        if (item.canUndo && !item.canUndo()) {
          notificationService.showWarning('Cannot undo: state has changed');
          return false;
        }

        await item.undo();
      }

      // Move to redo stack
      this.state.redoStack.push(item);

      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Undo failed:', error);
      notificationService.showError('Undo failed');
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Redo last undone command
   */
  async redo(): Promise<boolean> {
    if (!this.canRedo()) return false;

    this.isExecuting = true;

    try {
      const item = this.state.redoStack.pop()!;

      if (this.isCommandGroup(item)) {
        // Redo all commands in group
        for (const command of item.commands) {
          if (command.redo) {
            await command.redo();
          } else {
            await command.execute();
          }
        }
      } else {
        if (item.redo) {
          await item.redo();
        } else {
          await item.execute();
        }
      }

      // Move back to undo stack
      this.state.undoStack.push(item);

      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Redo failed:', error);
      notificationService.showError('Redo failed');
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Undo multiple commands
   */
  async undoMultiple(count: number): Promise<number> {
    let undone = 0;

    for (let i = 0; i < count; i++) {
      const success = await this.undo();
      if (!success) break;
      undone++;
    }

    return undone;
  }

  /**
   * Redo multiple commands
   */
  async redoMultiple(count: number): Promise<number> {
    let redone = 0;

    for (let i = 0; i < count; i++) {
      const success = await this.redo();
      if (!success) break;
      redone++;
    }

    return redone;
  }

  // ========================================
  // Command Grouping (Batch Operations)
  // ========================================

  /**
   * Start grouping commands (batch undo/redo)
   */
  startGroup(name: string): string {
    const groupId = this.generateCommandId();

    this.state.currentGroupId = groupId;

    // Create empty group
    const group: CommandGroup = {
      id: groupId,
      name,
      commands: [],
      timestamp: new Date(),
    };

    this.state.undoStack.push(group);

    return groupId;
  }

  /**
   * End command grouping
   */
  endGroup(): void {
    if (!this.state.currentGroupId) {
      console.warn('No active group to end');
      return;
    }

    // If group is empty, remove it
    const lastItem = this.state.undoStack[this.state.undoStack.length - 1];
    if (this.isCommandGroup(lastItem) && lastItem.commands.length === 0) {
      this.state.undoStack.pop();
    }

    this.state.currentGroupId = undefined;
    this.notifyListeners();
  }

  /**
   * Execute multiple commands as a group
   */
  async executeGroup(
    name: string,
    commands: UndoableCommand[]
  ): Promise<void> {
    const groupId = this.startGroup(name);

    try {
      for (const command of commands) {
        await command.execute();
      }

      this.endGroup();
    } catch (error) {
      // Rollback on error
      await this.undoGroup(groupId);
      this.endGroup();
      throw error;
    }
  }

  /**
   * Add command to current group
   */
  private addToCurrentGroup(command: UndoableCommand): void {
    if (!this.state.currentGroupId) return;

    const lastItem = this.state.undoStack[this.state.undoStack.length - 1];

    if (this.isCommandGroup(lastItem) && lastItem.id === this.state.currentGroupId) {
      lastItem.commands.push(command);
    }
  }

  /**
   * Undo specific group
   */
  private async undoGroup(groupId: string): Promise<void> {
    const group = this.state.undoStack.find(
      (item) => this.isCommandGroup(item) && item.id === groupId
    ) as CommandGroup | undefined;

    if (!group) return;

    for (let i = group.commands.length - 1; i >= 0; i--) {
      await group.commands[i].undo();
    }
  }

  // ========================================
  // State Queries
  // ========================================

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.state.undoStack.length > 0 && !this.isExecuting;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.state.redoStack.length > 0 && !this.isExecuting;
  }

  /**
   * Get undo stack
   */
  getUndoStack(): (UndoableCommand | CommandGroup)[] {
    return [...this.state.undoStack];
  }

  /**
   * Get redo stack
   */
  getRedoStack(): (UndoableCommand | CommandGroup)[] {
    return [...this.state.redoStack];
  }

  /**
   * Get undo history (flattened)
   */
  getUndoHistory(): Array<{ name: string; timestamp: Date; type: 'command' | 'group' }> {
    return this.state.undoStack.map((item) => ({
      name: item.name,
      timestamp: item.timestamp,
      type: this.isCommandGroup(item) ? 'group' : 'command',
    }));
  }

  /**
   * Get redo history (flattened)
   */
  getRedoHistory(): Array<{ name: string; timestamp: Date; type: 'command' | 'group' }> {
    return this.state.redoStack.map((item) => ({
      name: item.name,
      timestamp: item.timestamp,
      type: this.isCommandGroup(item) ? 'group' : 'command',
    }));
  }

  /**
   * Get current state
   */
  getState(): UndoRedoState {
    return { ...this.state };
  }

  // ========================================
  // Selective Undo
  // ========================================

  /**
   * Undo specific command by ID (dangerous - may break state consistency)
   */
  async undoCommandById(commandId: string): Promise<boolean> {
    const index = this.state.undoStack.findIndex((item) => item.id === commandId);

    if (index === -1) {
      console.warn(`Command not found: ${commandId}`);
      return false;
    }

    this.isExecuting = true;

    try {
      const item = this.state.undoStack[index];

      if (this.isCommandGroup(item)) {
        for (let i = item.commands.length - 1; i >= 0; i--) {
          await item.commands[i].undo();
        }
      } else {
        if (item.canUndo && !item.canUndo()) {
          notificationService.showWarning('Cannot undo: state has changed');
          return false;
        }

        await item.undo();
      }

      // Remove from stack
      this.state.undoStack.splice(index, 1);

      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Selective undo failed:', error);
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  // ========================================
  // State Snapshots
  // ========================================

  /**
   * Create state snapshot (for complex operations)
   */
  createSnapshot<T>(state: T, description?: string): string {
    const snapshot: StateSnapshot<T> = {
      id: this.generateCommandId(),
      timestamp: new Date(),
      state,
      description,
    };

    this.snapshots.set(snapshot.id, snapshot);

    // Limit snapshots
    if (this.snapshots.size > 20) {
      const oldest = Array.from(this.snapshots.keys())[0];
      this.snapshots.delete(oldest);
    }

    return snapshot.id;
  }

  /**
   * Get state snapshot
   */
  getSnapshot<T>(id: string): StateSnapshot<T> | undefined {
    return this.snapshots.get(id) as StateSnapshot<T> | undefined;
  }

  /**
   * Delete state snapshot
   */
  deleteSnapshot(id: string): void {
    this.snapshots.delete(id);
  }

  /**
   * Create command that restores to snapshot
   */
  createRestoreCommand<T>(
    snapshotId: string,
    getCurrentState: () => T,
    restoreState: (state: T) => void,
    name?: string
  ): UndoableCommand {
    const snapshot = this.getSnapshot<T>(snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${snapshotId}`);
    }

    const currentState = getCurrentState();

    return {
      id: this.generateCommandId(),
      name: name || `Restore to ${snapshot.description || 'snapshot'}`,
      timestamp: new Date(),
      execute: () => restoreState(snapshot.state),
      undo: () => restoreState(currentState),
    };
  }

  // ========================================
  // Helpers
  // ========================================

  /**
   * Check if item is a command group
   */
  private isCommandGroup(
    item: UndoableCommand | CommandGroup
  ): item is CommandGroup {
    return 'commands' in item;
  }

  /**
   * Generate unique command ID
   */
  private generateCommandId(): string {
    return `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Limit stack size
   */
  private limitStackSize(stack: (UndoableCommand | CommandGroup)[]): void {
    if (stack.length > this.state.maxStackSize) {
      stack.shift(); // Remove oldest
    }
  }

  // ========================================
  // Stack Management
  // ========================================

  /**
   * Clear undo stack
   */
  clearUndoStack(): void {
    this.state.undoStack = [];
    this.notifyListeners();
  }

  /**
   * Clear redo stack
   */
  clearRedoStack(): void {
    this.state.redoStack = [];
    this.notifyListeners();
  }

  /**
   * Clear all stacks
   */
  clearAll(): void {
    this.state.undoStack = [];
    this.state.redoStack = [];
    this.snapshots.clear();
    this.notifyListeners();
  }

  /**
   * Set max stack size
   */
  setMaxStackSize(size: number): void {
    this.state.maxStackSize = size;

    // Trim existing stacks if needed
    while (this.state.undoStack.length > size) {
      this.state.undoStack.shift();
    }
    while (this.state.redoStack.length > size) {
      this.state.redoStack.shift();
    }

    this.notifyListeners();
  }

  // ========================================
  // Integration Helpers
  // ========================================

  /**
   * Create command for form field change
   */
  createFieldChangeCommand<T>(
    fieldName: string,
    oldValue: T,
    newValue: T,
    onChange: (value: T) => void
  ): UndoableCommand {
    return {
      id: this.generateCommandId(),
      name: `Change ${fieldName}`,
      description: `${oldValue} → ${newValue}`,
      timestamp: new Date(),
      execute: () => onChange(newValue),
      undo: () => onChange(oldValue),
    };
  }

  /**
   * Create command for array operation
   */
  createArrayCommand<T>(
    name: string,
    array: T[],
    operation: 'add' | 'remove' | 'update',
    item: T,
    index?: number
  ): UndoableCommand {
    return {
      id: this.generateCommandId(),
      name,
      timestamp: new Date(),
      execute: () => {
        if (operation === 'add') {
          if (index !== undefined) {
            array.splice(index, 0, item);
          } else {
            array.push(item);
          }
        } else if (operation === 'remove') {
          const idx = index ?? array.indexOf(item);
          if (idx !== -1) array.splice(idx, 1);
        } else if (operation === 'update' && index !== undefined) {
          array[index] = item;
        }
      },
      undo: () => {
        if (operation === 'add') {
          const idx = index ?? array.indexOf(item);
          if (idx !== -1) array.splice(idx, 1);
        } else if (operation === 'remove') {
          if (index !== undefined) {
            array.splice(index, 0, item);
          } else {
            array.push(item);
          }
        }
      },
    };
  }

  // ========================================
  // Listeners
  // ========================================

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: UndoRedoState) => void): () => void {
    this.listeners.add(listener);

    // Immediately notify with current state
    listener(this.getState());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('Undo/redo listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const undoRedoService = new UndoRedoService();

// Export class for testing
export default UndoRedoService;

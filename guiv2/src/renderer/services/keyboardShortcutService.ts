/**
 * Keyboard Shortcut Service
 * Global and context-specific shortcut management with conflict detection
 * Supports chord shortcuts (multi-key sequences) and user customization
 */

import {
  KeyboardShortcut,
  ShortcutBinding,
  ChordShortcut,
  ShortcutConflict,
} from '../types/uiux';
import { commandPaletteService } from './commandPaletteService';

/**
 * Keyboard Shortcut Service Class
 */
class KeyboardShortcutService {
  private bindings: Map<string, ShortcutBinding> = new Map();
  private chordBindings: Map<string, ChordShortcut> = new Map();
  private activeContext = 'global';
  private isChordActive = false;
  private chordSequence: KeyboardShortcut[] = [];
  private chordTimeoutId?: NodeJS.Timeout;
  private chordTimeout = 2000; // 2 seconds to complete chord
  private isEnabled = true;
  private listeners: Set<(event: KeyboardEvent, binding: ShortcutBinding) => void> = new Set();
  private chordIndicatorElement?: HTMLDivElement;

  constructor() {
    this.loadCustomBindings();
    this.registerGlobalListener();
    this.registerDefaultShortcuts();
  }

  // ========================================
  // Shortcut Registration
  // ========================================

  /**
   * Register a keyboard shortcut
   */
  registerShortcut(
    commandId: string,
    shortcut: KeyboardShortcut,
    options: {
      id?: string;
      context?: string;
      priority?: number;
    } = {}
  ): string {
    const binding: ShortcutBinding = {
      id: options.id || this.generateBindingId(),
      shortcut,
      commandId,
      context: options.context || 'global',
      priority: options.priority || 0,
    };

    this.bindings.set(binding.id, binding);
    this.saveCustomBindings();

    return binding.id;
  }

  /**
   * Register a chord shortcut (multi-key sequence)
   */
  registerChordShortcut(
    commandId: string,
    sequence: KeyboardShortcut[],
    options: {
      id?: string;
      timeout?: number;
    } = {}
  ): string {
    const chord: ChordShortcut = {
      id: options.id || this.generateBindingId(),
      sequence,
      commandId,
      timeout: options.timeout,
    };

    this.chordBindings.set(chord.id, chord);
    this.saveCustomBindings();

    return chord.id;
  }

  /**
   * Unregister a shortcut
   */
  unregisterShortcut(bindingId: string): void {
    this.bindings.delete(bindingId);
    this.chordBindings.delete(bindingId);
    this.saveCustomBindings();
  }

  /**
   * Update shortcut binding
   */
  updateShortcut(bindingId: string, newShortcut: KeyboardShortcut): boolean {
    const binding = this.bindings.get(bindingId);
    if (!binding) return false;

    // Check for conflicts
    const conflicts = this.findConflicts(newShortcut, binding.context);
    if (conflicts.length > 0) {
      console.warn('Shortcut conflict detected:', conflicts);
      return false;
    }

    binding.shortcut = newShortcut;
    this.saveCustomBindings();

    return true;
  }

  // ========================================
  // Context Management
  // ========================================

  /**
   * Set active context (e.g., current view)
   */
  setContext(context: string): void {
    this.activeContext = context;
  }

  /**
   * Get active context
   */
  getContext(): string {
    return this.activeContext;
  }

  /**
   * Reset to global context
   */
  resetContext(): void {
    this.activeContext = 'global';
  }

  // ========================================
  // Shortcut Queries
  // ========================================

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): ShortcutBinding[] {
    return Array.from(this.bindings.values());
  }

  /**
   * Get shortcuts for a specific context
   */
  getShortcutsForContext(context: string): ShortcutBinding[] {
    return this.getShortcuts().filter(
      (binding) => binding.context === context || binding.context === 'global'
    );
  }

  /**
   * Get shortcut for a command
   */
  getShortcutForCommand(commandId: string): ShortcutBinding | undefined {
    return Array.from(this.bindings.values()).find(
      (binding) => binding.commandId === commandId
    );
  }

  /**
   * Find conflicts for a shortcut
   */
  findConflicts(shortcut: KeyboardShortcut, context?: string): ShortcutBinding[] {
    return this.getShortcuts().filter((binding) => {
      // Check if contexts overlap
      const contextMatches =
        !context ||
        binding.context === 'global' ||
        context === 'global' ||
        binding.context === context;

      // Check if shortcuts match
      const shortcutMatches = this.shortcutsMatch(shortcut, binding.shortcut);

      return contextMatches && shortcutMatches;
    });
  }

  /**
   * Get all conflicts
   */
  getAllConflicts(): ShortcutConflict[] {
    const conflicts: ShortcutConflict[] = [];
    const checked = new Set<string>();

    this.bindings.forEach((binding) => {
      const key = this.shortcutToString(binding.shortcut);
      if (checked.has(key)) return;
      checked.add(key);

      const conflicting = this.findConflicts(binding.shortcut, binding.context);
      if (conflicting.length > 1) {
        conflicts.push({
          shortcut: binding.shortcut,
          bindings: conflicting,
        });
      }
    });

    return conflicts;
  }

  // ========================================
  // Event Handling
  // ========================================

  /**
   * Register global keyboard event listener
   */
  private registerGlobalListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this.handleKeyDown.bind(this), true);
  }

  /**
   * Handle keyboard event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.isEnabled) return;

    // Ignore shortcuts in input elements (unless Escape)
    if (this.isInputElement(event.target) && event.key !== 'Escape') {
      return;
    }

    const shortcut = this.eventToShortcut(event);

    // Handle chord shortcuts
    if (this.isChordActive) {
      this.handleChordSequence(shortcut, event);
      return;
    }

    // Check for chord start
    const matchingChord = this.findMatchingChordStart(shortcut);
    if (matchingChord) {
      this.startChordSequence(shortcut, matchingChord);
      event.preventDefault();
      return;
    }

    // Find matching binding
    const binding = this.findMatchingBinding(shortcut);
    if (binding) {
      event.preventDefault();
      this.executeBinding(binding, event);
    }
  }

  /**
   * Start chord sequence
   */
  private startChordSequence(shortcut: KeyboardShortcut, chord: ChordShortcut): void {
    this.isChordActive = true;
    this.chordSequence = [shortcut];

    // Set timeout to cancel chord
    this.chordTimeoutId = setTimeout(() => {
      this.cancelChordSequence();
    }, chord.timeout || this.chordTimeout);

    // Show visual indicator for chord mode
    this.showChordIndicator(shortcut, chord);
  }

  /**
   * Handle next key in chord sequence
   */
  private handleChordSequence(shortcut: KeyboardShortcut, event: KeyboardEvent): void {
    this.chordSequence.push(shortcut);

    // Find matching chord
    const matchingChord = Array.from(this.chordBindings.values()).find((chord) =>
      this.sequenceMatches(this.chordSequence, chord.sequence)
    );

    if (matchingChord) {
      // Complete match - execute
      event.preventDefault();
      this.executeChord(matchingChord);
      this.cancelChordSequence();
    } else {
      // Check if sequence could still match
      const potentialMatch = Array.from(this.chordBindings.values()).some((chord) =>
        this.sequenceStartsMatch(this.chordSequence, chord.sequence)
      );

      if (!potentialMatch) {
        // No potential match - cancel
        this.cancelChordSequence();
      }
    }
  }

  /**
   * Cancel chord sequence
   */
  private cancelChordSequence(): void {
    this.isChordActive = false;
    this.chordSequence = [];

    if (this.chordTimeoutId) {
      clearTimeout(this.chordTimeoutId);
      this.chordTimeoutId = undefined;
    }

    // Hide visual indicator
    this.hideChordIndicator();
  }

  /**
   * Find matching binding for shortcut
   */
  private findMatchingBinding(shortcut: KeyboardShortcut): ShortcutBinding | undefined {
    const candidates = this.getShortcutsForContext(this.activeContext).filter((binding) =>
      this.shortcutsMatch(shortcut, binding.shortcut)
    );

    if (candidates.length === 0) return undefined;

    // Sort by priority (higher first)
    candidates.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return candidates[0];
  }

  /**
   * Find chord that starts with this shortcut
   */
  private findMatchingChordStart(shortcut: KeyboardShortcut): ChordShortcut | undefined {
    return Array.from(this.chordBindings.values()).find(
      (chord) => chord.sequence.length > 1 && this.shortcutsMatch(shortcut, chord.sequence[0])
    );
  }

  /**
   * Execute a binding
   */
  private async executeBinding(binding: ShortcutBinding, event: KeyboardEvent): Promise<void> {
    try {
      // Notify listeners
      this.listeners.forEach((listener) => {
        try {
          listener(event, binding);
        } catch (error) {
          console.error('Shortcut listener error:', error);
        }
      });

      // Execute command
      await commandPaletteService.executeCommand(binding.commandId);
    } catch (error) {
      console.error('Failed to execute shortcut:', error);
    }
  }

  /**
   * Execute a chord shortcut
   */
  private async executeChord(chord: ChordShortcut): Promise<void> {
    try {
      await commandPaletteService.executeCommand(chord.commandId);
    } catch (error) {
      console.error('Failed to execute chord:', error);
    }
  }

  // ========================================
  // Chord Visual Indicator
  // ========================================

  /**
   * Show chord mode visual indicator
   */
  private showChordIndicator(shortcut: KeyboardShortcut, chord: ChordShortcut): void {
    if (typeof document === 'undefined') return;

    // Create indicator element if it doesn't exist
    if (!this.chordIndicatorElement) {
      this.chordIndicatorElement = document.createElement('div');
      this.chordIndicatorElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.2s ease-out;
        pointer-events: none;
      `;

      // Add animation keyframes
      if (!document.getElementById('chord-indicator-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'chord-indicator-styles';
        styleEl.textContent = `
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideOut {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(20px);
            }
          }
        `;
        document.head.appendChild(styleEl);
      }
    }

    // Update indicator content
    const firstKey = this.shortcutToString(shortcut);
    const remainingKeys = chord.sequence.slice(1).map(s => this.shortcutToString(s)).join(', ');

    this.chordIndicatorElement.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
        <div>
          <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Chord Mode</div>
          <div><strong>${firstKey}</strong> → Waiting for: ${remainingKeys}</div>
        </div>
      </div>
    `;

    // Add pulse animation for the dot
    if (!document.getElementById('chord-pulse-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'chord-pulse-styles';
      styleEl.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `;
      document.head.appendChild(styleEl);
    }

    // Append to body if not already there
    if (!this.chordIndicatorElement.parentElement) {
      document.body.appendChild(this.chordIndicatorElement);
    }

    // Reset animation
    this.chordIndicatorElement.style.animation = 'none';
    setTimeout(() => {
      if (this.chordIndicatorElement) {
        this.chordIndicatorElement.style.animation = 'slideIn 0.2s ease-out';
      }
    }, 10);
  }

  /**
   * Hide chord mode visual indicator
   */
  private hideChordIndicator(): void {
    if (!this.chordIndicatorElement || typeof document === 'undefined') return;

    // Animate out
    this.chordIndicatorElement.style.animation = 'slideOut 0.2s ease-out';

    // Remove after animation
    setTimeout(() => {
      if (this.chordIndicatorElement && this.chordIndicatorElement.parentElement) {
        this.chordIndicatorElement.parentElement.removeChild(this.chordIndicatorElement);
      }
    }, 200);
  }

  // ========================================
  // Helpers
  // ========================================

  /**
   * Convert keyboard event to shortcut
   */
  private eventToShortcut(event: KeyboardEvent): KeyboardShortcut {
    return {
      key: event.key,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
    };
  }

  /**
   * Check if two shortcuts match
   */
  private shortcutsMatch(a: KeyboardShortcut, b: KeyboardShortcut): boolean {
    return (
      this.normalizeKey(a.key) === this.normalizeKey(b.key) &&
      !!a.ctrl === !!b.ctrl &&
      !!a.shift === !!b.shift &&
      !!a.alt === !!b.alt &&
      !!a.meta === !!b.meta
    );
  }

  /**
   * Check if sequence matches exactly
   */
  private sequenceMatches(sequence: KeyboardShortcut[], target: KeyboardShortcut[]): boolean {
    if (sequence.length !== target.length) return false;
    return sequence.every((shortcut, i) => this.shortcutsMatch(shortcut, target[i]));
  }

  /**
   * Check if sequence could be start of target
   */
  private sequenceStartsMatch(sequence: KeyboardShortcut[], target: KeyboardShortcut[]): boolean {
    if (sequence.length > target.length) return false;
    return sequence.every((shortcut, i) => this.shortcutsMatch(shortcut, target[i]));
  }

  /**
   * Normalize key name
   */
  private normalizeKey(key: string): string {
    const normalized = key.toLowerCase();
    // Handle special cases
    const map: Record<string, string> = {
      ' ': 'space',
      control: 'ctrl',
    };
    return map[normalized] || normalized;
  }

  /**
   * Convert shortcut to string representation
   */
  shortcutToString(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];

    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.meta) parts.push(this.isMac() ? 'Cmd' : 'Win');

    parts.push(this.formatKey(shortcut.key));

    return parts.join('+');
  }

  /**
   * Format key for display
   */
  private formatKey(key: string): string {
    const specialKeys: Record<string, string> = {
      ' ': 'Space',
      arrowup: '↑',
      arrowdown: '↓',
      arrowleft: '←',
      arrowright: '→',
      enter: 'Enter',
      escape: 'Esc',
      backspace: 'Backspace',
      delete: 'Del',
      tab: 'Tab',
    };

    const normalized = key.toLowerCase();
    return specialKeys[normalized] || key.toUpperCase();
  }

  /**
   * Check if running on Mac
   */
  private isMac(): boolean {
    return typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  }

  /**
   * Check if element is input-like
   */
  private isInputElement(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;

    const tagName = target.tagName.toLowerCase();
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable
    );
  }

  /**
   * Generate unique binding ID
   */
  private generateBindingId(): string {
    return `binding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========================================
  // Enable/Disable
  // ========================================

  /**
   * Enable shortcut handling
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable shortcut handling
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Check if shortcuts are enabled
   */
  isShortcutsEnabled(): boolean {
    return this.isEnabled;
  }

  // ========================================
  // Default Shortcuts
  // ========================================

  /**
   * Register default application shortcuts
   */
  private registerDefaultShortcuts(): void {
    // Already handled by commandPaletteService
    // Shortcuts are registered with commands
  }

  // ========================================
  // Persistence
  // ========================================

  /**
   * Load custom bindings from localStorage
   */
  private loadCustomBindings(): void {
    try {
      const stored = localStorage.getItem('keyboard-shortcuts');
      if (stored) {
        const parsed: { bindings: ShortcutBinding[]; chords: ChordShortcut[] } =
          JSON.parse(stored);

        parsed.bindings?.forEach((binding) => {
          this.bindings.set(binding.id, binding);
        });

        parsed.chords?.forEach((chord) => {
          this.chordBindings.set(chord.id, chord);
        });
      }
    } catch (error) {
      console.error('Failed to load keyboard shortcuts:', error);
    }
  }

  /**
   * Save custom bindings to localStorage
   */
  private saveCustomBindings(): void {
    try {
      const data = {
        bindings: Array.from(this.bindings.values()),
        chords: Array.from(this.chordBindings.values()),
      };
      localStorage.setItem('keyboard-shortcuts', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save keyboard shortcuts:', error);
    }
  }

  /**
   * Reset to default shortcuts
   */
  resetToDefaults(): void {
    this.bindings.clear();
    this.chordBindings.clear();
    this.registerDefaultShortcuts();
    this.saveCustomBindings();
  }

  // ========================================
  // Listeners
  // ========================================

  /**
   * Subscribe to shortcut events
   */
  subscribe(
    listener: (event: KeyboardEvent, binding: ShortcutBinding) => void
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }
}

// Export singleton instance
export const keyboardShortcutService = new KeyboardShortcutService();

// Export class for testing
export default KeyboardShortcutService;

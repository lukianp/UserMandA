/**
 * Command Palette Service
 * Centralized command registry with fuzzy search, history, and favorites
 */

import { Command, CommandCategory, CommandContext, CommandHistoryEntry } from '../types/uiux';

/**
 * Command Palette Service Class
 */
class CommandPaletteService {
  private commands: Map<string, Command> = new Map();
  private history: CommandHistoryEntry[] = [];
  private favorites: Set<string> = new Set();
  private maxHistorySize = 50;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadHistory();
    this.loadFavorites();
    this.registerDefaultCommands();
  }

  // ========================================
  // Command Registration
  // ========================================

  /**
   * Register a command
   */
  registerCommand(command: Command): void {
    this.commands.set(command.id, command);
    this.notifyListeners();
  }

  /**
   * Register multiple commands
   */
  registerCommands(commands: Command[]): void {
    commands.forEach((cmd) => this.commands.set(cmd.id, cmd));
    this.notifyListeners();
  }

  /**
   * Unregister a command
   */
  unregisterCommand(commandId: string): void {
    this.commands.delete(commandId);
    this.notifyListeners();
  }

  /**
   * Get all registered commands
   */
  getCommands(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get a specific command
   */
  getCommand(commandId: string): Command | undefined {
    return this.commands.get(commandId);
  }

  // ========================================
  // Command Search
  // ========================================

  /**
   * Search commands with fuzzy matching
   */
  searchCommands(query: string, context?: CommandContext): Command[] {
    if (!query.trim()) {
      return this.getVisibleCommands(context);
    }

    const lowercaseQuery = query.toLowerCase();
    const commands = this.getVisibleCommands(context);

    // Score and sort commands
    const scored = commands.map((cmd) => ({
      command: cmd,
      score: this.calculateMatchScore(cmd, lowercaseQuery),
    }));

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.command);
  }

  /**
   * Get visible commands (respecting visibility conditions)
   */
  private getVisibleCommands(context?: CommandContext): Command[] {
    return this.getCommands().filter((cmd) => {
      if (!cmd.condition) return true;
      try {
        return cmd.condition(context);
      } catch {
        return false;
      }
    });
  }

  /**
   * Calculate fuzzy match score for a command
   */
  private calculateMatchScore(command: Command, query: string): number {
    let score = 0;

    const label = command.label.toLowerCase();
    const description = command.description?.toLowerCase() || '';
    const keywords = command.keywords?.map((k) => k.toLowerCase()) || [];

    // Exact match gets highest score
    if (label === query) return 1000;

    // Label starts with query
    if (label.startsWith(query)) {
      score += 100;
    }

    // Label contains query
    if (label.includes(query)) {
      score += 50;
    }

    // Description contains query
    if (description.includes(query)) {
      score += 30;
    }

    // Keywords match
    for (const keyword of keywords) {
      if (keyword === query) score += 80;
      else if (keyword.startsWith(query)) score += 40;
      else if (keyword.includes(query)) score += 20;
    }

    // Fuzzy character matching
    score += this.fuzzyScore(label, query) * 10;

    // Boost for recent commands
    if (this.isRecentCommand(command.id)) {
      score += 25;
    }

    // Boost for favorites
    if (this.favorites.has(command.id)) {
      score += 50;
    }

    return score;
  }

  /**
   * Calculate fuzzy match score based on character sequence
   */
  private fuzzyScore(text: string, query: string): number {
    let score = 0;
    let lastIndex = -1;

    for (const char of query) {
      const index = text.indexOf(char, lastIndex + 1);
      if (index === -1) return 0; // Character not found

      // Reward consecutive matches
      if (lastIndex !== -1 && index === lastIndex + 1) {
        score += 2;
      } else {
        score += 1;
      }

      lastIndex = index;
    }

    return score;
  }

  // ========================================
  // Command Execution
  // ========================================

  /**
   * Execute a command
   */
  async executeCommand(commandId: string, context?: CommandContext): Promise<void> {
    const command = this.commands.get(commandId);
    if (!command) {
      console.warn(`Command not found: ${commandId}`);
      return;
    }

    // Check visibility condition
    if (command.condition && !command.condition(context)) {
      console.warn(`Command condition not met: ${commandId}`);
      return;
    }

    try {
      await command.handler(context);

      // Add to history
      this.addToHistory(commandId, context);
    } catch (error) {
      console.error(`Command execution failed: ${commandId}`, error);
      throw error;
    }
  }

  // ========================================
  // Command History
  // ========================================

  /**
   * Get command history (most recent first)
   */
  getHistory(): CommandHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Get recent commands
   */
  getRecentCommands(limit: number = 10): Command[] {
    const recentIds = this.history
      .slice(0, limit)
      .map((entry) => entry.commandId);

    // Deduplicate while preserving order
    const uniqueIds = Array.from(new Set(recentIds));

    return uniqueIds
      .map((id) => this.commands.get(id))
      .filter((cmd): cmd is Command => cmd !== undefined);
  }

  /**
   * Check if command was recently used
   */
  private isRecentCommand(commandId: string, within: number = 10): boolean {
    const recentIds = this.history.slice(0, within).map((e) => e.commandId);
    return recentIds.includes(commandId);
  }

  /**
   * Add command to history
   */
  private addToHistory(commandId: string, context?: CommandContext): void {
    const entry: CommandHistoryEntry = {
      commandId,
      executedAt: new Date(),
      context,
    };

    this.history.unshift(entry);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }

    this.saveHistory();
    this.notifyListeners();
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
    this.saveHistory();
    this.notifyListeners();
  }

  // ========================================
  // Favorites
  // ========================================

  /**
   * Get favorite commands
   */
  getFavorites(): Command[] {
    return Array.from(this.favorites)
      .map((id) => this.commands.get(id))
      .filter((cmd): cmd is Command => cmd !== undefined);
  }

  /**
   * Add command to favorites
   */
  addFavorite(commandId: string): void {
    this.favorites.add(commandId);
    this.saveFavorites();
    this.notifyListeners();
  }

  /**
   * Remove command from favorites
   */
  removeFavorite(commandId: string): void {
    this.favorites.delete(commandId);
    this.saveFavorites();
    this.notifyListeners();
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(commandId: string): boolean {
    if (this.favorites.has(commandId)) {
      this.removeFavorite(commandId);
      return false;
    } else {
      this.addFavorite(commandId);
      return true;
    }
  }

  /**
   * Check if command is favorited
   */
  isFavorite(commandId: string): boolean {
    return this.favorites.has(commandId);
  }

  // ========================================
  // Categories
  // ========================================

  /**
   * Get commands by category
   */
  getCommandsByCategory(category: CommandCategory): Command[] {
    return this.getCommands().filter((cmd) => cmd.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): CommandCategory[] {
    const categories = new Set<CommandCategory>();
    this.commands.forEach((cmd) => categories.add(cmd.category));
    return Array.from(categories);
  }

  /**
   * Group commands by category
   */
  groupByCategory(): Map<CommandCategory, Command[]> {
    const grouped = new Map<CommandCategory, Command[]>();

    this.commands.forEach((cmd) => {
      const existing = grouped.get(cmd.category) || [];
      grouped.set(cmd.category, [...existing, cmd]);
    });

    return grouped;
  }

  // ========================================
  // Default Commands
  // ========================================

  /**
   * Register default application commands
   */
  private registerDefaultCommands(): void {
    // Navigation
    this.registerCommand({
      id: 'nav.overview',
      label: 'Go to Overview',
      description: 'Navigate to the Overview dashboard',
      category: 'navigation',
      icon: 'Home',
      shortcut: { key: 'h', ctrl: true, shift: true },
      handler: () => {
        window.location.hash = '#/overview';
      },
    });

    this.registerCommand({
      id: 'nav.users',
      label: 'Go to Users',
      description: 'Navigate to the Users view',
      category: 'navigation',
      icon: 'Users',
      shortcut: { key: 'u', ctrl: true, shift: true },
      handler: () => {
        window.location.hash = '#/users';
      },
    });

    this.registerCommand({
      id: 'nav.groups',
      label: 'Go to Groups',
      description: 'Navigate to the Groups view',
      category: 'navigation',
      icon: 'UsersRound',
      shortcut: { key: 'g', ctrl: true, shift: true },
      handler: () => {
        window.location.hash = '#/groups';
      },
    });

    // Discovery
    this.registerCommand({
      id: 'discovery.domain',
      label: 'Start Domain Discovery',
      description: 'Discover domains in the environment',
      category: 'discovery',
      icon: 'Search',
      handler: () => {
        window.location.hash = '#/discovery/domain';
      },
    });

    // Settings
    this.registerCommand({
      id: 'settings.open',
      label: 'Open Settings',
      description: 'Configure application settings',
      category: 'settings',
      icon: 'Settings',
      shortcut: { key: ',', ctrl: true },
      handler: () => {
        window.location.hash = '#/settings';
      },
    });

    // View
    this.registerCommand({
      id: 'view.toggle-sidebar',
      label: 'Toggle Sidebar',
      description: 'Show or hide the sidebar',
      category: 'view',
      icon: 'PanelLeft',
      shortcut: { key: 'b', ctrl: true },
      handler: () => {
        // This will be implemented with layoutService integration
        console.log('Toggle sidebar');
      },
    });

    // Help
    this.registerCommand({
      id: 'help.docs',
      label: 'Open Documentation',
      description: 'View application documentation',
      category: 'help',
      icon: 'Book',
      shortcut: { key: 'F1' },
      handler: () => {
        window.open('https://docs.example.com', '_blank');
      },
    });
  }

  // ========================================
  // Persistence
  // ========================================

  /**
   * Load history from localStorage
   */
  private loadHistory(): void {
    try {
      const stored = localStorage.getItem('command-history');
      if (stored) {
        const parsed: CommandHistoryEntry[] = JSON.parse(stored);
        this.history = parsed.map((entry) => ({
          ...entry,
          executedAt: new Date(entry.executedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load command history:', error);
    }
  }

  /**
   * Save history to localStorage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem('command-history', JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save command history:', error);
    }
  }

  /**
   * Load favorites from localStorage
   */
  private loadFavorites(): void {
    try {
      const stored = localStorage.getItem('command-favorites');
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        this.favorites = new Set(parsed);
      }
    } catch (error) {
      console.error('Failed to load command favorites:', error);
    }
  }

  /**
   * Save favorites to localStorage
   */
  private saveFavorites(): void {
    try {
      const array = Array.from(this.favorites);
      localStorage.setItem('command-favorites', JSON.stringify(array));
    } catch (error) {
      console.error('Failed to save command favorites:', error);
    }
  }

  // ========================================
  // Listeners
  // ========================================

  /**
   * Subscribe to command registry changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error('Command palette listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const commandPaletteService = new CommandPaletteService();

// Export class for testing
export default CommandPaletteService;

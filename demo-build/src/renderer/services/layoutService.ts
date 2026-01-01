/**
 * Layout Service
 * Manages window layout, panel sizes, grid configurations, and layout profiles
 * Persists layout preferences per user
 */

import {
  LayoutConfig,
  LayoutProfile,
  WindowLayout,
  PanelLayout,
  GridLayout,
  SplitPaneLayout,
} from '../types/uiux';

/**
 * Default layout configuration
 */
const DEFAULT_LAYOUT: LayoutConfig = {
  window: {
    width: 1280,
    height: 800,
    x: 0,
    y: 0,
    isMaximized: false,
    isFullScreen: false,
  },
  panels: {
    sidebarWidth: 280,
    sidebarVisible: true,
    detailsPanelWidth: 300,
    detailsPanelVisible: false,
    footerHeight: 120,
    footerVisible: true,
  },
  grid: {
    columnWidths: {},
    columnOrder: [],
    columnVisibility: {},
  },
  splitPanes: {
    positions: {},
  },
};

/**
 * Layout Service Class
 */
class LayoutService {
  private currentLayout: LayoutConfig;
  private profiles: Map<string, LayoutProfile> = new Map();
  private listeners: Set<(layout: LayoutConfig) => void> = new Set();
  private storageKey = 'layout-config';
  private profilesKey = 'layout-profiles';

  constructor() {
    this.currentLayout = this.loadLayout();
    this.loadProfiles();
  }

  // ========================================
  // Layout Management
  // ========================================

  /**
   * Get current layout configuration
   */
  getCurrentLayout(): LayoutConfig {
    return { ...this.currentLayout };
  }

  /**
   * Update layout configuration
   */
  updateLayout(updates: Partial<LayoutConfig>): void {
    this.currentLayout = {
      ...this.currentLayout,
      ...updates,
    };

    this.saveLayout();
    this.notifyListeners();
  }

  /**
   * Reset layout to defaults
   */
  resetLayout(): void {
    this.currentLayout = { ...DEFAULT_LAYOUT };
    this.saveLayout();
    this.notifyListeners();
  }

  // ========================================
  // Window Layout
  // ========================================

  /**
   * Update window size and position
   */
  updateWindowLayout(window: Partial<WindowLayout>): void {
    this.currentLayout.window = {
      ...this.currentLayout.window,
      ...window,
    };

    this.saveLayout();
    this.notifyListeners();
  }

  /**
   * Get window layout
   */
  getWindowLayout(): WindowLayout {
    return { ...this.currentLayout.window };
  }

  /**
   * Maximize/restore window
   */
  setWindowMaximized(maximized: boolean): void {
    this.updateWindowLayout({ isMaximized: maximized });
  }

  /**
   * Enter/exit fullscreen
   */
  setWindowFullScreen(fullScreen: boolean): void {
    this.updateWindowLayout({ isFullScreen: fullScreen });
  }

  // ========================================
  // Panel Layout
  // ========================================

  /**
   * Update panel layout
   */
  updatePanelLayout(panels: Partial<PanelLayout>): void {
    this.currentLayout.panels = {
      ...this.currentLayout.panels,
      ...panels,
    };

    this.saveLayout();
    this.notifyListeners();
  }

  /**
   * Get panel layout
   */
  getPanelLayout(): PanelLayout {
    return { ...this.currentLayout.panels };
  }

  /**
   * Set sidebar width
   */
  setSidebarWidth(width: number): void {
    this.updatePanelLayout({ sidebarWidth: width });
  }

  /**
   * Toggle sidebar visibility
   */
  toggleSidebar(): void {
    this.updatePanelLayout({
      sidebarVisible: !this.currentLayout.panels.sidebarVisible,
    });
  }

  /**
   * Set sidebar visibility
   */
  setSidebarVisible(visible: boolean): void {
    this.updatePanelLayout({ sidebarVisible: visible });
  }

  /**
   * Set details panel width
   */
  setDetailsPanelWidth(width: number): void {
    this.updatePanelLayout({ detailsPanelWidth: width });
  }

  /**
   * Toggle details panel visibility
   */
  toggleDetailsPanel(): void {
    this.updatePanelLayout({
      detailsPanelVisible: !this.currentLayout.panels.detailsPanelVisible,
    });
  }

  /**
   * Set details panel visibility
   */
  setDetailsPanelVisible(visible: boolean): void {
    this.updatePanelLayout({ detailsPanelVisible: visible });
  }

  /**
   * Set footer height
   */
  setFooterHeight(height: number): void {
    this.updatePanelLayout({ footerHeight: height });
  }

  /**
   * Toggle footer visibility
   */
  toggleFooter(): void {
    this.updatePanelLayout({
      footerVisible: !this.currentLayout.panels.footerVisible,
    });
  }

  // ========================================
  // Grid Layout
  // ========================================

  /**
   * Update grid layout for a specific grid
   */
  updateGridLayout(gridId: string, grid: Partial<GridLayout>): void {
    // Store per-grid configurations
    const storageKey = `grid-layout-${gridId}`;
    const currentGridLayout = this.getGridLayout(gridId);

    const updatedLayout: GridLayout = {
      ...currentGridLayout,
      ...grid,
      columnWidths: {
        ...currentGridLayout.columnWidths,
        ...grid.columnWidths,
      },
      columnVisibility: {
        ...currentGridLayout.columnVisibility,
        ...grid.columnVisibility,
      },
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedLayout));
  }

  /**
   * Get grid layout for a specific grid
   */
  getGridLayout(gridId: string): GridLayout {
    const storageKey = `grid-layout-${gridId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { columnWidths: {}, columnOrder: [], columnVisibility: {} };
      }
    }

    return { columnWidths: {}, columnOrder: [], columnVisibility: {} };
  }

  /**
   * Set column width for a grid
   */
  setColumnWidth(gridId: string, columnId: string, width: number): void {
    const layout = this.getGridLayout(gridId);
    layout.columnWidths[columnId] = width;
    this.updateGridLayout(gridId, layout);
  }

  /**
   * Set column order for a grid
   */
  setColumnOrder(gridId: string, order: string[]): void {
    this.updateGridLayout(gridId, { columnOrder: order });
  }

  /**
   * Set column visibility for a grid
   */
  setColumnVisibility(gridId: string, columnId: string, visible: boolean): void {
    const layout = this.getGridLayout(gridId);
    layout.columnVisibility[columnId] = visible;
    this.updateGridLayout(gridId, layout);
  }

  /**
   * Reset grid layout to defaults
   */
  resetGridLayout(gridId: string): void {
    const storageKey = `grid-layout-${gridId}`;
    localStorage.removeItem(storageKey);
  }

  // ========================================
  // Split Pane Layout
  // ========================================

  /**
   * Update split pane positions
   */
  updateSplitPaneLayout(panes: Partial<SplitPaneLayout>): void {
    this.currentLayout.splitPanes = {
      ...this.currentLayout.splitPanes,
      positions: {
        ...this.currentLayout.splitPanes.positions,
        ...panes.positions,
      },
    };

    this.saveLayout();
    this.notifyListeners();
  }

  /**
   * Get split pane layout
   */
  getSplitPaneLayout(): SplitPaneLayout {
    return { ...this.currentLayout.splitPanes };
  }

  /**
   * Set split pane position
   */
  setSplitPanePosition(paneId: string, position: number): void {
    this.updateSplitPaneLayout({
      positions: {
        [paneId]: position,
      },
    });
  }

  /**
   * Get split pane position
   */
  getSplitPanePosition(paneId: string): number | undefined {
    return this.currentLayout.splitPanes.positions[paneId];
  }

  // ========================================
  // Layout Profiles
  // ========================================

  /**
   * Get all layout profiles
   */
  getProfiles(): LayoutProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Get a specific profile
   */
  getProfile(id: string): LayoutProfile | undefined {
    return this.profiles.get(id);
  }

  /**
   * Save current layout as a profile
   */
  saveAsProfile(name: string, description?: string): LayoutProfile {
    const profile: LayoutProfile = {
      id: this.generateProfileId(),
      name,
      description,
      config: { ...this.currentLayout },
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.profiles.set(profile.id, profile);
    this.saveProfiles();

    return profile;
  }

  /**
   * Update an existing profile
   */
  updateProfile(id: string, updates: Partial<LayoutProfile>): void {
    const profile = this.profiles.get(id);
    if (!profile) return;

    const updated: LayoutProfile = {
      ...profile,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };

    this.profiles.set(id, updated);
    this.saveProfiles();
  }

  /**
   * Delete a profile
   */
  deleteProfile(id: string): void {
    this.profiles.delete(id);
    this.saveProfiles();
  }

  /**
   * Apply a layout profile
   */
  applyProfile(id: string): boolean {
    const profile = this.profiles.get(id);
    if (!profile) return false;

    this.currentLayout = { ...profile.config };
    this.saveLayout();
    this.notifyListeners();

    return true;
  }

  /**
   * Set default profile
   */
  setDefaultProfile(id: string): void {
    // Clear existing default
    this.profiles.forEach((profile) => {
      profile.isDefault = false;
    });

    // Set new default
    const profile = this.profiles.get(id);
    if (profile) {
      profile.isDefault = true;
      this.saveProfiles();
    }
  }

  /**
   * Get default profile
   */
  getDefaultProfile(): LayoutProfile | undefined {
    return Array.from(this.profiles.values()).find((p) => p.isDefault);
  }

  // ========================================
  // Presets
  // ========================================

  /**
   * Apply compact layout preset
   */
  applyCompactLayout(): void {
    this.updateLayout({
      panels: {
        ...this.currentLayout.panels,
        sidebarWidth: 200,
        detailsPanelWidth: 250,
        footerHeight: 80,
      },
    });
  }

  /**
   * Apply wide layout preset
   */
  applyWideLayout(): void {
    this.updateLayout({
      panels: {
        ...this.currentLayout.panels,
        sidebarWidth: 320,
        detailsPanelWidth: 400,
        footerHeight: 150,
      },
    });
  }

  /**
   * Apply focus mode (hide side panels)
   */
  applyFocusMode(): void {
    this.updateLayout({
      panels: {
        ...this.currentLayout.panels,
        sidebarVisible: false,
        detailsPanelVisible: false,
        footerVisible: false,
      },
    });
  }

  // ========================================
  // Persistence
  // ========================================

  /**
   * Load layout from localStorage
   */
  private loadLayout(): LayoutConfig {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_LAYOUT, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load layout:', error);
    }

    return { ...DEFAULT_LAYOUT };
  }

  /**
   * Save layout to localStorage
   */
  private saveLayout(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.currentLayout));
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  }

  /**
   * Load profiles from localStorage
   */
  private loadProfiles(): void {
    try {
      const stored = localStorage.getItem(this.profilesKey);
      if (stored) {
        const profiles: LayoutProfile[] = JSON.parse(stored);
        profiles.forEach((profile) => {
          // Convert date strings back to Date objects
          profile.createdAt = new Date(profile.createdAt);
          profile.updatedAt = new Date(profile.updatedAt);
          this.profiles.set(profile.id, profile);
        });
      }
    } catch (error) {
      console.error('Failed to load layout profiles:', error);
    }
  }

  /**
   * Save profiles to localStorage
   */
  private saveProfiles(): void {
    try {
      const profiles = Array.from(this.profiles.values());
      localStorage.setItem(this.profilesKey, JSON.stringify(profiles));
    } catch (error) {
      console.error('Failed to save layout profiles:', error);
    }
  }

  /**
   * Generate unique profile ID
   */
  private generateProfileId(): string {
    return `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========================================
  // Listeners
  // ========================================

  /**
   * Subscribe to layout changes
   */
  subscribe(listener: (layout: LayoutConfig) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of layout change
   */
  private notifyListeners(): void {
    const layout = this.getCurrentLayout();
    this.listeners.forEach((listener) => {
      try {
        listener(layout);
      } catch (error) {
        console.error('Layout listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const layoutService = new LayoutService();

// Export class for testing
export default LayoutService;



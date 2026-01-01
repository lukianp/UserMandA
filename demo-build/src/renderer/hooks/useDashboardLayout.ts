/**
 * useDashboardLayout Hook
 *
 * Manages dashboard tile layouts with proper persistence and state machine
 * to prevent corruption from react-grid-layout initialization issues.
 *
 * State Machine:
 * - loading: Reading from localStorage
 * - measuring: Waiting for container width
 * - stabilizing: Waiting for grid layout to settle
 * - ready: Accepting user input and saves
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout';
import {
  TileLayout,
  isLayoutValid,
  validateLayout,
  computeLayoutHash,
} from '../utils/layoutValidation';

// Grid state machine
export type GridState = 'loading' | 'measuring' | 'stabilizing' | 'ready';

// Responsive layouts type (compatible with react-grid-layout)
export type Layouts = ResponsiveLayouts<string>;

// Dashboard tile configuration
export interface DashboardTile {
  id: string;
  title: string;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
}

// Dashboard state for persistence
export interface DashboardState {
  layouts: Layouts;
  activeTiles: string[];
  showGrid: boolean;
  autoSave: boolean;
  lastSaved: string | null;
}

// Hook options
export interface UseDashboardLayoutOptions {
  storageKey: string;
  defaultLayouts: Layouts;
  defaultActiveTiles: string[];
  availableTiles: DashboardTile[];
  cols: { [breakpoint: string]: number };
  onStateChange?: (state: GridState) => void;
}

// EventCallback type from react-grid-layout v2
type RGLEventCallback = (
  layout: Layout,
  oldItem: LayoutItem | null,
  newItem: LayoutItem | null,
  placeholder: LayoutItem | null,
  event: Event,
  element?: HTMLElement
) => void;

// Hook return type
export interface UseDashboardLayoutReturn {
  // State
  layouts: Layouts;
  activeTiles: string[];
  showGrid: boolean;
  gridState: GridState;
  isReady: boolean;
  isDragging: boolean;
  lastSaved: string | null;

  // Container width management
  containerWidth: number | null;
  containerRef: React.RefObject<HTMLDivElement>;

  // Grid event handlers (react-grid-layout v2 signatures)
  onLayoutChange: (layout: Layout, layouts: Layouts) => void;
  onDragStart: RGLEventCallback;
  onDragStop: RGLEventCallback;
  onResizeStart: RGLEventCallback;
  onResizeStop: RGLEventCallback;

  // Actions
  addTile: (tileId: string) => void;
  removeTile: (tileId: string) => void;
  resetLayout: () => void;
  autoArrange: () => void;
  toggleGrid: () => void;
  forceSave: () => void;
}

const STABILITY_THRESHOLD = 2; // Number of identical layouts before considered stable

export function useDashboardLayout(options: UseDashboardLayoutOptions): UseDashboardLayoutReturn {
  const {
    storageKey,
    defaultLayouts,
    defaultActiveTiles,
    availableTiles,
    cols,
    onStateChange,
  } = options;

  // Core state
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [activeTiles, setActiveTiles] = useState<string[]>(defaultActiveTiles);
  const [showGrid, setShowGrid] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Grid state machine
  const [gridState, setGridState] = useState<GridState>('loading');
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Refs for tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const isUserInteractingRef = useRef(false);
  const lastLayoutHashRef = useRef<string>('');
  const stabilityCountRef = useRef(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State transition helper - use ref to avoid stale closure issues
  const gridStateRef = useRef<GridState>(gridState);
  gridStateRef.current = gridState;

  const transitionState = useCallback((newState: GridState) => {
    console.log(`[Dashboard] State: ${gridStateRef.current} → ${newState}`);
    setGridState(newState);
    onStateChange?.(newState);
  }, [onStateChange]);

  // Load from localStorage on mount
  useEffect(() => {
    console.log('[Dashboard] Loading state from localStorage...');
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: DashboardState = JSON.parse(saved);

        // Validate loaded layout - convert Layout to TileLayout for validation
        const lgLayout = parsed.layouts?.lg || [];
        const tileLayoutForValidation: TileLayout[] = lgLayout.map(item => ({
          i: item.i, x: item.x, y: item.y, w: item.w, h: item.h,
          minW: item.minW, minH: item.minH, maxW: item.maxW, maxH: item.maxH,
        }));
        const validation = validateLayout(
          tileLayoutForValidation,
          parsed.activeTiles || defaultActiveTiles,
          { maxCols: cols.lg || 12 }
        );

        if (validation.isValid) {
          console.log('[Dashboard] Loaded valid layout from storage');
          setLayouts(parsed.layouts || defaultLayouts);
          setActiveTiles(parsed.activeTiles || defaultActiveTiles);
          setShowGrid(parsed.showGrid ?? false);
          setLastSaved(parsed.lastSaved || null);
        } else {
          console.warn('[Dashboard] Stored layout invalid, using defaults:', validation.issues);
          setLayouts(defaultLayouts);
          setActiveTiles(defaultActiveTiles);
        }
      } else {
        console.log('[Dashboard] No stored layout, using defaults');
      }
    } catch (error) {
      console.error('[Dashboard] Failed to load layout:', error);
      setLayouts(defaultLayouts);
      setActiveTiles(defaultActiveTiles);
    }

    transitionState('measuring');
  }, [storageKey, defaultLayouts, defaultActiveTiles, cols.lg, transitionState]);

  // ResizeObserver for container width - with retry for late-mounting containers
  useEffect(() => {
    let observer: ResizeObserver | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;
    let stabilizationTimeout: NodeJS.Timeout | null = null;

    const setupObserver = () => {
      const container = containerRef.current;
      if (!container) {
        // Container not yet mounted, retry after a short delay
        console.log('[Dashboard] Container not yet mounted, retrying...');
        retryTimeout = setTimeout(setupObserver, 50);
        return;
      }

      observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const width = entry.contentRect.width;
          if (width > 0) {
            setContainerWidth(width);

            if (gridStateRef.current === 'measuring') {
              console.log(`[Dashboard] Container width measured: ${width}px`);
              transitionState('stabilizing');
              stabilityCountRef.current = 0;
              lastLayoutHashRef.current = '';

              // Fallback: if no layout changes occur, transition to ready after 500ms
              stabilizationTimeout = setTimeout(() => {
                if (gridStateRef.current === 'stabilizing') {
                  console.log('[Dashboard] Stabilization timeout - transitioning to ready');
                  transitionState('ready');
                }
              }, 500);
            }
          }
        }
      });

      observer.observe(container);
    };

    setupObserver();

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
      if (stabilizationTimeout) clearTimeout(stabilizationTimeout);
      if (observer) observer.disconnect();
    };
  }, [transitionState]);

  // Save to localStorage
  const saveToStorage = useCallback((layoutsToSave: Layouts) => {
    // Validate before saving - convert Layout to TileLayout for validation
    const lgLayout = layoutsToSave.lg || [];
    const tileLayoutForValidation: TileLayout[] = lgLayout.map(item => ({
      i: item.i, x: item.x, y: item.y, w: item.w, h: item.h,
      minW: item.minW, minH: item.minH, maxW: item.maxW, maxH: item.maxH,
    }));

    if (!isLayoutValid(tileLayoutForValidation, 2)) {
      console.warn('[Dashboard] Blocked save - layout validation failed');
      return;
    }

    const state: DashboardState = {
      layouts: layoutsToSave,
      activeTiles,
      showGrid,
      autoSave: true,
      lastSaved: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(state));
    setLastSaved(state.lastSaved);
    console.log('[Dashboard] Layout saved to storage');
  }, [storageKey, activeTiles, showGrid]);

  // Debounced save
  const debouncedSave = useCallback((layoutsToSave: Layouts) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToStorage(layoutsToSave);
    }, 300);
  }, [saveToStorage]);

  // Convert react-grid-layout Layout (readonly LayoutItem[]) to our TileLayout[]
  const toTileLayout = (layout: Layout): TileLayout[] => {
    return layout.map(item => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: item.minW,
      minH: item.minH,
      maxW: item.maxW,
      maxH: item.maxH,
    }));
  };

  // Handle layout change from grid (react-grid-layout v2 signature)
  const onLayoutChange = useCallback((currentLayout: Layout, allLayouts: Layouts) => {
    const tileLayout = toTileLayout(currentLayout);
    const hash = computeLayoutHash(tileLayout);
    const currentState = gridStateRef.current;

    // During stabilization, track layout stability
    if (currentState === 'stabilizing') {
      if (hash === lastLayoutHashRef.current) {
        stabilityCountRef.current++;
        if (stabilityCountRef.current >= STABILITY_THRESHOLD) {
          transitionState('ready');
        }
      } else {
        stabilityCountRef.current = 0;
        lastLayoutHashRef.current = hash;
      }
      return; // Don't update state during stabilization
    }

    // Only process in ready state
    if (currentState !== 'ready') {
      return;
    }

    // Only update state if user is actively interacting
    if (!isUserInteractingRef.current) {
      return;
    }

    // Validate incoming layout
    const lgLayout = allLayouts.lg ? toTileLayout(allLayouts.lg) : tileLayout;
    if (!isLayoutValid(lgLayout, 2)) {
      console.warn('[Dashboard] Rejected invalid layout change');
      return;
    }

    // Store the layouts (already in correct format from react-grid-layout v2)
    setLayouts(allLayouts);
  }, [transitionState]);

  // Drag handlers (react-grid-layout v2 signature)
  const onDragStart: RGLEventCallback = useCallback(() => {
    isUserInteractingRef.current = true;
    setIsDragging(true);
  }, []);

  const onDragStop: RGLEventCallback = useCallback((layout: Layout) => {
    setIsDragging(false);

    // Small delay to capture final layout change
    setTimeout(() => {
      isUserInteractingRef.current = false;

      // Save the layout
      if (gridStateRef.current === 'ready') {
        const tileLayout = toTileLayout(layout);

        if (isLayoutValid(tileLayout, 2)) {
          const newLayouts = { ...layouts, lg: layout };
          setLayouts(newLayouts);
          debouncedSave(newLayouts);
        }
      }
    }, 50);
  }, [layouts, debouncedSave]);

  // Resize handlers (react-grid-layout v2 signature)
  const onResizeStart: RGLEventCallback = useCallback(() => {
    isUserInteractingRef.current = true;
    setIsDragging(true);
  }, []);

  const onResizeStop: RGLEventCallback = useCallback((layout: Layout) => {
    setIsDragging(false);

    setTimeout(() => {
      isUserInteractingRef.current = false;

      if (gridStateRef.current === 'ready') {
        const tileLayout = toTileLayout(layout);

        if (isLayoutValid(tileLayout, 2)) {
          const newLayouts = { ...layouts, lg: layout };
          setLayouts(newLayouts);
          debouncedSave(newLayouts);
        }
      }
    }, 50);
  }, [layouts, debouncedSave]);

  // Add tile
  const addTile = useCallback((tileId: string) => {
    if (activeTiles.includes(tileId)) return;

    const tile = availableTiles.find(t => t.id === tileId);
    if (!tile) return;

    const newTiles = [...activeTiles, tileId];
    setActiveTiles(newTiles);

    // Calculate position for new tile
    const currentLg = layouts.lg || [];
    const maxY = currentLg.reduce((max, item) => Math.max(max, item.y + item.h), 0);

    const newLayoutItem: LayoutItem = {
      i: tileId,
      x: 0,
      y: maxY,
      w: tile.defaultSize.w,
      h: tile.defaultSize.h,
      minW: tile.minSize?.w || 2,
      minH: tile.minSize?.h || 2,
    };

    const newLayouts: Layouts = {
      ...layouts,
      lg: [...currentLg, newLayoutItem],
    };

    setLayouts(newLayouts);
    saveToStorage(newLayouts);
  }, [activeTiles, availableTiles, layouts, saveToStorage]);

  // Remove tile
  const removeTile = useCallback((tileId: string) => {
    const newTiles = activeTiles.filter(id => id !== tileId);
    setActiveTiles(newTiles);

    const currentLg = layouts.lg || [];
    const newLayouts: Layouts = {
      ...layouts,
      lg: currentLg.filter(item => item.i !== tileId),
    };

    setLayouts(newLayouts);
    saveToStorage(newLayouts);
  }, [activeTiles, layouts, saveToStorage]);

  // Reset to defaults
  const resetLayout = useCallback(() => {
    setLayouts(defaultLayouts);
    setActiveTiles(defaultActiveTiles);
    saveToStorage(defaultLayouts);
  }, [defaultLayouts, defaultActiveTiles, saveToStorage]);

  // Auto-arrange tiles
  const autoArrange = useCallback(() => {
    const gridCols = cols.lg || 12;
    const arrangedLayout: LayoutItem[] = [];
    let currentY = 0;
    let currentX = 0;
    let rowHeight = 0;

    for (const tileId of activeTiles) {
      const tile = availableTiles.find(t => t.id === tileId);
      if (!tile) continue;

      const w = tile.defaultSize.w;
      const h = tile.defaultSize.h;

      // Check if tile fits in current row
      if (currentX + w > gridCols) {
        currentX = 0;
        currentY += rowHeight;
        rowHeight = 0;
      }

      arrangedLayout.push({
        i: tileId,
        x: currentX,
        y: currentY,
        w,
        h,
        minW: tile.minSize?.w || 2,
        minH: tile.minSize?.h || 2,
      });

      currentX += w;
      rowHeight = Math.max(rowHeight, h);
    }

    const newLayouts: Layouts = { ...layouts, lg: arrangedLayout };
    setLayouts(newLayouts);
    saveToStorage(newLayouts);
    console.log('[Dashboard] Tiles auto-arranged');
  }, [activeTiles, availableTiles, cols.lg, layouts, saveToStorage]);

  // Toggle grid visibility
  const toggleGrid = useCallback(() => {
    setShowGrid(prev => !prev);
  }, []);

  // Force save
  const forceSave = useCallback(() => {
    saveToStorage(layouts);
  }, [layouts, saveToStorage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    layouts,
    activeTiles,
    showGrid,
    gridState,
    isReady: gridState === 'ready',
    isDragging,
    lastSaved,

    // Container width management
    containerWidth,
    containerRef,

    // Grid event handlers
    onLayoutChange,
    onDragStart,
    onDragStop,
    onResizeStart,
    onResizeStop,

    // Actions
    addTile,
    removeTile,
    resetLayout,
    autoArrange,
    toggleGrid,
    forceSave,
  };
}

export default useDashboardLayout;

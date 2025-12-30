/**
 * OverviewView Component
 *
 * Dashboard overview with draggable, resizable tiles using react-grid-layout.
 * Displays project timeline, statistics, system health, and recent activity.
 *
 * Phase 7: Complete Dashboard Implementation with Tile System
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GridLayout, { Responsive } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import { RefreshCw, Users, Layers, Monitor, Server, AlertCircle, Plus, X, GripVertical, Grid3X3, Save, RotateCcw } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useDashboardLogic } from '../../hooks/useDashboardLogic';
import { ProjectTimelineCard } from '../../components/molecules/ProjectTimelineCard';
import { StatisticsCard } from '../../components/molecules/StatisticsCard';
import { SystemHealthPanel } from '../../components/molecules/SystemHealthPanel';
import { RecentActivityFeed } from '../../components/molecules/RecentActivityFeed';
import { QuickActionsPanel } from '../../components/molecules/QuickActionsPanel';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { useProfileStore } from '../../store/useProfileStore';
import { DiscoveryProgressTile } from '../../components/molecules/DiscoveryProgressTile';
import { SecurityAlertsTile } from '../../components/molecules/SecurityAlertsTile';

// WidthProvider HOC - use type assertion since library types may not match exports
const WidthProvider = (GridLayout as any).WidthProvider as
  (<P extends object>(component: React.ComponentType<P>) => React.ComponentType<Omit<P, 'width'>>) | undefined;
const ResponsiveGridLayout = WidthProvider ? WidthProvider(Responsive) : Responsive;

// Tile configuration interface
interface DashboardTile {
  id: string;
  title: string;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
}

// Layout persistence with enhanced grid snapping
interface TileLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  isBounded?: boolean;
}

// Enhanced dashboard state for persistence
interface DashboardState {
  layouts: { [key: string]: TileLayout[] };
  activeTiles: string[];
  showGrid: boolean;
  autoSave: boolean;
  lastSaved: string | null;
}

// Grid configuration constants
const GRID_CONFIG = {
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 100,
  margin: [16, 16] as [number, number],
  containerPadding: [0, 0] as [number, number],
};

// Storage key for dashboard state
const DASHBOARD_STATE_KEY = 'dashboard-state-v2';

// Available tiles configuration
const AVAILABLE_TILES: DashboardTile[] = [
  { id: 'timeline', title: 'Project Timeline', defaultSize: { w: 12, h: 2 }, minSize: { w: 6, h: 2 } },
  { id: 'users', title: 'Users', defaultSize: { w: 3, h: 2 }, minSize: { w: 2, h: 2 } },
  { id: 'groups', title: 'Groups', defaultSize: { w: 3, h: 2 }, minSize: { w: 2, h: 2 } },
  { id: 'computers', title: 'Computers', defaultSize: { w: 3, h: 2 }, minSize: { w: 2, h: 2 } },
  { id: 'infrastructure', title: 'Infrastructure', defaultSize: { w: 3, h: 2 }, minSize: { w: 2, h: 2 } },
  { id: 'activity', title: 'Recent Activity', defaultSize: { w: 8, h: 4 }, minSize: { w: 4, h: 3 } },
  { id: 'health', title: 'System Health', defaultSize: { w: 4, h: 2 }, minSize: { w: 3, h: 2 } },
  { id: 'quickactions', title: 'Quick Actions', defaultSize: { w: 4, h: 2 }, minSize: { w: 3, h: 2 } },
  { id: 'discovery', title: 'Discovery Progress', defaultSize: { w: 6, h: 3 }, minSize: { w: 4, h: 2 } },
  { id: 'security', title: 'Security Alerts', defaultSize: { w: 6, h: 3 }, minSize: { w: 4, h: 2 } },
];

// Default layouts
const DEFAULT_LAYOUTS: { lg: TileLayout[] } = {
  lg: [
    { i: 'timeline', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
    { i: 'users', x: 0, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'groups', x: 3, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'computers', x: 6, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'infrastructure', x: 9, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
    { i: 'activity', x: 0, y: 4, w: 8, h: 4, minW: 4, minH: 3 },
    { i: 'health', x: 8, y: 4, w: 4, h: 2, minW: 3, minH: 2 },
    { i: 'quickactions', x: 8, y: 6, w: 4, h: 2, minW: 3, minH: 2 },
  ],
};

const DEFAULT_ACTIVE_TILES = ['timeline', 'users', 'groups', 'computers', 'infrastructure', 'activity', 'health', 'quickactions'];

/**
 * OverviewView Component with Draggable Tiles
 */
const OverviewView: React.FC = () => {
  const { stats, project, health, activity, isLoading, error, reload } = useDashboardLogic();
  const navigate = useNavigate();
  const { selectedSourceProfile } = useProfileStore();

  // Enhanced state management with full persistence
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    layouts: DEFAULT_LAYOUTS,
    activeTiles: DEFAULT_ACTIVE_TILES,
    showGrid: false,
    autoSave: true,
    lastSaved: null,
  });
  const [showAddTile, setShowAddTile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load dashboard state from localStorage on mount
  useEffect(() => {
    const loadDashboardState = () => {
      try {
        // Try new storage format first
        const savedState = localStorage.getItem(DASHBOARD_STATE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          console.log('[OverviewView] Loaded dashboard state:', parsed);
          setDashboardState({
            layouts: parsed.layouts || DEFAULT_LAYOUTS,
            activeTiles: parsed.activeTiles || DEFAULT_ACTIVE_TILES,
            showGrid: parsed.showGrid || false,
            autoSave: parsed.autoSave !== false,
            lastSaved: parsed.lastSaved || null,
          });
          return;
        }

        // Migrate from old storage format
        const oldLayout = localStorage.getItem('dashboard-layout');
        const oldTiles = localStorage.getItem('dashboard-active-tiles');
        if (oldLayout || oldTiles) {
          console.log('[OverviewView] Migrating from old storage format');
          const migratedState: DashboardState = {
            layouts: oldLayout ? JSON.parse(oldLayout) : DEFAULT_LAYOUTS,
            activeTiles: oldTiles ? JSON.parse(oldTiles) : DEFAULT_ACTIVE_TILES,
            showGrid: false,
            autoSave: true,
            lastSaved: null,
          };
          setDashboardState(migratedState);
          // Save in new format and remove old keys
          localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify(migratedState));
          localStorage.removeItem('dashboard-layout');
          localStorage.removeItem('dashboard-active-tiles');
        }
      } catch (e) {
        console.error('[OverviewView] Failed to load dashboard state:', e);
        // Reset to defaults on error
        setDashboardState({
          layouts: DEFAULT_LAYOUTS,
          activeTiles: DEFAULT_ACTIVE_TILES,
          showGrid: false,
          autoSave: true,
          lastSaved: null,
        });
      }
    };

    loadDashboardState();
  }, []);

  // Grid snapping function - ensures tiles align to grid
  const snapToGrid = useCallback((layout: TileLayout[], cols: number): TileLayout[] => {
    return layout.map(item => ({
      ...item,
      x: Math.max(0, Math.min(Math.round(item.x), cols - item.w)),
      y: Math.max(0, Math.round(item.y)),
      w: Math.max(item.minW || 2, Math.min(Math.round(item.w), cols - Math.round(item.x))),
      h: Math.max(item.minH || 2, Math.round(item.h)),
    }));
  }, []);

  // Collision detection and resolution
  const resolveCollisions = useCallback((layout: TileLayout[], cols: number): TileLayout[] => {
    const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    const resolved: TileLayout[] = [];

    sorted.forEach(item => {
      let newItem = { ...item };
      let collision = true;
      let attempts = 0;
      const maxAttempts = 50;

      while (collision && attempts < maxAttempts) {
        collision = false;

        for (const existing of resolved) {
          if (newItem.i !== existing.i &&
              newItem.x < existing.x + existing.w &&
              newItem.x + newItem.w > existing.x &&
              newItem.y < existing.y + existing.h &&
              newItem.y + newItem.h > existing.y) {
            // Collision detected - move below
            newItem.y = existing.y + existing.h;
            collision = true;
            break;
          }
        }

        // If still colliding and can move right, do so
        if (collision && newItem.x + newItem.w < cols) {
          newItem.x = Math.min(newItem.x + 1, cols - newItem.w);
        }

        attempts++;
      }

      resolved.push(newItem);
    });

    return resolved;
  }, []);

  // Save dashboard state (debounced)
  const saveDashboardState = useCallback((newState: Partial<DashboardState>) => {
    const updatedState = {
      ...dashboardState,
      ...newState,
      lastSaved: new Date().toISOString(),
    };

    setDashboardState(updatedState);
    localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify(updatedState));
    console.log('[OverviewView] Dashboard state saved at', updatedState.lastSaved);
  }, [dashboardState]);

  // Debounced auto-save for layout changes
  const debouncedSave = useCallback((newLayouts: { [key: string]: TileLayout[] }) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (dashboardState.autoSave) {
        saveDashboardState({ layouts: newLayouts });
      }
    }, 500); // 500ms debounce for responsive feel
  }, [dashboardState.autoSave, saveDashboardState]);

  // Handle layout change with snapping and collision resolution
  // Note: react-grid-layout types may vary, using type assertions for compatibility
  const onLayoutChange = useCallback((_currentLayout: unknown, allLayouts: unknown) => {
    // Convert and enhance layouts
    const enhancedLayouts: { [key: string]: TileLayout[] } = {};
    const layoutsObj = allLayouts as { [key: string]: TileLayout[] };

    Object.entries(layoutsObj).forEach(([breakpoint, layout]) => {
      const enhanced = layout.map((item: TileLayout) => {
        const tileConfig = AVAILABLE_TILES.find(t => t.id === item.i);
        return {
          ...item,
          minW: tileConfig?.minSize?.w || 2,
          minH: tileConfig?.minSize?.h || 2,
        } as TileLayout;
      });

      // Apply grid snapping
      const cols = GRID_CONFIG.cols[breakpoint as keyof typeof GRID_CONFIG.cols] || 12;
      const snapped = snapToGrid(enhanced, cols);

      // Resolve collisions
      const resolved = resolveCollisions(snapped, cols);

      enhancedLayouts[breakpoint] = resolved;
    });

    // Update state immediately for responsive feel
    setDashboardState(prev => ({
      ...prev,
      layouts: enhancedLayouts,
    }));

    // Debounced save
    debouncedSave(enhancedLayouts);
  }, [snapToGrid, resolveCollisions, debouncedSave]);

  // Add tile
  const addTile = useCallback((tileId: string) => {
    if (dashboardState.activeTiles.includes(tileId)) return;

    const tile = AVAILABLE_TILES.find(t => t.id === tileId);
    if (!tile) return;

    const newTiles = [...dashboardState.activeTiles, tileId];

    // Calculate Y position for new tile (find max Y + height)
    const maxY = dashboardState.layouts.lg?.reduce((max, item) => Math.max(max, item.y + item.h), 0) || 0;

    // Add to layout with snapped position
    const newLayout: TileLayout = {
      i: tileId,
      x: 0,
      y: maxY, // Place at the bottom
      w: tile.defaultSize.w,
      h: tile.defaultSize.h,
      minW: tile.minSize?.w || 2,
      minH: tile.minSize?.h || 2,
    };

    const newLayouts = {
      ...dashboardState.layouts,
      lg: [...(dashboardState.layouts.lg || []), newLayout],
    };

    saveDashboardState({ layouts: newLayouts, activeTiles: newTiles });
    setShowAddTile(false);
  }, [dashboardState.activeTiles, dashboardState.layouts, saveDashboardState]);

  // Remove tile
  const removeTile = useCallback((tileId: string) => {
    const newTiles = dashboardState.activeTiles.filter(t => t !== tileId);
    const newLayouts: { [key: string]: TileLayout[] } = {};

    Object.entries(dashboardState.layouts).forEach(([breakpoint, layout]) => {
      newLayouts[breakpoint] = layout.filter(l => l.i !== tileId);
    });

    saveDashboardState({ layouts: newLayouts, activeTiles: newTiles });
  }, [dashboardState.activeTiles, dashboardState.layouts, saveDashboardState]);

  // Reset layout to defaults
  const resetLayout = useCallback(() => {
    const resetState: DashboardState = {
      layouts: DEFAULT_LAYOUTS,
      activeTiles: DEFAULT_ACTIVE_TILES,
      showGrid: dashboardState.showGrid,
      autoSave: dashboardState.autoSave,
      lastSaved: new Date().toISOString(),
    };
    setDashboardState(resetState);
    localStorage.setItem(DASHBOARD_STATE_KEY, JSON.stringify(resetState));
    console.log('[OverviewView] Dashboard reset to defaults');
  }, [dashboardState.showGrid, dashboardState.autoSave]);

  // Toggle grid visibility
  const toggleGrid = useCallback(() => {
    saveDashboardState({ showGrid: !dashboardState.showGrid });
  }, [dashboardState.showGrid, saveDashboardState]);

  // Manual save
  const manualSave = useCallback(() => {
    saveDashboardState({});
  }, [saveDashboardState]);

  // Render tile content
  const renderTileContent = useCallback((tileId: string) => {
    switch (tileId) {
      case 'timeline':
        return project ? <ProjectTimelineCard project={project} /> : null;
      case 'users':
        return (
          <StatisticsCard
            title="Users"
            value={stats?.totalUsers || 0}
            discovered={stats?.discoveredUsers}
            migrated={stats?.migratedUsers}
            icon={<Users className="w-6 h-6" />}
            onClick={() => navigate('/users')}
          />
        );
      case 'groups':
        return (
          <StatisticsCard
            title="Groups"
            value={stats?.totalGroups || 0}
            discovered={stats?.discoveredGroups}
            migrated={stats?.migratedGroups}
            icon={<Layers className="w-6 h-6" />}
            onClick={() => navigate('/groups')}
          />
        );
      case 'computers':
        return (
          <StatisticsCard
            title="Computers"
            value={stats?.totalComputers || 0}
            discovered={stats?.discoveredComputers}
            icon={<Monitor className="w-6 h-6" />}
            onClick={() => navigate('/computers')}
          />
        );
      case 'infrastructure':
        return (
          <StatisticsCard
            title="Infrastructure"
            value={stats?.totalInfrastructure || 0}
            icon={<Server className="w-6 h-6" />}
            onClick={() => navigate('/infrastructure')}
          />
        );
      case 'activity':
        return <RecentActivityFeed activities={activity} />;
      case 'health':
        return health ? <SystemHealthPanel health={health} /> : null;
      case 'quickactions':
        return <QuickActionsPanel />;
      case 'discovery':
        return <DiscoveryProgressTile />;
      case 'security':
        return <SecurityAlertsTile />;
      default:
        return null;
    }
  }, [stats, project, health, activity, navigate]);

  // Available tiles that are not active
  const availableTilesToAdd = useMemo(() =>
    AVAILABLE_TILES.filter(tile => !dashboardState.activeTiles.includes(tile.id)),
  [dashboardState.activeTiles]);

  // Loading state
  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-[var(--danger)] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-[var(--danger)] mb-6">{error}</p>
          <Button onClick={reload} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-auto" data-testid="overview-view" data-cy="overview-view">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            M&A Intelligence & Integration Platform
            {selectedSourceProfile && (
              <span className="ml-2 text-xs">
                • {selectedSourceProfile.companyName}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Grid Toggle */}
          <Button
            onClick={toggleGrid}
            variant={dashboardState.showGrid ? "primary" : "secondary"}
            size="sm"
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            {dashboardState.showGrid ? 'Hide Grid' : 'Show Grid'}
          </Button>

          {/* Manual Save */}
          <Button
            onClick={manualSave}
            variant="secondary"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          {/* Add Tile Dropdown */}
          <div className="relative">
            <Button
              onClick={() => setShowAddTile(!showAddTile)}
              variant="secondary"
              size="sm"
              disabled={availableTilesToAdd.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tile
            </Button>
            {showAddTile && availableTilesToAdd.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg shadow-lg z-50">
                {availableTilesToAdd.map(tile => (
                  <button
                    key={tile.id}
                    onClick={() => addTile(tile.id)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] first:rounded-t-lg last:rounded-b-lg"
                  >
                    {tile.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Layout */}
          <Button onClick={resetLayout} variant="secondary" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {/* Refresh Data */}
          <Button
            onClick={reload}
            variant="secondary"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Draggable Grid with Enhanced Features */}
      <div className="relative">
        {/* Grid Overlay for Visual Alignment */}
        {dashboardState.showGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${(GRID_CONFIG.rowHeight + GRID_CONFIG.margin[0])}px ${(GRID_CONFIG.rowHeight + GRID_CONFIG.margin[1])}px`,
              backgroundPosition: `${GRID_CONFIG.margin[0] / 2}px ${GRID_CONFIG.margin[1] / 2}px`,
            }}
          />
        )}

        {/* Dragging Indicator */}
        {isDragging && (
          <div className="absolute top-2 right-2 z-20 px-3 py-1 bg-blue-500 text-white text-xs rounded-full animate-pulse">
            Arranging tiles...
          </div>
        )}

        <ResponsiveGridLayout
          className="layout"
          layouts={dashboardState.layouts}
          onLayoutChange={onLayoutChange as any}
          onDragStart={() => setIsDragging(true)}
          onDragStop={() => setTimeout(() => setIsDragging(false), 200)}
          onResizeStart={() => setIsDragging(true)}
          onResizeStop={() => setTimeout(() => setIsDragging(false), 200)}
          breakpoints={GRID_CONFIG.breakpoints}
          cols={GRID_CONFIG.cols}
          rowHeight={GRID_CONFIG.rowHeight}
          margin={GRID_CONFIG.margin}
          containerPadding={GRID_CONFIG.containerPadding}
          draggableHandle=".tile-drag-handle"
          compactType={null}
          {...{ isDraggable: true, isResizable: true, resizeHandles: ['se'], preventCollision: false } as any}
        >
          {dashboardState.activeTiles.map(tileId => {
            const tile = AVAILABLE_TILES.find(t => t.id === tileId);
            if (!tile) return null;

            return (
              <div
                key={tileId}
                className={`
                  bg-[var(--bg-primary)] rounded-lg border border-[var(--border)] shadow-sm overflow-hidden
                  hover:shadow-md transition-shadow duration-200
                  ${isDragging ? 'pointer-events-none' : ''}
                `}
              >
                {/* Tile Header with Drag Handle */}
                <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border)]">
                  <div className="flex items-center gap-2 tile-drag-handle cursor-move">
                    <GripVertical className="w-4 h-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" />
                    <span className="text-sm font-medium text-[var(--text-secondary)] select-none">{tile.title}</span>
                  </div>
                  <button
                    onClick={() => removeTile(tileId)}
                    className="p-1 hover:bg-[var(--bg-primary)] rounded text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                    disabled={isDragging}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Tile Content */}
                <div className="p-4 h-[calc(100%-44px)] overflow-auto">
                  {renderTileContent(tileId)}
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>

      {/* Enhanced Footer with Save Status */}
      <div className="text-center text-xs text-[var(--text-secondary)] pt-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span>Last updated: {new Date((stats?.lastDataRefresh ?? 0)).toLocaleString()}</span>
          <span>|</span>
          <span>Data source: {stats?.dataSource ?? 'N/A'}</span>
          <span>|</span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${dashboardState.autoSave ? 'bg-green-500' : 'bg-gray-400'}`} />
            Auto-save: {dashboardState.autoSave ? 'On' : 'Off'}
          </span>
          {dashboardState.lastSaved && (
            <>
              <span>|</span>
              <span>Layout saved: {new Date(dashboardState.lastSaved).toLocaleTimeString()}</span>
            </>
          )}
          <span>|</span>
          <span>Drag tiles to rearrange • Tiles snap to grid</span>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;

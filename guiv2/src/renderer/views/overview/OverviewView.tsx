/**
 * OverviewView Component
 *
 * Dashboard overview with draggable, resizable tiles using react-grid-layout.
 * Uses controlled width and state machine for reliable tile persistence.
 *
 * Phase 8: Refactored with useDashboardLayout hook for proper persistence
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Responsive } from 'react-grid-layout';
import { RefreshCw, Users, Layers, Monitor, Server, AlertCircle, Plus, X, GripVertical, Save, RotateCcw, Key, Download, ChevronDown, Loader2, LayoutGrid, Pencil } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useDashboardLogic } from '../../hooks/useDashboardLogic';
import { useDashboardLayout, type DashboardTile } from '../../hooks/useDashboardLayout';
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
import { useLicense } from '../../hooks/useLicense';
import { useUpdates } from '../../hooks/useUpdates';

// Grid configuration constants
const GRID_CONFIG = {
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 100,
  margin: [16, 16] as [number, number],
  containerPadding: [0, 0] as [number, number],
};

// Storage key for dashboard state
const DASHBOARD_STATE_KEY = 'dashboard-state-v3';

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
const DEFAULT_LAYOUTS = {
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

  // License and Update hooks
  const { licenseInfo, isValid: licenseIsValid, isExpiringSoon } = useLicense();
  const { updateInfo, isChecking: isCheckingUpdates, checkForUpdates, hasUpdateAvailable } = useUpdates();
  const [showLicenseMenu, setShowLicenseMenu] = useState(false);
  const [showAddTile, setShowAddTile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Dashboard layout hook with state machine
  const {
    layouts,
    activeTiles,
    gridState,
    isDragging,
    lastSaved,
    containerWidth,
    containerRef,
    onLayoutChange,
    onDragStart,
    onDragStop,
    onResizeStart,
    onResizeStop,
    addTile,
    removeTile,
    resetLayout,
    autoArrange,
    forceSave,
  } = useDashboardLayout({
    storageKey: DASHBOARD_STATE_KEY,
    defaultLayouts: DEFAULT_LAYOUTS,
    defaultActiveTiles: DEFAULT_ACTIVE_TILES,
    availableTiles: AVAILABLE_TILES,
    cols: GRID_CONFIG.cols,
  });

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
    AVAILABLE_TILES.filter(tile => !activeTiles.includes(tile.id)),
  [activeTiles]);

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
          {/* Edit Dashboard Toggle */}
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "primary" : "secondary"}
            size="sm"
          >
            <Pencil className="w-4 h-4 mr-2" />
            {isEditing ? 'Done Editing' : 'Edit Dashboard'}
          </Button>

          {/* Add Tile Dropdown - only when editing */}
          {isEditing && (
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
                      onClick={() => {
                        addTile(tile.id);
                        setShowAddTile(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] first:rounded-t-lg last:rounded-b-lg"
                    >
                      {tile.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Auto-Arrange Tiles - only when editing */}
          {isEditing && (
            <Button onClick={autoArrange} variant="secondary" size="sm">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Auto-Arrange
            </Button>
          )}

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

          {/* Save - only when editing */}
          {isEditing && (
            <Button
              onClick={forceSave}
              variant="secondary"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}

          {/* Reset Layout - only when editing */}
          {isEditing && (
            <Button onClick={resetLayout} variant="secondary" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}

          {/* License & Update Dropdown */}
          <div className="relative">
            <Button
              onClick={() => setShowLicenseMenu(!showLicenseMenu)}
              variant="secondary"
              size="sm"
              className={`${hasUpdateAvailable ? 'ring-2 ring-blue-500' : ''} ${isExpiringSoon(30) ? 'ring-2 ring-orange-500' : ''}`}
            >
              <Key className="w-4 h-4 mr-2" />
              License & Update
              {(hasUpdateAvailable || isExpiringSoon(30)) && (
                <span className={`ml-2 w-2 h-2 rounded-full ${hasUpdateAvailable ? 'bg-blue-500' : 'bg-orange-500'} animate-pulse`} />
              )}
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
            {showLicenseMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg shadow-lg z-50">
                {/* License Status */}
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${licenseIsValid ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">
                      {licenseInfo?.status === 'active' ? 'Licensed' : 'Unlicensed'}
                    </span>
                  </div>
                  {licenseInfo && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      {licenseInfo.type} • {licenseInfo.customerId}
                    </p>
                  )}
                </div>

                {/* Update Status */}
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Updates</span>
                    {hasUpdateAvailable && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Available</span>
                    )}
                  </div>
                  {updateInfo && hasUpdateAvailable ? (
                    <p className="text-xs text-[var(--text-secondary)]">
                      v{updateInfo.currentVersion} → v{updateInfo.latestVersion}
                    </p>
                  ) : (
                    <p className="text-xs text-[var(--text-secondary)]">
                      v{updateInfo?.currentVersion || '2.0.0'} (Latest)
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      checkForUpdates();
                      setShowLicenseMenu(false);
                    }}
                    disabled={isCheckingUpdates}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] rounded flex items-center gap-2"
                  >
                    {isCheckingUpdates ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isCheckingUpdates ? 'Checking...' : 'Check for Updates'}
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin/license');
                      setShowLicenseMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] rounded flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Manage License
                  </button>
                </div>

                {/* Update Available Notice */}
                {hasUpdateAvailable && (
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-[var(--border)]">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Update available: v{updateInfo?.currentVersion} → v{updateInfo?.latestVersion}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid State Indicator (debug) */}
      {gridState !== 'ready' && (
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>
            {gridState === 'loading' && 'Loading layout...'}
            {gridState === 'measuring' && 'Measuring container...'}
            {gridState === 'stabilizing' && 'Stabilizing grid...'}
          </span>
        </div>
      )}

      {/* Draggable Grid */}
      <div className="relative">
        {/* Dragging Indicator */}
        {isDragging && isEditing && (
          <div className="absolute top-2 right-2 z-20 px-3 py-1 bg-blue-500 text-white text-xs rounded-full animate-pulse">
            Arranging tiles...
          </div>
        )}

        {/* Grid Container with ResizeObserver */}
        <div ref={containerRef as React.RefObject<HTMLDivElement>}>
          {containerWidth ? (
            <Responsive
              className="layout"
              width={containerWidth}
              layouts={layouts}
              onLayoutChange={onLayoutChange}
              onDragStart={onDragStart}
              onDragStop={onDragStop}
              onResizeStart={onResizeStart}
              onResizeStop={onResizeStop}
              breakpoints={GRID_CONFIG.breakpoints}
              cols={GRID_CONFIG.cols}
              rowHeight={GRID_CONFIG.rowHeight}
              margin={GRID_CONFIG.margin}
              containerPadding={GRID_CONFIG.containerPadding}
              dragConfig={{ handle: '.tile-drag-handle', enabled: isEditing }}
              resizeConfig={{ enabled: isEditing, handles: ['se'] }}
            >
              {activeTiles.map(tileId => {
                const tile = AVAILABLE_TILES.find(t => t.id === tileId);
                if (!tile) return null;

                return (
                  <div
                    key={tileId}
                    className={`
                      bg-[var(--bg-primary)] rounded-lg shadow-sm overflow-hidden
                      transition-all duration-300
                      ${isEditing ? 'border border-[var(--border)] hover:shadow-md' : ''}
                      ${isDragging ? 'pointer-events-none' : ''}
                    `}
                  >
                    {/* Tile Header - only show drag handle and close when editing */}
                    {isEditing ? (
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
                    ) : null}
                    {/* Tile Content - full height when not editing (no header) */}
                    <div className={`overflow-auto ${isEditing ? 'p-4 h-[calc(100%-44px)]' : 'p-4 h-full'}`}>
                      {renderTileContent(tileId)}
                    </div>
                  </div>
                );
              })}
            </Responsive>
          ) : (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" className="mx-auto" />
            </div>
          )}
        </div>
      </div>

      {/* Footer with Status */}
      <div className="text-center text-xs text-[var(--text-secondary)] pt-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span>Last updated: {new Date((stats?.lastDataRefresh ?? 0)).toLocaleString()}</span>
          <span>|</span>
          <span>Data source: {stats?.dataSource ?? 'N/A'}</span>
          {lastSaved && (
            <>
              <span>|</span>
              <span>Layout saved: {new Date(lastSaved).toLocaleTimeString()}</span>
            </>
          )}
          {isEditing && (
            <>
              <span>|</span>
              <span className="text-blue-500">Editing mode - drag tiles to rearrange</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewView;

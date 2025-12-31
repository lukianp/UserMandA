/**
 * Layout Validation Utility
 *
 * Validates and sanitizes react-grid-layout layouts to prevent
 * corrupt states (e.g., all tiles at 0,0) from being persisted.
 */

export interface TileLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export interface LayoutValidationResult {
  isValid: boolean;
  issues: string[];
}

/**
 * Validates a layout for common corruption patterns
 */
export function validateLayout(
  layout: TileLayout[],
  activeTiles: string[],
  options: { minTiles?: number; maxCols?: number } = {}
): LayoutValidationResult {
  const { minTiles = 2, maxCols = 12 } = options;
  const issues: string[] = [];

  // Check for empty layout
  if (!layout || layout.length === 0) {
    return { isValid: true, issues: [] }; // Empty is valid (no tiles)
  }

  // Issue 1: All tiles collapsed to origin (main corruption pattern)
  if (layout.length >= minTiles) {
    const allAtOrigin = layout.every(item => item.x === 0 && item.y === 0);
    if (allAtOrigin) {
      issues.push('All tiles collapsed to origin (0,0) - corrupt layout detected');
    }
  }

  // Issue 2: Invalid dimensions
  const invalidDimensions = layout.filter(
    item => item.w <= 0 || item.h <= 0 || item.x < 0 || item.y < 0
  );
  if (invalidDimensions.length > 0) {
    issues.push(`Tiles with invalid dimensions: ${invalidDimensions.map(t => t.i).join(', ')}`);
  }

  // Issue 3: Tiles outside grid bounds
  const outOfBounds = layout.filter(item => item.x + item.w > maxCols);
  if (outOfBounds.length > 0) {
    issues.push(`Tiles outside grid bounds: ${outOfBounds.map(t => t.i).join(', ')}`);
  }

  // Issue 4: Missing tiles that should be in layout
  const layoutIds = new Set(layout.map(l => l.i));
  const missingTiles = activeTiles.filter(id => !layoutIds.has(id));
  if (missingTiles.length > 0) {
    issues.push(`Missing tiles in layout: ${missingTiles.join(', ')}`);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Quick check if layout is valid (no detailed issues)
 */
export function isLayoutValid(layout: TileLayout[], minTiles = 2): boolean {
  if (!layout || layout.length === 0) return true;
  if (layout.length < minTiles) return true;

  // Check for all-at-origin corruption
  const allAtOrigin = layout.every(item => item.x === 0 && item.y === 0);
  if (allAtOrigin) return false;

  // Check for invalid dimensions
  const hasInvalidDimensions = layout.some(
    item => item.w <= 0 || item.h <= 0 || item.x < 0 || item.y < 0
  );
  if (hasInvalidDimensions) return false;

  return true;
}

/**
 * Computes a hash of layout positions for detecting stability
 */
export function computeLayoutHash(layout: TileLayout[]): string {
  return layout
    .map(l => `${l.i}:${l.x},${l.y},${l.w},${l.h}`)
    .sort()
    .join('|');
}

/**
 * Sanitizes a layout by merging with defaults for missing/invalid tiles
 */
export function sanitizeLayout(
  layout: TileLayout[],
  defaults: TileLayout[],
  activeTiles: string[]
): TileLayout[] {
  const result: TileLayout[] = [];
  const layoutMap = new Map(layout.map(l => [l.i, l]));
  const defaultMap = new Map(defaults.map(l => [l.i, l]));

  for (const tileId of activeTiles) {
    const existing = layoutMap.get(tileId);
    const defaultLayout = defaultMap.get(tileId);

    if (existing && existing.w > 0 && existing.h > 0 && existing.x >= 0 && existing.y >= 0) {
      // Use existing layout if valid
      result.push(existing);
    } else if (defaultLayout) {
      // Fall back to default
      result.push(defaultLayout);
    }
    // Skip tiles without default (shouldn't happen)
  }

  return result;
}

/**
 * Applies grid snapping to ensure tiles align to grid
 */
export function snapLayoutToGrid(layout: TileLayout[], cols: number): TileLayout[] {
  return layout.map(item => ({
    ...item,
    x: Math.max(0, Math.min(Math.round(item.x), cols - item.w)),
    y: Math.max(0, Math.round(item.y)),
    w: Math.max(item.minW || 2, Math.min(Math.round(item.w), cols - Math.round(item.x))),
    h: Math.max(item.minH || 2, Math.round(item.h)),
  }));
}

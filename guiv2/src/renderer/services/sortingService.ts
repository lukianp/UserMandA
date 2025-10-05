/**
 * Sorting Service
 * Multi-column sorting with natural sort, custom comparators, and stable sorting
 */

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  direction: SortDirection;
  /** Custom comparator function */
  comparator?: (a: unknown, b: unknown) => number;
  /** Case sensitive (for string sorting) */
  caseSensitive?: boolean;
  /** Natural sort (alphanumeric) */
  natural?: boolean;
}

/**
 * Sort state for persistence
 */
export interface SortState {
  /** Active sort configurations (in priority order) */
  sorts: SortConfig[];
}

/**
 * Sorting Service
 */
export class SortingService {
  private static instance: SortingService;

  private constructor() {
    // Initialize sorting service
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SortingService {
    if (!SortingService.instance) {
      SortingService.instance = new SortingService();
    }
    return SortingService.instance;
  }

  /**
   * Sort data by single field
   * @param data Dataset to sort
   * @param field Field to sort by
   * @param direction Sort direction
   * @param options Sort options
   * @returns Sorted data
   */
  sortBy<T>(
    data: T[],
    field: string,
    direction: SortDirection = 'asc',
    options: Partial<SortConfig> = {}
  ): T[] {
    const config: SortConfig = {
      field,
      direction,
      caseSensitive: options.caseSensitive ?? false,
      natural: options.natural ?? true,
      comparator: options.comparator,
    };

    return this.sort(data, [config]);
  }

  /**
   * Sort data by multiple fields
   * @param data Dataset to sort
   * @param sortConfigs Sort configurations (in priority order)
   * @returns Sorted data
   */
  sort<T>(data: T[], sortConfigs: SortConfig[]): T[] {
    if (sortConfigs.length === 0) {
      return data;
    }

    // Create copy to avoid mutating original
    const sorted = [...data];

    // Stable sort implementation
    const indexed = sorted.map((item, index) => ({ item, index }));

    indexed.sort((a, b) => {
      // Try each sort config in order
      for (const config of sortConfigs) {
        const comparison = this.compare(a.item, b.item, config);

        if (comparison !== 0) {
          return comparison;
        }
      }

      // If all comparisons are equal, preserve original order (stable sort)
      return a.index - b.index;
    });

    return indexed.map((x) => x.item);
  }

  /**
   * Compare two values based on sort config
   */
  private compare<T>(a: T, b: T, config: SortConfig): number {
    const aValue = (a as Record<string, unknown>)[config.field];
    const bValue = (b as Record<string, unknown>)[config.field];

    // Use custom comparator if provided
    if (config.comparator) {
      const result = config.comparator(aValue, bValue);
      return config.direction === 'asc' ? result : -result;
    }

    // Handle null/undefined
    if (aValue === null || aValue === undefined) {
      if (bValue === null || bValue === undefined) return 0;
      return config.direction === 'asc' ? -1 : 1;
    }
    if (bValue === null || bValue === undefined) {
      return config.direction === 'asc' ? 1 : -1;
    }

    let comparison = 0;

    // String comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (config.natural) {
        comparison = this.naturalCompare(aValue, bValue, config.caseSensitive);
      } else {
        comparison = this.stringCompare(aValue, bValue, config.caseSensitive);
      }
    }
    // Number comparison
    else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    }
    // Date comparison
    else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    }
    // Boolean comparison
    else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
    }
    // Mixed types - convert to string
    else {
      const aStr = String(aValue);
      const bStr = String(bValue);
      comparison = config.natural
        ? this.naturalCompare(aStr, bStr, config.caseSensitive)
        : this.stringCompare(aStr, bStr, config.caseSensitive);
    }

    return config.direction === 'asc' ? comparison : -comparison;
  }

  /**
   * Natural sort comparison (handles numbers in strings)
   * @example "Item 2" < "Item 10"
   */
  private naturalCompare(a: string, b: string, caseSensitive = false): number {
    const options: Intl.CollatorOptions = {
      numeric: true,
      sensitivity: caseSensitive ? 'case' : 'base',
    };

    return a.localeCompare(b, undefined, options);
  }

  /**
   * String comparison
   */
  private stringCompare(a: string, b: string, caseSensitive = false): number {
    const aStr = caseSensitive ? a : a.toLowerCase();
    const bStr = caseSensitive ? b : b.toLowerCase();

    if (aStr < bStr) return -1;
    if (aStr > bStr) return 1;
    return 0;
  }

  /**
   * Toggle sort direction
   * @param currentDirection Current direction
   * @returns New direction
   */
  toggleDirection(currentDirection: SortDirection): SortDirection {
    return currentDirection === 'asc' ? 'desc' : 'asc';
  }

  /**
   * Add or update sort in multi-column sort
   * @param currentSorts Current sort configurations
   * @param field Field to sort by
   * @param direction Sort direction
   * @param options Sort options
   * @param maxSorts Maximum number of sorts to keep (default: 3)
   * @returns Updated sort configurations
   */
  updateMultiSort(
    currentSorts: SortConfig[],
    field: string,
    direction: SortDirection,
    options: Partial<SortConfig> = {},
    maxSorts = 3
  ): SortConfig[] {
    // Remove existing sort for this field
    const filtered = currentSorts.filter((s) => s.field !== field);

    // Add new sort at the beginning (highest priority)
    const newSort: SortConfig = {
      field,
      direction,
      caseSensitive: options.caseSensitive ?? false,
      natural: options.natural ?? true,
      comparator: options.comparator,
    };

    const updated = [newSort, ...filtered];

    // Limit to maxSorts
    return updated.slice(0, maxSorts);
  }

  /**
   * Remove field from multi-column sort
   * @param currentSorts Current sort configurations
   * @param field Field to remove
   * @returns Updated sort configurations
   */
  removeSort(currentSorts: SortConfig[], field: string): SortConfig[] {
    return currentSorts.filter((s) => s.field !== field);
  }

  /**
   * Clear all sorts
   */
  clearSorts(): SortConfig[] {
    return [];
  }

  /**
   * Get sort direction for field
   * @param sorts Current sort configurations
   * @param field Field to check
   * @returns Sort direction or null if not sorted
   */
  getSortDirection(sorts: SortConfig[], field: string): SortDirection | null {
    const sort = sorts.find((s) => s.field === field);
    return sort ? sort.direction : null;
  }

  /**
   * Get sort priority for field
   * @param sorts Current sort configurations
   * @param field Field to check
   * @returns Priority (0-based) or null if not sorted
   */
  getSortPriority(sorts: SortConfig[], field: string): number | null {
    const index = sorts.findIndex((s) => s.field === field);
    return index !== -1 ? index : null;
  }

  /**
   * Sort by computed field
   * @param data Dataset to sort
   * @param computeFn Function to compute sort value
   * @param direction Sort direction
   * @returns Sorted data
   */
  sortByComputed<T>(
    data: T[],
    computeFn: (item: T) => unknown,
    direction: SortDirection = 'asc'
  ): T[] {
    const indexed = data.map((item, index) => ({
      item,
      index,
      computed: computeFn(item),
    }));

    indexed.sort((a, b) => {
      let comparison = 0;

      if (a.computed < b.computed) comparison = -1;
      else if (a.computed > b.computed) comparison = 1;
      else comparison = a.index - b.index; // Stable sort

      return direction === 'asc' ? comparison : -comparison;
    });

    return indexed.map((x) => x.item);
  }

  /**
   * Custom comparators for common data types
   */
  static comparators = {
    /**
     * Date comparator
     */
    date: (a: unknown, b: unknown): number => {
      const dateA = a instanceof Date ? a : new Date(String(a));
      const dateB = b instanceof Date ? b : new Date(String(b));

      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;

      return dateA.getTime() - dateB.getTime();
    },

    /**
     * Numeric comparator (handles string numbers)
     */
    numeric: (a: unknown, b: unknown): number => {
      const numA = Number(a);
      const numB = Number(b);

      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;

      return numA - numB;
    },

    /**
     * Version string comparator (e.g., "1.2.3" < "1.10.0")
     */
    version: (a: string, b: string): number => {
      const partsA = a.split('.').map(Number);
      const partsB = b.split('.').map(Number);

      const maxLength = Math.max(partsA.length, partsB.length);

      for (let i = 0; i < maxLength; i++) {
        const partA = partsA[i] || 0;
        const partB = partsB[i] || 0;

        if (partA < partB) return -1;
        if (partA > partB) return 1;
      }

      return 0;
    },

    /**
     * File size comparator (handles strings like "10 MB", "1.5 GB")
     */
    fileSize: (a: string, b: string): number => {
      const sizeA = parseFileSize(a);
      const sizeB = parseFileSize(b);
      return sizeA - sizeB;
    },

    /**
     * IP address comparator
     */
    ip: (a: string, b: string): number => {
      const partsA = a.split('.').map(Number);
      const partsB = b.split('.').map(Number);

      for (let i = 0; i < 4; i++) {
        if (partsA[i] < partsB[i]) return -1;
        if (partsA[i] > partsB[i]) return 1;
      }

      return 0;
    },
  };

  /**
   * Persist sort state to localStorage
   * @param key Storage key
   * @param state Sort state
   */
  persistState(key: string, state: SortState): void {
    try {
      // Remove comparator functions (can't be serialized)
      const serializable = {
        sorts: state.sorts.map((s) => ({
          field: s.field,
          direction: s.direction,
          caseSensitive: s.caseSensitive,
          natural: s.natural,
        })),
      };

      localStorage.setItem(key, JSON.stringify(serializable));
    } catch (error) {
      console.error('Failed to persist sort state:', error);
    }
  }

  /**
   * Restore sort state from localStorage
   * @param key Storage key
   * @returns Sort state or null
   */
  restoreState(key: string): SortState | null {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to restore sort state:', error);
      return null;
    }
  }

  /**
   * Clear persisted state
   * @param key Storage key
   */
  clearPersistedState(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear sort state:', error);
    }
  }
}

/**
 * Parse file size string to bytes
 */
function parseFileSize(size: string): number {
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };

  const match = size.match(/^([\d.]+)\s*([A-Z]+)$/i);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  return value * (units[unit] || 1);
}

export default SortingService.getInstance();

/**
 * Filtering Service
 * Advanced filtering with operators, filter groups, and saved filters
 */

/**
 * Filter operators
 */
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'regex';

/**
 * Filter condition
 */
export interface FilterCondition {
  /** Field name */
  field: string;
  /** Filter operator */
  operator: FilterOperator;
  /** Filter value */
  value?: any;
  /** Second value (for 'between' operator) */
  value2?: any;
  /** Case sensitive comparison */
  caseSensitive?: boolean;
}

/**
 * Filter group combinator
 */
export type FilterCombinator = 'AND' | 'OR';

/**
 * Filter group
 */
export interface FilterGroup {
  /** Combinator (AND/OR) */
  combinator: FilterCombinator;
  /** Filter conditions */
  conditions: FilterCondition[];
  /** Nested filter groups */
  groups?: FilterGroup[];
}

/**
 * Saved filter preset
 */
export interface FilterPreset {
  /** Preset ID */
  id: string;
  /** Preset name */
  name: string;
  /** Description */
  description?: string;
  /** Filter group */
  filter: FilterGroup;
  /** Created date */
  createdAt: Date;
  /** Tags */
  tags?: string[];
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  field: string;
  from: Date | null;
  to: Date | null;
}

/**
 * Numeric range filter
 */
export interface NumericRangeFilter {
  field: string;
  min: number | null;
  max: number | null;
}

/**
 * Filter state for persistence
 */
export interface FilterState {
  activeFilters: FilterGroup;
  searchText?: string;
}

/**
 * Filtering Service
 */
export class FilteringService {
  private static instance: FilteringService;
  private presets: Map<string, FilterPreset> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): FilteringService {
    if (!FilteringService.instance) {
      FilteringService.instance = new FilteringService();
    }
    return FilteringService.instance;
  }

  /**
   * Filter data by a single condition
   * @param data Dataset to filter
   * @param condition Filter condition
   * @returns Filtered data
   */
  filterByCondition<T>(data: T[], condition: FilterCondition): T[] {
    return data.filter((row) => this.evaluateCondition(row, condition));
  }

  /**
   * Filter data by filter group
   * @param data Dataset to filter
   * @param group Filter group
   * @returns Filtered data
   */
  filterByGroup<T>(data: T[], group: FilterGroup): T[] {
    return data.filter((row) => this.evaluateGroup(row, group));
  }

  /**
   * Evaluate filter group against a row
   */
  private evaluateGroup<T>(row: T, group: FilterGroup): boolean {
    // Evaluate conditions
    const conditionResults = group.conditions.map((condition) =>
      this.evaluateCondition(row, condition)
    );

    // Evaluate nested groups
    const groupResults = (group.groups || []).map((nestedGroup) =>
      this.evaluateGroup(row, nestedGroup)
    );

    const allResults = [...conditionResults, ...groupResults];

    // Apply combinator
    if (group.combinator === 'AND') {
      return allResults.every((result) => result);
    } else {
      return allResults.some((result) => result);
    }
  }

  /**
   * Evaluate single condition against a row
   */
  private evaluateCondition<T>(row: T, condition: FilterCondition): boolean {
    const fieldValue = (row as any)[condition.field];
    const { operator, value, value2, caseSensitive = false } = condition;

    // Handle null/undefined
    if (fieldValue === null || fieldValue === undefined) {
      return operator === 'isEmpty' || (operator === 'notEquals' && value !== null);
    }

    // Convert to strings for string operations
    const strField = caseSensitive ? String(fieldValue) : String(fieldValue).toLowerCase();
    const strValue = value !== undefined && value !== null
      ? (caseSensitive ? String(value) : String(value).toLowerCase())
      : '';

    switch (operator) {
      case 'equals':
        return fieldValue === value;

      case 'notEquals':
        return fieldValue !== value;

      case 'contains':
        return strField.includes(strValue);

      case 'notContains':
        return !strField.includes(strValue);

      case 'startsWith':
        return strField.startsWith(strValue);

      case 'endsWith':
        return strField.endsWith(strValue);

      case 'greaterThan':
        return fieldValue > value;

      case 'greaterThanOrEqual':
        return fieldValue >= value;

      case 'lessThan':
        return fieldValue < value;

      case 'lessThanOrEqual':
        return fieldValue <= value;

      case 'between':
        return fieldValue >= value && fieldValue <= value2;

      case 'in':
        return Array.isArray(value) ? value.includes(fieldValue) : false;

      case 'notIn':
        return Array.isArray(value) ? !value.includes(fieldValue) : true;

      case 'isEmpty':
        return fieldValue === '' || fieldValue === null || fieldValue === undefined;

      case 'isNotEmpty':
        return fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;

      case 'regex':
        try {
          const regex = new RegExp(value, caseSensitive ? '' : 'i');
          return regex.test(strField);
        } catch {
          return false;
        }

      default:
        return true;
    }
  }

  /**
   * Full-text search across all fields
   * @param data Dataset to search
   * @param searchText Search text
   * @param fields Fields to search (null = all fields)
   * @param caseSensitive Case sensitive search
   * @returns Filtered data
   */
  fullTextSearch<T>(
    data: T[],
    searchText: string,
    fields?: string[],
    caseSensitive = false
  ): T[] {
    if (!searchText.trim()) {
      return data;
    }

    const search = caseSensitive ? searchText : searchText.toLowerCase();

    return data.filter((row) => {
      const searchFields = fields || Object.keys(row as any);

      return searchFields.some((field) => {
        const value = (row as any)[field];
        if (value === null || value === undefined) return false;

        const str = caseSensitive ? String(value) : String(value).toLowerCase();
        return str.includes(search);
      });
    });
  }

  /**
   * Date range filter
   * @param data Dataset to filter
   * @param filter Date range filter
   * @returns Filtered data
   */
  filterByDateRange<T>(data: T[], filter: DateRangeFilter): T[] {
    return data.filter((row) => {
      const value = (row as any)[filter.field];
      if (!value) return false;

      const date = new Date(value);
      if (isNaN(date.getTime())) return false;

      if (filter.from && date < filter.from) return false;
      if (filter.to && date > filter.to) return false;

      return true;
    });
  }

  /**
   * Numeric range filter
   * @param data Dataset to filter
   * @param filter Numeric range filter
   * @returns Filtered data
   */
  filterByNumericRange<T>(data: T[], filter: NumericRangeFilter): T[] {
    return data.filter((row) => {
      const value = Number((row as any)[filter.field]);
      if (isNaN(value)) return false;

      if (filter.min !== null && value < filter.min) return false;
      if (filter.max !== null && value > filter.max) return false;

      return true;
    });
  }

  /**
   * Save filter preset
   * @param preset Filter preset
   */
  savePreset(preset: Omit<FilterPreset, 'id' | 'createdAt'>): FilterPreset {
    const id = `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullPreset: FilterPreset = {
      ...preset,
      id,
      createdAt: new Date(),
    };

    this.presets.set(id, fullPreset);
    return fullPreset;
  }

  /**
   * Get filter preset
   * @param id Preset ID
   * @returns Filter preset or undefined
   */
  getPreset(id: string): FilterPreset | undefined {
    return this.presets.get(id);
  }

  /**
   * Get all presets
   */
  getPresets(): FilterPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Delete preset
   * @param id Preset ID
   * @returns True if deleted
   */
  deletePreset(id: string): boolean {
    return this.presets.delete(id);
  }

  /**
   * Apply saved preset to data
   * @param data Dataset to filter
   * @param presetId Preset ID
   * @returns Filtered data
   */
  applyPreset<T>(data: T[], presetId: string): T[] {
    const preset = this.presets.get(presetId);
    if (!preset) {
      throw new Error(`Filter preset not found: ${presetId}`);
    }

    return this.filterByGroup(data, preset.filter);
  }

  /**
   * Create an empty filter group
   */
  createEmptyGroup(combinator: FilterCombinator = 'AND'): FilterGroup {
    return {
      combinator,
      conditions: [],
      groups: [],
    };
  }

  /**
   * Add condition to group
   */
  addCondition(group: FilterGroup, condition: FilterCondition): FilterGroup {
    return {
      ...group,
      conditions: [...group.conditions, condition],
    };
  }

  /**
   * Remove condition from group
   */
  removeCondition(group: FilterGroup, index: number): FilterGroup {
    return {
      ...group,
      conditions: group.conditions.filter((_, i) => i !== index),
    };
  }

  /**
   * Add nested group
   */
  addNestedGroup(group: FilterGroup, nestedGroup: FilterGroup): FilterGroup {
    return {
      ...group,
      groups: [...(group.groups || []), nestedGroup],
    };
  }

  /**
   * Get filter summary
   * @param group Filter group
   * @returns Human-readable summary
   */
  getFilterSummary(group: FilterGroup): string {
    const parts: string[] = [];

    for (const condition of group.conditions) {
      parts.push(`${condition.field} ${this.getOperatorSymbol(condition.operator)} ${condition.value}`);
    }

    for (const nestedGroup of group.groups || []) {
      parts.push(`(${this.getFilterSummary(nestedGroup)})`);
    }

    return parts.join(` ${group.combinator} `);
  }

  /**
   * Get operator symbol
   */
  private getOperatorSymbol(operator: FilterOperator): string {
    const symbols: Record<FilterOperator, string> = {
      equals: '=',
      notEquals: '≠',
      contains: '⊇',
      notContains: '⊉',
      startsWith: '⊳',
      endsWith: '⊲',
      greaterThan: '>',
      greaterThanOrEqual: '≥',
      lessThan: '<',
      lessThanOrEqual: '≤',
      between: '⟷',
      in: '∈',
      notIn: '∉',
      isEmpty: '∅',
      isNotEmpty: '≠∅',
      regex: '~',
    };

    return symbols[operator] || operator;
  }

  /**
   * Persist filter state to localStorage
   * @param key Storage key
   * @param state Filter state
   */
  persistState(key: string, state: FilterState): void {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist filter state:', error);
    }
  }

  /**
   * Restore filter state from localStorage
   * @param key Storage key
   * @returns Filter state or null
   */
  restoreState(key: string): FilterState | null {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to restore filter state:', error);
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
      console.error('Failed to clear filter state:', error);
    }
  }
}

export default FilteringService.getInstance();

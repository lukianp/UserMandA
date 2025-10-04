/**
 * Data Transformation Service
 * Provides data manipulation operations: map, filter, sort, group, join, pivot
 */

/**
 * Filter condition operators
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
  | 'regex'
  | 'isEmpty'
  | 'isNotEmpty';

/**
 * Filter condition
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: any;
  value2?: any; // For 'between' operator
  caseSensitive?: boolean;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: SortDirection;
}

/**
 * Aggregation function types
 */
export type AggregationFunction = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'first' | 'last';

/**
 * Group configuration
 */
export interface GroupConfig {
  by: string | string[];
  aggregations?: Record<string, { field: string; function: AggregationFunction }>;
}

/**
 * Join type
 */
export type JoinType = 'inner' | 'left' | 'right' | 'outer';

/**
 * Join configuration
 */
export interface JoinConfig<T1 = any, T2 = any> {
  left: T1[];
  right: T2[];
  leftKey: keyof T1;
  rightKey: keyof T2;
  type: JoinType;
  select?: string[];
}

/**
 * Pivot configuration
 */
export interface PivotConfig {
  rows: string[];
  columns: string;
  values: string;
  aggregation: AggregationFunction;
}

/**
 * Data Transformation Service
 */
export class DataTransformationService {
  private static instance: DataTransformationService;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DataTransformationService {
    if (!DataTransformationService.instance) {
      DataTransformationService.instance = new DataTransformationService();
    }
    return DataTransformationService.instance;
  }

  /**
   * Map/rename fields in dataset
   * @param data Source data
   * @param fieldMap Field mapping (oldName -> newName)
   * @returns Transformed data
   */
  mapFields<T = any, R = any>(data: T[], fieldMap: Record<string, string>): R[] {
    return data.map((row) => {
      const mapped: any = {};

      for (const [oldField, newField] of Object.entries(fieldMap)) {
        if (oldField in row) {
          mapped[newField] = (row as any)[oldField];
        }
      }

      // Include fields not in mapping
      for (const key of Object.keys(row as any)) {
        if (!(key in fieldMap)) {
          mapped[key] = (row as any)[key];
        }
      }

      return mapped as R;
    });
  }

  /**
   * Reorder columns
   * @param data Source data
   * @param columnOrder Desired column order
   * @returns Data with reordered columns
   */
  reorderColumns<T = any>(data: T[], columnOrder: string[]): T[] {
    return data.map((row) => {
      const reordered: any = {};

      // Add columns in specified order
      for (const col of columnOrder) {
        if (col in row) {
          reordered[col] = (row as any)[col];
        }
      }

      // Add remaining columns
      for (const key of Object.keys(row as any)) {
        if (!columnOrder.includes(key)) {
          reordered[key] = (row as any)[key];
        }
      }

      return reordered as T;
    });
  }

  /**
   * Filter data by conditions
   * @param data Source data
   * @param conditions Filter conditions
   * @param combineWithAnd True = AND all conditions, False = OR (default: true)
   * @returns Filtered data
   */
  filter<T = any>(data: T[], conditions: FilterCondition[], combineWithAnd = true): T[] {
    return data.filter((row) => {
      const results = conditions.map((condition) => this.evaluateCondition(row, condition));

      return combineWithAnd ? results.every((r) => r) : results.some((r) => r);
    });
  }

  /**
   * Evaluate a single filter condition
   */
  private evaluateCondition<T = any>(row: T, condition: FilterCondition): boolean {
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

      case 'regex':
        try {
          const regex = new RegExp(value, caseSensitive ? '' : 'i');
          return regex.test(strField);
        } catch {
          return false;
        }

      case 'isEmpty':
        return fieldValue === '' || fieldValue === null || fieldValue === undefined;

      case 'isNotEmpty':
        return fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;

      default:
        return false;
    }
  }

  /**
   * Sort data by multiple fields
   * @param data Source data
   * @param sortConfigs Sort configurations (in priority order)
   * @returns Sorted data
   */
  sort<T = any>(data: T[], sortConfigs: SortConfig[]): T[] {
    const sorted = [...data];

    sorted.sort((a, b) => {
      for (const config of sortConfigs) {
        const aValue = (a as any)[config.field];
        const bValue = (b as any)[config.field];

        let comparison = 0;

        // Natural sort for strings with numbers
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = this.naturalCompare(aValue, bValue);
        } else if (aValue < bValue) {
          comparison = -1;
        } else if (aValue > bValue) {
          comparison = 1;
        }

        if (comparison !== 0) {
          return config.direction === 'asc' ? comparison : -comparison;
        }
      }

      return 0;
    });

    return sorted;
  }

  /**
   * Natural sort comparison (alphanumeric)
   */
  private naturalCompare(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  }

  /**
   * Group data by fields with aggregations
   * @param data Source data
   * @param config Group configuration
   * @returns Grouped data
   */
  groupBy<T = any>(data: T[], config: GroupConfig): any[] {
    const { by, aggregations } = config;
    const groupFields = Array.isArray(by) ? by : [by];

    // Group data
    const groups = new Map<string, T[]>();

    for (const row of data) {
      const key = groupFields.map((field) => (row as any)[field]).join('|');

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key)!.push(row);
    }

    // Build result with aggregations
    const result: any[] = [];

    for (const [key, groupRows] of groups.entries()) {
      const keyParts = key.split('|');
      const grouped: any = {};

      // Add group fields
      groupFields.forEach((field, index) => {
        grouped[field] = keyParts[index];
      });

      // Add aggregations
      if (aggregations) {
        for (const [aggName, aggConfig] of Object.entries(aggregations)) {
          grouped[aggName] = this.aggregate(groupRows, aggConfig.field, aggConfig.function);
        }
      } else {
        // Default: add count
        grouped._count = groupRows.length;
      }

      result.push(grouped);
    }

    return result;
  }

  /**
   * Perform aggregation on field
   */
  private aggregate<T = any>(data: T[], field: string, func: AggregationFunction): any {
    const values = data.map((row) => (row as any)[field]).filter((v) => v !== null && v !== undefined);

    if (values.length === 0) {
      return null;
    }

    switch (func) {
      case 'sum':
        return values.reduce((sum, v) => sum + Number(v), 0);

      case 'avg':
        return values.reduce((sum, v) => sum + Number(v), 0) / values.length;

      case 'count':
        return values.length;

      case 'min':
        return Math.min(...values.map(Number));

      case 'max':
        return Math.max(...values.map(Number));

      case 'first':
        return values[0];

      case 'last':
        return values[values.length - 1];

      default:
        return null;
    }
  }

  /**
   * Join two datasets
   * @param config Join configuration
   * @returns Joined data
   */
  join<T1 = any, T2 = any, R = any>(config: JoinConfig<T1, T2>): R[] {
    const { left, right, leftKey, rightKey, type, select } = config;
    const result: R[] = [];

    // Create index for right table for faster lookup
    const rightIndex = new Map<any, T2[]>();
    for (const rightRow of right) {
      const key = rightRow[rightKey];
      if (!rightIndex.has(key)) {
        rightIndex.set(key, []);
      }
      rightIndex.get(key)!.push(rightRow);
    }

    // Perform join
    const matchedRightKeys = new Set<any>();

    for (const leftRow of left) {
      const key = leftRow[leftKey];
      const rightRows = rightIndex.get(key) || [];

      if (rightRows.length > 0) {
        // Match found
        for (const rightRow of rightRows) {
          const joined = this.mergeRows(leftRow, rightRow, select);
          result.push(joined);
          matchedRightKeys.add(key);
        }
      } else if (type === 'left' || type === 'outer') {
        // No match - include left row with nulls for right fields
        const joined = this.mergeRows(leftRow, {} as T2, select);
        result.push(joined);
      }
    }

    // Add unmatched right rows for outer join
    if (type === 'right' || type === 'outer') {
      for (const [key, rightRows] of rightIndex.entries()) {
        if (!matchedRightKeys.has(key)) {
          for (const rightRow of rightRows) {
            const joined = this.mergeRows({} as T1, rightRow, select);
            result.push(joined);
          }
        }
      }
    }

    return result;
  }

  /**
   * Merge two rows for join
   */
  private mergeRows<T1 = any, T2 = any>(left: T1, right: T2, select?: string[]): any {
    const merged = { ...left, ...right };

    if (select) {
      const filtered: any = {};
      for (const field of select) {
        if (field in merged) {
          filtered[field] = merged[field];
        }
      }
      return filtered;
    }

    return merged;
  }

  /**
   * Pivot data
   * @param data Source data
   * @param config Pivot configuration
   * @returns Pivoted data
   */
  pivot<T = any>(data: T[], config: PivotConfig): any[] {
    const { rows, columns, values, aggregation } = config;

    // Get unique column values
    const columnValues = [...new Set(data.map((row) => (row as any)[columns]))].sort();

    // Group by row fields
    const grouped = this.groupBy(data, { by: rows });

    // Build pivot result
    const result: any[] = [];

    for (const group of grouped) {
      const pivoted: any = {};

      // Add row fields
      for (const rowField of rows) {
        pivoted[rowField] = group[rowField];
      }

      // Add columns
      for (const colValue of columnValues) {
        // Filter data for this group and column
        const filtered = data.filter((row) => {
          const matchesGroup = rows.every((field) => (row as any)[field] === group[field]);
          const matchesColumn = (row as any)[columns] === colValue;
          return matchesGroup && matchesColumn;
        });

        // Aggregate values
        const aggValue = this.aggregate(filtered, values, aggregation);
        pivoted[String(colValue)] = aggValue;
      }

      result.push(pivoted);
    }

    return result;
  }

  /**
   * Unpivot data (reverse of pivot)
   * @param data Pivoted data
   * @param rowFields Fields to keep as rows
   * @param valueField Name for value column
   * @param columnField Name for column name column
   * @returns Unpivoted data
   */
  unpivot<T = any>(
    data: T[],
    rowFields: string[],
    valueField = 'value',
    columnField = 'column'
  ): any[] {
    const result: any[] = [];

    for (const row of data) {
      const rowData: any = {};

      // Copy row fields
      for (const field of rowFields) {
        rowData[field] = (row as any)[field];
      }

      // Unpivot other fields
      for (const key of Object.keys(row as any)) {
        if (!rowFields.includes(key)) {
          const unpivoted = {
            ...rowData,
            [columnField]: key,
            [valueField]: (row as any)[key],
          };
          result.push(unpivoted);
        }
      }
    }

    return result;
  }

  /**
   * Calculate derived field using expression
   * @param data Source data
   * @param fieldName New field name
   * @param expression Function that calculates value from row
   * @returns Data with derived field
   */
  addDerivedField<T = any>(data: T[], fieldName: string, expression: (row: T) => any): T[] {
    return data.map((row) => ({
      ...row,
      [fieldName]: expression(row),
    }));
  }

  /**
   * Convert data types
   * @param data Source data
   * @param conversions Field -> target type
   * @returns Data with converted types
   */
  convertTypes<T = any>(
    data: T[],
    conversions: Record<string, 'string' | 'number' | 'boolean' | 'date'>
  ): T[] {
    return data.map((row) => {
      const converted: any = { ...row };

      for (const [field, targetType] of Object.entries(conversions)) {
        if (field in converted) {
          converted[field] = this.convertValue(converted[field], targetType);
        }
      }

      return converted as T;
    });
  }

  /**
   * Convert single value to target type
   */
  private convertValue(value: any, targetType: 'string' | 'number' | 'boolean' | 'date'): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (targetType) {
      case 'string':
        return String(value);

      case 'number':
        const num = Number(value);
        return isNaN(num) ? null : num;

      case 'boolean':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'true' || lower === '1' || lower === 'yes') return true;
          if (lower === 'false' || lower === '0' || lower === 'no') return false;
        }
        return Boolean(value);

      case 'date':
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;

      default:
        return value;
    }
  }

  /**
   * Remove duplicate rows
   * @param data Source data
   * @param fields Fields to check for duplicates (null = all fields)
   * @returns Data without duplicates
   */
  distinct<T = any>(data: T[], fields?: string[]): T[] {
    const seen = new Set<string>();
    const result: T[] = [];

    for (const row of data) {
      const key = fields
        ? fields.map((f) => (row as any)[f]).join('|')
        : JSON.stringify(row);

      if (!seen.has(key)) {
        seen.add(key);
        result.push(row);
      }
    }

    return result;
  }

  /**
   * Select specific fields (columns)
   * @param data Source data
   * @param fields Fields to select
   * @returns Data with only selected fields
   */
  select<T = any>(data: T[], fields: string[]): Partial<T>[] {
    return data.map((row) => {
      const selected: any = {};
      for (const field of fields) {
        if (field in row) {
          selected[field] = (row as any)[field];
        }
      }
      return selected;
    });
  }

  /**
   * Take first N rows
   * @param data Source data
   * @param count Number of rows to take
   * @returns First N rows
   */
  take<T = any>(data: T[], count: number): T[] {
    return data.slice(0, count);
  }

  /**
   * Skip first N rows
   * @param data Source data
   * @param count Number of rows to skip
   * @returns Remaining rows
   */
  skip<T = any>(data: T[], count: number): T[] {
    return data.slice(count);
  }

  /**
   * Paginate data
   * @param data Source data
   * @param page Page number (1-based)
   * @param pageSize Items per page
   * @returns Paginated data
   */
  paginate<T = any>(data: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }
}

export default DataTransformationService.getInstance();

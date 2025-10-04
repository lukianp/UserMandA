/**
 * Common Type Definitions
 * Base utility types used throughout the M&A Discovery Suite
 */

/**
 * Standard result wrapper for async operations
 */
export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * Pagination parameters for data grids
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages?: number;
}

/**
 * Sort configuration for data grids
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration for data grids
 */
export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  value: any;
}

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Connection status for environments
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Generic status type
 */
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'cancelled';

/**
 * Severity levels for messages and validation
 */
export type SeverityLevel = 'info' | 'warning' | 'error' | 'critical' | 'success';

/**
 * Timestamp metadata for entities
 */
export interface TimestampMetadata {
  createdAt: Date | string;
  updatedAt?: Date | string;
  lastModified?: Date | string;
}

/**
 * Identifiable entity interface
 */
export interface Identifiable {
  id: string;
}

/**
 * Selectable item interface for data grids
 */
export interface Selectable {
  isSelected?: boolean;
}

/**
 * Named entity interface
 */
export interface Named {
  name: string;
  displayName?: string;
}

/**
 * Validation result for forms and data
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error details
 */
export interface ValidationError {
  field?: string;
  message: string;
  code?: string;
  severity: 'error' | 'critical';
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  field?: string;
  message: string;
  code?: string;
  severity: 'warning' | 'info';
}

/**
 * Dictionary type alias for cleaner code
 */
export type Dictionary<T> = Record<string, T>;

/**
 * Optional properties helper
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required properties helper
 */
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Progress information for long-running operations
 */
export interface ProgressInfo {
  percentage: number;
  message: string;
  currentItem?: string;
  itemsProcessed?: number;
  totalItems?: number;
}

/**
 * Error details with stack trace
 */
export interface ErrorDetails {
  message: string;
  code?: string;
  stack?: string;
  timestamp: Date | string;
  context?: Dictionary<any>;
}

/**
 * Generic key-value pair
 */
export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}

/**
 * Date range for filtering
 */
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * Nullable helper type
 */
export type Nullable<T> = T | null;

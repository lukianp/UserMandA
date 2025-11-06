/**
 * Common types and interfaces for discovery hooks
 */

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

/**
 * Progress information interface
 */
export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  message: string;
  currentOperation?: string;
  progress?: number;
  objectsProcessed?: number;
  estimatedTimeRemaining?: string;
}

/**
 * Profile interface
 */
export interface Profile {
  name: string;
  description?: string;
}

/**
 * Base Discovery Hook Result
 * All discovery hooks should extend this interface
 */
export interface BaseDiscoveryHookResult {
  // Core state
  isRunning: boolean;
  isCancelling: boolean;
  progress: ProgressInfo | null;
  results: any | null;
  error: string | null;
  logs: LogEntry[];
  selectedProfile: Profile | null;

  // Core actions
  startDiscovery: () => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  exportResults: () => Promise<void>;
  clearLogs: () => void;

  // View compatibility properties
  config: any;
  templates: any[];
  currentResult: any | null;
  isDiscovering: boolean;
  selectedTab: string;
  searchText: string;
  filteredData: any[];
  columnDefs: any[];
  errors: string[];

  // View compatibility actions
  updateConfig: (updates: any) => void;
  loadTemplate: (template: any) => void;
  saveAsTemplate: (name: string) => void;
  setSelectedTab: (tab: string) => void;
  setSearchText: (text: string) => void;
  exportData: (format: string) => Promise<void>;
}

/**
 * Base hook state for reusable implementation
 */
export interface BaseDiscoveryHookState {
  isRunning: boolean;
  isCancelling: boolean;
  progress: ProgressInfo | null;
  results: any | null;
  error: string | null;
  logs: LogEntry[];
  selectedProfile: Profile | null;
  config: any;
  templates: any[];
  selectedTab: string;
  searchText: string;
  errors: string[];
}

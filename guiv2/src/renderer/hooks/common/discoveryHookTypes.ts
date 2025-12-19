/**
 * Common types and interfaces for discovery hooks
 */

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'success' | 'error';
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
 * Filter state interface
 */
export interface FilterState {
  searchText: string;
  showHttpsOnly?: boolean;
  showExpiredCerts?: boolean;
  [key: string]: any;
}

/**
 * Statistics interface (generic for discovery modules)
 */
export interface DiscoveryStats {
  [key: string]: number | string | boolean | undefined;
}

/**
 * Column definition for data grids
 */
export interface ColumnDef {
  field: string;
  headerName: string;
  sortable?: boolean;
  filter?: boolean;
  width?: number;
  valueFormatter?: (params: any) => string;
  cellRenderer?: (params: any) => any;
  [key: string]: any;
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
  result: any | null;  // Alias for results (some views use 'result')
  error: string | null;
  logs: LogEntry[];
  selectedProfile: Profile | null;

  // PowerShell execution dialog state
  showExecutionDialog: boolean;
  setShowExecutionDialog: (show: boolean) => void;

  // Core actions
  startDiscovery: () => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  exportResults: () => Promise<void>;
  clearLogs: () => void;
  clearError: () => void;

  // View compatibility properties
  config: any;
  templates: any[];
  currentResult: any | null;
  isDiscovering: boolean;
  selectedTab: string;
  activeTab: string;  // Alias for selectedTab
  searchText: string;
  filter: FilterState;
  filteredData: any[];
  columnDefs: any[];
  columns: ColumnDef[];  // Alias for columnDefs
  stats: DiscoveryStats | null;
  errors: string[];

  // View compatibility actions
  updateConfig: (updates: any) => void;
  loadTemplate: (template: any) => void;
  saveAsTemplate: (name: string) => void;
  setSelectedTab: (tab: string) => void;
  setActiveTab: (tab: string) => void;  // Alias for setSelectedTab
  setSearchText: (text: string) => void;
  updateFilter: (updates: Partial<FilterState>) => void;
  exportData: (format: string) => Promise<void>;
  exportToCSV: (data?: any[], filename?: string) => void;
  exportToExcel: (data?: any[], filename?: string) => Promise<void>;
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

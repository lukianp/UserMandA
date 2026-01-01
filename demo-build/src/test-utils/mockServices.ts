/**
 * Mock Services
 * Centralized mocks for all service layer dependencies
 */

// ============================================================================
// Mock Electron API
// ============================================================================

export const createMockElectronAPI = (overrides: Partial<any> = {}) => ({
  // Generic invoke/channel API
  invoke: jest.fn(async (channel: string, payload?: any) => {
    // Default responses for common channels
    const responses: Record<string, any> = {
      'logicEngine:getAllUsers': { success: true, data: [] },
      'logicEngine:getAllGroups': { success: true, data: [] },
      'logicEngine:getAllComputers': { success: true, data: [] },
      'logicEngine:getStatistics': { success: true, data: {} },
      'discovery:start': { success: true, runId: 'mock-run-id' },
      'migration:execute': { success: true, runId: 'mock-run-id' },
      ...overrides.invokeResponses
    };

    return responses[channel] || { success: true, data: {} };
  }),

  // PowerShell/module execution
  executeScript: jest.fn(async () => ({ success: true, data: '', error: null })),
  executeModule: jest.fn(async () => ({ success: true, data: {}, error: null })),
  cancelExecution: jest.fn(async () => ({ success: true })),

  // File system operations
  readFile: jest.fn(async () => ''),
  writeFile: jest.fn(async () => undefined),
  showSaveDialog: jest.fn(async () => 'mock-output.csv'),
  showOpenDialog: jest.fn(async () => ['mock-file.txt']),

  // Configuration
  getConfig: jest.fn(async () => ({})),
  setConfig: jest.fn(async () => true),

  // Progress/streaming callbacks
  onProgress: jest.fn((cb) => jest.fn()), // Returns unsubscribe function
  onOutput: jest.fn((cb) => jest.fn()),
  onDiscoveryProgress: jest.fn((cb) => jest.fn()),
  onDiscoveryResult: jest.fn((cb) => jest.fn()),
  onDiscoveryError: jest.fn((cb) => jest.fn()),
  onMigrationProgress: jest.fn((cb) => jest.fn()),
  onMigrationResult: jest.fn((cb) => jest.fn()),

  // Namespaced APIs
  logicEngine: {
    getStatistics: jest.fn(async () => ({ success: true, data: {} })),
    getUserDetail: jest.fn(async () => ({ success: true, data: {} })),
    getGroupDetail: jest.fn(async () => ({ success: true, data: {} })),
    invalidateCache: jest.fn(async () => ({ success: true })),
    ...overrides.logicEngine
  },

  appRegistration: {
    hasCredentials: jest.fn(async () => true),
    readSummary: jest.fn(async () => ({ CredentialFile: 'cred.json' })),
    decryptCredential: jest.fn(async () => 'mock-secret'),
    launch: jest.fn(async () => ({ success: true })),
    ...overrides.appRegistration
  },

  project: {
    getConfiguration: jest.fn(async () => ({ success: true, data: {} })),
    saveConfiguration: jest.fn(async () => ({ success: true })),
    updateStatus: jest.fn(async () => ({ success: true })),
    addWave: jest.fn(async () => ({ success: true })),
    updateWaveStatus: jest.fn(async () => ({ success: true })),
    ...overrides.project
  },

  discovery: {
    start: jest.fn(async () => ({ success: true, runId: 'mock-run-id' })),
    cancel: jest.fn(async () => ({ success: true })),
    getResults: jest.fn(async () => ({ success: true, data: [] })),
    ...overrides.discovery
  },

  migration: {
    plan: jest.fn(async () => ({ success: true, runId: 'mock-run-id' })),
    execute: jest.fn(async () => ({ success: true, runId: 'mock-run-id' })),
    validate: jest.fn(async () => ({ success: true, valid: true, issues: [] })),
    cancel: jest.fn(async () => ({ success: true })),
    ...overrides.migration
  },

  // Discovery/migration orchestration
  startDiscovery: jest.fn(async () => ({ success: true, data: {} })),
  planMigration: jest.fn(async () => ({ runId: 'mock-run-id' })),
  executeMigration: jest.fn(async () => ({ runId: 'mock-run-id' })),

  ...overrides
});

// ============================================================================
// Mock Cache Service
// ============================================================================

export const createMockCacheService = () => ({
  get: jest.fn((key: string) => null),
  set: jest.fn((key: string, value: any) => undefined),
  has: jest.fn((key: string) => false),
  delete: jest.fn((key: string) => undefined),
  clear: jest.fn(() => undefined),
  keys: jest.fn(() => [])
});

// ============================================================================
// Mock Theme Service
// ============================================================================

export const createMockThemeService = () => ({
  currentTheme: 'light',
  setTheme: jest.fn((theme: string) => undefined),
  toggleTheme: jest.fn(() => undefined),
  getTheme: jest.fn(() => 'light')
});

// ============================================================================
// Mock Notification Service
// ============================================================================

export const createMockNotificationService = () => ({
  success: jest.fn((message: string) => undefined),
  error: jest.fn((message: string) => undefined),
  warning: jest.fn((message: string) => undefined),
  info: jest.fn((message: string) => undefined),
  clear: jest.fn(() => undefined)
});

// ============================================================================
// Mock Export Service
// ============================================================================

export const createMockExportService = () => ({
  exportToCSV: jest.fn(async (data: any[], filename: string) => undefined),
  exportToExcel: jest.fn(async (data: any[], filename: string) => undefined),
  exportToPDF: jest.fn(async (data: any[], filename: string) => undefined),
  exportToJSON: jest.fn(async (data: any[], filename: string) => undefined)
});

// ============================================================================
// Mock Import Service
// ============================================================================

export const createMockImportService = () => ({
  importFromCSV: jest.fn(async (file: File) => []),
  importFromExcel: jest.fn(async (file: File) => []),
  importFromJSON: jest.fn(async (file: File) => [])
});

// ============================================================================
// Mock PowerShell Service
// ============================================================================

export const createMockPowerShellService = () => ({
  executeScript: jest.fn(async (script: string) => ({ success: true, output: '', error: null })),
  executeModule: jest.fn(async (modulePath: string, functionName: string, parameters: any) => ({
    success: true,
    data: {},
    error: null
  })),
  cancelExecution: jest.fn(async () => ({ success: true })),
  onOutput: jest.fn((callback: (output: string) => void) => jest.fn()),
  onProgress: jest.fn((callback: (progress: any) => void) => jest.fn())
});

// ============================================================================
// Mock Discovery Service
// ============================================================================

export const createMockDiscoveryService = () => ({
  startDiscovery: jest.fn(async (config: any) => ({
    success: true,
    runId: 'mock-run-id',
    data: {}
  })),
  cancelDiscovery: jest.fn(async () => ({ success: true })),
  getDiscoveryResults: jest.fn(async () => ({ success: true, data: [] })),
  onProgress: jest.fn((callback: (progress: any) => void) => jest.fn()),
  onComplete: jest.fn((callback: (result: any) => void) => jest.fn()),
  onError: jest.fn((callback: (error: any) => void) => jest.fn())
});

// ============================================================================
// Mock Migration Service
// ============================================================================

export const createMockMigrationService = () => ({
  planMigration: jest.fn(async (config: any) => ({
    success: true,
    runId: 'mock-run-id',
    plan: {}
  })),
  executeMigration: jest.fn(async (config: any) => ({
    success: true,
    runId: 'mock-run-id',
    result: {}
  })),
  validateMigration: jest.fn(async (config: any) => ({
    success: true,
    valid: true,
    issues: []
  })),
  cancelMigration: jest.fn(async () => ({ success: true })),
  onProgress: jest.fn((callback: (progress: any) => void) => jest.fn()),
  onComplete: jest.fn((callback: (result: any) => void) => jest.fn()),
  onError: jest.fn((callback: (error: any) => void) => jest.fn())
});

// ============================================================================
// Mock Data Validation Service
// ============================================================================

export const createMockValidationService = () => ({
  validate: jest.fn((data: any, schema: any) => ({ valid: true, errors: [] })),
  validateField: jest.fn((value: any, rules: any[]) => ({ valid: true, error: null })),
  sanitize: jest.fn((data: any) => data)
});

// ============================================================================
// Mock Filter Service
// ============================================================================

export const createMockFilterService = () => ({
  applyFilters: jest.fn((data: any[], filters: any) => data),
  createFilter: jest.fn((field: string, operator: string, value: any) => ({ field, operator, value })),
  clearFilters: jest.fn(() => undefined)
});

// ============================================================================
// Mock Sort Service
// ============================================================================

export const createMockSortService = () => ({
  sort: jest.fn((data: any[], sortBy: string, order: 'asc' | 'desc') => [...data]),
  multiSort: jest.fn((data: any[], sorts: any[]) => [...data])
});

// ============================================================================
// Mock Pagination Service
// ============================================================================

export const createMockPaginationService = () => ({
  paginate: jest.fn((data: any[], page: number, pageSize: number) => ({
    data: data.slice((page - 1) * pageSize, page * pageSize),
    totalPages: Math.ceil(data.length / pageSize),
    totalItems: data.length,
    currentPage: page,
    pageSize
  }))
});

// ============================================================================
// Export all mock service factories
// ============================================================================

export const mockServices = {
  electronAPI: createMockElectronAPI,
  cache: createMockCacheService,
  theme: createMockThemeService,
  notification: createMockNotificationService,
  export: createMockExportService,
  import: createMockImportService,
  powerShell: createMockPowerShellService,
  discovery: createMockDiscoveryService,
  migration: createMockMigrationService,
  validation: createMockValidationService,
  filter: createMockFilterService,
  sort: createMockSortService,
  pagination: createMockPaginationService
};

export default mockServices;



/**
 * Fallback implementations for when electronAPI is not available
 * This provides mock implementations to prevent crashes during development
 */

export const electronAPIFallback = {
  // ========================================
  // PowerShell Execution
  // ========================================

  executeScript: async () => ({
    success: true,
    data: [],
    duration: 0,
    warnings: ['Running in development mode - returning mock data'],
    error: undefined,
  }),

  executeModule: async () => ({
    success: true,
    data: [],
    duration: 0,
    warnings: ['Running in development mode - returning mock data'],
    error: undefined,
  }),

  cancelExecution: async () => false,

  discoverModules: async () => [],

  executeParallel: async () => [],

  executeWithRetry: async () => ({
    success: false,
    error: 'Electron API not available',
    duration: 0,
    warnings: [],
  }),

  // ========================================
  // File Operations
  // ========================================

  readFile: async () => {
    throw new Error('Electron API not available');
  },

  writeFile: async () => {
    throw new Error('Electron API not available');
  },

  fileExists: async () => false,

  deleteFile: async () => {
    throw new Error('Electron API not available');
  },

  listFiles: async () => [],

  logToFile: async () => {
    // No-op in fallback mode
  },

  // ========================================
  // Configuration Management
  // ========================================

  getConfig: async () => null,

  setConfig: async () => {},

  getAllConfig: async () => ({}),

  deleteConfig: async () => {},

  // ========================================
  // Profile Management
  // ========================================

  loadSourceProfiles: async () => [],

  loadTargetProfiles: async () => [],

  getActiveSourceProfile: async () => null,

  getActiveTargetProfile: async () => null,

  createSourceProfile: async () => ({ success: false, error: 'Electron API not available', profile: null }),

  createTargetProfile: async () => ({ success: false, error: 'Electron API not available', profile: null }),

  updateSourceProfile: async () => ({ success: false, error: 'Electron API not available', profile: null }),

  updateTargetProfile: async () => ({ success: false, error: 'Electron API not available', profile: null }),

  deleteSourceProfile: async () => ({ success: false, error: 'Electron API not available' }),

  deleteTargetProfile: async () => ({ success: false, error: 'Electron API not available' }),

  setActiveSourceProfile: async () => ({ success: false, error: 'Electron API not available', dataPath: '' }),

  setActiveTargetProfile: async () => ({ success: false, error: 'Electron API not available' }),

  refreshProfiles: async () => ({ success: false, error: 'Electron API not available', profiles: [] }),

  getProfileDataPath: async () => ({ success: false, error: 'Electron API not available', path: '' }),

  // ========================================
  // Event Listeners (for streaming)
  // ========================================

  onProgress: () => () => {},

  onOutput: () => () => {},

  onOutputStream: () => () => {},

  onErrorStream: () => () => {},

  onWarningStream: () => () => {},

  onVerboseStream: () => () => {},

  onDebugStream: () => () => {},

  onInformationStream: () => () => {},

  onExecutionCancelled: () => () => {},

  // ========================================
  // File Watcher Operations
  // ========================================

  startFileWatcher: async () => ({ success: false }),

  stopFileWatcher: async () => ({ success: false }),

  stopAllFileWatchers: async () => ({ success: false }),

  getWatchedFiles: async () => [],

  getFileWatcherStatistics: async () => ({
    activeWatchers: 0,
    watchedDirectories: [],
    totalEvents: 0,
    eventsByType: { added: 0, changed: 0, deleted: 0 }
  }),

  onFileChanged: () => () => {},

  // ========================================
  // System / App Operations
  // ========================================

  getAppVersion: async () => 'development',

  getDataPath: async () => process.cwd(),

  openExternal: async () => {},

  showOpenDialog: async () => null,

  showSaveDialog: async () => null,

  // ========================================
  // Generic IPC Invoke (for custom handlers)
  // ========================================

  invoke: async () => {
    throw new Error('Electron API not available');
  },

  // ========================================
  // Environment Detection
  // ========================================

  detectEnvironment: async () => ({
    id: 'fallback',
    startTime: new Date(),
    endTime: new Date(),
    status: 'failed',
    detectedEnvironment: 'unknown',
    detectedServices: [],
    recommendations: [],
    totalServicesFound: 0,
    confidence: 0,
    errors: [{ timestamp: new Date(), serviceType: 'system', message: 'Electron API not available' }],
    warnings: [],
  }),

  validateEnvironmentCredentials: async () => ({
    valid: false,
    message: 'Electron API not available'
  }),

  cancelEnvironmentDetection: async () => false,

  getEnvironmentStatistics: async () => ({
    activeDetections: 0,
    totalDetectionsRun: 0
  }),

  onEnvironmentDetectionStarted: () => () => {},

  onEnvironmentDetectionProgress: () => () => {},

  onEnvironmentDetectionCompleted: () => () => {},

  onEnvironmentDetectionFailed: () => () => {},

  onEnvironmentDetectionCancelled: () => () => {},

  // ========================================
  // Discovery Module Execution
  // ========================================

  executeDiscovery: async () => ({
    success: false,
    error: 'Electron API not available',
  }),

  cancelDiscovery: async () => ({
    success: false,
    error: 'Electron API not available',
  }),

  getDiscoveryModules: async () => ({
    success: false,
    modules: [],
    error: 'Electron API not available',
  }),

  getDiscoveryModuleInfo: async () => ({
    success: false,
    error: 'Electron API not available',
  }),

  onDiscoveryOutput: () => () => {},

  onDiscoveryProgress: () => () => {},

  onDiscoveryComplete: () => () => {},

  onDiscoveryError: () => () => {},

  onDiscoveryCancelled: () => () => {},

  // ========================================
  // Logic Engine API
  // ========================================

  logicEngine: {
    loadAll: async () => ({
      success: false,
      error: 'Electron API not available'
    }),

    getUserDetail: async () => ({
      success: false,
      error: 'Electron API not available'
    }),

    getStatistics: async () => ({
      success: false,
      error: 'Electron API not available'
    }),

    invalidateCache: async () => ({
      success: false,
      error: 'Electron API not available'
    }),

    onProgress: () => () => {},

    onLoaded: () => () => {},

    onError: () => () => {},

    analyzeMigrationComplexity: async () => ({
      success: false,
      error: 'Electron API not available'
    }),

    batchAnalyzeMigrationComplexity: async () => ({
      success: false,
      error: 'Electron API not available'
    }),

    getComplexityStatistics: async () => ({
      success: false,
      error: 'Electron API not available'
    }),
  },

  // ========================================
  // Dashboard API
  // ========================================

  dashboard: {
    getStats: async () => ({
      success: true,
      data: {
        totalUsers: 0,
        totalGroups: 0,
        totalComputers: 0,
        totalApplications: 0,
        migrationReadiness: {
          ready: 0,
          needsReview: 0,
          notReady: 0,
        },
      },
    }),

    getProjectTimeline: async () => ({
      success: true,
      data: {
        projectName: 'Development Mode',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        currentPhase: 'Planning',
        phases: [],
        waves: [],
      },
    }),

    getSystemHealth: async () => ({
      success: true,
      data: {
        logicEngineStatus: 'offline',
        powerShellStatus: 'offline',
        dataConnectionStatus: 'offline',
        lastHealthCheck: new Date().toISOString(),
        warnings: ['Running in development mode without Electron'],
      },
    }),

    getRecentActivity: async () => ({
      success: true,
      data: [],
    }),

    acknowledgeAlert: async () => {
      // No-op in fallback mode
    },
  },

  // ========================================
  // Project Management API
  // ========================================

  project: {
    getConfiguration: async () => ({
      success: false,
      error: 'Electron API not available'
    }),

    saveConfiguration: async () => ({
      success: false,
      error: 'Electron API not available'
    }),

    updateStatus: async () => ({
      success: false,
      error: 'Electron API not available'
    }),

    addWave: async () => ({
      success: false,
      error: 'Electron API not available'
    }),

    updateWaveStatus: async () => ({
      success: false,
      error: 'Electron API not available'
    }),
  },
};

/**
 * Get the electronAPI from window, falling back to fallback implementation
 */
export const getElectronAPI = () => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }

  console.warn('Using fallback Electron API - running in development mode without Electron');
  return electronAPIFallback;
};
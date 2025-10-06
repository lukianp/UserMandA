// Debug System Type Definitions
export enum LogLevel {
  VERBOSE = 'VERBOSE',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export enum LogCategory {
  UI = 'ui',
  FUNCTIONALITY = 'functionality',
  ERRORS = 'errors',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  SYSTEM = 'system'
}

export interface LogEntry {
  timestamp: string; // ISO 8601 format
  threadId: string;
  module: string;
  component: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    context?: Record<string, any>;
  };
  userSession?: {
    sessionId: string;
    userId?: string;
    profile?: string;
  };
  correlationId?: string;
  metadata?: {
    platform: string;
    version: string;
    build: string;
    environment: string;
  };
}

export interface KeystrokeEvent {
  type: 'keydown' | 'keyup';
  key: string;
  keyCode: number;
  modifiers: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  };
  uiElementId?: string;
  componentName?: string;
  timestamp: string;
}

export interface MouseEvent {
  type: 'mousedown' | 'mouseup' | 'mousemove' | 'click' | 'dblclick' | 'wheel';
  x: number;
  y: number;
  button?: number; // 0=left, 1=middle, 2=right
  modifiers: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  };
  uiElementId?: string;
  componentName?: string;
  deltaX?: number; // For wheel events
  deltaY?: number; // For wheel events
  timestamp: string;
}

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  renderTime: number;
  apiResponseTime?: number;
  componentName?: string;
  operation: string;
  timestamp: string;
}

export interface ErrorContext {
  stackTrace: string;
  errorCode?: string;
  contextVariables?: Record<string, any>;
  userSessionId?: string;
  reproductionSteps?: string[];
  correlationId?: string;
  timestamp: string;
}

export interface DebugConfiguration {
  enabled: boolean;
  logLevel: LogLevel;
  categories: LogCategory[];
  maxFileSize: number; // MB
  maxFiles: number;
  compressArchives: boolean;
  sanitizeLogs: boolean;
  realtimeEnabled: boolean;
  performanceMonitoring: boolean;
  uiInteractionLogging: boolean;
  errorContextCapture: boolean;
}

export interface LogReaderOptions {
  category?: LogCategory;
  level?: LogLevel;
  startDate?: Date;
  endDate?: Date;
  component?: string;
  correlationId?: string;
  limit?: number;
}

export interface LogAnalysisResult {
  summary: {
    totalLogs: number;
    errorCount: number;
    warningCount: number;
    performanceIssues: number;
  };
  patterns: {
    recurringErrors: Array<{
      error: string;
      count: number;
      firstOccurrence: string;
      lastOccurrence: string;
    }>;
    slowOperations: Array<{
      operation: string;
      averageTime: number;
      maxTime: number;
      count: number;
    }>;
  };
  recommendations: string[];
}
/**
 * Type Exports
 * Central export file for all renderer types
 */

// Electron API types
export type {
  ElectronAPI,
  ExecutionOptions,
  ExecutionResult,
  ProgressData,
  OutputData,
  ModuleInfo,
  ScriptTask,
  ScriptExecutionParams,
  ModuleExecutionParams,
  FileOperationResult,
  ConfigEntry,
  DiscoveryExecutionResult,
  DiscoveryCancellationResult,
  DiscoveryModuleListResult,
  DiscoveryModuleInfoResult,
  ConnectionTestResult,
  EnvironmentTestConfig,
  EnvironmentTestResult,
  ConnectionTestStatistics,
  LogEntry,
  LoggingConfig,
  LogicEngineLoadResult,
  LogicEngineUserDetailResult,
  LogicEngineStatisticsResult,
  LogicEngineCacheResult,
  MigrationComplexityResult,
  MigrationComplexityBatchResult,
  MigrationComplexityStatisticsResult,
} from './electron';

// Common types
export type { Dictionary } from './common';

// Dashboard types
export type * from './dashboard';

// Project types
export type * from './project';

// UI/UX types
export type * from './uiux';

// Profile types (from shared)
export type * from '../../shared/types/profile';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackupConfiguration,
  BackupOperation,
  RestoreConfiguration,
  RestoreOperation,
  BackupResult,
  RestoreResult,
  BackupRestoreProgress,
  BackupType
} from '../types/models/backup';
import { Dictionary } from '../types/common';

declare global {
  interface Window {
    electronAPI: any;
  }
}

export interface BackupRestoreLogic {
  // State
  error: string | null;
  isLoading: boolean;
  currentOperation: BackupOperation | RestoreOperation | null;
  progress: BackupRestoreProgress | null;
  backupHistory: BackupOperation[];

  // Backup operations
  createBackup: (config: BackupConfiguration) => Promise<BackupResult>;
  cancelBackup: (operationId: string) => Promise<boolean>;

  // Restore operations
  restoreFromBackup: (backupFilePath: string, config: RestoreConfiguration) => Promise<RestoreResult>;
  cancelRestore: (operationId: string) => Promise<boolean>;

  // Utility operations
  listBackups: () => Promise<BackupOperation[]>;
  deleteBackup: (operationId: string) => Promise<boolean>;
  validateBackup: (backupFilePath: string) => Promise<{ isValid: boolean; errors: string[]; warnings: string[] }>;

  // Progress tracking
  onProgress: (callback: (progress: BackupRestoreProgress) => void) => () => void;
  onOperationComplete: (callback: (operation: BackupOperation | RestoreOperation) => void) => () => void;
}

export const useBackupRestoreLogic = (): BackupRestoreLogic => {
  // State management
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] = useState<BackupOperation | RestoreOperation | null>(null);
  const [progress, setProgress] = useState<BackupRestoreProgress | null>(null);
  const [backupHistory, setBackupHistory] = useState<BackupOperation[]>([]);

  // Refs for cleanup
  const progressCallbacks = useRef<Array<(progress: BackupRestoreProgress) => void>>([]);
  const operationCompleteCallbacks = useRef<Array<(operation: BackupOperation | RestoreOperation) => void>>([]);

  // Load backup history on mount
  useEffect(() => {
    loadBackupHistory();

    // Set up progress event listeners
    const onProgressEvent = (event: any, progressData: BackupRestoreProgress) => {
      setProgress(progressData);
      progressCallbacks.current.forEach(callback => callback(progressData));
    };

    const onOperationCompleteEvent = (event: any, operationData: BackupOperation | RestoreOperation) => {
      setCurrentOperation(null);
      setProgress(null);
      setIsLoading(false);
      operationCompleteCallbacks.current.forEach(callback => callback(operationData));

      // Refresh backup history if it was a backup operation
      if ('filePath' in operationData && operationData.status === 'Completed') {
        loadBackupHistory();
      }
    };

    // Register event listeners
    window.electronAPI?.onBackupProgress?.(onProgressEvent);
    window.electronAPI?.onBackupComplete?.(onOperationCompleteEvent);
    window.electronAPI?.onRestoreProgress?.(onProgressEvent);
    window.electronAPI?.onRestoreComplete?.(onOperationCompleteEvent);

    return () => {
      // Cleanup event listeners
      window.electronAPI?.offBackupProgress?.(onProgressEvent);
      window.electronAPI?.offBackupComplete?.(onOperationCompleteEvent);
      window.electronAPI?.offRestoreProgress?.(onProgressEvent);
      window.electronAPI?.offRestoreComplete?.(onOperationCompleteEvent);
    };
  }, []);

  // Load backup history
  const loadBackupHistory = useCallback(async () => {
    try {
      if (window.electronAPI?.listBackups) {
        const backups = await window.electronAPI.listBackups();
        setBackupHistory(backups || []);
      }
    } catch (err: any) {
      console.error('Failed to load backup history:', err);
      setError(err.message || 'Failed to load backup history');
    }
  }, []);

  // Create backup
  const createBackup = useCallback(async (config: BackupConfiguration): Promise<BackupResult> => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await window.electronAPI.createBackup(config);

      if (!result.success) {
        setError(result.error || 'Backup failed');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create backup';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel backup
  const cancelBackup = useCallback(async (operationId: string): Promise<boolean> => {
    try {
      const result = await window.electronAPI.cancelBackup(operationId);
      return result;
    } catch (err: any) {
      console.error('Failed to cancel backup:', err);
      return false;
    }
  }, []);

  // Restore from backup
  const restoreFromBackup = useCallback(async (
    backupFilePath: string,
    config: RestoreConfiguration
  ): Promise<RestoreResult> => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await window.electronAPI.restoreFromBackup(backupFilePath, config);

      if (!result.success) {
        setError(result.error || 'Restore failed');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to restore from backup';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel restore
  const cancelRestore = useCallback(async (operationId: string): Promise<boolean> => {
    try {
      const result = await window.electronAPI.cancelRestore(operationId);
      return result;
    } catch (err: any) {
      console.error('Failed to cancel restore:', err);
      return false;
    }
  }, []);

  // List backups
  const listBackups = useCallback(async (): Promise<BackupOperation[]> => {
    try {
      if (window.electronAPI?.listBackups) {
        const backups = await window.electronAPI.listBackups();
        setBackupHistory(backups || []);
        return backups || [];
      }
      return [];
    } catch (err: any) {
      console.error('Failed to list backups:', err);
      throw new Error(err.message || 'Failed to list backups');
    }
  }, []);

  // Delete backup
  const deleteBackup = useCallback(async (operationId: string): Promise<boolean> => {
    try {
      const result = await window.electronAPI.deleteBackup(operationId);

      if (result.success) {
        // Refresh backup history
        await loadBackupHistory();
      }

      return result.success;
    } catch (err: any) {
      console.error('Failed to delete backup:', err);
      return false;
    }
  }, []);

  // Validate backup
  const validateBackup = useCallback(async (
    backupFilePath: string
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> => {
    try {
      const result = await window.electronAPI.validateBackup(backupFilePath);
      return {
        isValid: result.isValid,
        errors: result.errors || [],
        warnings: result.warnings || []
      };
    } catch (err: any) {
      console.error('Failed to validate backup:', err);
      return {
        isValid: false,
        errors: [err.message || 'Failed to validate backup'],
        warnings: []
      };
    }
  }, []);

  // Progress callback registration
  const onProgress = useCallback((callback: (progress: BackupRestoreProgress) => void) => {
    progressCallbacks.current.push(callback);

    // Return cleanup function
    return () => {
      const index = progressCallbacks.current.indexOf(callback);
      if (index > -1) {
        progressCallbacks.current.splice(index, 1);
      }
    };
  }, []);

  // Operation complete callback registration
  const onOperationComplete = useCallback((callback: (operation: BackupOperation | RestoreOperation) => void) => {
    operationCompleteCallbacks.current.push(callback);

    // Return cleanup function
    return () => {
      const index = operationCompleteCallbacks.current.indexOf(callback);
      if (index > -1) {
        operationCompleteCallbacks.current.splice(index, 1);
      }
    };
  }, []);

  return {
    // State
    error,
    isLoading,
    currentOperation,
    progress,
    backupHistory,

    // Backup operations
    createBackup,
    cancelBackup,

    // Restore operations
    restoreFromBackup,
    cancelRestore,

    // Utility operations
    listBackups,
    deleteBackup,
    validateBackup,

    // Progress tracking
    onProgress,
    onOperationComplete,
  };
};
import { useState, useEffect, useMemo, useCallback } from 'react';

import { useMigrationStore } from '../store/useMigrationStore';

export const useMigrationExecutionLogic = () => {
  const store = useMigrationStore();

  const {
    selectedWave,
    executionProgress,
    isExecuting,
    error,
    executeMigration,
    pauseMigration,
    resumeMigration,
    cancelMigration,
    retryFailedItems,
    subscribeToProgress,
    createRollbackPoint,
  } = store;

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedWave?.id) return;
    const cleanup = subscribeToProgress(selectedWave.id, (progress: any) => {
      if (progress.message) {
        setLogs(prev => [...prev.slice(-99), progress.message]);
      }
    });
    return cleanup;
  }, [selectedWave, subscribeToProgress]);

  const stats = useMemo(() => {
    if (!executionProgress) return { total: 0, completed: 0, failed: 0, inProgress: 0, pending: 0 };
    const items = executionProgress.items || [];
    return {
      total: items.length,
      completed: items.filter((i: any) => i.status === 'completed').length,
      failed: items.filter((i: any) => i.status === 'failed').length,
      inProgress: items.filter((i: any) => i.status === 'in-progress').length,
      pending: items.filter((i: any) => i.status === 'pending').length,
    };
  }, [executionProgress]);

  const progressPercent = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  }, [stats]);

  const handleStart = useCallback(async () => {
    if (!selectedWave) return;
    await executeMigration(selectedWave.id);
  }, [selectedWave, executeMigration]);

  const handlePause = useCallback(async () => {
    if (!selectedWave) return;
    await pauseMigration(selectedWave.id);
  }, [selectedWave, pauseMigration]);

  const handleResume = useCallback(async () => {
    if (!selectedWave) return;
    await resumeMigration(selectedWave.id);
  }, [selectedWave, resumeMigration]);

  const handleCancel = useCallback(async () => {
    if (!selectedWave) return;
    await cancelMigration(selectedWave.id);
  }, [selectedWave, cancelMigration]);

  const handleRetry = useCallback(async () => {
    if (!selectedWave) return;
    await retryFailedItems(selectedWave.id);
  }, [selectedWave, retryFailedItems]);

  const handleCreateRollbackPoint = useCallback(async () => {
    if (!selectedWave) return;
    await createRollbackPoint(selectedWave.id);
  }, [selectedWave, createRollbackPoint]);

  return {
    selectedWave,
    executionProgress,
    isExecuting,
    error,
    logs,
    stats,
    progressPercent,
    handleStart,
    handlePause,
    handleResume,
    handleCancel,
    handleRetry,
    handleCreateRollbackPoint,
    hasWaveSelected: !!selectedWave,
  };
};

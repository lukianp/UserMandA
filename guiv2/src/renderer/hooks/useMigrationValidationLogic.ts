import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMigrationStore } from '../store/useMigrationStore';

export const useMigrationValidationLogic = () => {
  const {
    selectedWave,
    validationResults,
    isLoading,
    error,
    validateWave,
    validateAll,
    clearValidationResults,
  } = useMigrationStore();

  const [isValidating, setIsValidating] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const severityCounts = useMemo(() => {
    if (!validationResults) return { total: 0, blockers: 0, warnings: 0, info: 0, passed: 0 };
    const checks = validationResults.checks || [];
    return {
      total: checks.length,
      blockers: checks.filter(c => c.severity === 'blocker' && !c.passed).length,
      warnings: checks.filter(c => c.severity === 'warning' && !c.passed).length,
      info: checks.filter(c => c.severity === 'info' && !c.passed).length,
      passed: checks.filter(c => c.passed).length,
    };
  }, [validationResults]);

  const filteredChecks = useMemo(() => {
    if (!validationResults) return [];
    let checks = validationResults.checks || [];
    if (selectedSeverity !== 'all') {
      checks = checks.filter(c => c.severity === selectedSeverity);
    }
    return checks.sort((a, b) => {
      const order = { blocker: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [validationResults, selectedSeverity]);

  const handleRunValidation = useCallback(async () => {
    if (!selectedWave) return;
    setIsValidating(true);
    try {
      await validateWave(selectedWave.id);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  }, [selectedWave, validateWave]);

  const handleExportReport = useCallback(() => {
    if (!validationResults) return;
    const report = JSON.stringify(validationResults, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation-report.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [validationResults]);

  const isReady = useMemo(() => {
    if (!validationResults) return false;
    return severityCounts.blockers === 0;
  }, [validationResults, severityCounts]);

  return {
    selectedWave,
    validationResults,
    filteredChecks,
    isLoading: isLoading || isValidating,
    error,
    selectedSeverity,
    severityCounts,
    isReady,
    setSelectedSeverity,
    handleRunValidation,
    handleValidateAll: validateAll,
    handleClearResults: clearValidationResults,
    handleExportReport,
    hasWaveSelected: !!selectedWave,
    hasResults: !!validationResults,
  };
};

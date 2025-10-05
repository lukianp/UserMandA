import { useState, useMemo, useCallback } from 'react';
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

  // Get validation results for the selected wave
  const waveValidationResult = selectedWave ? validationResults.get(selectedWave.id) : null;

  const [isValidating, setIsValidating] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const severityCounts = useMemo(() => {
    if (!waveValidationResult) return { total: 0, blockers: 0, warnings: 0, info: 0, passed: 0 };
    const checks = waveValidationResult.checks || [];
    return {
      total: checks.length,
      blockers: checks.filter(c => c.severity === 'blocker' && !c.passed).length,
      warnings: checks.filter(c => c.severity === 'warning' && !c.passed).length,
      info: checks.filter(c => c.severity === 'info' && !c.passed).length,
      passed: checks.filter(c => c.passed).length,
    };
  }, [waveValidationResult]);

  const filteredChecks = useMemo(() => {
    if (!waveValidationResult) return [];
    let checks = waveValidationResult.checks || [];
    if (selectedSeverity !== 'all') {
      checks = checks.filter(c => c.severity === selectedSeverity);
    }
    return checks.sort((a, b) => {
      const order = { blocker: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [waveValidationResult, selectedSeverity]);

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
    if (!waveValidationResult) return;
    const report = JSON.stringify(waveValidationResult, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation-report.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [waveValidationResult]);

  const isReady = useMemo(() => {
    if (!waveValidationResult) return false;
    return severityCounts.blockers === 0;
  }, [waveValidationResult, severityCounts]);

  return {
    selectedWave,
    validationResults: waveValidationResult,
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
    hasResults: !!waveValidationResult,
  };
};

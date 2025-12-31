/**
 * Connection Test Hook
 *
 * React hook for testing connections to various services
 */

import { useState, useCallback, useEffect } from 'react';

export interface ConnectionTestResult {
  success: boolean;
  serviceType: string;
  available: boolean;
  responseTime?: number;
  version?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface EnvironmentTestResult {
  testId: string;
  profileName: string;
  timestamp: string;
  overallSuccess: boolean;
  tests: ConnectionTestResult[];
  capabilities: string[];
  recommendations: string[];
}

export interface ConnectionTestState {
  isRunning: boolean;
  currentTest?: string;
  results: ConnectionTestResult[];
  environmentResult?: EnvironmentTestResult;
  error: string | null;
  progress: string;
}

/**
 * Hook for managing connection tests
 */
export function useConnectionTest() {
  const [state, setState] = useState<ConnectionTestState>({
    isRunning: false,
    results: [],
    error: null,
    progress: ''
  });

  /**
   * Test Active Directory connection
   */
  const testActiveDirectory = useCallback(
    async (domainController: string, credential?: { username: string; password: string }) => {
      setState(prev => ({ ...prev, isRunning: true, currentTest: 'ActiveDirectory', error: null }));

      try {
        const result = await window.electronAPI.connectionTest.testActiveDirectory(
          domainController,
          credential
        );

        setState(prev => ({
          ...prev,
          isRunning: false,
          currentTest: undefined,
          results: [...prev.results, result]
        }));

        return result;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isRunning: false,
          currentTest: undefined,
          error: error.message
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Test Exchange Server connection
   */
  const testExchange = useCallback(
    async (serverUrl: string, credential?: { username: string; password: string }) => {
      setState(prev => ({ ...prev, isRunning: true, currentTest: 'Exchange', error: null }));

      try {
        const result = await window.electronAPI.connectionTest.testExchange(serverUrl, credential);

        setState(prev => ({
          ...prev,
          isRunning: false,
          currentTest: undefined,
          results: [...prev.results, result]
        }));

        return result;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isRunning: false,
          currentTest: undefined,
          error: error.message
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Test Azure AD connection
   */
  const testAzureAD = useCallback(
    async (tenantId: string, clientId: string, clientSecret: string) => {
      setState(prev => ({ ...prev, isRunning: true, currentTest: 'AzureAD', error: null }));

      try {
        const result = await window.electronAPI.connectionTest.testAzureAD(
          tenantId,
          clientId,
          clientSecret
        );

        setState(prev => ({
          ...prev,
          isRunning: false,
          currentTest: undefined,
          results: [...prev.results, result]
        }));

        return result;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isRunning: false,
          currentTest: undefined,
          error: error.message
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Test comprehensive environment (T-000)
   */
  const testEnvironment = useCallback(
    async (config: {
      profileName: string;
      domainController?: string;
      exchangeServer?: string;
      tenantId?: string;
      clientId?: string;
      clientSecret?: string;
      credential?: { username: string; password: string };
    }) => {
      setState(prev => ({
        ...prev,
        isRunning: true,
        currentTest: 'Environment',
        error: null,
        progress: 'Starting environment detection...'
      }));

      try {
        const result = await window.electronAPI.connectionTest.testEnvironment(config);

        setState(prev => ({
          ...prev,
          isRunning: false,
          currentTest: undefined,
          environmentResult: result,
          progress: ''
        }));

        return result;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isRunning: false,
          currentTest: undefined,
          error: error.message,
          progress: ''
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Cancel active test
   */
  const cancelTest = useCallback(async (testId: string) => {
    try {
      await window.electronAPI.connectionTest.cancel(testId);
      setState(prev => ({
        ...prev,
        isRunning: false,
        currentTest: undefined,
        progress: ''
      }));
    } catch (error: any) {
      console.error('Failed to cancel test:', error);
    }
  }, []);

  /**
   * Clear results
   */
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      environmentResult: undefined,
      error: null
    }));
  }, []);

  /**
   * Setup event listeners for real-time updates
   */
  useEffect(() => {
    const cleanupFns: (() => void)[] = [];

    // Test started
    const unsubStarted = window.electronAPI.connectionTest.onTestStarted((data: any) => {
      setState(prev => ({
        ...prev,
        isRunning: true,
        progress: `Testing ${data.profileName}...`
      }));
    });
    cleanupFns.push(unsubStarted);

    // Test progress
    const unsubProgress = window.electronAPI.connectionTest.onTestProgress((data: any) => {
      setState(prev => ({
        ...prev,
        progress: `Testing ${data.service}...`
      }));
    });
    cleanupFns.push(unsubProgress);

    // Test completed
    const unsubCompleted = window.electronAPI.connectionTest.onTestCompleted((data: any) => {
      setState(prev => ({
        ...prev,
        isRunning: false,
        environmentResult: data,
        progress: ''
      }));
    });
    cleanupFns.push(unsubCompleted);

    // Test failed
    const unsubFailed = window.electronAPI.connectionTest.onTestFailed((data: any) => {
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: data.error,
        progress: ''
      }));
    });
    cleanupFns.push(unsubFailed);

    // Test cancelled
    const unsubCancelled = window.electronAPI.connectionTest.onTestCancelled((data: any) => {
      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: ''
      }));
    });
    cleanupFns.push(unsubCancelled);

    return () => {
      cleanupFns.forEach(cleanup => cleanup());
    };
  }, []);

  return {
    state,
    testActiveDirectory,
    testExchange,
    testAzureAD,
    testEnvironment,
    cancelTest,
    clearResults
  };
}



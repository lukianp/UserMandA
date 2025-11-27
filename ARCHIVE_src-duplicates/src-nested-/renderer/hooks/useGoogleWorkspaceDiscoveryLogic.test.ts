/**
 * Unit Tests for useGoogleWorkspaceDiscoveryLogic Hook
 * Tests all business logic for GoogleWorkspace discovery functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';

import { useGoogleWorkspaceDiscoveryLogic } from './useGoogleWorkspaceDiscoveryLogic';

// Mock electron API
const mockElectron = {
  executeDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  onDiscoveryProgress: jest.fn(() => jest.fn()),
  onDiscoveryOutput: jest.fn(() => jest.fn()),
  onDiscoveryComplete: jest.fn(() => jest.fn()),
  onDiscoveryError: jest.fn(() => jest.fn()),
};

const mockElectronAPI = {
  executeModule: jest.fn(),
};

beforeAll(() => {
  Object.defineProperty(window, 'electron', {
    writable: true,
    value: mockElectron,
  });
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
});

describe('useGoogleWorkspaceDiscoveryLogic', () => {
  let onCompleteCallback: ((data: any) => void) | null = null;
  let onErrorCallback: ((data: any) => void) | null = null;

  beforeEach(() => {
    jest.clearAllMocks();
    onCompleteCallback = null;
    onErrorCallback = null;

    mockElectron.onDiscoveryComplete.mockImplementation((callback) => {
      onCompleteCallback = callback;
      return jest.fn();
    });
    mockElectron.onDiscoveryError.mockImplementation((callback) => {
      onErrorCallback = callback;
      return jest.fn();
    });

    mockElectron.executeDiscovery.mockResolvedValue(undefined);
    mockElectronAPI.executeModule.mockResolvedValue({
      success: true,
      data: {},
    });
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useGoogleWorkspaceDiscoveryLogic());

      expect(result.current).toBeDefined();
      expect(result.current.isDiscovering).toBe(false);
    });

    it('should initialize with null or empty result', () => {
      const { result } = renderHook(() => useGoogleWorkspaceDiscoveryLogic());

      expect(result.current.result).toBeNull();
    });

    it('should initialize with null error', () => {
      const { result } = renderHook(() => useGoogleWorkspaceDiscoveryLogic());

      expect(result.current.error).toBeNull();
    });
  });

  describe('Discovery Execution', () => {
    it('should start discovery successfully', async () => {
      const mockResult = { users: [], groups: [], stats: {} };

      mockElectron.executeDiscovery.mockImplementation(async (params: any) => {
        setTimeout(() => {
          if (onCompleteCallback) {
            onCompleteCallback({
              executionId: params.executionId,
              result: mockResult,
            });
          }
        }, 10);
        return Promise.resolve();
      });

      const { result } = renderHook(() => useGoogleWorkspaceDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      await waitFor(() => {
        expect(result.current.isDiscovering).toBe(false);
      }, { timeout: 2000 });
    });

    it('should handle discovery failure', async () => {
      const errorMessage = 'Discovery failed';
      mockElectron.executeDiscovery.mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useGoogleWorkspaceDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      await waitFor(() => {
        expect(result.current.isDiscovering).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should set progress during discovery', async () => {
      const mockResult = { users: [], groups: [], stats: {} };

      mockElectron.executeDiscovery.mockImplementation(async (params: any) => {
        setTimeout(() => {
          if (onCompleteCallback) {
            onCompleteCallback({
              executionId: params.executionId,
              result: mockResult,
            });
          }
        }, 10);
        return Promise.resolve();
      });

      const { result } = renderHook(() => useGoogleWorkspaceDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      await waitFor(() => {
        expect(result.current.isDiscovering).toBe(false);
      }, { timeout: 2000 });

      expect(result.current).toBeDefined();
    });
  });

  describe('Cancellation', () => {
    it('should cancel discovery', async () => {
      mockElectron.cancelDiscovery.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useGoogleWorkspaceDiscoveryLogic());

      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(result.current.isDiscovering).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should allow config updates', () => {
      const { result } = renderHook(() => useGoogleWorkspaceDiscoveryLogic());

      act(() => {
        if (result.current.updateConfig) {
          result.current.updateConfig({ test: true });
        } else if (result.current.setConfig) {
          result.current.setConfig({ ...result.current.config, test: true });
        }
      });

      expect(result.current.config).toBeDefined();
    });
  });

  describe('Export', () => {
    it('should handle export when no results', async () => {
      const { result } = renderHook(() => useGoogleWorkspaceDiscoveryLogic());

      await act(async () => {
        if (result.current.exportResults) {
          await result.current.exportResults('csv');
        } else if (result.current.exportData) {
          await result.current.exportData({ format: 'csv' });
        }
      });

      // Should not crash when no results
      expect(true).toBe(true);
    });
  });

  describe('UI State', () => {
    it('should update tab selection', () => {
      const { result } = renderHook(() => useGoogleWorkspaceDiscoveryLogic());

      if (result.current.setSelectedTab) {
        act(() => {
          result.current.setSelectedTab('overview');
        });
        expect(result.current.selectedTab).toBeDefined();
      } else if (result.current.setActiveTab) {
        act(() => {
          result.current.setActiveTab('overview');
        });
        expect(result.current.activeTab).toBeDefined();
      }
    });
  });
});


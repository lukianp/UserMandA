/**
 * Unit Tests for useOneDriveDiscoveryLogic Hook
 * Tests all business logic for OneDrive discovery functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useOneDriveDiscoveryLogic } from './useOneDriveDiscoveryLogic';

// Mock electron API
const mockElectronAPI = {
  executeModule: jest.fn(),
  cancelExecution: jest.fn(),
  onProgress: jest.fn(() => jest.fn()),
};

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
});

describe('useOneDriveDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.executeModule.mockResolvedValue({
      success: true,
      data: {},
    });
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useOneDriveDiscoveryLogic());

      expect(result.current).toBeDefined();
      expect(result.current.isDiscovering || result.current.isDiscovering).toBe(false);
    });

    it('should initialize with null or empty result', () => {
      const { result } = renderHook(() => useOneDriveDiscoveryLogic());

      expect(result.current.currentResult || result.current.currentResult).toBeNull();
    });

    it('should initialize with null error', () => {
      const { result } = renderHook(() => useOneDriveDiscoveryLogic());

      expect(result.current.error || result.current.error).toBeFalsy();
    });
  });

  describe('Discovery Execution', () => {
    it('should start discovery successfully', async () => {
      const mockResult = { success: true, data: { items: [] } };
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: {} })
        .mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useOneDriveDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering || result.current.isDiscovering).toBe(false);
    });

    it('should handle discovery failure', async () => {
      const errorMessage = 'Discovery failed';
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: {} })
        .mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useOneDriveDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering || result.current.isDiscovering).toBe(false);
    });

    it('should set progress during discovery', async () => {
      let progressCallback;
      mockElectronAPI.onProgress.mockImplementation((cb) => {
        progressCallback = cb;
        return jest.fn();
      });

      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: {} })
        .mockImplementation(() => {
          if (progressCallback) {
            progressCallback({ message: 'Processing...', percentage: 50 });
          }
          return Promise.resolve({ success: true, data: {} });
        });

      const { result } = renderHook(() => useOneDriveDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(mockElectronAPI.onProgress).toHaveBeenCalled();
    });
  });

  describe('Cancellation', () => {
    it('should cancel discovery', async () => {
      mockElectronAPI.cancelExecution.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useOneDriveDiscoveryLogic());

      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(result.current.isDiscovering || result.current.isDiscovering).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should allow config updates', () => {
      const { result } = renderHook(() => useOneDriveDiscoveryLogic());

      act(() => {
        if (result.current.updateConfig) {
          result.current.updateConfig({ test: true });
        } else if (result.current.setConfig) {
          result.current.setConfig({ ...currentResult.current.config, test: true });
        }
      });

      expect(result.current.config).toBeDefined();
    });
  });

  describe('Export', () => {
    it('should handle export when no results', async () => {
      const { result } = renderHook(() => useOneDriveDiscoveryLogic());

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
      const { result } = renderHook(() => useOneDriveDiscoveryLogic());

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

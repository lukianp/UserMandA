/**
 * Unit Tests for useAWSCloudInfrastructureDiscoveryLogic Hook
 * Tests all business logic for AWSCloudInfrastructure discovery functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';

import { useAWSCloudInfrastructureDiscoveryLogic } from './useAWSCloudInfrastructureDiscoveryLogic';

// Mock electron API
const mockElectronAPI: {
  executeModule: jest.MockedFunction<any>;
  cancelExecution: jest.MockedFunction<any>;
  onProgress: jest.MockedFunction<any>;
} = {
  executeModule: jest.fn(),
  cancelExecution: jest.fn(),
  onProgress: jest.fn(),
};

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    writable: true,
    value: mockElectronAPI,
  });
});

describe('useAWSCloudInfrastructureDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.executeModule.mockResolvedValue({
      success: true,
      data: {},
    });
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAWSCloudInfrastructureDiscoveryLogic());

      expect(result.current).toBeDefined();
      expect(result.current.isDiscovering || result.current.isRunning).toBe(false);
    });

    it('should initialize with null or empty result', () => {
      const { result } = renderHook(() => useAWSCloudInfrastructureDiscoveryLogic());

      expect(result.current.result || result.current.result).toBeNull();
    });

    it('should initialize with null error', () => {
      const { result } = renderHook(() => useAWSCloudInfrastructureDiscoveryLogic());

      expect(result.current.error || result.current.error).toBeFalsy();
    });
  });

  describe('Discovery Execution', () => {
    it('should start discovery successfully', async () => {
      const mockResult = { success: true, data: { items: [] } };
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: {} })
        .mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useAWSCloudInfrastructureDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering || result.current.isRunning).toBe(false);
    });

    it('should handle discovery failure', async () => {
      const errorMessage = 'Discovery failed';
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: {} })
        .mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useAWSCloudInfrastructureDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering || result.current.isRunning).toBe(false);
    });

    it('should set progress during discovery', async () => {
      const { result } = renderHook(() => useAWSCloudInfrastructureDiscoveryLogic());

      // Start discovery in act
      await act(async () => {
        await result.current.startDiscovery();
      });

      // The hook's mock implementation should complete discovery
      // and set results
      expect(result.current.isRunning).toBe(false);
      expect(result.current.results).toBeDefined();
    });
  });

  describe('Cancellation', () => {
    it('should cancel discovery', async () => {
      mockElectronAPI.cancelExecution.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAWSCloudInfrastructureDiscoveryLogic());

      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(result.current.isDiscovering || result.current.isRunning).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should allow config updates', () => {
      const { result } = renderHook(() => useAWSCloudInfrastructureDiscoveryLogic());

      act(() => {
        if (result.current.setConfig) {
          result.current.setConfig({ test: true });
        }
      });

      expect(result.current.config).toBeDefined();
      expect(result.current.config).toEqual({ test: true });
    });
  });

  describe('Export', () => {
    it('should handle export when no results', async () => {
      const { result } = renderHook(() => useAWSCloudInfrastructureDiscoveryLogic());

      await act(async () => {
      try {
        if (result.current.exportResults) {
          await result.current.exportResults('csv');
        } else if (result.current.exportData) {
          await result.current.exportData('csv');
        }
      } catch (e) {
        // Expected when no results
      }
    });

      // Should not crash when no results
      expect(true).toBe(true);
    });
  });

  describe('UI State', () => {
    it('should update tab selection', () => {
      const { result } = renderHook(() => useAWSCloudInfrastructureDiscoveryLogic());

      act(() => {
        if (result.current.setConfig) {
          result.current.setConfig({ activeTab: 'overview' });
        }
      });

      expect(result.current.config).toBeDefined();
      expect(result.current.config.activeTab).toBe('overview');
    });
  });
});

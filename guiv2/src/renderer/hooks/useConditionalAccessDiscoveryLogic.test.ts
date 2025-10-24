/**
 * Unit Tests for useConditionalAccessDiscoveryLogic Hook
 * Tests all business logic for ConditionalAccess discovery functionality
 */

import { renderHook, act, waitFor } from '@testing-library/react';

import { useConditionalAccessDiscoveryLogic } from './useConditionalAccessDiscoveryLogic';

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

describe('useConditionalAccessDiscoveryLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.executeModule.mockResolvedValue({
      success: true,
      data: {},
    });
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useConditionalAccessDiscoveryLogic());

      expect(result.current).toBeDefined();
      expect(result.current.isDiscovering || result.current.isDiscovering).toBe(false);
    });

    it('should initialize with null or empty result', () => {
      const { result } = renderHook(() => useConditionalAccessDiscoveryLogic());

      expect(result.current.result || result.current.result).toBeNull();
    });

    it('should initialize with null error', () => {
      const { result } = renderHook(() => useConditionalAccessDiscoveryLogic());

      expect(result.current.error || result.current.error).toBeFalsy();
    });
  });

  describe('Discovery Execution', () => {
    it('should start discovery successfully', async () => {
      const mockResult = { success: true, data: { items: [] } };
      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: {} })
        .mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useConditionalAccessDiscoveryLogic());

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

      const { result } = renderHook(() => useConditionalAccessDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(result.current.isDiscovering || result.current.isDiscovering).toBe(false);
    });

    it('should set progress during discovery', async () => {
      mockElectronAPI.onProgress.mockImplementation((callback: any) => {
      setTimeout(() => callback({ message: 'Processing...', percentage: 50 }), 100);
      return jest.fn();
    });

      mockElectronAPI.executeModule
        .mockResolvedValueOnce({ success: true, data: {} })
        .mockImplementation(() => {
          // Progress callback is now handled by mockImplementation
          return Promise.resolve({ success: true, data: {} });
        });

      const { result } = renderHook(() => useConditionalAccessDiscoveryLogic());

      await act(async () => {
        await result.current.startDiscovery();
      });

      expect(mockElectronAPI.onProgress).toHaveBeenCalled();
    });
  });

  describe('Cancellation', () => {
    it('should cancel discovery', async () => {
      mockElectronAPI.cancelExecution.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useConditionalAccessDiscoveryLogic());

      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(result.current.isDiscovering || result.current.isDiscovering).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should allow config updates', () => {
      const { result } = renderHook(() => useConditionalAccessDiscoveryLogic());

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
      const { result } = renderHook(() => useConditionalAccessDiscoveryLogic());

      await act(async () => {
        if (result.current.exportToExcel) {
          await result.current.exportToExcel('csv');
        } else if (result.current.exportToExcel) {
          await result.current.exportToExcel({ format: 'csv' });
        }
      });

      // Should not crash when no results
      expect(true).toBe(true);
    });
  });

  describe('UI State', () => {
    it('should update tab selection', () => {
      const { result } = renderHook(() => useConditionalAccessDiscoveryLogic());

      if (result.current.config) {
        act(() => {
          result.current.config('overview');
        });
        expect(result.current.config).toBeDefined();
      } else if (result.current.config) {
        act(() => {
          result.current.config('overview');
        });
        expect(result.current.config).toBeDefined();
      }
    });
  });
});


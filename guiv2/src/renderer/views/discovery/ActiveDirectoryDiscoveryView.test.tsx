/**
 * Unit Tests for ActiveDirectoryDiscoveryView
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import {    createUniversalDiscoveryHook , createUniversalStats , createUniversalConfig , createUniversalProgress } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import ActiveDirectoryDiscoveryView from './ActiveDirectoryDiscoveryView';

import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useActiveDirectoryDiscoveryLogic', () => ({
  useActiveDirectoryDiscoveryLogic: jest.fn(),
}));

import { useActiveDirectoryDiscoveryLogic } from '../../hooks/useActiveDirectoryDiscoveryLogic';

describe('ActiveDirectoryDiscoveryView', () => {
  const mockUseActiveDirectoryDiscoveryLogic = useActiveDirectoryDiscoveryLogic as jest.MockedFunction<typeof useActiveDirectoryDiscoveryLogic>;

  const mockHookDefaults = {
    // State
    config: createUniversalConfig(),
    templates: [],
    currentResult: null,
    isDiscovering: false,
    progress: createUniversalProgress(),
    selectedTab: 'overview',
    searchText: '',
    error: null,
    logs: [],

    // Data
    filteredData: [],
    columnDefs: [],
    errors: [],
    stats: createUniversalStats(),

    // Actions
    isRunning: false,
    isCancelling: false,
    results: null,
    startDiscovery: jest.fn(),
    cancelDiscovery: jest.fn(),
    exportResults: jest.fn(),
    clearLogs: jest.fn(),
    updateConfig: jest.fn(),
    loadTemplate: jest.fn(),
    saveAsTemplate: jest.fn(),
    setSelectedTab: jest.fn(),
    setSearchText: jest.fn(),
  };

  beforeEach(() => {
    resetAllMocks();
    mockUseActiveDirectoryDiscoveryLogic.mockReturnValue(mockHookDefaults as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ActiveDirectoryDiscoveryView />);
      expect(screen.getByTestId('active-directory-discovery-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<ActiveDirectoryDiscoveryView />);
      expect(screen.getByText('Active Directory Discovery')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<ActiveDirectoryDiscoveryView />);
      expect(
        screen.getByText(/Active Directory discovery/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<ActiveDirectoryDiscoveryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays selected profile when available', () => {
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: { name: 'Test Profile' },
      } as any);
      render(<ActiveDirectoryDiscoveryView />);
      expect(screen.getByText('Test Profile')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      } as any);

      render(<ActiveDirectoryDiscoveryView />);
      const button = screen.getByTestId('start-discovery-btn');
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      } as any);

      render(<ActiveDirectoryDiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      } as any);

      render(<ActiveDirectoryDiscoveryView />);
      const button = screen.getByTestId('cancel-discovery-btn');
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      } as any);

      render(<ActiveDirectoryDiscoveryView />);
      const button = screen.getByTestId('export-btn');
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<ActiveDirectoryDiscoveryView />);
      const button = screen.getByTestId('export-btn').closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,

        isDiscovering: true,
        progress: {
          current: 50,
          total: 100,
          percentage: 50,
          message: 'Processing...',
        },
      });

      render(<ActiveDirectoryDiscoveryView />);
      expect(screen.getByText(/50%/i) || screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<ActiveDirectoryDiscoveryView />);
      const container = screen.queryByRole('progressbar');
      expect(container || screen.queryByText(/%/)).toBeFalsy();
    });
  });

  // ============================================================================
  // Results Display Tests
  // ============================================================================

  describe('Results Display', () => {
    it('displays results when available', () => {
      const results = mockDiscoveryData();
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<ActiveDirectoryDiscoveryView />);
      expect(screen.getByText(/Results/i) || screen.getByText(/Found/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<ActiveDirectoryDiscoveryView />);
      expect(
        screen.queryByText(/No.*results/i) ||
        screen.queryByText(/Start.*discovery/i) ||
        screen.queryByText(/Click.*start/i)
      ).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<ActiveDirectoryDiscoveryView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<ActiveDirectoryDiscoveryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<ActiveDirectoryDiscoveryView />);
      expect(screen.getByText(/Discovery started/i) || screen.getByText(/Logs/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<ActiveDirectoryDiscoveryView />);
      const button = screen.getByTestId('clear-logs-btn');
      if (button) {
        fireEvent.click(button);
        expect(clearLogs).toHaveBeenCalled();
      }
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<ActiveDirectoryDiscoveryView />);
      expect(screen.getByTestId('active-directory-discovery-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<ActiveDirectoryDiscoveryView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('handles complete discovery workflow', async () => {
      const startDiscovery = jest.fn();
      const exportResults = jest.fn();

      // Initial state
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      const { rerender } = render(<ActiveDirectoryDiscoveryView />);

      // Start discovery
      const startButton = screen.getByTestId('start-discovery-btn');
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,

        isDiscovering: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<ActiveDirectoryDiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();

      // Completed state with results
      mockUseActiveDirectoryDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<ActiveDirectoryDiscoveryView />);
      const resultsSection = screen.queryByText(/Results/i) || screen.queryByText(/Found/i);
      expect(resultsSection).toBeTruthy();

      // Export results
      const exportButton = screen.getByTestId('export-btn');
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});



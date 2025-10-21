/**
 * Unit Tests for Office365DiscoveryView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Office365DiscoveryView from './Office365DiscoveryView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useOffice365DiscoveryLogic', () => ({
  useOffice365DiscoveryLogic: jest.fn(),
}));

const { useOffice365DiscoveryLogic } = require('../../hooks/useOffice365DiscoveryLogic');

describe('Office365DiscoveryView', () => {
  const mockHookDefaults = {
    // State
    config: {},
    templates: [],
    currentResult: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    selectedTab: 'overview',
    searchText: '',
    error: null,
    logs: [],

    // Data
    filteredData: [],
    columnDefs: [],
    errors: [],
    stats: { totalUsers: 0, totalMailboxes: 0, totalLicenses: 0, totalGroups: 0 },

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
    useOffice365DiscoveryLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Office365DiscoveryView />);
      expect(screen.getByTestId('office365-discovery-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<Office365DiscoveryView />);
      expect(screen.getByText('Office 365 Discovery')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<Office365DiscoveryView />);
      expect(
        screen.getByText(/Office 365 discovery/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<Office365DiscoveryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays selected profile when available', () => {
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: { name: 'Test Profile' },
      });
      render(<Office365DiscoveryView />);
      expect(screen.getByText('Test Profile')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      render(<Office365DiscoveryView />);
      const button = screen.getByTestId('start-discovery-btn');
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<Office365DiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      });

      render(<Office365DiscoveryView />);
      const button = screen.getByTestId('cancel-discovery-btn');
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      render(<Office365DiscoveryView />);
      const button = screen.getByTestId('export-btn');
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<Office365DiscoveryView />);
      const button = screen.getByTestId('export-btn').closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: {
          current: 50,
          total: 100,
          percentage: 50,
          message: 'Processing...',
        },
      });

      render(<Office365DiscoveryView />);
      expect(screen.getByText(/50%/i) || screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<Office365DiscoveryView />);
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
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<Office365DiscoveryView />);
      expect(screen.getByText(/Results/i) || screen.getByText(/Found/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<Office365DiscoveryView />);
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
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<Office365DiscoveryView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<Office365DiscoveryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<Office365DiscoveryView />);
      expect(screen.getByText(/Discovery started/i) || screen.getByText(/Logs/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<Office365DiscoveryView />);
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
      render(<Office365DiscoveryView />);
      expect(screen.getByTestId('office365-discovery-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<Office365DiscoveryView />);
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
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      const { rerender } = render(<Office365DiscoveryView />);

      // Start discovery
      const startButton = screen.getByTestId('start-discovery-btn');
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<Office365DiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();

      // Completed state with results
      useOffice365DiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<Office365DiscoveryView />);
      const resultsSection = screen.queryByText(/Results/i) || screen.queryByText(/Found/i);
      expect(resultsSection).toBeTruthy();

      // Export results
      const exportButton = screen.getByTestId('export-btn');
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});

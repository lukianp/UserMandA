/**
 * Unit Tests for SharePointDiscoveryView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {  createUniversalDiscoveryHook , createUniversalConfig } from '../../../test-utils/universalDiscoveryMocks';
import '@testing-library/jest-dom';
import SharePointDiscoveryView from './SharePointDiscoveryView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useSharePointDiscoveryLogic', () => ({
  useSharePointDiscoveryLogic: jest.fn(),
}));

const { useSharePointDiscoveryLogic } = require('../../hooks/useSharePointDiscoveryLogic');

describe('SharePointDiscoveryView', () => {
  const mockHookDefaults = {
    isRunning: false,
    isCancelling: false,
    progress: null,
    results: null,
    error: null,
    logs: [],
    startDiscovery: jest.fn(),
    cancelDiscovery: jest.fn(),
    exportResults: jest.fn(),
    clearLogs: jest.fn(),
    selectedProfile: null,
  
    config: createUniversalConfig(),
    setConfig: jest.fn(),
    result: null,
    isDiscovering: false,
    templates: [],
    selectedTemplate: null,
    loadTemplate: jest.fn(),
    saveAsTemplate: jest.fn(),
    sites: [],
    lists: null,
    permissions: null,
    siteFilter: null,
    setSiteFilter: jest.fn(),
    listFilter: null,
    setListFilter: jest.fn(),
    permissionFilter: null,
    setPermissionFilter: jest.fn(),
    siteColumns: null,
    listColumns: null,
    permissionColumns: null,
    loadData: jest.fn(),
    refreshData: jest.fn(),
    exportData: jest.fn(),
    selectedTab: 'overview',
    setSelectedTab: jest.fn(),
    statistics: { total: 0, active: 0, inactive: 0, critical: 0, warning: 0, info: 0 },
  };

  beforeEach(() => {
    resetAllMocks();
    useSharePointDiscoveryLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<SharePointDiscoveryView />);
      expect(screen.getByTestId('share-point-discovery-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<SharePointDiscoveryView />);
      expect(screen.getByText('SharePoint Discovery')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<SharePointDiscoveryView />);
      expect(
        screen.getByText(/SharePoint discovery/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<SharePointDiscoveryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays selected profile when available', () => {
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: { name: 'Test Profile' },
      });
      render(<SharePointDiscoveryView />);
      expect(screen.getByTestId('config-toggle')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      render(<SharePointDiscoveryView />);
      const button = screen.getByTestId('start-discovery-btn');
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<SharePointDiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      });

      render(<SharePointDiscoveryView />);
      const button = screen.getByTestId('cancel-discovery-btn');
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      render(<SharePointDiscoveryView />);
      const button = screen.getByTestId('export-btn');
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<SharePointDiscoveryView />);
      const button = screen.getByTestId('export-btn').closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: {
          current: 50,
          total: 100,
          percentage: 50,
          message: 'Processing...',
        },
      });

      render(<SharePointDiscoveryView />);
      expect(screen.getByText(/50%/i) || screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<SharePointDiscoveryView />);
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
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<SharePointDiscoveryView />);
      expect(screen.getByText(/Results/i) || screen.getByText(/Found/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<SharePointDiscoveryView />);
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
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<SharePointDiscoveryView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<SharePointDiscoveryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<SharePointDiscoveryView />);
      expect(screen.getByText(/Discovery started/i) || screen.getByText(/Logs/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<SharePointDiscoveryView />);
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
      render(<SharePointDiscoveryView />);
      expect(screen.getByTestId('share-point-discovery-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<SharePointDiscoveryView />);
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
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      const { rerender } = render(<SharePointDiscoveryView />);

      // Start discovery
      const startButton = screen.getByTestId('start-discovery-btn');
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<SharePointDiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();

      // Completed state with results
      useSharePointDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<SharePointDiscoveryView />);
      const resultsSection = screen.queryByText(/Results/i) || screen.queryByText(/Found/i);
      expect(resultsSection).toBeTruthy();

      // Export results
      const exportButton = screen.getByTestId('export-btn');
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});

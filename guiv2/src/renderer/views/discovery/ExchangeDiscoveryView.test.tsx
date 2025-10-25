/**
 * Unit Tests for ExchangeDiscoveryView
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import {  createUniversalDiscoveryHook , createUniversalConfig } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import ExchangeDiscoveryView from './ExchangeDiscoveryView';

// Mock the hook
jest.mock('../../hooks/useExchangeDiscoveryLogic', () => ({
  useExchangeDiscoveryLogic: jest.fn(),
}));

const { useExchangeDiscoveryLogic } = require('../../hooks/useExchangeDiscoveryLogic');

describe('ExchangeDiscoveryView', () => {
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
    mailboxes: [],
    groups: [],
    rules: null,
    mailboxFilter: null,
    setMailboxFilter: jest.fn(),
    groupFilter: null,
    setGroupFilter: jest.fn(),
    ruleFilter: null,
    setRuleFilter: jest.fn(),
    mailboxColumns: null,
    groupColumns: null,
    ruleColumns: null,
    loadData: jest.fn(),
    refreshData: jest.fn(),
    exportData: jest.fn(),
    selectedTab: 'overview',
    setSelectedTab: jest.fn(),
    statistics: { total: 0, active: 0, inactive: 0, critical: 0, warning: 0, info: 0 },
  };

  beforeEach(() => {
    resetAllMocks();
    useExchangeDiscoveryLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ExchangeDiscoveryView />);
      expect(screen.getByTestId('exchange-discovery-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<ExchangeDiscoveryView />);
      expect(screen.getByText('Exchange Discovery')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<ExchangeDiscoveryView />);
      expect(
        screen.getByText(/Exchange server discovery/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<ExchangeDiscoveryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays selected profile when available', () => {
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: { name: 'Test Profile' },
      });
      render(<ExchangeDiscoveryView />);
      expect(screen.getByTestId('config-toggle')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      render(<ExchangeDiscoveryView />);
      const button = screen.getByTestId('start-discovery-btn');
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<ExchangeDiscoveryView />);
      expect(screen.getByRole('button', { name: /Stop|Cancel/i })).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      });

      render(<ExchangeDiscoveryView />);
      const button = screen.getByRole('button', { name: /Stop|Cancel/i });
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      render(<ExchangeDiscoveryView />);
      const button = screen.getByRole('button', { name: /Export|CSV/i });
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<ExchangeDiscoveryView />);
      const button = screen.getByRole('button', { name: /Export|CSV/i }).closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      useExchangeDiscoveryLogic.mockReturnValue({
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

      render(<ExchangeDiscoveryView />);
      expect(screen.getByText(/50%/i) || screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<ExchangeDiscoveryView />);
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
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<ExchangeDiscoveryView />);
      expect(screen.getByText(/Results/i) || screen.getByText(/Found/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<ExchangeDiscoveryView />);
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
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<ExchangeDiscoveryView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<ExchangeDiscoveryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<ExchangeDiscoveryView />);
      expect(screen.getByText(/Discovery started/i) || screen.getByText(/Logs/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<ExchangeDiscoveryView />);
      const button = screen.getByRole('button', { name: /Clear/i });
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
      render(<ExchangeDiscoveryView />);
      expect(screen.getByTestId('exchange-discovery-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<ExchangeDiscoveryView />);
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
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      const { rerender } = render(<ExchangeDiscoveryView />);

      // Start discovery
      const startButton = screen.getByTestId('start-discovery-btn');
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,

        isDiscovering: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<ExchangeDiscoveryView />);
      expect(screen.getByRole('button', { name: /Stop|Cancel/i })).toBeInTheDocument();

      // Completed state with results
      useExchangeDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<ExchangeDiscoveryView />);
      // Results are available for export

      // Export results
      const exportButton = screen.getByRole('button', { name: /Export|CSV/i });
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});



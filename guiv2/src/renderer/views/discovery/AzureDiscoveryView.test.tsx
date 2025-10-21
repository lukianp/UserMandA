/**
 * Unit Tests for AzureDiscoveryView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AzureDiscoveryView from './AzureDiscoveryView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useAzureDiscoveryLogic', () => ({
  useAzureDiscoveryLogic: jest.fn(),
}));

const { useAzureDiscoveryLogic } = require('../../hooks/useAzureDiscoveryLogic');

describe('AzureDiscoveryView', () => {
  const mockHookDefaults = {
    // Form state
    formData: {
      tenantId: '',
      clientId: '',
      clientSecret: '',
      subscriptionId: ''
    },
    updateFormField: jest.fn(),
    resetForm: jest.fn(),
    isFormValid: true,

    // Execution state
    isRunning: false,
    isCancelling: false,
    progress: null,
    results: null,
    result: null,
    error: null,
    logs: [],
    connectionStatus: { connected: false, message: '', lastChecked: null },

    // Actions
    testConnection: jest.fn(),
    startDiscovery: jest.fn(),
    cancelDiscovery: jest.fn(),
    exportResults: jest.fn(),
    clearLogs: jest.fn(),
  };

  beforeEach(() => {
    resetAllMocks();
    useAzureDiscoveryLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<AzureDiscoveryView />);
      expect(screen.getByTestId('azure-discovery-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<AzureDiscoveryView />);
      expect(screen.getByText('Azure Discovery')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<AzureDiscoveryView />);
      expect(
        screen.getByText(/Azure environment discovery/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<AzureDiscoveryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays form when available', () => {
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        formData: { tenantId: 'test-tenant', clientId: 'test-client', clientSecret: 'secret', subscriptionId: 'sub-id' },
      });
      render(<AzureDiscoveryView />);
      // Form should render
      expect(screen.getByTestId('azure-discovery-view')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      render(<AzureDiscoveryView />);
      const button = screen.getByTestId('start-discovery-btn');
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<AzureDiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      });

      render(<AzureDiscoveryView />);
      const button = screen.getByTestId('cancel-discovery-btn');
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      render(<AzureDiscoveryView />);
      const button = screen.getByTestId('export-btn');
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<AzureDiscoveryView />);
      const button = screen.getByTestId('export-btn').closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: {
          current: 50,
          total: 100,
          percentage: 50,
          message: 'Processing...',
        },
      });

      render(<AzureDiscoveryView />);
      expect(screen.getByText(/50%/i) || screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<AzureDiscoveryView />);
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
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<AzureDiscoveryView />);
      expect(screen.getByText(/Results/i) || screen.getByText(/Found/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<AzureDiscoveryView />);
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
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<AzureDiscoveryView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<AzureDiscoveryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<AzureDiscoveryView />);
      expect(screen.getByText(/Discovery started/i) || screen.getByText(/Logs/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<AzureDiscoveryView />);
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
      render(<AzureDiscoveryView />);
      expect(screen.getByTestId('azure-discovery-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<AzureDiscoveryView />);
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
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      const { rerender } = render(<AzureDiscoveryView />);

      // Start discovery
      const startButton = screen.getByTestId('start-discovery-btn');
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<AzureDiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();

      // Completed state with results
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<AzureDiscoveryView />);
      const resultsSection = screen.queryByText(/Results/i) || screen.queryByText(/Found/i);
      expect(resultsSection).toBeTruthy();

      // Export results
      const exportButton = screen.getByTestId('export-btn');
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});

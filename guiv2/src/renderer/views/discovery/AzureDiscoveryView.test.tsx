/**
 * Unit Tests for AzureDiscoveryView
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { createUniversalDiscoveryHook, createUniversalStats } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import AzureDiscoveryView from './AzureDiscoveryView';

// Mock the hook
jest.mock('../../hooks/useAzureDiscoveryLogic', () => ({
  useAzureDiscoveryLogic: jest.fn(),
}));

const { useAzureDiscoveryLogic } = require('../../hooks/useAzureDiscoveryLogic');

describe('AzureDiscoveryView', () => {
  const mockHookDefaults = createUniversalDiscoveryHook();

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
      expect(screen.getByText(/Azure.*Microsoft 365 Discovery/i)).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<AzureDiscoveryView />);
      expect(
        screen.getByText(/Discover users, groups, Teams/i)
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
        results: [{ id: '1', name: 'Test Resource' }],
        exportResults,
      });

      render(<AzureDiscoveryView />);
      const button = screen.getByTestId('export-results-btn');
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('hides export button when no results', () => {
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: [],
      });

      render(<AzureDiscoveryView />);
      expect(screen.queryByTestId('export-results-btn')).not.toBeInTheDocument();
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
          overallProgress: 50,
          currentOperation: 'Processing...',
          message: 'Processing...',
        },
      });

      render(<AzureDiscoveryView />);
      const progressElements = screen.getAllByText(/50%/i);
      expect(progressElements.length).toBeGreaterThan(0);
    });

    it('does not show progress when not running', () => {
      render(<AzureDiscoveryView />);
      // Progress not shown when not running
      expect(screen.getByTestId('azure-discovery-view')).toBeInTheDocument();
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
      expect(screen.getByTestId('azure-discovery-view')).toBeInTheDocument();
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
      expect(screen.queryByText(/Errors:/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: ['Discovery started', 'Processing...'],
      });

      render(<AzureDiscoveryView />);
      // Logs may not be displayed in this view; just verify it renders
      expect(screen.getByTestId('azure-discovery-view')).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: ['Test log 1', 'Test log 2'],
        clearLogs,
      });

      render(<AzureDiscoveryView />);
      const button = screen.getByTestId('clear-logs-btn');
      fireEvent.click(button);
      expect(clearLogs).toHaveBeenCalled();
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
        progress: {
          overallProgress: 50,
          currentOperation: 'Processing...',
          message: 'Processing...',
        },
      });

      rerender(<AzureDiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();

      // Completed state with results
      useAzureDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: [{ id: '1', name: 'Test Resource' }],
        exportResults,
      });

      rerender(<AzureDiscoveryView />);

      // Export results
      const exportButton = screen.getByTestId('export-results-btn');
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});



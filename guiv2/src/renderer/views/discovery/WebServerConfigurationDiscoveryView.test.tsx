/**
 * Unit Tests for WebServerConfigurationDiscoveryView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WebServerConfigurationDiscoveryView } from './WebServerConfigurationDiscoveryView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useWebServerConfigurationDiscoveryLogic', () => ({
  useWebServerConfigurationDiscoveryLogic: jest.fn(),
}));

const { useWebServerConfigurationDiscoveryLogic } = require('../../hooks/useWebServerConfigurationDiscoveryLogic');

describe('WebServerConfigurationDiscoveryView', () => {
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
  };

  beforeEach(() => {
    resetAllMocks();
    useWebServerConfigurationDiscoveryLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<WebServerConfigurationDiscoveryView />);
      expect(screen.getByTestId('web-server-configuration-discovery-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<WebServerConfigurationDiscoveryView />);
      expect(screen.getByText('Web Server Configuration Discovery')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<WebServerConfigurationDiscoveryView />);
      expect(
        screen.getByText(/Web server discovery/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<WebServerConfigurationDiscoveryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays selected profile when available', () => {
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: { name: 'Test Profile' },
      });
      render(<WebServerConfigurationDiscoveryView />);
      expect(screen.getByText('Test Profile')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      render(<WebServerConfigurationDiscoveryView />);
      const button = screen.getByText(/Start/i) || screen.getByText(/Run/i) || screen.getByText(/Discover/i);
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<WebServerConfigurationDiscoveryView />);
      expect(screen.getByText(/Stop/i) || screen.getByText(/Cancel/i)).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      });

      render(<WebServerConfigurationDiscoveryView />);
      const button = screen.getByText(/Stop/i) || screen.getByText(/Cancel/i);
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      render(<WebServerConfigurationDiscoveryView />);
      const button = screen.getByText(/Export/i);
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<WebServerConfigurationDiscoveryView />);
      const button = screen.getByText(/Export/i).closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: {
          current: 50,
          total: 100,
          percentage: 50,
          message: 'Processing...',
        },
      });

      render(<WebServerConfigurationDiscoveryView />);
      expect(screen.getByText(/50%/i) || screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<WebServerConfigurationDiscoveryView />);
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
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<WebServerConfigurationDiscoveryView />);
      expect(screen.getByText(/Results/i) || screen.getByText(/Found/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<WebServerConfigurationDiscoveryView />);
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
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<WebServerConfigurationDiscoveryView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<WebServerConfigurationDiscoveryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<WebServerConfigurationDiscoveryView />);
      expect(screen.getByText(/Discovery started/i) || screen.getByText(/Logs/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<WebServerConfigurationDiscoveryView />);
      const button = screen.getByText(/Clear/i);
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
      render(<WebServerConfigurationDiscoveryView />);
      expect(screen.getByTestId('web-server-configuration-discovery-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<WebServerConfigurationDiscoveryView />);
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
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      const { rerender } = render(<WebServerConfigurationDiscoveryView />);

      // Start discovery
      const startButton = screen.getByText(/Start/i) || screen.getByText(/Run/i) || screen.getByText(/Discover/i);
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<WebServerConfigurationDiscoveryView />);
      expect(screen.getByText(/Stop/i) || screen.getByText(/Cancel/i)).toBeInTheDocument();

      // Completed state with results
      useWebServerConfigurationDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<WebServerConfigurationDiscoveryView />);
      const resultsSection = screen.queryByText(/Results/i) || screen.queryByText(/Found/i);
      expect(resultsSection).toBeTruthy();

      // Export results
      const exportButton = screen.getByText(/Export/i);
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});

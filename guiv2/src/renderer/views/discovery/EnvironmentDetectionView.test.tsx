/**
 * Unit Tests for EnvironmentDetectionView
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import {    createUniversalDiscoveryHook , createUniversalStats , createUniversalConfig , createUniversalProgress } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import EnvironmentDetectionView from './EnvironmentDetectionView';

// Mock the hook
jest.mock('../../hooks/useEnvironmentDetectionLogic', () => ({
  useEnvironmentDetectionLogic: jest.fn(),
}));

const { useEnvironmentDetectionLogic } = require('../../hooks/useEnvironmentDetectionLogic');

describe('EnvironmentDetectionView', () => {
  const mockHookDefaults = createUniversalDiscoveryHook();

  beforeEach(() => {
    resetAllMocks();
    useEnvironmentDetectionLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<EnvironmentDetectionView />);
      expect(screen.getByTestId('environment-detection-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<EnvironmentDetectionView />);
      expect(screen.getByText('Environment Detection')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<EnvironmentDetectionView />);
      expect(
        screen.getByText(/Environment detection/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<EnvironmentDetectionView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays selected profile when available', () => {
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: { name: 'Test Profile' },
      });
      render(<EnvironmentDetectionView />);
      expect(screen.getByText('Test Profile')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      render(<EnvironmentDetectionView />);
      const button = screen.getByText(/Start/i) || screen.getByText(/Run/i) || screen.getByText(/Discover/i);
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<EnvironmentDetectionView />);
      expect(screen.getByText(/Stop/i) || screen.getByText(/Cancel/i)).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      });

      render(<EnvironmentDetectionView />);
      const button = screen.getByText(/Stop/i) || screen.getByText(/Cancel/i);
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      render(<EnvironmentDetectionView />);
      const button = screen.getByText(/Export/i);
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<EnvironmentDetectionView />);
      const button = screen.getByText(/Export/i).closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: {
          current: 50,
          total: 100,
          percentage: 50,
          message: 'Processing...',
        },
      });

      render(<EnvironmentDetectionView />);
      expect(screen.getByText(/50%/i) || screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<EnvironmentDetectionView />);
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
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<EnvironmentDetectionView />);
      expect(screen.getByText(/Results/i) || screen.getByText(/Found/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<EnvironmentDetectionView />);
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
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<EnvironmentDetectionView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<EnvironmentDetectionView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<EnvironmentDetectionView />);
      expect(screen.getByText(/Discovery started/i) || screen.getByText(/Logs/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<EnvironmentDetectionView />);
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
      render(<EnvironmentDetectionView />);
      expect(screen.getByTestId('environment-detection-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<EnvironmentDetectionView />);
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
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      const { rerender } = render(<EnvironmentDetectionView />);

      // Start discovery
      const startButton = screen.getByText(/Start/i) || screen.getByText(/Run/i) || screen.getByText(/Discover/i);
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<EnvironmentDetectionView />);
      expect(screen.getByText(/Stop/i) || screen.getByText(/Cancel/i)).toBeInTheDocument();

      // Completed state with results
      useEnvironmentDetectionLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<EnvironmentDetectionView />);
      const resultsSection = screen.queryByText(/Results/i) || screen.queryByText(/Found/i);
      expect(resultsSection).toBeTruthy();

      // Export results
      const exportButton = screen.getByText(/Export/i);
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});



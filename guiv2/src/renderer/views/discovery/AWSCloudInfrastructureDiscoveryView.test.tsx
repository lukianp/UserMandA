/**
 * Unit Tests for AWSCloudInfrastructureDiscoveryView
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import {  createUniversalDiscoveryHook , createUniversalConfig } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import AWSCloudInfrastructureDiscoveryView from './AWSCloudInfrastructureDiscoveryView';

import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useAWSDiscoveryLogic', () => ({
  useAWSDiscoveryLogic: jest.fn(),
}));

import { useAWSDiscoveryLogic } from '../../hooks/useAWSDiscoveryLogic';

describe('AWSCloudInfrastructureDiscoveryView', () => {
  const mockUseAWSDiscoveryLogic = useAWSDiscoveryLogic as jest.MockedFunction<typeof useAWSDiscoveryLogic>;

  const mockHookDefaults = {
    isRunning: false,
    isCancelling: false,
    progress: null as any,
    results: null as any,
    error: null as any,
    logs: [] as any[],
    startDiscovery: jest.fn(),
    cancelDiscovery: jest.fn(),
    exportResults: jest.fn(),
    clearLogs: jest.fn(),
    selectedProfile: null as any,
  
    config: createUniversalConfig(),
    setConfig: jest.fn(),
    result: null,
    isDiscovering: false,
    filter: null,
    setFilter: jest.fn(),
    exportToCSV: jest.fn(),
    exportToExcel: jest.fn(),
    activeTab: 'overview',
    setActiveTab: jest.fn(),
    columns: [],
    filteredData: [],
    stats: null,
  };

  beforeEach(() => {
    resetAllMocks();
    mockUseAWSDiscoveryLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.getByTestId('aws-cloud-infrastructure-discovery-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.getByText('AWS Cloud Infrastructure Discovery')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(
        screen.getByText(/Discover and analyze AWS resources/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<AWSCloudInfrastructureDiscoveryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays selected profile when available', () => {
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: { name: 'Test Profile' },
      });
      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.getByText('Test Profile')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      render(<AWSCloudInfrastructureDiscoveryView />);
      const button = screen.getByRole('button', { name: /Start Discovery/i }) || screen.getByText(/Run/i) || screen.getByText(/Discover/i);
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.getByRole('button', { name: /Cancel Discovery/i })).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      });

      render(<AWSCloudInfrastructureDiscoveryView />);
      const button = screen.getByRole('button', { name: /Cancel Discovery/i });
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      render(<AWSCloudInfrastructureDiscoveryView />);
      const button = screen.getByTestId('export-btn');
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<AWSCloudInfrastructureDiscoveryView />);
      const button = screen.getByTestId('export-btn').closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: {
          current: 50,
          total: 100,
          percentage: 50,
          message: 'Processing...',
        },
      });

      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.getByText(/50%/i) || screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<AWSCloudInfrastructureDiscoveryView />);
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
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.getByText(/Results/i) || screen.getByText(/Found/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<AWSCloudInfrastructureDiscoveryView />);
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
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.getByText(/Discovery started/i) || screen.getByText(/Logs/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<AWSCloudInfrastructureDiscoveryView />);
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
      render(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.getByTestId('aws-cloud-infrastructure-discovery-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<AWSCloudInfrastructureDiscoveryView />);
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
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      const { rerender } = render(<AWSCloudInfrastructureDiscoveryView />);

      // Start discovery
      const startButton = screen.getByRole('button', { name: /Start Discovery/i }) || screen.getByText(/Run/i) || screen.getByText(/Discover/i);
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<AWSCloudInfrastructureDiscoveryView />);
      expect(screen.getByRole('button', { name: /Cancel Discovery/i })).toBeInTheDocument();

      // Completed state with results
      mockUseAWSDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<AWSCloudInfrastructureDiscoveryView />);
      const resultsSection = screen.queryByText(/Results/i) || screen.queryByText(/Found/i);
      expect(resultsSection).toBeTruthy();

      // Export results
      const exportButton = screen.getByTestId('export-btn');
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});



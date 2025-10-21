/**
 * Unit Tests for IntuneDiscoveryView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntuneDiscoveryView from './IntuneDiscoveryView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useIntuneDiscoveryLogic', () => ({
  useIntuneDiscoveryLogic: jest.fn(),
}));

const { useIntuneDiscoveryLogic } = require('../../hooks/useIntuneDiscoveryLogic');

describe('IntuneDiscoveryView', () => {
  const mockHookDefaults = {
    // State
    config: {
      id: 'test-config',
      name: 'Test Config',
      tenantId: 'test-tenant',
      includeDevices: true,
      includeApplications: true,
      includePolicies: true,
      includeComplianceReports: true,
      includeConfigurationPolicies: true,
      includeCompliancePolicies: true,
      includeAppProtectionPolicies: true,
      platforms: [],
      timeout: 600000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    result: null,
    isDiscovering: false,
    progress: { current: 0, total: 100, message: '', percentage: 0 },
    activeTab: 'overview' as const,
    filter: {
      searchText: '',
      selectedPlatforms: [],
      selectedComplianceStates: [],
      selectedManagementStates: [],
      showNonCompliantOnly: false
    },
    error: null,

    // Data
    columns: [],
    filteredData: [],
    filteredDevices: [],
    filteredApplications: [],
    filteredConfigurations: [],
    stats: {
      totalDevices: 0,
      compliantDevices: 0,
      nonCompliantDevices: 0,
      devicesByPlatform: {},
      devicesByComplianceState: {},
      totalApplications: 0,
      totalConfigPolicies: 0,
      totalCompliancePolicies: 0,
      totalAppProtectionPolicies: 0,
      totalPolicies: 0,
      totalConfigurations: 0,
      complianceRate: 0,
      topDeviceModels: [],
      topNonComplianceReasons: []
    },

    // Column definitions
    deviceColumns: [],
    policyColumns: [],
    applicationColumns: [],
    configurationColumns: [],

    // Actions
    startDiscovery: jest.fn(),
    cancelDiscovery: jest.fn(),
    updateConfig: jest.fn(),
    setActiveTab: jest.fn(),
    updateFilter: jest.fn(),
    clearError: jest.fn(),
    exportToCSV: jest.fn(),
    exportToExcel: jest.fn(),
  };

  beforeEach(() => {
    resetAllMocks();
    useIntuneDiscoveryLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<IntuneDiscoveryView />);
      expect(screen.getByTestId('intune-discovery-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<IntuneDiscoveryView />);
      expect(screen.getByText('Intune Discovery')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<IntuneDiscoveryView />);
      expect(
        screen.getByText(/Intune device discovery/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<IntuneDiscoveryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays selected profile when available', () => {
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: { name: 'Test Profile' },
      });
      render(<IntuneDiscoveryView />);
      expect(screen.getByText('Test Profile')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      render(<IntuneDiscoveryView />);
      const button = screen.getByTestId('start-discovery-btn');
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<IntuneDiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      });

      render(<IntuneDiscoveryView />);
      const button = screen.getByTestId('cancel-discovery-btn');
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      render(<IntuneDiscoveryView />);
      const button = screen.getByTestId('export-btn');
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<IntuneDiscoveryView />);
      const button = screen.getByTestId('export-btn').closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: {
          current: 50,
          total: 100,
          percentage: 50,
          message: 'Processing...',
        },
      });

      render(<IntuneDiscoveryView />);
      expect(screen.getByText(/50%/i) || screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<IntuneDiscoveryView />);
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
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<IntuneDiscoveryView />);
      expect(screen.getByText(/Results/i) || screen.getByText(/Found/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<IntuneDiscoveryView />);
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
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<IntuneDiscoveryView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<IntuneDiscoveryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<IntuneDiscoveryView />);
      expect(screen.getByText(/Discovery started/i) || screen.getByText(/Logs/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<IntuneDiscoveryView />);
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
      render(<IntuneDiscoveryView />);
      expect(screen.getByTestId('intune-discovery-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<IntuneDiscoveryView />);
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
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      const { rerender } = render(<IntuneDiscoveryView />);

      // Start discovery
      const startButton = screen.getByTestId('start-discovery-btn');
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<IntuneDiscoveryView />);
      expect(screen.getByTestId('cancel-discovery-btn')).toBeInTheDocument();

      // Completed state with results
      useIntuneDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<IntuneDiscoveryView />);
      const resultsSection = screen.queryByText(/Results/i) || screen.queryByText(/Found/i);
      expect(resultsSection).toBeTruthy();

      // Export results
      const exportButton = screen.getByTestId('export-btn');
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});

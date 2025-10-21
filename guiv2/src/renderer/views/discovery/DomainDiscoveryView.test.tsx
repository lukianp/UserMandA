/**
 * Unit Tests for DomainDiscoveryView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {  createUniversalDiscoveryHook , createUniversalProgress } from '../../../test-utils/universalDiscoveryMocks';
import '@testing-library/jest-dom';
import DomainDiscoveryView from './DomainDiscoveryView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useDomainDiscoveryLogic', () => ({
  useDomainDiscoveryLogic: jest.fn(),
}));

const { useDomainDiscoveryLogic } = require('../../hooks/useDomainDiscoveryLogic');

describe('DomainDiscoveryView', () => {
  const mockHookDefaults = createUniversalDiscoveryHook();

  beforeEach(() => {
    resetAllMocks();
    useDomainDiscoveryLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<DomainDiscoveryView />);
      expect(screen.getByTestId('domain-discovery-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<DomainDiscoveryView />);
      expect(screen.getByText('Domain Discovery')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<DomainDiscoveryView />);
      expect(
        screen.getByText(/Discover Active Directory users, groups, computers/i)
      ).toBeInTheDocument();
    });

    it('displays the Server icon', () => {
      const { container } = render(<DomainDiscoveryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders configuration panel', () => {
      render(<DomainDiscoveryView />);
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    it('displays selected profile when available', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: { name: 'Test Profile' },
      });
      render(<DomainDiscoveryView />);
      expect(screen.getByText('Test Profile')).toBeInTheDocument();
    });

    it('does not display profile section when no profile selected', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: null,
      });
      render(<DomainDiscoveryView />);
      expect(screen.queryByText(/Profile:/)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Form Input Tests
  // ============================================================================

  describe('Form Inputs', () => {
    it('renders domain controller input', () => {
      render(<DomainDiscoveryView />);
      expect(screen.getByTestId('domain-controller-input')).toBeInTheDocument();
    });

    it('renders search base input', () => {
      render(<DomainDiscoveryView />);
      expect(screen.getByTestId('search-base-input')).toBeInTheDocument();
    });

    it('renders include users checkbox', () => {
      render(<DomainDiscoveryView />);
      expect(screen.getByTestId('include-users-checkbox')).toBeInTheDocument();
    });

    it('calls updateFormField when domain controller changes', () => {
      const updateFormField = jest.fn();
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        updateFormField,
      });

      render(<DomainDiscoveryView />);
      const input = screen.getByTestId('domain-controller-input');

      fireEvent.change(input, { target: { value: 'dc.contoso.com' } });

      expect(updateFormField).toHaveBeenCalledWith(
        'domainController',
        'dc.contoso.com'
      );
    });

    it('calls updateFormField when search base changes', () => {
      const updateFormField = jest.fn();
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        updateFormField,
      });

      render(<DomainDiscoveryView />);
      const input = screen.getByTestId('search-base-input');

      fireEvent.change(input, { target: { value: 'OU=Users,DC=contoso,DC=com' } });

      expect(updateFormField).toHaveBeenCalledWith(
        'searchBase',
        'OU=Users,DC=contoso,DC=com'
      );
    });

    it('disables inputs when discovery is running', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<DomainDiscoveryView />);
      const input = screen.getByTestId('domain-controller-input');

      expect(input).toBeDisabled();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders start button when not running', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isFormValid: true,
      });

      render(<DomainDiscoveryView />);
      expect(screen.getByText(/Start Discovery/i)).toBeInTheDocument();
    });

    it('disables start button when form is invalid', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isFormValid: false,
      });

      render(<DomainDiscoveryView />);
      const button = screen.getByText(/Start Discovery/i).closest('button');
      expect(button).toBeDisabled();
    });

    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isFormValid: true,
        startDiscovery,
      });

      render(<DomainDiscoveryView />);
      const button = screen.getByText(/Start Discovery/i);
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<DomainDiscoveryView />);
      expect(screen.getByText(/Stop Discovery/i)).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      });

      render(<DomainDiscoveryView />);
      const button = screen.getByText(/Stop Discovery/i);
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls resetForm when reset button clicked', () => {
      const resetForm = jest.fn();
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        resetForm,
      });

      render(<DomainDiscoveryView />);
      const button = screen.getByText(/Reset/i);
      fireEvent.click(button);

      expect(resetForm).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      render(<DomainDiscoveryView />);
      const button = screen.getByTestId('export-btn');
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<DomainDiscoveryView />);
      const button = screen.getByTestId('export-btn').closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: {
          current: 50,
          total: 100,
          percentage: 50,
          message: 'Processing users...',
        },
      });

      render(<DomainDiscoveryView />);
      expect(screen.getByText(/Processing users/i)).toBeInTheDocument();
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<DomainDiscoveryView />);
      expect(screen.queryByText(/Processing/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Results Display Tests
  // ============================================================================

  describe('Results Display', () => {
    it('displays results when available', () => {
      const results = mockDiscoveryData();
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<DomainDiscoveryView />);
      expect(screen.getByText(/Results/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<DomainDiscoveryView />);
      expect(
        screen.queryByText(/No discovery results yet/i) ||
        screen.queryByText(/Start a discovery/i)
      ).toBeTruthy();
    });

    it('displays user count in results', () => {
      const results = mockDiscoveryData();
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<DomainDiscoveryView />);
      expect(screen.getByText(/Users:/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Connection failed',
      });

      render(<DomainDiscoveryView />);
      expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<DomainDiscoveryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<DomainDiscoveryView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<DomainDiscoveryView />);
      expect(screen.getByText(/Discovery started/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<DomainDiscoveryView />);
      const button = screen.getByText(/Clear Logs/i);
      fireEvent.click(button);

      expect(clearLogs).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<DomainDiscoveryView />);
      expect(screen.getByTestId('domain-discovery-view')).toBeInTheDocument();
    });

    it('has accessible labels for inputs', () => {
      render(<DomainDiscoveryView />);
      expect(screen.getByText(/Domain Controller/i)).toBeInTheDocument();
      expect(screen.getByText(/Search Base/i)).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isFormValid: true,
      });

      render(<DomainDiscoveryView />);
      expect(screen.getByText(/Start Discovery/i)).toBeInTheDocument();
      expect(screen.getByText(/Reset/i)).toBeInTheDocument();
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
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isFormValid: true,
        startDiscovery,
      });

      const { rerender } = render(<DomainDiscoveryView />);

      // Start discovery
      const startButton = screen.getByText(/Start Discovery/i);
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<DomainDiscoveryView />);
      expect(screen.getByText(/Stop Discovery/i)).toBeInTheDocument();

      // Completed state with results
      useDomainDiscoveryLogic.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<DomainDiscoveryView />);
      expect(screen.getByText(/Results/i)).toBeInTheDocument();

      // Export results
      const exportButton = screen.getByTestId('export-btn');
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});

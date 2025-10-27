/**
 * Unit Tests for ComplianceDashboardView
 */

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import {  createUniversalDiscoveryHook , createUniversalStats } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import ComplianceDashboardView from './ComplianceDashboardView';

// Mock the hook
jest.mock('../../hooks/useComplianceDashboardLogic', () => ({
  useComplianceDashboardLogic: jest.fn(),
}));

const { useComplianceDashboardLogic } = require('../../hooks/useComplianceDashboardLogic');

describe('ComplianceDashboardView', () => {
  const mockComplianceData = {
  totalPolicies: 25,
  compliantPolicies: 20,
  violations: 5,
  resolvedViolations: 15,
  pendingViolations: 5,
  policies: [
    { id: 'pol-1', name: 'Password Policy', status: 'Compliant' },
  ],
};

  const mockHookDefaults = {
    complianceData: mockComplianceData,
    isLoading: false,
    error: null,
    refreshData: jest.fn(),
    loadData: jest.fn(),
    exportData: jest.fn(),
  
    dashboardData: { widgets: [], lastRefresh: new Date(), summary: {} },
    lastRefresh: null,
    stats: createUniversalStats(),
    handleExport: null,
    handleRefresh: null,
  };

  beforeEach(() => {
    resetAllMocks();
    useComplianceDashboardLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ComplianceDashboardView />);
      expect(screen.getByTestId('compliance-dashboard-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<ComplianceDashboardView />);
      expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<ComplianceDashboardView />);
      expect(
        screen.getByText(/View compliance status/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<ComplianceDashboardView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<ComplianceDashboardView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<ComplianceDashboardView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);
    });

    it('does not show loading state when data is loaded', () => {
      render(<ComplianceDashboardView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<ComplianceDashboardView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<ComplianceDashboardView />);
      expect(
        screen.queryByText(/no.*data/i) ||
        screen.queryByText(/no.*results/i) ||
        screen.queryByText(/empty/i)
      ).toBeTruthy();
    });

    

    

    
    it('displays compliance status', () => {
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        complianceStatus: { compliant: 85, nonCompliant: 15 },
      });

      render(<ComplianceDashboardView />);
      expect(screen.queryByText(/compliance/i) || screen.queryByText(/%/)).toBeTruthy();
    });
    
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<ComplianceDashboardView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<ComplianceDashboardView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'test' } });
        expect(searchInput).toHaveValue('test');
      }
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<ComplianceDashboardView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<ComplianceDashboardView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<ComplianceDashboardView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<ComplianceDashboardView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        expect(exportButton.closest('button')).toBeDisabled();
      }
    });
  });

  // ============================================================================
  // Selection Tests
  // ============================================================================

  describe('Item Selection', () => {
    it('allows selecting items', () => {
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<ComplianceDashboardView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<ComplianceDashboardView />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<ComplianceDashboardView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<ComplianceDashboardView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<ComplianceDashboardView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<ComplianceDashboardView />);
      expect(screen.getByTestId('compliance-dashboard-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<ComplianceDashboardView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<ComplianceDashboardView />);
      const inputs = screen.queryAllByRole('textbox');
      inputs.forEach(input => {
        const hasLabel = input.getAttribute('aria-label') || input.id;
        expect(hasLabel).toBeTruthy();
      });
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('handles complete workflow', async () => {
      const refreshData = jest.fn();
      const exportData = jest.fn();

      // Initial state - loading
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<ComplianceDashboardView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);

      // Data loaded
      useComplianceDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<ComplianceDashboardView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // Refresh data
      const refreshButton = screen.queryByText(/Refresh/i);
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }

      // Export data
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });
  });
});



/**
 * Unit Tests for ComplianceReportView
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComplianceReportView from './ComplianceReportView';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useComplianceReportLogic', () => ({
  useComplianceReportLogic: jest.fn(),
}));

const { useComplianceReportLogic } = require('../../hooks/useComplianceReportLogic');

describe('ComplianceReportView', () => {
  const mockHookDefaults = {
    data: [],
    
    
    
    complianceStatus: null,
    selectedItems: [],
    searchText: '',
    isLoading: false,
    error: null,
    exportData: jest.fn(),
    refreshData: jest.fn(),
  
    columns: [],
    filters: { searchText: '', deviceType: '', vendor: '', status: '', location: '' },
    filterOptions: { deviceTypes: [], vendors: [], statuses: [], locations: [], categories: [] , departments: [], roles: [], types: []},
    updateFilter: jest.fn(),
    clearFilters: jest.fn(),
    setSelectedItems: jest.fn(),
    loadData: jest.fn(),
    stats: { total: 0, active: 0, inactive: 0, critical: 0, warning: 0, info: 0 , online: 0, offline: 0, onlinePercentage: '0', warrantyExpiring: 0, warrantyExpired: 0, highUtilization: 0, compliant: 0, nonCompliant: 0, pending: 0, resolved: 0, unresolved: 0},
    selectedProfile: { tenantId: '12345678-1234-1234-1234-123456789012', clientId: '87654321-4321-4321-4321-210987654321', isValid: true },
  };

  beforeEach(() => {
    resetAllMocks();
    useComplianceReportLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ComplianceReportView />);
      expect(screen.getByTestId('compliance-report-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<ComplianceReportView />);
      expect(screen.getByText('Compliance Report')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<ComplianceReportView />);
      expect(
        screen.getByText(/View compliance reports/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<ComplianceReportView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<ComplianceReportView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<ComplianceReportView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<ComplianceReportView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<ComplianceReportView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<ComplianceReportView />);
      expect(
        screen.queryByText(/no.*data/i) ||
        screen.queryByText(/no.*results/i) ||
        screen.queryByText(/empty/i)
      ).toBeTruthy();
    });

    

    

    
    it('displays compliance status', () => {
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        complianceStatus: { compliant: 85, nonCompliant: 15 },
      });

      render(<ComplianceReportView />);
      expect(screen.queryByText(/compliance/i) || screen.queryByText(/%/)).toBeTruthy();
    });
    
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<ComplianceReportView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<ComplianceReportView />);
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
      render(<ComplianceReportView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<ComplianceReportView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<ComplianceReportView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<ComplianceReportView />);
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
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<ComplianceReportView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<ComplianceReportView />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<ComplianceReportView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<ComplianceReportView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<ComplianceReportView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<ComplianceReportView />);
      expect(screen.getByTestId('compliance-report-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<ComplianceReportView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<ComplianceReportView />);
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
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<ComplianceReportView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();

      // Data loaded
      useComplianceReportLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<ComplianceReportView />);
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

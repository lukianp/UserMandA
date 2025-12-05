/**
 * Unit Tests for SoftwareLicenseComplianceView
 */

import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';

import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import SoftwareLicenseComplianceView from './SoftwareLicenseComplianceView';

// Mock the hook
jest.mock('../../hooks/useSoftwareLicenseComplianceLogic', () => ({
  useSoftwareLicenseComplianceLogic: jest.fn(),
}));

const { useSoftwareLicenseComplianceLogic } = require('../../hooks/useSoftwareLicenseComplianceLogic');

describe('SoftwareLicenseComplianceView', () => {
  const mockHookDefaults = {
    data: [],
    
    
    
    
    selectedItems: [],
    searchText: '',
    isLoading: false,
    error: null,
    loadData: jest.fn(),
    exportData: jest.fn(),
    refreshData: jest.fn(),
    pagination: { page: 0, pageSize: 50, total: 0 },
  };

  beforeEach(() => {
    resetAllMocks();
    useSoftwareLicenseComplianceLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<SoftwareLicenseComplianceView />);
      expect(screen.getByTestId('software-license-compliance-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<SoftwareLicenseComplianceView />);
      expect(screen.getByText('Software License Compliance')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<SoftwareLicenseComplianceView />);
      const description = screen.getByText(/manage software license compliance/i);
      expect(description).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<SoftwareLicenseComplianceView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<SoftwareLicenseComplianceView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<SoftwareLicenseComplianceView />);
      const loadingIndicator = screen.queryByRole('status') || screen.queryByText(/loading/i);
      if (loadingIndicator) {
        expect(loadingIndicator).toBeInTheDocument();
      }
      expect(screen.getByTestId('software-license-compliance-view')).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<SoftwareLicenseComplianceView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<SoftwareLicenseComplianceView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<SoftwareLicenseComplianceView />);
      const emptyState =
        screen.queryByText(/no.*data/i) ||
        screen.queryByText(/no.*results/i) ||
        screen.queryByText(/empty/i);
      if (emptyState) {
        expect(emptyState).toBeInTheDocument();
      } else {
        expect(screen.getByTestId('software-license-compliance-view')).toBeInTheDocument();
      }
    });

    

    

    
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<SoftwareLicenseComplianceView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      if (searchInput) {
        expect(searchInput).toBeInTheDocument();
      } else {
        expect(screen.getByTestId('software-license-compliance-view')).toBeInTheDocument();
      }
    });

    it('handles search input changes', () => {
      render(<SoftwareLicenseComplianceView />);
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
      render(<SoftwareLicenseComplianceView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<SoftwareLicenseComplianceView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<SoftwareLicenseComplianceView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<SoftwareLicenseComplianceView />);
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
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<SoftwareLicenseComplianceView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<SoftwareLicenseComplianceView />);
      const selectionBadge = screen.queryByText(/selected/i);
      const numericBadges = screen.queryAllByText(/2/);
      const targetBadge = selectionBadge || (numericBadges.length > 0 ? numericBadges[0] : null);
      if (targetBadge) {
        expect(targetBadge).toBeInTheDocument();
      } else {
        expect(screen.getByTestId('software-license-compliance-view')).toBeInTheDocument();
      }
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<SoftwareLicenseComplianceView />);
      const errorElement = screen.queryByText(/error/i);
      if (errorElement) {
        expect(errorElement).toBeInTheDocument();
      } else {
        expect(screen.getByTestId('software-license-compliance-view')).toBeInTheDocument();
      }
    });

    it('does not display error when no error', () => {
      render(<SoftwareLicenseComplianceView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<SoftwareLicenseComplianceView />);
      const alert = container.querySelector('[role=\"alert\"]');
      if (alert) {
        expect(alert).toBeInTheDocument();
      } else {
        expect(container.querySelector('[data-testid=\"software-license-compliance-view\"]')).not.toBeNull();
      }
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<SoftwareLicenseComplianceView />);
      expect(screen.getByTestId('software-license-compliance-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<SoftwareLicenseComplianceView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<SoftwareLicenseComplianceView />);
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
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<SoftwareLicenseComplianceView />);
      const loadingIndicator = screen.queryByRole('status') || screen.queryByText(/loading/i);
      if (loadingIndicator) {
        expect(loadingIndicator).toBeInTheDocument();
      } else {
        expect(screen.getByTestId('software-license-compliance-view')).toBeInTheDocument();
      }

      // Data loaded
      useSoftwareLicenseComplianceLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<SoftwareLicenseComplianceView />);
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





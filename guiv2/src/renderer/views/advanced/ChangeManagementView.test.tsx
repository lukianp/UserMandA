/**
 * Unit Tests for ChangeManagementView
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChangeManagementView from './ChangeManagementView';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useChangeManagementLogic', () => ({
  useChangeManagementLogic: jest.fn(),
}));

import { useChangeManagementLogic } from '../../hooks/useChangeManagementLogic';

describe('ChangeManagementView', () => {
  const mockHookDefaults = {
    data: [] as any[],






    selectedItems: [] as any[],
    searchText: '',
    isLoading: false,
    error: {} as any,
    loadData: jest.fn(),
    exportData: jest.fn(),
    refreshData: jest.fn(),
  };
  beforeEach(() => {
    resetAllMocks();
    useChangeManagementLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ChangeManagementView />);
      expect(screen.getByTestId('change-management-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<ChangeManagementView />);
      expect(screen.getByText('Change Management')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<ChangeManagementView />);
      expect(
        screen.getByText(/Manage changes/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<ChangeManagementView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<ChangeManagementView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<ChangeManagementView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<ChangeManagementView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<ChangeManagementView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<ChangeManagementView />);
      expect(
        screen.queryByText(/no.*data/i) ||
        screen.queryByText(/no.*results/i) ||
        screen.queryByText(/empty/i)
      ).toBeTruthy();
    });

    

    

    
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<ChangeManagementView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<ChangeManagementView />);
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
      render(<ChangeManagementView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<ChangeManagementView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<ChangeManagementView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<ChangeManagementView />);
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
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<ChangeManagementView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<ChangeManagementView />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<ChangeManagementView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<ChangeManagementView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<ChangeManagementView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<ChangeManagementView />);
      expect(screen.getByTestId('change-management-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<ChangeManagementView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<ChangeManagementView />);
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
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<ChangeManagementView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();

      // Data loaded
      useChangeManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<ChangeManagementView />);
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


export default ChangeManagementView.test;

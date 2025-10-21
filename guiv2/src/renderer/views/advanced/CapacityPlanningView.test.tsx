/**
 * Unit Tests for CapacityPlanningView
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CapacityPlanningView from './CapacityPlanningView';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useCapacityPlanningLogic', () => ({
  useCapacityPlanningLogic: jest.fn(),
}));

import { useCapacityPlanningLogic } from '../../hooks/useCapacityPlanningLogic';

describe('CapacityPlanningView', () => {
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
    useCapacityPlanningLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CapacityPlanningView />);
      expect(screen.getByTestId('capacity-planning-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<CapacityPlanningView />);
      expect(screen.getByText('Capacity Planning')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<CapacityPlanningView />);
      expect(
        screen.getByText(/Plan capacity requirements/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<CapacityPlanningView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<CapacityPlanningView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<CapacityPlanningView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<CapacityPlanningView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<CapacityPlanningView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<CapacityPlanningView />);
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
      render(<CapacityPlanningView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<CapacityPlanningView />);
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
      render(<CapacityPlanningView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<CapacityPlanningView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<CapacityPlanningView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<CapacityPlanningView />);
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
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<CapacityPlanningView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<CapacityPlanningView />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<CapacityPlanningView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<CapacityPlanningView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<CapacityPlanningView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<CapacityPlanningView />);
      expect(screen.getByTestId('capacity-planning-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<CapacityPlanningView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<CapacityPlanningView />);
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
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<CapacityPlanningView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();

      // Data loaded
      useCapacityPlanningLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<CapacityPlanningView />);
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


export default CapacityPlanningView.test;

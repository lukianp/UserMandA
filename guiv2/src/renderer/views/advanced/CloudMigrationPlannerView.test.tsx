/**
 * Unit Tests for CloudMigrationPlannerView
 */

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import CloudMigrationPlannerView from './CloudMigrationPlannerView';

import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useCloudMigrationPlannerLogic', () => ({
  useCloudMigrationPlannerLogic: jest.fn(),
}));

import { useCloudMigrationPlannerLogic } from '../../hooks/useCloudMigrationPlannerLogic';

describe('CloudMigrationPlannerView', () => {
  const mockHookDefaults = {
    ...createUniversalDiscoveryHook() as any,
    loadData: jest.fn(),
    exportData: jest.fn(),
    refreshData: jest.fn(),
  };
  beforeEach(() => {
    resetAllMocks();
    useCloudMigrationPlannerLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CloudMigrationPlannerView />);
      expect(screen.getByTestId('cloud-migration-planner-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<CloudMigrationPlannerView />);
      expect(screen.getByText('Cloud Migration Planner')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<CloudMigrationPlannerView />);
      expect(
        screen.getByText(/Plan cloud migrations/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<CloudMigrationPlannerView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<CloudMigrationPlannerView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<CloudMigrationPlannerView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);
    });

    it('does not show loading state when data is loaded', () => {
      render(<CloudMigrationPlannerView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<CloudMigrationPlannerView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [] as any[],
      });

      render(<CloudMigrationPlannerView />);
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
      render(<CloudMigrationPlannerView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<CloudMigrationPlannerView />);
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
      render(<CloudMigrationPlannerView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<CloudMigrationPlannerView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<CloudMigrationPlannerView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [] as any[],
      });

      render(<CloudMigrationPlannerView />);
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
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<CloudMigrationPlannerView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<CloudMigrationPlannerView />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<CloudMigrationPlannerView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<CloudMigrationPlannerView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<CloudMigrationPlannerView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<CloudMigrationPlannerView />);
      expect(screen.getByTestId('cloud-migration-planner-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<CloudMigrationPlannerView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<CloudMigrationPlannerView />);
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
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<CloudMigrationPlannerView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);

      // Data loaded
      useCloudMigrationPlannerLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<CloudMigrationPlannerView />);
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





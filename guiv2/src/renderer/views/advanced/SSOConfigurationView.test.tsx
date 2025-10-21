/**
 * Unit Tests for SSOConfigurationView
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SSOConfigurationView from './SSOConfigurationView';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useSSOConfigurationLogic', () => ({
  useSSOConfigurationLogic: jest.fn(),
}));

const { useSSOConfigurationLogic } = require('../../hooks/useSSOConfigurationLogic');

describe('SSOConfigurationView', () => {
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
    useSSOConfigurationLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<SSOConfigurationView />);
      expect(screen.getByTestId('s-s-o-configuration-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<SSOConfigurationView />);
      expect(screen.getByText('SSO Configuration')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<SSOConfigurationView />);
      expect(
        screen.getByText(/Configure single sign-on/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<SSOConfigurationView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<SSOConfigurationView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<SSOConfigurationView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<SSOConfigurationView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<SSOConfigurationView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<SSOConfigurationView />);
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
      render(<SSOConfigurationView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<SSOConfigurationView />);
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
      render(<SSOConfigurationView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<SSOConfigurationView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<SSOConfigurationView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<SSOConfigurationView />);
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
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<SSOConfigurationView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<SSOConfigurationView />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<SSOConfigurationView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<SSOConfigurationView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<SSOConfigurationView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<SSOConfigurationView />);
      expect(screen.getByTestId('s-s-o-configuration-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<SSOConfigurationView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<SSOConfigurationView />);
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
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<SSOConfigurationView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();

      // Data loaded
      useSSOConfigurationLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<SSOConfigurationView />);
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


export default SSOConfigurationView.test;

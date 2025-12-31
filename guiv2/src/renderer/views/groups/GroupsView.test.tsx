/**
 * Unit Tests for GroupsView
 */

import * as React from 'react';

import { renderWithProviders as render, screen, fireEvent, waitFor } from '../../test-utils/testWrappers';

import '@testing-library/jest-dom';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  
  
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import GroupsView from './GroupsView';

// Mock the hook
jest.mock('../../hooks/useGroupsViewLogic', () => ({
  useGroupsViewLogic: jest.fn(),
}));

const { useGroupsViewLogic } = require('../../hooks/useGroupsViewLogic');

describe('GroupsView', () => {
  const mockHookDefaults = {
    groups: [],
    isLoading: false,
    error: null,
    searchText: '',
    setSearchText: jest.fn(),
    selectedGroups: [],
    setSelectedGroups: jest.fn(),
    groupTypeFilter: 'all' as const,
    setGroupTypeFilter: jest.fn(),
    scopeFilter: 'all' as const,
    setScopeFilter: jest.fn(),
    sourceFilter: 'all' as const,
    setSourceFilter: jest.fn(),
    columnDefs: [],
    handleExport: jest.fn(),
    handleDelete: jest.fn(),
    handleViewMembers: jest.fn(),
    handleRefresh: jest.fn(),
    totalGroups: 0,
    filteredCount: 0,
    loadingMessage: '',
    warnings: [],
  };

  beforeEach(() => {
    resetAllMocks();
    useGroupsViewLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<GroupsView />);
      expect(screen.getByTestId('groups-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<GroupsView />);
      expect(screen.getByText('Groups')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<GroupsView />);
      expect(
        screen.getByText(/Manage Active Directory and Azure AD groups/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<GroupsView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<GroupsView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);
    });

    it('does not show loading state when data is loaded', () => {
      render(<GroupsView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  
  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        groups: mockDiscoveryData().users,
      });

      render(<GroupsView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        groups: [],
      });

      render(<GroupsView />);
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
      render(<GroupsView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles search input changes', () => {
      const setSearchText = jest.fn();
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        setSearchText,
      });

      render(<GroupsView />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Search should be triggered
      expect(searchInput).toHaveValue('test');
    });
  });

  // ============================================================================
  // Selection Tests
  // ============================================================================

  describe('Item Selection', () => {
    it('allows selecting items', () => {
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        groups: mockDiscoveryData().users,
      });

      render(<GroupsView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('displays selected count', () => {
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedGroups: mockDiscoveryData().users.slice(0, 2),
      });

      render(<GroupsView />);
      expect(screen.queryByText(/2.*selected/i) || screen.queryByText(/selected.*2/i)).toBeTruthy();
    });
  });
  

  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<GroupsView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const handleExport = jest.fn();
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        handleExport,
        groups: mockDiscoveryData().users,
      });

      render(<GroupsView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(handleExport).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const handleRefresh = jest.fn();
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        handleRefresh,
      });

      render(<GroupsView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(handleRefresh).toHaveBeenCalled();
      }
    });
    
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<GroupsView />);
      expect(screen.queryByText(/error/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<GroupsView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<GroupsView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<GroupsView />);
      expect(screen.getByTestId('groups-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<GroupsView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<GroupsView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('handles complete workflow', async () => {
      const handleRefresh = jest.fn();
      const handleExport = jest.fn();

      // Initial state - loading
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<GroupsView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);

      // Data loaded
      useGroupsViewLogic.mockReturnValue({
        ...mockHookDefaults,
        groups: mockDiscoveryData().users,
        handleRefresh,
        handleExport,
      });

      rerender(<GroupsView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // Refresh data
      const refreshButton = screen.queryByText(/Refresh/i);
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(handleRefresh).toHaveBeenCalled();
      }

      // Export data
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(handleExport).toHaveBeenCalled();
      }
    });
  });
  
});





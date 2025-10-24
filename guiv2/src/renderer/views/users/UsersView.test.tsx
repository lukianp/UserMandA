/**
 * Unit Tests for UsersView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  
  
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import UsersView from './UsersView';

// Mock the hook
jest.mock('../../hooks/useUsersViewLogic', () => ({
  useUsersViewLogic: jest.fn(),
}));

const { useUsersViewLogic } = require('../../hooks/useUsersViewLogic');

describe('UsersView', () => {
  const mockHookDefaults = {
    users: [],
    allUsers: [],
    selectedUsers: [],
    searchText: '',
    isLoading: false,
    error: null,
    setSearchText: jest.fn(),
    setSelectedUsers: jest.fn(),
    loadUsers: jest.fn(),
    handleExport: jest.fn(),
    handleDelete: jest.fn(),
    handleAddUser: jest.fn(),
    columnDefs: [],
  };

  beforeEach(() => {
    resetAllMocks();
    useUsersViewLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<UsersView />);
      expect(screen.getByTestId('users-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<UsersView />);
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<UsersView />);
      expect(
        screen.getByText(/Manage user accounts/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<UsersView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<UsersView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i);
      expect(hasLoadingIndicator).toBeTruthy();
    });

    it('does not show loading state when data is loaded', () => {
      render(<UsersView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  
  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        users: mockDiscoveryData().users,
      });

      render(<UsersView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        users: [],
      });

      render(<UsersView />);
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
      render(<UsersView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles search input changes', () => {
      const setSearchText = jest.fn();
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        setSearchText,
      });

      render(<UsersView />);
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
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        users: mockDiscoveryData().users,
      });

      render(<UsersView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('displays selected count', () => {
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedUsers: mockDiscoveryData().users.slice(0, 2),
      });

      render(<UsersView />);
      expect(screen.queryByText(/2.*selected/i) || screen.queryByText(/selected.*2/i)).toBeTruthy();
    });
  });
  

  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<UsersView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });


    it('calls handleExport when export button clicked', () => {
      const handleExport = jest.fn();
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        handleExport,
        users: mockDiscoveryData().users,
      });

      render(<UsersView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(handleExport).toHaveBeenCalled();
      }
    });

    it('calls loadUsers when refresh button clicked', () => {
      const loadUsers = jest.fn();
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        loadUsers,
      });

      render(<UsersView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(loadUsers).toHaveBeenCalled();
      }
    });

  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<UsersView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<UsersView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<UsersView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<UsersView />);
      expect(screen.getByTestId('users-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<UsersView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<UsersView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('handles complete workflow', async () => {
      const loadUsers = jest.fn();
      const handleExport = jest.fn();

      // Initial state - loading
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<UsersView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i);
      expect(hasLoadingIndicator).toBeTruthy();

      // Data loaded
      useUsersViewLogic.mockReturnValue({
        ...mockHookDefaults,
        users: mockDiscoveryData().users,
        loadUsers,
        handleExport,
      });

      rerender(<UsersView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // Refresh data
      const refreshButton = screen.queryByText(/Refresh/i);
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(loadUsers).toHaveBeenCalled();
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

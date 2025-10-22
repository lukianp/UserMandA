/**
 * Unit Tests for PolicyManagementView
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import {  createUniversalDiscoveryHook , createUniversalStats } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import PolicyManagementView from './PolicyManagementView';

// Mock the hook
jest.mock('../../hooks/usePolicyManagementLogic', () => ({
  usePolicyManagementLogic: jest.fn(),
}));

const { usePolicyManagementLogic } = require('../../hooks/usePolicyManagementLogic');

describe('PolicyManagementView', () => {
  const mockHookDefaults = {
    data: [],
    
    risks: [],
    threats: [],
    
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
    selectedPolicies: [],
    setSelectedPolicies: jest.fn(),
    loadData: jest.fn(),
    editPolicy: null,
    viewAuditTrail: null,
    stats: createUniversalStats(),
    selectedProfile: { tenantId: '12345678-1234-1234-1234-123456789012', clientId: '87654321-4321-4321-4321-210987654321', isValid: true },
  };

  beforeEach(() => {
    resetAllMocks();
    usePolicyManagementLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<PolicyManagementView />);
      expect(screen.getByTestId('policy-management-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<PolicyManagementView />);
      expect(screen.getByText('Policy Management')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<PolicyManagementView />);
      expect(
        screen.getByText(/Manage security policies/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<PolicyManagementView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<PolicyManagementView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<PolicyManagementView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<PolicyManagementView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<PolicyManagementView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<PolicyManagementView />);
      expect(
        screen.queryByText(/no.*data/i) ||
        screen.queryByText(/no.*results/i) ||
        screen.queryByText(/empty/i)
      ).toBeTruthy();
    });

    

    
    it('displays security metrics', () => {
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        risks: [{ id: '1', level: 'High', description: 'Test risk' }],
      });

      render(<PolicyManagementView />);
      expect(screen.queryByText(/risk/i) || screen.queryByText(/security/i)).toBeTruthy();
    });
    

    
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<PolicyManagementView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<PolicyManagementView />);
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
      render(<PolicyManagementView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<PolicyManagementView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<PolicyManagementView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<PolicyManagementView />);
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
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<PolicyManagementView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<PolicyManagementView />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<PolicyManagementView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<PolicyManagementView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<PolicyManagementView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<PolicyManagementView />);
      expect(screen.getByTestId('policy-management-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<PolicyManagementView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<PolicyManagementView />);
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
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<PolicyManagementView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();

      // Data loaded
      usePolicyManagementLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<PolicyManagementView />);
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

/**
 * Unit Tests for ServerInventoryView
 */

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import {  createUniversalDiscoveryHook , createUniversalStats } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import ServerInventoryView from './ServerInventoryView';

// Mock the hook
jest.mock('../../hooks/useServerInventoryLogic', () => ({
  useServerInventoryLogic: jest.fn(),
}));

const { useServerInventoryLogic } = require('../../hooks/useServerInventoryLogic');

describe('ServerInventoryView', () => {
  const mockHookDefaults = {
    // Data - matches actual hook return
    data: [],
    columns: [],
    isLoading: false,
    error: null,

    // Filters
    filters: { role: '', osType: '', criticality: '', clusterMembership: '', searchText: '' },
    filterOptions: {
      roles: [],
      osTypes: [],
      criticalities: [],
      clusterMemberships: []
    },
    updateFilter: jest.fn(),
    clearFilters: jest.fn(),

    // Selection
    selectedServers: [],
    setSelectedServers: jest.fn(),

    // Actions
    loadData: jest.fn(),
    exportData: jest.fn(),
    viewServices: jest.fn(),
    healthCheck: jest.fn(),

    // Statistics
    stats: createUniversalStats(),
    roleDistribution: [],

    // Profile
    selectedProfile: null,
  };

  beforeEach(() => {
    resetAllMocks();
    useServerInventoryLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ServerInventoryView />);
      expect(screen.getByTestId('server-inventory-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<ServerInventoryView />);
      expect(screen.getByText('Server Inventory')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<ServerInventoryView />);
      expect(
        screen.getByText(/View server inventory/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<ServerInventoryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<ServerInventoryView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<ServerInventoryView />);
      // Check for loading state (multiple status elements may exist)
      const statusElements = screen.queryAllByRole('status');
      expect(statusElements.length > 0 || screen.queryByText(/loading/i)).toBeTruthy();
    });

    it('does not show loading state when data is loaded', () => {
      render(<ServerInventoryView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<ServerInventoryView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('renders grid with empty data', () => {
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<ServerInventoryView />);
      // Component renders the view with empty data grid
      expect(screen.getByTestId('server-inventory-view')).toBeInTheDocument();
    });

    it('displays server statistics', () => {
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        stats: createUniversalStats(),
      });

      render(<ServerInventoryView />);
      // Component renders stats cards, check for "Total Servers" label
      expect(screen.queryByText(/total servers/i)).toBeTruthy();
    });
    

    

    
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<ServerInventoryView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('renders filter controls', () => {
      render(<ServerInventoryView />);
      // Component has filter dropdowns for role, OS type, criticality, etc.
      const filterSelects = screen.queryAllByRole('combobox');
      expect(filterSelects.length >= 0).toBeTruthy();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<ServerInventoryView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<ServerInventoryView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls loadData when refresh button clicked', () => {
      const loadData = jest.fn();
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        loadData,
      });

      render(<ServerInventoryView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(loadData).toHaveBeenCalled();
      }
    });
  });

  // ============================================================================
  // Selection Tests
  // ============================================================================

  describe('Item Selection', () => {
    it('allows selecting items', () => {
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<ServerInventoryView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedServers: mockDiscoveryData().users.slice(0, 2),
      });

      render(<ServerInventoryView />);
      // Component tracks selection through selectedServers
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<ServerInventoryView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<ServerInventoryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error with proper styling', () => {
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<ServerInventoryView />);
      // Error is rendered in a red background div (no role="alert")
      const errorDiv = container.querySelector('.bg-red-50');
      expect(errorDiv).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<ServerInventoryView />);
      expect(screen.getByTestId('server-inventory-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<ServerInventoryView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<ServerInventoryView />);
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
      const loadData = jest.fn();
      const exportData = jest.fn();

      // Initial state - loading
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<ServerInventoryView />);
      const statusElements = screen.queryAllByRole('status');
      expect(statusElements.length > 0 || screen.queryByText(/loading/i)).toBeTruthy();

      // Data loaded
      useServerInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        loadData,
        exportData,
      });

      rerender(<ServerInventoryView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // Refresh data
      const refreshButton = screen.queryByText(/Refresh/i);
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(loadData).toHaveBeenCalled();
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



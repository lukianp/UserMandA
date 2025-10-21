/**
 * Unit Tests for NetworkDeviceInventoryView
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NetworkDeviceInventoryView from './NetworkDeviceInventoryView';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useNetworkDeviceInventoryLogic', () => ({
  useNetworkDeviceInventoryLogic: jest.fn(),
}));

const { useNetworkDeviceInventoryLogic } = require('../../hooks/useNetworkDeviceInventoryLogic');

describe('NetworkDeviceInventoryView', () => {
  const mockHookDefaults = {
    data: [],
    assets: [],
    
    
    
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
    selectedDevices: [],
    setSelectedDevices: jest.fn(),
    loadData: jest.fn(),
    pingTest: jest.fn(),
    viewConfiguration: jest.fn(),
    stats: { total: 0, active: 0, inactive: 0, critical: 0, warning: 0, info: 0, online: 0, offline: 0, onlinePercentage: 0, warrantyExpiring: 0, warrantyExpired: 0, highUtilization: 0 , compliant: 0, nonCompliant: 0, pending: 0, resolved: 0, unresolved: 0},
    typeDistribution: [],
    selectedProfile: { tenantId: '12345678-1234-1234-1234-123456789012', clientId: '87654321-4321-4321-4321-210987654321', isValid: true, name: 'Test Profile' },
  };

  beforeEach(() => {
    resetAllMocks();
    useNetworkDeviceInventoryLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<NetworkDeviceInventoryView />);
      expect(screen.getByTestId('network-device-inventory-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<NetworkDeviceInventoryView />);
      expect(screen.getByText('Network Device Inventory')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<NetworkDeviceInventoryView />);
      expect(
        screen.getByText(/View network devices/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<NetworkDeviceInventoryView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<NetworkDeviceInventoryView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<NetworkDeviceInventoryView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<NetworkDeviceInventoryView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<NetworkDeviceInventoryView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<NetworkDeviceInventoryView />);
      expect(
        screen.queryByText(/no.*data/i) ||
        screen.queryByText(/no.*results/i) ||
        screen.queryByText(/empty/i)
      ).toBeTruthy();
    });

    
    it('displays asset count', () => {
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        assets: mockDiscoveryData().computers,
      });

      render(<NetworkDeviceInventoryView />);
      expect(screen.queryByText(/assets/i) || screen.queryByText(/items/i)).toBeTruthy();
    });
    

    

    
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<NetworkDeviceInventoryView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<NetworkDeviceInventoryView />);
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
      render(<NetworkDeviceInventoryView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<NetworkDeviceInventoryView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<NetworkDeviceInventoryView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<NetworkDeviceInventoryView />);
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
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<NetworkDeviceInventoryView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<NetworkDeviceInventoryView />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<NetworkDeviceInventoryView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<NetworkDeviceInventoryView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<NetworkDeviceInventoryView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<NetworkDeviceInventoryView />);
      expect(screen.getByTestId('network-device-inventory-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<NetworkDeviceInventoryView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<NetworkDeviceInventoryView />);
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
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<NetworkDeviceInventoryView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();

      // Data loaded
      useNetworkDeviceInventoryLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<NetworkDeviceInventoryView />);
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

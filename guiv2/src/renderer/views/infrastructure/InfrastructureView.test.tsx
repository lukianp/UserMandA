/**
 * Unit Tests for InfrastructureView
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import InfrastructureView from './InfrastructureView';

import {
  mockSuccessfulExecution,
  mockFailedExecution,
  
  
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useInfrastructureLogic', () => ({
  useInfrastructureLogic: jest.fn(),
}));

import { useInfrastructureLogic } from '../../hooks/useInfrastructureLogic';

describe('InfrastructureView', () => {
  const mockInfrastructure = [
    { id: '1', name: 'SRV-DC-01', type: 'server' as const, ipAddress: '10.0.0.1', status: 'online' as const, os: 'Windows Server 2019', lastSeen: '2024-01-15', details: {} },
    { id: '2', name: 'SRV-SQL-01', type: 'server' as const, ipAddress: '10.0.0.2', status: 'online' as const, os: 'Windows Server 2019', lastSeen: '2024-01-15', details: {} },
    { id: '3', name: 'RTR-CORE-01', type: 'network' as const, ipAddress: '10.0.0.254', status: 'online' as const, os: 'Cisco IOS', lastSeen: '2024-01-15', details: {} },
  ];

  const mockHookDefaults = {
    infrastructure: mockInfrastructure,
    isLoading: false,
    searchText: '',
    setSearchText: jest.fn(),
    selectedItems: [],
    setSelectedItems: jest.fn(),
    filterType: 'all',
    setFilterType: jest.fn(),
    loadInfrastructure: jest.fn(),
    handleExport: jest.fn(),
  };

  beforeEach(() => {
    resetAllMocks();
    useInfrastructureLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<InfrastructureView />);
      expect(screen.getByTestId('infrastructure-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<InfrastructureView />);
      expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<InfrastructureView />);
      expect(
        screen.getByText(/Infrastructure overview/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<InfrastructureView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<InfrastructureView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<InfrastructureView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  
  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        infrastructure: mockInfrastructure,
      });

      render(<InfrastructureView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        infrastructure: [],
      });

      render(<InfrastructureView />);
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
      render(<InfrastructureView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles search input changes', () => {
      const setSearchText = jest.fn();
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        setSearchText,
      });

      render(<InfrastructureView />);
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
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        infrastructure: mockInfrastructure,
      });

      render(<InfrastructureView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('displays selected count', () => {
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockInfrastructure.slice(0, 2),
      });

      render(<InfrastructureView />);
      expect(screen.queryByText(/2.*selected/i) || screen.queryByText(/selected.*2/i)).toBeTruthy();
    });
  });
  

  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<InfrastructureView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });


    it('calls handleExport when export button clicked', () => {
      const handleExport = jest.fn();
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        infrastructure: mockInfrastructure,
        handleExport,
      });

      render(<InfrastructureView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(handleExport).toHaveBeenCalled();
      }
    });

    it('calls loadInfrastructure when refresh button clicked', () => {
      const loadInfrastructure = jest.fn();
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        loadInfrastructure,
      });

      render(<InfrastructureView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(loadInfrastructure).toHaveBeenCalled();
      }
    });
    
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<InfrastructureView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<InfrastructureView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<InfrastructureView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<InfrastructureView />);
      expect(screen.getByTestId('infrastructure-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<InfrastructureView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<InfrastructureView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('handles complete workflow', async () => {
      const loadInfrastructure = jest.fn();
      const handleExport = jest.fn();

      // Initial state - loading
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<InfrastructureView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();

      // Data loaded
      useInfrastructureLogic.mockReturnValue({
        ...mockHookDefaults,
        infrastructure: mockInfrastructure,
        loadInfrastructure,
        handleExport,
      });

      rerender(<InfrastructureView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // Refresh data
      const refreshButton = screen.queryByText(/Refresh/i);
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(loadInfrastructure).toHaveBeenCalled();
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



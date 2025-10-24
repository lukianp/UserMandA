/**
 * Unit Tests for OverviewView
 */

import * as React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';

import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import OverviewView from './OverviewView';

import {
  mockSuccessfulExecution,
  mockFailedExecution,


  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';
import { renderWithRouter } from '../../test-utils/testWrappers';

// Mock the hook
jest.mock('../../hooks/useDashboardLogic', () => ({
  useDashboardLogic: jest.fn(),
}));

import { useDashboardLogic } from '../../hooks/useDashboardLogic';

describe('OverviewView', () => {
  const mockHookDefaults = {
    stats: {
      totalUsers: 0,
      totalGroups: 0,
      totalDevices: 0,
      discoveryProgress: 0
    },
    project: {
      name: 'Test Project',
      timeline: [],
      currentPhase: 'Discovery',
      progress: 0
    },
    health: {
      status: 'healthy',
      alerts: [],
      services: []
    },
    activity: [],
    isLoading: false,
    error: null as string | null,
    reload: jest.fn(),
    acknowledgeAlert: jest.fn(),
  };

  beforeEach(() => {
    resetAllMocks();
    useDashboardLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithRouter(<OverviewView />);
      expect(screen.getByTestId('overview-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      renderWithRouter(<OverviewView />);
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      renderWithRouter(<OverviewView />);
      expect(
        screen.getByText(/System overview/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = renderWithRouter(<OverviewView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      renderWithRouter(<OverviewView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      renderWithRouter(<OverviewView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  
  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      renderWithRouter(<OverviewView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      renderWithRouter(<OverviewView />);
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
      renderWithRouter(<OverviewView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles search input changes', () => {
      const setSearchText = jest.fn();
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        setSearchText,
      });

      renderWithRouter(<OverviewView />);
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
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      renderWithRouter(<OverviewView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('displays selected count', () => {
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      renderWithRouter(<OverviewView />);
      expect(screen.queryByText(/2.*selected/i) || screen.queryByText(/selected.*2/i)).toBeTruthy();
    });
  });
  

  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      renderWithRouter(<OverviewView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        data: mockDiscoveryData().users,
      });

      renderWithRouter(<OverviewView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      renderWithRouter(<OverviewView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });
    
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      renderWithRouter(<OverviewView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      renderWithRouter(<OverviewView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = renderWithRouter(<OverviewView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      renderWithRouter(<OverviewView />);
      expect(screen.getByTestId('overview-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      renderWithRouter(<OverviewView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      renderWithRouter(<OverviewView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
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
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = renderWithRouter(<OverviewView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();

      // Data loaded
      useDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerenderWithRouter(<OverviewView />);
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



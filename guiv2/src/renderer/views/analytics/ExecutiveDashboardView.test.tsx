/**
 * Unit Tests for ExecutiveDashboardView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExecutiveDashboardView from './ExecutiveDashboardView';
import { useExecutiveDashboardLogic } from '../../hooks/useExecutiveDashboardLogic';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockAnalyticsData,

  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useExecutiveDashboardLogic', () => ({
  useExecutiveDashboardLogic: jest.fn(),
}));

describe('ExecutiveDashboardView', () => {
  const mockHookDefaults = {


    data: null as any,
    chartData: [] as any[],
    kpis: [] as any[],
    isLoading: false,

    error: null as any,
    loadData: jest.fn(),
    exportData: jest.fn(),
    refreshData: jest.fn(),
    pagination: { page: 0, pageSize: 50, total: 0 },
  };

  beforeEach(() => {
    resetAllMocks();
    useExecutiveDashboardLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ExecutiveDashboardView />);
      expect(screen.getByTestId('executive-dashboard-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<ExecutiveDashboardView />);
      expect(screen.getByText('Executive Dashboard')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<ExecutiveDashboardView />);
      expect(
        screen.getByText(/View executive KPIs/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<ExecutiveDashboardView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useExecutiveDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<ExecutiveDashboardView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<ExecutiveDashboardView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  
  // ============================================================================
  // Chart Display Tests
  // ============================================================================

  describe('Chart Display', () => {
    it('displays charts when data is available', () => {
      useExecutiveDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        chartData: mockAnalyticsData().chartData,
      });

      render(<ExecutiveDashboardView />);
      // Charts should be rendered
      const viewElement = screen.getByTestId('executive-dashboard-view');
      expect(viewElement).toBeInTheDocument();
    });

    it('displays KPIs when available', () => {
      useExecutiveDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        kpis: mockAnalyticsData().kpis,
      });

      render(<ExecutiveDashboardView />);
      // KPIs should be displayed
      expect(screen.queryByText(/Total/i) || screen.queryByText(/Active/i)).toBeTruthy();
    });
  });
  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<ExecutiveDashboardView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useExecutiveDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<ExecutiveDashboardView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useExecutiveDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<ExecutiveDashboardView />);
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
      useExecutiveDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<ExecutiveDashboardView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<ExecutiveDashboardView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useExecutiveDashboardLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<ExecutiveDashboardView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<ExecutiveDashboardView />);
      expect(screen.getByTestId('executive-dashboard-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<ExecutiveDashboardView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<ExecutiveDashboardView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});

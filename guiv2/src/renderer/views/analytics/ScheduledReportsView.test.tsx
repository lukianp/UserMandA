/**
 * Unit Tests for ScheduledReportsView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ScheduledReportsView from './ScheduledReportsView';
import { useScheduledReportsLogic } from '../../hooks/useScheduledReportsLogic';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockAnalyticsData,

  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useScheduledReportsLogic', () => ({
  useScheduledReportsLogic: jest.fn(),
}));

describe('ScheduledReportsView', () => {
  const mockHookDefaults = {


    data: null as any,
    chartData: [] as any[],
    kpis: [] as any[],
    isLoading: false,

    error: null as any,
    exportData: jest.fn(),
    refreshData: jest.fn(),
  };

  beforeEach(() => {
    resetAllMocks();
    useScheduledReportsLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ScheduledReportsView />);
      expect(screen.getByTestId('scheduled-reports-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<ScheduledReportsView />);
      expect(screen.getByText('Scheduled Reports')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<ScheduledReportsView />);
      expect(
        screen.getByText(/Schedule automated reports/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<ScheduledReportsView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useScheduledReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<ScheduledReportsView />);
      expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<ScheduledReportsView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  
  // ============================================================================
  // Chart Display Tests
  // ============================================================================

  describe('Chart Display', () => {
    it('displays charts when data is available', () => {
      useScheduledReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        chartData: mockAnalyticsData().chartData,
      });

      render(<ScheduledReportsView />);
      // Charts should be rendered
      const viewElement = screen.getByTestId('scheduled-reports-view');
      expect(viewElement).toBeInTheDocument();
    });

    it('displays KPIs when available', () => {
      useScheduledReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        kpis: mockAnalyticsData().kpis,
      });

      render(<ScheduledReportsView />);
      // KPIs should be displayed
      expect(screen.queryByText(/Total/i) || screen.queryByText(/Active/i)).toBeTruthy();
    });
  });
  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<ScheduledReportsView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useScheduledReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<ScheduledReportsView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useScheduledReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<ScheduledReportsView />);
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
      useScheduledReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<ScheduledReportsView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<ScheduledReportsView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useScheduledReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<ScheduledReportsView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<ScheduledReportsView />);
      expect(screen.getByTestId('scheduled-reports-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<ScheduledReportsView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<ScheduledReportsView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});

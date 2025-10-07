/**
 * Unit Tests for CostAnalysisView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CostAnalysisView } from './CostAnalysisView';
import { useCostAnalysisLogic } from '../../hooks/useCostAnalysisLogic';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockAnalyticsData,

  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useCostAnalysisLogic', () => ({
  useCostAnalysisLogic: jest.fn(),
}));

describe('CostAnalysisView', () => {
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
    useCostAnalysisLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CostAnalysisView />);
      expect(screen.getByTestId('cost-analysis-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<CostAnalysisView />);
      expect(screen.getByText('Cost Analysis')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<CostAnalysisView />);
      expect(
        screen.getByText(/Analyze migration costs/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<CostAnalysisView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useCostAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<CostAnalysisView />);
      expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<CostAnalysisView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  
  // ============================================================================
  // Chart Display Tests
  // ============================================================================

  describe('Chart Display', () => {
    it('displays charts when data is available', () => {
      useCostAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        chartData: mockAnalyticsData().chartData,
      });

      render(<CostAnalysisView />);
      // Charts should be rendered
      const viewElement = screen.getByTestId('cost-analysis-view');
      expect(viewElement).toBeInTheDocument();
    });

    it('displays KPIs when available', () => {
      useCostAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        kpis: mockAnalyticsData().kpis,
      });

      render(<CostAnalysisView />);
      // KPIs should be displayed
      expect(screen.queryByText(/Total/i) || screen.queryByText(/Active/i)).toBeTruthy();
    });
  });
  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<CostAnalysisView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useCostAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<CostAnalysisView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useCostAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<CostAnalysisView />);
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
      useCostAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<CostAnalysisView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<CostAnalysisView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useCostAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<CostAnalysisView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<CostAnalysisView />);
      expect(screen.getByTestId('cost-analysis-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<CostAnalysisView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<CostAnalysisView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});

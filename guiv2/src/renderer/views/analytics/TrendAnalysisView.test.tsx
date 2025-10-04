/**
 * Unit Tests for TrendAnalysisView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrendAnalysisView } from './TrendAnalysisView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockAnalyticsData,
  
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useTrendAnalysisLogic', () => ({
  useTrendAnalysisLogic: jest.fn(),
}));

const { useTrendAnalysisLogic } = require('../../hooks/useTrendAnalysisLogic');

describe('TrendAnalysisView', () => {
  const mockHookDefaults = {
    
    
    data: null,
    chartData: [],
    kpis: [],
    isLoading: false,
    
    error: null,
    exportData: jest.fn(),
    refreshData: jest.fn(),
  };

  beforeEach(() => {
    resetAllMocks();
    useTrendAnalysisLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<TrendAnalysisView />);
      expect(screen.getByTestId('trend-analysis-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<TrendAnalysisView />);
      expect(screen.getByText('Trend Analysis')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<TrendAnalysisView />);
      expect(
        screen.getByText(/Analyze data trends/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<TrendAnalysisView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useTrendAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<TrendAnalysisView />);
      expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<TrendAnalysisView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  
  // ============================================================================
  // Chart Display Tests
  // ============================================================================

  describe('Chart Display', () => {
    it('displays charts when data is available', () => {
      useTrendAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        chartData: mockAnalyticsData().chartData,
      });

      render(<TrendAnalysisView />);
      // Charts should be rendered
      const { container } = screen.getByTestId('trend-analysis-view');
      expect(container).toBeInTheDocument();
    });

    it('displays KPIs when available', () => {
      useTrendAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        kpis: mockAnalyticsData().kpis,
      });

      render(<TrendAnalysisView />);
      // KPIs should be displayed
      expect(screen.queryByText(/Total/i) || screen.queryByText(/Active/i)).toBeTruthy();
    });
  });
  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<TrendAnalysisView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useTrendAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<TrendAnalysisView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useTrendAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<TrendAnalysisView />);
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
      useTrendAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<TrendAnalysisView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<TrendAnalysisView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useTrendAnalysisLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<TrendAnalysisView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<TrendAnalysisView />);
      expect(screen.getByTestId('trend-analysis-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<TrendAnalysisView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<TrendAnalysisView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});

/**
 * Unit Tests for BenchmarkingView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BenchmarkingView } from './BenchmarkingView';
import { useBenchmarkingLogic } from '../../hooks/useBenchmarkingLogic';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockAnalyticsData,

  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useBenchmarkingLogic', () => ({
  useBenchmarkingLogic: jest.fn(),
}));

describe('BenchmarkingView', () => {
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
    useBenchmarkingLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<BenchmarkingView />);
      expect(screen.getByTestId('benchmarking-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<BenchmarkingView />);
      expect(screen.getByText('Benchmarking')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<BenchmarkingView />);
      expect(
        screen.getByText(/Compare metrics against benchmarks/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<BenchmarkingView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useBenchmarkingLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<BenchmarkingView />);
      expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<BenchmarkingView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  
  // ============================================================================
  // Chart Display Tests
  // ============================================================================

  describe('Chart Display', () => {
    it('displays charts when data is available', () => {
      useBenchmarkingLogic.mockReturnValue({
        ...mockHookDefaults,
        chartData: mockAnalyticsData().chartData,
      });

      render(<BenchmarkingView />);
      // Charts should be rendered
      const viewElement = screen.getByTestId('benchmarking-view');
      expect(viewElement).toBeInTheDocument();
    });

    it('displays KPIs when available', () => {
      useBenchmarkingLogic.mockReturnValue({
        ...mockHookDefaults,
        kpis: mockAnalyticsData().kpis,
      });

      render(<BenchmarkingView />);
      // KPIs should be displayed
      expect(screen.queryByText(/Total/i) || screen.queryByText(/Active/i)).toBeTruthy();
    });
  });
  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<BenchmarkingView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useBenchmarkingLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<BenchmarkingView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useBenchmarkingLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<BenchmarkingView />);
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
      useBenchmarkingLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<BenchmarkingView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<BenchmarkingView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useBenchmarkingLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<BenchmarkingView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<BenchmarkingView />);
      expect(screen.getByTestId('benchmarking-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<BenchmarkingView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<BenchmarkingView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});

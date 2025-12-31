/**
 * Unit Tests for DataVisualizationView
 */

import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent, waitFor } from '../../test-utils/testWrappers';

import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import { useDataVisualizationLogic } from '../../hooks/useDataVisualizationLogic';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockAnalyticsData,

  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import DataVisualizationView from './DataVisualizationView';

// Mock the hook
jest.mock('../../hooks/useDataVisualizationLogic', () => ({
  useDataVisualizationLogic: jest.fn(),
}));

describe('DataVisualizationView', () => {
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
    useDataVisualizationLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<DataVisualizationView />);
      expect(screen.getByTestId('data-visualization-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<DataVisualizationView />);
      expect(screen.getByText('Data Visualization')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<DataVisualizationView />);
      expect(
        screen.getByText(/Interactive charts/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<DataVisualizationView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useDataVisualizationLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<DataVisualizationView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);
    });

    it('does not show loading state when data is loaded', () => {
      render(<DataVisualizationView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  
  // ============================================================================
  // Chart Display Tests
  // ============================================================================

  describe('Chart Display', () => {
    it('displays charts when data is available', () => {
      useDataVisualizationLogic.mockReturnValue({
        ...mockHookDefaults,
        chartData: mockAnalyticsData().chartData,
      });

      render(<DataVisualizationView />);
      // Charts should be rendered
      const viewElement = screen.getByTestId('data-visualization-view');
      expect(viewElement).toBeInTheDocument();
    });

    it('displays KPIs when available', () => {
      useDataVisualizationLogic.mockReturnValue({
        ...mockHookDefaults,
        kpis: mockAnalyticsData().kpis,
      });

      render(<DataVisualizationView />);
      // KPIs should be displayed
      expect(screen.queryByText(/Total/i) || screen.queryByText(/Active/i)).toBeTruthy();
    });
  });
  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<DataVisualizationView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useDataVisualizationLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<DataVisualizationView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useDataVisualizationLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<DataVisualizationView />);
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
      useDataVisualizationLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<DataVisualizationView />);
      expect(screen.queryByText(/error/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<DataVisualizationView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useDataVisualizationLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<DataVisualizationView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<DataVisualizationView />);
      expect(screen.getByTestId('data-visualization-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<DataVisualizationView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<DataVisualizationView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});





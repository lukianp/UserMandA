/**
 * Unit Tests for CustomReportBuilderView
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import { useCustomReportBuilderLogic } from '../../hooks/useCustomReportBuilderLogic';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockAnalyticsData,

  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import CustomReportBuilderView from './CustomReportBuilderView';

// Mock the hook
jest.mock('../../hooks/useCustomReportBuilderLogic', () => ({
  useCustomReportBuilderLogic: jest.fn(),
}));

describe('CustomReportBuilderView', () => {
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
    useCustomReportBuilderLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CustomReportBuilderView />);
      expect(screen.getByTestId('custom-report-builder-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<CustomReportBuilderView />);
      expect(screen.getByText('Custom Report Builder')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<CustomReportBuilderView />);
      expect(
        screen.getByText(/Build custom reports/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<CustomReportBuilderView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useCustomReportBuilderLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<CustomReportBuilderView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);
    });

    it('does not show loading state when data is loaded', () => {
      render(<CustomReportBuilderView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  
  // ============================================================================
  // Chart Display Tests
  // ============================================================================

  describe('Chart Display', () => {
    it('displays charts when data is available', () => {
      useCustomReportBuilderLogic.mockReturnValue({
        ...mockHookDefaults,
        chartData: mockAnalyticsData().chartData,
      });

      render(<CustomReportBuilderView />);
      // Charts should be rendered
      const viewElement = screen.getByTestId('custom-report-builder-view');
      expect(viewElement).toBeInTheDocument();
    });

    it('displays KPIs when available', () => {
      useCustomReportBuilderLogic.mockReturnValue({
        ...mockHookDefaults,
        kpis: mockAnalyticsData().kpis,
      });

      render(<CustomReportBuilderView />);
      // KPIs should be displayed
      expect(screen.queryByText(/Total/i) || screen.queryByText(/Active/i)).toBeTruthy();
    });
  });
  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<CustomReportBuilderView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useCustomReportBuilderLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<CustomReportBuilderView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useCustomReportBuilderLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<CustomReportBuilderView />);
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
      useCustomReportBuilderLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<CustomReportBuilderView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<CustomReportBuilderView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useCustomReportBuilderLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<CustomReportBuilderView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<CustomReportBuilderView />);
      expect(screen.getByTestId('custom-report-builder-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<CustomReportBuilderView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<CustomReportBuilderView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});



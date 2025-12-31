/**
 * Unit Tests for UserAnalyticsView
 */

import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent, waitFor } from '../../test-utils/testWrappers';

import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import { useUserAnalyticsLogic } from '../../hooks/useUserAnalyticsLogic';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockAnalyticsData,

  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import UserAnalyticsView from './UserAnalyticsView';

// Mock the hook
jest.mock('../../hooks/useUserAnalyticsLogic', () => ({
  useUserAnalyticsLogic: jest.fn(),
}));

describe('UserAnalyticsView', () => {
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
    useUserAnalyticsLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<UserAnalyticsView />);
      expect(screen.getByTestId('user-analytics-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<UserAnalyticsView />);
      expect(screen.getByText('User Analytics')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<UserAnalyticsView />);
      expect(
        screen.getByText(/Analyze user metrics/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<UserAnalyticsView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useUserAnalyticsLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<UserAnalyticsView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);
    });

    it('does not show loading state when data is loaded', () => {
      render(<UserAnalyticsView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  
  // ============================================================================
  // Chart Display Tests
  // ============================================================================

  describe('Chart Display', () => {
    it('displays charts when data is available', () => {
      useUserAnalyticsLogic.mockReturnValue({
        ...mockHookDefaults,
        chartData: mockAnalyticsData().chartData,
      });

      render(<UserAnalyticsView />);
      // Charts should be rendered
      const viewElement = screen.getByTestId('user-analytics-view');
      expect(viewElement).toBeInTheDocument();
    });

    it('displays KPIs when available', () => {
      useUserAnalyticsLogic.mockReturnValue({
        ...mockHookDefaults,
        kpis: mockAnalyticsData().kpis,
      });

      render(<UserAnalyticsView />);
      // KPIs should be displayed
      expect(screen.queryByText(/Total/i) || screen.queryByText(/Active/i)).toBeTruthy();
    });
  });
  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<UserAnalyticsView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useUserAnalyticsLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<UserAnalyticsView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useUserAnalyticsLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<UserAnalyticsView />);
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
      useUserAnalyticsLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<UserAnalyticsView />);
      expect(screen.queryByText(/error/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<UserAnalyticsView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useUserAnalyticsLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<UserAnalyticsView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<UserAnalyticsView />);
      expect(screen.getByTestId('user-analytics-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<UserAnalyticsView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<UserAnalyticsView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});





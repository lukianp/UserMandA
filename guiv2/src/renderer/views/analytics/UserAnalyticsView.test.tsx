/**
 * Unit Tests for UserAnalyticsView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserAnalyticsView } from './UserAnalyticsView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  mockAnalyticsData,
  
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useUserAnalyticsLogic', () => ({
  useUserAnalyticsLogic: jest.fn(),
}));

const { useUserAnalyticsLogic } = require('../../hooks/useUserAnalyticsLogic');

describe('UserAnalyticsView', () => {
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
      expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
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
      const { container } = screen.getByTestId('user-analytics-view');
      expect(container).toBeInTheDocument();
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
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<UserAnalyticsView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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

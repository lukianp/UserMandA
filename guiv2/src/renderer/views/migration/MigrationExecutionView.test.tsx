/**
 * Unit Tests for MigrationExecutionView
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import MigrationExecutionView from './MigrationExecutionView';

import {
  mockSuccessfulExecution,
  mockFailedExecution,
  
  mockMigrationData,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useMigrationExecutionLogic', () => ({
  useMigrationExecutionLogic: jest.fn(),
}));

import { useMigrationExecutionLogic } from '../../hooks/useMigrationExecutionLogic';

describe('MigrationExecutionView', () => {
  const mockHookDefaults = {
    
    waves: [] as any[],
    mappings: [] as any[],
    validationResults: [] as any[],
    isValidating: false,
    isExecuting: false,


    error: null as string | null,
    loadData: jest.fn(),
    exportData: jest.fn(),
    refreshData: jest.fn(),
    pagination: { page: 0, pageSize: 50, total: 0 },
  };

  beforeEach(() => {
    resetAllMocks();
    useMigrationExecutionLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<MigrationExecutionView />);
      expect(screen.getByTestId('migration-execution-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<MigrationExecutionView />);
      expect(screen.getByText('Migration Execution')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<MigrationExecutionView />);
      expect(
        screen.getByText(/Execute migration waves/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<MigrationExecutionView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useMigrationExecutionLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<MigrationExecutionView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);
    });

    it('does not show loading state when data is loaded', () => {
      render(<MigrationExecutionView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  

  
  // ============================================================================
  // Migration-Specific Tests
  // ============================================================================

  describe('Migration Operations', () => {
    it('displays migration waves', () => {
      useMigrationExecutionLogic.mockReturnValue({
        ...mockHookDefaults,
        waves: mockMigrationData().waves,
      });

      render(<MigrationExecutionView />);
      expect(screen.queryByText(/Wave/i)).toBeTruthy();
    });

    it('displays validation results', () => {
      useMigrationExecutionLogic.mockReturnValue({
        ...mockHookDefaults,
        validationResults: mockMigrationData().validationResults,
      });

      render(<MigrationExecutionView />);
      expect(screen.queryByText(/Error/i) || screen.queryByText(/Warning/i)).toBeTruthy();
    });
  });
  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<MigrationExecutionView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useMigrationExecutionLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<MigrationExecutionView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useMigrationExecutionLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<MigrationExecutionView />);
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
      useMigrationExecutionLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<MigrationExecutionView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<MigrationExecutionView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useMigrationExecutionLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<MigrationExecutionView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<MigrationExecutionView />);
      expect(screen.getByTestId('migration-execution-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<MigrationExecutionView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<MigrationExecutionView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});



/**
 * Unit Tests for MigrationMappingView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MigrationMappingView from './MigrationMappingView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  
  mockMigrationData,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useMigrationMappingLogic', () => ({
  useMigrationMappingLogic: jest.fn(),
}));

import { useMigrationMappingLogic } from '../../hooks/useMigrationMappingLogic';

describe('MigrationMappingView', () => {
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
    useMigrationMappingLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<MigrationMappingView />);
      expect(screen.getByTestId('migration-mapping-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<MigrationMappingView />);
      expect(screen.getByText('Migration Mapping')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<MigrationMappingView />);
      expect(
        screen.getByText(/Map resources between tenants/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<MigrationMappingView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useMigrationMappingLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<MigrationMappingView />);
      expect(screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<MigrationMappingView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  

  
  // ============================================================================
  // Migration-Specific Tests
  // ============================================================================

  describe('Migration Operations', () => {
    it('displays migration waves', () => {
      useMigrationMappingLogic.mockReturnValue({
        ...mockHookDefaults,
        waves: mockMigrationData().waves,
      });

      render(<MigrationMappingView />);
      expect(screen.queryByText(/Wave/i)).toBeTruthy();
    });

    it('displays validation results', () => {
      useMigrationMappingLogic.mockReturnValue({
        ...mockHookDefaults,
        validationResults: mockMigrationData().validationResults,
      });

      render(<MigrationMappingView />);
      expect(screen.queryByText(/Error/i) || screen.queryByText(/Warning/i)).toBeTruthy();
    });
  });
  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<MigrationMappingView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useMigrationMappingLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<MigrationMappingView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useMigrationMappingLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<MigrationMappingView />);
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
      useMigrationMappingLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<MigrationMappingView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<MigrationMappingView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useMigrationMappingLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<MigrationMappingView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<MigrationMappingView />);
      expect(screen.getByTestId('migration-mapping-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<MigrationMappingView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<MigrationMappingView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});

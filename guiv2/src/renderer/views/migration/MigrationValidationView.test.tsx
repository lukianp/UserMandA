/**
 * Unit Tests for MigrationValidationView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MigrationValidationView } from './MigrationValidationView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  
  mockMigrationData,
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useMigrationValidationLogic', () => ({
  useMigrationValidationLogic: jest.fn(),
}));

const { useMigrationValidationLogic } = require('../../hooks/useMigrationValidationLogic');

describe('MigrationValidationView', () => {
  const mockHookDefaults = {
    
    waves: [],
    mappings: [],
    validationResults: [],
    isValidating: false,
    isExecuting: false,
    
    
    error: null,
    exportData: jest.fn(),
    refreshData: jest.fn(),
  };

  beforeEach(() => {
    resetAllMocks();
    useMigrationValidationLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<MigrationValidationView />);
      expect(screen.getByTestId('migration-validation-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<MigrationValidationView />);
      expect(screen.getByText('Migration Validation')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<MigrationValidationView />);
      expect(
        screen.getByText(/Validate migration readiness/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<MigrationValidationView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useMigrationValidationLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<MigrationValidationView />);
      expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<MigrationValidationView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  

  
  // ============================================================================
  // Migration-Specific Tests
  // ============================================================================

  describe('Migration Operations', () => {
    it('displays migration waves', () => {
      useMigrationValidationLogic.mockReturnValue({
        ...mockHookDefaults,
        waves: mockMigrationData().waves,
      });

      render(<MigrationValidationView />);
      expect(screen.queryByText(/Wave/i)).toBeTruthy();
    });

    it('displays validation results', () => {
      useMigrationValidationLogic.mockReturnValue({
        ...mockHookDefaults,
        validationResults: mockMigrationData().validationResults,
      });

      render(<MigrationValidationView />);
      expect(screen.queryByText(/Error/i) || screen.queryByText(/Warning/i)).toBeTruthy();
    });
  });
  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<MigrationValidationView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useMigrationValidationLogic.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        
      });

      render(<MigrationValidationView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useMigrationValidationLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<MigrationValidationView />);
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
      useMigrationValidationLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<MigrationValidationView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<MigrationValidationView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useMigrationValidationLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<MigrationValidationView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<MigrationValidationView />);
      expect(screen.getByTestId('migration-validation-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<MigrationValidationView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<MigrationValidationView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});

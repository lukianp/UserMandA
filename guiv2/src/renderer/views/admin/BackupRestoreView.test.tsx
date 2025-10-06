/**
 * Unit Tests for BackupRestoreView
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BackupRestoreView } from './BackupRestoreView';
import {
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useBackupRestoreLogic', () => ({
  useBackupRestoreLogic: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useBackupRestoreLogic } = require('../../hooks/useBackupRestoreLogic');

describe('BackupRestoreView', () => {
  const mockHookDefaults = {


    error: null as string | null,


  };
  beforeEach(() => {
    resetAllMocks();
    useBackupRestoreLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<BackupRestoreView />);
      expect(screen.getByTestId('backup-restore-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<BackupRestoreView />);
      expect(screen.getByText('Backup & Restore')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<BackupRestoreView />);
      expect(
        screen.getByText(/Backup and restore data/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<BackupRestoreView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useBackupRestoreLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<BackupRestoreView />);
      expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<BackupRestoreView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<BackupRestoreView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useBackupRestoreLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<BackupRestoreView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<BackupRestoreView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useBackupRestoreLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<BackupRestoreView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<BackupRestoreView />);
      expect(screen.getByTestId('backup-restore-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<BackupRestoreView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<BackupRestoreView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});

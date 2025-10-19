/**
 * Unit Tests for LicenseActivationView
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LicenseActivationView from './LicenseActivationView';
import {
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useLicenseActivationLogic', () => ({
  useLicenseActivationLogic: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useLicenseActivationLogic } = require('../../hooks/useLicenseActivationLogic');

describe('LicenseActivationView', () => {
  const mockHookDefaults = {


    error: null as string | null,


    pagination: { page: 0, pageSize: 50, total: 0 },
  };
  beforeEach(() => {
    resetAllMocks();
    useLicenseActivationLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<LicenseActivationView />);
      expect(screen.getByTestId('license-activation-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<LicenseActivationView />);
      expect(screen.getByText('License Activation')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<LicenseActivationView />);
      expect(
        screen.getByText(/Manage license activation/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<LicenseActivationView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useLicenseActivationLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<LicenseActivationView />);
      expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<LicenseActivationView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<LicenseActivationView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useLicenseActivationLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<LicenseActivationView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<LicenseActivationView />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      useLicenseActivationLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<LicenseActivationView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<LicenseActivationView />);
      expect(screen.getByTestId('license-activation-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<LicenseActivationView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<LicenseActivationView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});

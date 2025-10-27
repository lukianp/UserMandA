/**
 * Unit Tests for AboutView
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import AboutView from './AboutView';

// Mock the hook
jest.mock('../../hooks/useAboutLogic', () => ({
  useAboutLogic: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useAboutLogic } = require('../../hooks/useAboutLogic');

describe('AboutView', () => {
  const mockHookDefaults = createUniversalDiscoveryHook();
  beforeEach(() => {
    resetAllMocks();
    useAboutLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<AboutView />);
      expect(screen.getByTestId('about-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<AboutView />);
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<AboutView />);
      expect(
        screen.getByText(/Application information/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<AboutView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useAboutLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<AboutView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);
    });

    it('does not show loading state when data is loaded', () => {
      render(<AboutView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  

  

  

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<AboutView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useAboutLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<AboutView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<AboutView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useAboutLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<AboutView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<AboutView />);
      expect(screen.getByTestId('about-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<AboutView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<AboutView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  
});



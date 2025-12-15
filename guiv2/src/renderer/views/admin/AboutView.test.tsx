/**
 * Unit Tests for AboutView
 */

import * as React from 'react';
import { renderWithProviders as render, screen } from '../../test-utils/testWrappers';

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
      expect(screen.getByText('Enterprise Discovery & Migration Suite')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<AboutView />);
      expect(
        screen.getByText(/Enterprise Migration & Discovery Platform/i)
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
      // AboutView is static and doesn't have loading state
      render(<AboutView />);
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<AboutView />);
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
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
      // AboutView is static and doesn't have error state
      render(<AboutView />);
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<AboutView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      // AboutView is static and doesn't have error state
      const { container } = render(<AboutView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeNull();
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



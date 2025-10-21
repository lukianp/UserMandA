/**
 * Unit Tests for ReportsView
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createUniversalDiscoveryHook } from '../../../test-utils/universalDiscoveryMocks';
import '@testing-library/jest-dom';
import ReportsView from './ReportsView';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  
  
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/useReportsLogic', () => ({
  useReportsLogic: jest.fn(),
}));

const { useReportsLogic } = require('../../hooks/useReportsLogic');

describe('ReportsView', () => {
  const mockTemplates = [
    { id: 'user-summary', name: 'User Summary Report', description: 'Summary of all discovered users', category: 'Users', format: 'PDF' as const, parameters: {} },
    { id: 'group-membership', name: 'Group Membership Report', description: 'Detailed group membership', category: 'Groups', format: 'Excel' as const, parameters: {} },
    { id: 'migration-readiness', name: 'Migration Readiness Report', description: 'Assessment of migration readiness', category: 'Migration', format: 'PDF' as const, parameters: {} },
  ];

  const mockHookDefaults = createUniversalDiscoveryHook();

  beforeEach(() => {
    resetAllMocks();
    useReportsLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<ReportsView />);
      expect(screen.getByTestId('reports-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<ReportsView />);
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<ReportsView />);
      expect(
        screen.getByText(/View reports/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<ReportsView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Generating State Tests
  // ============================================================================

  describe('Generating State', () => {
    it('shows generating state for a report', () => {
      const generatingSet = new Set(['user-summary']);
      useReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        generatingReports: generatingSet,
      });

      render(<ReportsView />);
      expect(screen.getByText(/Generating.../i)).toBeInTheDocument();
    });

    it('does not show generating state when no reports generating', () => {
      render(<ReportsView />);
      expect(screen.queryByText(/Generating.../i)).not.toBeInTheDocument();
    });
  });


  // ============================================================================
  // Template Display Tests
  // ============================================================================

  describe('Template Display', () => {
    it('displays templates when loaded', () => {
      useReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        templates: mockTemplates,
      });

      render(<ReportsView />);
      expect(screen.getByText('User Summary Report')).toBeInTheDocument();
      expect(screen.getByText('Group Membership Report')).toBeInTheDocument();
    });

    it('shows empty state when no templates', () => {
      useReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        templates: [],
      });

      render(<ReportsView />);
      expect(screen.getByText(/No report templates found/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<ReportsView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles search input changes', () => {
      const setSearchText = jest.fn();
      useReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        setSearchText,
      });

      render(<ReportsView />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Search should be triggered
      expect(searchInput).toHaveValue('test');
    });
  });

  // ============================================================================
  // Report Generation Tests
  // ============================================================================

  describe('Report Generation', () => {
    it('renders generate buttons for each template', () => {
      render(<ReportsView />);
      const generateButtons = screen.getAllByText(/Generate Report/i);
      expect(generateButtons.length).toBe(mockTemplates.length);
    });

    it('calls generateReport when generate button clicked', () => {
      const generateReport = jest.fn();
      useReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        generateReport,
      });

      render(<ReportsView />);
      const generateButton = screen.getAllByText(/Generate Report/i)[0];
      fireEvent.click(generateButton);
      expect(generateReport).toHaveBeenCalledWith('user-summary');
    });

    it('disables button while generating', () => {
      const generatingSet = new Set(['user-summary']);
      useReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        generatingReports: generatingSet,
      });

      render(<ReportsView />);
      const generateButtons = screen.getAllByRole('button');
      // First button should be disabled (for user-summary)
      expect(generateButtons[0]).toBeDisabled();
    });
  });


  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders generate report buttons', () => {
      render(<ReportsView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<ReportsView />);
      expect(screen.getByTestId('reports-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<ReportsView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<ReportsView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });


  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('handles complete workflow', async () => {
      const generateReport = jest.fn();
      const setSearchText = jest.fn();
      const setFilterCategory = jest.fn();

      // Initial state - templates displayed
      useReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        templates: mockTemplates,
        generateReport,
        setSearchText,
        setFilterCategory,
      });

      render(<ReportsView />);

      // Verify templates are displayed
      expect(screen.getByText('User Summary Report')).toBeInTheDocument();
      expect(screen.getByText('Group Membership Report')).toBeInTheDocument();

      // Search for templates
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'User' } });
      expect(searchInput).toHaveValue('User');

      // Generate a report
      const generateButtons = screen.getAllByText(/Generate Report/i);
      fireEvent.click(generateButtons[0]);
      expect(generateReport).toHaveBeenCalledWith('user-summary');
    });

    it('shows generating state during report generation', () => {
      const generatingSet = new Set(['user-summary', 'migration-readiness']);
      useReportsLogic.mockReturnValue({
        ...mockHookDefaults,
        generatingReports: generatingSet,
      });

      render(<ReportsView />);

      // Multiple "Generating..." texts should be present
      const generatingTexts = screen.getAllByText(/Generating.../i);
      expect(generatingTexts.length).toBeGreaterThan(0);
    });
  });
  
});

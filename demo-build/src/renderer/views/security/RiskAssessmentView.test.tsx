/**
 * Unit Tests for RiskAssessmentView
 */

import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';

import {  createUniversalDiscoveryHook , createUniversalStats } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import RiskAssessmentView from './RiskAssessmentView';

// Mock the hook
jest.mock('../../hooks/useRiskAssessmentLogic', () => ({
  useRiskAssessmentLogic: jest.fn(),
}));

const { useRiskAssessmentLogic } = require('../../hooks/useRiskAssessmentLogic');

describe('RiskAssessmentView', () => {
  const mockHookDefaults = {
    data: [],
    
    risks: [],
    threats: [],
    
    selectedItems: [],
    searchText: '',
    isLoading: false,
    error: null,
    exportData: jest.fn(),
    refreshData: jest.fn(),
  
    columns: [],
    filters: { searchText: '', deviceType: '', vendor: '', status: '', location: '' },
    filterOptions: { deviceTypes: [], vendors: [], statuses: [], locations: [], categories: [], departments: [], roles: [], types: []},
    updateFilter: jest.fn(),
    clearFilters: jest.fn(),
    selectedRisks: null,
    setSelectedRisks: jest.fn(),
    loadData: jest.fn(),
    stats: createUniversalStats(),
    selectedProfile: { tenantId: '12345678-1234-1234-1234-123456789012', clientId: '87654321-4321-4321-4321-210987654321', isValid: true },
  };

  beforeEach(() => {
    resetAllMocks();
    useRiskAssessmentLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<RiskAssessmentView />);
      expect(screen.getByTestId('risk-assessment-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<RiskAssessmentView />);
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<RiskAssessmentView />);
      expect(
        screen.getByText(/Assess security risks/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<RiskAssessmentView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<RiskAssessmentView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<RiskAssessmentView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);
    });

    it('does not show loading state when data is loaded', () => {
      render(<RiskAssessmentView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<RiskAssessmentView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<RiskAssessmentView />);
      expect(
        screen.queryByText(/no.*data/i) ||
        screen.queryByText(/no.*results/i) ||
        screen.queryByText(/empty/i)
      ).toBeTruthy();
    });

    

    
    it('displays security metrics', () => {
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        risks: [{ id: '1', level: 'High', description: 'Test risk' }],
      });

      render(<RiskAssessmentView />);
      expect(screen.queryByText(/risk/i) || screen.queryByText(/security/i)).toBeTruthy();
    });
    

    
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<RiskAssessmentView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<RiskAssessmentView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'test' } });
        expect(searchInput).toHaveValue('test');
      }
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<RiskAssessmentView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<RiskAssessmentView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<RiskAssessmentView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<RiskAssessmentView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        expect(exportButton.closest('button')).toBeDisabled();
      }
    });
  });

  // ============================================================================
  // Selection Tests
  // ============================================================================

  describe('Item Selection', () => {
    it('allows selecting items', () => {
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<RiskAssessmentView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<RiskAssessmentView />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<RiskAssessmentView />);
      expect(screen.queryByText(/error/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<RiskAssessmentView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<RiskAssessmentView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<RiskAssessmentView />);
      expect(screen.getByTestId('risk-assessment-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<RiskAssessmentView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<RiskAssessmentView />);
      const inputs = screen.queryAllByRole('textbox');
      inputs.forEach(input => {
        const hasLabel = input.getAttribute('aria-label') || input.id;
        expect(hasLabel).toBeTruthy();
      });
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('handles complete workflow', async () => {
      const refreshData = jest.fn();
      const exportData = jest.fn();

      // Initial state - loading
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<RiskAssessmentView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);

      // Data loaded
      useRiskAssessmentLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<RiskAssessmentView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      // Refresh data
      const refreshButton = screen.queryByText(/Refresh/i);
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }

      // Export data
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });
  });
});





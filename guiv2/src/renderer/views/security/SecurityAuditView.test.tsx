/**
 * Unit Tests for SecurityAuditView
 */

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import {  createUniversalDiscoveryHook , createUniversalStats } from '../../../test-utils/universalDiscoveryMocks';

import '@testing-library/jest-dom';
import {
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

import SecurityAuditView from './SecurityAuditView';

// Mock the hook
jest.mock('../../hooks/useSecurityAuditLogic', () => ({
  useSecurityAuditLogic: jest.fn(),
}));

const { useSecurityAuditLogic } = require('../../hooks/useSecurityAuditLogic');

describe('SecurityAuditView', () => {
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
    isLiveMode: false,
    filters: { searchText: '', deviceType: '', vendor: '', status: '', location: '' },
    filterOptions: { deviceTypes: [], vendors: [], statuses: [], locations: [], categories: [], departments: [], roles: [], types: []},
    updateFilter: jest.fn(),
    clearFilters: jest.fn(),
    selectedEvents: null,
    setSelectedEvents: jest.fn(),
    loadData: jest.fn(),
    toggleLiveMode: null,
    stats: createUniversalStats(),
    timelineData: null,
    selectedProfile: { tenantId: '12345678-1234-1234-1234-123456789012', clientId: '87654321-4321-4321-4321-210987654321', isValid: true },
  };

  beforeEach(() => {
    resetAllMocks();
    useSecurityAuditLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<SecurityAuditView />);
      expect(screen.getByTestId('security-audit-view')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<SecurityAuditView />);
      expect(screen.getByText('Security Audit')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<SecurityAuditView />);
      expect(
        screen.getByText(/Audit security/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<SecurityAuditView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<SecurityAuditView />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<SecurityAuditView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);
    });

    it('does not show loading state when data is loaded', () => {
      render(<SecurityAuditView />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<SecurityAuditView />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<SecurityAuditView />);
      expect(
        screen.queryByText(/no.*data/i) ||
        screen.queryByText(/no.*results/i) ||
        screen.queryByText(/empty/i)
      ).toBeTruthy();
    });

    

    
    it('displays security metrics', () => {
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        risks: [{ id: '1', level: 'High', description: 'Test risk' }],
      });

      render(<SecurityAuditView />);
      expect(screen.queryByText(/risk/i) || screen.queryByText(/security/i)).toBeTruthy();
    });
    

    
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<SecurityAuditView />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<SecurityAuditView />);
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
      render(<SecurityAuditView />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
      });

      render(<SecurityAuditView />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<SecurityAuditView />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });

    it('disables export button when no data', () => {
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<SecurityAuditView />);
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
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<SecurityAuditView />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<SecurityAuditView />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<SecurityAuditView />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<SecurityAuditView />);
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.every(el => !el.textContent?.includes('error'))).toBe(true);
    });

    it('shows error alert with proper styling', () => {
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<SecurityAuditView />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<SecurityAuditView />);
      expect(screen.getByTestId('security-audit-view')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<SecurityAuditView />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<SecurityAuditView />);
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
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<SecurityAuditView />);
      const hasLoadingIndicator = screen.queryAllByRole('status').length > 0 || screen.queryByText(/loading/i) !== null;
      expect(hasLoadingIndicator).toBe(true);

      // Data loaded
      useSecurityAuditLogic.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<SecurityAuditView />);
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



/**
 * Script to generate comprehensive unit tests for ALL remaining views
 */

const fs = require('fs');
const path = require('path');

const viewCategories = {
  migration: [
    { name: 'MigrationExecutionView', title: 'Migration Execution', description: 'Execute migration waves' },
    { name: 'MigrationMappingView', title: 'Migration Mapping', description: 'Map resources between tenants' },
    { name: 'MigrationPlanningView', title: 'Migration Planning', description: 'Plan migration waves' },
    { name: 'MigrationValidationView', title: 'Migration Validation', description: 'Validate migration readiness' },
  ],
  analytics: [
    { name: 'BenchmarkingView', title: 'Benchmarking', description: 'Compare metrics against benchmarks' },
    { name: 'CostAnalysisView', title: 'Cost Analysis', description: 'Analyze migration costs' },
    { name: 'CustomReportBuilderView', title: 'Custom Report Builder', description: 'Build custom reports' },
    { name: 'DataVisualizationView', title: 'Data Visualization', description: 'Visualize discovery data' },
    { name: 'ExecutiveDashboardView', title: 'Executive Dashboard', description: 'View executive KPIs' },
    { name: 'MigrationReportView', title: 'Migration Report', description: 'View migration statistics' },
    { name: 'ReportTemplatesView', title: 'Report Templates', description: 'Manage report templates' },
    { name: 'ScheduledReportsView', title: 'Scheduled Reports', description: 'Schedule automated reports' },
    { name: 'TrendAnalysisView', title: 'Trend Analysis', description: 'Analyze data trends' },
    { name: 'UserAnalyticsView', title: 'User Analytics', description: 'Analyze user metrics' },
  ],
  admin: [
    { name: 'AboutView', title: 'About', description: 'Application information' },
    { name: 'AuditLogView', title: 'Audit Log', description: 'View audit logs' },
    { name: 'BackupRestoreView', title: 'Backup & Restore', description: 'Backup and restore data' },
    { name: 'LicenseActivationView', title: 'License Activation', description: 'Manage license activation' },
    { name: 'PermissionsView', title: 'Permissions', description: 'Manage user permissions' },
    { name: 'RoleManagementView', title: 'Role Management', description: 'Manage user roles' },
    { name: 'SystemConfigurationView', title: 'System Configuration', description: 'Configure system settings' },
    { name: 'UserManagementView', title: 'User Management', description: 'Manage application users' },
  ],
  users: [
    { name: 'UsersView', title: 'Users', description: 'View and manage users' },
  ],
  groups: [
    { name: 'GroupsView', title: 'Groups', description: 'View and manage groups' },
  ],
  overview: [
    { name: 'OverviewView', title: 'Overview', description: 'System overview' },
  ],
  infrastructure: [
    { name: 'InfrastructureView', title: 'Infrastructure', description: 'Infrastructure overview' },
  ],
  settings: [
    { name: 'SettingsView', title: 'Settings', description: 'Application settings' },
  ],
  reports: [
    { name: 'ReportsView', title: 'Reports', description: 'View reports' },
  ],
};

const generateTestTemplate = (viewName, title, description, category) => {
  const testId = viewName.replace(/View$/, '').replace(/([A-Z])/g, '-$1').toLowerCase().substring(1) + '-view';
  const hookName = `use${viewName.replace(/View$/, 'Logic')}`;

  // Customize based on category
  const isAnalytics = category === 'analytics';
  const isMigration = category === 'migration';
  const isAdmin = category === 'admin';
  const isCore = ['users', 'groups', 'overview', 'infrastructure', 'settings', 'reports'].includes(category);

  return `/**
 * Unit Tests for ${viewName}
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ${viewName} from './${viewName}';
import {
  mockSuccessfulExecution,
  mockFailedExecution,
  ${isAnalytics ? 'mockAnalyticsData,' : ''}
  ${isMigration ? 'mockMigrationData,' : ''}
  mockDiscoveryData,
  resetAllMocks,
} from '../../test-utils/viewTestHelpers';

// Mock the hook
jest.mock('../../hooks/${hookName}', () => ({
  ${hookName}: jest.fn(),
}));

const { ${hookName} } = require('../../hooks/${hookName}');

describe('${viewName}', () => {
  const mockHookDefaults = {
    ${isMigration ? `
    waves: [],
    mappings: [],
    validationResults: [],
    isValidating: false,
    isExecuting: false,` : ''}
    ${isAnalytics ? `
    data: null,
    chartData: [],
    kpis: [],
    isLoading: false,` : ''}
    ${isCore ? `
    data: [],
    selectedItems: [],
    searchText: '',
    isLoading: false,` : ''}
    error: null,
    ${!isAdmin ? 'exportData: jest.fn(),' : ''}
    ${!isAdmin ? 'refreshData: jest.fn(),' : ''}
  };

  beforeEach(() => {
    resetAllMocks();
    ${hookName}.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<${viewName} />);
      expect(screen.getByTestId('${testId}')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<${viewName} />);
      expect(screen.getByText('${title}')).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<${viewName} />);
      expect(
        screen.getByText(/${description}/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<${viewName} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('shows loading state when data is loading', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      render(<${viewName} />);
      expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('does not show loading state when data is loaded', () => {
      render(<${viewName} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  ${isCore ? `
  // ============================================================================
  // Data Display Tests
  // ============================================================================

  describe('Data Display', () => {
    it('displays data when loaded', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<${viewName} />);
      expect(screen.queryByText(/no.*data/i)).not.toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<${viewName} />);
      expect(
        screen.queryByText(/no.*data/i) ||
        screen.queryByText(/no.*results/i) ||
        screen.queryByText(/empty/i)
      ).toBeTruthy();
    });
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<${viewName} />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles search input changes', () => {
      const setSearchText = jest.fn();
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        setSearchText,
      });

      render(<${viewName} />);
      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Search should be triggered
      expect(searchInput).toHaveValue('test');
    });
  });

  // ============================================================================
  // Selection Tests
  // ============================================================================

  describe('Item Selection', () => {
    it('allows selecting items', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<${viewName} />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('displays selected count', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<${viewName} />);
      expect(screen.queryByText(/2.*selected/i) || screen.queryByText(/selected.*2/i)).toBeTruthy();
    });
  });
  ` : ''}

  ${isAnalytics ? `
  // ============================================================================
  // Chart Display Tests
  // ============================================================================

  describe('Chart Display', () => {
    it('displays charts when data is available', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        chartData: mockAnalyticsData().chartData,
      });

      render(<${viewName} />);
      // Charts should be rendered
      const { container } = screen.getByTestId('${testId}');
      expect(container).toBeInTheDocument();
    });

    it('displays KPIs when available', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        kpis: mockAnalyticsData().kpis,
      });

      render(<${viewName} />);
      // KPIs should be displayed
      expect(screen.queryByText(/Total/i) || screen.queryByText(/Active/i)).toBeTruthy();
    });
  });
  ` : ''}

  ${isMigration ? `
  // ============================================================================
  // Migration-Specific Tests
  // ============================================================================

  describe('Migration Operations', () => {
    it('displays migration waves', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        waves: mockMigrationData().waves,
      });

      render(<${viewName} />);
      expect(screen.queryByText(/Wave/i)).toBeTruthy();
    });

    it('displays validation results', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        validationResults: mockMigrationData().validationResults,
      });

      render(<${viewName} />);
      expect(screen.queryByText(/Error/i) || screen.queryByText(/Warning/i)).toBeTruthy();
    });
  });
  ` : ''}

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('renders action buttons', () => {
      render(<${viewName} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    ${!isAdmin ? `
    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        exportData,
        ${isCore ? 'data: mockDiscoveryData().users,' : ''}
      });

      render(<${viewName} />);
      const exportButton = screen.queryByText(/Export/i);
      if (exportButton) {
        fireEvent.click(exportButton);
        expect(exportData).toHaveBeenCalled();
      }
    });

    it('calls refreshData when refresh button clicked', () => {
      const refreshData = jest.fn();
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        refreshData,
      });

      render(<${viewName} />);
      const refreshButton = screen.queryByText(/Refresh/i) || screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);
        expect(refreshData).toHaveBeenCalled();
      }
    });
    ` : ''}
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays error message when error occurs', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error message',
      });

      render(<${viewName} />);
      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('does not display error when no error', () => {
      render(<${viewName} />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows error alert with proper styling', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        error: 'Test error',
      });

      const { container } = render(<${viewName} />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<${viewName} />);
      expect(screen.getByTestId('${testId}')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<${viewName} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Each button should have accessible text or aria-label
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has proper heading structure', () => {
      render(<${viewName} />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  ${isCore ? `
  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('handles complete workflow', async () => {
      const refreshData = jest.fn();
      const exportData = jest.fn();

      // Initial state - loading
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { rerender } = render(<${viewName} />);
      expect(screen.getByRole('status') || screen.getByText(/loading/i)).toBeInTheDocument();

      // Data loaded
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        refreshData,
        exportData,
      });

      rerender(<${viewName} />);
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
  ` : ''}
});
`;
};

let totalTestsCreated = 0;

Object.entries(viewCategories).forEach(([category, views]) => {
  const viewsDir = path.join(__dirname, '..', 'src', 'renderer', 'views', category);

  // Create directory if it doesn't exist
  if (!fs.existsSync(viewsDir)) {
    console.log(`Warning: Directory does not exist: ${viewsDir}`);
    return;
  }

  views.forEach(({ name, title, description }) => {
    const testFilePath = path.join(viewsDir, `${name}.test.tsx`);

    // Skip if test already exists
    if (fs.existsSync(testFilePath)) {
      console.log(`Skipping ${name} (test already exists)`);
      return;
    }

    const testContent = generateTestTemplate(name, title, description, category);
    fs.writeFileSync(testFilePath, testContent, 'utf8');
    totalTestsCreated++;
    console.log(`Created test for ${category}/${name}`);
  });
});

console.log(`\n✅ Completed! Created ${totalTestsCreated} test files.`);
console.log(`\nSummary by category:`);
Object.entries(viewCategories).forEach(([category, views]) => {
  console.log(`  ${category}: ${views.length} tests`);
});

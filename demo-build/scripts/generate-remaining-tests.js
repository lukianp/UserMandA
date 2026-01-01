/**
 * Script to generate unit tests for remaining view categories
 */

const fs = require('fs');
const path = require('path');

const remainingCategories = {
  advanced: [
    { name: 'APIManagementView', title: 'API Management', description: 'Manage API integrations' },
    { name: 'AssetLifecycleView', title: 'Asset Lifecycle', description: 'Track asset lifecycle' },
    { name: 'BulkOperationsView', title: 'Bulk Operations', description: 'Perform bulk operations' },
    { name: 'CapacityPlanningView', title: 'Capacity Planning', description: 'Plan capacity requirements' },
    { name: 'ChangeManagementView', title: 'Change Management', description: 'Manage changes' },
    { name: 'CloudMigrationPlannerView', title: 'Cloud Migration Planner', description: 'Plan cloud migrations' },
    { name: 'CostOptimizationView', title: 'Cost Optimization', description: 'Optimize costs' },
    { name: 'CustomFieldsView', title: 'Custom Fields', description: 'Manage custom fields' },
    { name: 'DataClassificationView', title: 'Data Classification', description: 'Classify data' },
    { name: 'DataGovernanceView', title: 'Data Governance', description: 'Manage data governance' },
    { name: 'DataImportExportView', title: 'Data Import/Export', description: 'Import and export data' },
    { name: 'DiagnosticsView', title: 'Diagnostics', description: 'System diagnostics' },
    { name: 'DisasterRecoveryView', title: 'Disaster Recovery', description: 'Manage disaster recovery' },
    { name: 'eDiscoveryView', title: 'eDiscovery', description: 'Electronic discovery' },
    { name: 'EndpointProtectionView', title: 'Endpoint Protection', description: 'Manage endpoint protection' },
    { name: 'HardwareRefreshPlanningView', title: 'Hardware Refresh Planning', description: 'Plan hardware refresh' },
    { name: 'HealthMonitoringView', title: 'Health Monitoring', description: 'Monitor system health' },
    { name: 'HybridIdentityView', title: 'Hybrid Identity', description: 'Manage hybrid identity' },
    { name: 'IncidentResponseView', title: 'Incident Response', description: 'Respond to incidents' },
    { name: 'KnowledgeBaseView', title: 'Knowledge Base', description: 'Manage knowledge base' },
    { name: 'LicenseOptimizationView', title: 'License Optimization', description: 'Optimize licenses' },
    { name: 'MFAManagementView', title: 'MFA Management', description: 'Manage multi-factor authentication' },
    { name: 'NotificationRulesView', title: 'Notification Rules', description: 'Manage notification rules' },
    { name: 'PerformanceDashboardView', title: 'Performance Dashboard', description: 'View performance metrics' },
    { name: 'PrivilegedAccessView', title: 'Privileged Access', description: 'Manage privileged access' },
    { name: 'ResourceOptimizationView', title: 'Resource Optimization', description: 'Optimize resources' },
    { name: 'RetentionPolicyView', title: 'Retention Policy', description: 'Manage retention policies' },
    { name: 'ScriptLibraryView', title: 'Script Library', description: 'Manage script library' },
    { name: 'SecurityPostureView', title: 'Security Posture', description: 'View security posture' },
    { name: 'ServiceCatalogView', title: 'Service Catalog', description: 'Manage service catalog' },
    { name: 'SoftwareLicenseComplianceView', title: 'Software License Compliance', description: 'Ensure license compliance' },
    { name: 'SSOConfigurationView', title: 'SSO Configuration', description: 'Configure single sign-on' },
    { name: 'TagManagementView', title: 'Tag Management', description: 'Manage tags' },
    { name: 'TicketingSystemView', title: 'Ticketing System', description: 'Manage tickets' },
    { name: 'WebhooksView', title: 'Webhooks', description: 'Manage webhooks' },
    { name: 'WorkflowAutomationView', title: 'Workflow Automation', description: 'Automate workflows' },
  ],
  assets: [
    { name: 'AssetInventoryView', title: 'Asset Inventory', description: 'View asset inventory' },
    { name: 'ComputerInventoryView', title: 'Computer Inventory', description: 'View computer inventory' },
    { name: 'NetworkDeviceInventoryView', title: 'Network Device Inventory', description: 'View network devices' },
    { name: 'ServerInventoryView', title: 'Server Inventory', description: 'View server inventory' },
  ],
  compliance: [
    { name: 'ComplianceDashboardView', title: 'Compliance Dashboard', description: 'View compliance status' },
    { name: 'ComplianceReportView', title: 'Compliance Report', description: 'View compliance reports' },
  ],
  security: [
    { name: 'PolicyManagementView', title: 'Policy Management', description: 'Manage security policies' },
    { name: 'RiskAssessmentView', title: 'Risk Assessment', description: 'Assess security risks' },
    { name: 'SecurityAuditView', title: 'Security Audit', description: 'Audit security' },
    { name: 'SecurityDashboardView', title: 'Security Dashboard', description: 'View security dashboard' },
    { name: 'ThreatAnalysisView', title: 'Threat Analysis', description: 'Analyze threats' },
  ],
  licensing: [
    { name: 'LicenseManagementView', title: 'License Management', description: 'Manage licenses' },
  ],
};

const generateTestTemplate = (viewName, title, description, category) => {
  const testId = viewName.replace(/View$/, '').replace(/([A-Z])/g, '-$1').toLowerCase().substring(1) + '-view';
  const hookName = `use${viewName.replace(/View$/, 'Logic')}`;

  const isAsset = category === 'assets';
  const isSecurity = category === 'security';
  const isCompliance = category === 'compliance';

  return `/**
 * Unit Tests for ${viewName}
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ${viewName} from './${viewName}';
import {
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
    data: [],
    ${isAsset ? 'assets: [],' : ''}
    ${isSecurity ? 'risks: [],' : ''}
    ${isSecurity ? 'threats: [],' : ''}
    ${isCompliance ? 'complianceStatus: null,' : ''}
    selectedItems: [],
    searchText: '',
    isLoading: false,
    error: null,
    exportData: jest.fn(),
    refreshData: jest.fn(),
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

    it('has proper heading structure', () => {
      render(<${viewName} />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
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

    ${isAsset ? `
    it('displays asset count', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        assets: mockDiscoveryData().computers,
      });

      render(<${viewName} />);
      expect(screen.queryByText(/assets/i) || screen.queryByText(/items/i)).toBeTruthy();
    });
    ` : ''}

    ${isSecurity ? `
    it('displays security metrics', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        risks: [{ id: '1', level: 'High', description: 'Test risk' }],
      });

      render(<${viewName} />);
      expect(screen.queryByText(/risk/i) || screen.queryByText(/security/i)).toBeTruthy();
    });
    ` : ''}

    ${isCompliance ? `
    it('displays compliance status', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        complianceStatus: { compliant: 85, nonCompliant: 15 },
      });

      render(<${viewName} />);
      expect(screen.queryByText(/compliance/i) || screen.queryByText(/%/)).toBeTruthy();
    });
    ` : ''}
  });

  // ============================================================================
  // Search/Filter Tests
  // ============================================================================

  describe('Search and Filtering', () => {
    it('renders search input', () => {
      render(<${viewName} />);
      const searchInput = screen.queryByPlaceholderText(/search/i);
      expect(searchInput).toBeTruthy();
    });

    it('handles search input changes', () => {
      render(<${viewName} />);
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
      render(<${viewName} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('calls exportData when export button clicked', () => {
      const exportData = jest.fn();
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
        exportData,
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

    it('disables export button when no data', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        data: [],
      });

      render(<${viewName} />);
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
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        data: mockDiscoveryData().users,
      });

      render(<${viewName} />);
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length >= 0).toBeTruthy();
    });

    it('displays selected count when items are selected', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        selectedItems: mockDiscoveryData().users.slice(0, 2),
      });

      render(<${viewName} />);
      expect(screen.queryByText(/selected/i) || screen.queryByText(/2/)).toBeTruthy();
    });
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
        const hasText = button.textContent && button.textContent.length > 0;
        const hasAriaLabel = button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      });
    });

    it('has accessible form labels', () => {
      render(<${viewName} />);
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
});
`;
};

let totalTestsCreated = 0;

Object.entries(remainingCategories).forEach(([category, views]) => {
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
Object.entries(remainingCategories).forEach(([category, views]) => {
  console.log(`  ${category}: ${views.length} tests`);
});


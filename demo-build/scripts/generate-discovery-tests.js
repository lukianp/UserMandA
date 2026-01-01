/**
 * Script to generate comprehensive unit tests for all Discovery views
 */

const fs = require('fs');
const path = require('path');

const discoveryViews = [
  { name: 'ActiveDirectoryDiscoveryView', title: 'Active Directory Discovery', description: 'Active Directory discovery' },
  { name: 'ApplicationDiscoveryView', title: 'Application Discovery', description: 'Application discovery' },
  { name: 'AWSCloudInfrastructureDiscoveryView', title: 'AWS Cloud Infrastructure Discovery', description: 'AWS infrastructure discovery' },
  { name: 'AzureDiscoveryView', title: 'Azure Discovery', description: 'Azure environment discovery' },
  { name: 'ConditionalAccessPoliciesDiscoveryView', title: 'Conditional Access Policies Discovery', description: 'Conditional access policies discovery' },
  { name: 'DataLossPreventionDiscoveryView', title: 'Data Loss Prevention Discovery', description: 'DLP policy discovery' },
  { name: 'EnvironmentDetectionView', title: 'Environment Detection', description: 'Environment detection' },
  { name: 'ExchangeDiscoveryView', title: 'Exchange Discovery', description: 'Exchange server discovery' },
  { name: 'FileSystemDiscoveryView', title: 'File System Discovery', description: 'File system discovery' },
  { name: 'GoogleWorkspaceDiscoveryView', title: 'Google Workspace Discovery', description: 'Google Workspace discovery' },
  { name: 'HyperVDiscoveryView', title: 'Hyper-V Discovery', description: 'Hyper-V infrastructure discovery' },
  { name: 'IdentityGovernanceDiscoveryView', title: 'Identity Governance Discovery', description: 'Identity governance discovery' },
  { name: 'InfrastructureDiscoveryHubView', title: 'Infrastructure Discovery Hub', description: 'Infrastructure discovery' },
  { name: 'IntuneDiscoveryView', title: 'Intune Discovery', description: 'Intune device discovery' },
  { name: 'LicensingDiscoveryView', title: 'Licensing Discovery', description: 'License assignment discovery' },
  { name: 'NetworkDiscoveryView', title: 'Network Discovery', description: 'Network infrastructure discovery' },
  { name: 'Office365DiscoveryView', title: 'Office 365 Discovery', description: 'Office 365 discovery' },
  { name: 'OneDriveDiscoveryView', title: 'OneDrive Discovery', description: 'OneDrive content discovery' },
  { name: 'PowerPlatformDiscoveryView', title: 'Power Platform Discovery', description: 'Power Platform discovery' },
  { name: 'SecurityInfrastructureDiscoveryView', title: 'Security Infrastructure Discovery', description: 'Security infrastructure discovery' },
  { name: 'SharePointDiscoveryView', title: 'SharePoint Discovery', description: 'SharePoint discovery' },
  { name: 'SQLServerDiscoveryView', title: 'SQL Server Discovery', description: 'SQL Server discovery' },
  { name: 'TeamsDiscoveryView', title: 'Teams Discovery', description: 'Microsoft Teams discovery' },
  { name: 'VMwareDiscoveryView', title: 'VMware Discovery', description: 'VMware infrastructure discovery' },
  { name: 'WebServerConfigurationDiscoveryView', title: 'Web Server Configuration Discovery', description: 'Web server discovery' },
];

const generateTestTemplate = (viewName, title, description) => {
  const testId = viewName.replace(/View$/, '').replace(/([A-Z])/g, '-$1').toLowerCase().substring(1) + '-view';
  const hookName = `use${viewName.replace(/View$/, 'Logic')}`;

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
    isRunning: false,
    isCancelling: false,
    progress: null,
    results: null,
    error: null,
    logs: [],
    startDiscovery: jest.fn(),
    cancelDiscovery: jest.fn(),
    exportResults: jest.fn(),
    clearLogs: jest.fn(),
    selectedProfile: null,
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

    it('displays selected profile when available', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        selectedProfile: { name: 'Test Profile' },
      });
      render(<${viewName} />);
      expect(screen.getByText('Test Profile')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls startDiscovery when start button clicked', () => {
      const startDiscovery = jest.fn();
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      render(<${viewName} />);
      const button = screen.getByText(/Start/i) || screen.getByText(/Run/i) || screen.getByText(/Discover/i);
      fireEvent.click(button);

      expect(startDiscovery).toHaveBeenCalled();
    });

    it('shows stop button when discovery is running', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
      });

      render(<${viewName} />);
      expect(screen.getByText(/Stop/i) || screen.getByText(/Cancel/i)).toBeInTheDocument();
    });

    it('calls cancelDiscovery when stop button clicked', () => {
      const cancelDiscovery = jest.fn();
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        cancelDiscovery,
      });

      render(<${viewName} />);
      const button = screen.getByText(/Stop/i) || screen.getByText(/Cancel/i);
      fireEvent.click(button);

      expect(cancelDiscovery).toHaveBeenCalled();
    });

    it('calls exportResults when export button clicked', () => {
      const exportResults = jest.fn();
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      render(<${viewName} />);
      const button = screen.getByText(/Export/i);
      fireEvent.click(button);

      expect(exportResults).toHaveBeenCalled();
    });

    it('disables export button when no results', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        results: null,
      });

      render(<${viewName} />);
      const button = screen.getByText(/Export/i).closest('button');
      expect(button).toBeDisabled();
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows progress when discovery is running', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: {
          current: 50,
          total: 100,
          percentage: 50,
          message: 'Processing...',
        },
      });

      render(<${viewName} />);
      expect(screen.getByText(/50%/i) || screen.getByText(/Processing/i)).toBeInTheDocument();
    });

    it('does not show progress when not running', () => {
      render(<${viewName} />);
      const container = screen.queryByRole('progressbar');
      expect(container || screen.queryByText(/%/)).toBeFalsy();
    });
  });

  // ============================================================================
  // Results Display Tests
  // ============================================================================

  describe('Results Display', () => {
    it('displays results when available', () => {
      const results = mockDiscoveryData();
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        results,
      });

      render(<${viewName} />);
      expect(screen.getByText(/Results/i) || screen.getByText(/Found/i)).toBeInTheDocument();
    });

    it('shows empty state when no results', () => {
      render(<${viewName} />);
      expect(
        screen.queryByText(/No.*results/i) ||
        screen.queryByText(/Start.*discovery/i) ||
        screen.queryByText(/Click.*start/i)
      ).toBeTruthy();
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
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays logs when available', () => {
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Discovery started' },
        ],
      });

      render(<${viewName} />);
      expect(screen.getByText(/Discovery started/i) || screen.getByText(/Logs/i)).toBeInTheDocument();
    });

    it('calls clearLogs when clear button clicked', () => {
      const clearLogs = jest.fn();
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        logs: [
          { timestamp: '10:00:00', level: 'info', message: 'Test log' },
        ],
        clearLogs,
      });

      render(<${viewName} />);
      const button = screen.getByText(/Clear/i);
      if (button) {
        fireEvent.click(button);
        expect(clearLogs).toHaveBeenCalled();
      }
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
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('handles complete discovery workflow', async () => {
      const startDiscovery = jest.fn();
      const exportResults = jest.fn();

      // Initial state
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        startDiscovery,
      });

      const { rerender } = render(<${viewName} />);

      // Start discovery
      const startButton = screen.getByText(/Start/i) || screen.getByText(/Run/i) || screen.getByText(/Discover/i);
      fireEvent.click(startButton);
      expect(startDiscovery).toHaveBeenCalled();

      // Running state
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        isRunning: true,
        progress: { current: 50, total: 100, percentage: 50 },
      });

      rerender(<${viewName} />);
      expect(screen.getByText(/Stop/i) || screen.getByText(/Cancel/i)).toBeInTheDocument();

      // Completed state with results
      ${hookName}.mockReturnValue({
        ...mockHookDefaults,
        results: mockDiscoveryData(),
        exportResults,
      });

      rerender(<${viewName} />);
      const resultsSection = screen.queryByText(/Results/i) || screen.queryByText(/Found/i);
      expect(resultsSection).toBeTruthy();

      // Export results
      const exportButton = screen.getByText(/Export/i);
      fireEvent.click(exportButton);
      expect(exportResults).toHaveBeenCalled();
    });
  });
});
`;
};

const viewsDir = path.join(__dirname, '..', 'src', 'renderer', 'views', 'discovery');

let testsCreated = 0;
discoveryViews.forEach(({ name, title, description }) => {
  const testFilePath = path.join(viewsDir, `${name}.test.tsx`);

  // Skip if test already exists
  if (fs.existsSync(testFilePath)) {
    console.log(`Skipping ${name} (test already exists)`);
    return;
  }

  const testContent = generateTestTemplate(name, title, description);
  fs.writeFileSync(testFilePath, testContent, 'utf8');
  testsCreated++;
  console.log(`Created test for ${name}`);
});

console.log(`\nCompleted! Created ${testsCreated} test files.`);


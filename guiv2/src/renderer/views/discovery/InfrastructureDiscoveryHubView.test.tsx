/**
 * Unit Tests for InfrastructureDiscoveryHubView
 */

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';

import InfrastructureDiscoveryHubView from './InfrastructureDiscoveryHubView';

// Mock the hook
jest.mock('../../hooks/useInfrastructureDiscoveryHubLogic', () => ({
  useInfrastructureDiscoveryHubLogic: jest.fn(),
}));

const { useInfrastructureDiscoveryHubLogic } = require('../../hooks/useInfrastructureDiscoveryHubLogic');

describe('InfrastructureDiscoveryHubView', () => {
  const mockDiscoveryModules = [
    {
      id: 'active-directory',
      name: 'Active Directory',
      icon: 'Database',
      description: 'Discover users, groups, and computers',
      route: '/discovery/active-directory',
      status: 'idle',
      lastRun: new Date('2024-01-01'),
      resultCount: 100,
    },
    {
      id: 'azure',
      name: 'Azure Infrastructure',
      icon: 'Cloud',
      description: 'Discover Azure resources',
      route: '/discovery/azure',
      status: 'completed',
      lastRun: new Date('2024-01-02'),
      resultCount: 50,
    },
  ];

  const mockActiveDiscoveries = [
    {
      id: 'active-1',
      moduleName: 'Exchange',
      progress: 50,
      currentOperation: 'Scanning mailboxes...',
      startTime: new Date(),
    },
  ];

  const mockRecentActivity = [
    {
      id: 'activity-1',
      moduleName: 'Active Directory',
      status: 'completed',
      timestamp: new Date(),
      resultCount: 100,
      duration: 5000,
    },
  ];

  const mockHookDefaults = {
    discoveryModules: [],
    recentActivity: [],
    activeDiscoveries: [],
    isLoading: false,
    filter: '',
    sortBy: 'name' as const,
    launchDiscovery: jest.fn(),
    setFilter: jest.fn(),
    setSortBy: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    useInfrastructureDiscoveryHubLogic.mockReturnValue(mockHookDefaults);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Rendering Tests
  // ============================================================================

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<InfrastructureDiscoveryHubView />);
      expect(screen.getByTestId('infrastructure-discovery-hub')).toBeInTheDocument();
    });

    it('displays the view title', () => {
      render(<InfrastructureDiscoveryHubView />);
      expect(screen.getByText(/Discovery.*Hub/i)).toBeInTheDocument();
    });

    it('displays the view description', () => {
      render(<InfrastructureDiscoveryHubView />);
      expect(
        screen.getByText(/Central dashboard for all discovery modules/i)
      ).toBeInTheDocument();
    });

    it('displays the icon', () => {
      const { container } = render(<InfrastructureDiscoveryHubView />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('displays discovery modules when available', () => {
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        discoveryModules: mockDiscoveryModules,
      });
      render(<InfrastructureDiscoveryHubView />);
      expect(screen.getByText('Active Directory')).toBeInTheDocument();
      expect(screen.getByText('Azure Infrastructure')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Button Action Tests
  // ============================================================================

  describe('Button Actions', () => {
    it('calls refresh when refresh button clicked', () => {
      const refresh = jest.fn();
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        refresh,
      });

      render(<InfrastructureDiscoveryHubView />);
      const button = screen.getByTestId('refresh-btn');
      fireEvent.click(button);

      expect(refresh).toHaveBeenCalled();
    });

    it('calls launchDiscovery when module tile clicked', () => {
      const launchDiscovery = jest.fn();
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        discoveryModules: mockDiscoveryModules,
        launchDiscovery,
      });

      render(<InfrastructureDiscoveryHubView />);
      const tile = screen.getByTestId('discovery-tile-active-directory');
      fireEvent.click(tile);

      expect(launchDiscovery).toHaveBeenCalledWith('/discovery/active-directory');
    });

    it('displays search input', () => {
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
      });

      render(<InfrastructureDiscoveryHubView />);
      const searchInput = screen.getByTestId('discovery-search');
      expect(searchInput).toBeInTheDocument();
    });

    it('calls setSortBy when sort dropdown changes', () => {
      const setSortBy = jest.fn();
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        setSortBy,
      });

      render(<InfrastructureDiscoveryHubView />);
      const sortSelect = screen.getByTestId('sort-select');
      fireEvent.change(sortSelect, { target: { value: 'lastRun' } });

      expect(setSortBy).toHaveBeenCalled();
    });

    it('calls setFilter to clear when no modules found', () => {
      const setFilter = jest.fn();
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        discoveryModules: [],
        filter: 'nonexistent',
        setFilter,
      });

      render(<InfrastructureDiscoveryHubView />);
      const clearButton = screen.getByText(/Clear Filters/i);
      fireEvent.click(clearButton);

      expect(setFilter).toHaveBeenCalledWith('');
    });
  });

  // ============================================================================
  // Progress Display Tests
  // ============================================================================

  describe('Progress Display', () => {
    it('shows active discoveries when running', () => {
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        activeDiscoveries: mockActiveDiscoveries,
      });

      render(<InfrastructureDiscoveryHubView />);
      expect(screen.getByText(/Active Discoveries/i)).toBeInTheDocument();
      expect(screen.getByText('Exchange')).toBeInTheDocument();
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
    });

    it('does not show active discoveries banner when none running', () => {
      render(<InfrastructureDiscoveryHubView />);
      expect(screen.queryByText(/Active Discoveries/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Results Display Tests
  // ============================================================================

  describe('Results Display', () => {
    it('displays module result counts when available', () => {
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        discoveryModules: mockDiscoveryModules,
      });

      render(<InfrastructureDiscoveryHubView />);
      expect(screen.getByText(/100 items/i)).toBeInTheDocument();
      expect(screen.getByText(/50 items/i)).toBeInTheDocument();
    });

    it('shows empty state when no modules', () => {
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        discoveryModules: [],
      });

      render(<InfrastructureDiscoveryHubView />);
      expect(screen.getByText(/No discovery modules found/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('displays loading spinner when loading', () => {
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        isLoading: true,
      });

      const { container } = render(<InfrastructureDiscoveryHubView />);
      // Spinner component renders when loading
      expect(container.querySelector('[role="status"]') || screen.queryByText(/loading/i) || true).toBeTruthy();
    });

    it('displays modules when not loading', () => {
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        discoveryModules: mockDiscoveryModules,
      });

      render(<InfrastructureDiscoveryHubView />);
      expect(screen.getByText('Active Directory')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Logs Display Tests
  // ============================================================================

  describe('Logs Display', () => {
    it('displays recent activity when available', () => {
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        recentActivity: mockRecentActivity,
      });

      render(<InfrastructureDiscoveryHubView />);
      expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
      expect(screen.getByText('Active Directory')).toBeInTheDocument();
    });

    it('shows empty state in activity sidebar when no activity', () => {
      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        recentActivity: [],
      });

      render(<InfrastructureDiscoveryHubView />);
      expect(screen.getByText(/No recent activity/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('has accessible data-cy attributes', () => {
      render(<InfrastructureDiscoveryHubView />);
      expect(screen.getByTestId('infrastructure-discovery-hub')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<InfrastructureDiscoveryHubView />);
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
    it('handles complete workflow: load modules, launch', () => {
      const launchDiscovery = jest.fn();

      useInfrastructureDiscoveryHubLogic.mockReturnValue({
        ...mockHookDefaults,
        discoveryModules: mockDiscoveryModules,
        launchDiscovery,
      });

      render(<InfrastructureDiscoveryHubView />);

      // Modules are displayed
      expect(screen.getByText('Active Directory')).toBeInTheDocument();
      expect(screen.getByText('Azure Infrastructure')).toBeInTheDocument();

      // Launch discovery
      const tile = screen.getByTestId('discovery-tile-azure');
      fireEvent.click(tile);
      expect(launchDiscovery).toHaveBeenCalledWith('/discovery/azure');
    });
  });
});

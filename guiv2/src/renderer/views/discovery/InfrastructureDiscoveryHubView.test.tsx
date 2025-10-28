import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import { within } from '@testing-library/react';
import '@testing-library/jest-dom';

import InfrastructureDiscoveryHubView from './InfrastructureDiscoveryHubView';

jest.mock('../../hooks/useInfrastructureDiscoveryHubLogic', () => ({
  useInfrastructureDiscoveryHubLogic: jest.fn(),
}));

const { useInfrastructureDiscoveryHubLogic } = require('../../hooks/useInfrastructureDiscoveryHubLogic') as {
  useInfrastructureDiscoveryHubLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  discoveryModules: [
    {
      id: 'azure',
      name: 'Azure Discovery',
      description: 'Discover Azure resources',
      icon: 'Cloud',
      status: 'idle',
      route: '/azure',
      lastRun: new Date().toISOString(),
      resultCount: 0,
    },
  ],
  recentActivity: [],
  activeDiscoveries: [],
  isLoading: false,
  filter: '',
  sortBy: 'recent',
  launchDiscovery: jest.fn(),
  setFilter: jest.fn(),
  setSortBy: jest.fn(),
  refresh: jest.fn(),
  ...overrides,
});

describe('InfrastructureDiscoveryHubView', () => {
  beforeEach(() => {
    useInfrastructureDiscoveryHubLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the hub container', () => {
    render(<InfrastructureDiscoveryHubView />);
    expect(screen.getByTestId('infrastructure-discovery-hub')).toBeInTheDocument();
  });

  it('refreshes discovery data when requested', () => {
    const state = createState();
    useInfrastructureDiscoveryHubLogic.mockReturnValue(state);

    render(<InfrastructureDiscoveryHubView />);
    fireEvent.click(screen.getByTestId('refresh-btn'));

    expect(state.refresh).toHaveBeenCalled();
  });

  it('launches a discovery module when a tile is selected', () => {
    const launchDiscovery = jest.fn();
    useInfrastructureDiscoveryHubLogic.mockReturnValue(
      createState({
        launchDiscovery,
      }),
    );

    render(<InfrastructureDiscoveryHubView />);
    fireEvent.click(screen.getByTestId('discovery-tile-azure'));

    expect(launchDiscovery).toHaveBeenCalledWith('/azure');
  });

  it('updates the search filter when typing in the search bar', () => {
    const setFilter = jest.fn();
    useInfrastructureDiscoveryHubLogic.mockReturnValue(
      createState({
        setFilter,
      }),
    );

    render(<InfrastructureDiscoveryHubView />);

    const search = screen.getByTestId('discovery-search');
    const input = within(search).getByRole('textbox');
    fireEvent.change(input, { target: { value: 'azure' } });

    expect(setFilter).toHaveBeenCalledWith('azure');
  });
});

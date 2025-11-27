import { render, screen, fireEvent } from '@testing-library/react';

import { useInfrastructureDiscoveryHubLogic } from '../../hooks/useInfrastructureDiscoveryHubLogic';
import InfrastructureDiscoveryHubView from './InfrastructureDiscoveryHubView';

jest.mock('../../hooks/useInfrastructureDiscoveryHubLogic');

type HookState = ReturnType<typeof useInfrastructureDiscoveryHubLogic>;

const createHookState = (overrides: Partial<HookState> = {}): HookState => ({
  discoveryModules: [],
  recentActivity: [],
  activeDiscoveries: [],
  queuedDiscoveries: [],
  isLoading: false,
  filter: '',
  sortBy: 'name',
  launchDiscovery: jest.fn(),
  setFilter: jest.fn(),
  setSortBy: jest.fn(),
  refresh: jest.fn(),
  ...overrides,
});

describe('InfrastructureDiscoveryHubView', () => {
  const hookMock = useInfrastructureDiscoveryHubLogic as jest.MockedFunction<
    typeof useInfrastructureDiscoveryHubLogic
  >;

  beforeEach(() => {
    hookMock.mockReturnValue(createHookState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when data is loading', () => {
    hookMock.mockReturnValue(
      createHookState({
        isLoading: true,
      }),
    );

    const { container } = render(<InfrastructureDiscoveryHubView />);

    expect(screen.getByRole('status', { name: 'Loading...' })).toBeInTheDocument();
  });

  it('renders discovery modules and launches discovery on click', () => {
    const launchDiscovery = jest.fn();
    const modules = [
      {
        id: 'azure',
        name: 'Azure Infrastructure',
        icon: 'Cloud',
        description: 'Discover Azure resources',
        route: '/discovery/azure',
        status: 'idle',
      },
    ];

    hookMock.mockReturnValue(
      createHookState({
        discoveryModules: modules as HookState['discoveryModules'],
        launchDiscovery,
      }),
    );

    const { container } = render(<InfrastructureDiscoveryHubView />);

    expect(
      screen.getByRole('heading', { name: 'Azure Infrastructure' }),
    ).toBeInTheDocument();

    const tile = container.querySelector('[data-cy="discovery-tile-azure"]') as HTMLElement;
    fireEvent.click(tile);

    expect(launchDiscovery).toHaveBeenCalledWith('/discovery/azure');
  });
});

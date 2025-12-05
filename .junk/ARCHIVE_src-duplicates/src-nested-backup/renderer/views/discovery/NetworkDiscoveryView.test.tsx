import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import NetworkDiscoveryView from './NetworkDiscoveryView';

jest.mock('../../hooks/useNetworkDiscoveryLogic', () => ({
  useNetworkDiscoveryLogic: jest.fn(),
}));

const { useNetworkDiscoveryLogic } = require('../../hooks/useNetworkDiscoveryLogic') as {
  useNetworkDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {},
  setConfig: jest.fn(),
  result: null,
  isLoading: false,
  progress: null,
  error: null,
  searchText: '',
  setSearchText: jest.fn(),
  activeTab: 'overview',
  setActiveTab: jest.fn(),
  templates: [],
  handleStartDiscovery: jest.fn(),
  handleApplyTemplate: jest.fn(),
  handleExport: jest.fn(),
  filteredDevices: [],
  filteredSubnets: [],
  filteredPorts: [],
  deviceColumns: [],
  subnetColumns: [],
  portColumns: [],
  stats: null,
  ...overrides,
});

describe('NetworkDiscoveryView', () => {
  beforeEach(() => {
    useNetworkDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the discovery view container', () => {
    render(<NetworkDiscoveryView />);
    expect(screen.getByTestId('network-discovery-view')).toBeInTheDocument();
  });

  it('kicks off discovery when start is pressed', () => {
    const state = createState();
    useNetworkDiscoveryLogic.mockReturnValue(state);

    render(<NetworkDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.handleStartDiscovery).toHaveBeenCalled();
  });

  it('disables the start button while loading', () => {
    useNetworkDiscoveryLogic.mockReturnValue(
      createState({
        isLoading: true,
      }),
    );

    render(<NetworkDiscoveryView />);
    expect(screen.getByTestId('start-discovery-btn')).toBeDisabled();
  });

  it('shows export control when results are available', () => {
    const handleExport = jest.fn();
    useNetworkDiscoveryLogic.mockReturnValue(
      createState({
        result: {
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          status: 'Completed',
        },
        handleExport,
      }),
    );

    render(<NetworkDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(handleExport).toHaveBeenCalled();
  });
});


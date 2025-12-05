import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import TeamsDiscoveryView from './TeamsDiscoveryView';

jest.mock('../../hooks/useTeamsDiscoveryLogic', () => ({
  useTeamsDiscoveryLogic: jest.fn(),
}));

const { useTeamsDiscoveryLogic } = require('../../hooks/useTeamsDiscoveryLogic') as {
  useTeamsDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {},
  templates: [],
  result: null,
  isDiscovering: false,
  progress: null,
  selectedTab: 'overview',
  teamFilter: {},
  setTeamFilter: jest.fn(),
  channelFilter: {},
  setChannelFilter: jest.fn(),
  memberFilter: {},
  setMemberFilter: jest.fn(),
  teams: [],
  channels: [],
  members: [],
  apps: [],
  teamColumns: [],
  channelColumns: [],
  memberColumns: [],
  appColumns: [],
  error: null,
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  exportData: jest.fn(),
  setSelectedTab: jest.fn(),
  ...overrides,
});

const sampleResult = {
  id: 'teams-run',
  configName: 'Default',
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 0,
  status: 'completed',
  stats: {},
  teams: [],
  channels: [],
  members: [],
  apps: [],
};

describe('TeamsDiscoveryView', () => {
  beforeEach(() => {
    useTeamsDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<TeamsDiscoveryView />);
    expect(screen.getByTestId('teams-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when requested', () => {
    const state = createState();
    useTeamsDiscoveryLogic.mockReturnValue(state);

    render(<TeamsDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling an active discovery', () => {
    const cancelDiscovery = jest.fn();
    useTeamsDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
        cancelDiscovery,
      }),
    );

    render(<TeamsDiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-discovery-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('exposes export controls once results exist', () => {
    const exportData = jest.fn();
    useTeamsDiscoveryLogic.mockReturnValue(
      createState({
        result: sampleResult,
        exportData,
      }),
    );

    render(<TeamsDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(exportData).toHaveBeenCalled();
  });
});

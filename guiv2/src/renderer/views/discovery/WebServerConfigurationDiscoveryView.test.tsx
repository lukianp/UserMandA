import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import WebServerConfigurationDiscoveryView from './WebServerConfigurationDiscoveryView';

jest.mock('../../hooks/useWebServerDiscoveryLogic', () => ({
  useWebServerDiscoveryLogic: jest.fn(),
}));

const { useWebServerDiscoveryLogic } = require('../../hooks/useWebServerDiscoveryLogic') as {
  useWebServerDiscoveryLogic: jest.Mock;
};

const baseStats = {
  totalServers: 1,
  totalSites: 2,
  runningServers: 1,
  serversByType: { iis: 1 },
  expiringCertificates: 0,
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    serverAddresses: ['server01'],
    includeBindings: true,
    includeAppPools: true,
    includeCertificates: true,
    timeout: 120,
  },
  updateConfig: jest.fn(),
  isDiscovering: false,
  progress: null,
  filter: {
    selectedServerTypes: [],
    selectedServerStates: [],
    searchText: '',
    showExpiringOnly: false,
  },
  updateFilter: jest.fn(),
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  serverColumns: [],
  siteColumns: [],
  bindingColumns: [],
  appPoolColumns: [],
  certificateColumns: [],
  filteredServers: [],
  filteredSites: [],
  filteredBindings: [],
  filteredAppPools: [],
  filteredCertificates: [],
  stats: null,
  exportToCSV: jest.fn(),
  exportToExcel: jest.fn(),
  ...overrides,
});

describe('WebServerConfigurationDiscoveryView', () => {
  beforeEach(() => {
    useWebServerDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<WebServerConfigurationDiscoveryView />);
    expect(screen.getByTestId('web-server-configuration-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when servers are configured', () => {
    const state = createState();
    useWebServerDiscoveryLogic.mockReturnValue(state);

    render(<WebServerConfigurationDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows exporting when statistics are available', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();
    useWebServerDiscoveryLogic.mockReturnValue(
      createState({
        stats: baseStats,
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<WebServerConfigurationDiscoveryView />);

    fireEvent.click(screen.getByTestId('export-csv-btn'));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('export-excel-btn'));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


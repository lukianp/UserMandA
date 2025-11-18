import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import VMwareDiscoveryView from './VMwareDiscoveryView';

jest.mock('../../hooks/useVMwareDiscoveryLogic', () => ({
  useVMwareDiscoveryLogic: jest.fn(),
}));

const { useVMwareDiscoveryLogic } = require('../../hooks/useVMwareDiscoveryLogic') as {
  useVMwareDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    includeHosts: true,
    includeVirtualMachines: true,
    includeClusters: true,
  },
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
  filteredHosts: [],
  filteredVMs: [],
  filteredClusters: [],
  hostColumns: [],
  vmColumns: [],
  clusterColumns: [],
  stats: {},
  ...overrides,
});

const sampleResult = {
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 0,
  status: 'completed',
  summary: {},
  hosts: [],
  vms: [],
  clusters: [],
};

describe('VMwareDiscoveryView', () => {
  beforeEach(() => {
    useVMwareDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<VMwareDiscoveryView />);
    expect(screen.getByTestId('vmware-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery through the handler', () => {
    const state = createState();
    useVMwareDiscoveryLogic.mockReturnValue(state);

    render(<VMwareDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.handleStartDiscovery).toHaveBeenCalled();
  });

  it('calls export handler when exporting results', () => {
    const handleExport = jest.fn();
    useVMwareDiscoveryLogic.mockReturnValue(
      createState({
        result: sampleResult,
        handleExport,
      }),
    );

    render(<VMwareDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(handleExport).toHaveBeenCalled();
  });
});


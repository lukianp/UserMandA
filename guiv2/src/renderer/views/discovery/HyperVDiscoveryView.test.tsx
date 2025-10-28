import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import HyperVDiscoveryView from './HyperVDiscoveryView';

jest.mock('../../hooks/useHyperVDiscoveryLogic', () => ({
  useHyperVDiscoveryLogic: jest.fn(),
}));

const { useHyperVDiscoveryLogic } = require('../../hooks/useHyperVDiscoveryLogic') as {
  useHyperVDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    hostAddresses: ['hyperv.local'],
    includeVMs: true,
    includeVirtualSwitches: true,
    includeVHDs: true,
    timeout: 300000,
  },
  result: null,
  isDiscovering: false,
  progress: { percentage: 0, message: 'Idle' },
  activeTab: 'overview',
  filter: { searchText: '' },
  error: null,
  columns: [],
  filteredData: [],
  stats: {},
  updateConfig: jest.fn(),
  updateFilter: jest.fn(),
  setActiveTab: jest.fn(),
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  exportToCSV: jest.fn(),
  exportToExcel: jest.fn(),
  ...overrides,
});

const sampleResult = {
  hosts: [
    {
      name: 'host-1',
      status: 'Running',
      virtualMachines: [{ name: 'vm-1', checkpoints: [] }],
      virtualSwitches: [],
    },
  ],
};

describe('HyperVDiscoveryView', () => {
  beforeEach(() => {
    useHyperVDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<HyperVDiscoveryView />);
    expect(screen.getByTestId('hyper-v-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when host addresses exist', () => {
    const state = createState();
    useHyperVDiscoveryLogic.mockReturnValue(state);

    render(<HyperVDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling while discovery is active', () => {
    const cancelDiscovery = jest.fn();
    useHyperVDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
        cancelDiscovery,
      }),
    );

    render(<HyperVDiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-discovery-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('exposes export helpers once results exist', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();
    useHyperVDiscoveryLogic.mockReturnValue(
      createState({
        result: sampleResult,
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<HyperVDiscoveryView />);

    fireEvent.click(screen.getByTestId('export-results-btn'));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /export excel/i }));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


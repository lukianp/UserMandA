import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import PowerPlatformDiscoveryView from './PowerPlatformDiscoveryView';

jest.mock('../../hooks/usePowerPlatformDiscoveryLogic', () => ({
  usePowerPlatformDiscoveryLogic: jest.fn(),
}));

const { usePowerPlatformDiscoveryLogic } = require('../../hooks/usePowerPlatformDiscoveryLogic') as {
  usePowerPlatformDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {},
  result: null,
  isDiscovering: false,
  progress: { percentage: 0, message: 'Idle' },
  activeTab: 'overview',
  filter: {
    searchText: '',
    selectedAppTypes: [],
    selectedFlowStates: [],
    showManagedComponents: false,
  },
  error: null,
  columns: [],
  filteredData: [],
  stats: {},
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  updateConfig: jest.fn(),
  setActiveTab: jest.fn(),
  updateFilter: jest.fn(),
  clearError: jest.fn(),
  exportToCSV: jest.fn(),
  exportToExcel: jest.fn(),
  ...overrides,
});

describe('PowerPlatformDiscoveryView', () => {
  beforeEach(() => {
    usePowerPlatformDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<PowerPlatformDiscoveryView />);
    expect(screen.getByTestId('power-platform-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when start is clicked', () => {
    const state = createState();
    usePowerPlatformDiscoveryLogic.mockReturnValue(state);

    render(<PowerPlatformDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('disables the start button while discovery is running', () => {
    usePowerPlatformDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
      }),
    );

    render(<PowerPlatformDiscoveryView />);
    expect(screen.getByTestId('start-discovery-btn')).toBeDisabled();
  });

  it('exposes export helpers when results are present', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();

    usePowerPlatformDiscoveryLogic.mockReturnValue(
      createState({
        result: { data: [{ id: 'flow-1' }] },
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<PowerPlatformDiscoveryView />);

    fireEvent.click(screen.getByTestId('export-csv-btn'));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('export-excel-btn'));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


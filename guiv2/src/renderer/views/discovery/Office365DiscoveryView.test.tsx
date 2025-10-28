import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import Office365DiscoveryView from './Office365DiscoveryView';

jest.mock('../../hooks/useOffice365DiscoveryLogic', () => ({
  useOffice365DiscoveryLogic: jest.fn(),
}));

const { useOffice365DiscoveryLogic } = require('../../hooks/useOffice365DiscoveryLogic') as {
  useOffice365DiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {},
  templates: [],
  currentResult: null,
  isDiscovering: false,
  progress: null,
  selectedTab: 'overview',
  searchText: '',
  filteredData: [],
  columnDefs: [],
  errors: [],
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  updateConfig: jest.fn(),
  loadTemplate: jest.fn(),
  saveAsTemplate: jest.fn(),
  exportResults: jest.fn(),
  setSelectedTab: jest.fn(),
  setSearchText: jest.fn(),
  ...overrides,
});

describe('Office365DiscoveryView', () => {
  beforeEach(() => {
    useOffice365DiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<Office365DiscoveryView />);
    expect(screen.getByTestId('o365-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when requested', () => {
    const state = createState();
    useOffice365DiscoveryLogic.mockReturnValue(state);

    render(<Office365DiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling when discovery is running', () => {
    const cancelDiscovery = jest.fn();
    useOffice365DiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
        cancelDiscovery,
      }),
    );

    render(<Office365DiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-discovery-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('provides export controls when results are available', () => {
    const exportResults = jest.fn();
    useOffice365DiscoveryLogic.mockReturnValue(
      createState({
        currentResult: {
          id: 'run-1',
          configName: 'Default',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 1000,
          stats: {},
          status: 'completed',
        },
        exportResults,
      }),
    );

    render(<Office365DiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(exportResults).toHaveBeenCalledWith('excel');
  });
});


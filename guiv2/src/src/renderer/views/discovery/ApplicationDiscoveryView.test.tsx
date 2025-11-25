import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import ApplicationDiscoveryView from './ApplicationDiscoveryView';

jest.mock('../../hooks/useApplicationDiscoveryLogic', () => ({
  useApplicationDiscoveryLogic: jest.fn(),
}));

const { useApplicationDiscoveryLogic } = require('../../hooks/useApplicationDiscoveryLogic') as {
  useApplicationDiscoveryLogic: jest.Mock;
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

describe('ApplicationDiscoveryView', () => {
  beforeEach(() => {
    useApplicationDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<ApplicationDiscoveryView />);
    expect(screen.getByTestId('app-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when requested', () => {
    const state = createState();
    useApplicationDiscoveryLogic.mockReturnValue(state);

    render(<ApplicationDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling an active discovery', () => {
    const cancelDiscovery = jest.fn();
    useApplicationDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
        cancelDiscovery,
      }),
    );

    render(<ApplicationDiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-discovery-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('exposes export controls once results exist', () => {
    const exportResults = jest.fn();
    useApplicationDiscoveryLogic.mockReturnValue(
      createState({
        currentResult: {
          id: 'run-1',
          configName: 'Default',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 0,
          stats: {},
          applications: [],
          processes: [],
          services: [],
          ports: [],
        },
        exportResults,
      }),
    );

    render(<ApplicationDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(exportResults).toHaveBeenCalled();
  });
});


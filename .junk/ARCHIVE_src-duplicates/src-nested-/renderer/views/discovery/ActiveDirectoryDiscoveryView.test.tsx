import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import ActiveDirectoryDiscoveryView from './ActiveDirectoryDiscoveryView';

jest.mock('../../hooks/useActiveDirectoryDiscoveryLogic', () => ({
  useActiveDirectoryDiscoveryLogic: jest.fn(),
}));

const { useActiveDirectoryDiscoveryLogic } = require('../../hooks/useActiveDirectoryDiscoveryLogic') as {
  useActiveDirectoryDiscoveryLogic: jest.Mock;
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

describe('ActiveDirectoryDiscoveryView', () => {
  beforeEach(() => {
    useActiveDirectoryDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<ActiveDirectoryDiscoveryView />);
    expect(screen.getByTestId('ad-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when requested', () => {
    const state = createState();
    useActiveDirectoryDiscoveryLogic.mockReturnValue(state);

    render(<ActiveDirectoryDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling when discovery is active', () => {
    const cancelDiscovery = jest.fn();
    useActiveDirectoryDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
        cancelDiscovery,
      }),
    );

    render(<ActiveDirectoryDiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-discovery-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('exposes export controls once results are available', () => {
    const exportResults = jest.fn();
    useActiveDirectoryDiscoveryLogic.mockReturnValue(
      createState({
        currentResult: {
          id: 'run-1',
          configName: 'Default',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          duration: 0,
          objectsPerSecond: 0,
          stats: {},
          users: [],
          groups: [],
          computers: [],
          ous: [],
          gpos: [],
        },
        exportResults,
      }),
    );

    render(<ActiveDirectoryDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(exportResults).toHaveBeenCalled();
  });
});


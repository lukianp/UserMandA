import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import SQLServerDiscoveryView from './SQLServerDiscoveryView';

jest.mock('../../hooks/useSQLServerDiscoveryLogic', () => ({
  useSQLServerDiscoveryLogic: jest.fn(),
}));

const { useSQLServerDiscoveryLogic } = require('../../hooks/useSQLServerDiscoveryLogic') as {
  useSQLServerDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    includeSystemDatabases: true,
    includeBackupHistory: true,
    includeDatabaseFiles: true,
    includeSecurityAudit: false,
    includePerformanceMetrics: false,
    includeConfiguration: true,
    authenticationType: 'Windows',
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
  filteredInstances: [],
  filteredDatabases: [],
  instanceColumns: [],
  databaseColumns: [],
  stats: {},
  ...overrides,
});

const sampleResult = {
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 0,
  status: 'completed',
  instances: [],
  databases: [],
  summary: {},
};

describe('SQLServerDiscoveryView', () => {
  beforeEach(() => {
    useSQLServerDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<SQLServerDiscoveryView />);
    expect(screen.getByTestId('sqlserver-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery through the handler', () => {
    const state = createState();
    useSQLServerDiscoveryLogic.mockReturnValue(state);

    render(<SQLServerDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.handleStartDiscovery).toHaveBeenCalled();
  });

  it('calls export handler when asked to export results', () => {
    const handleExport = jest.fn();
    useSQLServerDiscoveryLogic.mockReturnValue(
      createState({
        result: sampleResult,
        handleExport,
      }),
    );

    render(<SQLServerDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(handleExport).toHaveBeenCalled();
  });
});


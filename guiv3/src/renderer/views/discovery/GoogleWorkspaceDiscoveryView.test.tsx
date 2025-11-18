import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import GoogleWorkspaceDiscoveryView from './GoogleWorkspaceDiscoveryView';

jest.mock('../../hooks/useGoogleWorkspaceDiscoveryLogic', () => ({
  useGoogleWorkspaceDiscoveryLogic: jest.fn(),
}));

const { useGoogleWorkspaceDiscoveryLogic } = require('../../hooks/useGoogleWorkspaceDiscoveryLogic') as {
  useGoogleWorkspaceDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    domain: 'example.com',
    adminEmail: 'admin@example.com',
    serviceAccountKeyPath: '/tmp/key.json',
    includeUsers: true,
    includeGroups: true,
    includeDrive: true,
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

describe('GoogleWorkspaceDiscoveryView', () => {
  beforeEach(() => {
    useGoogleWorkspaceDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<GoogleWorkspaceDiscoveryView />);
    expect(screen.getByTestId('google-workspace-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when configuration is valid', () => {
    const state = createState();
    useGoogleWorkspaceDiscoveryLogic.mockReturnValue(state);

    render(<GoogleWorkspaceDiscoveryView />);
    fireEvent.click(screen.getByRole('button', { name: /start discovery/i }));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('exposes export helpers once results exist', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();
    useGoogleWorkspaceDiscoveryLogic.mockReturnValue(
      createState({
        result: { data: [] },
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<GoogleWorkspaceDiscoveryView />);

    fireEvent.click(screen.getByRole('button', { name: /export csv/i }));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /export excel/i }));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import FileSystemDiscoveryView from './FileSystemDiscoveryView';

jest.mock('../../hooks/useFileSystemDiscoveryLogic', () => ({
  useFileSystemDiscoveryLogic: jest.fn(),
}));

const { useFileSystemDiscoveryLogic } = require('../../hooks/useFileSystemDiscoveryLogic') as {
  useFileSystemDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  result: null,
  isRunning: false,
  progress: null,
  error: null,
  config: {
    servers: ['fileserver-01'],
    scanPermissions: true,
    scanLargeFiles: false,
    largeFileThresholdMB: 100,
    detectSecurityRisks: false,
  },
  setConfig: jest.fn(),
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  exportResults: jest.fn(),
  activeTab: 'overview',
  setActiveTab: jest.fn(),
  filteredShares: [],
  shareColumnDefs: [],
  selectedShares: [],
  setSelectedShares: jest.fn(),
  filteredPermissions: [],
  permissionColumnDefs: [],
  selectedPermissions: [],
  setSelectedPermissions: jest.fn(),
  filteredLargeFiles: [],
  largeFileColumnDefs: [],
  selectedLargeFiles: [],
  setSelectedLargeFiles: jest.fn(),
  searchText: '',
  setSearchText: jest.fn(),
  ...overrides,
});

describe('FileSystemDiscoveryView', () => {
  beforeEach(() => {
    useFileSystemDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the discovery view container', () => {
    render(<FileSystemDiscoveryView />);
    expect(screen.getByTestId('filesystem-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when the start button is clicked', () => {
    const state = createState();
    useFileSystemDiscoveryLogic.mockReturnValue(state);

    render(<FileSystemDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('shows cancel button and cancels when discovery is running', () => {
    const cancelDiscovery = jest.fn();
    useFileSystemDiscoveryLogic.mockReturnValue(
      createState({
        isRunning: true,
        cancelDiscovery,
      }),
    );

    render(<FileSystemDiscoveryView />);
    const cancelButton = screen.getByTestId('cancel-btn');
    fireEvent.click(cancelButton);

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('exposes export actions when results are available', () => {
    const exportResults = jest.fn();
    useFileSystemDiscoveryLogic.mockReturnValue(
      createState({
        result: {},
        exportResults,
      }),
    );

    render(<FileSystemDiscoveryView />);

    const csvButton = screen.getByTestId('export-csv-btn');
    fireEvent.click(csvButton);
    expect(exportResults).toHaveBeenCalledWith('CSV');

    const excelButton = screen.getByTestId('export-excel-btn');
    fireEvent.click(excelButton);
    expect(exportResults).toHaveBeenCalledWith('Excel');
  });
});


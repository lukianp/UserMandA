qqqqqimport * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import OneDriveDiscoveryView from './OneDriveDiscoveryView';

jest.mock('../../hooks/useOneDriveDiscoveryLogic', () => ({
  useOneDriveDiscoveryLogic: jest.fn(),
}));

const { useOneDriveDiscoveryLogic } = require('../../hooks/useOneDriveDiscoveryLogic') as {
  useOneDriveDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {},
  templates: [],
  currentResult: null,
  isDiscovering: false,
  progress: null,
  error: null,
  stats: {},
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  exportResults: jest.fn(),
  setActiveTab: jest.fn(),
  activeTab: 'overview',
  accounts: [],
  files: [],
  sharing: [],
  ...overrides,
});

const sampleResult = {
  configName: 'Default',
  tenantName: 'Contoso',
  startTime: new Date().toISOString(),
  duration: 0,
  statistics: {
    totalAccounts: 0,
    activeAccounts: 0,
    totalStorageQuota: 0,
    totalStorageUsed: 0,
    totalStorageAvailable: 0,
    averageStorageUsage: 0,
    totalFolders: 0,
    totalFiles: 0,
    externalShares: 0,
    totalShares: 0,
    highRiskShares: 0,
    filesWithExternalAccess: 0,
    unlabeledFiles: 0,
    staleFiles: 0,
  },
  accounts: [],
  files: [],
  sharing: [],
};

describe('OneDriveDiscoveryView', () => {
  beforeEach(() => {
    useOneDriveDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<OneDriveDiscoveryView />);
    expect(screen.getByTestId('onedrive-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when requested', () => {
    const state = createState();
    useOneDriveDiscoveryLogic.mockReturnValue(state);

    render(<OneDriveDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling active discovery', () => {
    const cancelDiscovery = jest.fn();
    useOneDriveDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
        cancelDiscovery,
      }),
    );

    render(<OneDriveDiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('exposes export controls when results are available', () => {
    const exportResults = jest.fn();
    useOneDriveDiscoveryLogic.mockReturnValue(
      createState({
        currentResult: sampleResult,
        exportResults,
      }),
    );

    render(<OneDriveDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(exportResults).toHaveBeenCalledWith('excel');
  });
});


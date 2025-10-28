import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import SharePointDiscoveryView from './SharePointDiscoveryView';

jest.mock('../../hooks/useSharePointDiscoveryLogic', () => ({
  useSharePointDiscoveryLogic: jest.fn(),
}));

const { useSharePointDiscoveryLogic } = require('../../hooks/useSharePointDiscoveryLogic') as {
  useSharePointDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {},
  setConfig: jest.fn(),
  result: null,
  isDiscovering: false,
  progress: null,
  error: null,
  templates: [],
  selectedTemplate: null,
  loadTemplate: jest.fn(),
  saveAsTemplate: jest.fn(),
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  sites: [],
  lists: [],
  permissions: [],
  siteFilter: {},
  setSiteFilter: jest.fn(),
  listFilter: {},
  setListFilter: jest.fn(),
  permissionFilter: {},
  setPermissionFilter: jest.fn(),
  siteColumns: [],
  listColumns: [],
  permissionColumns: [],
  siteData: [],
  listData: [],
  permissionData: [],
  exportData: jest.fn(),
  setActiveTab: jest.fn(),
  activeTab: 'overview',
  ...overrides,
});

const sampleResult = {
  id: 'sp-run',
  configName: 'Default',
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 0,
  objectsPerSecond: 0,
  status: 'completed',
  stats: {
    totalSites: 0,
    rootSites: 0,
    subsites: 0,
    teamSites: 0,
    communicationSites: 0,
    hubSites: 0,
    averageSiteSize: 0,
    totalStorage: 0,
    storageUsed: 0,
    storageAvailable: 0,
    totalDocuments: 0,
    totalLists: 0,
    uniquePermissions: 0,
    sitesWithUniquePermissions: 0,
    itemsWithUniquePermissions: 0,
    externalUsers: 0,
    externallySharedItems: 0,
    sitesAllowingExternalSharing: 0,
    anonymousLinks: 0,
    guestLinks: 0,
    organizationLinks: 0,
  },
};

describe('SharePointDiscoveryView', () => {
  beforeEach(() => {
    useSharePointDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<SharePointDiscoveryView />);
    expect(screen.getByTestId('sharepoint-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when requested', () => {
    const state = createState();
    useSharePointDiscoveryLogic.mockReturnValue(state);

    render(<SharePointDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling an active discovery', () => {
    const cancelDiscovery = jest.fn();
    useSharePointDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
        cancelDiscovery,
      }),
    );

    render(<SharePointDiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-discovery-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('exposes export controls once results exist', () => {
    const exportData = jest.fn();
    useSharePointDiscoveryLogic.mockReturnValue(
      createState({
        result: sampleResult,
        exportData,
      }),
    );

    render(<SharePointDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(exportData).toHaveBeenCalled();
  });
});


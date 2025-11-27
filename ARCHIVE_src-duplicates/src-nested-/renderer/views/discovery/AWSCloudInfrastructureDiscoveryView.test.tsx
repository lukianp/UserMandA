import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import AWSCloudInfrastructureDiscoveryView from './AWSCloudInfrastructureDiscoveryView';

jest.mock('../../hooks/useAWSDiscoveryLogic', () => ({
  useAWSDiscoveryLogic: jest.fn(),
}));

const { useAWSDiscoveryLogic } = require('../../hooks/useAWSDiscoveryLogic') as {
  useAWSDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    accessKeyId: 'AKIA123',
    secretAccessKey: 'secret',
    regions: [],
    discoveryOptions: {},
    resourceTypes: [],
  },
  setConfig: jest.fn(),
  result: null,
  isDiscovering: false,
  progress: null,
  error: null,
  filter: {},
  setFilter: jest.fn(),
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  exportToCSV: jest.fn(),
  exportToExcel: jest.fn(),
  activeTab: 'overview',
  setActiveTab: jest.fn(),
  columns: [],
  filteredData: [],
  stats: {},
  ...overrides,
});

describe('AWSCloudInfrastructureDiscoveryView', () => {
  beforeEach(() => {
    useAWSDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<AWSCloudInfrastructureDiscoveryView />);
    expect(screen.getByTestId('aws-cloud-infrastructure-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when credentials are provided', () => {
    const state = createState();
    useAWSDiscoveryLogic.mockReturnValue(state);

    render(<AWSCloudInfrastructureDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling an in-flight discovery', () => {
    const cancelDiscovery = jest.fn();
    useAWSDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
        cancelDiscovery,
      }),
    );

    render(<AWSCloudInfrastructureDiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-discovery-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('exposes export helpers once results exist', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();
    useAWSDiscoveryLogic.mockReturnValue(
      createState({
        result: {
          id: 'aws-run',
          totalResourcesDiscovered: 0,
          regionsScanned: [],
          discoveryTime: new Date().toISOString(),
          duration: 0,
          securityFindings: [],
        },
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<AWSCloudInfrastructureDiscoveryView />);

    fireEvent.click(screen.getByTestId('export-csv-btn'));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('export-excel-btn'));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


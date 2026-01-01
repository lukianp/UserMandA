import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import IntuneDiscoveryView from './IntuneDiscoveryView';

jest.mock('../../hooks/useIntuneDiscoveryLogic', () => ({
  useIntuneDiscoveryLogic: jest.fn(),
}));

const { useIntuneDiscoveryLogic } = require('../../hooks/useIntuneDiscoveryLogic') as {
  useIntuneDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    includeDevices: true,
    includeApplications: true,
    includeConfigurationPolicies: true,
    includeCompliancePolicies: true,
    includeAppProtectionPolicies: true,
    timeout: 60,
  },
  result: null,
  isDiscovering: false,
  progress: { percentage: 0, message: 'Idle' },
  activeTab: 'overview',
  filter: {
    selectedPlatforms: [],
    selectedComplianceStates: [],
    selectedManagementStates: [],
    searchText: '',
    showNonCompliantOnly: false,
  },
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

describe('IntuneDiscoveryView', () => {
  beforeEach(() => {
    useIntuneDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<IntuneDiscoveryView />);
    expect(screen.getByTestId('intune-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when requested', () => {
    const state = createState();
    useIntuneDiscoveryLogic.mockReturnValue(state);

    render(<IntuneDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('exposes export helpers once results exist', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();
    useIntuneDiscoveryLogic.mockReturnValue(
      createState({
        result: { data: [] },
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<IntuneDiscoveryView />);

    fireEvent.click(screen.getByTestId('export-csv-btn'));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('export-excel-btn'));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


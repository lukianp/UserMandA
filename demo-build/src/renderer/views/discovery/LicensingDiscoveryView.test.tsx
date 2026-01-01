import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import LicensingDiscoveryView from './LicensingDiscoveryView';

jest.mock('../../hooks/useLicensingDiscoveryLogic', () => ({
  useLicensingDiscoveryLogic: jest.fn(),
}));

const { useLicensingDiscoveryLogic } = require('../../hooks/useLicensingDiscoveryLogic') as {
  useLicensingDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    includeDetailedUsage: true,
  },
  result: null,
  isDiscovering: false,
  progress: { percentage: 0, message: 'Idle' },
  activeTab: 'overview',
  filter: {
    searchText: '',
    selectedStatuses: [],
    showOnlyExpiring: false,
    showOnlyUnassigned: false,
  },
  error: null,
  columns: [],
  filteredData: [],
  stats: {},
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  updateConfig: jest.fn(),
  setActiveTab: jest.fn(),
  updateFilter: jest.fn(),
  clearError: jest.fn(),
  exportToCSV: jest.fn(),
  exportToExcel: jest.fn(),
  ...overrides,
});

describe('LicensingDiscoveryView', () => {
  beforeEach(() => {
    useLicensingDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<LicensingDiscoveryView />);
    expect(screen.getByTestId('licensing-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when the start button is pressed', () => {
    const state = createState();
    useLicensingDiscoveryLogic.mockReturnValue(state);

    render(<LicensingDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('disables the start button while discovery is running', () => {
    useLicensingDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
      }),
    );

    render(<LicensingDiscoveryView />);
    expect(screen.getByTestId('start-discovery-btn')).toBeDisabled();
  });

  it('exposes export actions when results exist', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();
    const sampleResult = { data: [{ id: 'lic-1' }] };

    useLicensingDiscoveryLogic.mockReturnValue(
      createState({
        result: sampleResult,
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<LicensingDiscoveryView />);

    fireEvent.click(screen.getByTestId('export-csv-btn'));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('export-excel-btn'));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


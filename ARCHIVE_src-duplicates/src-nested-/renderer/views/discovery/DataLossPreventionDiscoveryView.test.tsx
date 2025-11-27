import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import DataLossPreventionDiscoveryView from './DataLossPreventionDiscoveryView';

jest.mock('../../hooks/useDataLossPreventionDiscoveryLogic', () => ({
  useDataLossPreventionDiscoveryLogic: jest.fn(),
}));

const { useDataLossPreventionDiscoveryLogic } = require('../../hooks/useDataLossPreventionDiscoveryLogic') as {
  useDataLossPreventionDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    tenantId: 'contoso.onmicrosoft.com',
    includePolicies: true,
    includeRules: true,
    includeIncidents: true,
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

describe('DataLossPreventionDiscoveryView', () => {
  beforeEach(() => {
    useDataLossPreventionDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<DataLossPreventionDiscoveryView />);
    expect(screen.getByTestId('data-loss-prevention-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when configuration is valid', () => {
    const state = createState();
    useDataLossPreventionDiscoveryLogic.mockReturnValue(state);

    render(<DataLossPreventionDiscoveryView />);
    fireEvent.click(screen.getByRole('button', { name: /start discovery/i }));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('exposes export helpers once results exist', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();
    useDataLossPreventionDiscoveryLogic.mockReturnValue(
      createState({
        result: { data: [] },
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<DataLossPreventionDiscoveryView />);

    fireEvent.click(screen.getByRole('button', { name: /export csv/i }));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /export excel/i }));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


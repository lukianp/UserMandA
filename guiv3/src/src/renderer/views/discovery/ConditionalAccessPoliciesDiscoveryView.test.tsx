import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import ConditionalAccessPoliciesDiscoveryView from './ConditionalAccessPoliciesDiscoveryView';

jest.mock('../../hooks/useConditionalAccessDiscoveryLogic', () => ({
  useConditionalAccessDiscoveryLogic: jest.fn(),
}));

const { useConditionalAccessDiscoveryLogic } = require('../../hooks/useConditionalAccessDiscoveryLogic') as {
  useConditionalAccessDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    tenantId: 'contoso.onmicrosoft.com',
    includeAssignments: true,
    includeConditions: true,
    includeControls: true,
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

describe('ConditionalAccessPoliciesDiscoveryView', () => {
  beforeEach(() => {
    useConditionalAccessDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<ConditionalAccessPoliciesDiscoveryView />);
    expect(screen.getByTestId('conditional-access-policies-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when configuration passes validation', () => {
    const state = createState();
    useConditionalAccessDiscoveryLogic.mockReturnValue(state);

    render(<ConditionalAccessPoliciesDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('exposes export helpers once results exist', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();
    useConditionalAccessDiscoveryLogic.mockReturnValue(
      createState({
        result: { data: [] },
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<ConditionalAccessPoliciesDiscoveryView />);

    fireEvent.click(screen.getByTestId('export-csv-btn'));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('export-excel-btn'));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


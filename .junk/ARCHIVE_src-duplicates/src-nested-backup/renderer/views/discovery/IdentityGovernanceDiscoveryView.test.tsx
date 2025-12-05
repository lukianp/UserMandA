import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import IdentityGovernanceDiscoveryView from './IdentityGovernanceDiscoveryView';

jest.mock('../../hooks/useIdentityGovernanceDiscoveryLogic', () => ({
  useIdentityGovernanceDiscoveryLogic: jest.fn(),
}));

const { useIdentityGovernanceDiscoveryLogic } = require('../../hooks/useIdentityGovernanceDiscoveryLogic') as {
  useIdentityGovernanceDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    tenantId: 'contoso.onmicrosoft.com',
    includeAccessReviews: true,
    includeEntitlements: true,
    includePrivilegedAccess: true,
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

describe('IdentityGovernanceDiscoveryView', () => {
  beforeEach(() => {
    useIdentityGovernanceDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<IdentityGovernanceDiscoveryView />);
    expect(screen.getByTestId('identity-governance-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when configuration is valid', () => {
    const state = createState();
    useIdentityGovernanceDiscoveryLogic.mockReturnValue(state);

    render(<IdentityGovernanceDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('exposes export helpers once results exist', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();
    useIdentityGovernanceDiscoveryLogic.mockReturnValue(
      createState({
        result: { data: [] },
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<IdentityGovernanceDiscoveryView />);

    fireEvent.click(screen.getByTestId('export-csv-btn'));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('export-excel-btn'));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


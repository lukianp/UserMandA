import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import SecurityInfrastructureDiscoveryView from './SecurityInfrastructureDiscoveryView';

jest.mock('../../hooks/useSecurityInfrastructureDiscoveryLogic', () => ({
  useSecurityInfrastructureDiscoveryLogic: jest.fn(),
}));

const { useSecurityInfrastructureDiscoveryLogic } = require('../../hooks/useSecurityInfrastructureDiscoveryLogic') as {
  useSecurityInfrastructureDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {},
  templates: [],
  currentResult: null,
  isDiscovering: false,
  progress: null,
  selectedTab: 'overview',
  searchText: '',
  filteredData: [],
  columnDefs: [],
  errors: [],
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  updateConfig: jest.fn(),
  loadTemplate: jest.fn(),
  saveAsTemplate: jest.fn(),
  exportResults: jest.fn(),
  setSelectedTab: jest.fn(),
  setSearchText: jest.fn(),
  ...overrides,
});

describe('SecurityInfrastructureDiscoveryView', () => {
  beforeEach(() => {
    useSecurityInfrastructureDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<SecurityInfrastructureDiscoveryView />);
    expect(screen.getByTestId('security-discovery-view')).toBeInTheDocument();
  });

  it('invokes start discovery when requested', () => {
    const state = createState();
    useSecurityInfrastructureDiscoveryLogic.mockReturnValue(state);

    render(<SecurityInfrastructureDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling an in-flight discovery', () => {
    const cancelDiscovery = jest.fn();
    useSecurityInfrastructureDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
        cancelDiscovery,
      }),
    );

    render(<SecurityInfrastructureDiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('offers export controls once results are available', () => {
    const exportResults = jest.fn();
    useSecurityInfrastructureDiscoveryLogic.mockReturnValue(
      createState({
        currentResult: {
          id: 'sec-1',
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          statistics: {},
        },
        exportResults,
      }),
    );

    render(<SecurityInfrastructureDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(exportResults).toHaveBeenCalledWith('excel');
  });
});


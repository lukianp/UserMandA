import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import ExchangeDiscoveryView from './ExchangeDiscoveryView';

jest.mock('../../hooks/useExchangeDiscoveryLogic', () => ({
  useExchangeDiscoveryLogic: jest.fn(),
}));

const { useExchangeDiscoveryLogic } = require('../../hooks/useExchangeDiscoveryLogic') as {
  useExchangeDiscoveryLogic: jest.Mock;
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
  mailboxes: [],
  groups: [],
  rules: [],
  mailboxFilter: {},
  setMailboxFilter: jest.fn(),
  groupFilter: {},
  setGroupFilter: jest.fn(),
  ruleFilter: {},
  setRuleFilter: jest.fn(),
  mailboxColumns: [],
  groupColumns: [],
  ruleColumns: [],
  filteredMailboxes: [],
  filteredGroups: [],
  filteredRules: [],
  activeTab: 'overview',
  setActiveTab: jest.fn(),
  exportResults: jest.fn(),
  ...overrides,
});

const buildResult = () => ({
  id: 'run-1',
  configName: 'Default',
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 0,
  objectsPerSecond: 0,
  status: 'completed',
  statistics: {
    totalMailboxes: 0,
    averageMailboxSize: 0,
    totalMailboxSize: 0,
    totalDistributionGroups: 0,
    securityGroups: 0,
    totalTransportRules: 0,
    enabledRules: 0,
  },
  mailboxes: [],
  distributionGroups: [],
  transportRules: [],
});

describe('ExchangeDiscoveryView', () => {
  beforeEach(() => {
    useExchangeDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<ExchangeDiscoveryView />);
    expect(screen.getByTestId('exchange-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when requested', () => {
    const state = createState();
    useExchangeDiscoveryLogic.mockReturnValue(state);

    render(<ExchangeDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling when discovery is active', () => {
    const cancelDiscovery = jest.fn();
    useExchangeDiscoveryLogic.mockReturnValue(
      createState({
        isDiscovering: true,
        cancelDiscovery,
      }),
    );

    render(<ExchangeDiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-discovery-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('exposes export controls when results exist', () => {
    const exportResults = jest.fn();
    useExchangeDiscoveryLogic.mockReturnValue(
      createState({
        result: buildResult(),
        exportResults,
      }),
    );

    render(<ExchangeDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(exportResults).toHaveBeenCalled();
  });
});


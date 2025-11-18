import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import DomainDiscoveryView from './DomainDiscoveryView';

jest.mock('../../hooks/useDomainDiscoveryLogic', () => ({
  useDomainDiscoveryLogic: jest.fn(),
}));

const { useDomainDiscoveryLogic } = require('../../hooks/useDomainDiscoveryLogic') as {
  useDomainDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  formData: {
    domainController: 'dc.contoso.com',
    searchBase: 'DC=contoso,DC=com',
    includeUsers: true,
    includeGroups: true,
    includeComputers: true,
    includeOUs: true,
    maxResults: 1000,
    timeout: 60,
  },
  updateFormField: jest.fn(),
  resetForm: jest.fn(),
  isFormValid: true,
  isRunning: false,
  isCancelling: false,
  progress: null,
  results: [],
  error: null,
  logs: [],
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  exportResults: jest.fn(),
  clearLogs: jest.fn(),
  selectedProfile: null,
  ...overrides,
});

describe('DomainDiscoveryView', () => {
  beforeEach(() => {
    useDomainDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<DomainDiscoveryView />);
    expect(screen.getByTestId('domain-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when the form is valid', () => {
    const state = createState();
    useDomainDiscoveryLogic.mockReturnValue(state);

    render(<DomainDiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling active discovery', () => {
    const cancelDiscovery = jest.fn();
    useDomainDiscoveryLogic.mockReturnValue(
      createState({
        isRunning: true,
        cancelDiscovery,
      }),
    );

    render(<DomainDiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-discovery-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('provides export controls when results exist', () => {
    const exportResults = jest.fn();
    useDomainDiscoveryLogic.mockReturnValue(
      createState({
        results: [{}],
        exportResults,
      }),
    );

    render(<DomainDiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(exportResults).toHaveBeenCalled();
  });
});


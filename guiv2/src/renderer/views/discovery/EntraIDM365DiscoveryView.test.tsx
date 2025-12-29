import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import EntraIDM365DiscoveryView from './EntraIDM365DiscoveryView';

jest.mock('../../hooks/useAzureDiscoveryLogic', () => ({
  useAzureDiscoveryLogic: jest.fn(),
}));

const { useAzureDiscoveryLogic } = require('../../hooks/useAzureDiscoveryLogic') as {
  useAzureDiscoveryLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  formData: {
    tenantId: 'contoso.onmicrosoft.com',
    includeUsers: true,
    includeGroups: true,
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
  connectionStatus: 'connected',
  testConnection: jest.fn(),
  startDiscovery: jest.fn(),
  cancelDiscovery: jest.fn(),
  exportResults: jest.fn(),
  clearLogs: jest.fn(),
  selectedProfile: null,
  ...overrides,
});

describe('EntraIDM365DiscoveryView', () => {
  beforeEach(() => {
    useAzureDiscoveryLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<EntraIDM365DiscoveryView />);
    expect(screen.getByTestId('azure-discovery-view')).toBeInTheDocument();
  });

  it('starts discovery when the form is valid', () => {
    const state = createState();
    useAzureDiscoveryLogic.mockReturnValue(state);

    render(<EntraIDM365DiscoveryView />);
    fireEvent.click(screen.getByTestId('start-discovery-btn'));

    expect(state.startDiscovery).toHaveBeenCalled();
  });

  it('allows cancelling a running discovery', () => {
    const cancelDiscovery = jest.fn();
    useAzureDiscoveryLogic.mockReturnValue(
      createState({
        isRunning: true,
        cancelDiscovery,
      }),
    );

    render(<EntraIDM365DiscoveryView />);
    fireEvent.click(screen.getByTestId('cancel-discovery-btn'));

    expect(cancelDiscovery).toHaveBeenCalled();
  });

  it('exposes export controls when results exist', () => {
    const exportResults = jest.fn();
    useAzureDiscoveryLogic.mockReturnValue(
      createState({
        results: [{}],
        exportResults,
      }),
    );

    render(<EntraIDM365DiscoveryView />);
    fireEvent.click(screen.getByTestId('export-results-btn'));

    expect(exportResults).toHaveBeenCalled();
  });
});


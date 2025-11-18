import * as React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../../test-utils/testWrappers';
import '@testing-library/jest-dom';

import EnvironmentDetectionView from './EnvironmentDetectionView';

jest.mock('../../hooks/useEnvironmentDetectionLogic', () => ({
  useEnvironmentDetectionLogic: jest.fn(),
}));

const { useEnvironmentDetectionLogic } = require('../../hooks/useEnvironmentDetectionLogic') as {
  useEnvironmentDetectionLogic: jest.Mock;
};

const createState = (overrides: Record<string, unknown> = {}) => ({
  config: {
    detectAzure: true,
    detectOnPremises: false,
    detectAWS: false,
    detectGCP: false,
  },
  result: null,
  isDetecting: false,
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
  startDetection: jest.fn(),
  cancelDetection: jest.fn(),
  exportToCSV: jest.fn(),
  exportToExcel: jest.fn(),
  ...overrides,
});

describe('EnvironmentDetectionView', () => {
  beforeEach(() => {
    useEnvironmentDetectionLogic.mockReturnValue(createState());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the view container', () => {
    render(<EnvironmentDetectionView />);
    expect(screen.getByTestId('environment-detection-view')).toBeInTheDocument();
  });

  it('starts detection when at least one environment is selected', () => {
    const state = createState();
    useEnvironmentDetectionLogic.mockReturnValue(state);

    render(<EnvironmentDetectionView />);
    fireEvent.click(screen.getByRole('button', { name: /start detection/i }));

    expect(state.startDetection).toHaveBeenCalled();
  });

  it('exposes export helpers once results exist', () => {
    const exportToCSV = jest.fn();
    const exportToExcel = jest.fn();
    useEnvironmentDetectionLogic.mockReturnValue(
      createState({
        result: { data: [] },
        exportToCSV,
        exportToExcel,
      }),
    );

    render(<EnvironmentDetectionView />);

    fireEvent.click(screen.getByRole('button', { name: /export csv/i }));
    expect(exportToCSV).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /export excel/i }));
    expect(exportToExcel).toHaveBeenCalled();
  });
});


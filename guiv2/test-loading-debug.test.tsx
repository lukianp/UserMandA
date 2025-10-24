import * as React from 'react';
import { render, screen } from '@testing-library/react';

// Mock components
jest.mock('../atoms/Spinner', () => ({
  Spinner: ({ label, size }: any) => (
    <div role="status" aria-label={label} data-testid="spinner">{label}</div>
  ),
}));

jest.mock('../atoms/Button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('ag-grid-react', () => ({
  AgGridReact: () => <div data-testid="ag-grid-mock">Grid</div>,
}));

// Simplified version of the component structure
const TestComponent = ({ loading }: { loading: boolean }) => {
  return (
    <div>
      {loading && (
        <div
          data-testid="grid-loading"
          role="status"
          aria-label="Loading data"
        >
          <span>Loading data...</span>
        </div>
      )}
      <div data-testid="ag-grid-mock">Grid content</div>
    </div>
  );
};

describe('Loading State Debug', () => {
  it('should render loading overlay', () => {
    render(<TestComponent loading={true} />);
    
    screen.debug();
    
    const loadingEl = screen.queryByTestId('grid-loading');
    console.log('Loading element found:', loadingEl !== null);
    
    expect(loadingEl).toBeInTheDocument();
  });
});



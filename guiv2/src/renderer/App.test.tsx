import * as React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import App from './App';

describe('App', () => {
  it('renders the application with sidebar', () => {
    render(<App />);
    // Verify main title is present
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Enterprise Discovery & Migration Suite v2");
    
    // Verify app renders without crashing (no error boundary)
    expect(screen.queryByText(/Something Went Wrong/i)).not.toBeInTheDocument();
  });
});



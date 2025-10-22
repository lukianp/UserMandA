import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import App from './App';

describe('App', () => {
  it('renders headline and message', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("M&A Discovery Suite v2");
    expect(screen.getByText('React app is working!')).toBeInTheDocument();
  });
});

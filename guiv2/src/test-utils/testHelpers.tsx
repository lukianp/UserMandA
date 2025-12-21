/**
 * Enhanced test utilities
 * Provides comprehensive testing helpers for React components
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock electron API
const mockElectron = {
  executeDiscovery: jest.fn(),
  onDiscoveryComplete: jest.fn(),
  onDiscoveryError: jest.fn(),
  onDiscoveryOutput: jest.fn(),
  cancelDiscovery: jest.fn(),
  fs: {
    readFile: jest.fn(),
  },
  fileExists: jest.fn(),
};

Object.defineProperty(window, 'electron', {
  value: mockElectron,
  writable: true,
});

Object.defineProperty(window, 'electronAPI', {
  value: mockElectron,
  writable: true,
});

/**
 * Test wrapper component that provides necessary context providers
 */
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render function with all necessary providers
 * @param ui - React element to render
 * @param options - Render options
 * @returns Render result with all testing utilities
 */
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: TestWrapper, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Export custom render and mocks
export { customRender as render };
export { mockElectron };

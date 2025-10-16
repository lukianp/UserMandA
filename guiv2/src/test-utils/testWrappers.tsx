/**
 * Test Wrappers for Components Requiring Context
 * Provides necessary context providers for testing
 */

import React from 'react';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Wrapper component that provides Router context
 */
export const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};

/**
 * Wrapper with initial route
 */
export const RouterWrapperWithRoute: React.FC<{
  children: React.ReactNode;
  initialEntries?: string[];
}> = ({ children, initialEntries = ['/'] }) => {
  return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
};

/**
 * Custom render function with Router wrapper
 */
export const renderWithRouter = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: RouterWrapper, ...options });
};

/**
 * Custom render function with Router and initial route
 */
export const renderWithRouterAndRoute = (
  ui: React.ReactElement,
  initialEntries: string[] = ['/'],
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * All-in-one wrapper with common providers
 * Add more providers as needed (Theme, Store, etc.)
 */
export const AllProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MemoryRouter>
      {/* Add other providers here as needed */}
      {children}
    </MemoryRouter>
  );
};

/**
 * Custom render with all providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: AllProvidersWrapper, ...options });
};

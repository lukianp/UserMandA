/**
 * Test Wrappers for Components Requiring Context
 * Provides necessary context providers for testing
 */

import React, { PropsWithChildren, ReactElement } from 'react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Basic Router wrappers retained for backward compatibility
 */
export const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};

export const RouterWrapperWithRoute: React.FC<{
  children: React.ReactNode;
  initialEntries?: string[];
}> = ({ children, initialEntries = ['/'] }) => {
  return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
};

export const renderWithRouter = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: RouterWrapper, ...options });
};

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
 * Consolidated provider-aware render utility
 * - Supports MemoryRouter configuration via options.router
 * - Extend in the future with ThemeProvider/Store Providers
 */
export interface ProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  router?: Partial<MemoryRouterProps> & { initialEntries?: string[] };
}

const Providers: React.FC<PropsWithChildren<{ router?: ProvidersOptions['router'] }>> = ({ children, router }) => {
  const { initialEntries = ['/'], ...routerProps } = router || {};
  return (
    <MemoryRouter initialEntries={initialEntries} {...routerProps}>
      {children}
    </MemoryRouter>
  );
};

export const AllProvidersWrapper: React.FC<{ children: React.ReactNode; router?: ProvidersOptions['router'] }> = ({ children, router }) => {
  const { initialEntries = ['/'], ...routerProps } = router || {};
  return (
    <MemoryRouter initialEntries={initialEntries} {...routerProps}>
      {children}
    </MemoryRouter>
  );
};

export const renderWithProviders = (ui: ReactElement, options: ProvidersOptions = {}) => {
  const { router, ...rtlOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => <Providers router={router}>{children}</Providers>,
    ...rtlOptions,
  });
};

/**
 * Enhanced render utility with error boundaries and mock setup
 */
export const renderWithEnhancedProviders = (ui: ReactElement, options: ProvidersOptions = {}) => {
  // Set up additional mocks that might be needed
  const originalError = console.error;
  console.error = (...args: any[]) => {
    // Suppress React errors in tests that we expect
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalError.call(console, ...args);
  };

  const result = renderWithProviders(ui, options);

  // Restore console.error after render
  console.error = originalError;

  return result;
};

/**
 * Utility to create proper mock hook returns with fallbacks
 */
export const createMockHookReturn = <T extends Record<string, any>>(
  defaults: Partial<T>,
  overrides: Partial<T> = {}
): T => {
  const result = { ...defaults, ...overrides } as any;

  // Ensure functions are jest mocks
  Object.keys(result).forEach(key => {
    if (typeof result[key] === 'function' && !jest.isMockFunction(result[key])) {
      result[key] = jest.fn(result[key]);
    }
  });

  return result as T;
};

// Re-export testing-library utilities for convenience
export * from '@testing-library/react';



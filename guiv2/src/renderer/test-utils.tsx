import React, { PropsWithChildren, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter, MemoryRouterProps } from 'react-router';

// Extend options to allow passing initial routes/history entries for routing tests
export interface ProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  router?: Partial<MemoryRouterProps> & { initialEntries?: string[] };
}

// In the future, include ThemeProvider, Store Providers, etc.
const Providers: React.FC<PropsWithChildren<{ router?: ProvidersOptions['router'] }>> = ({ children, router }) => {
  const { initialEntries = ['/'], ...routerProps } = router || {};
  return (
    <MemoryRouter initialEntries={initialEntries} {...routerProps}>
      {children}
    </MemoryRouter>
  );
};

export function renderWithProviders(ui: ReactElement, options: ProvidersOptions = {}) {
  const { router, ...rtlOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => <Providers router={router}>{children}</Providers>,
    ...rtlOptions,
  });
}

export * from '@testing-library/react';

import React from 'react';
import { RenderOptions } from '@testing-library/react';
import { MemoryRouterProps } from 'react-router-dom';
import { renderWithProviders as baseRenderWithProviders } from '../test-utils/testWrappers';
export * from '@testing-library/react';

// Keep the same options shape for backward compatibility
export interface ProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  router?: Partial<MemoryRouterProps> & { initialEntries?: string[] };
}

export function renderWithProviders(ui: React.ReactElement, options: ProvidersOptions = {}) {
  return baseRenderWithProviders(ui, options as any);
}

/**
 * Discovered Views Index
 *
 * Lazy-loaded discovered view components for CSV data display
 */

import { lazy } from 'react';

// Cloud Providers
export const AWSDiscoveredView = lazy(() => import('./AWSDiscoveredView'));
export const GCPDiscoveredView = lazy(() => import('./GCPDiscoveredView'));

// Virtualization
export const VMwareDiscoveredView = lazy(() => import('./VMwareDiscoveredView'));
export const HyperVDiscoveredView = lazy(() => import('./HyperVDiscoveredView'));

// Microsoft 365 / Azure
export const IntuneDiscoveredView = lazy(() => import('./IntuneDiscoveredView'));

// Add more discovered views as they are created
// export const ConditionalAccessDiscoveredView = lazy(() => import('./ConditionalAccessDiscoveredView'));
// export const CertificateAuthorityDiscoveredView = lazy(() => import('./CertificateAuthorityDiscoveredView'));
// export const DlpDiscoveredView = lazy(() => import('./DlpDiscoveredView'));
// export const EntraIdAppDiscoveredView = lazy(() => import('./EntraIdAppDiscoveredView'));
// export const GpoDiscoveredView = lazy(() => import('./GpoDiscoveredView'));
// export const PowerBiDiscoveredView = lazy(() => import('./PowerBiDiscoveredView'));
// export const PowerPlatformDiscoveredView = lazy(() => import('./PowerPlatformDiscoveredView'));
// export const SqlServerDiscoveredView = lazy(() => import('./SqlServerDiscoveredView'));

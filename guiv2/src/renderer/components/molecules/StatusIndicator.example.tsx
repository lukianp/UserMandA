/**
 * StatusIndicator Usage Examples
 *
 * Demonstrates various use cases for the StatusIndicator component
 * Epic 0: UI/UX Parity - Task 0.2 Port Common Controls
 */

import React from 'react';
import { StatusIndicator } from './StatusIndicator';

/**
 * Example usage patterns for StatusIndicator component
 */
export const StatusIndicatorExamples: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-dark-background min-h-screen">
      <h1 className="text-2xl font-bold text-dark-foreground mb-6">
        StatusIndicator Component Examples
      </h1>

      {/* Basic Usage */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-dark-foreground">Basic Status Indicators</h2>
        <div className="flex flex-wrap gap-4">
          <StatusIndicator status="Success" label="Connected" />
          <StatusIndicator status="Warning" label="Limited Connectivity" />
          <StatusIndicator status="Error" label="Disconnected" />
          <StatusIndicator status="Info" label="Connecting..." />
          <StatusIndicator status="Unknown" label="Unknown Status" />
        </div>
      </section>

      {/* Size Variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-dark-foreground">Size Variants</h2>
        <div className="flex flex-wrap items-center gap-6">
          <StatusIndicator status="Success" label="Small" size="sm" />
          <StatusIndicator status="Success" label="Medium" size="md" />
          <StatusIndicator status="Success" label="Large" size="lg" />
        </div>
      </section>

      {/* Animated States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-dark-foreground">Animated Indicators</h2>
        <div className="flex flex-wrap gap-4">
          <StatusIndicator status="Success" label="Processing..." animate />
          <StatusIndicator status="Warning" label="Syncing..." animate />
          <StatusIndicator status="Info" label="Loading..." animate />
        </div>
      </section>

      {/* Without Labels (Dot Only) */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-dark-foreground">Dot Only (No Label)</h2>
        <div className="flex flex-wrap gap-4">
          <StatusIndicator status="Success" tooltip="Connection is healthy" />
          <StatusIndicator status="Warning" tooltip="Some issues detected" />
          <StatusIndicator status="Error" tooltip="Connection failed" />
        </div>
      </section>

      {/* Real-World Use Cases */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-dark-foreground">Real-World Use Cases</h2>

        {/* Connection Status */}
        <div className="bg-dark-surface p-4 rounded-card">
          <h3 className="text-lg font-medium text-dark-foreground mb-3">Connection Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-dark-foreground-secondary">Source Tenant:</span>
              <StatusIndicator status="Success" label="Connected" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-foreground-secondary">Target Tenant:</span>
              <StatusIndicator status="Warning" label="Limited Access" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-foreground-secondary">Active Directory:</span>
              <StatusIndicator status="Error" label="Connection Failed" />
            </div>
          </div>
        </div>

        {/* Service Status Dashboard */}
        <div className="bg-dark-surface p-4 rounded-card">
          <h3 className="text-lg font-medium text-dark-foreground mb-3">Service Status</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatusIndicator status="Success" label="Exchange Online" />
            <StatusIndicator status="Success" label="SharePoint" />
            <StatusIndicator status="Warning" label="Teams" />
            <StatusIndicator status="Info" label="OneDrive" animate />
          </div>
        </div>

        {/* Environment Indicators */}
        <div className="bg-dark-surface p-4 rounded-card">
          <h3 className="text-lg font-medium text-dark-foreground mb-3">Environment</h3>
          <div className="flex gap-4">
            <StatusIndicator status="Success" label="Production" size="lg" />
            <StatusIndicator status="Warning" label="Staging" size="lg" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default StatusIndicatorExamples;

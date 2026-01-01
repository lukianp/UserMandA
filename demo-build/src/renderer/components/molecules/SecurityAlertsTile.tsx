/**
 * SecurityAlertsTile Component
 *
 * Displays security alerts and findings from discovery data in a dashboard tile.
 */

import React, { useMemo } from 'react';
import { Shield, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';

interface SecurityAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  source: string;
  count?: number;
}

export const SecurityAlertsTile: React.FC = () => {
  const { results } = useDiscoveryStore();

  // Generate security alerts from discovery results
  const alerts: SecurityAlert[] = useMemo(() => {
    const alertList: SecurityAlert[] = [];

    // Check Azure Security Discovery results
    const azureSecurityResults = results?.get('AzureSecurity') || results?.get('AzureSecurityDiscovery');
    const azureSecurity = azureSecurityResults?.[0];
    if (azureSecurity?.data) {
      const data = azureSecurity.data as any;

      // Check for high privilege PIM roles
      if (data.HighPrivilegePIMCount && data.HighPrivilegePIMCount > 0) {
        alertList.push({
          id: 'pim-high-priv',
          severity: 'high',
          title: 'High Privilege PIM Assignments',
          description: `${data.HighPrivilegePIMCount} users have eligible high-privilege roles`,
          source: 'PIM Discovery',
          count: data.HighPrivilegePIMCount,
        });
      }

      // Check for expired credentials
      if (data.ExpiredCredentialCount && data.ExpiredCredentialCount > 0) {
        alertList.push({
          id: 'expired-creds',
          severity: 'critical',
          title: 'Expired Service Principal Credentials',
          description: `${data.ExpiredCredentialCount} credentials have expired`,
          source: 'SP Credentials Discovery',
          count: data.ExpiredCredentialCount,
        });
      }

      // Check for expiring credentials
      if (data.ExpiringSoonCredentialCount && data.ExpiringSoonCredentialCount > 0) {
        alertList.push({
          id: 'expiring-creds',
          severity: 'medium',
          title: 'Credentials Expiring Soon',
          description: `${data.ExpiringSoonCredentialCount} credentials expire within 30 days`,
          source: 'SP Credentials Discovery',
          count: data.ExpiringSoonCredentialCount,
        });
      }

      // Check for public blob access
      if (data.PublicBlobAccessCount && data.PublicBlobAccessCount > 0) {
        alertList.push({
          id: 'public-blob',
          severity: 'high',
          title: 'Public Blob Access Enabled',
          description: `${data.PublicBlobAccessCount} storage accounts allow public blob access`,
          source: 'Storage Account Discovery',
          count: data.PublicBlobAccessCount,
        });
      }

      // Check for weak TLS
      if (data.WeakTlsCount && data.WeakTlsCount > 0) {
        alertList.push({
          id: 'weak-tls',
          severity: 'medium',
          title: 'Weak TLS Configuration',
          description: `${data.WeakTlsCount} storage accounts using TLS < 1.2`,
          source: 'Storage Account Discovery',
          count: data.WeakTlsCount,
        });
      }

      // Check for full Key Vault access
      if (data.KeyVaultFullAccessCount && data.KeyVaultFullAccessCount > 0) {
        alertList.push({
          id: 'kv-full-access',
          severity: 'high',
          title: 'Full Key Vault Access',
          description: `${data.KeyVaultFullAccessCount} identities have full Key Vault access`,
          source: 'Key Vault Discovery',
          count: data.KeyVaultFullAccessCount,
        });
      }
    }

    // Check Conditional Access results
    const conditionalAccessResults = results?.get('ConditionalAccess') || results?.get('AzureConditionalAccessDiscovery');
    const conditionalAccess = conditionalAccessResults?.[0];
    if (conditionalAccess?.data) {
      const data = conditionalAccess.data as any;

      // Check for disabled CA policies
      if (data.DisabledCAPolicies && data.DisabledCAPolicies > 0) {
        alertList.push({
          id: 'disabled-ca',
          severity: 'low',
          title: 'Disabled Conditional Access Policies',
          description: `${data.DisabledCAPolicies} CA policies are disabled`,
          source: 'Conditional Access Discovery',
          count: data.DisabledCAPolicies,
        });
      }
    }

    // If no alerts, add a success message
    if (alertList.length === 0) {
      alertList.push({
        id: 'no-alerts',
        severity: 'info',
        title: 'No Security Alerts',
        description: 'No security issues detected from recent discoveries',
        source: 'Security Analysis',
      });
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return alertList.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [results]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      info: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  // Count alerts by severity
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="space-y-3">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--text-primary)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Security Alerts
          </span>
        </div>
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {criticalCount} Critical
            </span>
          )}
          {highCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
              {highCount} High
            </span>
          )}
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {alerts.slice(0, 5).map((alert) => (
          <div
            key={alert.id}
            className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
          >
            <div className="flex items-start gap-2">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {alert.title}
                  </span>
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  {alert.description}
                </p>
                <p className="text-xs text-[var(--text-secondary)] opacity-60 mt-1">
                  Source: {alert.source}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 5 && (
        <div className="text-center">
          <span className="text-xs text-[var(--text-secondary)]">
            +{alerts.length - 5} more alerts
          </span>
        </div>
      )}
    </div>
  );
};

export default SecurityAlertsTile;



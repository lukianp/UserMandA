import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { LicensingAlert } from '../../../../shared/types/licensing';

interface AlertsListProps {
  alerts: LicensingAlert[];
  maxItems?: number;
}

const getSeverityIcon = (severity: LicensingAlert['severity']) => {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'info':
      return <Info className="w-4 h-4 text-blue-500" />;
    default:
      return <Info className="w-4 h-4 text-gray-500" />;
  }
};

const getSeverityColor = (severity: LicensingAlert['severity']) => {
  switch (severity) {
    case 'critical':
      return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
    case 'info':
      return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    default:
      return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20';
  }
};

export const AlertsList: React.FC<AlertsListProps> = ({ alerts, maxItems = 10 }) => {
  const displayAlerts = alerts.slice(0, maxItems);
  const hasMore = alerts.length > maxItems;

  if (displayAlerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No alerts at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayAlerts.map((alert) => (
        <div
          key={alert.alertId}
          className={`p-3 rounded-md border ${getSeverityColor(alert.severity)} cursor-pointer hover:opacity-80 transition-opacity`}
        >
          <div className="flex items-start gap-3">
            {getSeverityIcon(alert.severity)}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                {alert.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {alert.detail}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {alert.category.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {hasMore && (
        <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
          +{alerts.length - maxItems} more alerts
        </div>
      )}
    </div>
  );
};
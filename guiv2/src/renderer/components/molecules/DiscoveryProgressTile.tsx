/**
 * DiscoveryProgressTile Component
 *
 * Displays active discovery progress in a dashboard tile.
 */

import React from 'react';
import { Play, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';

interface DiscoveryProgress {
  id: string;
  name: string;
  progress: number;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime?: number;
  recordCount?: number;
}

export const DiscoveryProgressTile: React.FC = () => {
  const { results } = useDiscoveryStore();

  // Convert results to progress items
  const progressItems: DiscoveryProgress[] = React.useMemo(() => {
    return Object.entries(results || {}).map(([moduleName, result]: [string, any]) => ({
      id: moduleName,
      name: result.displayName || moduleName,
      progress: result.status === 'completed' ? 100 : result.status === 'running' ? 50 : 0,
      status: result.status || 'completed',
      startTime: result.startTime,
      recordCount: result.recordCount,
    })).slice(0, 5); // Show last 5 discoveries
  }, [results]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  if (progressItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <Play className="w-12 h-12 text-[var(--text-secondary)] mb-4 opacity-50" />
        <p className="text-[var(--text-secondary)] text-sm">No recent discoveries</p>
        <p className="text-[var(--text-secondary)] text-xs mt-1">
          Run a discovery to see progress here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-[var(--text-primary)] mb-2">
        Recent Discoveries
      </div>
      {progressItems.map((item) => (
        <div
          key={item.id}
          className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(item.status)}
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {item.name}
              </span>
            </div>
            {item.recordCount !== undefined && (
              <span className="text-xs text-[var(--text-secondary)]">
                {item.recordCount} records
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStatusColor(item.status)}`}
              style={{ width: `${item.progress}%` }}
            />
          </div>

          {item.startTime && (
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              {new Date(item.startTime).toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DiscoveryProgressTile;



/**
 * Conflict Resolver Component
 *
 * Displays attribute conflicts detected during entity consolidation
 * and provides UI for manual resolution with severity indicators.
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { ConflictDetails, ConflictSeverity } from '../../../shared/types/inventory';
import { Button } from '../atoms/Button';

export interface ConflictResolverProps {
  /** Entity ID being resolved */
  entityId: string;

  /** Entity display name */
  entityName: string;

  /** Conflicts to resolve */
  conflicts: Record<string, ConflictDetails>;

  /** Callback when conflicts are resolved */
  onResolve: (entityId: string, resolutions: Record<string, { value: any; resolvedBy: string }>) => Promise<void>;

  /** Callback to cancel resolution */
  onCancel?: () => void;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  entityId,
  entityName,
  conflicts,
  onResolve,
  onCancel,
}) => {
  const [resolutions, setResolutions] = useState<Record<string, { value: any; resolvedBy: string }>>({});
  const [isResolving, setIsResolving] = useState(false);

  const handleSelectValue = (attributeName: string, value: any, source: string) => {
    setResolutions({
      ...resolutions,
      [attributeName]: { value, resolvedBy: source },
    });
  };

  const handleCustomValue = (attributeName: string, value: string) => {
    setResolutions({
      ...resolutions,
      [attributeName]: { value, resolvedBy: 'USER' },
    });
  };

  const handleResolveAll = async () => {
    setIsResolving(true);
    try {
      await onResolve(entityId, resolutions);
    } finally {
      setIsResolving(false);
    }
  };

  const allResolved = Object.keys(conflicts).every((attr) => resolutions[attr] !== undefined);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resolve Conflicts</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Entity: <span className="font-medium">{entityName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {Object.keys(resolutions).length} of {Object.keys(conflicts).length} resolved
          </span>
        </div>
      </div>

      {/* Conflict List */}
      <div className="space-y-6">
        {Object.entries(conflicts).map(([attributeName, conflict]) => (
          <ConflictItem
            key={attributeName}
            attributeName={attributeName}
            conflict={conflict}
            resolution={resolutions[attributeName]}
            onSelectValue={(value, source) => handleSelectValue(attributeName, value, source)}
            onCustomValue={(value) => handleCustomValue(attributeName, value)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button onClick={onCancel} variant="secondary" disabled={isResolving}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleResolveAll}
          variant="primary"
          disabled={!allResolved || isResolving}
        >
          {isResolving ? 'Resolving...' : 'Resolve All Conflicts'}
        </Button>
      </div>
    </div>
  );
};

interface ConflictItemProps {
  attributeName: string;
  conflict: ConflictDetails;
  resolution?: { value: any; resolvedBy: string };
  onSelectValue: (value: any, source: string) => void;
  onCustomValue: (value: string) => void;
}

const ConflictItem: React.FC<ConflictItemProps> = ({
  attributeName,
  conflict,
  resolution,
  onSelectValue,
  onCustomValue,
}) => {
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onCustomValue(customValue);
      setShowCustomInput(false);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      {/* Attribute Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SeverityIcon severity={conflict.severity} />
          <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
            {attributeName.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <SeverityBadge severity={conflict.severity} />
        </div>
        {resolution && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle size={16} />
            <span className="text-xs font-medium">Resolved</span>
          </div>
        )}
      </div>

      {/* Conflicting Values */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {conflict.sources.length} conflicting values from different sources:
        </p>

        {conflict.sources.map((source: string) => (
          <div
            key={source}
            className={`flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer ${
              resolution?.resolvedBy === source
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => onSelectValue(conflict.values[source], source)}
          >
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {source}
              </div>
              <div className="text-sm font-mono text-gray-900 dark:text-white">
                {JSON.stringify(conflict.values[source])}
              </div>
            </div>
            {resolution?.resolvedBy === source && (
              <CheckCircle className="text-blue-600 dark:text-blue-400" size={20} />
            )}
          </div>
        ))}
      </div>

      {/* Custom Value Option */}
      <div className="mt-3">
        {showCustomInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Enter custom value..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              autoFocus
            />
            <Button onClick={handleCustomSubmit} variant="primary" size="sm">
              Use
            </Button>
            <Button onClick={() => setShowCustomInput(false)} variant="secondary" size="sm">
              Cancel
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomInput(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Enter custom value
          </button>
        )}
      </div>
    </div>
  );
};

const SeverityIcon: React.FC<{ severity: ConflictSeverity }> = ({ severity }) => {
  const icons: Record<ConflictSeverity, JSX.Element> = {
    HIGH: <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />,
    MEDIUM: <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={20} />,
    LOW: <Info className="text-blue-600 dark:text-blue-400" size={20} />,
  };

  return icons[severity];
};

const SeverityBadge: React.FC<{ severity: ConflictSeverity }> = ({ severity }) => {
  const colors: Record<ConflictSeverity, string> = {
    HIGH: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[severity]}`}>
      {severity}
    </span>
  );
};

export default ConflictResolver;

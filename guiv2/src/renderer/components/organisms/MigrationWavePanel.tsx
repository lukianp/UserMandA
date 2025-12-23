/**
 * MigrationWavePanel Component
 *
 * Displays migration waves with statistics, entity assignments,
 * and wave management controls.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  Waves,
  Plus,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Check,
  AlertTriangle,
  Clock,
  Users,
  Package,
  Server,
  Trash2,
  Edit2,
  RefreshCw,
  Target,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';

// Wave status configurations
const WAVE_STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.FC<{ size?: number; className?: string }>;
}> = {
  DRAFT: {
    label: 'Draft',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    icon: Edit2
  },
  PROPOSED: {
    label: 'Proposed',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    icon: Target
  },
  APPROVED: {
    label: 'Approved',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    icon: Check
  },
  SCHEDULED: {
    label: 'Scheduled',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    icon: Clock
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: Play
  },
  PAUSED: {
    label: 'Paused',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: Pause
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    icon: CheckCircle
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    icon: XCircle
  },
};

// Go/No-Go status configurations
const GO_NOGO_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.FC<{ size?: number; className?: string }>;
}> = {
  GO: {
    label: 'Go',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircle
  },
  NO_GO: {
    label: 'No-Go',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: XCircle
  },
  PENDING: {
    label: 'Pending',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: AlertCircle
  },
};

interface MigrationWave {
  id: string;
  name: string;
  description?: string;
  status: string;
  sourceProfileId: string;
  targetProfileId: string;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface WaveSummary {
  wave: MigrationWave;
  totalEntities: number;
  entitiesByType: Record<string, number>;
  entitiesByStatus: Record<string, number>;
  avgReadinessScore: number;
  avgRiskScore: number;
  blockers: Array<{ entityId: string; reason: string }>;
  goNoGoStatus: 'GO' | 'NO_GO' | 'PENDING';
  criteriaMet: number;
  criteriaTotal: number;
}

interface WaveSuggestion {
  suggestedWaveName: string;
  suggestedOrder: number;
  entityIds: string[];
  rationale: string;
  estimatedDuration: string;
  risks: string[];
}

interface MigrationWavePanelProps {
  /** Wave summaries to display */
  waves: WaveSummary[];
  /** Suggestions from AI */
  suggestions?: WaveSuggestion[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Selected wave ID */
  selectedWaveId?: string;
  /** Callback when wave is selected */
  onWaveSelect?: (waveId: string) => void;
  /** Callback to create new wave */
  onCreateWave?: () => void;
  /** Callback to edit wave */
  onEditWave?: (waveId: string) => void;
  /** Callback to delete wave */
  onDeleteWave?: (waveId: string) => void;
  /** Callback to start wave */
  onStartWave?: (waveId: string) => void;
  /** Callback to pause wave */
  onPauseWave?: (waveId: string) => void;
  /** Callback to complete wave */
  onCompleteWave?: (waveId: string) => void;
  /** Callback to generate suggestions */
  onGenerateSuggestions?: () => void;
  /** Callback to apply suggestion */
  onApplySuggestion?: (suggestion: WaveSuggestion) => void;
  /** Callback to refresh data */
  onRefresh?: () => void;
  /** Custom class name */
  className?: string;
}

// Single wave card component
const WaveCard: React.FC<{
  summary: WaveSummary;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onComplete?: () => void;
}> = ({
  summary,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onEdit,
  onDelete,
  onStart,
  onPause,
  onComplete,
}) => {
  const { wave, totalEntities, avgReadinessScore, avgRiskScore, blockers, goNoGoStatus, criteriaMet, criteriaTotal } = summary;
  const statusConfig = WAVE_STATUS_CONFIG[wave.status] || WAVE_STATUS_CONFIG.DRAFT;
  const goNoGoConfig = GO_NOGO_CONFIG[goNoGoStatus] || GO_NOGO_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const GoNoGoIcon = goNoGoConfig.icon;

  return (
    <div
      className={clsx(
        'border rounded-lg transition-all',
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 bg-white'
          : 'border-gray-200 bg-white hover:border-gray-300'
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={onSelect}
      >
        {/* Expand/Collapse */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {isExpanded ? (
            <ChevronDown size={16} className="text-gray-500" />
          ) : (
            <ChevronRight size={16} className="text-gray-500" />
          )}
        </button>

        {/* Wave Icon */}
        <div className={clsx('p-2 rounded-lg', statusConfig.bgColor)}>
          <Waves size={20} className={statusConfig.color} />
        </div>

        {/* Wave Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{wave.name}</h3>
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              statusConfig.bgColor,
              statusConfig.color
            )}>
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>{totalEntities} entities</span>
            <span>•</span>
            <span>Readiness: {Math.round(avgReadinessScore * 100)}%</span>
            {blockers.length > 0 && (
              <>
                <span>•</span>
                <span className="text-red-500">{blockers.length} blockers</span>
              </>
            )}
          </div>
        </div>

        {/* Go/No-Go Badge */}
        <div className={clsx(
          'flex items-center gap-1 px-3 py-1.5 rounded-lg',
          goNoGoConfig.bgColor
        )}>
          <GoNoGoIcon size={16} className={goNoGoConfig.color} />
          <span className={clsx('text-sm font-medium', goNoGoConfig.color)}>
            {goNoGoConfig.label}
          </span>
          <span className={clsx('text-xs', goNoGoConfig.color)}>
            ({criteriaMet}/{criteriaTotal})
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4">
          {/* Description */}
          {wave.description && (
            <p className="text-sm text-gray-600 mb-4">{wave.description}</p>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{totalEntities}</div>
              <div className="text-xs text-gray-500">Entities</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(avgReadinessScore * 100)}%
              </div>
              <div className="text-xs text-gray-500">Readiness</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {Math.round(avgRiskScore * 100)}%
              </div>
              <div className="text-xs text-gray-500">Risk</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{blockers.length}</div>
              <div className="text-xs text-gray-500">Blockers</div>
            </div>
          </div>

          {/* Entity Type Breakdown */}
          {Object.keys(summary.entitiesByType).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Entity Types</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.entitiesByType).map(([type, count]) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                  >
                    {type}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Blockers */}
          {blockers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                <AlertTriangle size={14} />
                Blockers
              </h4>
              <ul className="space-y-1">
                {blockers.slice(0, 5).map((blocker, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                    {blocker.reason}
                  </li>
                ))}
                {blockers.length > 5 && (
                  <li className="text-sm text-gray-500 italic">
                    +{blockers.length - 5} more blockers
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Schedule */}
          {(wave.scheduledStartDate || wave.scheduledEndDate) && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Clock size={14} />
                Schedule
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {wave.scheduledStartDate && (
                  <span>Start: {new Date(wave.scheduledStartDate).toLocaleDateString()}</span>
                )}
                {wave.scheduledEndDate && (
                  <span>End: {new Date(wave.scheduledEndDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
            {wave.status === 'DRAFT' && onStart && (
              <Button variant="primary" size="sm" onClick={onStart}>
                <Play size={14} className="mr-1" />
                Start
              </Button>
            )}
            {wave.status === 'IN_PROGRESS' && onPause && (
              <Button variant="secondary" size="sm" onClick={onPause}>
                <Pause size={14} className="mr-1" />
                Pause
              </Button>
            )}
            {wave.status === 'PAUSED' && onStart && (
              <Button variant="primary" size="sm" onClick={onStart}>
                <Play size={14} className="mr-1" />
                Resume
              </Button>
            )}
            {(wave.status === 'IN_PROGRESS' || wave.status === 'PAUSED') && onComplete && (
              <Button variant="success" size="sm" onClick={onComplete}>
                <Check size={14} className="mr-1" />
                Complete
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit2 size={14} />
              </Button>
            )}
            {onDelete && wave.status === 'DRAFT' && (
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Suggestion card component
const SuggestionCard: React.FC<{
  suggestion: WaveSuggestion;
  onApply?: () => void;
}> = ({ suggestion, onApply }) => {
  return (
    <div className="border border-dashed border-indigo-300 rounded-lg p-4 bg-indigo-50/50">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Sparkles size={20} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900">{suggestion.suggestedWaveName}</h3>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
              Suggested
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{suggestion.rationale}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <span>{suggestion.entityIds.length} entities</span>
            <span>•</span>
            <span>Est. duration: {suggestion.estimatedDuration}</span>
            <span>•</span>
            <span>Order: #{suggestion.suggestedOrder}</span>
          </div>
          {suggestion.risks.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {suggestion.risks.map((risk, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs">
                  {risk}
                </span>
              ))}
            </div>
          )}
          {onApply && (
            <Button variant="primary" size="sm" onClick={onApply}>
              <Check size={14} className="mr-1" />
              Apply Suggestion
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const MigrationWavePanel: React.FC<MigrationWavePanelProps> = ({
  waves,
  suggestions = [],
  loading = false,
  error,
  selectedWaveId,
  onWaveSelect,
  onCreateWave,
  onEditWave,
  onDeleteWave,
  onStartWave,
  onPauseWave,
  onCompleteWave,
  onGenerateSuggestions,
  onApplySuggestion,
  onRefresh,
  className,
}) => {
  const [expandedWaveIds, setExpandedWaveIds] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Toggle wave expansion
  const toggleExpanded = useCallback((waveId: string) => {
    setExpandedWaveIds(prev => {
      const next = new Set(prev);
      if (next.has(waveId)) {
        next.delete(waveId);
      } else {
        next.add(waveId);
      }
      return next;
    });
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const total = waves.length;
    const inProgress = waves.filter(w => w.wave.status === 'IN_PROGRESS').length;
    const completed = waves.filter(w => w.wave.status === 'COMPLETED').length;
    const totalEntities = waves.reduce((sum, w) => sum + w.totalEntities, 0);
    const goCount = waves.filter(w => w.goNoGoStatus === 'GO').length;

    return { total, inProgress, completed, totalEntities, goCount };
  }, [waves]);

  if (error) {
    return (
      <div className={clsx('flex flex-col items-center justify-center p-8', className)}>
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Waves</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="secondary">
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Waves size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Migration Waves</h2>
            <p className="text-sm text-gray-500">
              {stats.total} waves • {stats.totalEntities} entities • {stats.goCount} ready
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onGenerateSuggestions && (
            <Button variant="secondary" size="sm" onClick={onGenerateSuggestions} disabled={loading}>
              <Sparkles size={16} className="mr-1" />
              Suggest Waves
            </Button>
          )}
          {onCreateWave && (
            <Button variant="primary" size="sm" onClick={onCreateWave}>
              <Plus size={16} className="mr-1" />
              Create Wave
            </Button>
          )}
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && waves.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Suggestions Section */}
            {suggestions.length > 0 && showSuggestions && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-500" />
                    AI Suggestions
                  </h3>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Hide
                  </button>
                </div>
                <div className="space-y-3">
                  {suggestions.map((suggestion, idx) => (
                    <SuggestionCard
                      key={idx}
                      suggestion={suggestion}
                      onApply={onApplySuggestion ? () => onApplySuggestion(suggestion) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Waves List */}
            {waves.length === 0 ? (
              <div className="text-center py-12">
                <Waves size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Migration Waves</h3>
                <p className="text-gray-500 mb-4">
                  Create your first migration wave to start planning your migration.
                </p>
                {onCreateWave && (
                  <Button variant="primary" onClick={onCreateWave}>
                    <Plus size={16} className="mr-1" />
                    Create Wave
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {waves
                  .sort((a, b) => a.wave.priority - b.wave.priority)
                  .map(summary => (
                    <WaveCard
                      key={summary.wave.id}
                      summary={summary}
                      isSelected={selectedWaveId === summary.wave.id}
                      isExpanded={expandedWaveIds.has(summary.wave.id)}
                      onSelect={() => onWaveSelect?.(summary.wave.id)}
                      onToggleExpand={() => toggleExpanded(summary.wave.id)}
                      onEdit={onEditWave ? () => onEditWave(summary.wave.id) : undefined}
                      onDelete={onDeleteWave ? () => onDeleteWave(summary.wave.id) : undefined}
                      onStart={onStartWave ? () => onStartWave(summary.wave.id) : undefined}
                      onPause={onPauseWave ? () => onPauseWave(summary.wave.id) : undefined}
                      onComplete={onCompleteWave ? () => onCompleteWave(summary.wave.id) : undefined}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationWavePanel;

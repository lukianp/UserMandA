/**
 * Go/No-Go Checkpoint View
 *
 * Decision gates for wave approval with:
 * - Checkpoint criteria evaluation (technical, business, security, compliance)
 * - Automatic and manual evaluation support
 * - Go/No-Go/Defer decision workflow
 * - Escalation routing
 * - Decision history and audit trail
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Play,
  X,
  Calendar,
  FileText,
  TrendingUp,
  Lock,
  Building,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

import { Button } from '../../components/atoms/Button';
import type {
  GoNoGoCheckpoint,
  CheckpointCriteria,
  CriteriaStatus,
  CriteriaCategory,
  CheckpointDecisionStatus,
} from '../../types/models/migration';

/**
 * Criteria Status Badge Component
 */
interface CriteriaStatusBadgeProps {
  status: CriteriaStatus;
}

const CriteriaStatusBadge: React.FC<CriteriaStatusBadgeProps> = ({ status }) => {
  const styles = {
    NotEvaluated: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      icon: Clock,
    },
    Pass: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      icon: CheckCircle2,
    },
    Fail: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      icon: XCircle,
    },
    Warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: AlertTriangle,
    },
    Waived: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-300',
      icon: Shield,
    },
  };

  const style = styles[status];
  const Icon = style.icon;

  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', style.bg, style.text)}>
      <Icon size={12} />
      {status}
    </span>
  );
};

/**
 * Category Icon Component
 */
const getCategoryIcon = (category: CriteriaCategory) => {
  const icons = {
    Technical: Zap,
    Business: Building,
    Security: Lock,
    Compliance: Shield,
  };
  return icons[category] || FileText;
};

/**
 * Criteria Card Component
 */
interface CriteriaCardProps {
  criteria: CheckpointCriteria;
  onEvaluate: (criteriaId: string) => void;
  onWaive: (criteriaId: string) => void;
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({ criteria, onEvaluate, onWaive }) => {
  const Icon = getCategoryIcon(criteria.category);
  const isEvaluated = criteria.status !== 'NotEvaluated';
  const canWaive = criteria.status === 'Fail' || criteria.status === 'Warning';

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Icon size={20} className="text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{criteria.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{criteria.description}</p>
          </div>
        </div>
        <CriteriaStatusBadge status={criteria.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Category</p>
          <p className="font-medium text-gray-900 dark:text-white">{criteria.category}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Evaluation Type</p>
          <p className="font-medium text-gray-900 dark:text-white">{criteria.evaluationType}</p>
        </div>
      </div>

      {isEvaluated && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <User size={12} />
            <span>Evaluated by {criteria.evaluatedBy || 'System'}</span>
            {criteria.evaluatedAt && (
              <>
                <span>•</span>
                <Clock size={12} />
                <span>{format(new Date(criteria.evaluatedAt), 'MMM dd, HH:mm')}</span>
              </>
            )}
          </div>
          {criteria.notes && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded p-2">
              {criteria.notes}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {!isEvaluated && criteria.evaluationType === 'Manual' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onEvaluate(criteria.id)}
          >
            Evaluate
          </Button>
        )}
        {canWaive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onWaive(criteria.id)}
          >
            Request Waiver
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Decision Panel Component
 */
interface DecisionPanelProps {
  checkpoint: GoNoGoCheckpoint;
  canMakeDecision: boolean;
  onDecision: (decision: 'Go' | 'NoGo' | 'Deferred') => void;
}

const DecisionPanel: React.FC<DecisionPanelProps> = ({ checkpoint, canMakeDecision, onDecision }) => {
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState<'Go' | 'NoGo' | 'Deferred' | null>(null);

  const passedCriteria = checkpoint.criteria.filter(c => c.status === 'Pass' || c.status === 'Waived').length;
  const totalCriteria = checkpoint.criteria.length;
  const failedCriteria = checkpoint.criteria.filter(c => c.status === 'Fail').length;
  const pendingCriteria = checkpoint.criteria.filter(c => c.status === 'NotEvaluated').length;

  const recommendGo = checkpoint.allCriteriaMustPass
    ? failedCriteria === 0 && pendingCriteria === 0
    : passedCriteria >= totalCriteria * 0.8;

  const handleDecisionClick = (decision: 'Go' | 'NoGo' | 'Deferred') => {
    setShowConfirm(decision);
  };

  const handleConfirm = () => {
    if (showConfirm) {
      onDecision(showConfirm);
      setShowConfirm(null);
      setNotes('');
    }
  };

  return (
    <div className="rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Decision Panel
      </h3>

      {/* Criteria Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{passedCriteria}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Passed</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{failedCriteria}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Failed</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{pendingCriteria}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Pending</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalCriteria}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total</p>
        </div>
      </div>

      {/* Recommendation */}
      {recommendGo ? (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
          <CheckCircle2 size={20} />
          <p className="text-sm font-medium">All criteria met - Recommended to proceed</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
          <AlertTriangle size={20} />
          <p className="text-sm font-medium">
            {failedCriteria > 0 ? `${failedCriteria} criteria failed` : `${pendingCriteria} criteria pending`} - Review required
          </p>
        </div>
      )}

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Decision Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Enter decision notes and rationale..."
          disabled={!canMakeDecision}
        />
      </div>

      {/* Decision Buttons */}
      {!showConfirm ? (
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            icon={<Play size={18} />}
            onClick={() => handleDecisionClick('Go')}
            disabled={!canMakeDecision}
            className="flex-1"
          >
            GO - Proceed
          </Button>
          <Button
            variant="danger"
            size="lg"
            icon={<X size={18} />}
            onClick={() => handleDecisionClick('NoGo')}
            disabled={!canMakeDecision}
            className="flex-1"
          >
            NO-GO - Block
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={<Clock size={18} />}
            onClick={() => handleDecisionClick('Deferred')}
            disabled={!canMakeDecision}
            className="flex-1"
          >
            DEFER - Postpone
          </Button>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
            Confirm Decision: <span className="font-bold">{showConfirm}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleConfirm}>
              Confirm
            </Button>
            <Button variant="ghost" onClick={() => setShowConfirm(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Go/No-Go Checkpoint View
 */
export const GoNoGoCheckpointView: React.FC = () => {
  const [checkpoint, setCheckpoint] = useState<GoNoGoCheckpoint>({
    id: 'checkpoint-1',
    waveId: 'wave-3',
    name: 'Wave 3 Pre-Migration Checkpoint',
    description: 'Pre-migration readiness assessment for Finance department wave',
    checkpointType: 'PreMigration',
    createdAt: new Date('2024-03-14'),
    criteria: [
      {
        id: 'crit-1',
        name: 'Source Mailboxes Backed Up',
        description: 'All source mailboxes have been backed up to ensure data recovery capability',
        category: 'Technical',
        evaluationType: 'Automatic',
        evaluationScript: 'Test-MailboxBackupStatus',
        status: 'Pass',
        evaluatedAt: new Date('2024-03-14T10:30:00'),
        evaluatedBy: 'System',
        notes: 'All 3,200 mailboxes successfully backed up to Azure Blob Storage',
      },
      {
        id: 'crit-2',
        name: 'Target Licenses Assigned',
        description: 'All target users have been assigned appropriate M365 licenses',
        category: 'Technical',
        evaluationType: 'Automatic',
        evaluationScript: 'Test-LicenseAssignment',
        status: 'Pass',
        evaluatedAt: new Date('2024-03-14T11:00:00'),
        evaluatedBy: 'System',
        notes: 'All 3,200 E3 licenses assigned',
      },
      {
        id: 'crit-3',
        name: 'Network Connectivity Verified',
        description: 'Network connectivity between source and target environments has been verified',
        category: 'Technical',
        evaluationType: 'Automatic',
        evaluationScript: 'Test-NetworkConnectivity',
        status: 'Pass',
        evaluatedAt: new Date('2024-03-14T11:15:00'),
        evaluatedBy: 'System',
        notes: 'Bandwidth test: 850 Mbps average, Latency: 12ms',
      },
      {
        id: 'crit-4',
        name: 'User Communications Sent',
        description: 'All affected users have been notified of the upcoming migration',
        category: 'Business',
        evaluationType: 'Manual',
        status: 'Warning',
        evaluatedAt: new Date('2024-03-14T14:00:00'),
        evaluatedBy: 'Sarah Johnson',
        notes: '95% delivered, 150 users bounced - retrying',
      },
      {
        id: 'crit-5',
        name: 'Change Freeze Confirmed',
        description: 'IT change freeze has been confirmed for the migration window',
        category: 'Business',
        evaluationType: 'Manual',
        status: 'Fail',
        evaluatedAt: new Date('2024-03-14T15:00:00'),
        evaluatedBy: 'Michael Brown',
        notes: 'CAB approval still pending - meeting scheduled for tomorrow',
      },
      {
        id: 'crit-6',
        name: 'Security Scan Completed',
        description: 'Security vulnerability scan has been completed on target environment',
        category: 'Security',
        evaluationType: 'Automatic',
        evaluationScript: 'Invoke-SecurityScan',
        status: 'Pass',
        evaluatedAt: new Date('2024-03-14T12:00:00'),
        evaluatedBy: 'System',
        notes: 'No critical vulnerabilities detected',
      },
      {
        id: 'crit-7',
        name: 'Compliance Review Approved',
        description: 'Legal and compliance teams have approved the migration approach',
        category: 'Compliance',
        evaluationType: 'Manual',
        status: 'NotEvaluated',
      },
      {
        id: 'crit-8',
        name: 'Rollback Plan Documented',
        description: 'Detailed rollback procedures have been documented and tested',
        category: 'Technical',
        evaluationType: 'Manual',
        status: 'Pass',
        evaluatedAt: new Date('2024-03-13T16:00:00'),
        evaluatedBy: 'David Wilson',
        notes: 'Rollback plan reviewed and approved by engineering team',
      },
    ],
    allCriteriaMustPass: false,
    status: 'InReview',
    escalationRequired: false,
  });

  const [selectedCategory, setSelectedCategory] = useState<CriteriaCategory | 'All'>('All');

  const categories: Array<CriteriaCategory | 'All'> = ['All', 'Technical', 'Business', 'Security', 'Compliance'];

  const filteredCriteria = selectedCategory === 'All'
    ? checkpoint.criteria
    : checkpoint.criteria.filter(c => c.category === selectedCategory);

  const handleEvaluate = (criteriaId: string) => {
    console.log('[GoNoGoCheckpointView] Evaluate criteria:', criteriaId);
    // Open evaluation dialog
  };

  const handleWaive = (criteriaId: string) => {
    console.log('[GoNoGoCheckpointView] Request waiver for criteria:', criteriaId);
    // Open waiver request dialog
  };

  const handleDecision = (decision: 'Go' | 'NoGo' | 'Deferred') => {
    console.log('[GoNoGoCheckpointView] Decision made:', decision);
    setCheckpoint({
      ...checkpoint,
      status: decision === 'Go' ? 'Go' : decision === 'NoGo' ? 'NoGo' : 'Deferred',
      decidedAt: new Date(),
      decidedBy: 'Current User',
    });
  };

  const canMakeDecision = checkpoint.status === 'Pending' || checkpoint.status === 'InReview';

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{checkpoint.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{checkpoint.description}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className={clsx(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium',
            checkpoint.status === 'Go' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
            checkpoint.status === 'NoGo' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
            checkpoint.status === 'InReview' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
            checkpoint.status === 'Pending' && 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
          )}>
            {checkpoint.status}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Category:</span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={clsx(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Criteria Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCriteria.map((criteria) => (
            <CriteriaCard
              key={criteria.id}
              criteria={criteria}
              onEvaluate={handleEvaluate}
              onWaive={handleWaive}
            />
          ))}
        </div>

        {/* Decision Panel */}
        <DecisionPanel
          checkpoint={checkpoint}
          canMakeDecision={canMakeDecision}
          onDecision={handleDecision}
        />

        {/* History Section */}
        {checkpoint.decidedAt && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Decision History
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Decided by {checkpoint.decidedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{format(new Date(checkpoint.decidedAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </div>
            {checkpoint.notes && (
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                {checkpoint.notes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoNoGoCheckpointView;



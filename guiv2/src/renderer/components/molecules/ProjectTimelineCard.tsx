/**
 * ProjectTimelineCard Component
 *
 * Displays project timeline, wave progress, and cutover countdown.
 * Shows current phase, days to milestones, and overall progress.
 *
 * Phase 6: Dashboard UI Components
 */

import React from 'react';
import { Calendar, Clock, TrendingUp, Target } from 'lucide-react';

import { ModernCard } from '../atoms/ModernCard';
import { Badge } from '../atoms/Badge';
import type { ProjectTimeline } from '../../types/dashboard';

interface ProjectTimelineCardProps {
  project: ProjectTimeline;
  className?: string;
}

/**
 * Get badge variant based on project phase
 */
const getPhaseVariant = (phase: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  switch (phase) {
    case 'Complete':
      return 'success';
    case 'Migration':
    case 'Cutover':
      return 'warning';
    case 'Planning':
    case 'Discovery':
      return 'info';
    case 'Validation':
      return 'primary';
    default:
      return 'default';
  }
};

/**
 * ProjectTimelineCard Component
 *
 * Comprehensive project timeline display with:
 * - Project name and current phase
 * - Countdown to cutover and next wave
 * - Wave completion progress
 * - Overall progress bar
 */
export const ProjectTimelineCard: React.FC<ProjectTimelineCardProps> = ({ project, className }) => {
  const progressPercentage = project.totalWaves > 0
    ? Math.round((project.completedWaves / project.totalWaves) * 100)
    : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <ModernCard className={className} hoverable={false}>
      {/* Header: Project Name & Phase */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {project.projectName}
          </h2>
          <Badge variant={getPhaseVariant(project.currentPhase)} size="md">
            {project.currentPhase}
          </Badge>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Target className="w-4 h-4" />
            <span>Target: {formatDate(project.targetCutover)}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Days to Cutover */}
        <div className="text-center p-4 rounded-lg bg-[var(--card-bg-secondary)]">
          <div className="text-4xl font-bold text-[var(--accent-primary)] mb-1">
            {project.daysToCutover}
          </div>
          <div className="text-sm text-[var(--text-secondary)] flex items-center justify-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Days to Cutover</span>
          </div>
        </div>

        {/* Days to Next Wave */}
        <div className="text-center p-4 rounded-lg bg-[var(--card-bg-secondary)]">
          <div className="text-4xl font-bold text-[var(--warning)] mb-1">
            {project.daysToNextWave}
          </div>
          <div className="text-sm text-[var(--text-secondary)] flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Days to Next Wave</span>
          </div>
        </div>

        {/* Wave Completion */}
        <div className="text-center p-4 rounded-lg bg-[var(--card-bg-secondary)]">
          <div className="text-4xl font-bold text-[var(--success)] mb-1">
            {project.completedWaves}/{project.totalWaves}
          </div>
          <div className="text-sm text-[var(--text-secondary)] flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Waves Completed</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)]">Overall Progress</span>
          <span className="font-medium text-[var(--text-primary)]">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-[var(--card-bg-secondary)] rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full h-3 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Additional Info */}
      {project.projectDescription && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-secondary)]">
            {project.projectDescription}
          </p>
        </div>
      )}
    </ModernCard>
  );
};

export default ProjectTimelineCard;

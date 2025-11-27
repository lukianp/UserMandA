/**
 * QuickActionsPanel Component
 *
 * Provides quick navigation buttons for common tasks.
 * Includes Start Discovery, Run Migration, View Reports, and Settings.
 *
 * Phase 6: Dashboard UI Components
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, FileText, Settings, Download, Search, Users } from 'lucide-react';

import { ModernCard } from '../atoms/ModernCard';
import { Button } from '../atoms/Button';

interface QuickActionsPanelProps {
  className?: string;
}

/**
 * QuickActionsPanel Component
 *
 * Quick action buttons for:
 * - Starting discovery
 * - Running migrations
 * - Viewing reports
 * - Accessing settings
 * - Navigating to key views
 */
export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <ModernCard className={className} hoverable={false}>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Quick Actions
      </h3>

      <div className="space-y-2">
        {/* Start Discovery */}
        <Button
          variant="primary"
          className="w-full justify-start"
          onClick={() => navigate('/discovery')}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Discovery
        </Button>

        {/* Run Migration */}
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => navigate('/migration')}
        >
          <Download className="w-4 h-4 mr-2" />
          Run Migration
        </Button>

        {/* View Users */}
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => navigate('/users')}
        >
          <Users className="w-4 h-4 mr-2" />
          View Users
        </Button>

        {/* View Reports */}
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => navigate('/reports')}
        >
          <FileText className="w-4 h-4 mr-2" />
          View Reports
        </Button>

        {/* Settings */}
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </ModernCard>
  );
};

export default QuickActionsPanel;

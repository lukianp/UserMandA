/**
 * Teams Migration View
 *
 * Microsoft Teams workload migration interface with:
 * - Teams inventory with members, channels, and apps
 * - Channel mapping and configuration
 * - Tab and app migration options
 * - Files migration (linked to SharePoint)
 * - Membership sync options
 * - Archive vs active team handling
 * - Meeting history migration
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Hash,
  FileText,
  Settings,
  Calendar,
  PlayCircle,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
} from 'lucide-react';
import { clsx } from 'clsx';

import { Button } from '../../components/atoms/Button';

/**
 * Team Item Component
 */
interface TeamItemProps {
  team: {
    id: string;
    name: string;
    description: string;
    isArchived: boolean;
    memberCount: number;
    channelCount: number;
    fileCount: number;
    hasApps: boolean;
    hasMeetings: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const TeamItem: React.FC<TeamItemProps> = ({ team, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={clsx(
      'rounded-lg border p-4 cursor-pointer transition-all',
      isSelected
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
    )}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2 flex-1">
        <MessageSquare className="h-5 w-5 text-violet-600 flex-shrink-0" />
        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{team.name}</h3>
      </div>
      {team.isArchived && (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          Archived
        </span>
      )}
    </div>

    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
      {team.description || 'No description'}
    </p>

    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-1">
        <Users size={12} />
        <span>{team.memberCount} members</span>
      </div>
      <div className="flex items-center gap-1">
        <Hash size={12} />
        <span>{team.channelCount} channels</span>
      </div>
      <div className="flex items-center gap-1">
        <FileText size={12} />
        <span>{team.fileCount} files</span>
      </div>
      {team.hasApps && (
        <div className="flex items-center gap-1">
          <Settings size={12} />
          <span>Has apps</span>
        </div>
      )}
    </div>
  </div>
);

/**
 * Migration Options Panel Component
 */
interface MigrationOptionsPanelProps {
  options: {
    migrateChannels: boolean;
    migrateTabs: boolean;
    migrateApps: boolean;
    migrateFiles: boolean;
    migrateMembership: boolean;
    migrateMeetingHistory: boolean;
    preservePermissions: boolean;
    archiveSource: boolean;
  };
  onOptionsChange: (options: any) => void;
}

const MigrationOptionsPanel: React.FC<MigrationOptionsPanelProps> = ({ options, onOptionsChange }) => {
  const handleToggle = (key: keyof typeof options) => {
    onOptionsChange({
      ...options,
      [key]: !options[key],
    });
  };

  const optionsList = [
    { key: 'migrateChannels' as const, label: 'Migrate Channels', description: 'Copy all public and private channels' },
    { key: 'migrateTabs' as const, label: 'Migrate Tabs', description: 'Migrate tabs within channels' },
    { key: 'migrateApps' as const, label: 'Migrate Apps', description: 'Reinstall team apps in target' },
    { key: 'migrateFiles' as const, label: 'Migrate Files', description: 'Copy all files from SharePoint' },
    { key: 'migrateMembership' as const, label: 'Migrate Membership', description: 'Add all members to target team' },
    { key: 'migrateMeetingHistory' as const, label: 'Migrate Meeting History', description: 'Copy meeting recordings and notes' },
    { key: 'preservePermissions' as const, label: 'Preserve Permissions', description: 'Maintain channel-level permissions' },
    { key: 'archiveSource' as const, label: 'Archive Source Team', description: 'Archive source team after migration' },
  ];

  return (
    <div className="space-y-3">
      {optionsList.map((option) => (
        <label
          key={option.key}
          className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            checked={options[option.key]}
            onChange={() => handleToggle(option.key)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
          </div>
        </label>
      ))}
    </div>
  );
};

/**
 * Teams Migration View
 */
export const TeamsMigrationView: React.FC = () => {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [migrationOptions, setMigrationOptions] = useState({
    migrateChannels: true,
    migrateTabs: true,
    migrateApps: true,
    migrateFiles: true,
    migrateMembership: true,
    migrateMeetingHistory: false,
    preservePermissions: true,
    archiveSource: false,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const mockTeams = [
    {
      id: '1',
      name: 'Finance Team',
      description: 'Finance department collaboration space',
      isArchived: false,
      memberCount: 45,
      channelCount: 8,
      fileCount: 1250,
      hasApps: true,
      hasMeetings: true,
    },
    {
      id: '2',
      name: 'Marketing',
      description: 'Marketing campaigns and content planning',
      isArchived: false,
      memberCount: 32,
      channelCount: 12,
      fileCount: 850,
      hasApps: true,
      hasMeetings: true,
    },
    {
      id: '3',
      name: 'Sales - EMEA',
      description: 'European sales team',
      isArchived: false,
      memberCount: 78,
      channelCount: 15,
      fileCount: 2100,
      hasApps: true,
      hasMeetings: true,
    },
    {
      id: '4',
      name: 'IT Support (Archived)',
      description: 'Legacy IT support team - archived 2023',
      isArchived: true,
      memberCount: 12,
      channelCount: 5,
      fileCount: 340,
      hasApps: false,
      hasMeetings: false,
    },
    {
      id: '5',
      name: 'Executive Leadership',
      description: 'Executive team workspace',
      isArchived: false,
      memberCount: 8,
      channelCount: 4,
      fileCount: 125,
      hasApps: false,
      hasMeetings: true,
    },
  ];

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeams.length === mockTeams.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(mockTeams.map((t) => t.id));
    }
  };

  const handleStartMigration = () => {
    console.log('[TeamsMigrationView] Starting migration for teams:', selectedTeams);
    console.log('[TeamsMigrationView] Migration options:', migrationOptions);
    setIsRunning(true);
    // Simulate progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 1000);
  };

  const handleExportConfig = () => {
    console.log('[TeamsMigrationView] Export configuration');
  };

  const selectedTeamObjects = mockTeams.filter((t) => selectedTeams.includes(t.id));
  const totalMembers = selectedTeamObjects.reduce((sum, t) => sum + t.memberCount, 0);
  const totalChannels = selectedTeamObjects.reduce((sum, t) => sum + t.channelCount, 0);
  const totalFiles = selectedTeamObjects.reduce((sum, t) => sum + t.fileCount, 0);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg">
            <MessageSquare size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams Migration</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Migrate Microsoft Teams, channels, and content
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" icon={<Download size={18} />} onClick={handleExportConfig}>
            Export Config
          </Button>
          <Button
            variant="primary"
            icon={<PlayCircle size={18} />}
            onClick={handleStartMigration}
            disabled={selectedTeams.length === 0 || isRunning}
          >
            {isRunning ? 'Migrating...' : 'Start Migration'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Left Panel - Teams List */}
          <div className="lg:col-span-2 p-6 border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Source Teams ({mockTeams.length})
              </h2>
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                {selectedTeams.length === mockTeams.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            {/* Selected Summary */}
            {selectedTeams.length > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  {selectedTeams.length} team{selectedTeams.length > 1 ? 's' : ''} selected
                </p>
                <div className="grid grid-cols-3 gap-4 text-xs text-blue-700 dark:text-blue-300">
                  <div>
                    <Users size={14} className="inline mr-1" />
                    {totalMembers} members
                  </div>
                  <div>
                    <Hash size={14} className="inline mr-1" />
                    {totalChannels} channels
                  </div>
                  <div>
                    <FileText size={14} className="inline mr-1" />
                    {totalFiles} files
                  </div>
                </div>
              </div>
            )}

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockTeams.map((team) => (
                <TeamItem
                  key={team.id}
                  team={team}
                  isSelected={selectedTeams.includes(team.id)}
                  onSelect={() => handleTeamSelect(team.id)}
                />
              ))}
            </div>
          </div>

          {/* Right Panel - Migration Options */}
          <div className="p-6 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Migration Options
            </h2>

            <MigrationOptionsPanel
              options={migrationOptions}
              onOptionsChange={setMigrationOptions}
            />

            {/* Progress Section */}
            {isRunning && (
              <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-900 dark:text-green-100">
                    Migration in progress...
                  </span>
                  <span className="text-sm font-bold text-green-900 dark:text-green-100">
                    {progress}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-green-200 dark:bg-green-900">
                  <div
                    className="h-2 rounded-full bg-green-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Migration Notes
              </h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Guest users will need to be re-invited</li>
                <li>• Custom apps require reinstallation</li>
                <li>• Meeting recordings may take longer to transfer</li>
                <li>• Private channels require owner permissions</li>
                <li>• Some tabs (e.g., Planner) need manual reconfiguration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsMigrationView;



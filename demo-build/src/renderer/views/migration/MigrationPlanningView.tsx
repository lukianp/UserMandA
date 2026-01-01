/**
 * Migration Planning View
 *
 * Provides a comprehensive interface for planning migration waves including:
 * - Creating and editing waves
 * - Scheduling and prioritization
 * - Wave duplication and deletion
 * - Search and filtering
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Plus, Edit, Trash2, Copy, Calendar, AlertCircle, FileSearch, Users, GitBranch, CheckCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { clsx } from 'clsx';

import { useMigrationPlanningLogic } from '../../hooks/useMigrationPlanningLogic';
import { useMigrationAnalysisLogic } from '../../hooks/useMigrationAnalysisLogic';
import { useMigrationStore } from '../../store/useMigrationStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { SearchBar } from '../../components/molecules/SearchBar';
import { Select } from '../../components/atoms/Select';
import { Badge } from '../../components/atoms/Badge';
import type { MigrationPriority, MigrationWave } from '../../types/models/migration';

/**
 * Wave Drop Zone Component
 * Accepts dragged items (users, computers, groups) and adds them to the wave
 */
interface WaveDropZoneProps {
  wave: MigrationWave;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDrop: (item: any, waveId: string) => Promise<void>;
}

const WaveDropZone: React.FC<WaveDropZoneProps> = ({
  wave,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onDrop,
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['USER', 'COMPUTER', 'GROUP'],
    drop: async (item: any) => {
      await onDrop(item, wave.id);
    },
    canDrop: (item: any) => {
      // Check if item already in wave
      const isAlreadyInWave = wave.tasks?.some((t) => t.id === item.id);
      return !isAlreadyInWave;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      NotStarted: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      Planning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      Planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      Validating: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      Ready: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      InProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      Paused: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      CompletedWithWarnings: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      Failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      Cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      RolledBack: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      Skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return statusColors[status] || statusColors.NotStarted;
  };

  return (
    <div
      ref={drop as any}
      onClick={onSelect}
      className={clsx(
        'p-4 border rounded-lg cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm',
        canDrop && 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        isOver && canDrop && 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-105 shadow-lg',
        isOver && !canDrop && 'border-red-500 bg-red-50 dark:bg-red-900/20'
      )}
      data-cy={`wave-dropzone-${wave.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex-1">{wave.name}</h3>
        <div className="flex gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Edit wave"
            data-cy="edit-wave-btn" data-testid="edit-wave-btn"
          >
            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Duplicate wave"
          >
            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-200 dark:hover:bg-red-900/50 rounded transition-colors"
            title="Delete wave"
            data-cy="delete-wave-btn" data-testid="delete-wave-btn"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {wave.description || 'No description'}
      </p>

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mb-2">
        <Calendar className="w-3 h-3" />
        <span>
          {wave.plannedStartDate
            ? format(new Date(wave.plannedStartDate), 'MMM dd, yyyy')
            : 'Not scheduled'}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(wave.status)}`}>
          {wave.status}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-500">Priority: {wave.priority}</span>
      </div>

      {/* Drop hint */}
      {isOver && canDrop && (
        <div className="text-center text-green-600 dark:text-green-400 font-medium text-sm py-2 border-t border-green-300 dark:border-green-700">
          ✓ Drop to add to this wave
        </div>
      )}
      {isOver && !canDrop && (
        <div className="text-center text-red-600 dark:text-red-400 font-medium text-sm py-2 border-t border-red-300 dark:border-red-700">
          ✗ Item already in this wave
        </div>
      )}

      {/* Items preview */}
      {wave.tasks && wave.tasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {wave.tasks.length} item{wave.tasks.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-1">
            {wave.tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="text-xs p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-between"
              >
                <span className="truncate">{task.name}</span>
                <span className="text-gray-400 ml-2">{task.type}</span>
              </div>
            ))}
            {wave.tasks.length > 3 && (
              <div className="text-xs text-gray-500 text-center">+{wave.tasks.length - 3} more</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MigrationPlanningView: React.FC = () => {
  const {
    waves,
    selectedWave,
    isLoading,
    error,
    searchText,
    setSearchText,
    showWaveForm,
    setShowWaveForm,
    formData,
    handleFieldChange,
    handleCreateWave,
    handleUpdateWave,
    handleEditWave,
    handleDeleteWave,
    handleDuplicateWave,
    handleCancelForm,
    handleSelectWave,
    isEditing,
    canSave,
  } = useMigrationPlanningLogic();

  const {
    complexityScores,
    isAnalyzing,
    analyzeUsers,
    getComplexityScore,
    getComplexityStats,
  } = useMigrationAnalysisLogic();

  const { addItemToWave, loadWaves } = useMigrationStore();
  const { showSuccess, showError, showInfo } = useNotificationStore();

  // Local state for UI features
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [groupMappings, setGroupMappings] = useState<Record<string, string>>({});
  const [targetGroups, setTargetGroups] = useState<Array<{ value: string; label: string }>>([]);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
  const [showGroupRemapping, setShowGroupRemapping] = useState(false);

  // Load target groups on mount (mock data for now)
  useEffect(() => {
    // In production, load from Logic Engine or API
    setTargetGroups([
      { value: 'group1', label: 'Domain Admins (Target)' },
      { value: 'group2', label: 'IT Support (Target)' },
      { value: 'group3', label: 'Finance Team (Target)' },
      { value: 'group4', label: 'HR Department (Target)' },
    ]);
  }, []);

  // Calculate discovery analysis stats
  const discoveryStats = {
    totalUsers: 0, // Would come from Logic Engine
    analyzedUsers: getComplexityStats().total,
    highComplexityCount: getComplexityStats().high,
    readyToMigrateCount: getComplexityStats().low,
  };

  // Handle item drop on wave
  const handleItemDrop = useCallback(
    async (item: any, waveId: string) => {
      try {
        // Show loading toast
        showInfo('Adding item to wave...');

        // Create migration task from dropped item
        const task = {
          id: item.id,
          type: item.type,
          name: item.data.displayName || item.data.name || item.id,
          source: item.type === 'USER' ? 'ActiveDirectory' : item.type === 'COMPUTER' ? 'Infrastructure' : 'Group',
          metadata: item.data,
        };

        // Call IPC handler to add item to wave
        const result = await window.electronAPI.invoke('migration:add-item-to-wave', {
          waveId,
          item: task,
        });

        if (result.success) {
          // Refresh waves to get updated data
          await loadWaves();

          // Success toast
          showSuccess(`Added ${task.name} to wave`);
        } else {
          throw new Error(result.error || 'Failed to add item to wave');
        }
      } catch (error: any) {
        console.error('Failed to add item to wave:', error);
        showError(`Failed to add item: ${error.message}`);
      }
    },
    [loadWaves, showSuccess, showError, showInfo]
  );

  // Bulk operation handlers
  const handleAnalyzeSelected = useCallback(async () => {
    if (selectedUsers.length === 0) {
      showError('No users selected for analysis');
      return;
    }

    showInfo(`Analyzing complexity for ${selectedUsers.length} users...`);

    try {
      const userIds = selectedUsers.map(u => u.id || u.userPrincipalName);
      await analyzeUsers(userIds);
      showSuccess(`Complexity analysis complete for ${selectedUsers.length} users`);
    } catch (err: any) {
      showError(`Analysis failed: ${err.message}`);
    }
  }, [selectedUsers, analyzeUsers, showSuccess, showError, showInfo]);

  const handleAssignToWave = useCallback(async () => {
    if (selectedUsers.length === 0) {
      showError('No users selected to assign');
      return;
    }

    if (!selectedWave) {
      showError('No wave selected');
      return;
    }

    showInfo(`Assigning ${selectedUsers.length} users to wave...`);

    try {
      for (const user of selectedUsers) {
        await handleItemDrop({ id: user.id, type: 'USER', data: user }, selectedWave.id);
      }
      showSuccess(`Assigned ${selectedUsers.length} users to wave`);
      setSelectedUsers([]);
    } catch (err: any) {
      showError(`Assignment failed: ${err.message}`);
    }
  }, [selectedUsers, selectedWave, handleItemDrop, showSuccess, showError, showInfo]);

  const handleRemapGroups = useCallback(() => {
    if (selectedUsers.length === 0) {
      showError('No users selected for group remapping');
      return;
    }

    setShowGroupRemapping(true);
    showInfo('Configure group mappings for selected users');
  }, [selectedUsers, showError, showInfo]);

  const handleValidateSelection = useCallback(async () => {
    if (selectedUsers.length === 0) {
      showError('No users selected for validation');
      return;
    }

    showInfo('Validating selected users for migration...');

    try {
      // Perform validation checks
      const issues: string[] = [];

      selectedUsers.forEach(user => {
        if (!user.mail) {
          issues.push(`${user.displayName}: Missing email address`);
        }
        if (!user.department) {
          issues.push(`${user.displayName}: Missing department`);
        }
      });

      if (issues.length > 0) {
        showError(`Validation found ${issues.length} issues. Review user details.`);
        console.warn('Validation issues:', issues);
      } else {
        showSuccess('All selected users passed validation checks');
      }
    } catch (err: any) {
      showError(`Validation failed: ${err.message}`);
    }
  }, [selectedUsers, showSuccess, showError, showInfo]);

  const updateGroupMapping = useCallback((userId: string, targetGroup: string) => {
    setGroupMappings(prev => ({
      ...prev,
      [userId]: targetGroup
    }));
  }, []);

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      NotStarted: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      Planning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      Planned: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      Validating: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      Ready: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      InProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      Paused: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      CompletedWithWarnings: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      Failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      Cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      RolledBack: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      Skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    };
    return statusColors[status] || statusColors.NotStarted;
  };

  const formatDateForInput = (dateValue: Date | string | null | undefined): string => {
    if (!dateValue) return '';
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="h-full flex flex-col" data-cy="migration-planning-view" data-testid="migration-planning-view">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Migration Planning
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Plan and organize migration waves for your M&A project
          </p>
        </div>
        <Button
          onClick={() => setShowWaveForm(true)}
          icon={<Plus className="w-4 h-4" />}
          data-cy="create-wave-btn" data-testid="create-wave-btn"
        >
          Create Wave
        </Button>
      </div>

      {/* Instructions */}
      <div className="mx-4 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>💡 Tip:</strong> Drag users, computers, or groups from their respective views and drop
          them onto a wave below to add them to that migration wave.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Discovery Data Analysis Panel */}
      {showAnalysisPanel && (
        <div className="mx-4 mt-4 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Discovery Analysis
            </h2>
            <button
              onClick={() => setShowAnalysisPanel(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{discoveryStats.totalUsers}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Analyzed</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{discoveryStats.analyzedUsers}</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">High Complexity</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{discoveryStats.highComplexityCount}</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ready to Migrate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{discoveryStats.readyToMigrateCount}</p>
            </div>
          </div>

          {/* Bulk Operations */}
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleAnalyzeSelected}
              disabled={isAnalyzing || selectedUsers.length === 0}
              loading={isAnalyzing}
              variant="primary"
              size="sm"
            >
              <FileSearch className="w-4 h-4 mr-2" />
              Analyze Selected ({selectedUsers.length})
            </Button>
            <Button
              onClick={handleAssignToWave}
              disabled={selectedUsers.length === 0 || !selectedWave}
              variant="primary"
              size="sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Assign to Wave
            </Button>
            <Button
              onClick={handleRemapGroups}
              disabled={selectedUsers.length === 0}
              variant="secondary"
              size="sm"
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Remap Groups
            </Button>
            <Button
              onClick={handleValidateSelection}
              disabled={selectedUsers.length === 0}
              variant="secondary"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate Selection
            </Button>
          </div>
        </div>
      )}

      {/* Group Remapping Interface */}
      {showGroupRemapping && selectedUsers.length > 0 && (
        <div className="mx-4 mt-4 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Group Remapping</h2>
            <button
              onClick={() => setShowGroupRemapping(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="w-48 truncate text-sm text-gray-900 dark:text-gray-100">
                  {user.displayName || user.name}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <Select
                  value={groupMappings[user.id] || ''}
                  onChange={(value) => updateGroupMapping(user.id, value)}
                  options={targetGroups}
                  placeholder="Map to target group..."
                  className="flex-1"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => {
                showSuccess('Group mappings saved');
                setShowGroupRemapping(false);
              }}
              variant="primary"
            >
              Save Mappings
            </Button>
            <Button
              onClick={() => {
                setGroupMappings({});
                setShowGroupRemapping(false);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex gap-4 p-4 overflow-hidden bg-gray-50 dark:bg-gray-950">
        {/* Left Panel - Wave List */}
        <div className="w-1/3 flex flex-col gap-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            placeholder="Search waves..."
            data-cy="wave-search" data-testid="wave-search"
          />

          {isLoading && waves.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Loading waves...
            </div>
          ) : waves.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p className="mb-2">No migration waves yet</p>
              <p className="text-sm">Click "Create Wave" to get started</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2">
              {waves.map((wave) => (
                <WaveDropZone
                  key={wave.id}
                  wave={wave}
                  isSelected={selectedWave?.id === wave.id}
                  onSelect={() => handleSelectWave(wave)}
                  onEdit={() => handleEditWave(wave)}
                  onDuplicate={() => handleDuplicateWave(wave.id)}
                  onDelete={() => handleDeleteWave(wave.id)}
                  onDrop={handleItemDrop}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Wave Form or Details */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
          {showWaveForm ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {isEditing ? 'Edit Migration Wave' : 'Create New Migration Wave'}
              </h2>

              <Input
                label="Wave Name"
                value={formData.name || ''}
                onChange={(value) => handleFieldChange('name', value)}
                placeholder="e.g., Executive Team Migration"
                required
                fullWidth
                data-cy="wave-name-input" data-testid="wave-name-input"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all duration-200"
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Detailed description of this migration wave..."
                  data-cy="wave-description-input" data-testid="wave-description-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date & Time"
                  type="datetime-local"
                  value={formatDateForInput(formData.plannedStartDate)}
                  onChange={(e) => handleFieldChange('plannedStartDate', new Date(e.target.value).toISOString())
                  }
                  fullWidth
                  data-cy="wave-start-input" data-testid="wave-start-input"
                />
                <Input
                  label="End Date & Time"
                  type="datetime-local"
                  value={formatDateForInput(formData.plannedEndDate)}
                  onChange={(e) => handleFieldChange('plannedEndDate', new Date(e.target.value).toISOString())
                  }
                  fullWidth
                  data-cy="wave-end-input" data-testid="wave-end-input"
                />
              </div>

              <Select
                label="Priority"
                value={formData.priority || 'Normal'}
                onChange={(value) => handleFieldChange('priority', value as MigrationPriority)}
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Normal', label: 'Normal' },
                  { value: 'High', label: 'High' },
                  { value: 'Critical', label: 'Critical' },
                ]}
                data-cy="wave-priority-input" data-testid="wave-priority-input"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           transition-all duration-200"
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder="Additional notes or instructions..."
                  data-cy="wave-notes-input" data-testid="wave-notes-input"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={isEditing ? handleUpdateWave : handleCreateWave}
                  disabled={!canSave || isLoading}
                  loading={isLoading}
                  data-cy="save-wave-btn" data-testid="save-wave-btn"
                >
                  {isEditing ? 'Update Wave' : 'Create Wave'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancelForm}
                  disabled={isLoading}
                  data-cy="cancel-wave-btn" data-testid="cancel-wave-btn"
                >
                  Cancel
                </Button>
              </div>

              {!canSave && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Please ensure a wave name is provided and both source and target profiles are
                  selected
                </p>
              )}
            </div>
          ) : selectedWave ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {selectedWave.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedWave.status
                    )}`}
                  >
                    {selectedWave.status}
                  </span>
                </div>
                <Button onClick={() => handleEditWave(selectedWave)} icon={<Edit className="w-4 h-4" />}>
                  Edit Wave
                </Button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedWave.description || 'No description provided'}
              </p>

              <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                    Planned Start
                  </span>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedWave.plannedStartDate
                      ? format(new Date(selectedWave.plannedStartDate), 'PPpp')
                      : 'Not scheduled'}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                    Planned End
                  </span>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedWave.plannedEndDate
                      ? format(new Date(selectedWave.plannedEndDate), 'PPpp')
                      : 'Not scheduled'}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                    Priority
                  </span>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedWave.priority}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Order</span>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    Wave {selectedWave.order}
                  </div>
                </div>
              </div>

              {selectedWave.notes && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {selectedWave.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedWave.batches?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Batches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedWave.tasks?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedWave.totalItems || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Items</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <Calendar className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg mb-2">No wave selected</p>
              <p className="text-sm">Select a wave from the list or create a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MigrationPlanningView;



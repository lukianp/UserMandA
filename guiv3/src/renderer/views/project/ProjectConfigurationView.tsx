/**
 * Project Configuration View
 *
 * Complete project management interface with wave scheduling, timeline management,
 * and project configuration editing.
 *
 * Features:
 * - Project details editing (name, status, cutover date)
 * - Wave management (create, view, delete, update status)
 * - Timeline calculations (days to cutover, next wave)
 * - Real-time data persistence to Project.json
 */

import React, { useState } from 'react';
import {
  Save,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

import { useProjectLogic } from '../../hooks/useProjectLogic';
import { ModernCard } from '../../components/atoms/ModernCard';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Select } from '../../components/atoms/Select';
import { Badge } from '../../components/atoms/Badge';
import { Spinner } from '../../components/atoms/Spinner';
import type { ProjectConfig, WaveConfig, WaveStatus, ProjectStatus } from '../../types/project';

export const ProjectConfigurationView: React.FC = () => {
  const {
    project,
    daysToCutover,
    daysToNextWave,
    isLoading,
    error,
    saveProject,
    addWave,
    updateWaveStatus,
    deleteWave,
  } = useProjectLogic();

  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<ProjectConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddWave, setShowAddWave] = useState(false);
  const [newWave, setNewWave] = useState<Partial<WaveConfig>>({
    name: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    userCount: 0,
    groupCount: 0,
    computerCount: 0,
  });

  // Loading state
  if (isLoading) {
    return (
    <div className="flex items-center justify-center h-full" data-testid="project-configuration-view" data-cy="project-configuration-view">
        <Spinner size="lg" />
        <span className="ml-3 text-lg">Loading project configuration...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ModernCard variant="default">
          <div className="flex items-center text-red-500">
            <AlertCircle className="w-6 h-6 mr-3" />
            <div>
              <h3 className="font-semibold text-lg">Error Loading Project</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </ModernCard>
      </div>
    );
  }

  // No project state
  if (!project) {
    return (
      <div className="p-6">
        <ModernCard variant="default">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Project Configuration Found</h3>
            <p className="text-gray-400">
              Please select a profile to create a project configuration.
            </p>
          </div>
        </ModernCard>
      </div>
    );
  }

  // Edit handlers
  const handleEdit = () => {
    setEditedProject({ ...project });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedProject) return;

    try {
      setIsSaving(true);
      await saveProject(editedProject);
      setIsEditing(false);
      setEditedProject(null);
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProject(null);
    setIsEditing(false);
  };

  // Wave handlers
  const handleAddWave = async () => {
    if (!newWave.name || !newWave.scheduledDate) {
      alert('Please provide a wave name and scheduled date');
      return;
    }

    const wave: WaveConfig = {
      id: crypto.randomUUID(),
      name: newWave.name,
      description: newWave.description || '',
      scheduledDate: new Date(newWave.scheduledDate).toISOString(),
      status: 'Scheduled',
      userCount: newWave.userCount || 0,
      groupCount: newWave.groupCount || 0,
      computerCount: newWave.computerCount || 0,
    };

    try {
      await addWave(wave);
      setShowAddWave(false);
      setNewWave({
        name: '',
        description: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        userCount: 0,
        groupCount: 0,
        computerCount: 0,
      });
    } catch (err: any) {
      alert(`Failed to add wave: ${err.message}`);
    }
  };

  const handleDeleteWave = async (waveId: string) => {
    if (confirm('Are you sure you want to delete this wave?')) {
      try {
        await deleteWave(waveId);
      } catch (err: any) {
        alert(`Failed to delete wave: ${err.message}`);
      }
    }
  };

  const handleUpdateWaveStatus = async (waveId: string, status: WaveStatus) => {
    try {
      await updateWaveStatus(waveId, status);
    } catch (err: any) {
      alert(`Failed to update wave status: ${err.message}`);
    }
  };

  const currentProject = isEditing ? editedProject : project;
  if (!currentProject) return null;

  // Status badge colors
  const getStatusBadgeVariant = (status: WaveStatus) => {
    switch (status) {
      case 'Complete':
        return 'success';
      case 'InProgress':
        return 'warning';
      case 'Failed':
        return 'danger';
      case 'Cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Project Configuration</h1>
          <p className="text-gray-400 mt-1">
            Manage project timeline, waves, and settings
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit} variant="primary">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant="secondary" disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} variant="primary" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Timeline Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernCard variant="metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Days to Cutover</p>
              <p className="text-3xl font-bold mt-1">{daysToCutover}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(currentProject.targetCutover).toLocaleDateString()}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-primary opacity-50" />
          </div>
        </ModernCard>

        <ModernCard variant="metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Next Wave In</p>
              <p className="text-3xl font-bold mt-1">{daysToNextWave}</p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </div>
            <Clock className="w-12 h-12 text-warning opacity-50" />
          </div>
        </ModernCard>

        <ModernCard variant="metric">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Project Status</p>
              <p className="text-2xl font-bold mt-1">{currentProject.status}</p>
              <p className="text-xs text-gray-500 mt-1">
                {currentProject.waves.length} waves
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-success opacity-50" />
          </div>
        </ModernCard>
      </div>

      {/* Project Details */}
      <ModernCard
        header={<h2 className="text-xl font-semibold">Project Details</h2>}
        variant="default"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Project Name"
            value={currentProject.name}
            onChange={(e) =>
              isEditing &&
              setEditedProject({
                ...currentProject,
                name: e.target.value,
              })
            }
            disabled={!isEditing}
            fullWidth
          />

          <Select
            label="Project Status"
            value={currentProject.status}
            onChange={(value) =>
              isEditing &&
              setEditedProject({
                ...currentProject,
                status: value as ProjectStatus,
              })
            }
            options={[
              { value: 'Planning', label: 'Planning' },
              { value: 'Active', label: 'Active' },
              { value: 'Paused', label: 'Paused' },
              { value: 'Complete', label: 'Complete' },
              { value: 'Archived', label: 'Archived' },
            ]}
            disabled={!isEditing}
          />

          <Input
            label="Target Cutover Date"
            type="date"
            value={currentProject.targetCutover.split('T')[0]}
            onChange={(e) =>
              isEditing &&
              setEditedProject({
                ...currentProject,
                targetCutover: new Date(e.target.value).toISOString(),
              })
            }
            disabled={!isEditing}
            fullWidth
          />

          <Input
            label="Estimated Duration (days)"
            type="number"
            value={currentProject.estimatedDuration}
            onChange={(e) =>
              isEditing &&
              setEditedProject({
                ...currentProject,
                estimatedDuration: parseInt(e.target.value) || 0,
              })
            }
            disabled={!isEditing}
            fullWidth
          />

          <Input
            label="Source Profile"
            value={currentProject.sourceProfile.name}
            disabled
            fullWidth
          />

          <Input
            label="Target Profile"
            value={currentProject.targetProfile.name}
            onChange={(e) =>
              isEditing &&
              setEditedProject({
                ...currentProject,
                targetProfile: {
                  ...currentProject.targetProfile,
                  name: e.target.value,
                },
              })
            }
            disabled={!isEditing}
            fullWidth
          />
        </div>
      </ModernCard>

      {/* Wave Management */}
      <ModernCard
        header={
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Migration Waves</h2>
            <Button
              onClick={() => setShowAddWave(!showAddWave)}
              variant="secondary"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Wave
            </Button>
          </div>
        }
        variant="default"
      >
        {/* Add Wave Form */}
        {showAddWave && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Create New Wave</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Wave Name"
                value={newWave.name}
                onChange={(e) => setNewWave({ ...newWave, name: e.target.value })}
                placeholder="e.g., Wave 1 - Sales Team"
                fullWidth
              />

              <Input
                label="Scheduled Date"
                type="date"
                value={newWave.scheduledDate}
                onChange={(e) => setNewWave({ ...newWave, scheduledDate: e.target.value })}
                fullWidth
              />

              <div className="md:col-span-2">
                <Input
                  label="Description"
                  value={newWave.description}
                  onChange={(e) => setNewWave({ ...newWave, description: e.target.value })}
                  placeholder="Optional description"
                  fullWidth
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                <Button
                  onClick={() => setShowAddWave(false)}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddWave} variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Wave
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Wave List */}
        {currentProject.waves && currentProject.waves.length > 0 ? (
          <div className="space-y-3">
            {currentProject.waves
              .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
              .map((wave) => (
                <div
                  key={wave.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{wave.name}</p>
                      {wave.description && (
                        <p className="text-sm text-gray-400 mt-1">{wave.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span>
                          Scheduled: {new Date(wave.scheduledDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{wave.userCount} users</span>
                        <span>•</span>
                        <span>{wave.groupCount} groups</span>
                        <span>•</span>
                        <span>{wave.computerCount} computers</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <Badge variant={getStatusBadgeVariant(wave.status)}>
                      {wave.status}
                    </Badge>

                    {/* Status Update Buttons */}
                    <div className="flex gap-2">
                      {wave.status === 'Scheduled' && (
                        <Button
                          onClick={() => handleUpdateWaveStatus(wave.id, 'InProgress')}
                          variant="secondary"
                          size="sm"
                        >
                          Start
                        </Button>
                      )}
                      {wave.status === 'InProgress' && (
                        <Button
                          onClick={() => handleUpdateWaveStatus(wave.id, 'Complete')}
                          variant="primary"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>

                    {/* Delete Button */}
                    <Button
                      onClick={() => handleDeleteWave(wave.id)}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-16 h-16 mx-auto opacity-50 mb-4" />
            <p className="text-lg">No waves scheduled</p>
            <p className="text-sm mt-2">Click "Add Wave" to create your first migration wave</p>
          </div>
        )}
      </ModernCard>
    </div>
  );
};

export default ProjectConfigurationView;

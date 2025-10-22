/**
 * Migration Planning Dialog
 *
 * UI for creating and managing migration plans with wave-based organization
 */

import React, { useState, useEffect } from 'react';

import { useMigrationPlanning } from '../../hooks/useMigrationPlanning';
import { useProfileStore } from '../../store/useProfileStore';
import LoadingSpinner from '../atoms/LoadingSpinner';
import type { MigrationPlan, MigrationWave } from '../../hooks/useMigrationPlanning';

import { Modal } from './Modal';
import { MigrationWaveEditor } from './MigrationWaveEditor';


interface MigrationPlanningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: string;
}

export const MigrationPlanningDialog: React.FC<MigrationPlanningDialogProps> = ({
  isOpen,
  onClose,
  initialPlanId
}) => {
  const { selectedSourceProfile } = useProfileStore();
  const { state, loadPlans, createPlan, addWave, deletePlan, setActivePlan } = useMigrationPlanning();

  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedWave, setSelectedWave] = useState<MigrationWave | null>(null);
  const [showWaveEditor, setShowWaveEditor] = useState(false);

  // Load plans when profile changes
  useEffect(() => {
    if (selectedSourceProfile && isOpen) {
      loadPlans(selectedSourceProfile.companyName);
    }
  }, [selectedSourceProfile, isOpen, loadPlans]);

  // Set active plan from initialPlanId
  useEffect(() => {
    if (initialPlanId && state.plans.length > 0) {
      const plan = state.plans.find(p => p.id === initialPlanId);
      if (plan) {
        setActivePlan(plan);
        setViewMode('edit');
      }
    }
  }, [initialPlanId, state.plans, setActivePlan]);

  const handleCreatePlan = async () => {
    if (!selectedSourceProfile) {
      alert('Please select a source profile first');
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter a plan name');
      return;
    }

    try {
      const plan = await createPlan({
        profileName: selectedSourceProfile.companyName,
        name: formData.name,
        description: formData.description
      });

      setActivePlan(plan);
      setFormData({ name: '', description: '' });
      setViewMode('edit');
    } catch (error: any) {
      alert(`Failed to create plan: ${error.message}`);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this migration plan?')) {
      return;
    }

    try {
      await deletePlan(planId);
      if (state.activePlan?.id === planId) {
        setViewMode('list');
      }
    } catch (error: any) {
      alert(`Failed to delete plan: ${error.message}`);
    }
  };

  const handleAddWave = async (waveData: any) => {
    if (!state.activePlan) return;

    try {
      await addWave(state.activePlan.id, waveData);
      setShowWaveEditor(false);
    } catch (error: any) {
      alert(`Failed to add wave: ${error.message}`);
    }
  };

  const handleClose = () => {
    setViewMode('list');
    setFormData({ name: '', description: '' });
    setActivePlan(null);
    onClose();
  };

  const renderPlanList = () => (
    <div className="space-y-4">
      {state.plans.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No migration plans found</p>
          <p className="text-sm">Create a new plan to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {state.plans.map(plan => (
            <div
              key={plan.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setActivePlan(plan);
                setViewMode('edit');
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{plan.waves.length} waves</span>
                    <span>Created {new Date(plan.created).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDeletePlan(plan.id);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setViewMode('create')}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        Create New Plan
      </button>
    </div>
  );

  const renderCreateForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="Q1 2024 Migration"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the migration plan objectives and scope"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => setViewMode('list')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleCreatePlan}
          disabled={state.isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {state.isLoading ? 'Creating...' : 'Create Plan'}
        </button>
      </div>
    </div>
  );

  const renderPlanEditor = () => {
    if (!state.activePlan) return null;

    const totalUsers = state.activePlan.waves.reduce((sum, wave) => sum + wave.users.length, 0);
    const completedWaves = state.activePlan.waves.filter(w => w.status === 'completed').length;
    const inProgressWaves = state.activePlan.waves.filter(w => w.status === 'inprogress').length;

    return (
      <div className="space-y-6">
        {/* Plan Header */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900">{state.activePlan.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{state.activePlan.description}</p>
          <div className="flex items-center space-x-6 mt-3 text-sm">
            <div>
              <span className="text-gray-500">Waves:</span>{' '}
              <span className="font-medium">{state.activePlan.waves.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Users:</span>{' '}
              <span className="font-medium">{totalUsers}</span>
            </div>
            <div>
              <span className="text-gray-500">Completed:</span>{' '}
              <span className="font-medium">{completedWaves}</span>
            </div>
            <div>
              <span className="text-gray-500">In Progress:</span>{' '}
              <span className="font-medium">{inProgressWaves}</span>
            </div>
          </div>
        </div>

        {/* Waves List */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">Migration Waves</h4>
            <button
              onClick={() => setShowWaveEditor(true)}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Add Wave
            </button>
          </div>

          {state.activePlan.waves.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
              <p>No waves created yet</p>
              <p className="text-sm">Add your first wave to begin planning</p>
            </div>
          ) : (
            <div className="space-y-2">
              {state.activePlan.waves
                .sort((a, b) => a.priority - b.priority)
                .map(wave => (
                  <div
                    key={wave.id}
                    className={`p-4 border rounded-lg ${
                      wave.status === 'completed'
                        ? 'bg-green-50 border-green-200'
                        : wave.status === 'inprogress'
                          ? 'bg-blue-50 border-blue-200'
                          : wave.status === 'failed'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            Priority {wave.priority}
                          </span>
                          <h4 className="font-medium text-gray-900">{wave.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{wave.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>
                            {new Date(wave.startDate).toLocaleDateString()} -{' '}
                            {new Date(wave.endDate).toLocaleDateString()}
                          </span>
                          <span>{wave.users.length} users</span>
                          {wave.dependencies.length > 0 && (
                            <span>{wave.dependencies.length} dependencies</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            wave.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : wave.status === 'inprogress'
                                ? 'bg-blue-100 text-blue-800'
                                : wave.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {wave.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={
          viewMode === 'list'
            ? 'Migration Plans'
            : viewMode === 'create'
              ? 'Create Migration Plan'
              : `Edit Plan: ${state.activePlan?.name || ''}`
        }
        size="lg"
      >
        <div className="space-y-4">
          {/* Loading Indicator */}
          {state.isLoading && (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-gray-600">Loading...</span>
            </div>
          )}

          {/* Error Display */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{state.error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Content Based on View Mode */}
          {!state.isLoading && (
            <>
              {viewMode === 'list' && renderPlanList()}
              {viewMode === 'create' && renderCreateForm()}
              {viewMode === 'edit' && renderPlanEditor()}
            </>
          )}

          {/* Actions */}
          {viewMode === 'edit' && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setViewMode('list')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Plans
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Wave Editor Dialog */}
      {showWaveEditor && state.activePlan && (
        <MigrationWaveEditor
          isOpen={showWaveEditor}
          onClose={() => setShowWaveEditor(false)}
          planId={state.activePlan.id}
          onSave={handleAddWave}
        />
      )}
    </>
  );
};

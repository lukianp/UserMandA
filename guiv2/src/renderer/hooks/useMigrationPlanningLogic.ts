/**
 * Migration Planning Logic Hook
 *
 * Manages wave planning functionality including:
 * - Wave creation, editing, deletion
 * - Wave duplication
 * - Form state management
 * - Search and filtering
 */

import { useState, useEffect, useMemo } from 'react';

import { useMigrationStore } from '../store/useMigrationStore';
import { useProfileStore } from '../store/useProfileStore';
import type { MigrationWave, MigrationPriority } from '../types/models/migration';

export const useMigrationPlanningLogic = () => {
  const {
    waves,
    selectedWaveId,
    isLoading,
    error,
    loadWaves,
    planWave,
    updateWave,
    deleteWave,
    setSelectedWave,
    duplicateWave,
  } = useMigrationStore();

  const { selectedSourceProfile, selectedTargetProfile } = useProfileStore();

  // Local form state
  const [formData, setFormData] = useState<Partial<MigrationWave>>({
    name: '',
    description: '',
    plannedStartDate: new Date().toISOString(),
    plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
    priority: 'Normal' as MigrationPriority,
    batches: [],
    tasks: [],
    notes: '',
    prerequisites: [],
  });

  const [searchText, setSearchText] = useState('');
  const [showWaveForm, setShowWaveForm] = useState(false);
  const [editingWaveId, setEditingWaveId] = useState<string | null>(null);

  // Load waves on mount
  useEffect(() => {
    loadWaves();
  }, [loadWaves]);

  // Filtered waves based on search text
  const filteredWaves = useMemo(() => {
    if (!searchText) return waves;
    const lower = searchText.toLowerCase();
    return waves.filter(
      w =>
        (w.name ?? '').toLowerCase().includes(lower) ||
        (w.description ?? '').toLowerCase().includes(lower) ||
        (w.status ?? '').toLowerCase().includes(lower)
    );
  }, [waves, searchText]);

  // Get selected wave object
  const selectedWave = useMemo(
    () => waves.find(w => w.id === selectedWaveId),
    [waves, selectedWaveId]
  );

  // Form handlers
  const handleFieldChange = (field: keyof MigrationWave, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateWave = async () => {
    if (!formData.name) {
      throw new Error('Wave name is required');
    }

    try {
      const waveId = await planWave(formData as Omit<MigrationWave, 'id' | 'createdAt'>);
      resetForm();
      setSelectedWave(waveId);
      setShowWaveForm(false);
    } catch (error) {
      console.error('Failed to create wave:', error);
      throw error;
    }
  };

  const handleUpdateWave = async () => {
    if (!editingWaveId) return;

    try {
      await updateWave(editingWaveId, formData);
      resetForm();
      setEditingWaveId(null);
      setShowWaveForm(false);
    } catch (error) {
      console.error('Failed to update wave:', error);
      throw error;
    }
  };

  const handleEditWave = (wave: MigrationWave) => {
    setFormData({
      name: wave.name,
      description: wave.description,
      plannedStartDate: wave.plannedStartDate,
      plannedEndDate: wave.plannedEndDate,
      priority: wave.priority,
      batches: wave.batches,
      tasks: wave.tasks,
      notes: wave.notes,
      prerequisites: wave.prerequisites,
    });
    setEditingWaveId(wave.id);
    setShowWaveForm(true);
  };

  const handleDeleteWave = async (id: string) => {
    if (confirm('Delete this migration wave? This cannot be undone.')) {
      try {
        await deleteWave(id);
        if (selectedWaveId === id) {
          setSelectedWave(null);
        }
      } catch (error) {
        console.error('Failed to delete wave:', error);
        throw error;
      }
    }
  };

  const handleDuplicateWave = async (id: string) => {
    try {
      const newWaveId = await duplicateWave(id);
      setSelectedWave(newWaveId);
    } catch (error) {
      console.error('Failed to duplicate wave:', error);
      throw error;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      plannedStartDate: new Date().toISOString(),
      plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'Normal' as MigrationPriority,
      batches: [],
      tasks: [],
      notes: '',
      prerequisites: [],
    });
    setEditingWaveId(null);
  };

  const handleCancelForm = () => {
    resetForm();
    setShowWaveForm(false);
  };

  const handleSelectWave = (wave: MigrationWave) => {
    setSelectedWave(wave.id);
  };

  return {
    // State
    waves: filteredWaves,
    selectedWave,
    isLoading,
    error,
    searchText,
    setSearchText,
    showWaveForm,
    setShowWaveForm,
    formData,

    // Form handlers
    handleFieldChange,
    handleCreateWave,
    handleUpdateWave,
    handleEditWave,
    handleDeleteWave,
    handleDuplicateWave,
    handleCancelForm,
    handleSelectWave,

    // Computed
    isEditing: !!editingWaveId,
    canSave: !!formData.name && !!selectedSourceProfile && !!selectedTargetProfile,
  };
};



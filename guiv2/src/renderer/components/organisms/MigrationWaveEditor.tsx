/**
 * Migration Wave Editor
 *
 * UI for creating and editing migration waves
 */

import React, { useState } from 'react';

import type { MigrationWave } from '../../hooks/useMigrationPlanning';

import { Modal } from './Modal';

interface MigrationWaveEditorProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  wave?: MigrationWave;
  onSave: (waveData: any) => Promise<void>;
}

export const MigrationWaveEditor: React.FC<MigrationWaveEditorProps> = ({
  isOpen,
  onClose,
  planId,
  wave,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: wave?.name || '',
    description: wave?.description || '',
    startDate: wave?.startDate ? wave.startDate.split('T')[0] : '',
    endDate: wave?.endDate ? wave.endDate.split('T')[0] : '',
    priority: wave?.priority || 1,
    dependencies: wave?.dependencies || []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError('Wave name is required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        priority: formData.priority,
        dependencies: formData.dependencies
      });

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      priority: 1,
      dependencies: []
    });
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={wave ? 'Edit Migration Wave' : 'Create Migration Wave'}
      size="md"
    >
      <div className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Wave Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wave Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Wave 1 - Executive Team"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the wave objectives and target users"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority (1 = Highest)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lower numbers have higher priority. Waves execute in priority order.
          </p>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> After creating the wave, you can assign users to it from the wave
            details view. Waves with dependencies will wait for dependent waves to complete before
            starting.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : wave ? 'Update Wave' : 'Create Wave'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

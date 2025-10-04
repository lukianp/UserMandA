/**
 * Filter Dialog Component
 * Advanced filtering UI with multiple criteria and presets
 */

import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Plus, Trash2, Save, RotateCcw } from 'lucide-react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Select from '../atoms/Select';

export interface FilterCriterion {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  criteria: FilterCriterion[];
}

export interface FilterDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close dialog handler */
  onClose: () => void;
  /** Apply filter handler */
  onApply: (criteria: FilterCriterion[]) => void;
  /** Available fields for filtering */
  fields: Array<{ value: string; label: string }>;
  /** Saved filter presets */
  presets?: FilterPreset[];
  /** Save preset handler */
  onSavePreset?: (name: string, criteria: FilterCriterion[]) => void;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * Filter Dialog Component
 */
const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  onApply,
  fields,
  presets = [],
  onSavePreset,
  'data-cy': dataCy = 'filter-dialog',
}) => {
  const [criteria, setCriteria] = useState<FilterCriterion[]>([
    { id: '1', field: '', operator: 'contains', value: '' },
  ]);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'lessThan', label: 'Less Than' },
  ];

  const addCriterion = () => {
    const newCriterion: FilterCriterion = {
      id: Date.now().toString(),
      field: '',
      operator: 'contains',
      value: '',
    };
    setCriteria([...criteria, newCriterion]);
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  const updateCriterion = (id: string, updates: Partial<FilterCriterion>) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleApply = () => {
    const validCriteria = criteria.filter((c) => c.field && c.value);
    onApply(validCriteria);
    onClose();
  };

  const handleReset = () => {
    setCriteria([{ id: '1', field: '', operator: 'contains', value: '' }]);
  };

  const handleSavePreset = () => {
    if (presetName && onSavePreset) {
      onSavePreset(presetName, criteria);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const loadPreset = (preset: FilterPreset) => {
    setCriteria(preset.criteria);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50" data-cy={dataCy}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Advanced Filters
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              data-cy="close-filter-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Presets */}
            {presets.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Saved Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => loadPreset(preset)}
                      className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      data-cy={`preset-${preset.id}`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Criteria */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Filter Criteria
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={addCriterion}
                  data-cy="add-criterion-btn"
                >
                  Add Criterion
                </Button>
              </div>

              {criteria.map((criterion, index) => (
                <div
                  key={criterion.id}
                  className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  data-cy={`criterion-${index}`}
                >
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <Select
                      label="Field"
                      value={criterion.field}
                      onChange={(value) => updateCriterion(criterion.id, { field: value })}
                      options={fields}
                      placeholder="Select field..."
                      data-cy={`criterion-field-${index}`}
                    />
                    <Select
                      label="Operator"
                      value={criterion.operator}
                      onChange={(value) =>
                        updateCriterion(criterion.id, {
                          operator: value as FilterCriterion['operator'],
                        })
                      }
                      options={operatorOptions}
                      data-cy={`criterion-operator-${index}`}
                    />
                    <Input
                      label="Value"
                      value={criterion.value}
                      onChange={(e) => updateCriterion(criterion.id, { value: e.target.value })}
                      placeholder="Enter value..."
                      data-cy={`criterion-value-${index}`}
                    />
                  </div>
                  {criteria.length > 1 && (
                    <button
                      onClick={() => removeCriterion(criterion.id)}
                      className="mt-8 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      data-cy={`remove-criterion-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Save Preset Section */}
            {onSavePreset && (
              <div className="mt-6">
                {!showSavePreset ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Save className="w-4 h-4" />}
                    onClick={() => setShowSavePreset(true)}
                    data-cy="show-save-preset-btn"
                  >
                    Save as Preset
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Preset name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      fullWidth
                      data-cy="preset-name-input"
                    />
                    <Button
                      variant="primary"
                      onClick={handleSavePreset}
                      disabled={!presetName}
                      data-cy="save-preset-btn"
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowSavePreset(false);
                        setPresetName('');
                      }}
                      data-cy="cancel-save-preset-btn"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              icon={<RotateCcw className="w-4 h-4" />}
              onClick={handleReset}
              data-cy="reset-filters-btn"
            >
              Reset
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose} data-cy="cancel-filter-btn">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleApply} data-cy="apply-filter-btn">
                Apply Filters
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default FilterDialog;

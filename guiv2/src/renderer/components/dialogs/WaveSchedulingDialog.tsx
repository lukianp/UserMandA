/**
 * Wave Scheduling Dialog Component
 *
 * Comprehensive scheduling dialog for migration waves with:
 * - Wave information and metadata
 * - Scheduling settings and concurrency
 * - Blackout period management
 * - Notification configuration
 * - Validation and preview
 *
 * Implements T-033 scheduling UI requirements from WPF version
 */

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  Bell,
  Plus,
  Trash2,
  Eye,
  Send,
  CheckCircle,
} from 'lucide-react';
import { format, addDays, isWeekend, isBefore, isAfter } from 'date-fns';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import Select from '../atoms/Select';

export interface BlackoutPeriod {
  id: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: 'BusinessHours' | 'MaintenanceWindow' | 'Holiday' | 'Custom';
  isRecurring: boolean;
}

export interface WaveScheduleData {
  // Basic wave information
  waveName: string;
  waveDescription: string;
  wavePriority: 'Low' | 'Normal' | 'High' | 'Critical';
  waveType: 'Users Only' | 'Files Only' | 'Mixed Content' | 'Full Migration';
  estimatedItems: number;
  dependencies: string[];

  // Scheduling settings
  scheduledDate: Date;
  scheduledTime: string;
  maxConcurrentTasks: number;
  retryCount: number;
  retryDelayMinutes: number;
  timeoutHours: number;

  // Advanced options
  skipWeekends: boolean;
  allowParallelBatches: boolean;
  continueOnFailure: boolean;

  // Notification settings
  sendPreMigrationNotifications: boolean;
  sendPostMigrationNotifications: boolean;
  sendProgressNotifications: boolean;
  preMigrationNotificationHours: number;
  notificationTemplateId?: string;
  additionalRecipients: string[];

  // Blackout periods
  blackoutPeriods: BlackoutPeriod[];
}

export interface WaveSchedulingDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close dialog handler */
  onClose: () => void;
  /** Schedule wave handler */
  onSchedule: (data: WaveScheduleData) => Promise<void>;
  /** Existing wave data to edit */
  wave?: Partial<WaveScheduleData> | null;
  /** Data attribute for testing */
  'data-cy'?: string;
}

/**
 * Wave Scheduling Dialog Component
 */
const WaveSchedulingDialog: React.FC<WaveSchedulingDialogProps> = ({
  isOpen,
  onClose,
  onSchedule,
  wave = null,
  'data-cy': dataCy = 'wave-scheduling-dialog',
}) => {
  const [formData, setFormData] = useState<WaveScheduleData>({
    waveName: `Wave-${format(new Date(), 'yyyyMMdd-HHmm')}`,
    waveDescription: 'Migration wave created via scheduler',
    wavePriority: 'Normal',
    waveType: 'Mixed Content',
    estimatedItems: 100,
    dependencies: [],
    scheduledDate: addDays(new Date(), 1),
    scheduledTime: '09:00',
    maxConcurrentTasks: 10,
    retryCount: 3,
    retryDelayMinutes: 30,
    timeoutHours: 8,
    skipWeekends: true,
    allowParallelBatches: true,
    continueOnFailure: false,
    sendPreMigrationNotifications: true,
    sendPostMigrationNotifications: true,
    sendProgressNotifications: false,
    preMigrationNotificationHours: 24,
    additionalRecipients: [],
    blackoutPeriods: [],
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'blackout' | 'notifications'>('info');

  // Load wave data when dialog opens
  useEffect(() => {
    if (isOpen && wave) {
      setFormData({ ...formData, ...wave });
    }
    setValidationErrors([]);
  }, [isOpen, wave]);

  // Time slot options (hourly intervals)
  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    value: `${i.toString().padStart(2, '0')}:00`,
    label: `${i.toString().padStart(2, '0')}:00`,
  }));

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Normal', label: 'Normal' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' },
  ];

  const waveTypeOptions = [
    { value: 'Users Only', label: 'Users Only' },
    { value: 'Files Only', label: 'Files Only' },
    { value: 'Mixed Content', label: 'Mixed Content' },
    { value: 'Full Migration', label: 'Full Migration' },
  ];

  const blackoutTypeOptions = [
    { value: 'BusinessHours', label: 'Business Hours' },
    { value: 'MaintenanceWindow', label: 'Maintenance Window' },
    { value: 'Holiday', label: 'Holiday' },
    { value: 'Custom', label: 'Custom' },
  ];

  const validate = (): boolean => {
    const errors: string[] = [];

    if (!formData.waveName.trim()) {
      errors.push('Wave name is required');
    }

    if (!formData.scheduledDate) {
      errors.push('Scheduled date is required');
    } else if (isBefore(formData.scheduledDate, new Date())) {
      errors.push('Scheduled date cannot be in the past');
    }

    if (!formData.scheduledTime) {
      errors.push('Scheduled time is required');
    }

    if (formData.maxConcurrentTasks <= 0) {
      errors.push('Max concurrent tasks must be greater than 0');
    }

    if (formData.retryCount < 0) {
      errors.push('Retry count cannot be negative');
    }

    if (formData.estimatedItems <= 0) {
      errors.push('Estimated items must be greater than 0');
    }

    // Check for blackout period conflicts
    const scheduledDateTime = combineDateTime(formData.scheduledDate, formData.scheduledTime);
    const conflictingPeriod = formData.blackoutPeriods.find(
      (bp) => isAfter(scheduledDateTime, bp.startTime) && isBefore(scheduledDateTime, bp.endTime)
    );

    if (conflictingPeriod) {
      errors.push(`Scheduled time conflicts with blackout period: ${conflictingPeriod.description}`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const combineDateTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  const handleSchedule = async () => {
    if (!validate()) return;

    setIsScheduling(true);
    try {
      await onSchedule(formData);
      onClose();
    } catch (error) {
      setValidationErrors([`Failed to schedule wave: ${error.message}`]);
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePreview = () => {
    if (!validate()) return;

    const scheduledDateTime = combineDateTime(formData.scheduledDate, formData.scheduledTime);
    const estimatedDuration = Math.ceil(formData.estimatedItems / 50); // Rough estimate: 50 items/hour

    setValidationErrors([
      `Preview: Wave '${formData.waveName}' scheduled for ${format(scheduledDateTime, 'PPpp')}`,
      `Estimated duration: ${estimatedDuration} hours`,
      `Max concurrent tasks: ${formData.maxConcurrentTasks}`,
      `Retry attempts: ${formData.retryCount}`,
    ]);
  };

  const addBlackoutPeriod = () => {
    const newPeriod: BlackoutPeriod = {
      id: crypto.randomUUID(),
      description: 'New Blackout Period',
      startTime: new Date(),
      endTime: addDays(new Date(), 1),
      type: 'MaintenanceWindow',
      isRecurring: false,
    };

    setFormData({
      ...formData,
      blackoutPeriods: [...formData.blackoutPeriods, newPeriod],
    });
  };

  const removeBlackoutPeriod = (id: string) => {
    setFormData({
      ...formData,
      blackoutPeriods: formData.blackoutPeriods.filter((bp) => bp.id !== id),
    });
  };

  const updateBlackoutPeriod = (id: string, updates: Partial<BlackoutPeriod>) => {
    setFormData({
      ...formData,
      blackoutPeriods: formData.blackoutPeriods.map((bp) =>
        bp.id === id ? { ...bp, ...updates } : bp
      ),
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Wave Name"
                value={formData.waveName}
                onChange={(e) => setFormData({ ...formData, waveName: e.target.value })}
                required
                data-cy="wave-name-input"
              />
              <Input
                label="Description"
                value={formData.waveDescription}
                onChange={(e) => setFormData({ ...formData, waveDescription: e.target.value })}
                data-cy="wave-description-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                value={formData.wavePriority}
                onChange={(value) => setFormData({ ...formData, wavePriority: value as any })}
                options={priorityOptions}
                required
                data-cy="wave-priority-select"
              />
              <Select
                label="Wave Type"
                value={formData.waveType}
                onChange={(value) => setFormData({ ...formData, waveType: value as any })}
                options={waveTypeOptions}
                required
                data-cy="wave-type-select"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Estimated Items"
                type="number"
                value={formData.estimatedItems.toString()}
                onChange={(e) => setFormData({ ...formData, estimatedItems: parseInt(e.target.value) || 0 })}
                required
                data-cy="wave-items-input"
              />
              <Input
                label="Dependencies (comma-separated Wave IDs)"
                value={formData.dependencies.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dependencies: e.target.value.split(',').map((d) => d.trim()).filter(Boolean),
                  })
                }
                data-cy="wave-dependencies-input"
              />
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Scheduled Date *
                </label>
                <input
                  type="date"
                  value={format(formData.scheduledDate, 'yyyy-MM-dd')}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  data-cy="wave-date-input"
                />
              </div>
              <Select
                label="Scheduled Time"
                value={formData.scheduledTime}
                onChange={(value) => setFormData({ ...formData, scheduledTime: value })}
                options={timeSlots}
                required
                data-cy="wave-time-select"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Concurrent Tasks"
                type="number"
                value={formData.maxConcurrentTasks.toString()}
                onChange={(e) => setFormData({ ...formData, maxConcurrentTasks: parseInt(e.target.value) || 10 })}
                required
                data-cy="wave-concurrent-input"
              />
              <Input
                label="Retry Count"
                type="number"
                value={formData.retryCount.toString()}
                onChange={(e) => setFormData({ ...formData, retryCount: parseInt(e.target.value) || 0 })}
                data-cy="wave-retry-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Retry Delay (minutes)"
                type="number"
                value={formData.retryDelayMinutes.toString()}
                onChange={(e) => setFormData({ ...formData, retryDelayMinutes: parseInt(e.target.value) || 0 })}
                data-cy="wave-retry-delay-input"
              />
              <Input
                label="Timeout (hours)"
                type="number"
                value={formData.timeoutHours.toString()}
                onChange={(e) => setFormData({ ...formData, timeoutHours: parseInt(e.target.value) || 0 })}
                data-cy="wave-timeout-input"
              />
            </div>
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.skipWeekends}
                  onChange={(e) => setFormData({ ...formData, skipWeekends: e.target.checked })}
                  className="rounded"
                  data-cy="wave-skip-weekends"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Skip weekends when rescheduling</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.allowParallelBatches}
                  onChange={(e) => setFormData({ ...formData, allowParallelBatches: e.target.checked })}
                  className="rounded"
                  data-cy="wave-parallel-batches"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Allow parallel batch execution</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.continueOnFailure}
                  onChange={(e) => setFormData({ ...formData, continueOnFailure: e.target.checked })}
                  className="rounded"
                  data-cy="wave-continue-failure"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Continue on batch failure</span>
              </label>
            </div>
          </div>
        );

      case 'blackout':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Blackout Periods</h3>
              <Button
                variant="secondary"
                onClick={addBlackoutPeriod}
                icon={<Plus className="w-4 h-4" />}
                data-cy="add-blackout-btn"
              >
                Add Period
              </Button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.blackoutPeriods.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No blackout periods configured
                </p>
              ) : (
                formData.blackoutPeriods.map((period) => (
                  <div
                    key={period.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Input
                        value={period.description}
                        onChange={(e) => updateBlackoutPeriod(period.id, { description: e.target.value })}
                        placeholder="Description"
                        className="flex-1"
                      />
                      <Button
                        variant="danger"
                        onClick={() => removeBlackoutPeriod(period.id)}
                        icon={<Trash2 className="w-4 h-4" />}
                        data-cy="remove-blackout-btn"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Time</label>
                        <input
                          type="datetime-local"
                          value={format(period.startTime, "yyyy-MM-dd'T'HH:mm")}
                          onChange={(e) =>
                            updateBlackoutPeriod(period.id, { startTime: new Date(e.target.value) })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Time</label>
                        <input
                          type="datetime-local"
                          value={format(period.endTime, "yyyy-MM-dd'T'HH:mm")}
                          onChange={(e) =>
                            updateBlackoutPeriod(period.id, { endTime: new Date(e.target.value) })
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <Select
                        label="Type"
                        value={period.type}
                        onChange={(value) => updateBlackoutPeriod(period.id, { type: value as any })}
                        options={blackoutTypeOptions}
                      />
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={period.isRecurring}
                        onChange={(e) => updateBlackoutPeriod(period.id, { isRecurring: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Recurring</span>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sendPreMigrationNotifications}
                  onChange={(e) =>
                    setFormData({ ...formData, sendPreMigrationNotifications: e.target.checked })
                  }
                  className="rounded"
                  data-cy="wave-pre-notifications"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Send pre-migration notifications</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sendPostMigrationNotifications}
                  onChange={(e) =>
                    setFormData({ ...formData, sendPostMigrationNotifications: e.target.checked })
                  }
                  className="rounded"
                  data-cy="wave-post-notifications"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Send post-migration notifications</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sendProgressNotifications}
                  onChange={(e) =>
                    setFormData({ ...formData, sendProgressNotifications: e.target.checked })
                  }
                  className="rounded"
                  data-cy="wave-progress-notifications"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Send progress notifications</span>
              </label>
            </div>
            <Input
              label="Pre-migration Notification Hours"
              type="number"
              value={formData.preMigrationNotificationHours.toString()}
              onChange={(e) =>
                setFormData({ ...formData, preMigrationNotificationHours: parseInt(e.target.value) || 24 })
              }
              helperText="Hours before migration to send notification"
              data-cy="wave-notification-hours-input"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Recipients
              </label>
              <textarea
                value={formData.additionalRecipients.join('\n')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalRecipients: e.target.value.split('\n').map((r) => r.trim()).filter(Boolean),
                  })
                }
                rows={4}
                placeholder="Enter email addresses, one per line"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                data-cy="wave-recipients-textarea"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">One email address per line</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50" data-cy={dataCy}>
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full rounded-lg bg-white dark:bg-gray-800 shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Schedule Migration Wave
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              data-cy="close-wave-scheduling-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
            {[
              { id: 'info', label: 'Wave Info', icon: Calendar },
              { id: 'schedule', label: 'Scheduling', icon: Clock },
              { id: 'blackout', label: 'Blackout Periods', icon: AlertTriangle },
              { id: 'notifications', label: 'Notifications', icon: Bell },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
                data-cy={`tab-${id}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">{renderTabContent()}</div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="px-6 pb-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">Validation Issues</h4>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-300">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handlePreview}
                icon={<Eye className="w-4 h-4" />}
                data-cy="preview-schedule-btn"
              >
                Preview Schedule
              </Button>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isScheduling}
                data-cy="cancel-wave-scheduling-btn"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSchedule}
                loading={isScheduling}
                icon={<CheckCircle className="w-4 h-4" />}
                data-cy="schedule-wave-btn"
              >
                Schedule Wave
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default WaveSchedulingDialog;

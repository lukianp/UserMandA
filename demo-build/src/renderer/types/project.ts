/**
 * Project Configuration Type Definitions
 * Types for Project.json and migration wave management
 */

import { ProjectPhase } from './dashboard';

/**
 * Project configuration stored in Project.json
 */
export interface ProjectConfig {
  // Identity
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601

  // Profiles
  sourceProfile: ProfileConfig;
  targetProfile: ProfileConfig;

  // Timeline
  startDate: string; // ISO 8601
  targetCutover: string; // ISO 8601
  estimatedDuration: number; // days

  // Status
  status: ProjectStatus;
  currentPhase: ProjectPhase;

  // Waves
  waves: WaveConfig[];

  // Settings
  settings: ProjectSettings;
}

export interface ProfileConfig {
  name: string;
  type: 'ActiveDirectory' | 'AzureAD' | 'Hybrid';
  connectionString?: string;
  credentials?: string; // encrypted reference
  lastValidated?: string; // ISO 8601
}

export interface WaveConfig {
  id: string;
  name: string;
  description?: string;
  scheduledDate: string; // ISO 8601
  status: WaveStatus;
  userCount: number;
  groupCount: number;
  computerCount: number;
  completedAt?: string; // ISO 8601
}

export type ProjectStatus =
  | 'Planning'
  | 'Active'
  | 'Paused'
  | 'Complete'
  | 'Archived';

export type WaveStatus =
  | 'Scheduled'
  | 'InProgress'
  | 'Complete'
  | 'Failed'
  | 'Cancelled';

export interface ProjectSettings {
  autoRefreshInterval: number; // seconds
  enableNotifications: boolean;
  retentionDays: number;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
}



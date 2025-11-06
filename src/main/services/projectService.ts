/**
 * Project Service
 * Manages project configuration, timeline, and wave management
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import { ProjectConfig, ProjectStatus, WaveConfig, WaveStatus } from '../../renderer/types/project';
import { ProjectPhase } from '../../renderer/types/dashboard';

export class ProjectService {
  private projectCache: Map<string, ProjectConfig> = new Map();

  /**
   * Get the project configuration path for a profile
   */
  private getProjectPath(profileName: string): string {
    return path.join('C:', 'discoverydata', profileName, 'Project.json');
  }

  /**
   * Load project configuration for a profile
   */
  async loadProjectConfig(profileName: string): Promise<ProjectConfig> {
    // Check cache first
    if (this.projectCache.has(profileName)) {
      return this.projectCache.get(profileName)!;
    }

    const projectPath = this.getProjectPath(profileName);

    try {
      const content = await fs.readFile(projectPath, 'utf-8');
      const config = JSON.parse(content) as ProjectConfig;

      // Update cache
      this.projectCache.set(profileName, config);

      return config;
    } catch (error) {
      // Create default project if not exists
      console.log(`Creating default project for ${profileName}`);
      return this.createDefaultProject(profileName);
    }
  }

  /**
   * Save project configuration
   */
  async saveProjectConfig(profileName: string, config: ProjectConfig): Promise<void> {
    const projectPath = this.getProjectPath(profileName);

    // Ensure directory exists
    await fs.mkdir(path.dirname(projectPath), { recursive: true });

    // Update timestamps
    config.updatedAt = new Date().toISOString();

    // Save to file
    await fs.writeFile(projectPath, JSON.stringify(config, null, 2), 'utf-8');

    // Update cache
    this.projectCache.set(profileName, config);
  }

  /**
   * Create a default project configuration
   */
  private createDefaultProject(profileName: string): ProjectConfig {
    const now = new Date();
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Generate simple UUID
    const id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const config: ProjectConfig = {
      id,
      name: `${profileName} Migration Project`,
      description: 'M&A migration project',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),

      sourceProfile: {
        name: profileName,
        type: 'ActiveDirectory',
        lastValidated: now.toISOString()
      },

      targetProfile: {
        name: 'Target Environment',
        type: 'AzureAD'
      },

      startDate: now.toISOString(),
      targetCutover: in90Days.toISOString(),
      estimatedDuration: 90,

      status: 'Planning',
      currentPhase: 'Discovery',

      waves: [],

      settings: {
        autoRefreshInterval: 30,
        enableNotifications: true,
        retentionDays: 90,
        logLevel: 'info'
      }
    };

    return config;
  }

  /**
   * Update project status
   */
  async updateProjectStatus(
    profileName: string,
    status: ProjectStatus
  ): Promise<void> {
    const config = await this.loadProjectConfig(profileName);
    config.status = status;
    await this.saveProjectConfig(profileName, config);
  }

  /**
   * Update project phase
   */
  async updateProjectPhase(
    profileName: string,
    phase: ProjectPhase
  ): Promise<void> {
    const config = await this.loadProjectConfig(profileName);
    config.currentPhase = phase;
    await this.saveProjectConfig(profileName, config);
  }

  /**
   * Add a migration wave
   */
  async addMigrationWave(
    profileName: string,
    wave: WaveConfig
  ): Promise<void> {
    const config = await this.loadProjectConfig(profileName);
    config.waves.push(wave);
    await this.saveProjectConfig(profileName, config);
  }

  /**
   * Update wave status
   */
  async updateWaveStatus(
    profileName: string,
    waveId: string,
    status: WaveStatus
  ): Promise<void> {
    const config = await this.loadProjectConfig(profileName);
    const wave = config.waves.find(w => w.id === waveId);

    if (wave) {
      wave.status = status;
      if (status === 'Complete') {
        wave.completedAt = new Date().toISOString();
      }
      await this.saveProjectConfig(profileName, config);
    }
  }

  /**
   * Clear cache for a profile
   */
  invalidateCache(profileName?: string): void {
    if (profileName) {
      this.projectCache.delete(profileName);
    } else {
      this.projectCache.clear();
    }
  }
}

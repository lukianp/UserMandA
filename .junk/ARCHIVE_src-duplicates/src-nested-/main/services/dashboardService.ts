/**
 * Dashboard Service
 * Aggregates data from Logic Engine and Project Service for dashboard display
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import { DashboardStats, ProjectTimeline, SystemHealth, ActivityItem, ServiceStatus, SystemAlert, ActivityType } from '../../renderer/types/dashboard';
import { ProjectConfig, WaveConfig } from '../../renderer/types/project';

import { LogicEngineService } from './logicEngineService';
import { ProjectService } from './projectService';


export class DashboardService {
  private statsCache: Map<string, { data: DashboardStats; timestamp: number }> = new Map();
  private readonly cacheTimeout = 10000; // 10 seconds cache

  constructor(
    private logicEngine: LogicEngineService,
    private projectService: ProjectService
  ) {}

  /**
   * Get aggregated dashboard statistics from Logic Engine
   */
  async getStats(profileName: string): Promise<DashboardStats> {
    // Check cache
    const cached = this.statsCache.get(profileName);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    // Load data from Logic Engine if not already loaded
    const profilePath = path.join('C:', 'discoverydata', profileName, 'Raw');

    try {
      // Ensure Logic Engine is loaded with data
      await this.logicEngine.loadAllAsync(profilePath);
    } catch (error) {
      console.warn('Logic Engine load warning:', error);
      // Continue with potentially empty data
    }

    // Aggregate statistics
    const stats: DashboardStats = {
      totalUsers: this.logicEngine.getUserCount(),
      totalGroups: this.logicEngine.getGroupCount(),
      totalComputers: this.logicEngine.getDeviceCount(),
      totalInfrastructure: this.logicEngine.getInfrastructureCount(),

      discoveredUsers: this.logicEngine.getDiscoveredUserCount(),
      discoveredGroups: this.logicEngine.getDiscoveredGroupCount(),
      discoveredComputers: this.logicEngine.getDiscoveredDeviceCount(),
      discoveredApplications: this.logicEngine.getApplicationCount(),

      migratedUsers: await this.getMigratedUserCount(profileName),
      migratedGroups: await this.getMigratedGroupCount(profileName),
      pendingMigrationUsers: await this.getPendingMigrationUserCount(profileName),
      pendingMigrationGroups: await this.getPendingMigrationGroupCount(profileName),

      lastDiscoveryRun: this.logicEngine.getLastDiscoveryRun(),
      lastMigrationRun: await this.getLastMigrationRun(profileName),
      lastDataRefresh: new Date().toISOString(),
      dataSource: 'LogicEngine'
    };

    // Update cache
    this.statsCache.set(profileName, { data: stats, timestamp: Date.now() });

    return stats;
  }

  /**
   * Get project timeline information
   */
  async getProjectTimeline(profileName: string): Promise<ProjectTimeline> {
    const projectConfig = await this.projectService.loadProjectConfig(profileName);

    const now = new Date();
    const cutoverDate = new Date(projectConfig.targetCutover);
    const startDate = new Date(projectConfig.startDate);

    // Find next wave
    const upcomingWaves = (projectConfig.waves ?? [])
      .filter(w => w.status === 'Scheduled' && new Date(w.scheduledDate) > now)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

    const nextWaveDate = upcomingWaves.length > 0
      ? new Date(upcomingWaves[0].scheduledDate)
      : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to 7 days

    // Calculate days
    const daysToCutover = this.calculateDaysDifference(now, cutoverDate);
    const daysToNextWave = this.calculateDaysDifference(now, nextWaveDate);
    const daysElapsed = this.calculateDaysDifference(startDate, now);

    // Calculate progress
    const waves = projectConfig.waves ?? [];
    const completedWaves = waves.filter(w => w.status === 'Complete').length;
    const activeWaveIndex = waves.findIndex(w => w.status === 'InProgress');
    const phaseProgress = this.calculatePhaseProgress(projectConfig.currentPhase, daysElapsed, projectConfig.estimatedDuration);
    const waveProgress = activeWaveIndex >= 0 ? this.calculateWaveProgress(waves[activeWaveIndex]) : 0;
    const overallProgress = waves.length > 0
      ? Math.round((completedWaves / waves.length) * 100)
      : 0;

    return {
      projectId: projectConfig.id,
      projectName: projectConfig.name,
      projectDescription: projectConfig.description,
      projectStartDate: projectConfig.startDate,
      targetCutover: projectConfig.targetCutover,
      nextWave: nextWaveDate.toISOString(),
      daysToCutover,
      daysToNextWave,
      daysElapsed,
      currentPhase: projectConfig.currentPhase,
      phaseProgress,
      totalWaves: waves.length,
      completedWaves,
      activeWave: activeWaveIndex >= 0 ? activeWaveIndex + 1 : undefined,
      waveProgress,
      overallProgress,
      estimatedCompletionDate: this.calculateEstimatedCompletion(projectConfig, daysElapsed)
    };
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const startTime = Date.now();

    // Check Logic Engine
    const logicEngineStatus = await this.checkLogicEngineStatus();

    // Check PowerShell (simplified check)
    const powerShellStatus = await this.checkPowerShellStatus();

    // Check file system
    const fileSystemStatus = await this.checkFileSystemStatus();

    // Check network (simplified - always online for now)
    const networkStatus: ServiceStatus = {
      status: 'online',
      lastCheck: new Date().toISOString(),
      responseTimeMs: 0
    };

    // Get performance metrics
    const memoryUsage = process.memoryUsage();
    const avgResponseTime = Date.now() - startTime;

    // Get alerts (empty for now, can be populated from error logs)
    const activeAlerts: SystemAlert[] = [];

    return {
      logicEngineStatus,
      powerShellStatus,
      fileSystemStatus,
      networkStatus,
      dataFreshnessMinutes: await this.getDataFreshness(),
      avgResponseTimeMs: avgResponseTime,
      memoryUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      cpuUsagePercent: 0, // Would require additional monitoring
      lastErrorCount: 0,
      activeAlerts
    };
  }

  /**
   * Get recent activity from logs
   */
  async getRecentActivity(profileName: string, limit = 10): Promise<ActivityItem[]> {
    const logPath = path.join('C:', 'discoverydata', profileName, 'Logs', 'activity.log');

    try {
      const logContent = await fs.readFile(logPath, 'utf-8');
      const lines = logContent.split('\n').filter(line => line.trim());

      // Parse last N lines as activities
      const activities: ActivityItem[] = lines
        .slice(-limit * 2) // Get more than needed in case some fail to parse
        .reverse()
        .map((line, index) => {
          // Parse log line (format: [timestamp] [type] message)
          const match = line.match(/\[(.*?)\]\s*\[(.*?)\]\s*(.*)/);
          if (!match) return null;

          const [, timestamp, type, message] = match;

          return {
            id: `activity-${Date.now()}-${index}`,
            type: this.mapActivityType(type),
            title: this.extractActivityTitle(message),
            description: message,
            timestamp: new Date(timestamp).toISOString(),
            status: 'info' as const,
            actionUrl: this.getActivityActionUrl(type)
          };
        })
        .filter((activity): activity is NonNullable<typeof activity> => activity !== null)
        .slice(0, limit);

      return activities;

    } catch (error) {
      // Log file doesn't exist or can't be read - return default activity
      return [
        {
          id: 'default-1',
          type: 'system',
          title: 'System Ready',
          description: 'Dashboard service initialized successfully',
          timestamp: new Date().toISOString(),
          status: 'success'
        }
      ];
    }
  }

  /**
   * Acknowledge a system alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    // Implementation would update alert status in storage
    console.log(`Alert acknowledged: ${alertId}`);
  }

  // ========================================
  // Helper Methods
  // ========================================

  private async getMigratedUserCount(profileName: string): Promise<number> {
    // Would check migration status from project waves
    const projectConfig = await this.projectService.loadProjectConfig(profileName);
    return (projectConfig.waves ?? [])
      .filter(w => w.status === 'Complete')
      .reduce((sum, wave) => sum + wave.userCount, 0);
  }

  private async getMigratedGroupCount(profileName: string): Promise<number> {
    const projectConfig = await this.projectService.loadProjectConfig(profileName);
    return (projectConfig.waves ?? [])
      .filter(w => w.status === 'Complete')
      .reduce((sum, wave) => sum + wave.groupCount, 0);
  }

  private async getPendingMigrationUserCount(profileName: string): Promise<number> {
    const projectConfig = await this.projectService.loadProjectConfig(profileName);
    return (projectConfig.waves ?? [])
      .filter(w => w.status === 'Scheduled' || w.status === 'InProgress')
      .reduce((sum, wave) => sum + wave.userCount, 0);
  }

  private async getPendingMigrationGroupCount(profileName: string): Promise<number> {
    const projectConfig = await this.projectService.loadProjectConfig(profileName);
    return (projectConfig.waves ?? [])
      .filter(w => w.status === 'Scheduled' || w.status === 'InProgress')
      .reduce((sum, wave) => sum + wave.groupCount, 0);
  }

  private async getLastMigrationRun(profileName: string): Promise<string | undefined> {
    const projectConfig = await this.projectService.loadProjectConfig(profileName);
    const completedWaves = (projectConfig.waves ?? [])
      .filter(w => w.status === 'Complete' && w.completedAt)
      .sort((a, b) => new Date(b.completedAt as string).getTime() - new Date(a.completedAt as string).getTime());

    return completedWaves.length > 0 ? completedWaves[0].completedAt : undefined;
  }

  private async checkLogicEngineStatus(): Promise<ServiceStatus> {
    try {
      const startTime = Date.now();
      const count = this.logicEngine.getUserCount();
      const responseTime = Date.now() - startTime;

      return {
        status: count >= 0 ? 'online' : 'degraded',
        lastCheck: new Date().toISOString(),
        responseTimeMs: responseTime
      };
    } catch (error) {
      return {
        status: 'offline',
        lastCheck: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkPowerShellStatus(): Promise<ServiceStatus> {
    // Simplified check - would actually test PowerShell execution
    return {
      status: 'online',
      lastCheck: new Date().toISOString(),
      responseTimeMs: 50
    };
  }

  private async checkFileSystemStatus(): Promise<ServiceStatus> {
    try {
      // Check if data directory is accessible
      await fs.access(path.join('C:', 'discoverydata'));
      return {
        status: 'online',
        lastCheck: new Date().toISOString()
      };
    } catch {
      return {
        status: 'offline',
        lastCheck: new Date().toISOString(),
        errorMessage: 'Data directory not accessible'
      };
    }
  }

  private async getDataFreshness(): Promise<number> {
    const lastDiscovery = this.logicEngine.getLastDiscoveryRun();
    if (!lastDiscovery) return 0;

    const lastDiscoveryDate = new Date(lastDiscovery);
    const now = new Date();
    const diffMs = now.getTime() - lastDiscoveryDate.getTime();
    return Math.floor(diffMs / 60000); // Convert to minutes
  }

  private calculateDaysDifference(from: Date, to: Date): number {
    // Validate dates - return 0 if either date is invalid
    if (!from || !to || isNaN(from.getTime()) || isNaN(to.getTime())) {
      return 0;
    }
    const diffTime = to.getTime() - from.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculatePhaseProgress(phase: string, _daysElapsed: number, _estimatedDuration: number): number {
    // Simple progress calculation based on phase and time
    const phaseWeights: Record<string, number> = {
      Discovery: 20,
      Planning: 20,
      Migration: 40,
      Validation: 15,
      Cutover: 5,
      Complete: 100
    };

    return phaseWeights[phase] || 0;
  }

  private calculateWaveProgress(wave: WaveConfig): number {
    if (wave.status === 'Complete') return 100;
    if (wave.status === 'InProgress') return 50;
    return 0;
  }

  private calculateEstimatedCompletion(config: ProjectConfig, _daysElapsed: number): string {
    const avgWaveDuration = 7; // days
    const remainingWaves = (config.waves ?? []).filter(w => w.status !== 'Complete').length;
    const estimatedDays = remainingWaves * avgWaveDuration;
    const completionDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);
    return completionDate.toISOString();
  }

  private mapActivityType(type: string): ActivityType {
    const typeMap: Record<string, ActivityType> = {
      DISCOVERY: 'discovery',
      MIGRATION: 'migration',
      VALIDATION: 'validation',
      CONFIG: 'configuration',
      CONFIGURATION: 'configuration',
      ERROR: 'error',
      SYSTEM: 'system'
    };
    return typeMap[type.toUpperCase()] || 'system';
  }

  private extractActivityTitle(message: string): string {
    // Extract first sentence or first 50 characters
    const firstSentence = message.split('.')[0];
    return firstSentence.length > 50
      ? firstSentence.substring(0, 47) + '...'
      : firstSentence;
  }

  private getActivityActionUrl(type: string): string | undefined {
    const urlMap: Record<string, string> = {
      DISCOVERY: '/discovery',
      MIGRATION: '/migration',
      VALIDATION: '/validation',
      CONFIG: '/settings',
      CONFIGURATION: '/settings'
    };
    return urlMap[type.toUpperCase()];
  }

  /**
   * Clear cache for a profile
   */
  invalidateCache(profileName?: string): void {
    if (profileName) {
      this.statsCache.delete(profileName);
    } else {
      this.statsCache.clear();
    }
  }
}

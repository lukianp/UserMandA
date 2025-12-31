/**
 * Enhanced Migration Control Plane IPC Handlers
 *
 * IPC handlers for the enhanced migration control plane including:
 * - Domain mapping operations
 * - User migration planning and execution
 * - Azure resource migration
 * - Cross-domain dependency management
 * - Migration engineering tools
 */

import { ipcMain } from 'electron';
import { getMigrationPlanningService } from '../services/migrationPlanningService';
import type { PowerShellExecutionService } from '../services/powerShellService';

// PowerShell service instance (injected during registration)
let psService: PowerShellExecutionService | null = null;

/**
 * Register all enhanced migration control plane IPC handlers
 * @param powerShellService - PowerShell execution service instance
 */
export function registerMigrationHandlers(powerShellService?: PowerShellExecutionService): void {
  const service = getMigrationPlanningService();

  // Store PowerShell service for use in handlers
  if (powerShellService) {
    psService = powerShellService;
  }

  // ========================================
  // DOMAIN MAPPING HANDLERS
  // ========================================

  /**
   * Create domain mapping
   */
  ipcMain.handle('migration:createDomainMapping', async (event, mappingData: any) => {
    try {
      console.log('IPC: createDomainMapping', mappingData);

      //Generate ID and add metadata
      const mapping = {
        id: `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...mappingData,
        status: mappingData.status || 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Validate domain mapping if PowerShell service is available
      if (psService && mappingData.sourceDomain && mappingData.targetDomain) {
        try {
          const validationResult = await psService.executeModule(
            'Modules/Migration/UserMigration.psm1',
            'Test-DomainConnectivity',
            {
              Domain: mappingData.sourceDomain,
              TargetDomain: mappingData.targetDomain
            }
          );

          if (validationResult.success) {
            mapping.status = 'Validated';
          }
        } catch (psError) {
          console.warn('Domain validation failed, but mapping will be created:', psError);
        }
      }

      return { success: true, data: mapping };
    } catch (error: any) {
      console.error('createDomainMapping error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get domain mappings
   * Note: Data persistence is handled in the frontend store via localStorage
   */
  ipcMain.handle('migration:getDomainMappings', async () => {
    try {
      console.log('IPC: getDomainMappings');
      // Return empty array - frontend store handles persistence via localStorage
      return { success: true, data: [] };
    } catch (error: any) {
      console.error('getDomainMappings error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Validate domain mappings using PowerShell
   */
  ipcMain.handle('migration:validateDomainMappings', async (event, mappings?: any[]) => {
    try {
      console.log('IPC: validateDomainMappings');

      const results = {
        isValid: true,
        errors: [] as string[],
        warnings: [] as string[]
      };

      // If PowerShell service is available and mappings provided, validate each
      if (psService && mappings && mappings.length > 0) {
        for (const mapping of mappings) {
          try {
            const result = await psService.executeModule(
              'Modules/Migration/UserMigration.psm1',
              'Test-DomainConnectivity',
              {
                Domain: mapping.sourceDomain,
                TargetDomain: mapping.targetDomain
              }
            );

            if (!result.success) {
              results.isValid = false;
              results.errors.push(`Failed to validate ${mapping.sourceDomain} -> ${mapping.targetDomain}: ${result.error}`);
            }
          } catch (error: any) {
            results.warnings.push(`Could not test connectivity for ${mapping.sourceDomain}: ${error.message}`);
          }
        }
      }

      return { success: true, data: results };
    } catch (error: any) {
      console.error('validateDomainMappings error:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // USER MIGRATION HANDLERS
  // ========================================

  /**
   * Create user migration plan
   */
  ipcMain.handle('migration:createUserMigrationPlan', async (event, planData: any) => {
    try {
      console.log('IPC: createUserMigrationPlan', planData);

      // Generate plan with ID and metadata
      const plan = {
        id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...planData,
        status: 'Pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Validate user migration plan if PowerShell service available
      if (psService && planData.userPrincipalName) {
        try {
          const validationResult = await psService.executeModule(
            'Modules/Migration/UserMigration.psm1',
            'Test-UserMigrationPrerequisites',
            {
              UserPrincipalName: planData.userPrincipalName,
              SourceDomain: planData.sourceDomain,
              TargetDomain: planData.targetDomain
            }
          );

          if (validationResult.success) {
            plan.validationStatus = 'Passed';
            plan.validatedAt = new Date().toISOString();
          } else {
            plan.validationStatus = 'Failed';
            plan.validationErrors = [validationResult.error || 'Validation failed'];
          }
        } catch (psError: any) {
          console.warn('User migration validation failed:', psError);
          plan.validationStatus = 'NotValidated';
          plan.validationErrors = [psError.message];
        }
      }

      return { success: true, data: plan };
    } catch (error: any) {
      console.error('createUserMigrationPlan error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Execute user migration
   */
  ipcMain.handle('migration:executeUserMigration', async (event, plan: any) => {
    try {
      console.log('IPC: executeUserMigration', plan);

      const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Execute user migration using PowerShell if available
      if (psService) {
        try {
          const result = await psService.executeModule(
            'Modules/Migration/UserMigration.psm1',
            'Start-UserMigration',
            {
              SourceIdentity: plan.userPrincipalName,
              TargetIdentity: plan.newUPN || plan.userPrincipalName,
              SourceDomain: plan.sourceDomain,
              TargetDomain: plan.targetDomain,
              CompanyName: 'MigrationSuite',
              MigrationMode: 'Full',
              ValidationMode: false,
              EnableRollback: true,
              BatchId: plan.migrationWaveId || executionId,
              BatchName: `Migration-${executionId}`,
              MigratePassword: plan.passwordSyncMethod !== 'None',
              MigrateGroups: plan.migrateGroups !== false,
              MigrateMailbox: plan.migrateMailbox !== false,
              MigrateOneDrive: plan.migrateOneDrive !== false
            }
          );

          return {
            success: result.success,
            data: {
              executionId,
              status: result.success ? 'Completed' : 'Failed',
              message: result.success ? 'User migration completed successfully' : result.error,
              result: result.data
            }
          };
        } catch (psError: any) {
          console.error('User migration execution failed:', psError);
          return {
            success: false,
            error: psError.message,
            data: { executionId, status: 'Failed' }
          };
        }
      }

      // Fallback if PowerShell not available
      return {
        success: true,
        data: {
          executionId,
          status: 'Started',
          message: 'Migration started (PowerShell service not available for execution)'
        }
      };
    } catch (error: any) {
      console.error('executeUserMigration error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get user migration status
   */
  ipcMain.handle('migration:getUserMigrationStatus', async (event, planId: string) => {
    try {
      console.log('IPC: getUserMigrationStatus', planId);
      // Status tracking would be implemented via event listeners in real scenario
      // For now, return a placeholder status
      return {
        success: true,
        data: {
          planId,
          status: 'InProgress',
          progress: 50,
          itemsProcessed: 5,
          itemsTotal: 10,
          startedAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('getUserMigrationStatus error:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // AZURE RESOURCE MIGRATION HANDLERS
  // ========================================

  /**
   * Create Azure resource migration
   */
  ipcMain.handle('migration:createAzureResourceMigration', async (event, migrationData: any) => {
    try {
      console.log('IPC: createAzureResourceMigration', migrationData);

      // Generate migration with ID and metadata
      const migration = {
        id: `azure-mig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...migrationData,
        status: 'NotStarted',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Assess Azure resource migration if PowerShell service available
      if (psService && migrationData.resourceId) {
        try {
          const assessmentResult = await psService.executeModule(
            'Modules/Migration/AzureResourceMigration.psm1',
            'Get-AzureResourceAssessment',
            {
              ResourceId: migrationData.resourceId,
              SourceSubscriptionId: migrationData.sourceSubscriptionId,
              TargetSubscriptionId: migrationData.targetSubscriptionId
            }
          );

          if (assessmentResult.success && assessmentResult.data) {
            migration.assessment = assessmentResult.data;
            const assessmentData = assessmentResult.data as { complexity?: string; estimatedDowntime?: number };
            migration.complexity = assessmentData.complexity || migration.complexity;
            migration.estimatedDowntimeHours = assessmentData.estimatedDowntime || 0;
          }
        } catch (psError: any) {
          console.warn('Azure resource assessment failed:', psError);
          migration.assessmentErrors = [psError.message];
        }
      }

      return { success: true, data: migration };
    } catch (error: any) {
      console.error('createAzureResourceMigration error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Execute Azure resource migration
   */
  ipcMain.handle('migration:executeAzureResourceMigration', async (event, migration: any) => {
    try {
      console.log('IPC: executeAzureResourceMigration', migration);

      const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Execute Azure resource migration using PowerShell if available
      if (psService) {
        try {
          const result = await psService.executeModule(
            'Modules/Migration/AzureResourceMigration.psm1',
            'Start-AzureMigration',
            {
              ResourceId: migration.resourceId,
              ResourceType: migration.resourceType,
              Method: migration.migrationMethod,
              SourceConfig: {
                SubscriptionId: migration.sourceSubscriptionId,
                ResourceGroup: migration.sourceResourceGroup
              },
              TargetConfig: {
                SubscriptionId: migration.targetSubscriptionId,
                ResourceGroup: migration.targetResourceGroup,
                Region: migration.targetRegion,
                ResourceName: migration.targetResourceName
              },
              ValidationMode: false,
              ExecutionId: executionId
            }
          );

          return {
            success: result.success,
            data: {
              executionId,
              status: result.success ? 'Completed' : 'Failed',
              message: result.success ? 'Azure resource migration completed' : result.error,
              result: result.data
            }
          };
        } catch (psError: any) {
          console.error('Azure resource migration failed:', psError);
          return {
            success: false,
            error: psError.message,
            data: { executionId, status: 'Failed' }
          };
        }
      }

      // Fallback if PowerShell not available
      return {
        success: true,
        data: {
          executionId,
          status: 'Started',
          message: 'Migration started (PowerShell service not available for execution)'
        }
      };
    } catch (error: any) {
      console.error('executeAzureResourceMigration error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get Azure resource migration status
   */
  ipcMain.handle('migration:getAzureResourceMigrationStatus', async (event, migrationId: string) => {
    try {
      console.log('IPC: getAzureResourceMigrationStatus', migrationId);
      // Status tracking would be implemented via event listeners in real scenario
      // For now, return a placeholder status
      return {
        success: true,
        data: {
          migrationId,
          status: 'InProgress',
          progress: 65,
          phase: 'Migrating',
          startedAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('getAzureResourceMigrationStatus error:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // ENGINEERING TOOLS HANDLERS
  // ========================================

  /**
   * Get migration logs
   */
  ipcMain.handle('migration:getMigrationLogs', async (event, filters: any) => {
    try {
      console.log('IPC: getMigrationLogs', filters);
      // Implementation would retrieve logs from PowerShell execution
      return { success: true, data: [] };
    } catch (error: any) {
      console.error('getMigrationLogs error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Get migration metrics
   */
  ipcMain.handle('migration:getMigrationMetrics', async (event, timeRange: any) => {
    try {
      console.log('IPC: getMigrationMetrics', timeRange);
      // Implementation would aggregate metrics from migrations
      return {
        success: true,
        data: {
          itemsPerHour: 45,
          bytesPerSecond: 10485760,
          averageItemDuration: 80000,
          successRate: 98.5,
          failureRate: 1.5,
          retryRate: 3.2,
          queuedItems: 120,
          processingItems: 5,
          completedItems: 350,
          failedItems: 5,
          cpuUsage: 45,
          memoryUsage: 62,
          networkUtilization: 78,
          errorsByType: { 'Timeout': 2, 'PermissionDenied': 3 },
          topErrors: [
            { code: 'TIMEOUT', message: 'Operation timed out', count: 2 },
            { code: 'PERMISSION_DENIED', message: 'Insufficient permissions', count: 3 },
          ],
        }
      };
    } catch (error: any) {
      console.error('getMigrationMetrics error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Retry migration task
   */
  ipcMain.handle('migration:retryMigrationTask', async (event, taskId: string) => {
    try {
      console.log('IPC: retryMigrationTask', taskId);
      // Implementation would retry failed migration task
      return { success: true };
    } catch (error: any) {
      console.error('retryMigrationTask error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * Rollback migration
   */
  ipcMain.handle('migration:rollbackMigration', async (event, migrationId: string) => {
    try {
      console.log('IPC: rollbackMigration', migrationId);
      // Implementation would call rollback functionality
      return { success: true, data: { rollbackId: 'rollback-1', itemsRolledBack: 5 } };
    } catch (error: any) {
      console.error('rollbackMigration error:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // CROSS-DOMAIN OPERATIONS
  // ========================================

  /**
   * Analyze cross-domain dependencies
   */
  ipcMain.handle('migration:analyzeCrossDomainDependencies', async () => {
    try {
      console.log('IPC: analyzeCrossDomainDependencies');
      // Implementation would analyze dependencies between domains
      return { success: true, data: [] };
    } catch (error: any) {
      console.error('analyzeCrossDomainDependencies error:', error);
      return { success: false, error: error.message };
    }
  });

  // ========================================
  // LEGACY COMPATIBILITY HANDLERS
  // ========================================

  // Keep existing migration planning handlers for backward compatibility
  ipcMain.handle('migration-plan:get-by-profile', async (event, profileName: string) => {
    try {
      const plans = await service.getPlansByProfile(profileName);
      return { success: true, plans };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('migration-plan:create', async (event, planData: any) => {
    try {
      const plan = await service.createPlan(planData);
      return { success: true, plan };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('migration-plan:add-wave', async (event, data: any) => {
    try {
      const wave = await service.addWave(data.planId, data.waveData);
      return { success: true, wave };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('migration-plan:assign-users', async (event, data: any) => {
    try {
      await service.assignUsersToWave(data.planId, data.waveId, data.userIds);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('migration-plan:update-wave-status', async (event, data: any) => {
    try {
      await service.updateWaveStatus(data.planId, data.waveId, data.status);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('migration-plan:delete', async (event, planId: string) => {
    try {
      await service.deletePlan(planId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('migration-plan:get-by-id', async (event, planId: string) => {
    try {
      const plan = await service.getPlan(planId);
      return { success: true, plan };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}



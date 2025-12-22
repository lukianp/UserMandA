/**
 * Migration Plan Persistence IPC Handlers (Epic 2)
 *
 * Handles all IPC communication for migration wave planning and persistence.
 */

import { ipcMain } from 'electron';

/**
 * Register all migration-related IPC handlers
 */
export function registerMigrationHandlers(): void {
  // ========================================
  // Migration Plan Persistence Handlers
  // ========================================

  /**
   * IPC Handler: migration:initialize-db
   * Initializes the database for the active profile
   */
  ipcMain.handle('migration:initialize-db', async (_, args: { profilePath: string }) => {
    try {
      const { profilePath } = args;
      console.log(`[IPC] Initializing migration database for profile: ${profilePath}`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.initialize(profilePath);

      return { success: true, message: 'Database initialized successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:initialize-db error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:get-waves
   * Retrieves all migration waves from the database
   */
  ipcMain.handle('migration:get-waves', async () => {
    try {
      console.log('[IPC] Getting migration waves');

      const { databaseService } = await import('./services/databaseService');
      const waves = await databaseService.getWaves();

      return { success: true, data: waves };
    } catch (error: any) {
      console.error('[IPC] migration:get-waves error:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  /**
   * IPC Handler: migration:get-wave
   * Retrieves a single wave by ID
   */
  ipcMain.handle('migration:get-wave', async (_, args: { waveId: string }) => {
    try {
      const { waveId } = args;
      console.log(`[IPC] Getting migration wave: ${waveId}`);

      const { databaseService } = await import('./services/databaseService');
      const wave = await databaseService.getWave(waveId);

      if (!wave) {
        return { success: false, error: `Wave not found: ${waveId}`, data: null };
      }

      return { success: true, data: wave };
    } catch (error: any) {
      console.error('[IPC] migration:get-wave error:', error);
      return { success: false, error: error.message, data: null };
    }
  });

  /**
   * IPC Handler: migration:add-wave
   * Adds a new migration wave to the database
   */
  ipcMain.handle('migration:add-wave', async (_, args: { wave: any }) => {
    try {
      const { wave } = args;
      console.log(`[IPC] Adding migration wave: ${wave.name}`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.addWave(wave);

      return { success: true, message: 'Wave added successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:add-wave error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:update-wave
   * Updates an existing migration wave
   */
  ipcMain.handle('migration:update-wave', async (_, args: { waveId: string; updates: any }) => {
    try {
      const { waveId, updates } = args;
      console.log(`[IPC] Updating migration wave: ${waveId}`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.updateWave(waveId, updates);

      return { success: true, message: 'Wave updated successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:update-wave error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:delete-wave
   * Deletes a migration wave from the database
   */
  ipcMain.handle('migration:delete-wave', async (_, args: { waveId: string }) => {
    try {
      const { waveId } = args;
      console.log(`[IPC] Deleting migration wave: ${waveId}`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.deleteWave(waveId);

      return { success: true, message: 'Wave deleted successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:delete-wave error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:add-item-to-wave
   * Adds a migration item to a specific wave
   */
  ipcMain.handle('migration:add-item-to-wave', async (_, args: { waveId: string; item: any }) => {
    try {
      const { waveId, item } = args;
      console.log(`[IPC] Adding item to wave ${waveId}:`, item.sourceIdentity || item.id);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.addItemToWave(waveId, item);

      return { success: true, message: 'Item added to wave successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:add-item-to-wave error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:remove-item-from-wave
   * Removes a migration item from a wave
   */
  ipcMain.handle('migration:remove-item-from-wave', async (_, args: { waveId: string; itemId: string }) => {
    try {
      const { waveId, itemId } = args;
      console.log(`[IPC] Removing item ${itemId} from wave ${waveId}`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.removeItemFromWave(waveId, itemId);

      return { success: true, message: 'Item removed from wave successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:remove-item-from-wave error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:get-wave-items
   * Retrieves all items in a specific wave
   */
  ipcMain.handle('migration:get-wave-items', async (_, args: { waveId: string }) => {
    try {
      const { waveId } = args;
      console.log(`[IPC] Getting items for wave: ${waveId}`);

      const { databaseService } = await import('./services/databaseService');
      const items = await databaseService.getWaveItems(waveId);

      return { success: true, data: items };
    } catch (error: any) {
      console.error('[IPC] migration:get-wave-items error:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  /**
   * IPC Handler: migration:save-plan
   * Saves the entire migration plan (bulk operation)
   */
  ipcMain.handle('migration:save-plan', async (_, args: { waves: any[] }) => {
    try {
      const { waves } = args;
      console.log(`[IPC] Saving migration plan with ${waves.length} waves`);

      const { databaseService } = await import('./services/databaseService');
      await databaseService.saveMigrationPlan(waves);

      return { success: true, message: 'Migration plan saved successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:save-plan error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:get-statistics
   * Retrieves database statistics
   */
  ipcMain.handle('migration:get-statistics', async () => {
    try {
      console.log('[IPC] Getting migration statistics');

      const { databaseService } = await import('./services/databaseService');
      const stats = await databaseService.getStatistics();

      return { success: true, data: stats };
    } catch (error: any) {
      console.error('[IPC] migration:get-statistics error:', error);
      return { success: false, error: error.message, data: null };
    }
  });

  /**
   * IPC Handler: migration:update-metadata
   * Updates migration plan metadata
   */
  ipcMain.handle('migration:update-metadata', async (_, args: { metadata: any }) => {
    try {
      const { metadata } = args;
      console.log('[IPC] Updating migration metadata');

      const { databaseService } = await import('./services/databaseService');
      await databaseService.updateMetadata(metadata);

      return { success: true, message: 'Metadata updated successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:update-metadata error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:get-metadata
   * Retrieves migration plan metadata
   */
  ipcMain.handle('migration:get-metadata', async () => {
    try {
      console.log('[IPC] Getting migration metadata');

      const { databaseService } = await import('./services/databaseService');
      const metadata = await databaseService.getMetadata();

      return { success: true, data: metadata };
    } catch (error: any) {
      console.error('[IPC] migration:get-metadata error:', error);
      return { success: false, error: error.message, data: null };
    }
  });

  // ========================================
  // Enhanced Migration Control Plane Handlers
  // ========================================

  // ---- Domain Mapping Handlers ----

  /**
   * IPC Handler: migration:get-domain-mappings
   * Retrieves all domain mappings
   */
  ipcMain.handle('migration:get-domain-mappings', async () => {
    try {
      console.log('[IPC] Getting domain mappings');
      const { databaseService } = await import('./services/databaseService');
      const mappings = await databaseService.getDomainMappings?.() || [];
      return { success: true, data: mappings };
    } catch (error: any) {
      console.error('[IPC] migration:get-domain-mappings error:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  /**
   * IPC Handler: migration:create-domain-mapping
   * Creates a new domain mapping
   */
  ipcMain.handle('migration:create-domain-mapping', async (_, args: { mapping: any }) => {
    try {
      const { mapping } = args;
      console.log(`[IPC] Creating domain mapping: ${mapping.sourceDomain} -> ${mapping.targetDomain}`);
      const { databaseService } = await import('./services/databaseService');
      const result = await databaseService.createDomainMapping?.(mapping);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:create-domain-mapping error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:update-domain-mapping
   * Updates an existing domain mapping
   */
  ipcMain.handle('migration:update-domain-mapping', async (_, args: { id: string; updates: any }) => {
    try {
      const { id, updates } = args;
      console.log(`[IPC] Updating domain mapping: ${id}`);
      const { databaseService } = await import('./services/databaseService');
      await databaseService.updateDomainMapping?.(id, updates);
      return { success: true, message: 'Domain mapping updated successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:update-domain-mapping error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:delete-domain-mapping
   * Deletes a domain mapping
   */
  ipcMain.handle('migration:delete-domain-mapping', async (_, args: { id: string }) => {
    try {
      const { id } = args;
      console.log(`[IPC] Deleting domain mapping: ${id}`);
      const { databaseService } = await import('./services/databaseService');
      await databaseService.deleteDomainMapping?.(id);
      return { success: true, message: 'Domain mapping deleted successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:delete-domain-mapping error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:validate-domain-mapping
   * Validates a domain mapping configuration
   */
  ipcMain.handle('migration:validate-domain-mapping', async (_, args: { id: string }) => {
    try {
      const { id } = args;
      console.log(`[IPC] Validating domain mapping: ${id}`);
      // Run PowerShell validation script
      const { PowerShellExecutionService } = await import('./services/powershellExecutionService');
      const psService = PowerShellExecutionService.getInstance();
      const result = await psService.executeScript(
        'Test-DomainMappingConnectivity',
        { MappingId: id },
        { modulePath: 'Modules/Migration/UserMigration.psm1' }
      );
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:validate-domain-mapping error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:test-domain-connectivity
   * Tests connectivity to source and target domains
   */
  ipcMain.handle('migration:test-domain-connectivity', async (_, args: { sourceDomain: string; targetDomain: string }) => {
    try {
      const { sourceDomain, targetDomain } = args;
      console.log(`[IPC] Testing domain connectivity: ${sourceDomain} <-> ${targetDomain}`);
      const { PowerShellExecutionService } = await import('./services/powershellExecutionService');
      const psService = PowerShellExecutionService.getInstance();
      const result = await psService.executeScript(
        'Test-DomainConnectivity',
        { SourceDomain: sourceDomain, TargetDomain: targetDomain },
        { modulePath: 'Modules/Migration/UserMigration.psm1' }
      );
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:test-domain-connectivity error:', error);
      return { success: false, error: error.message };
    }
  });

  // ---- User Migration Plan Handlers ----

  /**
   * IPC Handler: migration:get-user-migration-plans
   * Retrieves all user migration plans
   */
  ipcMain.handle('migration:get-user-migration-plans', async () => {
    try {
      console.log('[IPC] Getting user migration plans');
      const { databaseService } = await import('./services/databaseService');
      const plans = await databaseService.getUserMigrationPlans?.() || [];
      return { success: true, data: plans };
    } catch (error: any) {
      console.error('[IPC] migration:get-user-migration-plans error:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  /**
   * IPC Handler: migration:create-user-migration-plan
   * Creates a new user migration plan
   */
  ipcMain.handle('migration:create-user-migration-plan', async (_, args: { plan: any }) => {
    try {
      const { plan } = args;
      console.log(`[IPC] Creating user migration plan for: ${plan.sourceUserPrincipalName}`);
      const { databaseService } = await import('./services/databaseService');
      const result = await databaseService.createUserMigrationPlan?.(plan);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:create-user-migration-plan error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:bulk-create-user-migration-plans
   * Creates multiple user migration plans at once
   */
  ipcMain.handle('migration:bulk-create-user-migration-plans', async (_, args: { plans: any[] }) => {
    try {
      const { plans } = args;
      console.log(`[IPC] Bulk creating ${plans.length} user migration plans`);
      const { databaseService } = await import('./services/databaseService');
      const results = await databaseService.bulkCreateUserMigrationPlans?.(plans) || [];
      return { success: true, data: results, count: results.length };
    } catch (error: any) {
      console.error('[IPC] migration:bulk-create-user-migration-plans error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:execute-user-migration
   * Executes a user migration plan
   */
  ipcMain.handle('migration:execute-user-migration', async (_, args: { planId: string; options?: any }) => {
    try {
      const { planId, options } = args;
      console.log(`[IPC] Executing user migration plan: ${planId}`);
      const { PowerShellExecutionService } = await import('./services/powershellExecutionService');
      const psService = PowerShellExecutionService.getInstance();
      const result = await psService.executeScript(
        'Start-UserMigration',
        { PlanId: planId, ...options },
        { modulePath: 'Modules/Migration/UserMigration.psm1' }
      );
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:execute-user-migration error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:update-user-migration-plan
   * Updates an existing user migration plan
   */
  ipcMain.handle('migration:update-user-migration-plan', async (_, args: { id: string; updates: any }) => {
    try {
      const { id, updates } = args;
      console.log(`[IPC] Updating user migration plan: ${id}`);
      const { databaseService } = await import('./services/databaseService');
      await databaseService.updateUserMigrationPlan?.(id, updates);
      return { success: true, message: 'User migration plan updated successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:update-user-migration-plan error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:delete-user-migration-plan
   * Deletes a user migration plan
   */
  ipcMain.handle('migration:delete-user-migration-plan', async (_, args: { id: string }) => {
    try {
      const { id } = args;
      console.log(`[IPC] Deleting user migration plan: ${id}`);
      const { databaseService } = await import('./services/databaseService');
      await databaseService.deleteUserMigrationPlan?.(id);
      return { success: true, message: 'User migration plan deleted successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:delete-user-migration-plan error:', error);
      return { success: false, error: error.message };
    }
  });

  // ---- Azure Resource Migration Handlers ----

  /**
   * IPC Handler: migration:get-azure-resources
   * Retrieves all Azure resource migrations
   */
  ipcMain.handle('migration:get-azure-resources', async () => {
    try {
      console.log('[IPC] Getting Azure resource migrations');
      const { databaseService } = await import('./services/databaseService');
      const resources = await databaseService.getAzureResourceMigrations?.() || [];
      return { success: true, data: resources };
    } catch (error: any) {
      console.error('[IPC] migration:get-azure-resources error:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  /**
   * IPC Handler: migration:create-azure-resource-migration
   * Creates a new Azure resource migration
   */
  ipcMain.handle('migration:create-azure-resource-migration', async (_, args: { resource: any }) => {
    try {
      const { resource } = args;
      console.log(`[IPC] Creating Azure resource migration: ${resource.resourceName}`);
      const { databaseService } = await import('./services/databaseService');
      const result = await databaseService.createAzureResourceMigration?.(resource);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:create-azure-resource-migration error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:assess-azure-resource
   * Runs assessment on an Azure resource for migration readiness
   */
  ipcMain.handle('migration:assess-azure-resource', async (_, args: { resourceId: string }) => {
    try {
      const { resourceId } = args;
      console.log(`[IPC] Assessing Azure resource: ${resourceId}`);
      const { PowerShellExecutionService } = await import('./services/powershellExecutionService');
      const psService = PowerShellExecutionService.getInstance();
      const result = await psService.executeScript(
        'Get-AzureResourceAssessment',
        { ResourceId: resourceId },
        { modulePath: 'Modules/Migration/AzureResourceMigration.psm1' }
      );
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:assess-azure-resource error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:execute-azure-migration
   * Executes an Azure resource migration
   */
  ipcMain.handle('migration:execute-azure-migration', async (_, args: { resourceId: string; options?: any }) => {
    try {
      const { resourceId, options } = args;
      console.log(`[IPC] Executing Azure resource migration: ${resourceId}`);
      const { PowerShellExecutionService } = await import('./services/powershellExecutionService');
      const psService = PowerShellExecutionService.getInstance();
      const result = await psService.executeScript(
        'Start-AzureMigration',
        { ResourceId: resourceId, ...options },
        { modulePath: 'Modules/Migration/AzureResourceMigration.psm1' }
      );
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:execute-azure-migration error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:rollback-azure-migration
   * Rolls back an Azure resource migration
   */
  ipcMain.handle('migration:rollback-azure-migration', async (_, args: { resourceId: string }) => {
    try {
      const { resourceId } = args;
      console.log(`[IPC] Rolling back Azure resource migration: ${resourceId}`);
      const { PowerShellExecutionService } = await import('./services/powershellExecutionService');
      const psService = PowerShellExecutionService.getInstance();
      const result = await psService.executeScript(
        'Undo-AzureMigration',
        { ResourceId: resourceId },
        { modulePath: 'Modules/Migration/AzureResourceMigration.psm1' }
      );
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:rollback-azure-migration error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:update-azure-resource-migration
   * Updates an Azure resource migration
   */
  ipcMain.handle('migration:update-azure-resource-migration', async (_, args: { id: string; updates: any }) => {
    try {
      const { id, updates } = args;
      console.log(`[IPC] Updating Azure resource migration: ${id}`);
      const { databaseService } = await import('./services/databaseService');
      await databaseService.updateAzureResourceMigration?.(id, updates);
      return { success: true, message: 'Azure resource migration updated successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:update-azure-resource-migration error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:delete-azure-resource-migration
   * Deletes an Azure resource migration
   */
  ipcMain.handle('migration:delete-azure-resource-migration', async (_, args: { id: string }) => {
    try {
      const { id } = args;
      console.log(`[IPC] Deleting Azure resource migration: ${id}`);
      const { databaseService } = await import('./services/databaseService');
      await databaseService.deleteAzureResourceMigration?.(id);
      return { success: true, message: 'Azure resource migration deleted successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:delete-azure-resource-migration error:', error);
      return { success: false, error: error.message };
    }
  });

  // ---- Cross-Domain Dependency Handlers ----

  /**
   * IPC Handler: migration:get-cross-domain-dependencies
   * Retrieves all cross-domain dependencies
   */
  ipcMain.handle('migration:get-cross-domain-dependencies', async () => {
    try {
      console.log('[IPC] Getting cross-domain dependencies');
      const { databaseService } = await import('./services/databaseService');
      const dependencies = await databaseService.getCrossDomainDependencies?.() || [];
      return { success: true, data: dependencies };
    } catch (error: any) {
      console.error('[IPC] migration:get-cross-domain-dependencies error:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  /**
   * IPC Handler: migration:create-cross-domain-dependency
   * Creates a new cross-domain dependency
   */
  ipcMain.handle('migration:create-cross-domain-dependency', async (_, args: { dependency: any }) => {
    try {
      const { dependency } = args;
      console.log(`[IPC] Creating cross-domain dependency: ${dependency.sourceEntity} -> ${dependency.targetEntity}`);
      const { databaseService } = await import('./services/databaseService');
      const result = await databaseService.createCrossDomainDependency?.(dependency);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:create-cross-domain-dependency error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:analyze-dependencies
   * Analyzes dependencies for a domain mapping
   */
  ipcMain.handle('migration:analyze-dependencies', async (_, args: { domainMappingId: string }) => {
    try {
      const { domainMappingId } = args;
      console.log(`[IPC] Analyzing dependencies for domain mapping: ${domainMappingId}`);
      const { PowerShellExecutionService } = await import('./services/powershellExecutionService');
      const psService = PowerShellExecutionService.getInstance();
      const result = await psService.executeScript(
        'Get-CrossDomainDependencies',
        { DomainMappingId: domainMappingId },
        { modulePath: 'Modules/Migration/UserMigration.psm1' }
      );
      return { success: true, data: result };
    } catch (error: any) {
      console.error('[IPC] migration:analyze-dependencies error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:delete-cross-domain-dependency
   * Deletes a cross-domain dependency
   */
  ipcMain.handle('migration:delete-cross-domain-dependency', async (_, args: { id: string }) => {
    try {
      const { id } = args;
      console.log(`[IPC] Deleting cross-domain dependency: ${id}`);
      const { databaseService } = await import('./services/databaseService');
      await databaseService.deleteCrossDomainDependency?.(id);
      return { success: true, message: 'Cross-domain dependency deleted successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:delete-cross-domain-dependency error:', error);
      return { success: false, error: error.message };
    }
  });

  // ---- Engineering Metrics Handlers ----

  /**
   * IPC Handler: migration:get-engineering-metrics
   * Retrieves engineering metrics for migration monitoring
   */
  ipcMain.handle('migration:get-engineering-metrics', async (_, args?: { timeRange?: string }) => {
    try {
      const timeRange = args?.timeRange || 'last24h';
      console.log(`[IPC] Getting engineering metrics for: ${timeRange}`);
      const { databaseService } = await import('./services/databaseService');
      const metrics = await databaseService.getEngineeringMetrics?.(timeRange) || [];
      return { success: true, data: metrics };
    } catch (error: any) {
      console.error('[IPC] migration:get-engineering-metrics error:', error);
      return { success: false, error: error.message, data: [] };
    }
  });

  /**
   * IPC Handler: migration:record-metric
   * Records a new engineering metric data point
   */
  ipcMain.handle('migration:record-metric', async (_, args: { metric: any }) => {
    try {
      const { metric } = args;
      console.log(`[IPC] Recording engineering metric: ${metric.metricType}`);
      const { databaseService } = await import('./services/databaseService');
      await databaseService.recordEngineeringMetric?.(metric);
      return { success: true, message: 'Metric recorded successfully' };
    } catch (error: any) {
      console.error('[IPC] migration:record-metric error:', error);
      return { success: false, error: error.message };
    }
  });

  /**
   * IPC Handler: migration:calculate-health-score
   * Calculates the overall migration health score
   */
  ipcMain.handle('migration:calculate-health-score', async () => {
    try {
      console.log('[IPC] Calculating migration health score');
      const { databaseService } = await import('./services/databaseService');
      const healthScore = await databaseService.calculateHealthScore?.() || null;
      return { success: true, data: healthScore };
    } catch (error: any) {
      console.error('[IPC] migration:calculate-health-score error:', error);
      return { success: false, error: error.message, data: null };
    }
  });

  /**
   * IPC Handler: migration:get-metrics-summary
   * Retrieves a summary of engineering metrics
   */
  ipcMain.handle('migration:get-metrics-summary', async () => {
    try {
      console.log('[IPC] Getting engineering metrics summary');
      const { databaseService } = await import('./services/databaseService');
      const summary = await databaseService.getMetricsSummary?.() || null;
      return { success: true, data: summary };
    } catch (error: any) {
      console.error('[IPC] migration:get-metrics-summary error:', error);
      return { success: false, error: error.message, data: null };
    }
  });

  /**
   * IPC Handler: migration:get-real-time-stats
   * Retrieves real-time migration statistics
   */
  ipcMain.handle('migration:get-real-time-stats', async () => {
    try {
      console.log('[IPC] Getting real-time migration statistics');
      const { databaseService } = await import('./services/databaseService');
      const stats = await databaseService.getRealTimeStats?.() || {
        activeMigrations: 0,
        queuedItems: 0,
        completedToday: 0,
        failedToday: 0,
        throughput: { itemsPerHour: 0, mbPerSecond: 0 }
      };
      return { success: true, data: stats };
    } catch (error: any) {
      console.error('[IPC] migration:get-real-time-stats error:', error);
      return { success: false, error: error.message, data: null };
    }
  });

  console.log('[IPC] Migration persistence handlers registered');
  console.log('[IPC] Enhanced Migration Control Plane handlers registered');
}

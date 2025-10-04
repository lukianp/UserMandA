/**
 * Migration Validation Service
 *
 * Pre-flight validation with:
 * - User prerequisite validation (licenses, permissions, mailbox size)
 * - Target environment capacity checks
 * - Resource mapping validation (groups, distribution lists, etc.)
 * - Network connectivity verification
 * - Migration blocker detection (legacy protocols, custom attributes)
 * - Dependency validation (user A requires user B to migrate first)
 * - Schedule conflict detection
 * - Validation report generation (passed/warnings/errors)
 * - Remediation suggestions
 * - Batch validation support
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import PowerShellExecutionService from './powerShellService';
import { ExecutionResult } from '../../types/shared';

/**
 * Validation severity
 */
export type ValidationSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Validation type
 */
export type ValidationType =
  | 'license'
  | 'permission'
  | 'capacity'
  | 'mapping'
  | 'connectivity'
  | 'blocker'
  | 'dependency'
  | 'schedule';

/**
 * Validation result
 */
export interface ValidationResult {
  id: string;
  type: ValidationType;
  severity: ValidationSeverity;
  passed: boolean;
  message: string;
  details: string;
  affectedItems: string[];
  remediation?: string;
  timestamp: Date;
}

/**
 * Validation report
 */
export interface ValidationReport {
  id: string;
  waveId: string;
  timestamp: Date;
  totalChecks: number;
  passedChecks: number;
  warnings: number;
  errors: number;
  criticalErrors: number;
  results: ValidationResult[];
  overallStatus: 'passed' | 'passed-with-warnings' | 'failed';
  canProceed: boolean;
  estimatedImpact: string;
}

/**
 * User validation
 */
interface UserValidation {
  userId: string;
  userPrincipalName: string;
  licenses: LicenseValidation;
  permissions: PermissionValidation;
  mailboxSize: MailboxValidation;
  blockers: BlockerValidation[];
  dependencies: DependencyValidation[];
  passed: boolean;
}

/**
 * License validation
 */
interface LicenseValidation {
  required: string[];
  assigned: string[];
  missing: string[];
  available: boolean;
}

/**
 * Permission validation
 */
interface PermissionValidation {
  required: string[];
  current: string[];
  missing: string[];
  sufficient: boolean;
}

/**
 * Mailbox validation
 */
interface MailboxValidation {
  currentSize: number; // MB
  quota: number; // MB
  targetQuota: number; // MB
  withinLimit: boolean;
  compressionEstimate: number; // MB
}

/**
 * Blocker validation
 */
interface BlockerValidation {
  type: 'legacy-protocol' | 'custom-attribute' | 'forwarding-rule' | 'retention-policy' | 'litigation-hold';
  severity: ValidationSeverity;
  description: string;
  remediation: string;
}

/**
 * Dependency validation
 */
interface DependencyValidation {
  dependsOn: string; // User ID
  reason: string;
  status: 'pending' | 'ready' | 'blocked';
}

/**
 * Capacity validation
 */
interface CapacityValidation {
  targetEnvironment: string;
  currentMailboxes: number;
  maxMailboxes: number;
  plannedMigrations: number;
  remainingCapacity: number;
  sufficient: boolean;
}

/**
 * Migration Validation Service
 */
class MigrationValidationService extends EventEmitter {
  private powerShellService: PowerShellExecutionService;
  private reports: Map<string, ValidationReport>;
  private dataDir: string;

  constructor(powerShellService: PowerShellExecutionService, dataDir?: string) {
    super();
    this.powerShellService = powerShellService;
    this.reports = new Map();
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'validation');

    this.ensureDataDirectory();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create validation data directory:', error);
    }
  }

  /**
   * Validate wave before execution
   */
  async validateWave(
    waveId: string,
    users: string[],
    mappings: any[],
    options: {
      skipLicenses?: boolean;
      skipPermissions?: boolean;
      skipCapacity?: boolean;
    } = {}
  ): Promise<ValidationReport> {
    const reportId = crypto.randomUUID();
    const results: ValidationResult[] = [];

    console.log(`Starting validation for wave ${waveId} with ${users.length} users`);
    this.emit('validation:started', { waveId, userCount: users.length });

    try {
      // 1. Validate connectivity
      const connectivityResult = await this.validateConnectivity(waveId);
      results.push(connectivityResult);

      if (!connectivityResult.passed) {
        throw new Error('Connectivity validation failed - cannot proceed');
      }

      // 2. Validate target capacity
      if (!options.skipCapacity) {
        const capacityResult = await this.validateCapacity(waveId, users.length);
        results.push(capacityResult);
      }

      // 3. Validate users in batches
      const batchSize = 50;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        const userResults = await this.validateUserBatch(
          waveId,
          batch,
          { skipLicenses: options.skipLicenses, skipPermissions: options.skipPermissions }
        );
        results.push(...userResults);

        this.emit('validation:progress', {
          waveId,
          progress: Math.round(((i + batch.length) / users.length) * 100),
        });
      }

      // 4. Validate resource mappings
      const mappingResults = await this.validateMappings(waveId, mappings);
      results.push(...mappingResults);

      // 5. Validate dependencies
      const dependencyResult = await this.validateDependencies(waveId, users);
      results.push(dependencyResult);

      // 6. Validate schedule conflicts
      const scheduleResult = await this.validateSchedule(waveId);
      results.push(scheduleResult);

      // 7. Detect migration blockers
      const blockerResults = await this.detectBlockers(waveId, users);
      results.push(...blockerResults);

      // Generate report
      const report = this.generateReport(reportId, waveId, results);
      this.reports.set(reportId, report);

      // Persist report
      await this.saveReport(report);

      this.emit('validation:completed', { waveId, report });

      return report;
    } catch (error: any) {
      console.error('Validation failed:', error);

      const errorResult: ValidationResult = {
        id: crypto.randomUUID(),
        type: 'connectivity',
        severity: 'critical',
        passed: false,
        message: 'Validation failed',
        details: error.message,
        affectedItems: [waveId],
        timestamp: new Date(),
      };

      const report = this.generateReport(reportId, waveId, [errorResult]);
      this.reports.set(reportId, report);

      this.emit('validation:failed', { waveId, error: error.message });

      return report;
    }
  }

  /**
   * Validate connectivity
   */
  private async validateConnectivity(waveId: string): Promise<ValidationResult> {
    try {
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Test-MigrationConnectivity.ps1',
        ['-WaveId', waveId],
        { timeout: 30000 }
      );

      if (!result.success || !result.data) {
        return {
          id: crypto.randomUUID(),
          type: 'connectivity',
          severity: 'critical',
          passed: false,
          message: 'Connectivity validation failed',
          details: result.error || 'Unable to connect to source and target environments',
          affectedItems: [waveId],
          remediation: 'Check network connectivity and credentials for both environments',
          timestamp: new Date(),
        };
      }

      const { sourceConnected, targetConnected, latency } = result.data;

      return {
        id: crypto.randomUUID(),
        type: 'connectivity',
        severity: sourceConnected && targetConnected ? 'info' : 'critical',
        passed: sourceConnected && targetConnected,
        message: `Source: ${sourceConnected ? 'Connected' : 'Disconnected'}, Target: ${targetConnected ? 'Connected' : 'Disconnected'}`,
        details: `Network latency: ${latency}ms`,
        affectedItems: [waveId],
        remediation: !sourceConnected || !targetConnected
          ? 'Verify network connectivity and authentication credentials'
          : undefined,
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        id: crypto.randomUUID(),
        type: 'connectivity',
        severity: 'critical',
        passed: false,
        message: 'Connectivity check failed',
        details: error.message,
        affectedItems: [waveId],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate target capacity
   */
  private async validateCapacity(waveId: string, userCount: number): Promise<ValidationResult> {
    try {
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Get-TargetCapacity.ps1',
        ['-WaveId', waveId],
        { timeout: 30000 }
      );

      if (!result.success || !result.data) {
        return {
          id: crypto.randomUUID(),
          type: 'capacity',
          severity: 'error',
          passed: false,
          message: 'Capacity validation failed',
          details: result.error || 'Unable to determine target capacity',
          affectedItems: [waveId],
          timestamp: new Date(),
        };
      }

      const capacity: CapacityValidation = result.data;
      const sufficient = capacity.remainingCapacity >= userCount;

      return {
        id: crypto.randomUUID(),
        type: 'capacity',
        severity: sufficient ? 'info' : 'critical',
        passed: sufficient,
        message: `Target capacity: ${capacity.remainingCapacity} available, ${userCount} required`,
        details: `Current: ${capacity.currentMailboxes}/${capacity.maxMailboxes}, Planned: ${userCount}`,
        affectedItems: [waveId],
        remediation: !sufficient
          ? `Increase target capacity by ${userCount - capacity.remainingCapacity} mailboxes or reduce wave size`
          : undefined,
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        id: crypto.randomUUID(),
        type: 'capacity',
        severity: 'error',
        passed: false,
        message: 'Capacity check failed',
        details: error.message,
        affectedItems: [waveId],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate user batch
   */
  private async validateUserBatch(
    waveId: string,
    users: string[],
    options: { skipLicenses?: boolean; skipPermissions?: boolean }
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Test-UserPrerequisites.ps1',
        [
          '-WaveId', waveId,
          '-Users', JSON.stringify(users),
          '-SkipLicenses', options.skipLicenses ? '$true' : '$false',
          '-SkipPermissions', options.skipPermissions ? '$true' : '$false',
        ],
        { timeout: 60000 }
      );

      if (!result.success || !result.data) {
        results.push({
          id: crypto.randomUUID(),
          type: 'license',
          severity: 'error',
          passed: false,
          message: 'User validation failed',
          details: result.error || 'Unable to validate user prerequisites',
          affectedItems: users,
          timestamp: new Date(),
        });
        return results;
      }

      const userValidations: UserValidation[] = result.data.users || [];

      for (const userVal of userValidations) {
        // License validation
        if (!options.skipLicenses && userVal.licenses.missing.length > 0) {
          results.push({
            id: crypto.randomUUID(),
            type: 'license',
            severity: 'error',
            passed: false,
            message: `Missing licenses for ${userVal.userPrincipalName}`,
            details: `Required: ${userVal.licenses.required.join(', ')}, Missing: ${userVal.licenses.missing.join(', ')}`,
            affectedItems: [userVal.userId],
            remediation: `Assign the following licenses: ${userVal.licenses.missing.join(', ')}`,
            timestamp: new Date(),
          });
        }

        // Permission validation
        if (!options.skipPermissions && userVal.permissions.missing.length > 0) {
          results.push({
            id: crypto.randomUUID(),
            type: 'permission',
            severity: 'warning',
            passed: false,
            message: `Insufficient permissions for ${userVal.userPrincipalName}`,
            details: `Missing: ${userVal.permissions.missing.join(', ')}`,
            affectedItems: [userVal.userId],
            remediation: `Grant the following permissions: ${userVal.permissions.missing.join(', ')}`,
            timestamp: new Date(),
          });
        }

        // Mailbox size validation
        if (!userVal.mailboxSize.withinLimit) {
          results.push({
            id: crypto.randomUUID(),
            type: 'capacity',
            severity: 'warning',
            passed: false,
            message: `Mailbox size exceeds quota for ${userVal.userPrincipalName}`,
            details: `Size: ${userVal.mailboxSize.currentSize}MB, Quota: ${userVal.mailboxSize.targetQuota}MB`,
            affectedItems: [userVal.userId],
            remediation: `Reduce mailbox size or increase target quota`,
            timestamp: new Date(),
          });
        }

        // Blocker validation
        for (const blocker of userVal.blockers) {
          results.push({
            id: crypto.randomUUID(),
            type: 'blocker',
            severity: blocker.severity,
            passed: false,
            message: `Migration blocker: ${blocker.type} for ${userVal.userPrincipalName}`,
            details: blocker.description,
            affectedItems: [userVal.userId],
            remediation: blocker.remediation,
            timestamp: new Date(),
          });
        }
      }
    } catch (error: any) {
      results.push({
        id: crypto.randomUUID(),
        type: 'license',
        severity: 'error',
        passed: false,
        message: 'User batch validation failed',
        details: error.message,
        affectedItems: users,
        timestamp: new Date(),
      });
    }

    return results;
  }

  /**
   * Validate resource mappings
   */
  private async validateMappings(waveId: string, mappings: any[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Test-ResourceMappings.ps1',
        ['-WaveId', waveId, '-Mappings', JSON.stringify(mappings)],
        { timeout: 60000 }
      );

      if (!result.success || !result.data) {
        results.push({
          id: crypto.randomUUID(),
          type: 'mapping',
          severity: 'error',
          passed: false,
          message: 'Mapping validation failed',
          details: result.error || 'Unable to validate resource mappings',
          affectedItems: [waveId],
          timestamp: new Date(),
        });
        return results;
      }

      const { invalidMappings, unmappedResources, conflicts } = result.data;

      if (invalidMappings && invalidMappings.length > 0) {
        results.push({
          id: crypto.randomUUID(),
          type: 'mapping',
          severity: 'error',
          passed: false,
          message: `${invalidMappings.length} invalid mappings detected`,
          details: invalidMappings.map((m: any) => `${m.source} -> ${m.target}: ${m.reason}`).join(', '),
          affectedItems: invalidMappings.map((m: any) => m.source),
          remediation: 'Review and correct invalid mappings',
          timestamp: new Date(),
        });
      }

      if (unmappedResources && unmappedResources.length > 0) {
        results.push({
          id: crypto.randomUUID(),
          type: 'mapping',
          severity: 'warning',
          passed: false,
          message: `${unmappedResources.length} resources not mapped`,
          details: unmappedResources.join(', '),
          affectedItems: unmappedResources,
          remediation: 'Map these resources or exclude them from migration',
          timestamp: new Date(),
        });
      }

      if (conflicts && conflicts.length > 0) {
        results.push({
          id: crypto.randomUUID(),
          type: 'mapping',
          severity: 'error',
          passed: false,
          message: `${conflicts.length} mapping conflicts detected`,
          details: conflicts.map((c: any) => `${c.resource}: ${c.conflict}`).join(', '),
          affectedItems: conflicts.map((c: any) => c.resource),
          remediation: 'Resolve mapping conflicts before proceeding',
          timestamp: new Date(),
        });
      }
    } catch (error: any) {
      results.push({
        id: crypto.randomUUID(),
        type: 'mapping',
        severity: 'error',
        passed: false,
        message: 'Mapping validation failed',
        details: error.message,
        affectedItems: [waveId],
        timestamp: new Date(),
      });
    }

    return results;
  }

  /**
   * Validate dependencies
   */
  private async validateDependencies(waveId: string, users: string[]): Promise<ValidationResult> {
    try {
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Test-UserDependencies.ps1',
        ['-WaveId', waveId, '-Users', JSON.stringify(users)],
        { timeout: 60000 }
      );

      if (!result.success || !result.data) {
        return {
          id: crypto.randomUUID(),
          type: 'dependency',
          severity: 'error',
          passed: false,
          message: 'Dependency validation failed',
          details: result.error || 'Unable to validate dependencies',
          affectedItems: [waveId],
          timestamp: new Date(),
        };
      }

      const { blockedUsers, circularDependencies } = result.data;

      if (blockedUsers && blockedUsers.length > 0) {
        return {
          id: crypto.randomUUID(),
          type: 'dependency',
          severity: 'error',
          passed: false,
          message: `${blockedUsers.length} users have unmet dependencies`,
          details: blockedUsers.map((u: any) => `${u.user} depends on ${u.dependsOn}`).join(', '),
          affectedItems: blockedUsers.map((u: any) => u.user),
          remediation: 'Migrate dependent users first or remove dependencies',
          timestamp: new Date(),
        };
      }

      if (circularDependencies && circularDependencies.length > 0) {
        return {
          id: crypto.randomUUID(),
          type: 'dependency',
          severity: 'critical',
          passed: false,
          message: 'Circular dependencies detected',
          details: circularDependencies.join(', '),
          affectedItems: circularDependencies,
          remediation: 'Break circular dependencies by removing one dependency from the cycle',
          timestamp: new Date(),
        };
      }

      return {
        id: crypto.randomUUID(),
        type: 'dependency',
        severity: 'info',
        passed: true,
        message: 'All dependencies satisfied',
        details: 'No dependency issues found',
        affectedItems: [],
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        id: crypto.randomUUID(),
        type: 'dependency',
        severity: 'error',
        passed: false,
        message: 'Dependency validation failed',
        details: error.message,
        affectedItems: [waveId],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Validate schedule conflicts
   */
  private async validateSchedule(waveId: string): Promise<ValidationResult> {
    try {
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Test-ScheduleConflicts.ps1',
        ['-WaveId', waveId],
        { timeout: 30000 }
      );

      if (!result.success || !result.data) {
        return {
          id: crypto.randomUUID(),
          type: 'schedule',
          severity: 'warning',
          passed: true,
          message: 'Schedule validation skipped',
          details: result.error || 'Unable to validate schedule',
          affectedItems: [waveId],
          timestamp: new Date(),
        };
      }

      const { conflicts } = result.data;

      if (conflicts && conflicts.length > 0) {
        return {
          id: crypto.randomUUID(),
          type: 'schedule',
          severity: 'warning',
          passed: false,
          message: `${conflicts.length} schedule conflicts detected`,
          details: conflicts.map((c: any) => `${c.wave}: ${c.conflict}`).join(', '),
          affectedItems: conflicts.map((c: any) => c.wave),
          remediation: 'Adjust wave schedule to avoid conflicts',
          timestamp: new Date(),
        };
      }

      return {
        id: crypto.randomUUID(),
        type: 'schedule',
        severity: 'info',
        passed: true,
        message: 'No schedule conflicts',
        details: 'Wave schedule is valid',
        affectedItems: [],
        timestamp: new Date(),
      };
    } catch (error: any) {
      return {
        id: crypto.randomUUID(),
        type: 'schedule',
        severity: 'warning',
        passed: true,
        message: 'Schedule validation failed',
        details: error.message,
        affectedItems: [waveId],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Detect migration blockers
   */
  private async detectBlockers(waveId: string, users: string[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    try {
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Find-MigrationBlockers.ps1',
        ['-WaveId', waveId, '-Users', JSON.stringify(users)],
        { timeout: 120000 }
      );

      if (!result.success || !result.data) {
        results.push({
          id: crypto.randomUUID(),
          type: 'blocker',
          severity: 'warning',
          passed: true,
          message: 'Blocker detection skipped',
          details: result.error || 'Unable to detect blockers',
          affectedItems: [waveId],
          timestamp: new Date(),
        });
        return results;
      }

      const { blockers } = result.data;

      for (const blocker of blockers || []) {
        results.push({
          id: crypto.randomUUID(),
          type: 'blocker',
          severity: blocker.severity || 'warning',
          passed: false,
          message: `${blocker.type}: ${blocker.affectedUsers.length} users affected`,
          details: blocker.description,
          affectedItems: blocker.affectedUsers,
          remediation: blocker.remediation,
          timestamp: new Date(),
        });
      }
    } catch (error: any) {
      results.push({
        id: crypto.randomUUID(),
        type: 'blocker',
        severity: 'warning',
        passed: true,
        message: 'Blocker detection failed',
        details: error.message,
        affectedItems: [waveId],
        timestamp: new Date(),
      });
    }

    return results;
  }

  /**
   * Generate validation report
   */
  private generateReport(reportId: string, waveId: string, results: ValidationResult[]): ValidationReport {
    const passedChecks = results.filter(r => r.passed).length;
    const warnings = results.filter(r => r.severity === 'warning').length;
    const errors = results.filter(r => r.severity === 'error').length;
    const criticalErrors = results.filter(r => r.severity === 'critical').length;

    const canProceed = criticalErrors === 0 && errors === 0;
    const overallStatus = canProceed
      ? warnings > 0 ? 'passed-with-warnings' : 'passed'
      : 'failed';

    const estimatedImpact = this.calculateEstimatedImpact(results);

    return {
      id: reportId,
      waveId,
      timestamp: new Date(),
      totalChecks: results.length,
      passedChecks,
      warnings,
      errors,
      criticalErrors,
      results,
      overallStatus,
      canProceed,
      estimatedImpact,
    };
  }

  /**
   * Calculate estimated impact
   */
  private calculateEstimatedImpact(results: ValidationResult[]): string {
    const affectedUsers = new Set<string>();
    for (const result of results) {
      if (!result.passed && result.severity !== 'info') {
        result.affectedItems.forEach(item => affectedUsers.add(item));
      }
    }

    if (affectedUsers.size === 0) {
      return 'No impact - all checks passed';
    }

    const criticalCount = results.filter(r => r.severity === 'critical').length;
    const errorCount = results.filter(r => r.severity === 'error').length;

    if (criticalCount > 0) {
      return `Critical impact - ${affectedUsers.size} users affected, ${criticalCount} critical issues`;
    } else if (errorCount > 0) {
      return `High impact - ${affectedUsers.size} users affected, ${errorCount} errors`;
    } else {
      return `Low impact - ${affectedUsers.size} users affected, warnings only`;
    }
  }

  /**
   * Save report to file
   */
  private async saveReport(report: ValidationReport): Promise<void> {
    try {
      const filename = `validation-${report.waveId}-${Date.now()}.json`;
      const filepath = path.join(this.dataDir, filename);
      await fs.writeFile(filepath, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`Validation report saved: ${filepath}`);
    } catch (error) {
      console.error('Failed to save validation report:', error);
    }
  }

  /**
   * Get validation report
   */
  getReport(reportId: string): ValidationReport | null {
    return this.reports.get(reportId) || null;
  }

  /**
   * Get all reports for a wave
   */
  getWaveReports(waveId: string): ValidationReport[] {
    return Array.from(this.reports.values()).filter(r => r.waveId === waveId);
  }

  /**
   * Export report to HTML
   */
  async exportReportHTML(reportId: string): Promise<string> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    // Generate HTML report (simplified)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Migration Validation Report - ${report.waveId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
    .summary { display: flex; gap: 20px; margin: 20px 0; }
    .stat { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .result { margin: 10px 0; padding: 10px; border-left: 4px solid; }
    .result.info { border-color: #2196F3; background: #E3F2FD; }
    .result.warning { border-color: #FF9800; background: #FFF3E0; }
    .result.error { border-color: #F44336; background: #FFEBEE; }
    .result.critical { border-color: #D32F2F; background: #FFCDD2; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Migration Validation Report</h1>
    <p>Wave ID: ${report.waveId}</p>
    <p>Timestamp: ${report.timestamp.toISOString()}</p>
    <p>Status: <strong>${report.overallStatus.toUpperCase()}</strong></p>
    <p>Can Proceed: <strong>${report.canProceed ? 'YES' : 'NO'}</strong></p>
  </div>

  <div class="summary">
    <div class="stat"><strong>${report.totalChecks}</strong> Total Checks</div>
    <div class="stat"><strong>${report.passedChecks}</strong> Passed</div>
    <div class="stat"><strong>${report.warnings}</strong> Warnings</div>
    <div class="stat"><strong>${report.errors}</strong> Errors</div>
    <div class="stat"><strong>${report.criticalErrors}</strong> Critical</div>
  </div>

  <h2>Estimated Impact</h2>
  <p>${report.estimatedImpact}</p>

  <h2>Validation Results</h2>
  ${report.results.map(r => `
    <div class="result ${r.severity}">
      <h3>${r.message} ${r.passed ? '✓' : '✗'}</h3>
      <p><strong>Type:</strong> ${r.type} | <strong>Severity:</strong> ${r.severity}</p>
      <p>${r.details}</p>
      ${r.remediation ? `<p><strong>Remediation:</strong> ${r.remediation}</p>` : ''}
      ${r.affectedItems.length > 0 ? `<p><strong>Affected:</strong> ${r.affectedItems.join(', ')}</p>` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;

    const filename = `validation-report-${reportId}.html`;
    const filepath = path.join(this.dataDir, filename);
    await fs.writeFile(filepath, html, 'utf-8');

    return filepath;
  }
}

export default MigrationValidationService;
export {
  ValidationSeverity,
  ValidationType,
  ValidationResult,
  ValidationReport,
};

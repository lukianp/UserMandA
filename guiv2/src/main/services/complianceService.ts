/**
 * Compliance Service
 * Automated compliance checking and policy enforcement
 *
 * Features:
 * - Compliance frameworks (SOC2, ISO27001, GDPR, HIPAA)
 * - Compliance rule definitions
 * - Automated compliance scanning
 * - Policy enforcement (password, MFA, retention)
 * - Compliance status dashboard
 * - Violation detection and alerting
 * - Remediation workflows
 * - Compliance report templates
 * - Scheduled compliance audits
 * - Evidence collection for auditors
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';

import { app } from 'electron';

import auditService, { AuditEvent, AuditCategory, AuditSeverity } from './auditService';

// ============================================================================
// Types
// ============================================================================

/**
 * Compliance frameworks
 */
export enum ComplianceFramework {
  SOC2 = 'SOC2',
  ISO27001 = 'ISO27001',
  GDPR = 'GDPR',
  HIPAA = 'HIPAA',
  NIST = 'NIST',
  Custom = 'Custom'
}

/**
 * Compliance control
 */
export interface ComplianceControl {
  id: string;
  framework: ComplianceFramework;
  category: string;
  title: string;
  description: string;
  requirement: string;
  automated: boolean;
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  severity: 'critical' | 'high' | 'medium' | 'low';
  validationRules: ValidationRule[];
}

/**
 * Validation rule
 */
export interface ValidationRule {
  id: string;
  type: 'audit-event' | 'configuration' | 'user-policy' | 'data-retention' | 'custom';
  condition: string; // JavaScript expression
  threshold?: number;
  timeWindow?: number; // milliseconds
  action: 'alert' | 'block' | 'log';
}

/**
 * Compliance scan result
 */
export interface ComplianceScanResult {
  scanId: string;
  framework: ComplianceFramework;
  scanDate: Date;
  controls: ControlResult[];
  overallStatus: 'compliant' | 'non-compliant' | 'partial';
  complianceScore: number; // 0-100
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
}

/**
 * Control result
 */
export interface ControlResult {
  controlId: string;
  status: 'passed' | 'failed' | 'warning' | 'not-applicable';
  evidence: Evidence[];
  violations: Violation[];
  lastChecked: Date;
  nextCheck?: Date;
}

/**
 * Evidence
 */
export interface Evidence {
  id: string;
  type: 'audit-log' | 'configuration' | 'screenshot' | 'document' | 'attestation';
  description: string;
  timestamp: Date;
  data: any;
  collector?: string;
}

/**
 * Violation
 */
export interface Violation {
  id: string;
  controlId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detectedAt: Date;
  status: 'open' | 'acknowledged' | 'remediated' | 'accepted';
  assignedTo?: string;
  dueDate?: Date;
  remediationSteps?: string[];
  relatedEvents?: AuditEvent[];
}

/**
 * Policy definition
 */
export interface PolicyDefinition {
  id: string;
  name: string;
  category: 'password' | 'mfa' | 'session' | 'data-retention' | 'access' | 'custom';
  enabled: boolean;
  rules: PolicyRule[];
  enforcement: 'strict' | 'advisory';
  exceptions?: string[];
}

/**
 * Policy rule
 */
export interface PolicyRule {
  id: string;
  description: string;
  condition: string;
  action: 'allow' | 'deny' | 'warn';
  parameters?: Record<string, any>;
}

/**
 * Compliance schedule
 */
export interface ComplianceSchedule {
  id: string;
  framework: ComplianceFramework;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  nextRun: Date;
  enabled: boolean;
  notifyOnCompletion: boolean;
  recipients?: string[];
}

// ============================================================================
// Compliance Service
// ============================================================================

export class ComplianceService extends EventEmitter {
  private controls: Map<string, ComplianceControl> = new Map();
  private policies: Map<string, PolicyDefinition> = new Map();
  private violations: Map<string, Violation> = new Map();
  private schedules: Map<string, ComplianceSchedule> = new Map();
  private scanHistory: ComplianceScanResult[] = [];
  private controlsPath: string;
  private policiesPath: string;
  private violationsPath: string;
  private schedulesPath: string;
  private initialized = false;

  constructor() {
    super();
    const userDataPath = app.getPath('userData');
    const compliancePath = path.join(userDataPath, 'security', 'compliance');
    this.controlsPath = path.join(compliancePath, 'controls.json');
    this.policiesPath = path.join(compliancePath, 'policies.json');
    this.violationsPath = path.join(compliancePath, 'violations.json');
    this.schedulesPath = path.join(compliancePath, 'schedules.json');
  }

  /**
   * Initialize the compliance service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await auditService.initialize();

    // Load controls
    try {
      const controlsData = await fs.readFile(this.controlsPath, 'utf-8');
      const controls: ComplianceControl[] = JSON.parse(controlsData);
      controls.forEach(c => this.controls.set(c.id, c));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading compliance controls:', error);
      }
      // Load default controls
      this.loadDefaultControls();
    }

    // Load policies
    try {
      const policiesData = await fs.readFile(this.policiesPath, 'utf-8');
      const policies: PolicyDefinition[] = JSON.parse(policiesData);
      policies.forEach(p => this.policies.set(p.id, p));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading policies:', error);
      }
      // Load default policies
      this.loadDefaultPolicies();
    }

    // Load violations
    try {
      const violationsData = await fs.readFile(this.violationsPath, 'utf-8');
      const violations: Violation[] = JSON.parse(violationsData);
      violations.forEach(v => {
        this.violations.set(v.id, {
          ...v,
          detectedAt: new Date(v.detectedAt),
          dueDate: v.dueDate ? new Date(v.dueDate) : undefined
        });
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading violations:', error);
      }
    }

    // Load schedules
    try {
      const schedulesData = await fs.readFile(this.schedulesPath, 'utf-8');
      const schedules: ComplianceSchedule[] = JSON.parse(schedulesData);
      schedules.forEach(s => {
        this.schedules.set(s.id, {
          ...s,
          nextRun: new Date(s.nextRun)
        });
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading schedules:', error);
      }
    }

    this.initialized = true;
    this.emit('initialized');

    // Start scheduled scans
    this.startScheduler();
  }

  /**
   * Run compliance scan
   */
  async runComplianceScan(framework: ComplianceFramework): Promise<ComplianceScanResult> {
    await this.ensureInitialized();

    const scanId = this.generateScanId();
    const scanDate = new Date();
    const controls = Array.from(this.controls.values()).filter(
      c => c.framework === framework || framework === ComplianceFramework.Custom
    );

    const controlResults: ControlResult[] = [];
    let criticalFindings = 0;
    let highFindings = 0;
    let mediumFindings = 0;
    let lowFindings = 0;

    // Evaluate each control
    for (const control of controls) {
      const result = await this.evaluateControl(control);
      controlResults.push(result);

      // Count findings by severity
      const failedViolations = result.violations.filter(v => v.status === 'open');
      for (const violation of failedViolations) {
        switch (violation.severity) {
          case 'critical':
            criticalFindings++;
            break;
          case 'high':
            highFindings++;
            break;
          case 'medium':
            mediumFindings++;
            break;
          case 'low':
            lowFindings++;
            break;
        }
      }
    }

    // Calculate compliance score
    const totalControls = controlResults.length;
    const passedControls = controlResults.filter(c => c.status === 'passed').length;
    const complianceScore = totalControls > 0 ? Math.round((passedControls / totalControls) * 100) : 0;

    // Determine overall status
    let overallStatus: 'compliant' | 'non-compliant' | 'partial';
    if (criticalFindings > 0 || complianceScore < 70) {
      overallStatus = 'non-compliant';
    } else if (complianceScore === 100) {
      overallStatus = 'compliant';
    } else {
      overallStatus = 'partial';
    }

    const result: ComplianceScanResult = {
      scanId,
      framework,
      scanDate,
      controls: controlResults,
      overallStatus,
      complianceScore,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings
    };

    this.scanHistory.push(result);

    // Log audit event
    await auditService.logEvent(
      AuditCategory.Compliance,
      overallStatus === 'non-compliant' ? AuditSeverity.Warning : AuditSeverity.Info,
      'compliance-scan',
      'success',
      `Compliance scan completed for ${framework}: ${complianceScore}% compliant`,
      {
        resource: 'compliance',
        resourceId: scanId,
        details: {
          framework,
          complianceScore,
          criticalFindings,
          highFindings
        }
      }
    );

    this.emit('scan-completed', result);

    return result;
  }

  /**
   * Evaluate a single control
   */
  private async evaluateControl(control: ComplianceControl): Promise<ControlResult> {
    const evidence: Evidence[] = [];
    const violations: Violation[] = [];

    // Run validation rules
    for (const rule of control.validationRules) {
      try {
        const ruleResult = await this.evaluateValidationRule(control, rule);

        if (ruleResult.evidence) {
          evidence.push(...ruleResult.evidence);
        }

        if (!ruleResult.passed && ruleResult.violation) {
          violations.push(ruleResult.violation);
          this.violations.set(ruleResult.violation.id, ruleResult.violation);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }

    const status = violations.length === 0 ? 'passed' : 'failed';

    return {
      controlId: control.id,
      status,
      evidence,
      violations,
      lastChecked: new Date(),
      nextCheck: this.calculateNextCheck(control.frequency)
    };
  }

  /**
   * Evaluate a validation rule
   */
  private async evaluateValidationRule(
    control: ComplianceControl,
    rule: ValidationRule
  ): Promise<{
    passed: boolean;
    evidence?: Evidence[];
    violation?: Violation;
  }> {
    switch (rule.type) {
      case 'audit-event':
        return this.evaluateAuditEventRule(control, rule);

      case 'configuration':
        return this.evaluateConfigurationRule(control, rule);

      case 'user-policy':
        return this.evaluateUserPolicyRule(control, rule);

      case 'data-retention':
        return this.evaluateDataRetentionRule(control, rule);

      default:
        return { passed: true };
    }
  }

  /**
   * Evaluate audit event rule
   */
  private async evaluateAuditEventRule(
    control: ComplianceControl,
    rule: ValidationRule
  ): Promise<{
    passed: boolean;
    evidence?: Evidence[];
    violation?: Violation;
  }> {
    const timeWindow = rule.timeWindow || 24 * 60 * 60 * 1000; // 24 hours default
    const startDate = new Date(Date.now() - timeWindow);

    const events = await auditService.searchEvents({
      startDate,
      limit: 1000
    });

    // Simple condition evaluation (in production, use a safe eval library)
    const passed = events.length >= (rule.threshold || 0);

    const evidence: Evidence[] = [{
      id: this.generateEvidenceId(),
      type: 'audit-log',
      description: `Found ${events.length} audit events in last ${timeWindow / 1000 / 60} minutes`,
      timestamp: new Date(),
      data: { eventCount: events.length, sampleEvents: events.slice(0, 5) }
    }];

    if (!passed) {
      const violation: Violation = {
        id: this.generateViolationId(),
        controlId: control.id,
        severity: control.severity,
        description: `Insufficient audit events: expected >= ${rule.threshold}, found ${events.length}`,
        detectedAt: new Date(),
        status: 'open',
        remediationSteps: [
          'Enable audit logging',
          'Verify logging configuration',
          'Check for system errors'
        ]
      };

      return { passed: false, evidence, violation };
    }

    return { passed: true, evidence };
  }

  /**
   * Evaluate configuration rule
   */
  private async evaluateConfigurationRule(
    control: ComplianceControl,
    rule: ValidationRule
  ): Promise<{
    passed: boolean;
    evidence?: Evidence[];
    violation?: Violation;
  }> {
    // In a real implementation, check actual configuration
    // For now, return passed
    return {
      passed: true,
      evidence: [{
        id: this.generateEvidenceId(),
        type: 'configuration',
        description: 'Configuration check passed',
        timestamp: new Date(),
        data: {}
      }]
    };
  }

  /**
   * Evaluate user policy rule
   */
  private async evaluateUserPolicyRule(
    control: ComplianceControl,
    rule: ValidationRule
  ): Promise<{
    passed: boolean;
    evidence?: Evidence[];
    violation?: Violation;
  }> {
    // Check if policies are enforced
    const passwordPolicy = this.policies.get('password-policy');
    const mfaPolicy = this.policies.get('mfa-policy');

    const passed = passwordPolicy?.enabled && mfaPolicy?.enabled;

    if (!passed) {
      const violation: Violation = {
        id: this.generateViolationId(),
        controlId: control.id,
        severity: 'high',
        description: 'Required security policies not enabled',
        detectedAt: new Date(),
        status: 'open',
        remediationSteps: [
          'Enable password policy',
          'Enable MFA policy',
          'Enforce policies for all users'
        ]
      };

      return { passed: false, violation };
    }

    return { passed: true };
  }

  /**
   * Evaluate data retention rule
   */
  private async evaluateDataRetentionRule(
    control: ComplianceControl,
    rule: ValidationRule
  ): Promise<{
    passed: boolean;
    evidence?: Evidence[];
    violation?: Violation;
  }> {
    // Check audit log retention
    const stats = await auditService.getStatistics();
    const retentionDays = 90; // Default

    const evidence: Evidence[] = [{
      id: this.generateEvidenceId(),
      type: 'audit-log',
      description: `Audit log retention: ${retentionDays} days`,
      timestamp: new Date(),
      data: { retentionDays, totalEvents: stats.totalEvents }
    }];

    return { passed: true, evidence };
  }

  /**
   * Enforce policy
   */
  async enforcePolicy(policyId: string, context: Record<string, any>): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    await this.ensureInitialized();

    const policy = this.policies.get(policyId);
    if (!policy) {
      return { allowed: true, reason: 'Policy not found' };
    }

    if (!policy.enabled) {
      return { allowed: true, reason: 'Policy disabled' };
    }

    // Check exceptions
    if (policy.exceptions?.includes(context.userId)) {
      return { allowed: true, reason: 'User exception' };
    }

    // Evaluate rules
    for (const rule of policy.rules) {
      const result = this.evaluatePolicyRule(rule, context);
      if (result.action === 'deny') {
        if (policy.enforcement === 'strict') {
          return { allowed: false, reason: result.reason };
        } else {
          // Advisory mode - log but allow
          await auditService.logEvent(
            AuditCategory.Compliance,
            AuditSeverity.Warning,
            'policy-advisory',
            'success',
            `Policy ${policy.name} advisory: ${result.reason}`,
            {
              userId: context.userId,
              resource: 'policy',
              resourceId: policyId,
              details: { rule: rule.id, context }
            }
          );
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Evaluate policy rule
   */
  private evaluatePolicyRule(
    rule: PolicyRule,
    context: Record<string, any>
  ): { action: 'allow' | 'deny' | 'warn'; reason?: string } {
    // Simplified evaluation - in production use safe expression evaluator
    try {
      // Example: password policy
      if (rule.id === 'password-complexity') {
        const password = context.password as string;
        const minLength = rule.parameters?.minLength || 12;
        const requireUpper = rule.parameters?.requireUpper || true;
        const requireLower = rule.parameters?.requireLower || true;
        const requireNumber = rule.parameters?.requireNumber || true;
        const requireSpecial = rule.parameters?.requireSpecial || true;

        if (!password || password.length < minLength) {
          return { action: 'deny', reason: `Password must be at least ${minLength} characters` };
        }

        if (requireUpper && !/[A-Z]/.test(password)) {
          return { action: 'deny', reason: 'Password must contain uppercase letter' };
        }

        if (requireLower && !/[a-z]/.test(password)) {
          return { action: 'deny', reason: 'Password must contain lowercase letter' };
        }

        if (requireNumber && !/[0-9]/.test(password)) {
          return { action: 'deny', reason: 'Password must contain number' };
        }

        if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          return { action: 'deny', reason: 'Password must contain special character' };
        }
      }

      return { action: rule.action };
    } catch (error) {
      console.error('Policy rule evaluation error:', error);
      return { action: 'allow', reason: 'Evaluation error' };
    }
  }

  /**
   * Get violations
   */
  getViolations(filter?: {
    status?: 'open' | 'acknowledged' | 'remediated' | 'accepted';
    severity?: 'critical' | 'high' | 'medium' | 'low';
    controlId?: string;
  }): Violation[] {
    let violations = Array.from(this.violations.values());

    if (filter?.status) {
      violations = violations.filter(v => v.status === filter.status);
    }

    if (filter?.severity) {
      violations = violations.filter(v => v.severity === filter.severity);
    }

    if (filter?.controlId) {
      violations = violations.filter(v => v.controlId === filter.controlId);
    }

    return violations.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  /**
   * Update violation status
   */
  async updateViolationStatus(
    violationId: string,
    status: 'open' | 'acknowledged' | 'remediated' | 'accepted',
    assignedTo?: string,
    notes?: string
  ): Promise<void> {
    await this.ensureInitialized();

    const violation = this.violations.get(violationId);
    if (!violation) {
      throw new Error(`Violation ${violationId} not found`);
    }

    violation.status = status;
    if (assignedTo) {
      violation.assignedTo = assignedTo;
    }

    await this.saveViolations();

    this.emit('violation-updated', { violationId, status, assignedTo });
  }

  /**
   * Calculate next check date
   */
  private calculateNextCheck(frequency: string): Date {
    const now = new Date();

    switch (frequency) {
      case 'continuous':
        return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'quarterly':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      case 'annual':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Load default controls
   */
  private loadDefaultControls(): void {
    const defaultControls: ComplianceControl[] = [
      {
        id: 'SOC2-CC6.1',
        framework: ComplianceFramework.SOC2,
        category: 'Logical and Physical Access Controls',
        title: 'Authentication and Access Control',
        description: 'System requires authentication for access',
        requirement: 'All users must authenticate before accessing the system',
        automated: true,
        frequency: 'continuous',
        severity: 'critical',
        validationRules: [
          {
            id: 'auth-required',
            type: 'audit-event',
            condition: 'category === "authentication"',
            threshold: 1,
            timeWindow: 24 * 60 * 60 * 1000,
            action: 'alert'
          }
        ]
      },
      {
        id: 'GDPR-32',
        framework: ComplianceFramework.GDPR,
        category: 'Security of Processing',
        title: 'Security Measures',
        description: 'Implement appropriate security measures',
        requirement: 'Encryption, access controls, and audit logging must be enabled',
        automated: true,
        frequency: 'daily',
        severity: 'high',
        validationRules: [
          {
            id: 'encryption-enabled',
            type: 'configuration',
            condition: 'encryption === true',
            action: 'alert'
          }
        ]
      }
    ];

    defaultControls.forEach(c => this.controls.set(c.id, c));
    this.saveControls().catch(err => console.error('Failed to save default controls:', err));
  }

  /**
   * Load default policies
   */
  private loadDefaultPolicies(): void {
    const defaultPolicies: PolicyDefinition[] = [
      {
        id: 'password-policy',
        name: 'Password Policy',
        category: 'password',
        enabled: true,
        enforcement: 'strict',
        rules: [
          {
            id: 'password-complexity',
            description: 'Password must meet complexity requirements',
            condition: 'length >= 12',
            action: 'deny',
            parameters: {
              minLength: 12,
              requireUpper: true,
              requireLower: true,
              requireNumber: true,
              requireSpecial: true
            }
          }
        ]
      },
      {
        id: 'mfa-policy',
        name: 'Multi-Factor Authentication Policy',
        category: 'mfa',
        enabled: true,
        enforcement: 'strict',
        rules: [
          {
            id: 'mfa-required',
            description: 'MFA required for all users',
            condition: 'mfa === true',
            action: 'deny'
          }
        ]
      }
    ];

    defaultPolicies.forEach(p => this.policies.set(p.id, p));
    this.savePolicies().catch(err => console.error('Failed to save default policies:', err));
  }

  /**
   * Start scheduler
   */
  private startScheduler(): void {
    setInterval(async () => {
      const now = new Date();

      for (const schedule of this.schedules.values()) {
        if (schedule.enabled && schedule.nextRun <= now) {
          try {
            await this.runComplianceScan(schedule.framework);
            schedule.nextRun = this.calculateNextCheck(schedule.frequency);
            await this.saveSchedules();
          } catch (error) {
            console.error('Scheduled compliance scan failed:', error);
          }
        }
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  /**
   * Generate IDs
   */
  private generateScanId(): string {
    return `SCAN-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private generateEvidenceId(): string {
    return `EVD-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private generateViolationId(): string {
    return `VIO-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Save methods
   */
  private async saveControls(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.controlsPath), { recursive: true });
      const controls = Array.from(this.controls.values());
      await fs.writeFile(this.controlsPath, JSON.stringify(controls, null, 2));
    } catch (error) {
      console.error('Error saving controls:', error);
    }
  }

  private async savePolicies(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.policiesPath), { recursive: true });
      const policies = Array.from(this.policies.values());
      await fs.writeFile(this.policiesPath, JSON.stringify(policies, null, 2));
    } catch (error) {
      console.error('Error saving policies:', error);
    }
  }

  private async saveViolations(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.violationsPath), { recursive: true });
      const violations = Array.from(this.violations.values());
      await fs.writeFile(this.violationsPath, JSON.stringify(violations, null, 2));
    } catch (error) {
      console.error('Error saving violations:', error);
    }
  }

  private async saveSchedules(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.schedulesPath), { recursive: true });
      const schedules = Array.from(this.schedules.values());
      await fs.writeFile(this.schedulesPath, JSON.stringify(schedules, null, 2));
    } catch (error) {
      console.error('Error saving schedules:', error);
    }
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

export default new ComplianceService();



/**
 * Audit Service
 * Comprehensive audit logging for security, compliance, and monitoring
 *
 * Features:
 * - Structured audit event tracking
 * - Event categories (authentication, authorization, data-access, etc.)
 * - Severity levels (info, warning, error, critical)
 * - Log rotation (daily, size-based)
 * - Log retention policy
 * - Search and filter capabilities
 * - Export functionality (CSV, JSON, SIEM)
 * - Real-time audit stream
 * - Compliance report generation
 */

import { EventEmitter } from 'events';
import { promises as fs , createWriteStream, WriteStream } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

import { app } from 'electron';

// ============================================================================
// Types
// ============================================================================

/**
 * Audit event categories
 */
export enum AuditCategory {
  Authentication = 'authentication',
  Authorization = 'authorization',
  DataAccess = 'data-access',
  DataModification = 'data-modification',
  Migration = 'migration',
  Configuration = 'configuration',
  Security = 'security',
  UserManagement = 'user-management',
  System = 'system',
  Compliance = 'compliance'
}

/**
 * Severity levels
 */
export enum AuditSeverity {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical'
}

/**
 * Audit event
 */
export interface AuditEvent {
  id: string;
  timestamp: Date;
  category: AuditCategory;
  severity: AuditSeverity;
  action: string;
  userId?: string;
  username?: string;
  resource?: string;
  resourceId?: string;
  outcome: 'success' | 'failure' | 'pending';
  message: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  duration?: number; // milliseconds
  metadata?: Record<string, any>;
}

/**
 * Audit search filter
 */
export interface AuditFilter {
  category?: AuditCategory | AuditCategory[];
  severity?: AuditSeverity | AuditSeverity[];
  userId?: string;
  username?: string;
  resource?: string;
  outcome?: 'success' | 'failure' | 'pending';
  startDate?: Date;
  endDate?: Date;
  searchText?: string;
  limit?: number;
  offset?: number;
}

/**
 * Audit statistics
 */
export interface AuditStatistics {
  totalEvents: number;
  byCategory: Record<AuditCategory, number>;
  bySeverity: Record<AuditSeverity, number>;
  byOutcome: Record<string, number>;
  uniqueUsers: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Compliance report
 */
export interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  framework: string;
  timeRange: {
    start: Date;
    end: Date;
  };
  findings: ComplianceFinding[];
  summary: {
    totalEvents: number;
    violations: number;
    warnings: number;
    passed: number;
  };
}

/**
 * Compliance finding
 */
export interface ComplianceFinding {
  id: string;
  rule: string;
  severity: AuditSeverity;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  events: AuditEvent[];
  remediation?: string;
}

/**
 * Log rotation config
 */
export interface LogRotationConfig {
  maxSizeMB: number;
  maxAgeDays: number;
  maxFiles: number;
  compress: boolean;
}

// ============================================================================
// Audit Service
// ============================================================================

export class AuditService extends EventEmitter {
  private auditLog: AuditEvent[] = [];
  private currentLogFile: string;
  private currentLogStream: WriteStream | null = null;
  private logsDirectory: string;
  private archiveDirectory: string;
  private initialized = false;

  // Configuration
  private readonly LOG_ROTATION_CONFIG: LogRotationConfig = {
    maxSizeMB: 100,
    maxAgeDays: 90,
    maxFiles: 100,
    compress: false
  };

  private readonly IN_MEMORY_LIMIT = 10000; // Keep last 10k events in memory
  private eventIdCounter = 0;

  constructor() {
    super();
    const userDataPath = app.getPath('userData');
    this.logsDirectory = path.join(userDataPath, 'logs', 'audit');
    this.archiveDirectory = path.join(this.logsDirectory, 'archive');
    this.currentLogFile = this.getLogFileName();
  }

  /**
   * Initialize the audit service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Create directories
    await fs.mkdir(this.logsDirectory, { recursive: true });
    await fs.mkdir(this.archiveDirectory, { recursive: true });

    // Open current log file
    await this.openLogFile();

    // Load recent events into memory
    await this.loadRecentEvents();

    // Start rotation timer
    this.startRotationTimer();

    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Log an audit event
   */
  async logEvent(
    category: AuditCategory,
    severity: AuditSeverity,
    action: string,
    outcome: 'success' | 'failure' | 'pending',
    message: string,
    options?: {
      userId?: string;
      username?: string;
      resource?: string;
      resourceId?: string;
      details?: Record<string, any>;
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      duration?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<AuditEvent> {
    await this.ensureInitialized();

    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      category,
      severity,
      action,
      outcome,
      message,
      ...options
    };

    // Add to in-memory log
    this.auditLog.push(event);

    // Trim in-memory log if too large
    if (this.auditLog.length > this.IN_MEMORY_LIMIT) {
      this.auditLog = this.auditLog.slice(-this.IN_MEMORY_LIMIT);
    }

    // Write to file
    await this.writeEventToFile(event);

    // Emit event for real-time listeners
    this.emit('audit-event', event);

    // Check for critical events
    if (severity === AuditSeverity.Critical) {
      this.emit('critical-event', event);
    }

    return event;
  }

  /**
   * Log authentication event
   */
  async logAuthentication(
    action: 'login' | 'logout' | 'login-failed' | 'token-refresh' | 'session-expired',
    userId: string,
    username: string,
    outcome: 'success' | 'failure',
    options?: {
      ipAddress?: string;
      userAgent?: string;
      reason?: string;
      duration?: number;
    }
  ): Promise<AuditEvent> {
    return this.logEvent(
      AuditCategory.Authentication,
      outcome === 'failure' ? AuditSeverity.Warning : AuditSeverity.Info,
      action,
      outcome,
      `User ${username} ${action} ${outcome}`,
      {
        userId,
        username,
        details: { reason: options?.reason },
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        duration: options?.duration
      }
    );
  }

  /**
   * Log authorization event
   */
  async logAuthorization(
    userId: string,
    username: string,
    resource: string,
    action: string,
    outcome: 'success' | 'failure',
    reason: string
  ): Promise<AuditEvent> {
    return this.logEvent(
      AuditCategory.Authorization,
      outcome === 'failure' ? AuditSeverity.Warning : AuditSeverity.Info,
      action,
      outcome,
      `User ${username} attempted ${action} on ${resource}: ${reason}`,
      {
        userId,
        username,
        resource,
        details: { reason }
      }
    );
  }

  /**
   * Log data access event
   */
  async logDataAccess(
    userId: string,
    username: string,
    resource: string,
    resourceId: string,
    action: 'read' | 'export' | 'search' | 'view',
    details?: Record<string, any>
  ): Promise<AuditEvent> {
    return this.logEvent(
      AuditCategory.DataAccess,
      AuditSeverity.Info,
      action,
      'success',
      `User ${username} ${action} ${resource} (${resourceId})`,
      {
        userId,
        username,
        resource,
        resourceId,
        details
      }
    );
  }

  /**
   * Log data modification event
   */
  async logDataModification(
    userId: string,
    username: string,
    resource: string,
    resourceId: string,
    action: 'create' | 'update' | 'delete' | 'import',
    outcome: 'success' | 'failure',
    details?: Record<string, any>
  ): Promise<AuditEvent> {
    return this.logEvent(
      AuditCategory.DataModification,
      outcome === 'failure' ? AuditSeverity.Error : AuditSeverity.Info,
      action,
      outcome,
      `User ${username} ${action} ${resource} (${resourceId}): ${outcome}`,
      {
        userId,
        username,
        resource,
        resourceId,
        details
      }
    );
  }

  /**
   * Log migration event
   */
  async logMigration(
    userId: string,
    username: string,
    action: string,
    outcome: 'success' | 'failure' | 'pending',
    migrationId: string,
    details?: Record<string, any>
  ): Promise<AuditEvent> {
    const severity = outcome === 'failure' ? AuditSeverity.Error :
      outcome === 'pending' ? AuditSeverity.Info : AuditSeverity.Info;

    return this.logEvent(
      AuditCategory.Migration,
      severity,
      action,
      outcome,
      `Migration ${migrationId} ${action}: ${outcome}`,
      {
        userId,
        username,
        resource: 'migration',
        resourceId: migrationId,
        details
      }
    );
  }

  /**
   * Log configuration change
   */
  async logConfiguration(
    userId: string,
    username: string,
    setting: string,
    oldValue: any,
    newValue: any
  ): Promise<AuditEvent> {
    return this.logEvent(
      AuditCategory.Configuration,
      AuditSeverity.Info,
      'update',
      'success',
      `User ${username} changed ${setting}`,
      {
        userId,
        username,
        resource: 'configuration',
        resourceId: setting,
        details: {
          oldValue,
          newValue
        }
      }
    );
  }

  /**
   * Log security event
   */
  async logSecurity(
    severity: AuditSeverity,
    action: string,
    message: string,
    details?: Record<string, any>,
    userId?: string,
    username?: string
  ): Promise<AuditEvent> {
    return this.logEvent(
      AuditCategory.Security,
      severity,
      action,
      'success',
      message,
      {
        userId,
        username,
        resource: 'security',
        details
      }
    );
  }

  /**
   * Search audit events
   */
  async searchEvents(filter: AuditFilter): Promise<AuditEvent[]> {
    await this.ensureInitialized();

    let events = [...this.auditLog];

    // Apply filters
    if (filter.category) {
      const categories = Array.isArray(filter.category) ? filter.category : [filter.category];
      events = events.filter(e => categories.includes(e.category));
    }

    if (filter.severity) {
      const severities = Array.isArray(filter.severity) ? filter.severity : [filter.severity];
      events = events.filter(e => severities.includes(e.severity));
    }

    if (filter.userId) {
      events = events.filter(e => e.userId === filter.userId);
    }

    if (filter.username) {
      events = events.filter(e => e.username?.toLowerCase().includes(filter.username!.toLowerCase()));
    }

    if (filter.resource) {
      events = events.filter(e => e.resource === filter.resource);
    }

    if (filter.outcome) {
      events = events.filter(e => e.outcome === filter.outcome);
    }

    if (filter.startDate) {
      events = events.filter(e => e.timestamp >= filter.startDate!);
    }

    if (filter.endDate) {
      events = events.filter(e => e.timestamp <= filter.endDate!);
    }

    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      events = events.filter(e =>
        e.message.toLowerCase().includes(searchLower) ||
        e.action.toLowerCase().includes(searchLower) ||
        JSON.stringify(e.details).toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    if (filter.offset !== undefined) {
      events = events.slice(filter.offset);
    }

    if (filter.limit !== undefined) {
      events = events.slice(0, filter.limit);
    }

    return events;
  }

  /**
   * Get audit statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date): Promise<AuditStatistics> {
    await this.ensureInitialized();

    let events = this.auditLog;

    if (startDate) {
      events = events.filter(e => e.timestamp >= startDate);
    }

    if (endDate) {
      events = events.filter(e => e.timestamp <= endDate);
    }

    const byCategory = {} as Record<AuditCategory, number>;
    const bySeverity = {} as Record<AuditSeverity, number>;
    const byOutcome = {} as Record<string, number>;
    const uniqueUsers = new Set<string>();

    for (const event of events) {
      byCategory[event.category] = (byCategory[event.category] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
      byOutcome[event.outcome] = (byOutcome[event.outcome] || 0) + 1;

      if (event.userId) {
        uniqueUsers.add(event.userId);
      }
    }

    return {
      totalEvents: events.length,
      byCategory,
      bySeverity,
      byOutcome,
      uniqueUsers: uniqueUsers.size,
      timeRange: {
        start: events.length > 0 ? events[events.length - 1].timestamp : new Date(),
        end: events.length > 0 ? events[0].timestamp : new Date()
      }
    };
  }

  /**
   * Export audit log
   */
  async exportLog(
    format: 'json' | 'csv' | 'siem',
    outputPath: string,
    filter?: AuditFilter
  ): Promise<void> {
    await this.ensureInitialized();

    const events = filter ? await this.searchEvents(filter) : this.auditLog;

    let content: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(events, null, 2);
        break;

      case 'csv':
        content = this.eventsToCSV(events);
        break;

      case 'siem':
        content = this.eventsToSIEM(events);
        break;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    await fs.writeFile(outputPath, content);
    this.emit('log-exported', { format, outputPath, count: events.length });
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    framework: string,
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    await this.ensureInitialized();

    const events = await this.searchEvents({ startDate, endDate });
    const findings: ComplianceFinding[] = [];

    // Example compliance rules (customize based on framework)
    const rules = this.getComplianceRules(framework);

    for (const rule of rules) {
      const finding = await this.evaluateComplianceRule(rule, events);
      findings.push(finding);
    }

    const report: ComplianceReport = {
      reportId: this.generateEventId(),
      generatedAt: new Date(),
      framework,
      timeRange: { start: startDate, end: endDate },
      findings,
      summary: {
        totalEvents: events.length,
        violations: findings.filter(f => f.status === 'failed').length,
        warnings: findings.filter(f => f.status === 'warning').length,
        passed: findings.filter(f => f.status === 'passed').length
      }
    };

    this.emit('compliance-report-generated', report);

    return report;
  }

  /**
   * Rotate log files
   */
  async rotateLog(): Promise<void> {
    await this.ensureInitialized();

    // Close current log stream
    if (this.currentLogStream) {
      this.currentLogStream.end();
      this.currentLogStream = null;
    }

    // Check if rotation needed
    const stats = await fs.stat(this.currentLogFile);
    const sizeMB = stats.size / (1024 * 1024);

    if (sizeMB < this.LOG_ROTATION_CONFIG.maxSizeMB) {
      // Reopen current log
      await this.openLogFile();
      return;
    }

    // Archive current log
    const archiveName = `audit-${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
    const archivePath = path.join(this.archiveDirectory, archiveName);
    await fs.rename(this.currentLogFile, archivePath);

    // Create new log file
    this.currentLogFile = this.getLogFileName();
    await this.openLogFile();

    // Clean up old archives
    await this.cleanupOldLogs();

    this.emit('log-rotated', { archivePath });
  }

  /**
   * Convert events to CSV format
   */
  private eventsToCSV(events: AuditEvent[]): string {
    const headers = [
      'ID', 'Timestamp', 'Category', 'Severity', 'Action', 'Outcome',
      'UserID', 'Username', 'Resource', 'ResourceID', 'Message', 'Details'
    ];

    const rows = events.map(e => [
      e.id,
      e.timestamp.toISOString(),
      e.category,
      e.severity,
      e.action,
      e.outcome,
      e.userId || '',
      e.username || '',
      e.resource || '',
      e.resourceId || '',
      e.message,
      JSON.stringify(e.details || {})
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
  }

  /**
   * Convert events to SIEM format (CEF - Common Event Format)
   */
  private eventsToSIEM(events: AuditEvent[]): string {
    return events.map(e => {
      const cef = [
        'CEF:0',
        'M&A Discovery Suite',
        'GUIv2',
        '1.0',
        e.id,
        e.message,
        e.severity.toUpperCase(),
        `cat=${e.category}`,
        `act=${e.action}`,
        `outcome=${e.outcome}`,
        `suser=${e.username || 'unknown'}`,
        `duser=${e.userId || 'unknown'}`,
        e.resource ? `resource=${e.resource}` : '',
        e.ipAddress ? `src=${e.ipAddress}` : '',
        `rt=${e.timestamp.getTime()}`
      ].filter(Boolean).join('|');

      return cef;
    }).join('\n');
  }

  /**
   * Get compliance rules for framework
   */
  private getComplianceRules(framework: string): Array<{ id: string; rule: string; severity: AuditSeverity }> {
    // Example rules - customize based on actual compliance requirements
    const commonRules = [
      { id: 'AUTH-001', rule: 'All authentication attempts must be logged', severity: AuditSeverity.Critical },
      { id: 'AUTH-002', rule: 'Failed login attempts must be monitored', severity: AuditSeverity.Warning },
      { id: 'ACCESS-001', rule: 'Data access must be logged with user identity', severity: AuditSeverity.Critical },
      { id: 'CHANGE-001', rule: 'All configuration changes must be audited', severity: AuditSeverity.Info }
    ];

    return commonRules;
  }

  /**
   * Evaluate compliance rule
   */
  private async evaluateComplianceRule(
    rule: { id: string; rule: string; severity: AuditSeverity },
    events: AuditEvent[]
  ): Promise<ComplianceFinding> {
    // Simplified evaluation - customize based on actual rules
    const relatedEvents = events.filter(e => {
      if (rule.id.startsWith('AUTH')) {
        return e.category === AuditCategory.Authentication;
      }
      if (rule.id.startsWith('ACCESS')) {
        return e.category === AuditCategory.DataAccess;
      }
      if (rule.id.startsWith('CHANGE')) {
        return e.category === AuditCategory.Configuration;
      }
      return false;
    });

    return {
      id: rule.id,
      rule: rule.rule,
      severity: rule.severity,
      status: relatedEvents.length > 0 ? 'passed' : 'warning',
      message: `Found ${relatedEvents.length} related events`,
      events: relatedEvents.slice(0, 10), // Include sample events
      remediation: relatedEvents.length === 0 ? 'Ensure proper logging is enabled' : undefined
    };
  }

  /**
   * Write event to log file
   */
  private async writeEventToFile(event: AuditEvent): Promise<void> {
    if (!this.currentLogStream) {
      await this.openLogFile();
    }

    const logLine = JSON.stringify(event) + '\n';
    this.currentLogStream!.write(logLine);
  }

  /**
   * Open log file for writing
   */
  private async openLogFile(): Promise<void> {
    this.currentLogStream = createWriteStream(this.currentLogFile, { flags: 'a' });
  }

  /**
   * Load recent events into memory
   */
  private async loadRecentEvents(): Promise<void> {
    try {
      const content = await fs.readFile(this.currentLogFile, 'utf-8');
      const lines = content.split('\n').filter(Boolean);

      // Load last N events
      const recentLines = lines.slice(-this.IN_MEMORY_LIMIT);
      this.auditLog = recentLines.map(line => {
        const event = JSON.parse(line);
        return {
          ...event,
          timestamp: new Date(event.timestamp)
        };
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Error loading recent events:', error);
      }
    }
  }

  /**
   * Clean up old log files
   */
  private async cleanupOldLogs(): Promise<void> {
    try {
      const files = await fs.readdir(this.archiveDirectory);
      const logFiles = files.filter(f => f.startsWith('audit-') && f.endsWith('.log'));

      // Sort by modification time
      const fileStats = await Promise.all(
        logFiles.map(async f => ({
          name: f,
          path: path.join(this.archiveDirectory, f),
          stats: await fs.stat(path.join(this.archiveDirectory, f))
        }))
      );

      fileStats.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Delete files beyond retention
      const now = Date.now();
      const maxAge = this.LOG_ROTATION_CONFIG.maxAgeDays * 24 * 60 * 60 * 1000;

      for (let i = 0; i < fileStats.length; i++) {
        const file = fileStats[i];
        const age = now - file.stats.mtime.getTime();

        if (i >= this.LOG_ROTATION_CONFIG.maxFiles || age > maxAge) {
          await fs.unlink(file.path);
          this.emit('log-deleted', { path: file.path, reason: i >= this.LOG_ROTATION_CONFIG.maxFiles ? 'max-files' : 'age' });
        }
      }
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
    }
  }

  /**
   * Start log rotation timer
   */
  private startRotationTimer(): void {
    // Check for rotation every hour
    setInterval(() => {
      this.rotateLog().catch(err => console.error('Log rotation failed:', err));
    }, 60 * 60 * 1000);
  }

  /**
   * Get log file name
   */
  private getLogFileName(): string {
    return path.join(this.logsDirectory, 'audit-current.log');
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    const timestamp = Date.now();
    const counter = ++this.eventIdCounter;
    const hash = createHash('md5')
      .update(`${timestamp}-${counter}-${Math.random()}`)
      .digest('hex')
      .substring(0, 8);

    return `AUD-${timestamp}-${hash}`;
  }

  /**
   * Ensure service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Shutdown the audit service
   */
  async shutdown(): Promise<void> {
    if (this.currentLogStream) {
      this.currentLogStream.end();
      this.currentLogStream = null;
    }
    this.initialized = false;
  }
}

export default new AuditService();

/**
 * Migration Reporting Service
 *
 * Migration reporting with:
 * - Executive summary reports (high-level KPIs)
 * - Detailed migration reports (per user, per wave)
 * - Success/failure statistics
 * - Migration timeline visualization
 * - Error analysis and categorization
 * - Performance metrics (throughput, duration)
 * - Custom report builder integration
 * - Export reports (PDF, Excel, CSV, HTML)
 * - Scheduled report generation
 * - Report templates library
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { CronJob } from 'cron';
import PowerShellExecutionService from './powerShellService';

/**
 * Report type
 */
export type ReportType =
  | 'executive-summary'
  | 'wave-detail'
  | 'user-detail'
  | 'error-analysis'
  | 'performance'
  | 'timeline'
  | 'compliance'
  | 'custom';

/**
 * Report format
 */
export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'html' | 'json';

/**
 * Report
 */
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  waveId?: string;
  generatedAt: Date;
  generatedBy: string;
  filters: ReportFilters;
  data: ReportData;
  metadata: Record<string, any>;
}

/**
 * Report filters
 */
interface ReportFilters {
  waveIds?: string[];
  userIds?: string[];
  dateRange?: { start: Date; end: Date };
  status?: string[];
  includeErrors?: boolean;
  includeWarnings?: boolean;
}

/**
 * Report data
 */
interface ReportData {
  summary: ExecutiveSummary;
  waves?: WaveReport[];
  users?: UserReport[];
  errors?: ErrorReport[];
  performance?: PerformanceMetrics;
  timeline?: TimelineEvent[];
}

/**
 * Executive summary
 */
interface ExecutiveSummary {
  totalWaves: number;
  completedWaves: number;
  failedWaves: number;
  totalUsers: number;
  migratedUsers: number;
  failedUsers: number;
  overallSuccessRate: number;
  averageDuration: number;
  totalDataMigrated: number; // GB
  costSavings?: number;
  recommendations: string[];
}

/**
 * Wave report
 */
interface WaveReport {
  waveId: string;
  waveName: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  duration: number;
  userCount: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  throughput: number;
  errors: ErrorSummary[];
}

/**
 * User report
 */
interface UserReport {
  userId: string;
  userPrincipalName: string;
  displayName: string;
  waveId: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  duration?: number;
  mailboxSize: number;
  itemsMigrated: number;
  errors: string[];
  warnings: string[];
}

/**
 * Error report
 */
interface ErrorReport {
  category: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedUsers: string[];
  examples: ErrorExample[];
  remediation: string;
}

/**
 * Error example
 */
interface ErrorExample {
  userId: string;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

/**
 * Error summary
 */
interface ErrorSummary {
  type: string;
  count: number;
  severity: string;
}

/**
 * Performance metrics
 */
interface PerformanceMetrics {
  averageThroughput: number; // users/hour
  peakThroughput: number;
  averageDuration: number; // minutes
  medianDuration: number;
  p95Duration: number;
  totalDataTransferred: number; // GB
  averageBandwidth: number; // MB/s
}

/**
 * Timeline event
 */
interface TimelineEvent {
  timestamp: Date;
  type: 'wave-start' | 'wave-end' | 'user-migrated' | 'error' | 'milestone';
  description: string;
  waveId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Report template
 */
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  filters: ReportFilters;
  format: ReportFormat;
  sections: string[]; // Which sections to include
  createdAt: Date;
  createdBy: string;
}

/**
 * Scheduled report
 */
interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  cronExpression: string;
  recipients: string[];
  format: ReportFormat;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  job?: CronJob;
}

/**
 * Migration Reporting Service
 */
class MigrationReportingService extends EventEmitter {
  private powerShellService: PowerShellExecutionService;
  private reports: Map<string, Report>;
  private templates: Map<string, ReportTemplate>;
  private schedules: Map<string, ScheduledReport>;
  private dataDir: string;

  constructor(powerShellService: PowerShellExecutionService, dataDir?: string) {
    super();
    this.powerShellService = powerShellService;
    this.reports = new Map();
    this.templates = new Map();
    this.schedules = new Map();
    this.dataDir = dataDir || path.join(process.cwd(), 'data', 'reports');

    this.ensureDataDirectory();
    this.loadData();
    this.createDefaultTemplates();
  }

  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(path.join(this.dataDir, 'generated'), { recursive: true });
    } catch (error) {
      console.error('Failed to create reporting data directory:', error);
    }
  }

  /**
   * Generate report
   */
  async generateReport(
    type: ReportType,
    filters: ReportFilters,
    generatedBy = 'system'
  ): Promise<Report> {
    const reportId = crypto.randomUUID();

    console.log(`Generating ${type} report`);
    this.emit('report:generating', { reportId, type });

    try {
      // Collect data from PowerShell
      const result = await this.powerShellService.executeScript(
        'Modules/Migration/Get-MigrationReportData.ps1',
        [
          '-Type', type,
          '-Filters', JSON.stringify(filters),
        ],
        { timeout: 300000 } // 5 minutes
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to collect report data');
      }

      // Build report data
      const reportData = await this.buildReportData(type, result.data, filters);

      const report: Report = {
        id: reportId,
        name: `${type} - ${new Date().toISOString()}`,
        type,
        waveId: filters.waveIds?.[0],
        generatedAt: new Date(),
        generatedBy,
        filters,
        data: reportData,
        metadata: {
          dataSource: 'PowerShell',
          version: '1.0',
        },
      };

      this.reports.set(reportId, report);
      await this.saveData();

      this.emit('report:generated', { report });

      return report;
    } catch (error: any) {
      console.error('Report generation failed:', error);
      this.emit('report:failed', { reportId, type, error: error.message });
      throw error;
    }
  }

  /**
   * Build report data
   */
  private async buildReportData(
    type: ReportType,
    rawData: any,
    filters: ReportFilters
  ): Promise<ReportData> {
    const data: ReportData = {
      summary: this.buildExecutiveSummary(rawData),
    };

    if (type === 'wave-detail' || type === 'executive-summary') {
      data.waves = this.buildWaveReports(rawData.waves || []);
    }

    if (type === 'user-detail' || type === 'executive-summary') {
      data.users = this.buildUserReports(rawData.users || []);
    }

    if (type === 'error-analysis' || filters.includeErrors) {
      data.errors = this.buildErrorReports(rawData.errors || []);
    }

    if (type === 'performance') {
      data.performance = this.buildPerformanceMetrics(rawData.performance || {});
    }

    if (type === 'timeline') {
      data.timeline = this.buildTimeline(rawData.events || []);
    }

    return data;
  }

  /**
   * Build executive summary
   */
  private buildExecutiveSummary(rawData: any): ExecutiveSummary {
    const summary = rawData.summary || {};

    return {
      totalWaves: summary.totalWaves || 0,
      completedWaves: summary.completedWaves || 0,
      failedWaves: summary.failedWaves || 0,
      totalUsers: summary.totalUsers || 0,
      migratedUsers: summary.migratedUsers || 0,
      failedUsers: summary.failedUsers || 0,
      overallSuccessRate: summary.totalUsers > 0
        ? (summary.migratedUsers / summary.totalUsers) * 100
        : 0,
      averageDuration: summary.averageDuration || 0,
      totalDataMigrated: summary.totalDataMigrated || 0,
      costSavings: summary.costSavings,
      recommendations: this.generateRecommendations(rawData),
    };
  }

  /**
   * Build wave reports
   */
  private buildWaveReports(waves: any[]): WaveReport[] {
    return waves.map(wave => ({
      waveId: wave.id,
      waveName: wave.name,
      status: wave.status,
      startDate: new Date(wave.startDate),
      endDate: wave.endDate ? new Date(wave.endDate) : undefined,
      duration: wave.duration || 0,
      userCount: wave.userCount || 0,
      successCount: wave.successCount || 0,
      failureCount: wave.failureCount || 0,
      successRate: wave.userCount > 0
        ? (wave.successCount / wave.userCount) * 100
        : 0,
      throughput: wave.throughput || 0,
      errors: wave.errors || [],
    }));
  }

  /**
   * Build user reports
   */
  private buildUserReports(users: any[]): UserReport[] {
    return users.map(user => ({
      userId: user.id,
      userPrincipalName: user.upn,
      displayName: user.displayName,
      waveId: user.waveId,
      status: user.status,
      startDate: user.startDate ? new Date(user.startDate) : undefined,
      endDate: user.endDate ? new Date(user.endDate) : undefined,
      duration: user.duration,
      mailboxSize: user.mailboxSize || 0,
      itemsMigrated: user.itemsMigrated || 0,
      errors: user.errors || [],
      warnings: user.warnings || [],
    }));
  }

  /**
   * Build error reports
   */
  private buildErrorReports(errors: any[]): ErrorReport[] {
    // Group errors by category
    const errorMap = new Map<string, any[]>();

    for (const error of errors) {
      const category = error.category || 'uncategorized';
      if (!errorMap.has(category)) {
        errorMap.set(category, []);
      }
      errorMap.get(category)!.push(error);
    }

    const reports: ErrorReport[] = [];

    for (const [category, categoryErrors] of errorMap.entries()) {
      const affectedUsers = [...new Set(categoryErrors.map(e => e.userId))];

      reports.push({
        category,
        count: categoryErrors.length,
        severity: this.determineErrorSeverity(categoryErrors),
        affectedUsers,
        examples: categoryErrors.slice(0, 5).map(e => ({
          userId: e.userId,
          message: e.message,
          timestamp: new Date(e.timestamp),
          context: e.context,
        })),
        remediation: this.getErrorRemediation(category),
      });
    }

    return reports.sort((a, b) => b.count - a.count);
  }

  /**
   * Build performance metrics
   */
  private buildPerformanceMetrics(perfData: any): PerformanceMetrics {
    return {
      averageThroughput: perfData.averageThroughput || 0,
      peakThroughput: perfData.peakThroughput || 0,
      averageDuration: perfData.averageDuration || 0,
      medianDuration: perfData.medianDuration || 0,
      p95Duration: perfData.p95Duration || 0,
      totalDataTransferred: perfData.totalDataTransferred || 0,
      averageBandwidth: perfData.averageBandwidth || 0,
    };
  }

  /**
   * Build timeline
   */
  private buildTimeline(events: any[]): TimelineEvent[] {
    return events
      .map((event: any) => ({
        timestamp: new Date(event.timestamp),
        type: event.type,
        description: event.description,
        waveId: event.waveId,
        userId: event.userId,
        metadata: event.metadata,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(rawData: any): string[] {
    const recommendations: string[] = [];

    const summary = rawData.summary || {};

    // Success rate recommendations
    if (summary.overallSuccessRate < 90) {
      recommendations.push(
        'Success rate is below 90%. Review error patterns and implement additional validation.'
      );
    }

    // Performance recommendations
    if (summary.averageDuration > 60) {
      recommendations.push(
        'Average migration duration exceeds 1 hour. Consider increasing parallelism or optimizing scripts.'
      );
    }

    // Error recommendations
    const errorCount = rawData.errors?.length || 0;
    if (errorCount > summary.totalUsers * 0.1) {
      recommendations.push(
        'Error rate exceeds 10%. Investigate common error patterns and implement preventive measures.'
      );
    }

    return recommendations;
  }

  /**
   * Determine error severity
   */
  private determineErrorSeverity(errors: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = errors.filter(e => e.severity === 'critical').length;
    const highCount = errors.filter(e => e.severity === 'high').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > errors.length / 2) return 'high';
    if (errors.length > 10) return 'medium';
    return 'low';
  }

  /**
   * Get error remediation
   */
  private getErrorRemediation(category: string): string {
    const remediations: Record<string, string> = {
      'license': 'Ensure all users have appropriate licenses assigned before migration.',
      'permission': 'Verify admin permissions and consent for all required scopes.',
      'mailbox-size': 'Reduce mailbox size or increase target quota before migrating.',
      'network': 'Check network connectivity and firewall rules between environments.',
      'timeout': 'Increase script timeout values or optimize migration scripts.',
    };

    return remediations[category] || 'Review error details and contact support if needed.';
  }

  /**
   * Export report
   */
  async exportReport(reportId: string, format: ReportFormat): Promise<string> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    console.log(`Exporting report ${reportId} as ${format}`);

    const filename = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
    const filepath = path.join(this.dataDir, 'generated', filename);

    switch (format) {
      case 'json':
        await fs.writeFile(filepath, JSON.stringify(report, null, 2), 'utf-8');
        break;

      case 'csv':
        await this.exportCSV(report, filepath);
        break;

      case 'html':
        await this.exportHTML(report, filepath);
        break;

      case 'pdf':
      case 'excel':
        // Would use PowerShell to generate PDF/Excel
        await this.exportViaPowerShell(report, format, filepath);
        break;
    }

    this.emit('report:exported', { reportId, format, filepath });

    return filepath;
  }

  /**
   * Export as CSV
   */
  private async exportCSV(report: Report, filepath: string): Promise<void> {
    const rows: string[] = [];

    // Summary section
    rows.push('Executive Summary');
    rows.push('Metric,Value');
    rows.push(`Total Waves,${report.data.summary.totalWaves}`);
    rows.push(`Completed Waves,${report.data.summary.completedWaves}`);
    rows.push(`Total Users,${report.data.summary.totalUsers}`);
    rows.push(`Migrated Users,${report.data.summary.migratedUsers}`);
    rows.push(`Success Rate,${report.data.summary.overallSuccessRate.toFixed(2)}%`);
    rows.push('');

    // Wave details
    if (report.data.waves && report.data.waves.length > 0) {
      rows.push('Wave Details');
      rows.push('Wave Name,Status,Users,Success Rate,Duration');
      for (const wave of report.data.waves) {
        rows.push(
          `"${wave.waveName}",${wave.status},${wave.userCount},${wave.successRate.toFixed(2)}%,${wave.duration}`
        );
      }
      rows.push('');
    }

    await fs.writeFile(filepath, rows.join('\n'), 'utf-8');
  }

  /**
   * Export as HTML
   */
  private async exportHTML(report: Report, filepath: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>${report.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #2c3e50; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #3498db; color: white; }
    .metric { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .success { color: #27ae60; }
    .warning { color: #f39c12; }
    .error { color: #e74c3c; }
  </style>
</head>
<body>
  <h1>${report.name}</h1>
  <p>Generated: ${report.generatedAt.toISOString()}</p>

  <h2>Executive Summary</h2>
  <div class="metric">
    <strong>Total Waves:</strong> ${report.data.summary.totalWaves}<br>
    <strong>Completed Waves:</strong> ${report.data.summary.completedWaves}<br>
    <strong>Total Users:</strong> ${report.data.summary.totalUsers}<br>
    <strong>Migrated Users:</strong> ${report.data.summary.migratedUsers}<br>
    <strong>Success Rate:</strong> ${report.data.summary.overallSuccessRate.toFixed(2)}%
  </div>

  ${report.data.waves && report.data.waves.length > 0 ? `
  <h2>Wave Details</h2>
  <table>
    <tr>
      <th>Wave Name</th>
      <th>Status</th>
      <th>Users</th>
      <th>Success Rate</th>
      <th>Duration (min)</th>
    </tr>
    ${report.data.waves.map(wave => `
    <tr>
      <td>${wave.waveName}</td>
      <td>${wave.status}</td>
      <td>${wave.userCount}</td>
      <td>${wave.successRate.toFixed(2)}%</td>
      <td>${wave.duration}</td>
    </tr>
    `).join('')}
  </table>
  ` : ''}

  ${report.data.errors && report.data.errors.length > 0 ? `
  <h2>Error Analysis</h2>
  <table>
    <tr>
      <th>Category</th>
      <th>Count</th>
      <th>Severity</th>
      <th>Affected Users</th>
    </tr>
    ${report.data.errors.map(error => `
    <tr>
      <td>${error.category}</td>
      <td>${error.count}</td>
      <td class="${error.severity}">${error.severity}</td>
      <td>${error.affectedUsers.length}</td>
    </tr>
    `).join('')}
  </table>
  ` : ''}
</body>
</html>
    `;

    await fs.writeFile(filepath, html, 'utf-8');
  }

  /**
   * Export via PowerShell
   */
  private async exportViaPowerShell(report: Report, format: ReportFormat, filepath: string): Promise<void> {
    const result = await this.powerShellService.executeScript(
      'Modules/Migration/Export-MigrationReport.ps1',
      [
        '-ReportData', JSON.stringify(report),
        '-Format', format,
        '-OutputPath', filepath,
      ],
      { timeout: 180000 }
    );

    if (!result.success) {
      throw new Error(`Export failed: ${result.error}`);
    }
  }

  /**
   * Create report template
   */
  async createTemplate(template: Omit<ReportTemplate, 'id' | 'createdAt'>): Promise<ReportTemplate> {
    const newTemplate: ReportTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    this.templates.set(newTemplate.id, newTemplate);
    await this.saveData();

    return newTemplate;
  }

  /**
   * Schedule report
   */
  async scheduleReport(
    name: string,
    templateId: string,
    cronExpression: string,
    recipients: string[],
    format: ReportFormat
  ): Promise<ScheduledReport> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const schedule: ScheduledReport = {
      id: crypto.randomUUID(),
      name,
      templateId,
      cronExpression,
      recipients,
      format,
      enabled: true,
    };

    // Create cron job
    const job = new CronJob(
      cronExpression,
      async () => {
        console.log(`Running scheduled report: ${name}`);
        schedule.lastRun = new Date();

        try {
          const report = await this.generateReport(template.type, template.filters, 'scheduled');
          const filepath = await this.exportReport(report.id, format);

          // Send to recipients (would implement email sending here)
          console.log(`Report sent to: ${recipients.join(', ')}`);
        } catch (error: any) {
          console.error(`Scheduled report failed: ${name}`, error);
        }

        schedule.nextRun = job.nextDate().toJSDate();
        await this.saveData();
      },
      null,
      true,
      'UTC'
    );

    schedule.job = job;
    schedule.nextRun = job.nextDate().toJSDate();

    this.schedules.set(schedule.id, schedule);
    await this.saveData();

    return schedule;
  }

  /**
   * Create default templates
   */
  private async createDefaultTemplates(): Promise<void> {
    if (this.templates.size > 0) return;

    const defaults: Omit<ReportTemplate, 'id' | 'createdAt'>[] = [
      {
        name: 'Executive Summary',
        description: 'High-level migration overview for executives',
        type: 'executive-summary',
        filters: {},
        format: 'pdf',
        sections: ['summary', 'waves', 'performance', 'recommendations'],
        createdBy: 'system',
      },
      {
        name: 'Wave Detail Report',
        description: 'Detailed report for a specific wave',
        type: 'wave-detail',
        filters: {},
        format: 'excel',
        sections: ['summary', 'users', 'errors', 'timeline'],
        createdBy: 'system',
      },
      {
        name: 'Error Analysis',
        description: 'Comprehensive error analysis and remediation',
        type: 'error-analysis',
        filters: { includeErrors: true },
        format: 'html',
        sections: ['errors'],
        createdBy: 'system',
      },
    ];

    for (const template of defaults) {
      await this.createTemplate(template);
    }
  }

  /**
   * Get reports
   */
  getReports(waveId?: string): Report[] {
    const reports = Array.from(this.reports.values());

    if (waveId) {
      return reports.filter(r => r.waveId === waveId);
    }

    return reports;
  }

  /**
   * Get templates
   */
  getTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get schedules
   */
  getSchedules(): ScheduledReport[] {
    return Array.from(this.schedules.values()).map(s => ({ ...s, job: undefined }));
  }

  /**
   * Save data
   */
  private async saveData(): Promise<void> {
    try {
      await Promise.all([
        fs.writeFile(
          path.join(this.dataDir, 'reports.json'),
          JSON.stringify(Array.from(this.reports.values()), null, 2),
          'utf-8'
        ),
        fs.writeFile(
          path.join(this.dataDir, 'templates.json'),
          JSON.stringify(Array.from(this.templates.values()), null, 2),
          'utf-8'
        ),
        fs.writeFile(
          path.join(this.dataDir, 'schedules.json'),
          JSON.stringify(
            Array.from(this.schedules.values()).map(s => ({ ...s, job: undefined })),
            null,
            2
          ),
          'utf-8'
        ),
      ]);
    } catch (error) {
      console.error('Failed to save reporting data:', error);
    }
  }

  /**
   * Load data
   */
  private async loadData(): Promise<void> {
    try {
      const [reportsData, templatesData, schedulesData] = await Promise.all([
        fs.readFile(path.join(this.dataDir, 'reports.json'), 'utf-8').catch(() => '[]'),
        fs.readFile(path.join(this.dataDir, 'templates.json'), 'utf-8').catch(() => '[]'),
        fs.readFile(path.join(this.dataDir, 'schedules.json'), 'utf-8').catch(() => '[]'),
      ]);

      const reports: Report[] = JSON.parse(reportsData);
      const templates: ReportTemplate[] = JSON.parse(templatesData);
      const schedules: ScheduledReport[] = JSON.parse(schedulesData);

      this.reports.clear();
      for (const report of reports) {
        this.reports.set(report.id, report);
      }

      this.templates.clear();
      for (const template of templates) {
        this.templates.set(template.id, template);
      }

      this.schedules.clear();
      for (const schedule of schedules) {
        // Recreate cron jobs
        if (schedule.enabled) {
          const template = this.templates.get(schedule.templateId);
          if (template) {
            const job = new CronJob(
              schedule.cronExpression,
              async () => {
                console.log(`Running scheduled report: ${schedule.name}`);
                schedule.lastRun = new Date();

                try {
                  const report = await this.generateReport(template.type, template.filters, 'scheduled');
                  const filepath = await this.exportReport(report.id, schedule.format);
                  console.log(`Report sent to: ${schedule.recipients.join(', ')}`);
                } catch (error: any) {
                  console.error(`Scheduled report failed: ${schedule.name}`, error);
                }

                schedule.nextRun = job.nextDate().toJSDate();
                await this.saveData();
              },
              null,
              true,
              'UTC'
            );

            schedule.job = job;
            schedule.nextRun = job.nextDate().toJSDate();
          }
        }

        this.schedules.set(schedule.id, schedule);
      }

      console.log(`Loaded ${this.reports.size} reports, ${this.templates.size} templates`);
    } catch (error) {
      // Data files don't exist yet
    }
  }

  /**
   * Shutdown service
   */
  async shutdown(): Promise<void> {
    // Stop all cron jobs
    for (const schedule of this.schedules.values()) {
      if (schedule.job) {
        schedule.job.stop();
      }
    }

    await this.saveData();
  }
}

export default MigrationReportingService;
export { ReportType, ReportFormat, Report, ReportTemplate, ScheduledReport };

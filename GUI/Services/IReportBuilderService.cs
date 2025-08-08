using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public interface IReportBuilderService
    {
        // Report Definition Management
        Task<List<ReportDefinition>> GetReportsAsync();
        Task<ReportDefinition> GetReportAsync(string reportId);
        Task<ReportDefinition> CreateReportAsync(ReportDefinition report);
        Task<ReportDefinition> UpdateReportAsync(ReportDefinition report);
        Task DeleteReportAsync(string reportId);
        Task<ReportDefinition> CloneReportAsync(string reportId, string newName = null);

        // Report Templates
        Task<List<ReportTemplate>> GetTemplatesAsync();
        Task<ReportTemplate> GetTemplateAsync(string templateId);
        Task<ReportDefinition> CreateReportFromTemplateAsync(string templateId, string reportName);
        Task<ReportTemplate> CreateTemplateFromReportAsync(string reportId, string templateName, string description);

        // Data Source Management
        Task<List<ReportDataSource>> GetAvailableDataSourcesAsync();
        Task<List<string>> GetDataSourceFieldsAsync(string dataSourceId);
        Task<List<object>> GetSampleDataAsync(string dataSourceId, int maxRows = 100);
        Task<Dictionary<string, object>> GetDataSourceMetadataAsync(string dataSourceId);

        // Report Building and Design
        Task<List<ReportColumn>> GetAvailableColumnsAsync(List<string> dataSourceIds);
        Task<ReportColumn> CreateCalculatedColumnAsync(string expression, string displayName, string dataType);
        Task<bool> ValidateExpressionAsync(string expression, List<string> availableFields);
        Task<List<object>> GetDistinctValuesAsync(string dataSourceId, string fieldName);

        // Report Execution
        Task<ReportExecution> ExecuteReportAsync(string reportId, Dictionary<string, object> parameters = null, CancellationToken cancellationToken = default);
        Task<ReportExecution> ExecuteReportAsync(ReportDefinition report, Dictionary<string, object> parameters = null, CancellationToken cancellationToken = default);
        Task<byte[]> GenerateReportAsync(string reportId, ReportOutputFormat format, Dictionary<string, object> parameters = null, CancellationToken cancellationToken = default);
        Task<string> GenerateReportPreviewAsync(string reportId, Dictionary<string, object> parameters = null, CancellationToken cancellationToken = default);

        // Report Scheduling
        Task<List<ReportSchedule>> GetSchedulesAsync();
        Task<ReportSchedule> GetScheduleAsync(string scheduleId);
        Task<ReportSchedule> CreateScheduleAsync(ReportSchedule schedule);
        Task<ReportSchedule> UpdateScheduleAsync(ReportSchedule schedule);
        Task DeleteScheduleAsync(string scheduleId);
        Task<DateTime?> GetNextExecutionTimeAsync(string scheduleId);

        // Report History and Execution Management
        Task<List<ReportExecution>> GetExecutionHistoryAsync(string reportId, int maxResults = 50);
        Task<ReportExecution> GetExecutionAsync(string executionId);
        Task CancelExecutionAsync(string executionId);
        Task<byte[]> GetExecutionResultAsync(string executionId);

        // Import/Export
        Task<string> ExportReportDefinitionAsync(string reportId);
        Task<ReportDefinition> ImportReportDefinitionAsync(string definitionJson, string newName = null);
        Task<byte[]> ExportReportsPackageAsync(List<string> reportIds);
        Task<List<ReportDefinition>> ImportReportsPackageAsync(byte[] packageData);

        // Report Categories and Organization
        Task<List<string>> GetCategoriesAsync();
        Task<List<ReportDefinition>> GetReportsByCategoryAsync(string category);
        Task<List<ReportDefinition>> SearchReportsAsync(string searchTerm, string category = null, List<string> tags = null);

        // Report Sharing and Permissions
        Task<bool> CanUserAccessReportAsync(string reportId, string userId);
        Task ShareReportAsync(string reportId, List<string> userIds, ReportPermissionLevel permission);
        Task UnshareReportAsync(string reportId, List<string> userIds);
        Task<List<ReportPermission>> GetReportPermissionsAsync(string reportId);

        // Report Validation and Testing
        Task<ReportValidationResult> ValidateReportAsync(ReportDefinition report);
        Task<List<string>> GetValidationErrorsAsync(string reportId);
        Task<ReportTestResult> TestReportAsync(string reportId, Dictionary<string, object> testParameters = null);

        // Performance and Optimization
        Task<ReportPerformanceInfo> GetReportPerformanceInfoAsync(string reportId);
        Task<List<ReportOptimizationSuggestion>> GetOptimizationSuggestionsAsync(string reportId);
        Task OptimizeReportAsync(string reportId);

        // Configuration and Settings
        Task<ReportBuilderSettings> GetSettingsAsync();
        Task UpdateSettingsAsync(ReportBuilderSettings settings);
        Task<List<ReportOutputFormat>> GetSupportedFormatsAsync();
        Task<Dictionary<string, object>> GetDefaultFormattingOptionsAsync();
    }

    public enum ReportPermissionLevel
    {
        None,
        View,
        Execute,
        Edit,
        FullControl
    }

    public class ReportPermission
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public ReportPermissionLevel Permission { get; set; }
        public DateTime GrantedDate { get; set; }
        public string GrantedBy { get; set; }
    }

    public class ReportValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; }
        public List<string> Warnings { get; set; }
        public List<string> Suggestions { get; set; }

        public ReportValidationResult()
        {
            Errors = new List<string>();
            Warnings = new List<string>();
            Suggestions = new List<string>();
        }
    }

    public class ReportTestResult
    {
        public bool Success { get; set; }
        public TimeSpan ExecutionTime { get; set; }
        public int RecordCount { get; set; }
        public string ErrorMessage { get; set; }
        public List<Dictionary<string, object>> SampleData { get; set; }

        public ReportTestResult()
        {
            SampleData = new List<Dictionary<string, object>>();
        }
    }

    public class ReportPerformanceInfo
    {
        public string ReportId { get; set; }
        public TimeSpan AverageExecutionTime { get; set; }
        public TimeSpan LastExecutionTime { get; set; }
        public int AverageRecordCount { get; set; }
        public int ExecutionCount { get; set; }
        public DateTime LastExecutionDate { get; set; }
        public List<ReportPerformanceMetric> Metrics { get; set; }

        public ReportPerformanceInfo()
        {
            Metrics = new List<ReportPerformanceMetric>();
        }
    }

    public class ReportPerformanceMetric
    {
        public string MetricName { get; set; }
        public object Value { get; set; }
        public string Unit { get; set; }
        public string Description { get; set; }
    }

    public class ReportOptimizationSuggestion
    {
        public string Type { get; set; }
        public string Description { get; set; }
        public string Recommendation { get; set; }
        public ReportOptimizationPriority Priority { get; set; }
        public TimeSpan EstimatedImprovement { get; set; }
    }

    public enum ReportOptimizationPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    public class ReportBuilderSettings
    {
        public int MaxExecutionTimeMinutes { get; set; }
        public int MaxRecordsPerReport { get; set; }
        public bool AllowScheduledReports { get; set; }
        public bool AllowReportSharing { get; set; }
        public string DefaultOutputPath { get; set; }
        public List<ReportOutputFormat> EnabledOutputFormats { get; set; }
        public ReportCacheSettings CacheSettings { get; set; }
        public ReportSecuritySettings SecuritySettings { get; set; }

        public ReportBuilderSettings()
        {
            MaxExecutionTimeMinutes = 30;
            MaxRecordsPerReport = 100000;
            AllowScheduledReports = true;
            AllowReportSharing = true;
            EnabledOutputFormats = new List<ReportOutputFormat> 
            { 
                ReportOutputFormat.PDF, 
                ReportOutputFormat.Excel, 
                ReportOutputFormat.CSV 
            };
            CacheSettings = new ReportCacheSettings();
            SecuritySettings = new ReportSecuritySettings();
        }
    }

    public class ReportCacheSettings
    {
        public bool EnableCaching { get; set; }
        public int CacheExpirationMinutes { get; set; }
        public int MaxCacheSize { get; set; }
        public List<string> CacheableDataSources { get; set; }

        public ReportCacheSettings()
        {
            EnableCaching = true;
            CacheExpirationMinutes = 60;
            MaxCacheSize = 1000;
            CacheableDataSources = new List<string>();
        }
    }

    public class ReportSecuritySettings
    {
        public bool RequireAuthentication { get; set; }
        public bool AllowAnonymousAccess { get; set; }
        public bool LogReportAccess { get; set; }
        public bool EncryptSensitiveData { get; set; }
        public List<string> RestrictedDataSources { get; set; }

        public ReportSecuritySettings()
        {
            RequireAuthentication = true;
            AllowAnonymousAccess = false;
            LogReportAccess = true;
            EncryptSensitiveData = true;
            RestrictedDataSources = new List<string>();
        }
    }
}
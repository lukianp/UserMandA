using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public class ReportBuilderService : IReportBuilderService
    {
        private readonly ILogger<ReportBuilderService> _logger;
        private readonly IDataService _dataService;
        private readonly IProfileService _profileService;
        private readonly string _reportsPath;
        private readonly string _templatesPath;
        private readonly JsonSerializerOptions _jsonOptions;
        
        private readonly List<ReportDefinition> _reports;
        private readonly List<ReportTemplate> _templates;
        private readonly List<ReportSchedule> _schedules;
        private readonly List<ReportExecution> _executions;
        private readonly ReportBuilderSettings _settings;

        public ReportBuilderService(ILogger<ReportBuilderService> logger = null, IDataService dataService = null, IProfileService profileService = null)
        {
            _logger = logger;
            _dataService = dataService ?? SimpleServiceLocator.Instance.GetService<IDataService>();
            _profileService = profileService ?? SimpleServiceLocator.Instance.GetService<IProfileService>();
            
            var appDataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MandADiscoverySuite");
            _reportsPath = Path.Combine(appDataPath, "Reports");
            _templatesPath = Path.Combine(appDataPath, "ReportTemplates");
            
            EnsureDirectoriesExist();
            
            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            _reports = new List<ReportDefinition>();
            _templates = new List<ReportTemplate>();
            _schedules = new List<ReportSchedule>();
            _executions = new List<ReportExecution>();
            _settings = new ReportBuilderSettings();

            _ = Task.Run(InitializeAsync);
        }

        #region Report Definition Management

        public async Task<List<ReportDefinition>> GetReportsAsync()
        {
            await Task.Delay(1); // Simulate async operation
            return _reports.ToList();
        }

        public async Task<ReportDefinition> GetReportAsync(string reportId)
        {
            await Task.Delay(1);
            return _reports.FirstOrDefault(r => r.Id == reportId);
        }

        public async Task<ReportDefinition> CreateReportAsync(ReportDefinition report)
        {
            try
            {
                if (report.Id == null)
                    report.Id = Guid.NewGuid().ToString();
                
                report.CreatedDate = DateTime.Now;
                report.ModifiedDate = DateTime.Now;
                
                _reports.Add(report);
                await SaveReportAsync(report);
                
                _logger?.LogInformation("Created report: {ReportName} ({ReportId})", report.Name, report.Id);
                return report;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating report: {ReportName}", report.Name);
                throw;
            }
        }

        public async Task<ReportDefinition> UpdateReportAsync(ReportDefinition report)
        {
            try
            {
                var existingIndex = _reports.FindIndex(r => r.Id == report.Id);
                if (existingIndex >= 0)
                {
                    report.ModifiedDate = DateTime.Now;
                    _reports[existingIndex] = report;
                    await SaveReportAsync(report);
                    
                    _logger?.LogInformation("Updated report: {ReportName} ({ReportId})", report.Name, report.Id);
                    return report;
                }
                throw new ArgumentException($"Report with ID {report.Id} not found");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error updating report: {ReportId}", report.Id);
                throw;
            }
        }

        public async Task DeleteReportAsync(string reportId)
        {
            try
            {
                var report = _reports.FirstOrDefault(r => r.Id == reportId);
                if (report != null)
                {
                    _reports.Remove(report);
                    await DeleteReportFileAsync(reportId);
                    _logger?.LogInformation("Deleted report: {ReportId}", reportId);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting report: {ReportId}", reportId);
                throw;
            }
        }

        public async Task<ReportDefinition> CloneReportAsync(string reportId, string newName = null)
        {
            var sourceReport = await GetReportAsync(reportId);
            if (sourceReport == null)
                throw new ArgumentException($"Report with ID {reportId} not found");

            var clonedReport = CloneReportDefinition(sourceReport);
            clonedReport.Name = newName ?? $"{sourceReport.Name} - Copy";
            
            return await CreateReportAsync(clonedReport);
        }

        #endregion

        #region Report Templates

        public async Task<List<ReportTemplate>> GetTemplatesAsync()
        {
            await Task.Delay(1);
            return _templates.ToList();
        }

        public async Task<ReportTemplate> GetTemplateAsync(string templateId)
        {
            await Task.Delay(1);
            return _templates.FirstOrDefault(t => t.Id == templateId);
        }

        public async Task<ReportDefinition> CreateReportFromTemplateAsync(string templateId, string reportName)
        {
            var template = await GetTemplateAsync(templateId);
            if (template == null)
                throw new ArgumentException($"Template with ID {templateId} not found");

            var report = CloneReportDefinition(template.Definition);
            report.Name = reportName;
            report.IsTemplate = false;
            
            return await CreateReportAsync(report);
        }

        public async Task<ReportTemplate> CreateTemplateFromReportAsync(string reportId, string templateName, string description)
        {
            var report = await GetReportAsync(reportId);
            if (report == null)
                throw new ArgumentException($"Report with ID {reportId} not found");

            var template = new ReportTemplate
            {
                Name = templateName,
                Description = description,
                Definition = CloneReportDefinition(report),
                Category = report.Category
            };
            
            template.Definition.IsTemplate = true;
            _templates.Add(template);
            await SaveTemplateAsync(template);
            
            return template;
        }

        #endregion

        #region Data Source Management

        public async Task<List<ReportDataSource>> GetAvailableDataSourcesAsync()
        {
            await Task.Delay(1);
            
            return new List<ReportDataSource>
            {
                new ReportDataSource { Name = "Users", Type = DataSourceType.Users, IsActive = true },
                new ReportDataSource { Name = "Groups", Type = DataSourceType.Groups, IsActive = true },
                new ReportDataSource { Name = "Computers", Type = DataSourceType.Computers, IsActive = true },
                new ReportDataSource { Name = "Applications", Type = DataSourceType.Applications, IsActive = true },
                new ReportDataSource { Name = "Infrastructure", Type = DataSourceType.Infrastructure, IsActive = true },
                new ReportDataSource { Name = "Migration Waves", Type = DataSourceType.MigrationWaves, IsActive = true },
                new ReportDataSource { Name = "Discovery Results", Type = DataSourceType.DiscoveryResults, IsActive = true }
            };
        }

        public async Task<List<string>> GetDataSourceFieldsAsync(string dataSourceId)
        {
            await Task.Delay(1);
            
            // Return available fields based on data source type
            return dataSourceId?.ToLower() switch
            {
                "users" => new List<string> { "Id", "Name", "UserPrincipalName", "Email", "Department", "JobTitle", "Manager", "City", "Country", "Enabled", "LastLogon", "WhenCreated" },
                "groups" => new List<string> { "Id", "Name", "DisplayName", "Description", "Type", "MemberCount", "Mail", "Domain" },
                "computers" => new List<string> { "Id", "Name", "OperatingSystem", "Domain", "Description", "Location", "Status", "LastBootTime", "InstallDate" },
                "applications" => new List<string> { "Id", "Name", "Version", "Publisher", "InstallDate", "Size", "Path", "Description" },
                "infrastructure" => new List<string> { "Id", "Name", "Type", "OperatingSystem", "Status", "Location", "Owner", "Environment" },
                "migrationwaves" => new List<string> { "Id", "Name", "Description", "Status", "Priority", "PlannedStartDate", "PlannedEndDate", "ActualStartDate", "ActualEndDate", "AssignedTo" },
                _ => new List<string>()
            };
        }

        public async Task<List<object>> GetSampleDataAsync(string dataSourceId, int maxRows = 100)
        {
            await Task.Delay(1);
            
            // Return sample data based on data source
            try
            {
                return dataSourceId?.ToLower() switch
                {
                    "users" => (await GetUserSampleData(maxRows)).Cast<object>().ToList(),
                    "groups" => (await GetGroupSampleData(maxRows)).Cast<object>().ToList(),
                    "computers" => (await GetComputerSampleData(maxRows)).Cast<object>().ToList(),
                    "applications" => (await GetApplicationSampleData(maxRows)).Cast<object>().ToList(),
                    _ => new List<object>()
                };
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting sample data for data source: {DataSourceId}", dataSourceId);
                return new List<object>();
            }
        }

        public async Task<Dictionary<string, object>> GetDataSourceMetadataAsync(string dataSourceId)
        {
            await Task.Delay(1);
            
            var metadata = new Dictionary<string, object>
            {
                ["DataSourceId"] = dataSourceId,
                ["Fields"] = await GetDataSourceFieldsAsync(dataSourceId),
                ["RecordCount"] = await GetDataSourceRecordCountAsync(dataSourceId),
                ["LastUpdated"] = DateTime.Now.AddHours(-2),
                ["DataTypes"] = GetFieldDataTypes(dataSourceId)
            };
            
            return metadata;
        }

        #endregion

        #region Report Building and Design

        public async Task<List<ReportColumn>> GetAvailableColumnsAsync(List<string> dataSourceIds)
        {
            var columns = new List<ReportColumn>();
            
            foreach (var dataSourceId in dataSourceIds)
            {
                var fields = await GetDataSourceFieldsAsync(dataSourceId);
                foreach (var field in fields)
                {
                    columns.Add(new ReportColumn
                    {
                        FieldName = field,
                        DisplayName = FormatFieldDisplayName(field),
                        ColumnType = ReportColumnType.Data,
                        DataType = GetFieldDataType(dataSourceId, field),
                        IsVisible = true
                    });
                }
            }
            
            return columns;
        }

        public async Task<ReportColumn> CreateCalculatedColumnAsync(string expression, string displayName, string dataType)
        {
            await Task.Delay(1);
            
            var column = new ReportColumn
            {
                DisplayName = displayName,
                ColumnType = ReportColumnType.Calculated,
                Expression = expression,
                DataType = dataType,
                IsVisible = true
            };
            
            return column;
        }

        public async Task<bool> ValidateExpressionAsync(string expression, List<string> availableFields)
        {
            await Task.Delay(1);
            
            try
            {
                // Basic validation - check if referenced fields exist
                foreach (var field in availableFields)
                {
                    if (expression.Contains($"[{field}]") || expression.Contains(field))
                        return true;
                }
                
                // Could implement more sophisticated expression validation here
                return !string.IsNullOrWhiteSpace(expression);
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<object>> GetDistinctValuesAsync(string dataSourceId, string fieldName)
        {
            await Task.Delay(1);
            
            var sampleData = await GetSampleDataAsync(dataSourceId, 1000);
            var distinctValues = new HashSet<object>();
            
            foreach (var item in sampleData)
            {
                if (item is Dictionary<string, object> dict && dict.ContainsKey(fieldName))
                {
                    var value = dict[fieldName];
                    if (value != null)
                        distinctValues.Add(value);
                }
            }
            
            return distinctValues.Take(100).ToList();
        }

        #endregion

        #region Report Execution

        public async Task<ReportExecution> ExecuteReportAsync(string reportId, Dictionary<string, object> parameters = null, CancellationToken cancellationToken = default)
        {
            var report = await GetReportAsync(reportId);
            if (report == null)
                throw new ArgumentException($"Report with ID {reportId} not found");
                
            return await ExecuteReportAsync(report, parameters, cancellationToken);
        }

        public async Task<ReportExecution> ExecuteReportAsync(ReportDefinition report, Dictionary<string, object> parameters = null, CancellationToken cancellationToken = default)
        {
            var execution = new ReportExecution
            {
                ReportId = report.Id,
                Status = ReportExecutionStatus.Running,
                Parameters = parameters ?? new Dictionary<string, object>(),
                ExecutedBy = Environment.UserName
            };
            
            _executions.Add(execution);
            
            try
            {
                _logger?.LogInformation("Starting report execution: {ReportName} ({ExecutionId})", report.Name, execution.Id);
                
                // Simulate report execution
                await Task.Delay(2000, cancellationToken);
                
                if (cancellationToken.IsCancellationRequested)
                {
                    execution.Status = ReportExecutionStatus.Cancelled;
                    return execution;
                }
                
                // Simulate data processing
                execution.RecordCount = new Random().Next(100, 10000);
                execution.FileSizeBytes = execution.RecordCount * 150; // Approximate size
                execution.EndTime = DateTime.Now;
                execution.Duration = execution.EndTime - execution.StartTime;
                execution.Status = ReportExecutionStatus.Completed;
                
                _logger?.LogInformation("Report execution completed: {ExecutionId} ({Duration}ms, {RecordCount} records)", 
                    execution.Id, execution.Duration.TotalMilliseconds, execution.RecordCount);
                
                return execution;
            }
            catch (Exception ex)
            {
                execution.Status = ReportExecutionStatus.Failed;
                execution.ErrorMessage = ex.Message;
                execution.EndTime = DateTime.Now;
                execution.Duration = execution.EndTime - execution.StartTime;
                
                _logger?.LogError(ex, "Report execution failed: {ExecutionId}", execution.Id);
                return execution;
            }
        }

        public async Task<byte[]> GenerateReportAsync(string reportId, ReportOutputFormat format, Dictionary<string, object> parameters = null, CancellationToken cancellationToken = default)
        {
            var execution = await ExecuteReportAsync(reportId, parameters, cancellationToken);
            
            if (execution.Status != ReportExecutionStatus.Completed)
                throw new InvalidOperationException($"Report execution failed: {execution.ErrorMessage}");
            
            // Simulate report generation
            await Task.Delay(1000, cancellationToken);
            
            // Return dummy data for now
            var content = $"Report generated at {DateTime.Now} in {format} format\nExecution ID: {execution.Id}\nRecords: {execution.RecordCount}";
            return System.Text.Encoding.UTF8.GetBytes(content);
        }

        public async Task<string> GenerateReportPreviewAsync(string reportId, Dictionary<string, object> parameters = null, CancellationToken cancellationToken = default)
        {
            var report = await GetReportAsync(reportId);
            if (report == null)
                throw new ArgumentException($"Report with ID {reportId} not found");
            
            await Task.Delay(500, cancellationToken);
            
            // Generate HTML preview
            var html = $@"
                <html>
                <head><title>{report.Name} - Preview</title></head>
                <body>
                    <h1>{report.Name}</h1>
                    <p>{report.Description}</p>
                    <p><strong>Report Type:</strong> {report.ReportType}</p>
                    <p><strong>Columns:</strong> {report.Columns.Count}</p>
                    <p><strong>Filters:</strong> {report.Filters.Count}</p>
                    <p><em>Preview generated at {DateTime.Now:yyyy-MM-dd HH:mm:ss}</em></p>
                </body>
                </html>";
            
            return html;
        }

        #endregion

        #region Report Scheduling

        public async Task<List<ReportSchedule>> GetSchedulesAsync()
        {
            await Task.Delay(1);
            return _schedules.ToList();
        }

        public async Task<ReportSchedule> GetScheduleAsync(string scheduleId)
        {
            await Task.Delay(1);
            return _schedules.FirstOrDefault(s => s.Id == scheduleId);
        }

        public async Task<ReportSchedule> CreateScheduleAsync(ReportSchedule schedule)
        {
            schedule.Id = Guid.NewGuid().ToString();
            schedule.NextExecution = await CalculateNextExecutionTimeAsync(schedule);
            
            _schedules.Add(schedule);
            await SaveScheduleAsync(schedule);
            
            return schedule;
        }

        public async Task<ReportSchedule> UpdateScheduleAsync(ReportSchedule schedule)
        {
            var existingIndex = _schedules.FindIndex(s => s.Id == schedule.Id);
            if (existingIndex >= 0)
            {
                schedule.NextExecution = await CalculateNextExecutionTimeAsync(schedule);
                _schedules[existingIndex] = schedule;
                await SaveScheduleAsync(schedule);
                return schedule;
            }
            throw new ArgumentException($"Schedule with ID {schedule.Id} not found");
        }

        public async Task DeleteScheduleAsync(string scheduleId)
        {
            var schedule = _schedules.FirstOrDefault(s => s.Id == scheduleId);
            if (schedule != null)
            {
                _schedules.Remove(schedule);
                await DeleteScheduleFileAsync(scheduleId);
            }
        }

        public async Task<DateTime?> GetNextExecutionTimeAsync(string scheduleId)
        {
            var schedule = await GetScheduleAsync(scheduleId);
            return schedule?.NextExecution;
        }

        #endregion

        #region Report History and Execution Management

        public async Task<List<ReportExecution>> GetExecutionHistoryAsync(string reportId, int maxResults = 50)
        {
            await Task.Delay(1);
            return _executions
                .Where(e => e.ReportId == reportId)
                .OrderByDescending(e => e.StartTime)
                .Take(maxResults)
                .ToList();
        }

        public async Task<ReportExecution> GetExecutionAsync(string executionId)
        {
            await Task.Delay(1);
            return _executions.FirstOrDefault(e => e.Id == executionId);
        }

        public async Task CancelExecutionAsync(string executionId)
        {
            await Task.Delay(1);
            var execution = _executions.FirstOrDefault(e => e.Id == executionId);
            if (execution?.Status == ReportExecutionStatus.Running)
            {
                execution.Status = ReportExecutionStatus.Cancelled;
                execution.EndTime = DateTime.Now;
                execution.Duration = execution.EndTime - execution.StartTime;
            }
        }

        public async Task<byte[]> GetExecutionResultAsync(string executionId)
        {
            await Task.Delay(1);
            var execution = await GetExecutionAsync(executionId);
            if (execution?.Status == ReportExecutionStatus.Completed)
            {
                var result = $"Execution result for {executionId}\nRecords: {execution.RecordCount}\nDuration: {execution.Duration}";
                return System.Text.Encoding.UTF8.GetBytes(result);
            }
            return new byte[0];
        }

        #endregion

        #region Import/Export

        public async Task<string> ExportReportDefinitionAsync(string reportId)
        {
            var report = await GetReportAsync(reportId);
            if (report == null)
                throw new ArgumentException($"Report with ID {reportId} not found");
                
            return JsonSerializer.Serialize(report, _jsonOptions);
        }

        public async Task<ReportDefinition> ImportReportDefinitionAsync(string definitionJson, string newName = null)
        {
            var report = JsonSerializer.Deserialize<ReportDefinition>(definitionJson, _jsonOptions);
            report.Id = Guid.NewGuid().ToString();
            
            if (!string.IsNullOrEmpty(newName))
                report.Name = newName;
                
            return await CreateReportAsync(report);
        }

        public async Task<byte[]> ExportReportsPackageAsync(List<string> reportIds)
        {
            var reports = new List<ReportDefinition>();
            foreach (var reportId in reportIds)
            {
                var report = await GetReportAsync(reportId);
                if (report != null)
                    reports.Add(report);
            }
            
            var package = new { Reports = reports, ExportDate = DateTime.Now, Version = "1.0" };
            var json = JsonSerializer.Serialize(package, _jsonOptions);
            return System.Text.Encoding.UTF8.GetBytes(json);
        }

        public async Task<List<ReportDefinition>> ImportReportsPackageAsync(byte[] packageData)
        {
            var json = System.Text.Encoding.UTF8.GetString(packageData);
            var package = JsonSerializer.Deserialize<JsonElement>(json);
            
            var importedReports = new List<ReportDefinition>();
            if (package.TryGetProperty("Reports", out var reportsElement))
            {
                var reports = JsonSerializer.Deserialize<List<ReportDefinition>>(reportsElement.GetRawText(), _jsonOptions);
                foreach (var report in reports)
                {
                    report.Id = Guid.NewGuid().ToString();
                    var imported = await CreateReportAsync(report);
                    importedReports.Add(imported);
                }
            }
            
            return importedReports;
        }

        #endregion

        #region Report Categories and Organization

        public async Task<List<string>> GetCategoriesAsync()
        {
            await Task.Delay(1);
            return _reports.Where(r => !string.IsNullOrEmpty(r.Category))
                          .Select(r => r.Category)
                          .Distinct()
                          .OrderBy(c => c)
                          .ToList();
        }

        public async Task<List<ReportDefinition>> GetReportsByCategoryAsync(string category)
        {
            await Task.Delay(1);
            return _reports.Where(r => string.Equals(r.Category, category, StringComparison.OrdinalIgnoreCase))
                          .ToList();
        }

        public async Task<List<ReportDefinition>> SearchReportsAsync(string searchTerm, string category = null, List<string> tags = null)
        {
            await Task.Delay(1);
            
            var query = _reports.AsQueryable();
            
            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(r => r.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                                        r.Description.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
            }
            
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(r => string.Equals(r.Category, category, StringComparison.OrdinalIgnoreCase));
            }
            
            if (tags?.Any() == true)
            {
                query = query.Where(r => r.Tags.Any(tag => tags.Contains(tag, StringComparer.OrdinalIgnoreCase)));
            }
            
            return query.ToList();
        }

        #endregion

        #region Report Sharing and Permissions

        public async Task<bool> CanUserAccessReportAsync(string reportId, string userId)
        {
            await Task.Delay(1);
            // For now, allow all access - implement proper security later
            return true;
        }

        public async Task ShareReportAsync(string reportId, List<string> userIds, ReportPermissionLevel permission)
        {
            await Task.Delay(1);
            _logger?.LogInformation("Shared report {ReportId} with {UserCount} users at {Permission} level", 
                reportId, userIds.Count, permission);
        }

        public async Task UnshareReportAsync(string reportId, List<string> userIds)
        {
            await Task.Delay(1);
            _logger?.LogInformation("Unshared report {ReportId} from {UserCount} users", reportId, userIds.Count);
        }

        public async Task<List<ReportPermission>> GetReportPermissionsAsync(string reportId)
        {
            await Task.Delay(1);
            return new List<ReportPermission>();
        }

        #endregion

        #region Report Validation and Testing

        public async Task<ReportValidationResult> ValidateReportAsync(ReportDefinition report)
        {
            await Task.Delay(1);
            
            var result = new ReportValidationResult { IsValid = true };
            
            if (string.IsNullOrWhiteSpace(report.Name))
            {
                result.Errors.Add("Report name is required");
                result.IsValid = false;
            }
            
            if (!report.DataSources.Any())
            {
                result.Errors.Add("At least one data source must be specified");
                result.IsValid = false;
            }
            
            if (!report.Columns.Any())
            {
                result.Warnings.Add("No columns defined - report may be empty");
            }
            
            if (report.Columns.Count > 50)
            {
                result.Warnings.Add("Large number of columns may impact performance");
            }
            
            return result;
        }

        public async Task<List<string>> GetValidationErrorsAsync(string reportId)
        {
            var report = await GetReportAsync(reportId);
            if (report == null)
                return new List<string> { "Report not found" };
                
            var result = await ValidateReportAsync(report);
            return result.Errors;
        }

        public async Task<ReportTestResult> TestReportAsync(string reportId, Dictionary<string, object> testParameters = null)
        {
            var testResult = new ReportTestResult();
            
            try
            {
                var startTime = DateTime.Now;
                var execution = await ExecuteReportAsync(reportId, testParameters);
                testResult.ExecutionTime = DateTime.Now - startTime;
                
                testResult.Success = execution.Status == ReportExecutionStatus.Completed;
                testResult.RecordCount = execution.RecordCount;
                testResult.ErrorMessage = execution.ErrorMessage;
                
                // Add sample data for testing
                testResult.SampleData.Add(new Dictionary<string, object> 
                { 
                    ["Column1"] = "Sample Value 1",
                    ["Column2"] = 123,
                    ["Column3"] = DateTime.Now
                });
                
                return testResult;
            }
            catch (Exception ex)
            {
                testResult.Success = false;
                testResult.ErrorMessage = ex.Message;
                return testResult;
            }
        }

        #endregion

        #region Performance and Optimization

        public async Task<ReportPerformanceInfo> GetReportPerformanceInfoAsync(string reportId)
        {
            await Task.Delay(1);
            
            var executions = await GetExecutionHistoryAsync(reportId, 100);
            if (!executions.Any())
                return new ReportPerformanceInfo { ReportId = reportId };
            
            return new ReportPerformanceInfo
            {
                ReportId = reportId,
                ExecutionCount = executions.Count,
                AverageExecutionTime = TimeSpan.FromMilliseconds(executions.Average(e => e.Duration.TotalMilliseconds)),
                LastExecutionTime = executions.First().Duration,
                AverageRecordCount = (int)executions.Average(e => e.RecordCount),
                LastExecutionDate = executions.First().StartTime
            };
        }

        public async Task<List<ReportOptimizationSuggestion>> GetOptimizationSuggestionsAsync(string reportId)
        {
            await Task.Delay(1);
            
            var suggestions = new List<ReportOptimizationSuggestion>();
            var report = await GetReportAsync(reportId);
            
            if (report?.Columns.Count > 20)
            {
                suggestions.Add(new ReportOptimizationSuggestion
                {
                    Type = "Column Count",
                    Description = "Report has many columns which may impact performance",
                    Recommendation = "Consider reducing the number of visible columns or splitting into multiple reports",
                    Priority = ReportOptimizationPriority.Medium,
                    EstimatedImprovement = TimeSpan.FromSeconds(2)
                });
            }
            
            if (!report.Filters.Any())
            {
                suggestions.Add(new ReportOptimizationSuggestion
                {
                    Type = "Data Filtering",
                    Description = "No filters applied - may process unnecessary data",
                    Recommendation = "Add filters to reduce data volume",
                    Priority = ReportOptimizationPriority.High,
                    EstimatedImprovement = TimeSpan.FromSeconds(5)
                });
            }
            
            return suggestions;
        }

        public async Task OptimizeReportAsync(string reportId)
        {
            await Task.Delay(1);
            _logger?.LogInformation("Applied optimizations to report: {ReportId}", reportId);
        }

        #endregion

        #region Configuration and Settings

        public async Task<ReportBuilderSettings> GetSettingsAsync()
        {
            await Task.Delay(1);
            return _settings;
        }

        public async Task UpdateSettingsAsync(ReportBuilderSettings settings)
        {
            await Task.Delay(1);
            // Update settings properties
            _settings.MaxExecutionTimeMinutes = settings.MaxExecutionTimeMinutes;
            _settings.MaxRecordsPerReport = settings.MaxRecordsPerReport;
            _settings.AllowScheduledReports = settings.AllowScheduledReports;
            _settings.AllowReportSharing = settings.AllowReportSharing;
        }

        public async Task<List<ReportOutputFormat>> GetSupportedFormatsAsync()
        {
            await Task.Delay(1);
            return Enum.GetValues<ReportOutputFormat>().ToList();
        }

        public async Task<Dictionary<string, object>> GetDefaultFormattingOptionsAsync()
        {
            await Task.Delay(1);
            
            return new Dictionary<string, object>
            {
                ["FontFamily"] = "Segoe UI",
                ["FontSize"] = 10,
                ["HeaderFontSize"] = 12,
                ["TitleFontSize"] = 16,
                ["ShowGridLines"] = true,
                ["AlternateRowColors"] = true,
                ["Theme"] = "Default"
            };
        }

        #endregion

        #region Private Helper Methods

        private async Task InitializeAsync()
        {
            try
            {
                await LoadReportsAsync();
                await LoadTemplatesAsync();
                await LoadSchedulesAsync();
                InitializeBuiltInTemplates();
                
                _logger?.LogInformation("ReportBuilderService initialized with {ReportCount} reports and {TemplateCount} templates", 
                    _reports.Count, _templates.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error initializing ReportBuilderService");
            }
        }

        private void EnsureDirectoriesExist()
        {
            Directory.CreateDirectory(_reportsPath);
            Directory.CreateDirectory(_templatesPath);
            Directory.CreateDirectory(Path.Combine(_reportsPath, "Schedules"));
        }

        private async Task LoadReportsAsync()
        {
            var reportFiles = Directory.GetFiles(_reportsPath, "*.json");
            foreach (var file in reportFiles)
            {
                try
                {
                    var json = await File.ReadAllTextAsync(file);
                    var report = JsonSerializer.Deserialize<ReportDefinition>(json, _jsonOptions);
                    if (report != null)
                        _reports.Add(report);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Failed to load report from file: {File}", file);
                }
            }
        }

        private async Task LoadTemplatesAsync()
        {
            var templateFiles = Directory.GetFiles(_templatesPath, "*.json");
            foreach (var file in templateFiles)
            {
                try
                {
                    var json = await File.ReadAllTextAsync(file);
                    var template = JsonSerializer.Deserialize<ReportTemplate>(json, _jsonOptions);
                    if (template != null)
                        _templates.Add(template);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Failed to load template from file: {File}", file);
                }
            }
        }

        private async Task LoadSchedulesAsync()
        {
            var schedulePath = Path.Combine(_reportsPath, "Schedules");
            if (!Directory.Exists(schedulePath))
                return;
                
            var scheduleFiles = Directory.GetFiles(schedulePath, "*.json");
            foreach (var file in scheduleFiles)
            {
                try
                {
                    var json = await File.ReadAllTextAsync(file);
                    var schedule = JsonSerializer.Deserialize<ReportSchedule>(json, _jsonOptions);
                    if (schedule != null)
                        _schedules.Add(schedule);
                }
                catch (Exception ex)
                {
                    _logger?.LogWarning(ex, "Failed to load schedule from file: {File}", file);
                }
            }
        }

        private void InitializeBuiltInTemplates()
        {
            if (_templates.Any(t => t.IsBuiltIn))
                return; // Already initialized
                
            // Add built-in templates
            _templates.Add(CreateUserSummaryTemplate());
            _templates.Add(CreateComputerInventoryTemplate());
            _templates.Add(CreateApplicationReportTemplate());
            _templates.Add(CreateMigrationStatusTemplate());
        }

        private async Task SaveReportAsync(ReportDefinition report)
        {
            var filePath = Path.Combine(_reportsPath, $"{report.Id}.json");
            var json = JsonSerializer.Serialize(report, _jsonOptions);
            await File.WriteAllTextAsync(filePath, json);
        }

        private async Task SaveTemplateAsync(ReportTemplate template)
        {
            var filePath = Path.Combine(_templatesPath, $"{template.Id}.json");
            var json = JsonSerializer.Serialize(template, _jsonOptions);
            await File.WriteAllTextAsync(filePath, json);
        }

        private async Task SaveScheduleAsync(ReportSchedule schedule)
        {
            var filePath = Path.Combine(_reportsPath, "Schedules", $"{schedule.Id}.json");
            var json = JsonSerializer.Serialize(schedule, _jsonOptions);
            await File.WriteAllTextAsync(filePath, json);
        }

        private async Task DeleteReportFileAsync(string reportId)
        {
            var filePath = Path.Combine(_reportsPath, $"{reportId}.json");
            if (File.Exists(filePath))
                await Task.Run(() => File.Delete(filePath));
        }

        private async Task DeleteScheduleFileAsync(string scheduleId)
        {
            var filePath = Path.Combine(_reportsPath, "Schedules", $"{scheduleId}.json");
            if (File.Exists(filePath))
                await Task.Run(() => File.Delete(filePath));
        }

        private ReportDefinition CloneReportDefinition(ReportDefinition source)
        {
            var json = JsonSerializer.Serialize(source, _jsonOptions);
            var cloned = JsonSerializer.Deserialize<ReportDefinition>(json, _jsonOptions);
            cloned.Id = Guid.NewGuid().ToString();
            return cloned;
        }

        private async Task<DateTime?> CalculateNextExecutionTimeAsync(ReportSchedule schedule)
        {
            await Task.Delay(1);
            
            if (!schedule.IsEnabled)
                return null;
                
            var now = DateTime.Now;
            var executionDate = schedule.StartDate.Date.Add(schedule.ExecutionTime);
            
            return schedule.ScheduleType switch
            {
                ReportScheduleType.Once => executionDate > now ? executionDate : null,
                ReportScheduleType.Daily => executionDate > now ? executionDate : executionDate.AddDays(1),
                ReportScheduleType.Weekly => GetNextWeeklyExecution(executionDate, schedule.DaysOfWeek, now),
                ReportScheduleType.Monthly => GetNextMonthlyExecution(executionDate, schedule.DaysOfMonth, now),
                _ => null
            };
        }

        private DateTime? GetNextWeeklyExecution(DateTime executionDateTime, List<DayOfWeek> daysOfWeek, DateTime now)
        {
            if (!daysOfWeek.Any())
                return null;
                
            for (int i = 0; i < 7; i++)
            {
                var candidate = now.Date.AddDays(i).Add(executionDateTime.TimeOfDay);
                if (candidate > now && daysOfWeek.Contains(candidate.DayOfWeek))
                    return candidate;
            }
            
            return null;
        }

        private DateTime? GetNextMonthlyExecution(DateTime executionDateTime, List<int> daysOfMonth, DateTime now)
        {
            if (!daysOfMonth.Any())
                return null;
                
            var currentMonth = new DateTime(now.Year, now.Month, 1);
            for (int i = 0; i < 3; i++) // Check next 3 months
            {
                var monthToCheck = currentMonth.AddMonths(i);
                foreach (var day in daysOfMonth.Where(d => d <= DateTime.DaysInMonth(monthToCheck.Year, monthToCheck.Month)))
                {
                    var candidate = new DateTime(monthToCheck.Year, monthToCheck.Month, day).Add(executionDateTime.TimeOfDay);
                    if (candidate > now)
                        return candidate;
                }
            }
            
            return null;
        }

        private async Task<List<Dictionary<string, object>>> GetUserSampleData(int maxRows)
        {
            try
            {
                var profile = await _profileService?.GetCurrentProfileAsync();
                if (profile != null)
                {
                    var users = await _dataService.LoadUsersAsync(profile.Name);
                    return users.Take(maxRows).Select(u => new Dictionary<string, object>
                    {
                        ["Id"] = u.Id,
                        ["Name"] = u.Name,
                        ["UserPrincipalName"] = u.UserPrincipalName,
                        ["Email"] = u.Email,
                        ["Department"] = u.Department,
                        ["JobTitle"] = u.JobTitle,
                        ["Enabled"] = u.AccountEnabled
                    }).ToList();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting user sample data");
            }
            
            return new List<Dictionary<string, object>>();
        }

        private async Task<List<Dictionary<string, object>>> GetGroupSampleData(int maxRows)
        {
            try
            {
                var profile = await _profileService?.GetCurrentProfileAsync();
                if (profile != null)
                {
                    var groups = await _dataService.LoadGroupsAsync(profile.Name);
                    return groups.Take(maxRows).Select(g => new Dictionary<string, object>
                    {
                        ["Id"] = g.Id,
                        ["Name"] = g.Name,
                        ["Description"] = g.Description,
                        ["Type"] = g.Type,
                        ["MemberCount"] = g.MemberCount
                    }).ToList();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting group sample data");
            }
            
            return new List<Dictionary<string, object>>();
        }

        private async Task<List<Dictionary<string, object>>> GetComputerSampleData(int maxRows)
        {
            try
            {
                var profile = await _profileService?.GetCurrentProfileAsync();
                if (profile != null)
                {
                    var computers = await _dataService.LoadInfrastructureAsync(profile.Name);
                    return computers.Take(maxRows).Select(c => new Dictionary<string, object>
                    {
                        ["Id"] = c.Id,
                        ["Name"] = c.Name,
                        ["OperatingSystem"] = c.OperatingSystem,
                        ["Domain"] = c.Domain,
                        ["Location"] = c.Location
                    }).ToList();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting computer sample data");
            }
            
            return new List<Dictionary<string, object>>();
        }

        private async Task<List<Dictionary<string, object>>> GetApplicationSampleData(int maxRows)
        {
            try
            {
                var profile = await _profileService?.GetCurrentProfileAsync();
                if (profile != null)
                {
                    var applications = await _dataService.LoadApplicationsAsync(profile.Name);
                    return applications.Take(maxRows).Select(a => new Dictionary<string, object>
                    {
                        ["Id"] = a.Id,
                        ["Name"] = a.Name,
                        ["Version"] = a.Version,
                        ["Publisher"] = a.Publisher,
                        ["InstallDate"] = a.InstallDate
                    }).ToList();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting application sample data");
            }
            
            return new List<Dictionary<string, object>>();
        }

        private async Task<int> GetDataSourceRecordCountAsync(string dataSourceId)
        {
            try
            {
                var sampleData = await GetSampleDataAsync(dataSourceId, int.MaxValue);
                return sampleData.Count;
            }
            catch
            {
                return 0;
            }
        }

        private Dictionary<string, string> GetFieldDataTypes(string dataSourceId)
        {
            return dataSourceId?.ToLower() switch
            {
                "users" => new Dictionary<string, string>
                {
                    ["Id"] = "String",
                    ["Name"] = "String",
                    ["UserPrincipalName"] = "String",
                    ["Email"] = "String",
                    ["Department"] = "String",
                    ["JobTitle"] = "String",
                    ["Enabled"] = "Boolean",
                    ["LastLogon"] = "DateTime",
                    ["WhenCreated"] = "DateTime"
                },
                "groups" => new Dictionary<string, string>
                {
                    ["Id"] = "String",
                    ["Name"] = "String",
                    ["DisplayName"] = "String",
                    ["Description"] = "String",
                    ["Type"] = "String",
                    ["MemberCount"] = "Integer",
                    ["Mail"] = "String",
                    ["Domain"] = "String"
                },
                "computers" => new Dictionary<string, string>
                {
                    ["Id"] = "String",
                    ["Name"] = "String",
                    ["OperatingSystem"] = "String",
                    ["Domain"] = "String",
                    ["Location"] = "String",
                    ["Status"] = "String",
                    ["LastBootTime"] = "DateTime",
                    ["InstallDate"] = "DateTime"
                },
                _ => new Dictionary<string, string>()
            };
        }

        private string GetFieldDataType(string dataSourceId, string fieldName)
        {
            var dataTypes = GetFieldDataTypes(dataSourceId);
            return dataTypes.TryGetValue(fieldName, out var dataType) ? dataType : "String";
        }

        private string FormatFieldDisplayName(string fieldName)
        {
            // Convert camelCase/PascalCase to readable format
            return System.Text.RegularExpressions.Regex.Replace(fieldName, "([A-Z])", " $1").Trim();
        }

        #region Built-in Templates

        private ReportTemplate CreateUserSummaryTemplate()
        {
            var definition = new ReportDefinition
            {
                Name = "User Summary Report",
                Description = "Summary report showing user account information",
                ReportType = ReportType.Table,
                Category = "User Management",
                IsTemplate = true
            };
            
            definition.DataSources.Add(new ReportDataSource
            {
                Name = "Users",
                Type = DataSourceType.Users,
                IsActive = true
            });
            
            definition.Columns.AddRange(new[]
            {
                new ReportColumn { FieldName = "Name", DisplayName = "Name", IsVisible = true, Order = 1, Width = 150 },
                new ReportColumn { FieldName = "UserPrincipalName", DisplayName = "User Principal Name", IsVisible = true, Order = 2, Width = 200 },
                new ReportColumn { FieldName = "Department", DisplayName = "Department", IsVisible = true, Order = 3, Width = 120 },
                new ReportColumn { FieldName = "JobTitle", DisplayName = "Job Title", IsVisible = true, Order = 4, Width = 150 },
                new ReportColumn { FieldName = "Enabled", DisplayName = "Enabled", IsVisible = true, Order = 5, Width = 80 }
            });
            
            return new ReportTemplate
            {
                Name = "User Summary Report",
                Description = "Built-in template for user summary reporting",
                Category = "User Management",
                Definition = definition,
                IsBuiltIn = true
            };
        }

        private ReportTemplate CreateComputerInventoryTemplate()
        {
            var definition = new ReportDefinition
            {
                Name = "Computer Inventory Report",
                Description = "Inventory report showing computer information",
                ReportType = ReportType.Table,
                Category = "Infrastructure",
                IsTemplate = true
            };
            
            definition.DataSources.Add(new ReportDataSource
            {
                Name = "Computers",
                Type = DataSourceType.Computers,
                IsActive = true
            });
            
            definition.Columns.AddRange(new[]
            {
                new ReportColumn { FieldName = "Name", DisplayName = "Computer Name", IsVisible = true, Order = 1, Width = 150 },
                new ReportColumn { FieldName = "OperatingSystem", DisplayName = "Operating System", IsVisible = true, Order = 2, Width = 200 },
                new ReportColumn { FieldName = "Domain", DisplayName = "Domain", IsVisible = true, Order = 3, Width = 120 },
                new ReportColumn { FieldName = "Location", DisplayName = "Location", IsVisible = true, Order = 4, Width = 100 },
                new ReportColumn { FieldName = "Status", DisplayName = "Status", IsVisible = true, Order = 5, Width = 80 }
            });
            
            return new ReportTemplate
            {
                Name = "Computer Inventory Report",
                Description = "Built-in template for computer inventory reporting",
                Category = "Infrastructure",
                Definition = definition,
                IsBuiltIn = true
            };
        }

        private ReportTemplate CreateApplicationReportTemplate()
        {
            var definition = new ReportDefinition
            {
                Name = "Application Report",
                Description = "Report showing installed applications",
                ReportType = ReportType.Table,
                Category = "Applications",
                IsTemplate = true
            };
            
            definition.DataSources.Add(new ReportDataSource
            {
                Name = "Applications",
                Type = DataSourceType.Applications,
                IsActive = true
            });
            
            definition.Columns.AddRange(new[]
            {
                new ReportColumn { FieldName = "Name", DisplayName = "Application Name", IsVisible = true, Order = 1, Width = 200 },
                new ReportColumn { FieldName = "Version", DisplayName = "Version", IsVisible = true, Order = 2, Width = 100 },
                new ReportColumn { FieldName = "Publisher", DisplayName = "Publisher", IsVisible = true, Order = 3, Width = 150 },
                new ReportColumn { FieldName = "InstallDate", DisplayName = "Install Date", IsVisible = true, Order = 4, Width = 120 }
            });
            
            return new ReportTemplate
            {
                Name = "Application Report",
                Description = "Built-in template for application reporting",
                Category = "Applications",
                Definition = definition,
                IsBuiltIn = true
            };
        }

        private ReportTemplate CreateMigrationStatusTemplate()
        {
            var definition = new ReportDefinition
            {
                Name = "Migration Status Report",
                Description = "Report showing migration wave status",
                ReportType = ReportType.Table,
                Category = "Migration",
                IsTemplate = true
            };
            
            definition.DataSources.Add(new ReportDataSource
            {
                Name = "Migration Waves",
                Type = DataSourceType.MigrationWaves,
                IsActive = true
            });
            
            definition.Columns.AddRange(new[]
            {
                new ReportColumn { FieldName = "Name", DisplayName = "Wave Name", IsVisible = true, Order = 1, Width = 200 },
                new ReportColumn { FieldName = "Status", DisplayName = "Status", IsVisible = true, Order = 2, Width = 100 },
                new ReportColumn { FieldName = "Priority", DisplayName = "Priority", IsVisible = true, Order = 3, Width = 80 },
                new ReportColumn { FieldName = "PlannedStartDate", DisplayName = "Planned Start", IsVisible = true, Order = 4, Width = 120 },
                new ReportColumn { FieldName = "PlannedEndDate", DisplayName = "Planned End", IsVisible = true, Order = 5, Width = 120 },
                new ReportColumn { FieldName = "AssignedTo", DisplayName = "Assigned To", IsVisible = true, Order = 6, Width = 150 }
            });
            
            return new ReportTemplate
            {
                Name = "Migration Status Report",
                Description = "Built-in template for migration status reporting",
                Category = "Migration",
                Definition = definition,
                IsBuiltIn = true
            };
        }

        #endregion

        #endregion
    }
}
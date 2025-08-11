using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Extensions.Logging;
using Microsoft.Win32;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Comprehensive log viewer and audit trail dialog
    /// </summary>
    public partial class LogViewerDialog : Window
    {
        private List<object> _currentLogs = new List<object>();
        private List<Services.LogEntry> _applicationLogs = new List<Services.LogEntry>();
        private List<AuditLogEntry> _auditLogs = new List<AuditLogEntry>();

        public LogViewerDialog()
        {
            InitializeComponent();
            InitializeFilters();
            _ = LoadInitialDataAsync();
        }

        private void InitializeFilters()
        {
            // Set default date range to last 7 days
            EndDatePicker.SelectedDate = DateTime.Today;
            StartDatePicker.SelectedDate = DateTime.Today.AddDays(-7);
        }

        private async Task LoadInitialDataAsync()
        {
            await RefreshLogsAsync();
            await LoadStatisticsAsync();
        }

        private async void RefreshButton_Click(object sender, RoutedEventArgs e)
        {
            await RefreshLogsAsync();
            await LoadStatisticsAsync();
        }

        private async Task RefreshLogsAsync()
        {
            try
            {
                StatusTextBlock.Text = "Loading logs...";
                
                var startDate = StartDatePicker.SelectedDate ?? DateTime.Today.AddDays(-7);
                var endDate = EndDatePicker.SelectedDate ?? DateTime.Today;
                
                // Ensure end date includes the full day
                endDate = endDate.Date.AddDays(1).AddTicks(-1);

                var selectedLogType = (LogTypeComboBox.SelectedItem as ComboBoxItem)?.Content.ToString();
                
                // Load different types of logs based on selection
                switch (selectedLogType)
                {
                    case "Application Logs":
                        await LoadApplicationLogsAsync(startDate, endDate);
                        break;
                    case "Audit Logs":
                        await LoadAuditLogsAsync(startDate, endDate, false);
                        break;
                    case "Security Logs":
                        await LoadAuditLogsAsync(startDate, endDate, true);
                        break;
                    case "Error Logs Only":
                        await LoadApplicationLogsAsync(startDate, endDate, Services.LogLevel.Error);
                        break;
                    default: // All Logs
                        await LoadAllLogsAsync(startDate, endDate);
                        break;
                }

                ApplyFilters();
                StatusTextBlock.Text = "Logs loaded successfully";
            }
            catch (Exception ex)
            {
                StatusTextBlock.Text = $"Error loading logs: {ex.Message}";
                MessageBox.Show($"Error loading logs: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async Task LoadApplicationLogsAsync(DateTime startDate, DateTime endDate, Services.LogLevel? minLevel = null)
        {
            try
            {
                _applicationLogs = await EnhancedLoggingService.Instance.GetLogsAsync(startDate, endDate, minLevel);
                _currentLogs = _applicationLogs.Cast<object>().ToList();
                LogsDataGrid.ItemsSource = _currentLogs;
                // TabControl.SelectedIndex = 0; // Select Log Entries tab - commented out to avoid error
            }
            catch (Exception ex)
            {
                StatusTextBlock.Text = $"Error loading application logs: {ex.Message}";
            }
        }

        private async Task LoadAuditLogsAsync(DateTime startDate, DateTime endDate, bool securityEventsOnly = false)
        {
            try
            {
                _auditLogs = await AuditService.Instance.GetAuditLogsAsync(startDate, endDate, includeSecurityEvents: securityEventsOnly);
                
                if (securityEventsOnly)
                {
                    _auditLogs = _auditLogs.Where(l => l.IsSecurityEvent).ToList();
                }
                
                AuditDataGrid.ItemsSource = _auditLogs;
                // TabControl.SelectedIndex = 2; // Select Audit Trail tab - commented out to avoid error
            }
            catch (Exception ex)
            {
                StatusTextBlock.Text = $"Error loading audit logs: {ex.Message}";
            }
        }

        private async Task LoadAllLogsAsync(DateTime startDate, DateTime endDate)
        {
            await LoadApplicationLogsAsync(startDate, endDate);
            await LoadAuditLogsAsync(startDate, endDate);
        }

        private void ApplyFilters()
        {
            if (_currentLogs == null) return;

            var filteredLogs = _currentLogs.AsEnumerable();

            // Apply level filter
            var selectedLevel = (LogLevelComboBox.SelectedItem as ComboBoxItem)?.Content.ToString();
            if (!string.IsNullOrEmpty(selectedLevel) && selectedLevel != "All Levels")
            {
                if (Enum.TryParse<Services.LogLevel>(selectedLevel, out var level))
                {
                    filteredLogs = filteredLogs.Where(log => 
                        log is Services.LogEntry appLog && appLog.Level >= level);
                }
                else if (Enum.TryParse<AuditLevel>(selectedLevel, out var auditLevel))
                {
                    filteredLogs = filteredLogs.Where(log => 
                        log is AuditLogEntry auditLog && auditLog.Level >= auditLevel);
                }
            }

            // Apply search filter
            var searchText = SearchTextBox.Text;
            if (!string.IsNullOrEmpty(searchText))
            {
                filteredLogs = filteredLogs.Where(log =>
                    (log is Services.LogEntry appLog && 
                     (appLog.Message?.Contains(searchText, StringComparison.OrdinalIgnoreCase) == true ||
                      appLog.Category?.Contains(searchText, StringComparison.OrdinalIgnoreCase) == true)) ||
                    (log is AuditLogEntry auditLog && 
                     (auditLog.Action?.Contains(searchText, StringComparison.OrdinalIgnoreCase) == true ||
                      auditLog.Details?.Contains(searchText, StringComparison.OrdinalIgnoreCase) == true))
                );
            }

            // Apply category filter
            var selectedCategory = (CategoryComboBox.SelectedItem as ComboBoxItem)?.Content.ToString();
            if (!string.IsNullOrEmpty(selectedCategory) && selectedCategory != "All Categories")
            {
                filteredLogs = ApplyCategoryFilter(filteredLogs, selectedCategory);
            }

            var finalLogs = filteredLogs.ToList();
            LogsDataGrid.ItemsSource = finalLogs;
            RecordCountTextBlock.Text = $"{finalLogs.Count} records";
        }

        private IEnumerable<object> ApplyCategoryFilter(IEnumerable<object> logs, string category)
        {
            return category switch
            {
                "User Actions" => logs.Where(log => 
                    (log is Services.LogEntry appLog && appLog.Message?.Contains("User Action") == true) ||
                    (log is AuditLogEntry auditLog && auditLog.EventType == AuditEventType.UserAction)),
                "Data Operations" => logs.Where(log => 
                    (log is Services.LogEntry appLog && appLog.Message?.Contains("Data Operation") == true) ||
                    (log is AuditLogEntry auditLog && auditLog.EventType == AuditEventType.DataAccess)),
                "Configuration" => logs.Where(log => 
                    (log is AuditLogEntry auditLog && auditLog.EventType == AuditEventType.ConfigurationChange)),
                "Discovery" => logs.Where(log => 
                    (log is AuditLogEntry auditLog && auditLog.EventType == AuditEventType.DiscoveryOperation)),
                "Security" => logs.Where(log => 
                    (log is AuditLogEntry auditLog && auditLog.IsSecurityEvent)),
                "Performance" => logs.Where(log => 
                    (log is Services.LogEntry appLog && appLog.Message?.Contains("Performance") == true) ||
                    (log is AuditLogEntry auditLog && auditLog.EventType == AuditEventType.PerformanceMetric)),
                "Errors" => logs.Where(log => 
                    (log is Services.LogEntry appLog && appLog.Level >= Services.LogLevel.Error) ||
                    (log is AuditLogEntry auditLog && auditLog.Level >= AuditLevel.Error)),
                _ => logs
            };
        }

        private async Task LoadStatisticsAsync()
        {
            try
            {
                var startDate = StartDatePicker.SelectedDate ?? DateTime.Today.AddDays(-7);
                var endDate = EndDatePicker.SelectedDate ?? DateTime.Today;
                endDate = endDate.Date.AddDays(1).AddTicks(-1);

                var loggingStats = await EnhancedLoggingService.Instance.GetLoggingStatisticsAsync(startDate, endDate);
                var auditStats = await AuditService.Instance.GetAuditStatisticsAsync(startDate, endDate);

                // Update summary statistics
                TotalEntriesText.Text = $"Total Entries: {loggingStats.TotalEntries + auditStats.TotalEvents:N0}";
                ErrorCountText.Text = $"Errors: {loggingStats.ErrorCount + auditStats.Errors:N0}";
                WarningCountText.Text = $"Warnings: {loggingStats.WarningCount:N0}";
                InfoCountText.Text = $"Information: {loggingStats.InformationCount:N0}";
                DebugCountText.Text = $"Debug: {loggingStats.DebugCount:N0}";

                // Update error categories
                ErrorCategoriesItemsControl.ItemsSource = loggingStats.CategoriesWithMostErrors;

                // Update exception types
                ExceptionTypesItemsControl.ItemsSource = loggingStats.TopExceptionTypes;
            }
            catch (Exception ex)
            {
                StatusTextBlock.Text = $"Error loading statistics: {ex.Message}";
            }
        }

        private void LogsDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (LogsDataGrid.SelectedItem == null)
            {
                DetailMessageTextBlock.Text = "";
                LocationTextBlock.Text = "";
                ExceptionTextBox.Text = "";
                ExceptionTextBox.Visibility = Visibility.Collapsed;
                ExceptionLabel.Visibility = Visibility.Collapsed;
                StructuredDataTextBox.Text = "";
                return;
            }

            try
            {
                if (LogsDataGrid.SelectedItem is Services.LogEntry appLog)
                {
                    DisplayApplicationLogDetails(appLog);
                }
                else if (LogsDataGrid.SelectedItem is AuditLogEntry auditLog)
                {
                    DisplayAuditLogDetails(auditLog);
                }
            }
            catch (Exception ex)
            {
                DetailMessageTextBlock.Text = $"Error displaying log details: {ex.Message}";
            }
        }

        private void DisplayApplicationLogDetails(Services.LogEntry log)
        {
            DetailMessageTextBlock.Text = log.Message ?? "";
            LocationTextBlock.Text = $"{log.Category} → {log.MemberName} ({log.FilePath}:{log.LineNumber})";

            if (log.Exception != null)
            {
                ExceptionTextBox.Text = $"{log.Exception.GetType().Name}: {log.Exception.Message}\n\nStack Trace:\n{log.Exception.StackTrace}";
                ExceptionTextBox.Visibility = Visibility.Visible;
                ExceptionLabel.Visibility = Visibility.Visible;
            }
            else
            {
                ExceptionTextBox.Visibility = Visibility.Collapsed;
                ExceptionLabel.Visibility = Visibility.Collapsed;
            }

            if (log.Data != null)
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                StructuredDataTextBox.Text = JsonSerializer.Serialize(log.Data, options);
            }
            else
            {
                StructuredDataTextBox.Text = "No structured data available";
            }
        }

        private void DisplayAuditLogDetails(AuditLogEntry log)
        {
            DetailMessageTextBlock.Text = log.Details ?? log.Action ?? "";
            LocationTextBlock.Text = $"{log.EventType} on {log.MachineName} by {log.UserName}";

            ExceptionTextBox.Visibility = Visibility.Collapsed;
            ExceptionLabel.Visibility = Visibility.Collapsed;

            if (log.Data != null)
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                StructuredDataTextBox.Text = JsonSerializer.Serialize(log.Data, options);
            }
            else
            {
                StructuredDataTextBox.Text = "No structured data available";
            }
        }

        private async void ExportButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var saveDialog = new SaveFileDialog
                {
                    Title = "Export Logs",
                    Filter = "JSON files (*.json)|*.json|CSV files (*.csv)|*.csv|All files (*.*)|*.*",
                    FileName = $"logs_export_{DateTime.Now:yyyyMMdd_HHmmss}"
                };

                if (saveDialog.ShowDialog() == true)
                {
                    StatusTextBlock.Text = "Exporting logs...";

                    var extension = System.IO.Path.GetExtension(saveDialog.FileName).ToLower();
                    
                    if (extension == ".json")
                    {
                        var options = new JsonSerializerOptions { WriteIndented = true };
                        var json = JsonSerializer.Serialize(_currentLogs, options);
                        await System.IO.File.WriteAllTextAsync(saveDialog.FileName, json);
                    }
                    else if (extension == ".csv")
                    {
                        await ExportToCsvAsync(saveDialog.FileName);
                    }

                    StatusTextBlock.Text = $"Logs exported to {saveDialog.FileName}";
                    MessageBox.Show($"Logs successfully exported to:\n{saveDialog.FileName}", 
                        "Export Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                StatusTextBlock.Text = $"Export error: {ex.Message}";
                MessageBox.Show($"Error exporting logs: {ex.Message}", "Export Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async Task ExportToCsvAsync(string filePath)
        {
            var csv = new System.Text.StringBuilder();
            
            // Add headers
            csv.AppendLine("Timestamp,Level,Category,Message,User,Machine,EventType,Details");

            // Add data rows
            foreach (var log in _currentLogs)
            {
                if (log is Services.LogEntry appLog)
                {
                    csv.AppendLine($"\"{appLog.Timestamp:yyyy-MM-dd HH:mm:ss.fff}\"," +
                                  $"\"{appLog.Level}\"," +
                                  $"\"{appLog.Category}\"," +
                                  $"\"{EscapeCsv(appLog.Message)}\"," +
                                  $"\"{Environment.UserName}\"," +
                                  $"\"{Environment.MachineName}\"," +
                                  $"\"ApplicationLog\"," +
                                  $"\"\"");
                }
                else if (log is AuditLogEntry auditLog)
                {
                    csv.AppendLine($"\"{auditLog.Timestamp:yyyy-MM-dd HH:mm:ss.fff}\"," +
                                  $"\"{auditLog.Level}\"," +
                                  $"\"{auditLog.EventType}\"," +
                                  $"\"{EscapeCsv(auditLog.Action)}\"," +
                                  $"\"{auditLog.UserName}\"," +
                                  $"\"{auditLog.MachineName}\"," +
                                  $"\"AuditLog\"," +
                                  $"\"{EscapeCsv(auditLog.Details)}\"");
                }
            }

            await System.IO.File.WriteAllTextAsync(filePath, csv.ToString());
        }

        private string EscapeCsv(string field)
        {
            if (string.IsNullOrEmpty(field)) return "";
            return field.Replace("\"", "\"\"");
        }

        private async void ClearLogsButton_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show(
                "This will archive log files older than 30 days. Continue?", 
                "Clear Old Logs", 
                MessageBoxButton.YesNo, 
                MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                try
                {
                    StatusTextBlock.Text = "Archiving old logs...";
                    await AuditService.Instance.CleanupOldLogsAsync(30);
                    StatusTextBlock.Text = "Old logs archived successfully";
                    MessageBox.Show("Old logs have been archived successfully.", 
                        "Cleanup Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                catch (Exception ex)
                {
                    StatusTextBlock.Text = $"Cleanup error: {ex.Message}";
                    MessageBox.Show($"Error during log cleanup: {ex.Message}", 
                        "Cleanup Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }
    }
}
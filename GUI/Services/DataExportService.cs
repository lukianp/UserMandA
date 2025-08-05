using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Win32;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public interface IDataExportService
    {
        Task<bool> ExportToCsvAsync<T>(IEnumerable<T> data, string defaultFileName = null);
        Task<bool> ExportToJsonAsync<T>(IEnumerable<T> data, string defaultFileName = null);
    }

    public class DataExportService : IDataExportService
    {
        private static DataExportService _instance;
        private static readonly object _lock = new object();

        public static DataExportService Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new DataExportService();
                    }
                }
                return _instance;
            }
        }

        private DataExportService() { }

        public async Task<bool> ExportToCsvAsync<T>(IEnumerable<T> data, string defaultFileName = null)
        {
            try
            {
                if (data == null || !data.Any())
                {
                    DialogService.Instance.ShowWarningDialog("Export Warning", "No data to export.");
                    return false;
                }

                var saveFileDialog = new SaveFileDialog
                {
                    Title = "Export to CSV",
                    Filter = "CSV files (*.csv)|*.csv|All files (*.*)|*.*",
                    FilterIndex = 1,
                    FileName = defaultFileName ?? $"Export_{DateTime.Now:yyyy-MM-dd_HH-mm-ss}.csv"
                };

                if (saveFileDialog.ShowDialog() == true)
                {
                    var csv = ConvertToCsv(data);
                    await File.WriteAllTextAsync(saveFileDialog.FileName, csv, Encoding.UTF8);
                    
                    DialogService.Instance.ShowInformationDialog("Export Complete", 
                        $"Data exported successfully to:\n{saveFileDialog.FileName}");
                    return true;
                }
            }
            catch (Exception ex)
            {
                var errorMessage = ErrorHandlingService.Instance.HandleException(ex, "Data export to CSV");
                DialogService.Instance.ShowErrorDialog("Export Error", errorMessage);
            }

            return false;
        }

        public async Task<bool> ExportToJsonAsync<T>(IEnumerable<T> data, string defaultFileName = null)
        {
            try
            {
                if (data == null || !data.Any())
                {
                    DialogService.Instance.ShowWarningDialog("Export Warning", "No data to export.");
                    return false;
                }

                var saveFileDialog = new SaveFileDialog
                {
                    Title = "Export to JSON",
                    Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*",
                    FilterIndex = 1,
                    FileName = defaultFileName ?? $"Export_{DateTime.Now:yyyy-MM-dd_HH-mm-ss}.json"
                };

                if (saveFileDialog.ShowDialog() == true)
                {
                    var json = JsonSerializer.Serialize(data, new JsonSerializerOptions 
                    { 
                        WriteIndented = true,
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    });
                    
                    await File.WriteAllTextAsync(saveFileDialog.FileName, json, Encoding.UTF8);
                    
                    DialogService.Instance.ShowInformationDialog("Export Complete", 
                        $"Data exported successfully to:\n{saveFileDialog.FileName}");
                    return true;
                }
            }
            catch (Exception ex)
            {
                var errorMessage = ErrorHandlingService.Instance.HandleException(ex, "Data export to JSON");
                DialogService.Instance.ShowErrorDialog("Export Error", errorMessage);
            }

            return false;
        }

        private string ConvertToCsv<T>(IEnumerable<T> data)
        {
            var csv = new StringBuilder();
            var properties = typeof(T).GetProperties();
            
            // Header row
            csv.AppendLine(string.Join(",", properties.Select(p => EscapeCsvField(p.Name))));
            
            // Data rows
            foreach (var item in data)
            {
                var values = properties.Select(p => 
                {
                    var value = p.GetValue(item);
                    return EscapeCsvField(value?.ToString() ?? "");
                });
                csv.AppendLine(string.Join(",", values));
            }
            
            return csv.ToString();
        }

        private string EscapeCsvField(string field)
        {
            if (string.IsNullOrEmpty(field))
                return "\"\"";

            if (field.Contains(",") || field.Contains("\"") || field.Contains("\r") || field.Contains("\n"))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }

            return field;
        }
    }
}
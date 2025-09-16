// Version: 1.0.0
// Author: Lukian Poleschtschuk
// Date Modified: 2025-09-16
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Win32;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;
using System.Reflection;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
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

        public async Task<bool> ExportToExcelAsync<T>(IEnumerable<T> data, string defaultFileName = null)
        {
            return await ExportToExcelAsync(data, defaultFileName, "Data", false);
        }

        public async Task<bool> ExportToExcelAsync<T>(IEnumerable<T> data, string defaultFileName, string worksheetName, bool includeCharts = false)
        {
            try
            {
                if (data == null || !data.Any())
                {
                    DialogService.Instance.ShowWarningDialog("Export Warning", "No data to export.");
                    return false;
                }

                // Set EPPlus license context
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                var saveFileDialog = new SaveFileDialog
                {
                    Title = "Export to Excel",
                    Filter = "Excel files (*.xlsx)|*.xlsx|All files (*.*)|*.*",
                    FilterIndex = 1,
                    FileName = defaultFileName ?? $"Export_{DateTime.Now:yyyy-MM-dd_HH-mm-ss}.xlsx"
                };

                if (saveFileDialog.ShowDialog() == true)
                {
                    await CreateExcelFileAsync(data, saveFileDialog.FileName, worksheetName, includeCharts);
                    
                    DialogService.Instance.ShowInformationDialog("Export Complete", 
                        $"Data exported successfully to:\n{saveFileDialog.FileName}");
                    return true;
                }
            }
            catch (Exception ex)
            {
                var errorMessage = ErrorHandlingService.Instance.HandleException(ex, "Data export to Excel");
                DialogService.Instance.ShowErrorDialog("Export Error", errorMessage);
            }

            return false;
        }

        private async Task CreateExcelFileAsync<T>(IEnumerable<T> data, string filePath, string worksheetName, bool includeCharts)
        {
            await Task.Run(() =>
            {
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add(worksheetName);
                
                var properties = typeof(T).GetProperties();
                var dataList = data.ToList();
                
                // Add headers
                for (int col = 1; col <= properties.Length; col++)
                {
                    worksheet.Cells[1, col].Value = GetDisplayName(properties[col - 1]);
                    worksheet.Cells[1, col].Style.Font.Bold = true;
                    worksheet.Cells[1, col].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    worksheet.Cells[1, col].Style.Fill.BackgroundColor.SetColor(Color.LightBlue);
                    worksheet.Cells[1, col].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                }
                
                // Add data
                for (int row = 0; row < dataList.Count; row++)
                {
                    var item = dataList[row];
                    for (int col = 0; col < properties.Length; col++)
                    {
                        var cellValue = properties[col].GetValue(item);
                        var cell = worksheet.Cells[row + 2, col + 1];
                        
                        // Format different data types appropriately
                        if (cellValue is DateTime dateTime)
                        {
                            cell.Value = dateTime;
                            cell.Style.Numberformat.Format = "yyyy-mm-dd hh:mm:ss";
                        }
                        else if (cellValue is decimal || cellValue is double || cellValue is float)
                        {
                            cell.Value = cellValue;
                            cell.Style.Numberformat.Format = "#,##0.00";
                        }
                        else if (cellValue is int || cellValue is long)
                        {
                            cell.Value = cellValue;
                            cell.Style.Numberformat.Format = "#,##0";
                        }
                        else if (cellValue is bool boolValue)
                        {
                            cell.Value = boolValue ? "Yes" : "No";
                        }
                        else
                        {
                            cell.Value = cellValue?.ToString() ?? "";
                        }
                        
                        cell.Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    }
                }
                
                // Auto-fit columns
                worksheet.Cells.AutoFitColumns();
                
                // Add freeze panes for header
                worksheet.View.FreezePanes(2, 1);
                
                // Add filters
                var dataRange = worksheet.Cells[1, 1, dataList.Count + 1, properties.Length];
                dataRange.AutoFilter = true;
                
                // Create charts if requested
                if (includeCharts)
                {
                    CreateChartsForData(worksheet, dataList, properties);
                }
                
                // Add summary information
                AddSummaryWorksheet(package, dataList, worksheetName);
                
                package.SaveAs(new FileInfo(filePath));
            });
        }

        private void CreateChartsForData<T>(ExcelWorksheet worksheet, List<T> dataList, PropertyInfo[] properties)
        {
            try
            {
                // Find numeric columns for charting
                var numericProperties = properties.Where(p => 
                    p.PropertyType == typeof(int) || p.PropertyType == typeof(long) ||
                    p.PropertyType == typeof(decimal) || p.PropertyType == typeof(double) ||
                    p.PropertyType == typeof(float) || p.PropertyType == typeof(int?) ||
                    p.PropertyType == typeof(long?) || p.PropertyType == typeof(decimal?) ||
                    p.PropertyType == typeof(double?) || p.PropertyType == typeof(float?))
                    .Take(5) // Limit to 5 numeric columns for performance
                    .ToArray();

                if (numericProperties.Length > 0)
                {
                    // Create a summary chart
                    var chart = worksheet.Drawings.AddChart("SummaryChart", OfficeOpenXml.Drawing.Chart.eChartType.ColumnClustered);
                    chart.Title.Text = "Data Summary";
                    chart.SetPosition(dataList.Count + 5, 0, 1, 0);
                    chart.SetSize(600, 400);
                    
                    foreach (var prop in numericProperties)
                    {
                        var colIndex = Array.IndexOf(properties, prop) + 1;
                        var series = chart.Series.Add(worksheet.Cells[2, colIndex, dataList.Count + 1, colIndex],
                                                     worksheet.Cells[1, colIndex]);
                        series.Header = GetDisplayName(prop);
                    }
                }
            }
            catch (Exception ex)
            {
                // Chart creation failed, but don't fail the entire export
                System.Diagnostics.Debug.WriteLine($"Chart creation failed: {ex.Message}");
            }
        }

        private void AddSummaryWorksheet<T>(ExcelPackage package, List<T> dataList, string originalWorksheetName)
        {
            var summarySheet = package.Workbook.Worksheets.Add("Summary");
            
            // Add export summary
            summarySheet.Cells["A1"].Value = "Export Summary";
            summarySheet.Cells["A1"].Style.Font.Bold = true;
            summarySheet.Cells["A1"].Style.Font.Size = 16;
            
            summarySheet.Cells["A3"].Value = "Export Date:";
            summarySheet.Cells["B3"].Value = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            
            summarySheet.Cells["A4"].Value = "Data Sheet:";
            summarySheet.Cells["B4"].Value = originalWorksheetName;
            
            summarySheet.Cells["A5"].Value = "Total Records:";
            summarySheet.Cells["B5"].Value = dataList.Count;
            
            summarySheet.Cells["A6"].Value = "Data Type:";
            summarySheet.Cells["B6"].Value = typeof(T).Name;
            
            // Style the summary
            summarySheet.Cells["A1:B6"].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            summarySheet.Cells["A3:A6"].Style.Font.Bold = true;
            
            summarySheet.Cells.AutoFitColumns();
        }

        private string GetDisplayName(PropertyInfo property)
        {
            // Convert PascalCase to Display Name
            var name = property.Name;
            return System.Text.RegularExpressions.Regex.Replace(name, "([a-z])([A-Z])", "$1 $2");
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

        public void CancelExport()
        {
            // Implementation for cancelling export operations
            // This could involve cancelling async operations, cleaning up temp files, etc.
        }

        public async Task<bool> ExportDataAsync(ExportRequest request)
        {
            try
            {
                switch (request.Format?.ToLower())
                {
                    case "csv":
                        return await ExportToCsvAsync((IEnumerable<object>)request.Data, request.FileName);
                    case "json":
                        return await ExportToJsonAsync((IEnumerable<object>)request.Data, request.FileName);
                    case "excel":
                    case "xlsx":
                        return await ExportToExcelAsync((IEnumerable<object>)request.Data, request.FileName, request.WorksheetName ?? "Data", request.IncludeCharts);
                    default:
                        throw new ArgumentException($"Unsupported export format: {request.Format}");
                }
            }
            catch (Exception ex)
            {
                var errorMessage = ErrorHandlingService.Instance.HandleException(ex, "Data export");
                DialogService.Instance.ShowErrorDialog("Export Error", errorMessage);
                return false;
            }
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

        public async Task<string> ExportAssetDetailAsync(object assetDetail)
        {
            try
            {
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var fileName = $"AssetDetail_{timestamp}.json";
                var filePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), fileName);

                var json = JsonSerializer.Serialize(assetDetail, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                await File.WriteAllTextAsync(filePath, json, Encoding.UTF8);
                return filePath;
            }
            catch (Exception ex)
            {
                var errorMessage = ErrorHandlingService.Instance.HandleException(ex, "Asset detail export");
                DialogService.Instance.ShowErrorDialog("Export Error", errorMessage);
                return string.Empty;
            }
        }

        public async Task<string> ExportDiscoveryDataAsync(object data)
        {
            try
            {
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var fileName = $"DiscoveryData_{timestamp}.csv";
                var filePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), fileName);

                if (data is IEnumerable<object> enumerableData)
                {
                    var csv = ConvertToCsv(enumerableData);
                    await File.WriteAllTextAsync(filePath, csv, Encoding.UTF8);
                }
                else if (data is string stringData)
                {
                    await File.WriteAllTextAsync(filePath, stringData, Encoding.UTF8);
                }
                else
                {
                    var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
                    fileName = $"DiscoveryData_{timestamp}.json";
                    filePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), fileName);
                    await File.WriteAllTextAsync(filePath, json, Encoding.UTF8);
                }

                return filePath;
            }
            catch (Exception ex)
            {
                var errorMessage = ErrorHandlingService.Instance.HandleException(ex, "Discovery data export");
                DialogService.Instance.ShowErrorDialog("Export Error", errorMessage);
                return string.Empty;
            }
        }

        public async Task<string> ExportReportsAsync(object reports)
        {
            try
            {
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var fileName = $"Reports_{timestamp}.json";
                var filePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), fileName);

                var json = JsonSerializer.Serialize(reports, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                await File.WriteAllTextAsync(filePath, json, Encoding.UTF8);
                return filePath;
            }
            catch (Exception ex)
            {
                var errorMessage = ErrorHandlingService.Instance.HandleException(ex, "Reports export");
                DialogService.Instance.ShowErrorDialog("Export Error", errorMessage);
                return string.Empty;
            }
        }
    }

    /// <summary>
    /// Export request model
    /// </summary>
    public class ExportRequest
    {
        public object Data { get; set; }
        public string Format { get; set; }
        public string FileName { get; set; }
        public string WorksheetName { get; set; } = "Data";
        public bool IncludeCharts { get; set; } = false;
    }
}
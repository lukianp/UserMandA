using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Threading.Tasks;
using System.IO;

namespace MandADiscoverySuite
{
    // Base interfaces for testing
    public interface INotifyPropertyChanged
    {
        event PropertyChangedEventHandler PropertyChanged;
    }

    public interface IBaseViewModel : INotifyPropertyChanged
    {
        void InitializeCommands();
        Task LoadDataAsync();
        bool IsLoading { get; set; }
        string ErrorMessage { get; set; }
    }

    public interface IDataExportService
    {
        Task<bool> ExportDataAsync(string filePath, object data);
        Task<string> GetExportFormatAsync();
    }

    public interface ILogicEngineService
    {
        Task<List<string>> GetDiscoveryItemsAsync();
        Task<bool> ProcessDiscoveryDataAsync(object data);
    }

    public interface IValidationService
    {
        Task<bool> ValidateDataAsync(object data);
        List<string> ValidationErrors { get; }
    }

    // Mock implementations for testing
    public class MockBaseViewModel : IBaseViewModel
    {
        public event PropertyChangedEventHandler PropertyChanged;

        private bool _isLoading;
        public bool IsLoading
        {
            get => _isLoading;
            set
            {
                _isLoading = value;
                OnPropertyChanged(nameof(IsLoading));
            }
        }

        private string _errorMessage;
        public string ErrorMessage
        {
            get => _errorMessage;
            set
            {
                _errorMessage = value;
                OnPropertyChanged(nameof(ErrorMessage));
            }
        }

        public void InitializeCommands() { }
        public async Task LoadDataAsync() => await Task.CompletedTask;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class MockDataExportService : IDataExportService
    {
        public async Task<bool> ExportDataAsync(string filePath, object data)
        {
            await Task.Delay(100); // Simulate async operation
            return true;
        }

        public async Task<string> GetExportFormatAsync()
        {
            await Task.Delay(50);
            return "CSV";
        }

        // Add methods that tests expect
        public async Task<bool> ExportToCsvAsync(object data, string fileName, string outputDirectory = null)
        {
            var filePath = Path.Combine(outputDirectory ?? Path.GetTempPath(), $"{fileName}.csv");
            Directory.CreateDirectory(outputDirectory ?? Path.GetTempPath());

            // Create CSV content
            var lines = new List<string>();
            if (data is System.Collections.IEnumerable items)
            {
                lines.Add("Id,Name,Value"); // CSV Header
                foreach (var item in items)
                {
                    if (item is TestDataObject testObj)
                    {
                        lines.Add($"{testObj.Id},\"{testObj.Name}\",{testObj.Value}");
                    }
                }
            }

            await File.WriteAllLinesAsync(filePath, lines);
            return true;
        }

        public async Task<bool> ExportToExcelAsync(object data, string fileName, string outputDirectory = null)
        {
            var filePath = Path.Combine(outputDirectory ?? Path.GetTempPath(), $"{fileName}.xlsx");
            Directory.CreateDirectory(outputDirectory ?? Path.GetTempPath());

            // Create a simple Excel file (just create the file for testing)
            await File.WriteAllTextAsync(filePath, "Mock Excel Content");
            return true;
        }

        public async Task<bool> ExportToJsonAsync(object data, string fileName, string outputDirectory = null)
        {
            var filePath = Path.Combine(outputDirectory ?? Path.GetTempPath(), $"{fileName}.json");
            Directory.CreateDirectory(outputDirectory ?? Path.GetTempPath());

            // Create JSON content
            var jsonContent = System.Text.Json.JsonSerializer.Serialize(data, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(filePath, jsonContent);
            return true;
        }
    }

    public class MockLogicEngineService : ILogicEngineService
    {
        public async Task<List<string>> GetDiscoveryItemsAsync()
        {
            await Task.Delay(100);
            return new List<string> { "TestItem1", "TestItem2" };
        }

        public async Task<bool> ProcessDiscoveryDataAsync(object data)
        {
            await Task.Delay(50);
            return true;
        }
    }

    public class MockValidationService : IValidationService
    {
        public List<string> ValidationErrors { get; } = new List<string>();

        public async Task<bool> ValidateDataAsync(object data)
        {
            await Task.Delay(50);
            ValidationErrors.Clear();
            return true;
        }
    }

    // Test models
    public class ValidationIssue
    {
        public string Message { get; set; }
        public string Severity { get; set; }
        public string Source { get; set; }
    }

    public class TestData
    {
        public string Name { get; set; }
        public int Value { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class TestDataObject
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int Value { get; set; }
    }

    public class ComplexTestObject
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<string> Tags { get; set; }
    }
}
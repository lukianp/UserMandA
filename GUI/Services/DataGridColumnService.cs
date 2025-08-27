using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Text.Json;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing DataGrid column configurations
    /// </summary>
    public class DataGridColumnService : IDataGridColumnService
    {
        private readonly string _configurationDirectory;
        private readonly Dictionary<string, DataGridColumnConfiguration> _configurationCache;

        public event EventHandler<ColumnConfigurationChangedEventArgs> ConfigurationChanged;

        public DataGridColumnService()
        {
            _configurationDirectory = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "MandADiscoverySuite",
                "ColumnConfigurations"
            );

            _configurationCache = new Dictionary<string, DataGridColumnConfiguration>();
            EnsureDirectoryExists();
        }

        /// <summary>
        /// Get column configuration for a specific view
        /// </summary>
        public async Task<DataGridColumnConfiguration> GetColumnConfigurationAsync(string viewName, string configurationName = "Default")
        {
            if (string.IsNullOrWhiteSpace(viewName))
                throw new ArgumentException("View name cannot be empty", nameof(viewName));

            var cacheKey = $"{viewName}_{configurationName}";
            
            if (_configurationCache.TryGetValue(cacheKey, out var cachedConfig))
                return cachedConfig;

            var filePath = GetConfigurationFilePath(viewName, configurationName);
            
            if (!File.Exists(filePath))
            {
                // Return default configuration if file doesn't exist
                var defaultConfig = await ResetToDefaultAsync(viewName);
                defaultConfig.ConfigurationName = configurationName;
                return defaultConfig;
            }

            try
            {
                var json = await File.ReadAllTextAsync(filePath);
                var configuration = JsonSerializer.Deserialize<DataGridColumnConfiguration>(json);
                
                _configurationCache[cacheKey] = configuration;
                return configuration;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading configuration: {ex.Message}");
                return await ResetToDefaultAsync(viewName);
            }
        }

        /// <summary>
        /// Save column configuration
        /// </summary>
        public async Task SaveColumnConfigurationAsync(DataGridColumnConfiguration configuration)
        {
            if (configuration == null)
                throw new ArgumentNullException(nameof(configuration));

            configuration.ModifiedDate = DateTime.Now;
            
            var filePath = GetConfigurationFilePath(configuration.ViewName, configuration.ConfigurationName);
            var json = JsonSerializer.Serialize(configuration, new JsonSerializerOptions { WriteIndented = true });
            
            await File.WriteAllTextAsync(filePath, json);
            
            var cacheKey = $"{configuration.ViewName}_{configuration.ConfigurationName}";
            _configurationCache[cacheKey] = configuration;

            ConfigurationChanged?.Invoke(this, new ColumnConfigurationChangedEventArgs
            {
                ViewName = configuration.ViewName,
                ConfigurationName = configuration.ConfigurationName,
                Configuration = configuration
            });
        }

        /// <summary>
        /// Get all saved configurations for a view
        /// </summary>
        public async Task<IEnumerable<DataGridColumnConfiguration>> GetSavedConfigurationsAsync(string viewName)
        {
            var viewDirectory = Path.Combine(_configurationDirectory, viewName);
            
            if (!Directory.Exists(viewDirectory))
                return new[] { await ResetToDefaultAsync(viewName) };

            var configurations = new List<DataGridColumnConfiguration>();
            var files = Directory.GetFiles(viewDirectory, "*.json");

            foreach (var file in files)
            {
                try
                {
                    var json = await File.ReadAllTextAsync(file);
                    var configuration = JsonSerializer.Deserialize<DataGridColumnConfiguration>(json);
                    configurations.Add(configuration);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error loading configuration from {file}: {ex.Message}");
                }
            }

            if (!configurations.Any())
                configurations.Add(await ResetToDefaultAsync(viewName));

            return configurations.OrderBy(c => c.IsDefault ? 0 : 1).ThenBy(c => c.ConfigurationName);
        }

        /// <summary>
        /// Delete a configuration
        /// </summary>
        public async Task DeleteConfigurationAsync(string viewName, string configurationName)
        {
            if (configurationName == "Default")
                throw new InvalidOperationException("Cannot delete the default configuration");

            var filePath = GetConfigurationFilePath(viewName, configurationName);
            
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                
                var cacheKey = $"{viewName}_{configurationName}";
                _configurationCache.Remove(cacheKey);
            }

            await Task.CompletedTask;
        }

        /// <summary>
        /// Reset to default configuration
        /// </summary>
        public async Task<DataGridColumnConfiguration> ResetToDefaultAsync(string viewName)
        {
            var configuration = new DataGridColumnConfiguration
            {
                ViewName = viewName,
                ConfigurationName = "Default",
                IsDefault = true,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now
            };

            // Create default columns based on view name
            switch (viewName.ToLower())
            {
                case "users":
                case "userview":
                    configuration.Columns = CreateDefaultUserColumns();
                    break;
                    
                case "groups":
                case "groupview":
                    configuration.Columns = CreateDefaultGroupColumns();
                    break;
                    
                case "computers":
                case "computerview":
                    configuration.Columns = CreateDefaultComputerColumns();
                    break;
                    
                case "applications":
                case "applicationview":
                    configuration.Columns = CreateDefaultApplicationColumns();
                    break;
                    
                default:
                    configuration.Columns = CreateGenericColumns();
                    break;
            }

            await SaveColumnConfigurationAsync(configuration);
            return configuration;
        }

        /// <summary>
        /// Export configuration to file
        /// </summary>
        public async Task ExportConfigurationAsync(DataGridColumnConfiguration configuration, string filePath)
        {
            var json = JsonSerializer.Serialize(configuration, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(filePath, json);
        }

        /// <summary>
        /// Import configuration from file
        /// </summary>
        public async Task<DataGridColumnConfiguration> ImportConfigurationAsync(string filePath)
        {
            var json = await File.ReadAllTextAsync(filePath);
            return JsonSerializer.Deserialize<DataGridColumnConfiguration>(json);
        }

        /// <summary>
        /// Create default column configuration for a data type
        /// </summary>
        public DataGridColumnConfiguration CreateDefaultConfiguration<T>(string viewName)
        {
            var configuration = new DataGridColumnConfiguration
            {
                ViewName = viewName,
                ConfigurationName = "Default",
                IsDefault = true,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now
            };

            var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.CanRead && IsDisplayableProperty(p));

            var displayOrder = 0;
            foreach (var property in properties)
            {
                var column = new ColumnViewModel
                {
                    Header = GetDisplayName(property),
                    PropertyName = property.Name,
                    IsVisible = !IsHiddenByDefault(property),
                    DisplayOrder = displayOrder++,
                    ColumnType = GetColumnType(property.PropertyType),
                    IsSortable = IsSortableProperty(property)
                };

                configuration.Columns.Add(column);
            }

            return configuration;
        }

        /// <summary>
        /// Apply configuration to DataGrid
        /// </summary>
        public void ApplyConfiguration(DataGrid dataGrid, DataGridColumnConfiguration configuration)
        {
            if (dataGrid == null || configuration == null) return;

            dataGrid.Columns.Clear();

            foreach (var columnViewModel in configuration.VisibleColumns)
            {
                var column = CreateDataGridColumn(columnViewModel);
                if (column != null)
                {
                    dataGrid.Columns.Add(column);
                }
            }
        }

        #region Private Methods

        private void EnsureDirectoryExists()
        {
            if (!Directory.Exists(_configurationDirectory))
            {
                Directory.CreateDirectory(_configurationDirectory);
            }
        }

        private string GetConfigurationFilePath(string viewName, string configurationName)
        {
            var viewDirectory = Path.Combine(_configurationDirectory, viewName);
            
            if (!Directory.Exists(viewDirectory))
                Directory.CreateDirectory(viewDirectory);
            
            var fileName = $"{configurationName}.json";
            return Path.Combine(viewDirectory, fileName);
        }

        private List<ColumnViewModel> CreateDefaultUserColumns()
        {
            return new List<ColumnViewModel>
            {
                new ColumnViewModel { Header = "Display Name", PropertyName = "DisplayName", DisplayOrder = 0, IsVisible = true },
                new ColumnViewModel { Header = "Email", PropertyName = "Email", DisplayOrder = 1, IsVisible = true },
                new ColumnViewModel { Header = "Department", PropertyName = "Department", DisplayOrder = 2, IsVisible = true },
                new ColumnViewModel { Header = "Job Title", PropertyName = "JobTitle", DisplayOrder = 3, IsVisible = true },
                new ColumnViewModel { Header = "Manager", PropertyName = "Manager", DisplayOrder = 4, IsVisible = false },
                new ColumnViewModel { Header = "Enabled", PropertyName = "IsEnabled", DisplayOrder = 5, IsVisible = true, ColumnType = ColumnType.Boolean },
                new ColumnViewModel { Header = "Last Logon", PropertyName = "LastLogon", DisplayOrder = 6, IsVisible = true, ColumnType = ColumnType.Date },
                new ColumnViewModel { Header = "User Principal Name", PropertyName = "UserPrincipalName", DisplayOrder = 7, IsVisible = false },
                new ColumnViewModel { Header = "City", PropertyName = "City", DisplayOrder = 8, IsVisible = false },
                new ColumnViewModel { Header = "Country", PropertyName = "Country", DisplayOrder = 9, IsVisible = false }
            };
        }

        private List<ColumnViewModel> CreateDefaultGroupColumns()
        {
            return new List<ColumnViewModel>
            {
                new ColumnViewModel { Header = "Group Name", PropertyName = "Name", DisplayOrder = 0, IsVisible = true },
                new ColumnViewModel { Header = "Description", PropertyName = "Description", DisplayOrder = 1, IsVisible = true },
                new ColumnViewModel { Header = "Type", PropertyName = "GroupType", DisplayOrder = 2, IsVisible = true },
                new ColumnViewModel { Header = "Member Count", PropertyName = "MemberCount", DisplayOrder = 3, IsVisible = true, ColumnType = ColumnType.Number },
                new ColumnViewModel { Header = "Created", PropertyName = "CreatedDate", DisplayOrder = 4, IsVisible = false, ColumnType = ColumnType.Date },
                new ColumnViewModel { Header = "Modified", PropertyName = "ModifiedDate", DisplayOrder = 5, IsVisible = false, ColumnType = ColumnType.Date }
            };
        }

        private List<ColumnViewModel> CreateDefaultComputerColumns()
        {
            return new List<ColumnViewModel>
            {
                new ColumnViewModel { Header = "Computer Name", PropertyName = "Name", DisplayOrder = 0, IsVisible = true },
                new ColumnViewModel { Header = "Operating System", PropertyName = "OperatingSystem", DisplayOrder = 1, IsVisible = true },
                new ColumnViewModel { Header = "Last Logon", PropertyName = "LastLogon", DisplayOrder = 2, IsVisible = true, ColumnType = ColumnType.Date },
                new ColumnViewModel { Header = "Enabled", PropertyName = "IsEnabled", DisplayOrder = 3, IsVisible = true, ColumnType = ColumnType.Boolean },
                new ColumnViewModel { Header = "Description", PropertyName = "Description", DisplayOrder = 4, IsVisible = false },
                new ColumnViewModel { Header = "DNS Name", PropertyName = "DnsHostName", DisplayOrder = 5, IsVisible = false },
                new ColumnViewModel { Header = "Service Pack", PropertyName = "ServicePack", DisplayOrder = 6, IsVisible = false }
            };
        }

        private List<ColumnViewModel> CreateDefaultApplicationColumns()
        {
            return new List<ColumnViewModel>
            {
                new ColumnViewModel { Header = "Application Name", PropertyName = "Name", DisplayOrder = 0, IsVisible = true },
                new ColumnViewModel { Header = "Version", PropertyName = "Version", DisplayOrder = 1, IsVisible = true },
                new ColumnViewModel { Header = "Publisher", PropertyName = "Publisher", DisplayOrder = 2, IsVisible = true },
                new ColumnViewModel { Header = "Install Date", PropertyName = "InstallDate", DisplayOrder = 3, IsVisible = true, ColumnType = ColumnType.Date },
                new ColumnViewModel { Header = "Size", PropertyName = "Size", DisplayOrder = 4, IsVisible = false, ColumnType = ColumnType.Number }
            };
        }

        private List<ColumnViewModel> CreateGenericColumns()
        {
            return new List<ColumnViewModel>
            {
                new ColumnViewModel { Header = "Name", PropertyName = "Name", DisplayOrder = 0, IsVisible = true },
                new ColumnViewModel { Header = "Description", PropertyName = "Description", DisplayOrder = 1, IsVisible = true },
                new ColumnViewModel { Header = "Type", PropertyName = "Type", DisplayOrder = 2, IsVisible = true },
                new ColumnViewModel { Header = "Status", PropertyName = "Status", DisplayOrder = 3, IsVisible = true }
            };
        }

        private bool IsDisplayableProperty(PropertyInfo property)
        {
            var hiddenAttributes = new[] { typeof(BrowsableAttribute) };
            
            foreach (var attr in hiddenAttributes)
            {
                var attribute = property.GetCustomAttribute(attr);
                if (attribute is BrowsableAttribute browsable && !browsable.Browsable)
                    return false;
            }

            return property.PropertyType.IsValueType || 
                   property.PropertyType == typeof(string) ||
                   property.PropertyType == typeof(DateTime) ||
                   property.PropertyType == typeof(DateTime?);
        }

        private bool IsHiddenByDefault(PropertyInfo property)
        {
            var hiddenProperties = new[] { "Id", "CreatedBy", "ModifiedBy", "Version", "RowVersion" };
            return hiddenProperties.Contains(property.Name, StringComparer.OrdinalIgnoreCase);
        }

        private string GetDisplayName(PropertyInfo property)
        {
            var displayAttribute = property.GetCustomAttribute<DisplayNameAttribute>();
            if (displayAttribute != null)
                return displayAttribute.DisplayName;

            // Convert PascalCase to readable format
            var name = property.Name;
            var result = string.Empty;
            
            for (int i = 0; i < name.Length; i++)
            {
                if (i > 0 && char.IsUpper(name[i]))
                    result += " ";
                result += name[i];
            }
            
            return result;
        }

        private ColumnType GetColumnType(Type propertyType)
        {
            if (propertyType == typeof(bool) || propertyType == typeof(bool?))
                return ColumnType.Boolean;
            
            if (propertyType == typeof(DateTime) || propertyType == typeof(DateTime?))
                return ColumnType.Date;
            
            if (IsNumericType(propertyType))
                return ColumnType.Number;
            
            return ColumnType.Text;
        }

        private bool IsNumericType(Type type)
        {
            var numericTypes = new[]
            {
                typeof(int), typeof(int?),
                typeof(long), typeof(long?),
                typeof(short), typeof(short?),
                typeof(byte), typeof(byte?),
                typeof(uint), typeof(uint?),
                typeof(ulong), typeof(ulong?),
                typeof(ushort), typeof(ushort?),
                typeof(double), typeof(double?),
                typeof(float), typeof(float?),
                typeof(decimal), typeof(decimal?)
            };
            
            return numericTypes.Contains(type);
        }

        private bool IsSortableProperty(PropertyInfo property)
        {
            return property.PropertyType.IsValueType || 
                   property.PropertyType == typeof(string) ||
                   property.PropertyType == typeof(DateTime) ||
                   property.PropertyType == typeof(DateTime?);
        }

        private DataGridColumn CreateDataGridColumn(ColumnViewModel columnViewModel)
        {
            DataGridColumn column = null;

            switch (columnViewModel.ColumnType)
            {
                case ColumnType.Boolean:
                    column = new DataGridCheckBoxColumn
                    {
                        Binding = new Binding(columnViewModel.PropertyName)
                    };
                    break;

                case ColumnType.Date:
                    column = new DataGridTextColumn
                    {
                        Binding = new Binding(columnViewModel.PropertyName)
                        {
                            StringFormat = columnViewModel.Format ?? "yyyy-MM-dd HH:mm:ss"
                        }
                    };
                    break;

                case ColumnType.Number:
                    column = new DataGridTextColumn
                    {
                        Binding = new Binding(columnViewModel.PropertyName)
                        {
                            StringFormat = columnViewModel.Format ?? "N0"
                        }
                    };
                    break;

                default:
                    column = new DataGridTextColumn
                    {
                        Binding = new Binding(columnViewModel.PropertyName)
                    };
                    break;
            }

            if (column != null)
            {
                column.Header = columnViewModel.Header;
                column.Visibility = columnViewModel.Visibility;
                column.CanUserSort = columnViewModel.IsSortable;
                column.CanUserResize = columnViewModel.IsResizable;

                if (!double.IsNaN(columnViewModel.Width))
                    column.Width = columnViewModel.Width;
                
                column.MinWidth = columnViewModel.MinWidth;
                column.MaxWidth = columnViewModel.MaxWidth;
            }

            return column;
        }

        #endregion
    }
}
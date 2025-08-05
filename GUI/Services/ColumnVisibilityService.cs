using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;

namespace MandADiscoverySuite.Services
{
    public class ColumnDefinition : INotifyPropertyChanged
    {
        private bool _isVisible = true;
        private string _displayName;
        private string _columnName;

        public string ColumnName
        {
            get => _columnName;
            set
            {
                _columnName = value;
                OnPropertyChanged(nameof(ColumnName));
            }
        }

        public string DisplayName
        {
            get => _displayName;
            set
            {
                _displayName = value;
                OnPropertyChanged(nameof(DisplayName));
            }
        }

        public bool IsVisible
        {
            get => _isVisible;
            set
            {
                _isVisible = value;
                OnPropertyChanged(nameof(IsVisible));
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class ColumnVisibilityService : INotifyPropertyChanged
    {
        private static ColumnVisibilityService _instance;
        private readonly Dictionary<string, List<ColumnDefinition>> _columnDefinitions;
        private readonly string _settingsPath;

        public static ColumnVisibilityService Instance => _instance ??= new ColumnVisibilityService();

        private ColumnVisibilityService()
        {
            _columnDefinitions = new Dictionary<string, List<ColumnDefinition>>();
            _settingsPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MandADiscoverySuite", "ColumnVisibility.json");
            InitializeDefaultColumns();
            LoadSettings();
        }

        public List<ColumnDefinition> GetColumnsForGrid(string gridName)
        {
            return _columnDefinitions.TryGetValue(gridName, out var columns) ? columns : new List<ColumnDefinition>();
        }

        public void UpdateColumnVisibility(string gridName, string columnName, bool isVisible)
        {
            if (_columnDefinitions.TryGetValue(gridName, out var columns))
            {
                var column = columns.FirstOrDefault(c => c.ColumnName == columnName);
                if (column != null)
                {
                    column.IsVisible = isVisible;
                    SaveSettings();
                    OnPropertyChanged($"{gridName}ColumnsChanged");
                }
            }
        }

        public void ApplyColumnVisibility(DataGrid dataGrid, string gridName)
        {
            if (!_columnDefinitions.TryGetValue(gridName, out var columnDefinitions))
                return;

            foreach (var column in dataGrid.Columns)
            {
                var columnDef = columnDefinitions.FirstOrDefault(c => c.ColumnName == GetColumnBinding(column));
                if (columnDef != null)
                {
                    column.Visibility = columnDef.IsVisible ? Visibility.Visible : Visibility.Collapsed;
                }
            }
        }

        public void ShowAllColumns(string gridName)
        {
            if (_columnDefinitions.TryGetValue(gridName, out var columns))
            {
                foreach (var column in columns)
                {
                    column.IsVisible = true;
                }
                SaveSettings();
                OnPropertyChanged($"{gridName}ColumnsChanged");
            }
        }

        public void HideAllColumns(string gridName)
        {
            if (_columnDefinitions.TryGetValue(gridName, out var columns))
            {
                foreach (var column in columns.Skip(1)) // Keep first column visible
                {
                    column.IsVisible = false;
                }
                SaveSettings();
                OnPropertyChanged($"{gridName}ColumnsChanged");
            }
        }

        public void ResetToDefaults(string gridName)
        {
            if (_columnDefinitions.TryGetValue(gridName, out var columns))
            {
                foreach (var column in columns)
                {
                    column.IsVisible = true;
                }
                SaveSettings();
                OnPropertyChanged($"{gridName}ColumnsChanged");
            }
        }

        private void InitializeDefaultColumns()
        {
            // Users grid columns
            _columnDefinitions["Users"] = new List<ColumnDefinition>
            {
                new ColumnDefinition { ColumnName = "IsSelected", DisplayName = "Select" },
                new ColumnDefinition { ColumnName = "Name", DisplayName = "Display Name" },
                new ColumnDefinition { ColumnName = "Email", DisplayName = "Email" },
                new ColumnDefinition { ColumnName = "Department", DisplayName = "Department" },
                new ColumnDefinition { ColumnName = "Status", DisplayName = "Status" },
                new ColumnDefinition { ColumnName = "UserPrincipalName", DisplayName = "UPN" },
                new ColumnDefinition { ColumnName = "LastSignInDateTime", DisplayName = "Last Sign-In" },
                new ColumnDefinition { ColumnName = "GroupMembershipCount", DisplayName = "Groups" },
                new ColumnDefinition { ColumnName = "ManagerDisplayName", DisplayName = "Manager" },
                new ColumnDefinition { ColumnName = "JobTitle", DisplayName = "Job Title" },
                new ColumnDefinition { ColumnName = "City", DisplayName = "City" },
                new ColumnDefinition { ColumnName = "Actions", DisplayName = "Actions" }
            };

            // Infrastructure grid columns
            _columnDefinitions["Infrastructure"] = new List<ColumnDefinition>
            {
                new ColumnDefinition { ColumnName = "IsSelected", DisplayName = "Select" },
                new ColumnDefinition { ColumnName = "Name", DisplayName = "Name" },
                new ColumnDefinition { ColumnName = "Type", DisplayName = "Type" },
                new ColumnDefinition { ColumnName = "Status", DisplayName = "Status" },
                new ColumnDefinition { ColumnName = "Location", DisplayName = "Location" },
                new ColumnDefinition { ColumnName = "IPAddress", DisplayName = "IP Address" },
                new ColumnDefinition { ColumnName = "OperatingSystem", DisplayName = "OS" },
                new ColumnDefinition { ColumnName = "Version", DisplayName = "Version" },
                new ColumnDefinition { ColumnName = "LastSeen", DisplayName = "Last Seen" },
                new ColumnDefinition { ColumnName = "Description", DisplayName = "Description" }
            };

            // Groups grid columns
            _columnDefinitions["Groups"] = new List<ColumnDefinition>
            {
                new ColumnDefinition { ColumnName = "IsSelected", DisplayName = "Select" },
                new ColumnDefinition { ColumnName = "DisplayName", DisplayName = "Name" },
                new ColumnDefinition { ColumnName = "Description", DisplayName = "Description" },
                new ColumnDefinition { ColumnName = "Type", DisplayName = "Type" },
                new ColumnDefinition { ColumnName = "Mail", DisplayName = "Email" },
                new ColumnDefinition { ColumnName = "MemberCount", DisplayName = "Members" },
                new ColumnDefinition { ColumnName = "OwnerCount", DisplayName = "Owners" },
                new ColumnDefinition { ColumnName = "CreatedDateTime", DisplayName = "Created" },
                new ColumnDefinition { ColumnName = "Visibility", DisplayName = "Visibility" }
            };
        }

        private void LoadSettings()
        {
            try
            {
                if (!File.Exists(_settingsPath))
                    return;

                var json = File.ReadAllText(_settingsPath);
                var settings = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, bool>>>(json);

                if (settings != null)
                {
                    foreach (var gridSettings in settings)
                    {
                        if (_columnDefinitions.TryGetValue(gridSettings.Key, out var columns))
                        {
                            foreach (var columnSetting in gridSettings.Value)
                            {
                                var column = columns.FirstOrDefault(c => c.ColumnName == columnSetting.Key);
                                if (column != null)
                                {
                                    column.IsVisible = columnSetting.Value;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception)
            {
                // If settings can't be loaded, use defaults
            }
        }

        private void SaveSettings()
        {
            try
            {
                var settings = new Dictionary<string, Dictionary<string, bool>>();

                foreach (var gridDefinition in _columnDefinitions)
                {
                    settings[gridDefinition.Key] = gridDefinition.Value.ToDictionary(
                        c => c.ColumnName,
                        c => c.IsVisible
                    );
                }

                var directory = Path.GetDirectoryName(_settingsPath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                var json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_settingsPath, json);
            }
            catch (Exception)
            {
                // If settings can't be saved, continue silently
            }
        }

        private string GetColumnBinding(DataGridColumn column)
        {
            return column switch
            {
                DataGridCheckBoxColumn checkBoxColumn => (checkBoxColumn.Binding as System.Windows.Data.Binding)?.Path?.Path ?? column.Header?.ToString() ?? "",
                DataGridBoundColumn boundColumn => (boundColumn.Binding as System.Windows.Data.Binding)?.Path?.Path ?? column.Header?.ToString() ?? "",
                DataGridTemplateColumn => column.Header?.ToString() ?? "",
                _ => column.Header?.ToString() ?? ""
            };
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
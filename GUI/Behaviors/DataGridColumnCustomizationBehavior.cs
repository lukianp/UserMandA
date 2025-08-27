using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Input;
using System.Windows.Media;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Behaviors
{
    /// <summary>
    /// Attached behavior for DataGrid column customization
    /// </summary>
    public static class DataGridColumnCustomizationBehavior
    {
        #region Attached Properties

        public static readonly DependencyProperty IsEnabledProperty =
            DependencyProperty.RegisterAttached(
                "IsEnabled",
                typeof(bool),
                typeof(DataGridColumnCustomizationBehavior),
                new PropertyMetadata(false, OnIsEnabledChanged));

        public static readonly DependencyProperty ColumnConfigurationProperty =
            DependencyProperty.RegisterAttached(
                "ColumnConfiguration",
                typeof(DataGridColumnConfiguration),
                typeof(DataGridColumnCustomizationBehavior),
                new PropertyMetadata(null, OnColumnConfigurationChanged));

        public static readonly DependencyProperty ViewNameProperty =
            DependencyProperty.RegisterAttached(
                "ViewName",
                typeof(string),
                typeof(DataGridColumnCustomizationBehavior),
                new PropertyMetadata(null));

        public static readonly DependencyProperty ColumnServiceProperty =
            DependencyProperty.RegisterAttached(
                "ColumnService",
                typeof(IDataGridColumnService),
                typeof(DataGridColumnCustomizationBehavior),
                new PropertyMetadata(null));

        #endregion

        #region Attached Property Getters/Setters

        public static bool GetIsEnabled(DependencyObject obj)
        {
            return (bool)obj.GetValue(IsEnabledProperty);
        }

        public static void SetIsEnabled(DependencyObject obj, bool value)
        {
            obj.SetValue(IsEnabledProperty, value);
        }

        public static DataGridColumnConfiguration GetColumnConfiguration(DependencyObject obj)
        {
            return (DataGridColumnConfiguration)obj.GetValue(ColumnConfigurationProperty);
        }

        public static void SetColumnConfiguration(DependencyObject obj, DataGridColumnConfiguration value)
        {
            obj.SetValue(ColumnConfigurationProperty, value);
        }

        public static string GetViewName(DependencyObject obj)
        {
            return (string)obj.GetValue(ViewNameProperty);
        }

        public static void SetViewName(DependencyObject obj, string value)
        {
            obj.SetValue(ViewNameProperty, value);
        }

        public static IDataGridColumnService GetColumnService(DependencyObject obj)
        {
            return (IDataGridColumnService)obj.GetValue(ColumnServiceProperty);
        }

        public static void SetColumnService(DependencyObject obj, IDataGridColumnService value)
        {
            obj.SetValue(ColumnServiceProperty, value);
        }

        #endregion

        #region Event Handlers

        private static void OnIsEnabledChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is DataGrid dataGrid)
            {
                if ((bool)e.NewValue)
                {
                    AttachBehavior(dataGrid);
                }
                else
                {
                    DetachBehavior(dataGrid);
                }
            }
        }

        private static void OnColumnConfigurationChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is DataGrid dataGrid && e.NewValue is DataGridColumnConfiguration configuration)
            {
                ApplyConfiguration(dataGrid, configuration);
            }
        }

        #endregion

        #region Private Methods

        private static void AttachBehavior(DataGrid dataGrid)
        {
            dataGrid.Loaded += OnDataGridLoaded;
            dataGrid.MouseRightButtonUp += OnDataGridRightClick;
        }

        private static void DetachBehavior(DataGrid dataGrid)
        {
            dataGrid.Loaded -= OnDataGridLoaded;
            dataGrid.MouseRightButtonUp -= OnDataGridRightClick;
        }

        private static void OnDataGridLoaded(object sender, RoutedEventArgs e)
        {
            if (sender is DataGrid dataGrid)
            {
                SetupColumnHeaders(dataGrid);
                LoadConfiguration(dataGrid);
            }
        }

        private static void OnDataGridRightClick(object sender, MouseButtonEventArgs e)
        {
            if (sender is DataGrid dataGrid)
            {
                var hitTest = VisualTreeHelper.HitTest(dataGrid, e.GetPosition(dataGrid));
                if (hitTest?.VisualHit != null)
                {
                    var header = FindParent<DataGridColumnHeader>(hitTest.VisualHit);
                    if (header != null)
                    {
                        ShowColumnContextMenu(dataGrid, header, e);
                        e.Handled = true;
                    }
                }
            }
        }

        private static void SetupColumnHeaders(DataGrid dataGrid)
        {
            // Add context menu to each column header
            dataGrid.AutoGeneratingColumn += (s, e) =>
            {
                if (e.Column.Header is string headerText)
                {
                    var contextMenu = CreateColumnContextMenu(dataGrid, e.Column);
                    e.Column.HeaderStyle = CreateHeaderStyle(contextMenu);
                }
            };
        }

        private static async void LoadConfiguration(DataGrid dataGrid)
        {
            var viewName = GetViewName(dataGrid);
            var columnService = GetColumnService(dataGrid) ?? SimpleServiceLocator.Instance.GetService<IDataGridColumnService>();

            if (!string.IsNullOrEmpty(viewName) && columnService != null)
            {
                try
                {
                    var configuration = await columnService.GetColumnConfigurationAsync(viewName);
                    SetColumnConfiguration(dataGrid, configuration);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error loading column configuration: {ex.Message}");
                }
            }
        }

        private static void ApplyConfiguration(DataGrid dataGrid, DataGridColumnConfiguration configuration)
        {
            if (configuration?.Columns == null) return;

            foreach (var column in dataGrid.Columns)
            {
                var columnViewModel = configuration.Columns.FirstOrDefault(c => 
                    c.Header == column.Header?.ToString() || 
                    c.PropertyName == GetColumnPropertyName(column));

                if (columnViewModel != null)
                {
                    column.Visibility = columnViewModel.Visibility;
                    column.DisplayIndex = columnViewModel.DisplayOrder;
                    column.CanUserSort = columnViewModel.IsSortable;
                    column.CanUserResize = columnViewModel.IsResizable;

                    if (!double.IsNaN(columnViewModel.Width))
                        column.Width = columnViewModel.Width;
                }
            }

            // Reorder columns based on DisplayOrder
            var orderedColumns = configuration.VisibleColumns.ToList();
            for (int i = 0; i < orderedColumns.Count; i++)
            {
                var columnViewModel = orderedColumns[i];
                var column = dataGrid.Columns.FirstOrDefault(c => 
                    c.Header?.ToString() == columnViewModel.Header ||
                    GetColumnPropertyName(c) == columnViewModel.PropertyName);

                if (column != null && column.DisplayIndex != i)
                {
                    column.DisplayIndex = i;
                }
            }
        }

        private static ContextMenu CreateColumnContextMenu(DataGrid dataGrid, DataGridColumn column)
        {
            var contextMenu = new ContextMenu();

            // Add "Hide Column" option
            var hideItem = new MenuItem
            {
                Header = "Hide Column",
                Command = new RelayCommand(() => HideColumn(dataGrid, column))
            };
            contextMenu.Items.Add(hideItem);

            contextMenu.Items.Add(new Separator());

            // Add "Column Chooser" option
            var chooserItem = new MenuItem
            {
                Header = "Column Chooser...",
                Command = new RelayCommand(() => ShowColumnChooser(dataGrid))
            };
            contextMenu.Items.Add(chooserItem);

            // Add "Reset Columns" option
            var resetItem = new MenuItem
            {
                Header = "Reset to Default",
                Command = new RelayCommand(() => ResetColumns(dataGrid))
            };
            contextMenu.Items.Add(resetItem);

            contextMenu.Items.Add(new Separator());

            // Add "Save Configuration" option
            var saveItem = new MenuItem
            {
                Header = "Save Configuration...",
                Command = new RelayCommand(() => SaveConfiguration(dataGrid))
            };
            contextMenu.Items.Add(saveItem);

            // Add "Load Configuration" option
            var loadItem = new MenuItem
            {
                Header = "Load Configuration...",
                Command = new RelayCommand(() => LoadConfigurationDialog(dataGrid))
            };
            contextMenu.Items.Add(loadItem);

            return contextMenu;
        }

        private static Style CreateHeaderStyle(ContextMenu contextMenu)
        {
            var style = new Style(typeof(DataGridColumnHeader));
            style.Setters.Add(new Setter(FrameworkElement.ContextMenuProperty, contextMenu));
            return style;
        }

        private static void ShowColumnContextMenu(DataGrid dataGrid, DataGridColumnHeader header, MouseButtonEventArgs e)
        {
            var column = header.Column;
            if (column != null)
            {
                var contextMenu = CreateColumnContextMenu(dataGrid, column);
                contextMenu.PlacementTarget = header;
                contextMenu.Placement = PlacementMode.Bottom;
                contextMenu.IsOpen = true;
            }
        }

        private static void HideColumn(DataGrid dataGrid, DataGridColumn column)
        {
            column.Visibility = Visibility.Collapsed;
            UpdateConfiguration(dataGrid);
        }

        private static void ShowColumnChooser(DataGrid dataGrid)
        {
            var configuration = GetColumnConfiguration(dataGrid);
            if (configuration != null)
            {
                var chooserViewModel = new ColumnChooserViewModel(configuration);
                var chooserWindow = new Views.ColumnChooserDialog
                {
                    DataContext = chooserViewModel,
                    Owner = Window.GetWindow(dataGrid),
                    WindowStartupLocation = WindowStartupLocation.CenterOwner
                };

                if (chooserWindow.ShowDialog() == true)
                {
                    ApplyConfiguration(dataGrid, chooserViewModel.Configuration);
                    UpdateConfiguration(dataGrid);
                }
            }
        }

        private static async void ResetColumns(DataGrid dataGrid)
        {
            var viewName = GetViewName(dataGrid);
            var columnService = GetColumnService(dataGrid) ?? SimpleServiceLocator.Instance.GetService<IDataGridColumnService>();

            if (!string.IsNullOrEmpty(viewName) && columnService != null)
            {
                try
                {
                    var configuration = await columnService.ResetToDefaultAsync(viewName);
                    SetColumnConfiguration(dataGrid, configuration);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error resetting columns: {ex.Message}");
                }
            }
        }

        private static void SaveConfiguration(DataGrid dataGrid)
        {
            // Show save dialog
            var saveDialog = new Microsoft.Win32.SaveFileDialog
            {
                Title = "Save Column Configuration",
                Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*",
                DefaultExt = "json"
            };

            if (saveDialog.ShowDialog() == true)
            {
                try
                {
                    var configuration = GetCurrentConfiguration(dataGrid);
                    var columnService = GetColumnService(dataGrid) ?? SimpleServiceLocator.Instance.GetService<IDataGridColumnService>();
                    
                    if (columnService != null)
                    {
                        columnService.ExportConfigurationAsync(configuration, saveDialog.FileName);
                        MessageBox.Show("Configuration saved successfully.", "Save Configuration", 
                                      MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error saving configuration: {ex.Message}", "Save Configuration", 
                                  MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private static async void LoadConfigurationDialog(DataGrid dataGrid)
        {
            // Show load dialog
            var loadDialog = new Microsoft.Win32.OpenFileDialog
            {
                Title = "Load Column Configuration",
                Filter = "JSON files (*.json)|*.json|All files (*.*)|*.*",
                DefaultExt = "json"
            };

            if (loadDialog.ShowDialog() == true)
            {
                try
                {
                    var columnService = GetColumnService(dataGrid) ?? SimpleServiceLocator.Instance.GetService<IDataGridColumnService>();
                    
                    if (columnService != null)
                    {
                        var configuration = await columnService.ImportConfigurationAsync(loadDialog.FileName);
                        SetColumnConfiguration(dataGrid, configuration);
                        MessageBox.Show("Configuration loaded successfully.", "Load Configuration", 
                                      MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error loading configuration: {ex.Message}", "Load Configuration", 
                                  MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private static void UpdateConfiguration(DataGrid dataGrid)
        {
            var configuration = GetCurrentConfiguration(dataGrid);
            SetColumnConfiguration(dataGrid, configuration);

            var columnService = GetColumnService(dataGrid) ?? SimpleServiceLocator.Instance.GetService<IDataGridColumnService>();
            if (columnService != null)
            {
                try
                {
                    columnService.SaveColumnConfigurationAsync(configuration);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Error saving configuration: {ex.Message}");
                }
            }
        }

        private static DataGridColumnConfiguration GetCurrentConfiguration(DataGrid dataGrid)
        {
            var viewName = GetViewName(dataGrid) ?? "Unknown";
            var configuration = new DataGridColumnConfiguration
            {
                ViewName = viewName,
                ConfigurationName = "Current",
                ModifiedDate = DateTime.Now
            };

            foreach (var column in dataGrid.Columns.OrderBy(c => c.DisplayIndex))
            {
                var columnViewModel = new ColumnViewModel
                {
                    Header = column.Header?.ToString() ?? "Unknown",
                    PropertyName = GetColumnPropertyName(column),
                    IsVisible = column.Visibility == Visibility.Visible,
                    DisplayOrder = column.DisplayIndex,
                    Width = column.Width.IsAbsolute ? column.Width.Value : double.NaN,
                    IsSortable = column.CanUserSort,
                    IsResizable = column.CanUserResize
                };

                configuration.Columns.Add(columnViewModel);
            }

            return configuration;
        }

        private static string GetColumnPropertyName(DataGridColumn column)
        {
            if (column is DataGridBoundColumn boundColumn && 
                boundColumn.Binding is System.Windows.Data.Binding binding)
            {
                return binding.Path?.Path ?? column.Header?.ToString() ?? "Unknown";
            }

            return column.Header?.ToString() ?? "Unknown";
        }

        private static T FindParent<T>(DependencyObject child) where T : DependencyObject
        {
            var parent = VisualTreeHelper.GetParent(child);

            if (parent == null)
                return null;

            if (parent is T)
                return parent as T;

            return FindParent<T>(parent);
        }

        #endregion
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using Newtonsoft.Json;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for GenericDetailWindow.xaml
    /// </summary>
    public partial class GenericDetailWindow : Window
    {
        public GenericDetailWindow()
        {
            InitializeComponent();
            Loaded += GenericDetailWindow_Loaded;
            DataContextChanged += GenericDetailWindow_DataContextChanged;
        }

        private void GenericDetailWindow_Loaded(object sender, RoutedEventArgs e)
        {
            UpdateDetailData();
            UpdateRawData();
        }

        private void GenericDetailWindow_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            if (e.NewValue != null)
            {
                UpdateDetailData();
                UpdateRawData();
            }
        }

        private void UpdateDetailData()
        {
            try
            {
                if (DataContext is DetailWindowDataBase detailData)
                {
                    var detailItems = detailData.GetDetailData()
                        .Select(kvp => new { Key = kvp.Key, Value = kvp.Value?.ToString() ?? "N/A" })
                        .ToList();

                    DetailDataItemsControl.ItemsSource = detailItems;
                }
                else if (DataContext != null)
                {
                    // For non-DetailWindowDataBase objects, use reflection to get properties
                    var properties = DataContext.GetType().GetProperties()
                        .Where(p => p.CanRead && IsSimpleType(p.PropertyType))
                        .Select(p => new { 
                            Key = p.Name, 
                            Value = p.GetValue(DataContext)?.ToString() ?? "N/A" 
                        })
                        .ToList();

                    DetailDataItemsControl.ItemsSource = properties;
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error updating detail data: {ex.Message}");
            }
        }

        private void UpdateRawData()
        {
            try
            {
                if (DataContext != null)
                {
                    var json = JsonConvert.SerializeObject(DataContext, Formatting.Indented, 
                        new JsonSerializerSettings
                        {
                            NullValueHandling = NullValueHandling.Include,
                            DefaultValueHandling = DefaultValueHandling.Include,
                            ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                        });

                    RawDataTextBox.Text = json;
                }
            }
            catch (Exception ex)
            {
                RawDataTextBox.Text = $"Error serializing data: {ex.Message}";
                System.Diagnostics.Debug.WriteLine($"Error updating raw data: {ex.Message}");
            }
        }

        private static bool IsSimpleType(Type type)
        {
            return type.IsPrimitive ||
                   type.IsEnum ||
                   type == typeof(string) ||
                   type == typeof(decimal) ||
                   type == typeof(DateTime) ||
                   type == typeof(DateTimeOffset) ||
                   type == typeof(TimeSpan) ||
                   type == typeof(Guid) ||
                   (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Nullable<>) &&
                    IsSimpleType(type.GetGenericArguments()[0]));
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        protected override void OnKeyDown(System.Windows.Input.KeyEventArgs e)
        {
            // Handle common keyboard shortcuts
            switch (e.Key)
            {
                case System.Windows.Input.Key.Escape:
                    Close();
                    e.Handled = true;
                    break;
                case System.Windows.Input.Key.F5:
                    RefreshData();
                    e.Handled = true;
                    break;
                case System.Windows.Input.Key.C:
                    if (System.Windows.Input.Keyboard.Modifiers == System.Windows.Input.ModifierKeys.Control)
                    {
                        CopyDataToClipboard();
                        e.Handled = true;
                    }
                    break;
            }

            base.OnKeyDown(e);
        }

        private void RefreshData()
        {
            try
            {
                if (DataContext is DetailWindowDataBase detailData)
                {
                    detailData.IsLoading = true;
                    
                    // Simulate refresh - in real implementation, this would reload the data
                    var timer = new System.Windows.Threading.DispatcherTimer();
                    timer.Interval = TimeSpan.FromSeconds(1);
                    timer.Tick += (s, e) =>
                    {
                        timer.Stop();
                        detailData.LastUpdated = DateTime.Now;
                        detailData.IsLoading = false;
                        UpdateDetailData();
                        UpdateRawData();
                    };
                    timer.Start();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error refreshing data: {ex.Message}", "Error", 
                               MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void CopyDataToClipboard()
        {
            try
            {
                if (DataContext is DetailWindowDataBase detailData)
                {
                    var detailItems = detailData.GetDetailData();
                    var text = string.Join("\n", detailItems.Select(kvp => $"{kvp.Key}: {kvp.Value}"));
                    Clipboard.SetText(text);
                    
                    // Show brief confirmation
                    ShowStatusMessage("Data copied to clipboard");
                }
                else if (DataContext != null)
                {
                    var json = JsonConvert.SerializeObject(DataContext, Formatting.Indented);
                    Clipboard.SetText(json);
                    ShowStatusMessage("Data copied to clipboard");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error copying data: {ex.Message}", "Error", 
                               MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ShowStatusMessage(string message)
        {
            // Simple way to show a brief status message
            var originalTitle = Title;
            Title = $"{originalTitle} - {message}";
            
            var timer = new System.Windows.Threading.DispatcherTimer();
            timer.Interval = TimeSpan.FromSeconds(3);
            timer.Tick += (s, e) =>
            {
                timer.Stop();
                Title = originalTitle;
            };
            timer.Start();
        }

        protected override void OnSourceInitialized(EventArgs e)
        {
            base.OnSourceInitialized(e);
            
            // Initialize keyboard shortcuts for this window
            try
            {
                MandADiscoverySuite.Helpers.KeyboardShortcutIntegration.InitializeForWindow(this, "DetailWindow");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error initializing keyboard shortcuts: {ex.Message}");
            }
        }

        protected override void OnClosed(EventArgs e)
        {
            try
            {
                MandADiscoverySuite.Helpers.KeyboardShortcutIntegration.CleanupForWindow(this);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error cleaning up keyboard shortcuts: {ex.Message}");
            }
            
            base.OnClosed(e);
        }
    }
}
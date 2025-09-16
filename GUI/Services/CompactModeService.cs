// Version: 1.0.0
// Author: Lukian Poleschtschuk
// Date Modified: 2025-09-16
using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing compact mode UI layouts
    /// </summary>
    public class CompactModeService
    {
        private bool _compactModeEnabled;
        private readonly Dictionary<FrameworkElement, CompactModeSettings> _elementSettings;
        private readonly Dictionary<string, ResourceDictionary> _compactResources;

        public CompactModeService()
        {
            _elementSettings = new Dictionary<FrameworkElement, CompactModeSettings>();
            _compactResources = new Dictionary<string, ResourceDictionary>();
            LoadCompactResources();
        }

        /// <summary>
        /// Gets or sets whether compact mode is enabled
        /// </summary>
        public bool CompactModeEnabled
        {
            get => _compactModeEnabled;
            set
            {
                if (_compactModeEnabled != value)
                {
                    _compactModeEnabled = value;
                    ApplyCompactMode(value);
                    CompactModeChanged?.Invoke(this, new CompactModeChangedEventArgs(value));
                }
            }
        }

        /// <summary>
        /// Event raised when compact mode is toggled
        /// </summary>
        public event EventHandler<CompactModeChangedEventArgs> CompactModeChanged;

        /// <summary>
        /// Registers an element for compact mode management
        /// </summary>
        public void RegisterElement(FrameworkElement element, CompactModeSettings settings = null)
        {
            if (element == null) return;

            settings = settings ?? CreateDefaultSettings(element);
            _elementSettings[element] = settings;

            if (_compactModeEnabled)
            {
                ApplyCompactSettings(element, settings);
            }
        }

        /// <summary>
        /// Unregisters an element from compact mode management
        /// </summary>
        public void UnregisterElement(FrameworkElement element)
        {
            if (element != null && _elementSettings.ContainsKey(element))
            {
                _elementSettings.Remove(element);
            }
        }

        /// <summary>
        /// Applies compact mode to all registered elements
        /// </summary>
        public void ApplyCompactMode(bool enable)
        {
            foreach (var kvp in _elementSettings)
            {
                if (enable)
                    ApplyCompactSettings(kvp.Key, kvp.Value);
                else
                    RestoreNormalSettings(kvp.Key, kvp.Value);
            }

            ApplyGlobalCompactStyles(enable);
        }

        /// <summary>
        /// Creates compact settings for DataGrids
        /// </summary>
        public CompactModeSettings CreateDataGridSettings()
        {
            return new CompactModeSettings
            {
                CompactMargin = new Thickness(2),
                CompactPadding = new Thickness(4),
                CompactFontSize = 11,
                CompactRowHeight = 24,
                CompactColumnWidth = 80,
                HideNonEssentialElements = true,
                ReduceWhitespace = true
            };
        }

        /// <summary>
        /// Creates compact settings for Buttons
        /// </summary>
        public CompactModeSettings CreateButtonSettings()
        {
            return new CompactModeSettings
            {
                CompactMargin = new Thickness(2),
                CompactPadding = new Thickness(6, 3, 6, 3),
                CompactFontSize = 11,
                CompactHeight = 24,
                CompactWidth = 60,
                ReduceWhitespace = true
            };
        }

        /// <summary>
        /// Creates compact settings for Panels
        /// </summary>
        public CompactModeSettings CreatePanelSettings()
        {
            return new CompactModeSettings
            {
                CompactMargin = new Thickness(1),
                CompactPadding = new Thickness(4),
                ReduceWhitespace = true,
                HideNonEssentialElements = true
            };
        }

        /// <summary>
        /// Applies compact mode to a window
        /// </summary>
        public void ApplyCompactModeToWindow(Window window)
        {
            if (window == null) return;

            var settings = new CompactModeSettings
            {
                CompactMargin = new Thickness(4),
                CompactPadding = new Thickness(8),
                ReduceWhitespace = true
            };

            RegisterElement(window, settings);

            // Apply to all child elements
            ApplyCompactModeToChildren(window);
        }

        /// <summary>
        /// Gets compact mode statistics
        /// </summary>
        public CompactModeStats GetStats()
        {
            return new CompactModeStats
            {
                CompactModeEnabled = _compactModeEnabled,
                RegisteredElements = _elementSettings.Count,
                LoadedResources = _compactResources.Count
            };
        }

        #region Private Methods

        private void LoadCompactResources()
        {
            try
            {
                var compactStyles = new ResourceDictionary();
                
                // Compact Button Style
                var compactButtonStyle = new Style(typeof(Button));
                compactButtonStyle.Setters.Add(new Setter(Button.PaddingProperty, new Thickness(6, 3, 6, 3)));
                compactButtonStyle.Setters.Add(new Setter(Button.MarginProperty, new Thickness(2)));
                compactButtonStyle.Setters.Add(new Setter(Button.HeightProperty, 24.0));
                compactButtonStyle.Setters.Add(new Setter(Button.FontSizeProperty, 11.0));
                compactStyles.Add("CompactButtonStyle", compactButtonStyle);

                // Compact TextBox Style
                var compactTextBoxStyle = new Style(typeof(TextBox));
                compactTextBoxStyle.Setters.Add(new Setter(TextBox.PaddingProperty, new Thickness(4, 2, 4, 2)));
                compactTextBoxStyle.Setters.Add(new Setter(TextBox.MarginProperty, new Thickness(2)));
                compactTextBoxStyle.Setters.Add(new Setter(TextBox.HeightProperty, 22.0));
                compactTextBoxStyle.Setters.Add(new Setter(TextBox.FontSizeProperty, 11.0));
                compactStyles.Add("CompactTextBoxStyle", compactTextBoxStyle);

                // Compact DataGrid Style
                var compactDataGridStyle = new Style(typeof(DataGrid));
                compactDataGridStyle.Setters.Add(new Setter(DataGrid.RowHeightProperty, 22.0));
                compactDataGridStyle.Setters.Add(new Setter(DataGrid.FontSizeProperty, 10.0));
                compactDataGridStyle.Setters.Add(new Setter(DataGrid.GridLinesVisibilityProperty, DataGridGridLinesVisibility.None));
                compactStyles.Add("CompactDataGridStyle", compactDataGridStyle);

                _compactResources["Default"] = compactStyles;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading compact resources: {ex.Message}");
            }
        }

        private CompactModeSettings CreateDefaultSettings(FrameworkElement element)
        {
            return element switch
            {
                DataGrid => CreateDataGridSettings(),
                Button => CreateButtonSettings(),
                Panel => CreatePanelSettings(),
                _ => new CompactModeSettings
                {
                    CompactMargin = new Thickness(2),
                    CompactPadding = new Thickness(4),
                    CompactFontSize = 11,
                    ReduceWhitespace = true
                }
            };
        }

        private void ApplyCompactSettings(FrameworkElement element, CompactModeSettings settings)
        {
            if (element == null || settings == null) return;

            // Store original values
            settings.OriginalMargin = element.Margin;
            if (element is Control control)
            {
                settings.OriginalPadding = control.Padding;
                settings.OriginalFontSize = control.FontSize;
            }
            if (element is FrameworkElement fe)
            {
                settings.OriginalHeight = fe.Height;
                settings.OriginalWidth = fe.Width;
            }

            // Apply compact values
            element.Margin = settings.CompactMargin;
            
            if (element is Control ctrl)
            {
                ctrl.Padding = settings.CompactPadding;
                if (settings.CompactFontSize > 0)
                    ctrl.FontSize = settings.CompactFontSize;
            }

            if (settings.CompactHeight > 0)
                element.Height = settings.CompactHeight;
            if (settings.CompactWidth > 0)
                element.Width = settings.CompactWidth;

            // Special handling for specific controls
            ApplySpecialCompactSettings(element, settings);
        }

        private void RestoreNormalSettings(FrameworkElement element, CompactModeSettings settings)
        {
            if (element == null || settings == null) return;

            // Restore original values
            element.Margin = settings.OriginalMargin;
            
            if (element is Control control)
            {
                control.Padding = settings.OriginalPadding;
                if (settings.OriginalFontSize > 0)
                    control.FontSize = settings.OriginalFontSize;
            }

            if (!double.IsNaN(settings.OriginalHeight))
                element.Height = settings.OriginalHeight;
            if (!double.IsNaN(settings.OriginalWidth))
                element.Width = settings.OriginalWidth;
        }

        private void ApplySpecialCompactSettings(FrameworkElement element, CompactModeSettings settings)
        {
            switch (element)
            {
                case DataGrid dataGrid:
                    if (settings.CompactRowHeight > 0)
                        dataGrid.RowHeight = settings.CompactRowHeight;
                    if (settings.HideNonEssentialElements)
                        dataGrid.GridLinesVisibility = DataGridGridLinesVisibility.None;
                    break;

                case ListBox listBox:
                    if (settings.ReduceWhitespace)
                    {
                        var itemContainerStyle = new Style(typeof(ListBoxItem));
                        itemContainerStyle.Setters.Add(new Setter(ListBoxItem.PaddingProperty, new Thickness(2)));
                        itemContainerStyle.Setters.Add(new Setter(ListBoxItem.MarginProperty, new Thickness(0)));
                        listBox.ItemContainerStyle = itemContainerStyle;
                    }
                    break;

                case TreeView treeView:
                    if (settings.ReduceWhitespace)
                    {
                        var itemContainerStyle = new Style(typeof(TreeViewItem));
                        itemContainerStyle.Setters.Add(new Setter(TreeViewItem.PaddingProperty, new Thickness(1)));
                        treeView.ItemContainerStyle = itemContainerStyle;
                    }
                    break;
            }
        }

        private void ApplyGlobalCompactStyles(bool enable)
        {
            if (enable && _compactResources.ContainsKey("Default"))
            {
                Application.Current.Resources.MergedDictionaries.Add(_compactResources["Default"]);
            }
            else
            {
                if (_compactResources.ContainsKey("Default"))
                    Application.Current.Resources.MergedDictionaries.Remove(_compactResources["Default"]);
            }
        }

        private void ApplyCompactModeToChildren(DependencyObject parent)
        {
            var childrenCount = VisualTreeHelper.GetChildrenCount(parent);
            for (int i = 0; i < childrenCount; i++)
            {
                var child = VisualTreeHelper.GetChild(parent, i);
                if (child is FrameworkElement element)
                {
                    RegisterElement(element);
                }
                ApplyCompactModeToChildren(child);
            }
        }

        #endregion
    }

    /// <summary>
    /// Settings for compact mode behavior
    /// </summary>
    public class CompactModeSettings
    {
        public Thickness CompactMargin { get; set; } = new Thickness(2);
        public Thickness CompactPadding { get; set; } = new Thickness(4);
        public double CompactFontSize { get; set; } = 11;
        public double CompactHeight { get; set; } = -1;
        public double CompactWidth { get; set; } = -1;
        public double CompactRowHeight { get; set; } = -1;
        public double CompactColumnWidth { get; set; } = -1;
        public bool ReduceWhitespace { get; set; } = true;
        public bool HideNonEssentialElements { get; set; } = false;

        // Original values for restoration
        public Thickness OriginalMargin { get; set; }
        public Thickness OriginalPadding { get; set; }
        public double OriginalFontSize { get; set; }
        public double OriginalHeight { get; set; } = double.NaN;
        public double OriginalWidth { get; set; } = double.NaN;
    }

    /// <summary>
    /// Event args for compact mode changes
    /// </summary>
    public class CompactModeChangedEventArgs : EventArgs
    {
        public bool CompactModeEnabled { get; }

        public CompactModeChangedEventArgs(bool compactModeEnabled)
        {
            CompactModeEnabled = compactModeEnabled;
        }
    }

    /// <summary>
    /// Statistics for compact mode
    /// </summary>
    public class CompactModeStats
    {
        public bool CompactModeEnabled { get; set; }
        public int RegisteredElements { get; set; }
        public int LoadedResources { get; set; }

        public override string ToString()
        {
            return $"Compact Mode: Enabled={CompactModeEnabled}, Elements={RegisteredElements}, Resources={LoadedResources}";
        }
    }
}
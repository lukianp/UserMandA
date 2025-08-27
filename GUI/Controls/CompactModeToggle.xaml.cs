using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Toggle control for compact mode
    /// </summary>
    public partial class CompactModeToggle : UserControl
    {
        private readonly CompactModeService _compactModeService;

        public static readonly DependencyProperty IsCompactModeProperty =
            DependencyProperty.Register(nameof(IsCompactMode), typeof(bool), typeof(CompactModeToggle),
                new PropertyMetadata(false, OnIsCompactModeChanged));

        public CompactModeToggle()
        {
            InitializeComponent();
            _compactModeService = new CompactModeService();
            _compactModeService.CompactModeChanged += OnCompactModeServiceChanged;
        }

        /// <summary>
        /// Gets or sets whether compact mode is enabled
        /// </summary>
        public bool IsCompactMode
        {
            get => (bool)GetValue(IsCompactModeProperty);
            set => SetValue(IsCompactModeProperty, value);
        }

        /// <summary>
        /// Event raised when compact mode is toggled
        /// </summary>
        public event EventHandler<CompactModeChangedEventArgs> CompactModeChanged;

        /// <summary>
        /// Gets the compact mode service
        /// </summary>
        public CompactModeService CompactModeService => _compactModeService;

        private void CompactToggleButton_Click(object sender, RoutedEventArgs e)
        {
            var newState = CompactToggleButton.IsChecked == true;
            _compactModeService.CompactModeEnabled = newState;
            
            // Update tooltip
            CompactToggleButton.ToolTip = newState ? "Exit Compact Mode" : "Enter Compact Mode";
            
            // Raise event
            CompactModeChanged?.Invoke(this, new CompactModeChangedEventArgs(newState));
        }

        private static void OnIsCompactModeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is CompactModeToggle toggle)
            {
                var newValue = (bool)e.NewValue;
                toggle._compactModeService.CompactModeEnabled = newValue;
                toggle.CompactToggleButton.IsChecked = newValue;
            }
        }

        private void OnCompactModeServiceChanged(object sender, CompactModeChangedEventArgs e)
        {
            Dispatcher.InvokeAsync(() =>
            {
                IsCompactMode = e.CompactModeEnabled;
                CompactModeChanged?.Invoke(this, e);
            });
        }
    }
}
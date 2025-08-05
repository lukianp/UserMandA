using System;
using System.Windows.Input;
using System.Windows.Media;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Messages;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the theme toggle button control
    /// </summary>
    public partial class ThemeToggleButtonViewModel : BaseViewModel,
        IRecipient<ThemeChangedMessage>
    {
        private readonly ThemeService _themeService;

        private bool _isLightTheme;
        private string _tooltipText;
        private SolidColorBrush _toggleBackgroundColor;
        private SolidColorBrush _toggleBorderColor;
        private SolidColorBrush _thumbColor;
        private SolidColorBrush _thumbBorderColor;
        private SolidColorBrush _thumbIconColor;
        private double _thumbPosition;
        private double _sunOpacity;
        private double _moonOpacity;
        private string _thumbIcon;

        public bool IsLightTheme 
        { 
            get => _isLightTheme; 
            set => SetProperty(ref _isLightTheme, value); 
        }

        public string TooltipText 
        { 
            get => _tooltipText; 
            set => SetProperty(ref _tooltipText, value); 
        }

        public SolidColorBrush ToggleBackgroundColor 
        { 
            get => _toggleBackgroundColor; 
            set => SetProperty(ref _toggleBackgroundColor, value); 
        }

        public SolidColorBrush ToggleBorderColor 
        { 
            get => _toggleBorderColor; 
            set => SetProperty(ref _toggleBorderColor, value); 
        }

        public SolidColorBrush ThumbColor 
        { 
            get => _thumbColor; 
            set => SetProperty(ref _thumbColor, value); 
        }

        public SolidColorBrush ThumbBorderColor 
        { 
            get => _thumbBorderColor; 
            set => SetProperty(ref _thumbBorderColor, value); 
        }

        public SolidColorBrush ThumbIconColor 
        { 
            get => _thumbIconColor; 
            set => SetProperty(ref _thumbIconColor, value); 
        }

        public double ThumbPosition 
        { 
            get => _thumbPosition; 
            set => SetProperty(ref _thumbPosition, value); 
        }

        public double SunOpacity 
        { 
            get => _sunOpacity; 
            set => SetProperty(ref _sunOpacity, value); 
        }

        public double MoonOpacity 
        { 
            get => _moonOpacity; 
            set => SetProperty(ref _moonOpacity, value); 
        }

        public string ThumbIcon 
        { 
            get => _thumbIcon; 
            set => SetProperty(ref _thumbIcon, value); 
        }

        public ThemeToggleButtonViewModel()
        {
            _themeService = null; // Will be injected or resolved later
            
            // Register for theme change messages
            Messenger.Register<ThemeChangedMessage>(this);
            
            // Initialize state
            UpdateThemeState();
            
            // Commands
            ToggleThemeCommand = new RelayCommand(ToggleTheme);
        }

        #region Commands

        public ICommand ToggleThemeCommand { get; }

        #endregion

        #region Message Handlers

        public void Receive(ThemeChangedMessage message)
        {
            UpdateThemeState();
        }

        #endregion

        #region Private Methods

        private void ToggleTheme()
        {
            try
            {
                _themeService.ToggleTheme();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error toggling theme");
                // Could show error notification here
            }
        }

        private void UpdateThemeState()
        {
            var currentTheme = _themeService.CurrentTheme;
            IsLightTheme = currentTheme == ThemeMode.Light;
            
            UpdateVisualState();
            UpdateTooltip();
        }

        private void UpdateVisualState()
        {
            if (IsLightTheme)
            {
                // Light theme appearance
                ToggleBackgroundColor = new SolidColorBrush(Color.FromRgb(229, 231, 235)); // Gray-200
                ToggleBorderColor = new SolidColorBrush(Color.FromRgb(209, 213, 219)); // Gray-300
                ThumbColor = new SolidColorBrush(Color.FromRgb(255, 255, 255)); // White
                ThumbBorderColor = new SolidColorBrush(Color.FromRgb(209, 213, 219)); // Gray-300
                ThumbIconColor = new SolidColorBrush(Color.FromRgb(245, 158, 11)); // Amber-500
                ThumbPosition = 36; // Right position
                SunOpacity = 1.0;
                MoonOpacity = 0.3;
                ThumbIcon = "\uE706"; // Sun icon
                
                ToggleBackgroundColor.Freeze();
                ToggleBorderColor.Freeze();
                ThumbColor.Freeze();
                ThumbBorderColor.Freeze();
                ThumbIconColor.Freeze();
            }
            else
            {
                // Dark theme appearance
                ToggleBackgroundColor = new SolidColorBrush(Color.FromRgb(55, 65, 81)); // Gray-700
                ToggleBorderColor = new SolidColorBrush(Color.FromRgb(75, 85, 99)); // Gray-600
                ThumbColor = new SolidColorBrush(Color.FromRgb(31, 41, 55)); // Gray-800
                ThumbBorderColor = new SolidColorBrush(Color.FromRgb(55, 65, 81)); // Gray-700
                ThumbIconColor = new SolidColorBrush(Color.FromRgb(99, 102, 241)); // Indigo-500
                ThumbPosition = 4; // Left position
                SunOpacity = 0.3;
                MoonOpacity = 1.0;
                ThumbIcon = "\uE708"; // Moon icon
                
                ToggleBackgroundColor.Freeze();
                ToggleBorderColor.Freeze();
                ThumbColor.Freeze();
                ThumbBorderColor.Freeze();
                ThumbIconColor.Freeze();
            }
        }

        private void UpdateTooltip()
        {
            TooltipText = IsLightTheme 
                ? "Switch to Dark Theme (Ctrl+Alt+T)" 
                : "Switch to Light Theme (Ctrl+Alt+T)";
        }

        #endregion

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                Messenger.Unregister<ThemeChangedMessage>(this);
            }
            base.Dispose(disposing);
        }
    }
}
using System;
using System.Collections.Generic;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Messages
{
    /// <summary>
    /// Base message class for all application messages
    /// </summary>
    public abstract class AppMessage
    {
        public DateTime Timestamp { get; } = DateTime.UtcNow;
        public string Source { get; set; }
    }

    /// <summary>
    /// Message sent when profile changes
    /// </summary>
    public class ProfileChangedMessage : AppMessage
    {
        public CompanyProfile NewProfile { get; set; }
        public CompanyProfile OldProfile { get; set; }

        public ProfileChangedMessage(CompanyProfile newProfile, CompanyProfile? oldProfile = null)
        {
            NewProfile = newProfile;
            OldProfile = oldProfile;
        }
    }

    /// <summary>
    /// Message sent when discovery starts
    /// </summary>
    public class DiscoveryStartedMessage : AppMessage
    {
        public string ProfileName { get; set; }
        public string[] ModuleNames { get; set; }

        public DiscoveryStartedMessage(string profileName, string[] moduleNames)
        {
            ProfileName = profileName;
            ModuleNames = moduleNames;
        }
    }

    /// <summary>
    /// Message sent when discovery completes
    /// </summary>
    public class DiscoveryCompletedMessage : AppMessage
    {
        public string ProfileName { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
        public TimeSpan Duration { get; set; }

        public DiscoveryCompletedMessage(string profileName, bool success, string? errorMessage = null, TimeSpan duration = default)
        {
            ProfileName = profileName;
            Success = success;
            ErrorMessage = errorMessage;
            Duration = duration;
        }
    }

    /// <summary>
    /// Message sent when discovery progress updates
    /// </summary>
    public class DiscoveryProgressMessage : AppMessage
    {
        public string ModuleName { get; set; }
        public int ProgressPercentage { get; set; }
        public string CurrentOperation { get; set; }
        public TimeSpan Elapsed { get; set; }
        public TimeSpan? EstimatedRemaining { get; set; }

        public DiscoveryProgressMessage(string moduleName, int progressPercentage, string currentOperation)
        {
            ModuleName = moduleName;
            ProgressPercentage = progressPercentage;
            CurrentOperation = currentOperation;
        }
    }

    /// <summary>
    /// Message sent when navigation occurs
    /// </summary>
    public class NavigationMessage : AppMessage
    {
        public string ViewName { get; set; }
        public object Parameter { get; set; }
        public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();

        public NavigationMessage(string viewName, object? parameter = null)
        {
            ViewName = viewName;
            Parameter = parameter;
        }
    }

    /// <summary>
    /// Message sent when status updates
    /// </summary>
    public class StatusMessage : AppMessage
    {
        public string Message { get; set; }
        public StatusType Type { get; set; }

        public StatusMessage(string message, StatusType type = StatusType.Information)
        {
            Message = message;
            Type = type;
        }
    }

    /// <summary>
    /// Status message types
    /// </summary>
    public enum StatusType
    {
        Information,
        Warning,
        Error,
        Success
    }

    /// <summary>
    /// Message sent when data refresh is requested
    /// </summary>
    public class DataRefreshRequestMessage : AppMessage
    {
        public string DataType { get; set; }
        public string ProfileName { get; set; }
        public bool ForceRefresh { get; set; }

        public DataRefreshRequestMessage(string dataType, string profileName, bool forceRefresh = false)
        {
            DataType = dataType;
            ProfileName = profileName;
            ForceRefresh = forceRefresh;
        }
    }

    /// <summary>
    /// Message sent when data has been refreshed
    /// </summary>
    public class DataRefreshedMessage : AppMessage
    {
        public string DataType { get; set; }
        public string ProfileName { get; set; }
        public int RecordCount { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }

        public DataRefreshedMessage(string dataType, string profileName, int recordCount, bool success = true, string? errorMessage = null)
        {
            DataType = dataType;
            ProfileName = profileName;
            RecordCount = recordCount;
            Success = success;
            ErrorMessage = errorMessage;
        }
    }

    /// <summary>
    /// Message sent when theme changes
    /// </summary>
    public class ThemeChangedMessage : AppMessage
    {
        public bool IsDarkTheme { get; set; }

        public ThemeChangedMessage(bool isDarkTheme)
        {
            IsDarkTheme = isDarkTheme;
        }

        public ThemeChangedMessage(bool isDarkTheme, string themeMode)
        {
            IsDarkTheme = isDarkTheme;
            // Additional theme mode parameter for compatibility
        }
    }

    /// <summary>
    /// Message sent when accent color changes
    /// </summary>
    public class AccentColorChangedMessage : AppMessage
    {
        public string AccentColor { get; set; }

        public AccentColorChangedMessage(string accentColor)
        {
            AccentColor = accentColor;
        }
    }

    /// <summary>
    /// Message sent when font size changes
    /// </summary>
    public class FontSizeChangedMessage : AppMessage
    {
        public double FontSize { get; set; }

        public FontSizeChangedMessage(double fontSize)
        {
            FontSize = fontSize;
        }
    }

    /// <summary>
    /// Message sent when motion settings change
    /// </summary>
    public class MotionSettingsChangedMessage : AppMessage
    {
        public bool UseAnimations { get; set; }

        public MotionSettingsChangedMessage(bool useAnimations)
        {
            UseAnimations = useAnimations;
        }
    }

    /// <summary>
    /// Message sent when high contrast settings change
    /// </summary>
    public class HighContrastChangedMessage : AppMessage
    {
        public bool IsHighContrast { get; set; }

        public HighContrastChangedMessage(bool isHighContrast)
        {
            IsHighContrast = isHighContrast;
        }
    }

    /// <summary>
    /// Message sent for error notifications
    /// </summary>
    public class ErrorMessage : AppMessage
    {
        public string Title { get; set; }
        public Exception Exception { get; set; }
        public string Context { get; set; }

        public ErrorMessage(string title, Exception exception, string context = null)
        {
            Title = title;
            Exception = exception;
            Context = context;
        }
    }
}
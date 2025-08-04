using System;
using System.Windows.Media;

namespace MandADiscoverySuite.Constants
{
    /// <summary>
    /// Application-wide constants and configuration values
    /// </summary>
    public static class AppConstants
    {
        #region File and Path Constants
        
        public const string DefaultInstallPath = @"C:\enterprisediscovery";
        public const string DefaultDataPath = @"C:\discoverydata";
        public const string AppDataFolderName = "MandADiscoverySuite";
        public const string ProfilesFileName = "profiles.json";
        public const string ConfigFileName = "config.json";
        public const string LogFileName = "MandA.log";
        
        #endregion
        
        #region UI Constants
        
        public const int DefaultWindowWidth = 1200;
        public const int DefaultWindowHeight = 800;
        public const int MinWindowWidth = 800;
        public const int MinWindowHeight = 600;
        
        public const int DialogDefaultWidth = 400;
        public const int DialogDefaultHeight = 300;
        
        public const int SearchDebounceDelayMs = 300;
        public const int ProgressUpdateIntervalMs = 500;
        public const int DashboardRefreshIntervalMs = 5000;
        
        #endregion
        
        #region Discovery Constants
        
        public const int DefaultDiscoveryTimeoutMinutes = 30;
        public const int DefaultMaxConcurrentModules = 5;
        public const int DefaultNetworkTimeoutSeconds = 10;
        public const int DefaultRetryAttempts = 3;
        public const int DefaultBatchSize = 100;
        
        #endregion
        
        #region Validation Constants
        
        public const int MinCompanyNameLength = 2;
        public const int MaxCompanyNameLength = 100;
        public const int MinPasswordLength = 8;
        public const int MaxPasswordLength = 128;
        public const int MaxPathLength = 260;
        public const int MaxDescriptionLength = 500;
        
        #endregion
        
        #region Color Constants
        
        public static class Colors
        {
            // Validation colors
            public static readonly Color ValidationError = Color.FromRgb(229, 62, 62);
            public static readonly Color ValidationErrorBackground = Color.FromRgb(60, 31, 31);
            public static readonly Color ValidationWarning = Color.FromRgb(237, 137, 54);
            public static readonly Color ValidationWarningBackground = Color.FromRgb(45, 55, 72);
            public static readonly Color ValidationSuccess = Color.FromRgb(72, 187, 120);
            public static readonly Color ValidationSuccessBackground = Color.FromRgb(45, 55, 72);
            
            // Log level colors
            public static readonly Color LogVerbose = Color.FromRgb(160, 174, 192);
            public static readonly Color LogDebug = Color.FromRgb(139, 92, 246);
            public static readonly Color LogInfo = Color.FromRgb(72, 187, 120);
            public static readonly Color LogWarning = Color.FromRgb(237, 137, 54);
            public static readonly Color LogError = Color.FromRgb(245, 101, 101);
            
            // Chart colors
            public static readonly string[] ChartPalette = {
                "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                "#FF9F40", "#FF6384", "#C9CBCF", "#4BC0C0", "#FF6384"
            };
            
            // Status colors
            public static readonly string StatusReady = "#4CAF50";
            public static readonly string StatusRunning = "#2196F3";
            public static readonly string StatusCompleted = "#4CAF50";
            public static readonly string StatusFailed = "#F44336";
            public static readonly string StatusCancelled = "#FF9800";
            public static readonly string StatusDisabled = "#9E9E9E";
        }
        
        #endregion
        
        #region Data Range Constants
        
        public static class DataRanges
        {
            public static readonly (string Label, int Min, int Max)[] ItemDistributionRanges = {
                ("0-100", 0, 100),
                ("101-1K", 101, 1000),
                ("1K-10K", 1001, 10000),
                ("10K-100K", 10001, 100000),
                ("100K+", 100001, int.MaxValue)
            };
        }
        
        #endregion
        
        #region Module Icons and Categories
        
        public static class ModuleIcons
        {
            public static readonly (string Icon, string Category) ActiveDirectory = ("👥", "Identity");
            public static readonly (string Icon, string Category) AzureAD = ("☁️", "Identity");
            public static readonly (string Icon, string Category) Exchange = ("📧", "Collaboration");
            public static readonly (string Icon, string Category) SharePoint = ("📚", "Collaboration");
            public static readonly (string Icon, string Category) Teams = ("💬", "Collaboration");
            public static readonly (string Icon, string Category) Intune = ("📱", "Device Management");
            public static readonly (string Icon, string Category) NetworkInfrastructure = ("🌐", "Infrastructure");
            public static readonly (string Icon, string Category) SqlServer = ("🗄️", "Data");
            public static readonly (string Icon, string Category) FileServers = ("📁", "Storage");
            public static readonly (string Icon, string Category) Applications = ("📦", "Applications");
            public static readonly (string Icon, string Category) Certificates = ("🔐", "Security");
            public static readonly (string Icon, string Category) Printers = ("🖨️", "Infrastructure");
            public static readonly (string Icon, string Category) VMware = ("💻", "Virtualization");
            public static readonly (string Icon, string Category) DataClassification = ("🏷️", "Data");
            public static readonly (string Icon, string Category) SecurityGroups = ("🔒", "Security");
            public static readonly (string Icon, string Category) Default = ("⚙️", "Other");
        }
        
        #endregion
        
        #region Environment Variables
        
        public const string AppPathEnvironmentVariable = "MANDA_APP_PATH";
        public const string RegistryInstallPathKey = @"SOFTWARE\MandADiscoverySuite";
        public const string RegistryInstallPathValue = "InstallPath";
        
        #endregion
        
        #region Time Periods
        
        public static readonly string[] TimePeriods = {
            "All",
            "Last 24 Hours",
            "Last 7 Days",
            "Last 30 Days",
            "Last 90 Days"
        };
        
        #endregion
        
        #region Chart Types
        
        public static class ChartTypes
        {
            public const string ModuleBreakdown = "ModuleBreakdown";
            public const string ItemDistribution = "ItemDistribution";
            public const string Timeline = "Timeline";
            public const string StatusOverview = "StatusOverview";
            public const string Performance = "Performance";
            public const string Trends = "Trends";
        }
        
        #endregion
    }
}
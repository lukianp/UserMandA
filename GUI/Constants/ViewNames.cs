#nullable enable

namespace MandADiscoverySuite.Constants
{
    /// <summary>
    /// Centralized view name constants to eliminate magic strings
    /// </summary>
    public static class ViewNames
    {
        // Core Views
        public const string Dashboard = "Dashboard";
        public const string Discovery = "Discovery";
        public const string Users = "Users";
        public const string Infrastructure = "Infrastructure";
        public const string Groups = "Groups";
        public const string Analytics = "Analytics";
        public const string Settings = "Settings";
        public const string Reports = "Reports";
        public const string Computers = "Computers";
        public const string Waves = "Waves";
        public const string Migrate = "Migrate";

        // Discovery Views
        public const string DomainDiscovery = "DomainDiscovery";
        public const string FileServers = "FileServers";
        public const string Databases = "Databases";
        public const string Security = "Security";
        public const string Applications = "Applications";
        public const string ActiveDirectory = "ActiveDirectory";
        public const string Azure = "Azure";
        public const string Exchange = "Exchange";
        public const string SharePoint = "SharePoint";
        public const string Teams = "Teams";
        public const string OneDrive = "OneDrive";

        // Migration Views
        public const string MigrationPlanning = "MigrationPlanning";
        public const string MigrationExecution = "MigrationExecution";
        public const string MigrationValidation = "MigrationValidation";
        public const string MigrationMapping = "MigrationMapping";

        // Management Views
        public const string Management = "Management";
        public const string ManagementDashboard = "ManagementDashboard";
        public const string ManagementHub = "ManagementHub";
        public const string Audit = "Audit";
        public const string LogsAudit = "LogsAudit";

        // Utility Views
        public const string ProjectManagement = "ProjectManagement";
        public const string TaskScheduler = "TaskScheduler";
        public const string ScriptEditor = "ScriptEditor";
        public const string ReportBuilder = "ReportBuilder";
        public const string DataExportManager = "DataExportManager";
        public const string BulkEdit = "BulkEdit";

        // Detail Views
        public const string UserDetail = "UserDetail";
        public const string ComputerDetail = "ComputerDetail";
        public const string AssetDetail = "AssetDetail";
        public const string SecurityGroupDetail = "SecurityGroupDetail";
        public const string PolicyDetail = "PolicyDetail";

        // Specialized Views
        public const string AssetInventory = "AssetInventory";
        public const string ApplicationInventory = "ApplicationInventory";
        public const string RiskAnalysis = "RiskAnalysis";
        public const string DependencyGraph = "DependencyGraph";
        public const string NetworkTopology = "NetworkTopology";
        public const string SnapshotComparison = "SnapshotComparison";
        public const string WhatIfSimulation = "WhatIfSimulation";
        public const string EnvironmentDetection = "EnvironmentDetection";
        public const string EnvironmentRiskAssessment = "EnvironmentRiskAssessment";
        public const string PreMigrationCheck = "PreMigrationCheck";
        public const string PhaseTracker = "PhaseTracker";
        public const string GanttChart = "GanttChart";
        public const string NotesTagging = "NotesTagging";

        // Lowercase mappings for case-insensitive lookups
        public static string NormalizeViewName(string viewName)
        {
            return viewName?.ToLowerInvariant() switch
            {
                "dashboard" => Dashboard,
                "discovery" => Discovery,
                "users" => Users,
                "infrastructure" => Infrastructure,
                "groups" => Groups,
                "analytics" => Analytics,
                "settings" => Settings,
                "reports" => Reports,
                "computers" => Computers,
                "waves" => Waves,
                "migrate" => Migrate,
                "applications" => Applications,
                "security" => Security,
                "fileservers" => FileServers,
                "databases" => Databases,
                _ => viewName ?? Dashboard
            };
        }
    }

    /// <summary>
    /// Command name constants
    /// </summary>
    public static class CommandNames
    {
        public const string StartDiscovery = "StartDiscovery";
        public const string StopDiscovery = "StopDiscovery";
        public const string RefreshCurrentView = "RefreshCurrentView";
        public const string Navigate = "Navigate";
        public const string ExportData = "ExportData";
        public const string ImportData = "ImportData";
        public const string ToggleTheme = "ToggleTheme";
        public const string ShowSettings = "ShowSettings";
        public const string CreateProfile = "CreateProfile";
        public const string SaveConfiguration = "SaveConfiguration";
    }

    /// <summary>
    /// Property name constants for INotifyPropertyChanged
    /// </summary>
    public static class PropertyNames
    {
        public const string IsBusy = "IsBusy";
        public const string CurrentView = "CurrentView";
        public const string StatusMessage = "StatusMessage";
        public const string ProgressValue = "ProgressValue";
        public const string IsDarkTheme = "IsDarkTheme";
        public const string SelectedProfile = "SelectedProfile";
        public const string IsDiscoveryRunning = "IsDiscoveryRunning";
        public const string TotalItems = "TotalItems";
        public const string FilteredItems = "FilteredItems";
    }
}
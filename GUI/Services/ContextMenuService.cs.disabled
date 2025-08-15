using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Messages;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing contextual right-click menus throughout the application
    /// </summary>
    public class ContextMenuService
    {
        private readonly ILogger<ContextMenuService> _logger;
        private readonly IMessenger _messenger;
        private readonly IServiceProvider _serviceProvider;

        public ContextMenuService(
            ILogger<ContextMenuService> logger,
            IMessenger messenger,
            IServiceProvider serviceProvider)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _messenger = messenger ?? throw new ArgumentNullException(nameof(messenger));
            _serviceProvider = serviceProvider ?? throw new ArgumentNullException(nameof(serviceProvider));
        }

        /// <summary>
        /// Creates a context menu for the specified data object
        /// </summary>
        public ContextMenu CreateContextMenu(object data, Point position)
        {
            if (data == null) return null;

            var menuItems = new List<MenuItem>();

            switch (data)
            {
                case UserData user:
                    menuItems.AddRange(CreateUserContextMenu(user));
                    break;
                case InfrastructureData infrastructure:
                    menuItems.AddRange(CreateInfrastructureContextMenu(infrastructure));
                    break;
                case GroupData group:
                    menuItems.AddRange(CreateGroupContextMenu(group));
                    break;
                case ApplicationData application:
                    menuItems.AddRange(CreateApplicationContextMenu(application));
                    break;
                case CompanyProfile profile:
                    menuItems.AddRange(CreateProfileContextMenu(profile));
                    break;
                case DiscoveryModule module:
                    menuItems.AddRange(CreateModuleContextMenu(module));
                    break;
                default:
                    menuItems.AddRange(CreateGenericContextMenu(data));
                    break;
            }

            if (!menuItems.Any()) return null;

            var contextMenu = new ContextMenu();
            foreach (var item in menuItems)
            {
                contextMenu.Items.Add(item);
            }

            _logger.LogDebug("Created context menu with {ItemCount} items for {DataType}", 
                menuItems.Count, data.GetType().Name);

            return contextMenu;
        }

        /// <summary>
        /// Shows a context menu at the specified position
        /// </summary>
        public void ShowContextMenu(object data, FrameworkElement target, Point position)
        {
            var contextMenu = CreateContextMenu(data, position);
            if (contextMenu != null)
            {
                contextMenu.PlacementTarget = target;
                contextMenu.Placement = System.Windows.Controls.Primitives.PlacementMode.MousePoint;
                contextMenu.IsOpen = true;
            }
        }

        #region Context Menu Builders

        private IEnumerable<MenuItem> CreateUserContextMenu(UserData user)
        {
            var items = new List<MenuItem>();

            // Primary Actions
            items.Add(CreateMenuItem("View Details", "\uE946", () => ViewUserDetails(user)));
            items.Add(CreateMenuItem("Edit User", "\uE70F", () => EditUser(user), user.CanEdit));
            
            // Separator placeholder

            // Account Actions
            items.Add(CreateMenuItem("Reset Password", "\uE72E", () => ResetUserPassword(user), user.CanResetPassword));
            items.Add(CreateMenuItem(user.Enabled ? "Disable Account" : "Enable Account", 
                user.Enabled ? "\uE8D8" : "\uE8AB", () => ToggleUserAccount(user), user.CanToggleAccount));

            // Separator placeholder

            // Group Management
            var groupSubmenu = CreateSubmenu("Group Management", "\uE902");
            groupSubmenu.Items.Add(CreateMenuItem("Add to Group", "\uE710", () => AddUserToGroup(user)));
            groupSubmenu.Items.Add(CreateMenuItem("Remove from Group", "\uE738", () => RemoveUserFromGroup(user)));
            groupSubmenu.Items.Add(CreateMenuItem("View Group Memberships", "\uE8C4", () => ViewUserGroups(user)));
            items.Add(groupSubmenu);

            // Migration Actions
            var migrationSubmenu = CreateSubmenu("Migration", "\uE8AB");
            migrationSubmenu.Items.Add(CreateMenuItem("Add to Migration Wave", "\uE710", () => AddToMigrationWave(user)));
            migrationSubmenu.Items.Add(CreateMenuItem("Schedule Migration", "\uE787", () => ScheduleUserMigration(user)));
            migrationSubmenu.Items.Add(CreateMenuItem("View Migration Status", "\uE946", () => ViewMigrationStatus(user)));
            items.Add(migrationSubmenu);

            // Separator placeholder

            // Export Actions
            items.Add(CreateMenuItem("Export User Data", "\uE74E", () => ExportUserData(user)));
            items.Add(CreateMenuItem("Generate Report", "\uE8A5", () => GenerateUserReport(user)));

            // Separator placeholder

            // Advanced Actions
            var advancedSubmenu = CreateSubmenu("Advanced", "\uE8B5");
            advancedSubmenu.Items.Add(CreateMenuItem("Audit History", "\uE81C", () => ViewUserAuditHistory(user)));
            advancedSubmenu.Items.Add(CreateMenuItem("Security Analysis", "\uE72E", () => RunSecurityAnalysis(user)));
            advancedSubmenu.Items.Add(CreateMenuItem("Dependency Analysis", "\uE8C8", () => AnalyzeUserDependencies(user)));
            items.Add(advancedSubmenu);

            return items;
        }

        private IEnumerable<MenuItem> CreateInfrastructureContextMenu(InfrastructureData infrastructure)
        {
            var items = new List<MenuItem>();

            // Primary Actions
            items.Add(CreateMenuItem("View Details", "\uE946", () => ViewInfrastructureDetails(infrastructure)));
            items.Add(CreateMenuItem("Edit Properties", "\uE70F", () => EditInfrastructure(infrastructure), infrastructure.CanEdit));

            // Separator placeholder

            // System Actions
            items.Add(CreateMenuItem("Ping System", "\uE774", () => PingSystem(infrastructure), infrastructure.IsOnline));
            items.Add(CreateMenuItem("Remote Desktop", "\uE977", () => RemoteDesktop(infrastructure), infrastructure.AllowsRDP));
            items.Add(CreateMenuItem("Browse File System", "\uE8DA", () => BrowseFileSystem(infrastructure), infrastructure.AllowsFileAccess));

            // Separator placeholder

            // Assessment Actions
            var assessmentSubmenu = CreateSubmenu("Assessment", "\uE9A9");
            assessmentSubmenu.Items.Add(CreateMenuItem("Run Compatibility Check", "\uE73E", () => RunCompatibilityCheck(infrastructure)));
            assessmentSubmenu.Items.Add(CreateMenuItem("Performance Analysis", "\uE9A9", () => RunPerformanceAnalysis(infrastructure)));
            assessmentSubmenu.Items.Add(CreateMenuItem("Security Scan", "\uE72E", () => RunSecurityScan(infrastructure)));
            items.Add(assessmentSubmenu);

            // Migration Actions
            var migrationSubmenu = CreateSubmenu("Migration", "\uE8AB");
            migrationSubmenu.Items.Add(CreateMenuItem("Plan Migration", "\uE8F4", () => PlanSystemMigration(infrastructure)));
            migrationSubmenu.Items.Add(CreateMenuItem("Add to Migration Wave", "\uE710", () => AddToMigrationWave(infrastructure)));
            migrationSubmenu.Items.Add(CreateMenuItem("Schedule Decommission", "\uE74D", () => ScheduleDecommission(infrastructure)));
            items.Add(migrationSubmenu);

            // Separator placeholder

            // Monitoring Actions
            items.Add(CreateMenuItem("View Monitoring Data", "\uE9A9", () => ViewMonitoringData(infrastructure)));
            items.Add(CreateMenuItem("Set Alerts", "\uE7E7", () => SetInfrastructureAlerts(infrastructure)));

            // Separator placeholder

            // Export Actions
            items.Add(CreateMenuItem("Export System Data", "\uE74E", () => ExportInfrastructureData(infrastructure)));

            return items;
        }

        private IEnumerable<MenuItem> CreateGroupContextMenu(GroupData group)
        {
            var items = new List<MenuItem>();

            // Primary Actions
            items.Add(CreateMenuItem("View Details", "\uE946", () => ViewGroupDetails(group)));
            items.Add(CreateMenuItem("Edit Group", "\uE70F", () => EditGroup(group), group.CanEdit));

            // Separator placeholder

            // Membership Actions
            var membershipSubmenu = CreateSubmenu("Membership", "\uE716");
            membershipSubmenu.Items.Add(CreateMenuItem("Add Members", "\uE710", () => AddGroupMembers(group)));
            membershipSubmenu.Items.Add(CreateMenuItem("Remove Members", "\uE738", () => RemoveGroupMembers(group)));
            membershipSubmenu.Items.Add(CreateMenuItem("View All Members", "\uE8C4", () => ViewGroupMembers(group)));
            membershipSubmenu.Items.Add(CreateMenuItem("Bulk Member Actions", "\uE8C8", () => BulkMemberActions(group)));
            items.Add(membershipSubmenu);

            // Permissions Actions
            var permissionsSubmenu = CreateSubmenu("Permissions", "\uE72E");
            permissionsSubmenu.Items.Add(CreateMenuItem("View Permissions", "\uE946", () => ViewGroupPermissions(group)));
            permissionsSubmenu.Items.Add(CreateMenuItem("Modify Permissions", "\uE70F", () => ModifyGroupPermissions(group), group.CanEditPermissions));
            permissionsSubmenu.Items.Add(CreateMenuItem("Permission Analysis", "\uE9A9", () => AnalyzeGroupPermissions(group)));
            items.Add(permissionsSubmenu);

            // Separator placeholder

            // Migration Actions
            items.Add(CreateMenuItem("Plan Group Migration", "\uE8F4", () => PlanGroupMigration(group)));
            items.Add(CreateMenuItem("Export Group Data", "\uE74E", () => ExportGroupData(group)));

            return items;
        }

        private IEnumerable<MenuItem> CreateApplicationContextMenu(ApplicationData application)
        {
            var items = new List<MenuItem>();

            // Primary Actions
            items.Add(CreateMenuItem("View Details", "\uE946", () => ViewApplicationDetails(application)));
            items.Add(CreateMenuItem("Edit Application", "\uE70F", () => EditApplication(application), application.CanEdit));

            // Separator placeholder

            // Assessment Actions
            var assessmentSubmenu = CreateSubmenu("Assessment", "\uE9A9");
            assessmentSubmenu.Items.Add(CreateMenuItem("Compatibility Check", "\uE73E", () => CheckApplicationCompatibility(application)));
            assessmentSubmenu.Items.Add(CreateMenuItem("License Analysis", "\uE8A5", () => AnalyzeApplicationLicense(application)));
            assessmentSubmenu.Items.Add(CreateMenuItem("Dependency Analysis", "\uE8C8", () => AnalyzeApplicationDependencies(application)));
            items.Add(assessmentSubmenu);

            // Update Actions (if outdated)
            if (application.IsOutdated)
            {
                items.Add(CreateMenuItem("Update Application", "\uE777", () => UpdateApplication(application)));
                items.Add(CreateMenuItem("Schedule Update", "\uE787", () => ScheduleApplicationUpdate(application)));
            }

            // Separator placeholder

            // Migration Actions
            items.Add(CreateMenuItem("Plan Application Migration", "\uE8F4", () => PlanApplicationMigration(application)));
            items.Add(CreateMenuItem("Find Alternatives", "\uE721", () => FindApplicationAlternatives(application)));

            // Separator placeholder

            // Export Actions
            items.Add(CreateMenuItem("Export Application Data", "\uE74E", () => ExportApplicationData(application)));

            return items;
        }

        private IEnumerable<MenuItem> CreateProfileContextMenu(CompanyProfile profile)
        {
            var items = new List<MenuItem>();

            // Primary Actions
            items.Add(CreateMenuItem("Switch to Profile", "\uE8AB", () => SwitchToProfile(profile)));
            items.Add(CreateMenuItem("Edit Profile", "\uE70F", () => EditProfile(profile)));

            // Separator placeholder

            // Discovery Actions
            items.Add(CreateMenuItem("Run Full Discovery", "\uE768", () => RunFullDiscovery(profile)));
            items.Add(CreateMenuItem("Refresh Data", "\uE72C", () => RefreshProfileData(profile)));

            // Separator placeholder

            // Analysis Actions
            var analysisSubmenu = CreateSubmenu("Analysis", "\uE9A9");
            analysisSubmenu.Items.Add(CreateMenuItem("Generate Report", "\uE8A5", () => GenerateProfileReport(profile)));
            analysisSubmenu.Items.Add(CreateMenuItem("Risk Assessment", "\uE730", () => RunRiskAssessment(profile)));
            analysisSubmenu.Items.Add(CreateMenuItem("Migration Readiness", "\uE8F4", () => AssessMigrationReadiness(profile)));
            items.Add(analysisSubmenu);

            // Separator placeholder

            // Export Actions
            items.Add(CreateMenuItem("Export All Data", "\uE74E", () => ExportAllProfileData(profile)));
            items.Add(CreateMenuItem("Archive Profile", "\uE7B8", () => ArchiveProfile(profile)));

            // Danger Zone
            if (profile.CanDelete)
            {
                // Separator placeholder
                items.Add(CreateMenuItem("Delete Profile", "\uE74D", () => DeleteProfile(profile), true, true));
            }

            return items;
        }

        private IEnumerable<MenuItem> CreateModuleContextMenu(DiscoveryModule module)
        {
            var items = new List<MenuItem>();

            // Primary Actions
            items.Add(CreateMenuItem("View Configuration", "\uE946", () => ViewModuleConfiguration(module)));
            items.Add(CreateMenuItem("Edit Settings", "\uE70F", () => EditModuleSettings(module)));

            // Separator placeholder

            // Execution Actions
            if (module.IsEnabled)
            {
                items.Add(CreateMenuItem("Run Module", "\uE768", () => RunDiscoveryModule(module)));
                items.Add(CreateMenuItem("Schedule Run", "\uE787", () => ScheduleModuleRun(module)));
            }
            else
            {
                items.Add(CreateMenuItem("Enable Module", "\uE8AB", () => EnableModule(module)));
            }

            if (module.IsRunning)
            {
                items.Add(CreateMenuItem("Stop Module", "\uE769", () => StopDiscoveryModule(module)));
            }

            // Separator placeholder

            // Data Actions
            items.Add(CreateMenuItem("View Results", "\uE8C4", () => ViewModuleResults(module)));
            items.Add(CreateMenuItem("Export Results", "\uE74E", () => ExportModuleResults(module)));
            items.Add(CreateMenuItem("Clear Results", "\uE74D", () => ClearModuleResults(module)));

            // Separator placeholder

            // Management Actions
            items.Add(CreateMenuItem("View Logs", "\uE81C", () => ViewModuleLogs(module)));
            items.Add(CreateMenuItem("Reset Module", "\uE777", () => ResetModule(module)));

            return items;
        }

        private IEnumerable<MenuItem> CreateGenericContextMenu(object data)
        {
            var items = new List<MenuItem>();

            // Generic actions available for all objects
            items.Add(CreateMenuItem("View Properties", "\uE946", () => ViewProperties(data)));
            items.Add(CreateMenuItem("Copy Information", "\uE8C8", () => CopyInformation(data)));

            return items;
        }

        #endregion

        #region Helper Methods

        private MenuItem CreateMenuItem(string header, string icon, Action action, bool isEnabled = true, bool isDangerous = false)
        {
            var menuItem = new MenuItem
            {
                Header = header,
                IsEnabled = isEnabled
            };

            // Add icon
            if (!string.IsNullOrEmpty(icon))
            {
                var iconText = new TextBlock
                {
                    Text = icon,
                    FontFamily = new System.Windows.Media.FontFamily("Segoe MDL2 Assets"),
                    FontSize = 16,
                    Margin = new Thickness(0, 0, 8, 0),
                    VerticalAlignment = VerticalAlignment.Center
                };

                if (isDangerous)
                {
                    iconText.Foreground = System.Windows.Media.Brushes.Red;
                    menuItem.Foreground = System.Windows.Media.Brushes.Red;
                }

                var stackPanel = new StackPanel { Orientation = Orientation.Horizontal };
                stackPanel.Children.Add(iconText);
                stackPanel.Children.Add(new TextBlock { Text = header, VerticalAlignment = VerticalAlignment.Center });
                
                menuItem.Header = stackPanel;
            }

            if (isEnabled && action != null)
            {
                menuItem.Click += (s, e) =>
                {
                    try
                    {
                        action();
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error executing context menu action: {Action}", header);
                        _messenger.Send(new ErrorMessage("Context Menu Error", ex, header));
                    }
                };
            }

            return menuItem;
        }

        private MenuItem CreateSubmenu(string header, string icon)
        {
            var submenu = new MenuItem { Header = header };

            if (!string.IsNullOrEmpty(icon))
            {
                var iconText = new TextBlock
                {
                    Text = icon,
                    FontFamily = new System.Windows.Media.FontFamily("Segoe MDL2 Assets"),
                    FontSize = 16,
                    Margin = new Thickness(0, 0, 8, 0),
                    VerticalAlignment = VerticalAlignment.Center
                };

                var stackPanel = new StackPanel { Orientation = Orientation.Horizontal };
                stackPanel.Children.Add(iconText);
                stackPanel.Children.Add(new TextBlock { Text = header, VerticalAlignment = VerticalAlignment.Center });
                
                submenu.Header = stackPanel;
            }

            return submenu;
        }

        private Separator CreateSeparator()
        {
            return new Separator();
        }

        #endregion

        #region Action Methods

        // User Actions
        private void ViewUserDetails(UserData user) => _messenger.Send(new NavigationMessage("UserDetail", user));
        private void EditUser(UserData user) => _messenger.Send(new NavigationMessage("EditUser", user));
        private void ResetUserPassword(UserData user) => _messenger.Send(new ActionMessage("ResetPassword", user));
        private void ToggleUserAccount(UserData user) => _messenger.Send(new ActionMessage("ToggleAccount", user));
        private void AddUserToGroup(UserData user) => _messenger.Send(new NavigationMessage("AddToGroup", user));
        private void RemoveUserFromGroup(UserData user) => _messenger.Send(new NavigationMessage("RemoveFromGroup", user));
        private void ViewUserGroups(UserData user) => _messenger.Send(new NavigationMessage("ViewGroups", user));
        private void AddToMigrationWave(object item) => _messenger.Send(new ActionMessage("AddToMigrationWave", item));
        private void ScheduleUserMigration(UserData user) => _messenger.Send(new NavigationMessage("ScheduleMigration", user));
        private void ViewMigrationStatus(object item) => _messenger.Send(new NavigationMessage("MigrationStatus", item));
        private void ExportUserData(UserData user) => _messenger.Send(new ActionMessage("Export", user));
        private void GenerateUserReport(UserData user) => _messenger.Send(new ActionMessage("GenerateReport", user));
        private void ViewUserAuditHistory(UserData user) => _messenger.Send(new NavigationMessage("AuditHistory", user));
        private void RunSecurityAnalysis(object item) => _messenger.Send(new ActionMessage("SecurityAnalysis", item));
        private void AnalyzeUserDependencies(UserData user) => _messenger.Send(new ActionMessage("AnalyzeDependencies", user));

        // Infrastructure Actions
        private void ViewInfrastructureDetails(InfrastructureData infrastructure) => _messenger.Send(new NavigationMessage("InfrastructureDetail", infrastructure));
        private void EditInfrastructure(InfrastructureData infrastructure) => _messenger.Send(new NavigationMessage("EditInfrastructure", infrastructure));
        private void PingSystem(InfrastructureData infrastructure) => _messenger.Send(new ActionMessage("PingSystem", infrastructure));
        private void RemoteDesktop(InfrastructureData infrastructure) => _messenger.Send(new ActionMessage("RemoteDesktop", infrastructure));
        private void BrowseFileSystem(InfrastructureData infrastructure) => _messenger.Send(new ActionMessage("BrowseFileSystem", infrastructure));
        private void RunCompatibilityCheck(InfrastructureData infrastructure) => _messenger.Send(new ActionMessage("CompatibilityCheck", infrastructure));
        private void RunPerformanceAnalysis(InfrastructureData infrastructure) => _messenger.Send(new ActionMessage("PerformanceAnalysis", infrastructure));
        private void RunSecurityScan(InfrastructureData infrastructure) => _messenger.Send(new ActionMessage("SecurityScan", infrastructure));
        private void PlanSystemMigration(InfrastructureData infrastructure) => _messenger.Send(new NavigationMessage("PlanMigration", infrastructure));
        private void ScheduleDecommission(InfrastructureData infrastructure) => _messenger.Send(new ActionMessage("ScheduleDecommission", infrastructure));
        private void ViewMonitoringData(InfrastructureData infrastructure) => _messenger.Send(new NavigationMessage("MonitoringData", infrastructure));
        private void SetInfrastructureAlerts(InfrastructureData infrastructure) => _messenger.Send(new NavigationMessage("SetAlerts", infrastructure));
        private void ExportInfrastructureData(InfrastructureData infrastructure) => _messenger.Send(new ActionMessage("Export", infrastructure));

        // Group Actions
        private void ViewGroupDetails(GroupData group) => _messenger.Send(new NavigationMessage("GroupDetail", group));
        private void EditGroup(GroupData group) => _messenger.Send(new NavigationMessage("EditGroup", group));
        private void AddGroupMembers(GroupData group) => _messenger.Send(new NavigationMessage("AddMembers", group));
        private void RemoveGroupMembers(GroupData group) => _messenger.Send(new NavigationMessage("RemoveMembers", group));
        private void ViewGroupMembers(GroupData group) => _messenger.Send(new NavigationMessage("ViewMembers", group));
        private void BulkMemberActions(GroupData group) => _messenger.Send(new NavigationMessage("BulkMemberActions", group));
        private void ViewGroupPermissions(GroupData group) => _messenger.Send(new NavigationMessage("ViewPermissions", group));
        private void ModifyGroupPermissions(GroupData group) => _messenger.Send(new NavigationMessage("ModifyPermissions", group));
        private void AnalyzeGroupPermissions(GroupData group) => _messenger.Send(new ActionMessage("AnalyzePermissions", group));
        private void PlanGroupMigration(GroupData group) => _messenger.Send(new NavigationMessage("PlanMigration", group));
        private void ExportGroupData(GroupData group) => _messenger.Send(new ActionMessage("Export", group));

        // Application Actions
        private void ViewApplicationDetails(ApplicationData application) => _messenger.Send(new NavigationMessage("ApplicationDetail", application));
        private void EditApplication(ApplicationData application) => _messenger.Send(new NavigationMessage("EditApplication", application));
        private void CheckApplicationCompatibility(ApplicationData application) => _messenger.Send(new ActionMessage("CompatibilityCheck", application));
        private void AnalyzeApplicationLicense(ApplicationData application) => _messenger.Send(new ActionMessage("LicenseAnalysis", application));
        private void AnalyzeApplicationDependencies(ApplicationData application) => _messenger.Send(new ActionMessage("AnalyzeDependencies", application));
        private void UpdateApplication(ApplicationData application) => _messenger.Send(new ActionMessage("UpdateApplication", application));
        private void ScheduleApplicationUpdate(ApplicationData application) => _messenger.Send(new ActionMessage("ScheduleUpdate", application));
        private void PlanApplicationMigration(ApplicationData application) => _messenger.Send(new NavigationMessage("PlanMigration", application));
        private void FindApplicationAlternatives(ApplicationData application) => _messenger.Send(new ActionMessage("FindAlternatives", application));
        private void ExportApplicationData(ApplicationData application) => _messenger.Send(new ActionMessage("Export", application));

        // Profile Actions
        private void SwitchToProfile(CompanyProfile profile) => _messenger.Send(new NavigationMessage("SwitchProfile", profile));
        private void EditProfile(CompanyProfile profile) => _messenger.Send(new NavigationMessage("EditProfile", profile));
        private void RunFullDiscovery(CompanyProfile profile) => _messenger.Send(new ActionMessage("RunFullDiscovery", profile));
        private void RefreshProfileData(CompanyProfile profile) => _messenger.Send(new ActionMessage("RefreshData", profile));
        private void GenerateProfileReport(CompanyProfile profile) => _messenger.Send(new ActionMessage("GenerateReport", profile));
        private void RunRiskAssessment(CompanyProfile profile) => _messenger.Send(new ActionMessage("RiskAssessment", profile));
        private void AssessMigrationReadiness(CompanyProfile profile) => _messenger.Send(new ActionMessage("MigrationReadiness", profile));
        private void ExportAllProfileData(CompanyProfile profile) => _messenger.Send(new ActionMessage("ExportAll", profile));
        private void ArchiveProfile(CompanyProfile profile) => _messenger.Send(new ActionMessage("ArchiveProfile", profile));
        private void DeleteProfile(CompanyProfile profile) => _messenger.Send(new ActionMessage("DeleteProfile", profile));

        // Module Actions
        private void ViewModuleConfiguration(DiscoveryModule module) => _messenger.Send(new NavigationMessage("ModuleConfiguration", module));
        private void EditModuleSettings(DiscoveryModule module) => _messenger.Send(new NavigationMessage("EditModule", module));
        private void RunDiscoveryModule(DiscoveryModule module) => _messenger.Send(new ActionMessage("RunModule", module));
        private void ScheduleModuleRun(DiscoveryModule module) => _messenger.Send(new ActionMessage("ScheduleModule", module));
        private void EnableModule(DiscoveryModule module) => _messenger.Send(new ActionMessage("EnableModule", module));
        private void StopDiscoveryModule(DiscoveryModule module) => _messenger.Send(new ActionMessage("StopModule", module));
        private void ViewModuleResults(DiscoveryModule module) => _messenger.Send(new NavigationMessage("ModuleResults", module));
        private void ExportModuleResults(DiscoveryModule module) => _messenger.Send(new ActionMessage("ExportResults", module));
        private void ClearModuleResults(DiscoveryModule module) => _messenger.Send(new ActionMessage("ClearResults", module));
        private void ViewModuleLogs(DiscoveryModule module) => _messenger.Send(new NavigationMessage("ModuleLogs", module));
        private void ResetModule(DiscoveryModule module) => _messenger.Send(new ActionMessage("ResetModule", module));

        // Generic Actions
        private void ViewProperties(object item) => _messenger.Send(new NavigationMessage("ViewProperties", item));
        private void CopyInformation(object item) => _messenger.Send(new ActionMessage("CopyInformation", item));

        #endregion
    }
}
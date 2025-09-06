using System;
using System.Collections.Generic;
using System.Windows.Controls;
using MandADiscoverySuite.Views;
using MandADiscoverySuite.ViewModels.Placeholders;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Registry for mapping navigation keys to view factories
    /// </summary>
    public class ViewRegistry
    {
        private readonly Dictionary<string, Func<UserControl>> _viewFactories;
        private static ViewRegistry? _instance;

        public static ViewRegistry Instance => _instance ??= new ViewRegistry();

        private ViewRegistry()
        {
            _viewFactories = new Dictionary<string, Func<UserControl>>(StringComparer.OrdinalIgnoreCase)
            {
                // Navigation keys (lowercase) mapped to views - Updated to use New unified pipeline views
                ["users"] = () => new UsersViewNew(),
                ["groups"] = () => new GroupsViewNew(), 
                ["applications"] = () => new ApplicationsViewNew(),
                ["fileservers"] = () => new FileServersViewNew(),
                ["databases"] = () => new DatabasesViewNew(),
                ["grouppolicies"] = () => new GroupPoliciesViewNew(),
                ["grouppolicy"] = () => new GroupPoliciesViewNew(), // Alternative key
                ["computers"] = () => new ComputersView(),  // No new version needed
                ["infrastructure"] = () => new InfrastructureViewNew(),
                ["domaindiscovery"] = () => new DomainDiscoveryView(),
                ["security"] = () => new SecurityPolicyView(), // Comprehensive security & policy view
                ["security-policy"] = () => new SecurityPolicyView(), // Direct access key
                ["securitypolicy"] = () => new SecurityPolicyView(), // Alternative key
                ["grouppolicysecurity"] = () => new GroupPolicySecurityView(), // Legacy security view
                ["activedirectorydiscovery"] = () => new ActiveDirectoryDiscoveryView(),
                ["teamsdiscovery"] = () => new TeamsDiscoveryView(),
                ["azurediscovery"] = () => new AzureInfrastructureDiscoveryView(),
                ["datalosspreventiondiscovery"] = () => new DataLossPreventionDiscoveryView(),
                ["webserverconfigurationdiscovery"] = () => new WebServerConfigurationDiscoveryView(),
                ["environmentriskassessment"] = () => new EnvironmentRiskAssessmentView(),
                // Removed duplicate "security groups" - use "groups" instead
                ["waves"] = () => new WaveView(),
                ["migrate"] = () => new MigrateView(),
                // ["exchangemigration"] = () => new ExchangeMigrationPlanningViewSimple(),
                // ["exchange-migration"] = () => new ExchangeMigrationPlanningViewSimple(),
                // ["exchangeplanning"] = () => new ExchangeMigrationPlanningViewSimple(),
                // ["mailboxmigration"] = () => new ExchangeMigrationPlanningViewSimple(),
                // TEMPORARILY DISABLED: SharePoint migration features excluded due to compilation issues
                // ["sharepointmigration"] = () => new SharePointMigrationPlanningView(),
                // ["sharepoint-migration"] = () => new SharePointMigrationPlanningView(),
                // ["sharepointplanning"] = () => new SharePointMigrationPlanningView(),
                // ["sitemigration"] = () => new SharePointMigrationPlanningView(),
                ["onedrivemigration"] = () => new OneDriveMigrationPlanningView(),
                ["onedrive-migration"] = () => new OneDriveMigrationPlanningView(),
                ["onedriveplanning"] = () => new OneDriveMigrationPlanningView(),
                ["filemigration"] = () => new OneDriveMigrationPlanningView(),
                ["teamsmigration"] = () => new TeamsMigrationPlanningView(),
                ["teams-migration"] = () => new TeamsMigrationPlanningView(),
                ["teamsplanning"] = () => new TeamsMigrationPlanningView(),
                ["collaborationmigration"] = () => new TeamsMigrationPlanningView(),
                
                // New Migration Planning Views
                ["migrationplanning"] = () => new MigrationPlanningView(),
                ["migration-planning"] = () => new MigrationPlanningView(),
                ["planning"] = () => new MigrationPlanningView(),
                ["migrationmapping"] = () => new MigrationMappingView(),
                ["migration-mapping"] = () => new MigrationMappingView(),
                ["mapping"] = () => new MigrationMappingView(),
                ["migrationexecution"] = () => new MigrationExecutionView(),
                ["migration-execution"] = () => new MigrationExecutionView(),
                ["execution"] = () => new MigrationExecutionView(),
                ["management"] = () => new ManagementHubView(),
                ["reports"] = () => new ReportsView(),
                ["analytics"] = () => new AnalyticsView(),
                ["phasetracker"] = () => new PhaseTrackerView(),
                ["settings"] = () => new SettingsView(),
                ["dashboard"] = () => new DashboardView(), // Implemented with new architecture
                ["overview"] = () => new DashboardView(), // Overview maps to Dashboard
                ["stats"] = () => new DashboardView(), // Stats maps to Dashboard for statistics view
                ["discovery"] = () => new DiscoveryView(), // Discovery modules view
                ["logs-audit"] = () => new LogsAuditView(), // New logs and audit view
                ["logs"] = () => new LogsAuditView(), // Alternative key
                
                // Legacy keys for backwards compatibility (PascalCase) - Updated to use New views
                ["DomainDiscovery"] = () => new DomainDiscoveryView(),
                ["FileServers"] = () => new FileServersViewNew(),
                ["Databases"] = () => new DatabasesViewNew(),
                ["Security"] = () => new SecurityPolicyView(), // Updated to new comprehensive view
                ["SecurityPolicy"] = () => new SecurityPolicyView(),
                ["Applications"] = () => new ApplicationsViewNew(),
                ["Waves"] = () => new WaveView(),
                ["Migrate"] = () => new MigrateView(),
                // ["ExchangeMigration"] = () => new ExchangeMigrationPlanningViewSimple(),
                // ["ExchangePlanning"] = () => new ExchangeMigrationPlanningViewSimple(),
                // ["MailboxMigration"] = () => new ExchangeMigrationPlanningViewSimple(),
                // TEMPORARILY DISABLED: SharePoint migration features excluded due to compilation issues
                // ["SharePointMigration"] = () => new SharePointMigrationPlanningView(),
                // ["SharePointPlanning"] = () => new SharePointMigrationPlanningView(),
                // ["SiteMigration"] = () => new SharePointMigrationPlanningView(),
                ["OneDriveMigration"] = () => new OneDriveMigrationPlanningView(),
                ["OneDrivePlanning"] = () => new OneDriveMigrationPlanningView(),
                ["FileMigration"] = () => new OneDriveMigrationPlanningView(),
                ["TeamsMigration"] = () => new TeamsMigrationPlanningView(),
                ["TeamsPlanning"] = () => new TeamsMigrationPlanningView(),
                ["CollaborationMigration"] = () => new TeamsMigrationPlanningView(),
                
                // New Migration Planning Views (PascalCase)
                ["MigrationPlanning"] = () => new MigrationPlanningView(),
                ["Planning"] = () => new MigrationPlanningView(),
                ["MigrationMapping"] = () => new MigrationMappingView(),
                ["Mapping"] = () => new MigrationMappingView(),
                ["MigrationExecution"] = () => new MigrationExecutionView(),
                ["Execution"] = () => new MigrationExecutionView(),
                ["Management"] = () => new ManagementHubView(),
                ["GroupPolicies"] = () => new GroupPoliciesViewNew(),
                ["Reports"] = () => new ReportsView(),
                ["Analytics"] = () => new AnalyticsView(),
                ["PhaseTracker"] = () => new PhaseTrackerView(),
                ["Settings"] = () => new SettingsView(),
                ["Computers"] = () => new ComputersView(),
                ["Users"] = () => new UsersViewNew(),
                ["Groups"] = () => new GroupsViewNew(),
                ["Infrastructure"] = () => new InfrastructureViewNew(),
                ["Discovery"] = () => new DiscoveryView(), // Discovery modules view (PascalCase)
                ["TeamsDiscovery"] = () => new TeamsDiscoveryView(),
                ["AzureDiscovery"] = () => new AzureInfrastructureDiscoveryView(),
                ["DataLossPreventionDiscovery"] = () => new DataLossPreventionDiscoveryView(),
                ["WebServerConfigurationDiscovery"] = () => new WebServerConfigurationDiscoveryView(),
                ["EnvironmentRiskAssessment"] = () => new EnvironmentRiskAssessmentView(),
            };
        }

        /// <summary>
        /// Register a custom view factory
        /// </summary>
        public void RegisterView(string key, Func<UserControl> viewFactory)
        {
            _viewFactories[key] = viewFactory ?? throw new ArgumentNullException(nameof(viewFactory));
        }

        /// <summary>
        /// Register a custom view factory (alias for RegisterView)
        /// </summary>
        public static void Register(string key, Func<UserControl> viewFactory)
        {
            Instance.RegisterView(key, viewFactory);
        }

        /// <summary>
        /// Resolve a view by key (alias for CreateView)
        /// </summary>
        public static UserControl? Resolve(string key)
        {
            return Instance.CreateView(key);
        }

        /// <summary>
        /// Create a view instance by key
        /// </summary>
        public UserControl? CreateView(string key)
        {
            // Thread-safe debug logging - use Debug.WriteLine instead of file logging to prevent deadlocks
            var logMessage = $"[ViewRegistry] CreateView called with key: '{key}'";
            System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {logMessage}");
            
            if (string.IsNullOrWhiteSpace(key))
            {
                System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} [ViewRegistry] Key is null or whitespace");
                return null;
            }

            // Debug logging for missing keys
            if (!_viewFactories.ContainsKey(key))
            {
                var errorMsg = $"[ViewRegistry] KEY NOT FOUND: '{key}' - Available keys: {string.Join(", ", _viewFactories.Keys)}";
                System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {errorMsg}");
            }

            if (_viewFactories.TryGetValue(key, out var factory))
            {
                try
                {
                    var createMsg = $"[ViewRegistry] Creating view for key '{key}'";
                    System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {createMsg}");
                    
                    UserControl? view = null;
                    
                    // CRITICAL FIX: ALWAYS marshal view creation to UI thread
                    // Check if we're already on UI thread to avoid unnecessary marshalling
                    if (System.Windows.Application.Current?.Dispatcher?.CheckAccess() == true)
                    {
                        // Already on UI thread - execute directly
                        System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} [ViewRegistry] Executing factory() directly on UI thread");
                        view = factory();
                        System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} [ViewRegistry] Factory completed successfully");
                    }
                    else if (System.Windows.Application.Current?.Dispatcher != null)
                    {
                        // Background thread - use Invoke to marshal to UI thread
                        System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} [ViewRegistry] Marshalling view creation to UI thread");
                        System.Windows.Application.Current.Dispatcher.Invoke(() =>
                        {
                            System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} [ViewRegistry] Executing factory() on UI thread via Invoke");
                            view = factory();
                            System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} [ViewRegistry] Factory completed successfully via Invoke");
                        });
                    }
                    else
                    {
                        // Fallback - no dispatcher available
                        System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} [ViewRegistry] ERROR: No dispatcher available!");
                        throw new InvalidOperationException("No dispatcher available for view creation. WPF application not properly initialized.");
                    }
                    
                    var successMsg = $"[ViewRegistry] Successfully created view for key '{key}': {view?.GetType().Name}";
                    System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {successMsg}");
                    return view;
                }
                catch (Exception ex)
                {
                    var errorMsg = $"[ViewRegistry] Error creating view for key '{key}': {ex.Message}";
                    System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {errorMsg}");
                    System.Diagnostics.Debug.WriteLine($"[ViewRegistry] Stack trace: {ex.StackTrace}");
                    // Return fallback view for factory errors
                    return CreateMissingView(key, $"Error creating view: {ex.Message}");
                }
            }

            var fallbackMsg = $"[ViewRegistry] No view registered for key '{key}' - returning MissingView fallback";
            System.Diagnostics.Debug.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {fallbackMsg}");
            // Return fallback view for unregistered keys
            return CreateMissingView(key, "View not registered in ViewRegistry");
        }
        
        /// <summary>
        /// Creates a fallback MissingView for unregistered or failed view creation
        /// </summary>
        private UserControl CreateMissingView(string key, string reason)
        {
            try
            {
                UserControl? missingView = null;
                
                // CRITICAL FIX: ALWAYS marshal MissingView creation to UI thread
                if (System.Windows.Application.Current?.Dispatcher != null)
                {
                    // ALWAYS use Dispatcher.Invoke to guarantee STA thread execution
                    System.Windows.Application.Current.Dispatcher.Invoke(() =>
                    {
                        missingView = new Views.Placeholders.MissingView();
                        
                        // Set the DataContext with missing view info
                        if (missingView.DataContext is MissingViewModel viewModel)
                        {
                            viewModel.Key = key;
                            viewModel.Reason = reason;
                            viewModel.Timestamp = DateTime.Now;
                        }
                    });
                }
                else
                {
                    // Fallback - try direct creation (this might fail)
                    missingView = new Views.Placeholders.MissingView();
                    
                    // Set the DataContext with missing view info
                    if (missingView.DataContext is MissingViewModel viewModel)
                    {
                        viewModel.Key = key;
                        viewModel.Reason = reason;
                        viewModel.Timestamp = DateTime.Now;
                    }
                }
                
                return missingView ?? CreateEmergencyFallback(key);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[ViewRegistry] Error creating MissingView fallback: {ex.Message}");
                return CreateEmergencyFallback(key);
            }
        }
        
        /// <summary>
        /// Creates an emergency fallback when even MissingView fails
        /// </summary>
        private UserControl CreateEmergencyFallback(string key)
        {
            try
            {
                UserControl? errorControl = null;
                
                if (System.Windows.Application.Current?.Dispatcher != null)
                {
                    // ALWAYS use Dispatcher.Invoke to guarantee STA thread execution
                    System.Windows.Application.Current.Dispatcher.Invoke(() =>
                    {
                        errorControl = new UserControl();
                        errorControl.Content = new System.Windows.Controls.TextBlock { Text = $"Critical Error: Unable to create view for '{key}'" };
                    });
                }
                else
                {
                    // Fallback - try direct creation
                    errorControl = new UserControl();
                    errorControl.Content = new System.Windows.Controls.TextBlock { Text = $"Critical Error: Unable to create view for '{key}'" };
                }
                
                return errorControl ?? new UserControl(); // Final fallback
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[ViewRegistry] Even emergency fallback failed: {ex.Message}");
                return new UserControl(); // Absolute last resort
            }
        }

        /// <summary>
        /// Check if a view is registered
        /// </summary>
        public bool IsViewRegistered(string key)
        {
            return !string.IsNullOrWhiteSpace(key) && _viewFactories.ContainsKey(key);
        }

        /// <summary>
        /// Get all registered view keys
        /// </summary>
        public IEnumerable<string> GetRegisteredKeys()
        {
            return _viewFactories.Keys;
        }
    }
}
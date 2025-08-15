using System;
using System.Collections.Generic;
using System.Windows.Controls;
using MandADiscoverySuite.Views;

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
                ["computers"] = () => new ComputersView(),  // No new version needed
                ["infrastructure"] = () => new InfrastructureViewNew(),
                ["assets"] = () => new AssetInventoryView(), // Re-enabled with new architecture
                ["domaindiscovery"] = () => new DomainDiscoveryView(),
                ["security"] = () => new SecurityView(), // Re-enabled with new architecture
                ["security groups"] = () => new Views.Placeholders.MissingView(), // Temporarily disabled due to ViewModel issues
                ["waves"] = () => new WaveView(),
                ["migrate"] = () => new MigrateView(),
                ["management"] = () => new ManagementView(),
                ["reports"] = () => new ReportBuilderView(),
                ["analytics"] = () => new AnalyticsView(),
                ["settings"] = () => new SettingsView(),
                ["dashboard"] = () => new DashboardView(), // Implemented with new architecture
                ["discovery"] = () => new Views.Placeholders.MissingView(), // TODO: Implement discovery module runner
                
                // Legacy keys for backwards compatibility (PascalCase) - Updated to use New views
                ["DomainDiscovery"] = () => new DomainDiscoveryView(),
                ["FileServers"] = () => new FileServersViewNew(),
                ["Databases"] = () => new DatabasesViewNew(),
                ["Security"] = () => new SecurityView(),
                ["Applications"] = () => new ApplicationsViewNew(),
                ["Waves"] = () => new WaveView(),
                ["Migrate"] = () => new MigrateView(),
                ["Management"] = () => new ManagementView(),
                ["GroupPolicies"] = () => new GroupPoliciesViewNew(),
                ["Reports"] = () => new ReportBuilderView(),
                ["Analytics"] = () => new AnalyticsView(),
                ["Settings"] = () => new SettingsView(),
                ["Computers"] = () => new ComputersView(),
                ["Users"] = () => new UsersViewNew(),
                ["Groups"] = () => new GroupsViewNew(),
                ["Infrastructure"] = () => new InfrastructureViewNew(),
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
            if (string.IsNullOrWhiteSpace(key))
                return null;

            if (_viewFactories.TryGetValue(key, out var factory))
            {
                try
                {
                    return factory();
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"[ViewRegistry] Error creating view for key '{key}': {ex.Message}");
                    return null;
                }
            }

            System.Diagnostics.Debug.WriteLine($"[ViewRegistry] No view registered for key '{key}'");
            return null;
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
using System;
using System.Collections.Generic;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Simple service locator implementation without external dependencies
    /// </summary>
    public static class SimpleServiceLocator
    {
        private static readonly Dictionary<Type, object> _services = new Dictionary<Type, object>();
        private static readonly Dictionary<Type, Func<object>> _factories = new Dictionary<Type, Func<object>>();

        /// <summary>
        /// Register a singleton service instance
        /// </summary>
        public static void RegisterSingleton<T>(T instance) where T : class
        {
            _services[typeof(T)] = instance;
        }

        /// <summary>
        /// Register a service factory
        /// </summary>
        public static void RegisterFactory<T>(Func<T> factory) where T : class
        {
            _factories[typeof(T)] = () => factory();
        }

        /// <summary>
        /// Get a service instance
        /// </summary>
        public static T GetService<T>() where T : class
        {
            var type = typeof(T);
            
            // Try to get existing instance
            if (_services.TryGetValue(type, out var instance))
            {
                return (T)instance;
            }
            
            // Try to create from factory
            if (_factories.TryGetValue(type, out var factory))
            {
                var newInstance = (T)factory();
                _services[type] = newInstance; // Cache as singleton
                return newInstance;
            }
            
            // Try to create with default constructor
            try
            {
                var newInstance = Activator.CreateInstance<T>();
                _services[type] = newInstance;
                return newInstance;
            }
            catch
            {
                throw new InvalidOperationException($"Service {typeof(T).Name} is not registered and cannot be created");
            }
        }

        /// <summary>
        /// Initialize default services
        /// </summary>
        public static void Initialize()
        {
            // Register default services as singletons
            RegisterSingleton(ConfigurationService.Instance);
            RegisterSingleton(ErrorHandlingService.Instance);
            RegisterSingleton(InputValidationService.Instance);
            
            // Register factories for other services
            RegisterFactory<DiscoveryService>(() => new DiscoveryService());
            RegisterFactory<ProfileService>(() => new ProfileService());
            RegisterFactory<IWidgetLayoutService>(() => new WidgetLayoutService());
            RegisterFactory<ISnapshotService>(() => new SnapshotService());
            RegisterFactory<IAdvancedFilterService>(() => new AdvancedFilterService());
            RegisterFactory<IGanttService>(() => new GanttService());
            RegisterFactory<IGlobalSearchService>(() => new GlobalSearchService());
            RegisterFactory<IReportBuilderService>(() => new ReportBuilderService());
            RegisterFactory<IKeyboardShortcutService>(() => new KeyboardShortcutService());
            RegisterFactory<IDetailWindowService>(() => new DetailWindowService());
            RegisterFactory<IDataGridColumnService>(() => new DataGridColumnService());
            
            // Register ViewModels
            RegisterFactory<MandADiscoverySuite.ViewModels.MainViewModel>(() => 
                new MandADiscoverySuite.ViewModels.MainViewModel());
        }

        /// <summary>
        /// Clear all services (for testing)
        /// </summary>
        public static void Clear()
        {
            _services.Clear();
            _factories.Clear();
        }
    }
}
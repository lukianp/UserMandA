using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Interfaces;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Simple service locator for dependency injection - temporary implementation
    /// </summary>
    public class SimpleServiceLocator
    {
        private static readonly ConcurrentDictionary<Type, object> _services = new();
        private static ILoggerFactory _loggerFactory;
        private static IMessenger _messenger;
        
        /// <summary>
        /// Instance property for compatibility with existing code
        /// </summary>
        public static SimpleServiceLocator Instance { get; } = new SimpleServiceLocator();
        
        // Private constructor for Instance compatibility
        private SimpleServiceLocator() { }

        static SimpleServiceLocator()
        {
            // Initialize basic services
            _loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
            _messenger = WeakReferenceMessenger.Default;
            
            // Register basic services immediately
            RegisterService<IMessenger>(_messenger);
            
            // Pre-register critical services to prevent widget failures
            PreRegisterCriticalServices();
        }
        
        /// <summary>
        /// Pre-registers critical services to prevent initialization failures
        /// </summary>
        private static void PreRegisterCriticalServices()
        {
            try
            {
                // Register IDataService and DataService
                var dataLogger = _loggerFactory.CreateLogger<DataService>();
                var dataService = new DataService(dataLogger, _loggerFactory);
                RegisterService<IDataService>(dataService);
                RegisterService<DataService>(dataService);
                
                // Register ProfileService if available
                var profileService = TargetProfileService.Instance;
                RegisterService<TargetProfileService>(profileService);
                
                // Register LogicEngineService
                var logicLogger = _loggerFactory.CreateLogger<LogicEngineService>();
                var dataRoot = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "RawData");
                var logicEngineService = new LogicEngineService(logicLogger, null, dataRoot);
                RegisterService<ILogicEngineService>(logicEngineService);
                RegisterService<LogicEngineService>(logicEngineService);
                
                // Register LogManagementService
                var logMgmtLogger = _loggerFactory.CreateLogger<LogManagementService>();
                var logManagementService = new LogManagementService(logMgmtLogger);
                RegisterService<ILogManagementService>(logManagementService);
                RegisterService<LogManagementService>(logManagementService);
                
                System.Diagnostics.Debug.WriteLine("SimpleServiceLocator: Critical services pre-registered successfully");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SimpleServiceLocator: Error pre-registering critical services: {ex.Message}");
                // Continue without failing - services will be created on-demand if needed
            }
        }

        public static void Initialize()
        {
            // Method for compatibility - initialization happens in static constructor
        }

        public T Get<T>() where T : class
        {
            return GetService<T>();
        }
        
        public T GetService<T>() where T : class
        {
            var type = typeof(T);
            
            // Handle logger requests
            if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(ILogger<>))
            {
                var genericType = type.GetGenericArguments()[0];
                return (T)_loggerFactory.CreateLogger(genericType);
            }
            
            // Handle registered services
            if (_services.TryGetValue(type, out var service))
            {
                return (T)service;
            }
            
            // Handle special cases
            if (type == typeof(ThemeService))
            {
                var logger = _loggerFactory.CreateLogger<ThemeService>();
                var themeService = new ThemeService(logger, _messenger);
                RegisterService<ThemeService>(themeService);
                return (T)(object)themeService;
            }
            
            if (type == typeof(UIInteractionLoggingService))
            {
                var logger = _loggerFactory.CreateLogger<UIInteractionLoggingService>();
                var uiLoggingService = new UIInteractionLoggingService(logger);
                RegisterService<UIInteractionLoggingService>(uiLoggingService);
                return (T)(object)uiLoggingService;
            }
            
            if (type == typeof(CsvFileWatcherService))
            {
                var logger = _loggerFactory.CreateLogger<CsvFileWatcherService>();
                var csvWatcherService = new CsvFileWatcherService(logger);
                RegisterService<CsvFileWatcherService>(csvWatcherService);
                return (T)(object)csvWatcherService;
            }
            
            if (type == typeof(ILogicEngineService) || type == typeof(LogicEngineService))
            {
                var logger = _loggerFactory.CreateLogger<LogicEngineService>();
                
                // T-030: Try to get cache service, but don't require it for backward compatibility
                MultiTierCacheService cacheService = null;
                try
                {
                    cacheService = GetService<MultiTierCacheService>();
                }
                catch
                {
                    // Cache service not available - proceed without it
                }
                
                var dataRoot = Path.Combine(ConfigurationService.Instance.DiscoveryDataRootPath, "ljpops", "RawData");
                var logicEngineService = new LogicEngineService(logger, cacheService, dataRoot);
                RegisterService<ILogicEngineService>(logicEngineService);
                RegisterService<LogicEngineService>(logicEngineService);
                return (T)(object)logicEngineService;
            }
            
            if (type == typeof(ILogManagementService) || type == typeof(LogManagementService))
            {
                var logger = _loggerFactory.CreateLogger<LogManagementService>();
                var logManagementService = new LogManagementService(logger);
                RegisterService<ILogManagementService>(logManagementService);
                RegisterService<LogManagementService>(logManagementService);
                return (T)(object)logManagementService;
            }
            
            if (type == typeof(IDataService) || type == typeof(DataService))
            {
                var logger = _loggerFactory.CreateLogger<DataService>();
                var dataService = new DataService(logger, _loggerFactory);
                RegisterService<IDataService>(dataService);
                RegisterService<DataService>(dataService);
                return (T)(object)dataService;
            }
            
            if (type == typeof(TargetProfileService))
            {
                var targetProfileService = TargetProfileService.Instance;
                RegisterService<TargetProfileService>(targetProfileService);
                return (T)(object)targetProfileService;
            }

            if (type == typeof(ICsvDataLoader) || type == typeof(CsvDataServiceNew))
            {
                var logger = _loggerFactory.CreateLogger<CsvDataServiceNew>();
                var csvDataLoader = new CsvDataServiceNew(logger, "ljpops"); // Use default profile
                RegisterService<ICsvDataLoader>(csvDataLoader);
                RegisterService<CsvDataServiceNew>(csvDataLoader);
                return (T)(object)csvDataLoader;
            }
            
            // Try to create with parameterless constructor
            if (type.GetConstructor(Type.EmptyTypes) != null)
            {
                return (T)Activator.CreateInstance(type);
            }
            
            throw new InvalidOperationException($"Service {type.Name} is not registered and cannot be created");
        }
        
        public static void RegisterService<T>(T service) where T : class
        {
            _services.TryAdd(typeof(T), service);
        }
    }
}
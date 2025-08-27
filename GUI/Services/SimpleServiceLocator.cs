using System;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Simple service locator for dependency injection - temporary implementation
    /// </summary>
    [Obsolete("To be replaced by proper dependency injection")]
    public class SimpleServiceLocator
    {
        private static readonly Dictionary<Type, object> _services = new();
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
            
            // Register known services
            RegisterService<IMessenger>(_messenger);
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
                var dataRoot = @"C:\discoverydata\ljpops\RawData\";
                var logicEngineService = new LogicEngineService(logger, dataRoot);
                RegisterService<ILogicEngineService>(logicEngineService);
                RegisterService<LogicEngineService>(logicEngineService);
                return (T)(object)logicEngineService;
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
            _services[typeof(T)] = service;
        }
    }
}
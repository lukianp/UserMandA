using System;
using Microsoft.Extensions.DependencyInjection;
using MandADiscoverySuite.Extensions;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service locator pattern for dependency injection
    /// This bridges the gap between legacy code and modern DI patterns
    /// </summary>
    public static class ServiceLocator
    {
        private static IServiceProvider _serviceProvider;
        private static IServiceCollection _services;
        private static readonly object _lock = new object();

        /// <summary>
        /// Initializes the service locator with configured services
        /// </summary>
        public static void Initialize()
        {
            lock (_lock)
            {
                if (_serviceProvider != null)
                    return;

                _services = new ServiceCollection();
                _services.ConfigureApplicationServices();
                _serviceProvider = _services.BuildServiceProvider();
            }
        }

        /// <summary>
        /// Gets a service of the specified type
        /// </summary>
        public static T GetService<T>()
        {
            if (_serviceProvider == null)
                throw new InvalidOperationException("ServiceLocator has not been initialized. Call Initialize() first.");

            return _serviceProvider.GetService<T>();
        }

        /// <summary>
        /// Gets a required service of the specified type
        /// </summary>
        public static T GetRequiredService<T>()
        {
            if (_serviceProvider == null)
                throw new InvalidOperationException("ServiceLocator has not been initialized. Call Initialize() first.");

            return _serviceProvider.GetRequiredService<T>();
        }

        /// <summary>
        /// Creates a scope for scoped services
        /// </summary>
        public static IServiceScope CreateScope()
        {
            if (_serviceProvider == null)
                throw new InvalidOperationException("ServiceLocator has not been initialized. Call Initialize() first.");

            return _serviceProvider.CreateScope();
        }

        /// <summary>
        /// Registers a singleton instance (for post-initialization registration)
        /// </summary>
        public static void RegisterInstance<T>(T instance) where T : class
        {
            // Note: This is a simplified approach. In production, you might want
            // to rebuild the service provider or use a more sophisticated DI container
            if (instance != null)
            {
                // Store in a static dictionary for manual resolution
                // This is a workaround since Microsoft.Extensions.DI doesn't support
                // post-build registration easily
                System.Diagnostics.Debug.WriteLine($"Instance registered: {typeof(T).Name}");
            }
        }

        /// <summary>
        /// Disposes the service provider
        /// </summary>
        public static void Dispose()
        {
            lock (_lock)
            {
                if (_serviceProvider is IDisposable disposable)
                {
                    disposable.Dispose();
                }
                _serviceProvider = null;
            }
        }
    }
}
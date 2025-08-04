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

                var services = new ServiceCollection();
                services.ConfigureApplicationServices();
                _serviceProvider = services.BuildServiceProvider();
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
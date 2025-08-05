using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Extensions
{
    /// <summary>
    /// Extension methods for configuring dependency injection
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Configures all application services for dependency injection
        /// </summary>
        public static IServiceCollection ConfigureApplicationServices(this IServiceCollection services)
        {
            // Configure logging
            services.AddLogging(builder =>
            {
                builder.AddConsole();
                builder.AddDebug();
                builder.SetMinimumLevel(LogLevel.Information);
            });

            // Register messaging bus
            services.AddSingleton<IMessenger>(WeakReferenceMessenger.Default);

            // Register core services as singletons
            services.AddSingleton<ConfigurationService>();
            services.AddSingleton<ErrorHandlingService>(provider => ErrorHandlingService.Instance);
            services.AddSingleton<InputValidationService>();
            
            // Register business services
            services.AddSingleton<IProfileService, ProfileService>();
            services.AddSingleton<IDiscoveryService, DiscoveryService>();
            services.AddSingleton<IDataService, CsvDataService>();
            
            // Register utility services
            services.AddSingleton<IntelligentCacheService>();
            services.AddSingleton<MemoryOptimizationService>();
            services.AddSingleton<DebouncedSearchService>();
            services.AddSingleton<DataExportService>();
            services.AddSingleton<ThemeService>();
            
            // Register ViewModels as transient (new instance each time)
            services.AddTransient<MainViewModel>(provider => new MainViewModel(
                provider.GetService<ILogger<MainViewModel>>(),
                provider.GetService<IMessenger>(),
                provider.GetService<IDiscoveryService>(),
                provider.GetService<IProfileService>(),
                provider.GetService<IDataService>(),
                provider.GetService<DataVisualizationViewModel>(),
                provider.GetService<ThemeService>()
            ));
            services.AddTransient<DataVisualizationViewModel>();
            services.AddTransient<ProjectManagementViewModel>();
            
            // Register factories for ViewModels that need parameters
            services.AddTransient<Func<dynamic, string, UserDetailViewModel>>(provider =>
                (selectedUser, rawDataPath) => new UserDetailViewModel(selectedUser, rawDataPath));
            
            services.AddTransient<Func<string, string, string, bool, DiscoveryModuleViewModel>>(provider =>
                (moduleName, displayName, description, isEnabled) => 
                    new DiscoveryModuleViewModel(moduleName, displayName, description, isEnabled));

            return services;
        }
    }
}
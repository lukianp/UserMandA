using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Views;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite
{
    /// <summary>
    /// Simple test to demonstrate ApplicationsViewNew functionality
    /// </summary>
    public class TestApplicationsView
    {
        public static async Task RunTest()
        {
            try
            {
                Console.WriteLine("=== Testing ApplicationsViewNew ===");
                
                // Create dependencies
                var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
                var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
                var vmLogger = loggerFactory.CreateLogger<ApplicationsViewModel>();
                
                var csvService = new CsvDataServiceNew(csvLogger);
                var profileService = ProfileService.Instance;
                
                // Create ViewModel
                var viewModel = new ApplicationsViewModel(csvService, vmLogger, profileService);
                
                Console.WriteLine("✅ ApplicationsViewModel created successfully");
                Console.WriteLine($"   HasData: {viewModel.HasData}");
                Console.WriteLine($"   IsLoading: {viewModel.IsLoading}");
                Console.WriteLine($"   Applications.Count: {viewModel.Applications.Count}");
                Console.WriteLine($"   HeaderWarnings.Count: {viewModel.HeaderWarnings.Count}");
                
                // Test LoadAsync method
                Console.WriteLine("\n--- Testing LoadAsync ---");
                var loadTask = viewModel.LoadAsync();
                await loadTask;
                
                Console.WriteLine("✅ LoadAsync completed");
                Console.WriteLine($"   HasData: {viewModel.HasData}");
                Console.WriteLine($"   IsLoading: {viewModel.IsLoading}");
                Console.WriteLine($"   Applications.Count: {viewModel.Applications.Count}");
                Console.WriteLine($"   HeaderWarnings.Count: {viewModel.HeaderWarnings.Count}");
                Console.WriteLine($"   LastError: {viewModel.LastError ?? "None"}");
                
                // Display loaded applications
                if (viewModel.Applications.Count > 0)
                {
                    Console.WriteLine("\n--- Loaded Applications ---");
                    foreach (var app in viewModel.Applications)
                    {
                        Console.WriteLine($"   {app.Name} v{app.Version} by {app.Publisher}");
                    }
                }
                
                // Display header warnings (red banner content)
                if (viewModel.HeaderWarnings.Count > 0)
                {
                    Console.WriteLine("\n--- Header Warnings (Red Banners) ---");
                    foreach (var warning in viewModel.HeaderWarnings)
                    {
                        Console.WriteLine($"   ⚠ {warning}");
                    }
                }
                
                Console.WriteLine("\n=== ApplicationsViewNew Test Complete ===");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Test failed: {ex.Message}");
                Console.WriteLine($"   Stack trace: {ex.StackTrace}");
            }
        }
    }
}
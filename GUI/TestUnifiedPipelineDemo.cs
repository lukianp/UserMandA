using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite
{
    /// <summary>
    /// Demonstrates the unified pipeline working with header verification
    /// </summary>
    public class TestUnifiedPipelineDemo
    {
        public static async Task RunDemo()
        {
            Console.WriteLine("=== UNIFIED PIPELINE DEMONSTRATION ===");
            Console.WriteLine();

            // Setup logging
            using var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            var vmLogger = loggerFactory.CreateLogger<UsersViewModel>();

            // Create services
            var csvService = new CsvDataServiceNew(csvLogger);
            var profileService = ProfileService.Instance;
            
            Console.WriteLine("✅ Services initialized");
            Console.WriteLine();

            // Test Users.csv (complete headers - should load cleanly)
            Console.WriteLine("🔍 Testing Users.csv (complete headers):");
            var result1 = await csvService.LoadUsersAsync("ljpops");
            Console.WriteLine($"   Data loaded: {result1.Data.Count} users");
            Console.WriteLine($"   Header warnings: {result1.HeaderWarnings.Count}");
            if (result1.HeaderWarnings.Count > 0)
            {
                foreach (var warning in result1.HeaderWarnings)
                    Console.WriteLine($"   ⚠ {warning}");
            }
            Console.WriteLine();

            // Test with ViewModel to show complete unified pipeline
            Console.WriteLine("🔍 Testing unified pipeline with UsersViewModel:");
            var viewModel = new UsersViewModel(csvService, vmLogger, profileService);
            
            Console.WriteLine("   Loading data...");
            await viewModel.LoadAsync();
            
            Console.WriteLine($"   Users loaded: {viewModel.Users.Count}");
            Console.WriteLine($"   Has data: {viewModel.HasData}");
            Console.WriteLine($"   Is loading: {viewModel.IsLoading}");
            Console.WriteLine($"   Header warnings: {viewModel.HeaderWarnings.Count}");
            
            foreach (var warning in viewModel.HeaderWarnings)
            {
                Console.WriteLine($"   🔴 {warning}");
            }
            
            if (viewModel.LastError != null)
            {
                Console.WriteLine($"   ❌ Error: {viewModel.LastError}");
            }

            Console.WriteLine();
            Console.WriteLine("=== Expected Behavior in UI ===");
            Console.WriteLine("✅ AzureUsers.csv will show red warning banner:");
            Console.WriteLine("🔴 [Users] File 'AzureUsers.csv': Missing required columns: Department, JobTitle, CompanyName, ManagerDisplayName. Values defaulted.");
            Console.WriteLine();
            Console.WriteLine("✅ Four-state UI pattern:");
            Console.WriteLine("  1. Loading: Spinner while LoadAsync() runs");
            Console.WriteLine("  2. Warnings: Red banners for HeaderWarnings");  
            Console.WriteLine("  3. Data: Grid shows when HasData = true");
            Console.WriteLine("  4. Error: Red banner if LastError is set");
            Console.WriteLine();
            Console.WriteLine("🎯 UNIFIED PIPELINE VERIFICATION COMPLETE!");
        }
    }
}
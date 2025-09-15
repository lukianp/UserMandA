using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite
{
    public class TestRedBannersConsole
    {
#if DEBUG
        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== Testing Red Banner Functionality ===");

            // Create services
            var loggerFactory = LoggerFactory.Create(builder =>
                builder.AddConsole().SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Debug));

            var csvService = new CsvDataServiceNew(loggerFactory.CreateLogger<CsvDataServiceNew>());
            var profileService = new ProfileService();
            await profileService.SetCurrentProfileAsync("ljpops");

            Console.WriteLine("Services initialized...");

            // Test Users ViewNew
            await TestUsersView(csvService, loggerFactory, profileService);

            // Test Applications ViewNew
            await TestApplicationsView(csvService, loggerFactory, profileService);

            // Test Groups ViewNew
            await TestGroupsView(csvService, loggerFactory, profileService);

            Console.WriteLine("\n=== Test Complete ===");
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
#endif
        
        private static async Task TestUsersView(CsvDataServiceNew csvService, ILoggerFactory loggerFactory, ProfileService profileService)
        {
            Console.WriteLine("\n--- Testing UsersViewNew ---");
            
            var usersViewModel = new UsersViewModel(csvService, 
                loggerFactory.CreateLogger<UsersViewModel>(), profileService);
            
            await usersViewModel.LoadAsync();
            
            Console.WriteLine($"Users Count: {usersViewModel.Users.Count}");
            Console.WriteLine($"Header Warnings Count: {usersViewModel.HeaderWarnings.Count}");
            Console.WriteLine($"Has Data: {usersViewModel.HasData}");
            Console.WriteLine($"Last Error: {usersViewModel.LastError ?? "None"}");
            
            if (usersViewModel.HeaderWarnings.Count > 0)
            {
                Console.WriteLine("Header Warnings:");
                foreach (var warning in usersViewModel.HeaderWarnings)
                {
                    Console.WriteLine($"  - {warning}");
                }
            }
        }
        
        private static async Task TestApplicationsView(CsvDataServiceNew csvService, ILoggerFactory loggerFactory, ProfileService profileService)
        {
            Console.WriteLine("\n--- Testing ApplicationsViewNew ---");
            
            var applicationsViewModel = new ApplicationsViewModel(csvService, 
                loggerFactory.CreateLogger<ApplicationsViewModel>(), profileService);
            
            await applicationsViewModel.LoadAsync();
            
            Console.WriteLine($"Applications Count: {applicationsViewModel.Applications.Count}");
            Console.WriteLine($"Header Warnings Count: {applicationsViewModel.HeaderWarnings.Count}");
            Console.WriteLine($"Has Data: {applicationsViewModel.HasData}");
            Console.WriteLine($"Last Error: {applicationsViewModel.LastError ?? "None"}");
            
            if (applicationsViewModel.HeaderWarnings.Count > 0)
            {
                Console.WriteLine("Header Warnings:");
                foreach (var warning in applicationsViewModel.HeaderWarnings)
                {
                    Console.WriteLine($"  - {warning}");
                }
            }
        }
        
        private static async Task TestGroupsView(CsvDataServiceNew csvService, ILoggerFactory loggerFactory, ProfileService profileService)
        {
            Console.WriteLine("\n--- Testing GroupsViewNew ---");
            
            var groupsViewModel = new GroupsViewModel(csvService, 
                loggerFactory.CreateLogger<GroupsViewModel>(), profileService);
            
            await groupsViewModel.LoadAsync();
            
            Console.WriteLine($"Groups Count: {groupsViewModel.Groups.Count}");
            Console.WriteLine($"Header Warnings Count: {groupsViewModel.HeaderWarnings.Count}");
            Console.WriteLine($"Has Data: {groupsViewModel.HasData}");
            Console.WriteLine($"Last Error: {groupsViewModel.LastError ?? "None"}");
            
            if (groupsViewModel.HeaderWarnings.Count > 0)
            {
                Console.WriteLine("Header Warnings:");
                foreach (var warning in groupsViewModel.HeaderWarnings)
                {
                    Console.WriteLine($"  - {warning}");
                }
            }
        }
    }
}
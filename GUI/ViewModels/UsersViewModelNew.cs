using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for UsersView using the unified loading pipeline
    /// </summary>
    public class UsersViewModelNew : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        private ObservableCollection<UserData> _users = new();
        
        public ObservableCollection<UserData> Users
        {
            get => _users;
            set => SetProperty(ref _users, value);
        }

        public override bool HasData => Users?.Count > 0;

        public UsersViewModelNew(CsvDataServiceNew csvService, ILogger<UsersViewModelNew> logger, ProfileService profileService) 
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }

        public override async Task LoadAsync()
        {
            var sw = Stopwatch.StartNew();
            IsLoading = true;
            HasErrors = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                Logger?.LogDebug($"[{GetType().Name}] Load start");
                
                // Get current profile
                var profile = _profileService.CurrentProfile ?? "ljpops";
                
                // Load users with header verification
                var result = await _csvService.LoadUsersAsync(profile);
                
                // Add header warnings
                foreach (var warning in result.HeaderWarnings)
                {
                    HeaderWarnings.Add(warning);
                }
                
                // Update collection
                Users.Clear();
                foreach (var user in result.Data)
                {
                    Users.Add(user);
                }
                
                OnPropertyChanged(nameof(HasData));
                
                Logger?.LogInformation($"[{GetType().Name}] Load ok rows={Users.Count} warnings={HeaderWarnings.Count} ms={sw.ElapsedMilliseconds}");
            }
            catch (Exception ex)
            {
                LastError = $"Failed to load users: {ex.Message}";
                HasErrors = true;
                Logger?.LogError(ex, $"[{GetType().Name}] Load fail ex={ex}");
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}
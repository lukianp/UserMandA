using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using CommunityToolkit.Mvvm.Messaging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for UsersView using the unified loading pipeline
    /// </summary>
    public class UsersViewModel : BaseViewModel
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

        // Commands
        public ICommand ShowUserDetailCommand { get; private set; }

        public UsersViewModel(CsvDataServiceNew csvService, ILogger<UsersViewModel> logger, ProfileService profileService) 
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            ShowUserDetailCommand = new RelayCommand<UserData>(ShowUserDetail, user => user != null);
        }

        /// <summary>
        /// Show detailed user information in a new window
        /// </summary>
        private void ShowUserDetail(UserData user)
        {
            if (user == null) return;

            try
            {
                StructuredLogger?.LogDebug(LogSourceName, 
                    new { action = "show_user_detail", user_upn = user.UserPrincipalName }, 
                    "Opening user detail window");

                // Create LogicEngineService (TODO: This should be injected via DI)
                var logicEngineService = new LogicEngineService(
                    Microsoft.Extensions.Logging.Abstractions.NullLogger<LogicEngineService>.Instance);

                // Create UserDetailViewModel with the selected user
                var userDetailViewModel = new UserDetailViewModel(logicEngineService, 
                    Microsoft.Extensions.Logging.Abstractions.NullLogger<UserDetailViewModel>.Instance)
                {
                    SelectedUserIdentifier = user.UserPrincipalName ?? user.SamAccountName
                };

                // Create and show the UserDetailWindow
                var userDetailWindow = new Views.UserDetailWindow
                {
                    DataContext = userDetailViewModel,
                    Owner = System.Windows.Application.Current.MainWindow,
                    Title = $"User Details - {user.DisplayName}"
                };

                userDetailWindow.Show();

                _log?.LogInformation("Opened user detail window for {UserName} ({UPN})", user.DisplayName, user.UserPrincipalName);
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, 
                    new { action = "show_user_detail_error", user_upn = user.UserPrincipalName }, 
                    "Failed to open user detail window");
                
                _log?.LogError(ex, "Failed to open user detail window for {UserName}", user.DisplayName);
            }
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
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "users" }, "Users data loading started");
                
                // Get current profile
                var profile = _profileService.CurrentProfile ?? "ljpops";
                
                // Load users with header verification
                var result = await _csvService.LoadUsersAsync(profile);
                
                // Add header warnings
                foreach (var warning in result.HeaderWarnings)
                {
                    HeaderWarnings.Add(warning);
                }
                
                // Update collection on UI thread
                if (System.Windows.Application.Current?.Dispatcher != null)
                {
                    await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                    {
                        Users.Clear();
                        foreach (var user in result.Data)
                        {
                            Users.Add(user);
                        }
                    });
                }
                else
                {
                    // Fallback for cases where dispatcher is not available
                    Users.Clear();
                    foreach (var user in result.Data)
                    {
                        Users.Add(user);
                    }
                }
                
                OnPropertyChanged(nameof(HasData));
                
                StructuredLogger?.LogInfo(LogSourceName, new { 
                    action = "load_complete", 
                    component = "users",
                    rows = Users.Count,
                    warnings = HeaderWarnings.Count,
                    elapsed_ms = sw.ElapsedMilliseconds
                }, "Users data loaded successfully");
            }
            catch (Exception ex)
            {
                LastError = $"Failed to load users: {ex.Message}";
                HasErrors = true;
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "users" }, "Failed to load users data");
            }
            finally
            {
                IsLoading = false;
            }
        }
    }

}
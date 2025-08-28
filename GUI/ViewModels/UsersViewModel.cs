using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Input;
using System.Windows.Threading;
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
        private readonly ILogicEngineService _logicEngineService;
        private readonly CacheAwareFileWatcherService _fileWatcherService;
        private ObservableCollection<UserData> _users = new();
        private CancellationTokenSource _loadCancellationSource;
        
        public ObservableCollection<UserData> Users
        {
            get => _users;
            set => SetProperty(ref _users, value);
        }

        public override bool HasData => Users?.Count > 0;

        // Commands
        public ICommand ShowUserDetailCommand { get; private set; }

        public UsersViewModel(
            CsvDataServiceNew csvService, 
            ILogger<UsersViewModel> logger, 
            ProfileService profileService,
            ILogicEngineService logicEngineService = null,
            CacheAwareFileWatcherService fileWatcherService = null) 
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
            _logicEngineService = logicEngineService; // Optional for T-030 integration
            _fileWatcherService = fileWatcherService; // Optional for T-030 integration
            
            // T-030: Subscribe to data refresh events if file watcher is available
            if (_fileWatcherService != null)
            {
                _fileWatcherService.DataRefreshRequired += OnDataRefreshRequired;
            }
        }

        protected override void InitializeCommands()
        {
            base.InitializeCommands();
            ShowUserDetailCommand = new RelayCommand<UserData>(ShowUserDetail, user => user != null);
        }

        /// <summary>
        /// Show detailed user information in a new tab using TabsService
        /// </summary>
        private async void ShowUserDetail(UserData user)
        {
            if (user == null) return;

            try
            {
                StructuredLogger?.LogDebug(LogSourceName, 
                    new { action = "show_user_detail", user_upn = user.UserPrincipalName }, 
                    "Opening user detail tab");

                // Use TabsService from MainViewModel to open user detail tab
                if (MainViewModel.CurrentTabsService != null)
                {
                    var userIdentifier = user.UserPrincipalName ?? user.SamAccountName ?? user.DisplayName;
                    var success = await MainViewModel.CurrentTabsService.OpenUserDetailTabAsync(
                        userIdentifier, 
                        user.DisplayName ?? userIdentifier);

                    if (success)
                    {
                        _log?.LogInformation("Opened user detail tab for {UserName} ({UPN})", user.DisplayName, user.UserPrincipalName);
                    }
                    else
                    {
                        _log?.LogWarning("Failed to open user detail tab for {UserName}", user.DisplayName);
                        StatusMessage = "Failed to open user details";
                    }
                }
                else
                {
                    _log?.LogError("TabsService not available");
                    StatusMessage = "TabsService not available";
                }
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, 
                    new { action = "show_user_detail_error", user_upn = user.UserPrincipalName }, 
                    "Failed to open user detail tab");
                
                _log?.LogError(ex, "Failed to open user detail tab for {UserName}", user.DisplayName);
                StatusMessage = $"Failed to open user details: {ex.Message}";
            }
        }

        public override async Task LoadAsync()
        {
            // T-030: Cancel any existing load operation
            _loadCancellationSource?.Cancel();
            _loadCancellationSource = new CancellationTokenSource();
            var cancellationToken = _loadCancellationSource.Token;

            var sw = Stopwatch.StartNew();
            IsLoading = true;
            LoadingMessage = "Loading users data...";
            LoadingProgress = 0;
            HasErrors = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "users" }, "Users data loading started");
                
                // T-030: Update progress indicator
                LoadingMessage = "Checking cache and data sources...";
                LoadingProgress = 10;
                
                // Get current profile
                var profile = _profileService.CurrentProfile ?? "ljpops";
                
                cancellationToken.ThrowIfCancellationRequested();
                
                LoadingMessage = "Loading users from data sources...";
                LoadingProgress = 30;
                
                // T-030: Use LogicEngineService for cached/optimized data loading if available
                List<Models.UserDto> usersFromLogicEngine = null;
                if (_logicEngineService != null)
                {
                    usersFromLogicEngine = await _logicEngineService.GetUsersAsync(null, 0, int.MaxValue);
                }
                
                cancellationToken.ThrowIfCancellationRequested();
                
                LoadingMessage = "Processing user data...";
                LoadingProgress = 60;
                
                // Convert LogicEngine users to UserData if needed, or fallback to CSV service
                List<UserData> userData;
                if (usersFromLogicEngine?.Count > 0)
                {
                    // Convert from LogicEngine format to UserData format
                    userData = usersFromLogicEngine.Select(u => ConvertToUserData(u)).ToList();
                    StructuredLogger?.LogDebug(LogSourceName, new { source = "LogicEngine", count = userData.Count }, "Users loaded from cached LogicEngine");
                }
                else
                {
                    // Fallback to CSV service
                    LoadingMessage = "Loading from CSV files...";
                    var result = await _csvService.LoadUsersAsync(profile);
                    userData = result.Data;
                    
                    // Add header warnings
                    foreach (var warning in result.HeaderWarnings)
                    {
                        HeaderWarnings.Add(warning);
                    }
                    StructuredLogger?.LogDebug(LogSourceName, new { source = "CsvService", count = userData.Count }, "Users loaded from CSV fallback");
                }
                
                cancellationToken.ThrowIfCancellationRequested();
                
                LoadingMessage = "Updating user interface...";
                LoadingProgress = 80;
                
                // T-030: Update collection on UI thread with batch updates for better performance
                if (System.Windows.Application.Current?.Dispatcher != null)
                {
                    await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                    {
                        Users.Clear();
                        
                        // Batch add for better performance with large datasets
                        foreach (var user in userData)
                        {
                            Users.Add(user);
                        }
                    }, DispatcherPriority.Background, cancellationToken);
                }
                else
                {
                    Users.Clear();
                    foreach (var user in userData)
                    {
                        Users.Add(user);
                    }
                }
                
                LoadingProgress = 100;
                OnPropertyChanged(nameof(HasData));
                
                StructuredLogger?.LogInfo(LogSourceName, new { 
                    action = "load_complete", 
                    component = "users",
                    rows = Users.Count,
                    warnings = HeaderWarnings.Count,
                    elapsed_ms = sw.ElapsedMilliseconds,
                    cached = usersFromLogicEngine?.Count > 0
                }, "Users data loaded successfully");
            }
            catch (OperationCanceledException)
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_cancelled", component = "users" }, "Users data loading cancelled");
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
                LoadingProgress = 0;
                LoadingMessage = "Loading...";
            }
        }
        
        /// <summary>
        /// T-030: Convert LogicEngine UserDto to UserData format
        /// </summary>
        private UserData ConvertToUserData(Models.UserDto logicUser)
        {
            return new UserData(
                DisplayName: logicUser.DisplayName,
                UserPrincipalName: logicUser.UPN,
                Mail: logicUser.Mail,
                Department: logicUser.Dept, // UserDto uses Dept, not Department
                JobTitle: null, // UserDto doesn't have JobTitle
                AccountEnabled: logicUser.Enabled, // UserDto uses Enabled, not IsEnabled
                SamAccountName: logicUser.Sam,
                CompanyName: null, // UserDto doesn't have Company
                ManagerDisplayName: logicUser.Manager, // This maps to ManagerSid
                CreatedDateTime: logicUser.DiscoveryTimestamp,
                UserSource: "LogicEngine"
            );
        }
        
        /// <summary>
        /// T-030: Handle data refresh events from file watcher
        /// </summary>
        private async void OnDataRefreshRequired(object sender, string dataType)
        {
            if (dataType == "Users" && !IsLoading)
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "auto_refresh", trigger = "file_change" }, "Auto-refreshing users data due to file changes");
                StatusMessage = "Data files changed - refreshing...";
                
                try
                {
                    await LoadAsync();
                    StatusMessage = "Data refreshed successfully";
                }
                catch (Exception ex)
                {
                    StatusMessage = $"Auto-refresh failed: {ex.Message}";
                    StructuredLogger?.LogError(LogSourceName, ex, new { action = "auto_refresh_fail" }, "Auto-refresh failed");
                }
            }
        }

        /// <summary>
        /// T-030: Override Dispose to clean up cancellation tokens and event subscriptions
        /// </summary>
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _loadCancellationSource?.Cancel();
                _loadCancellationSource?.Dispose();
                
                if (_fileWatcherService != null)
                {
                    _fileWatcherService.DataRefreshRequired -= OnDataRefreshRequired;
                }
            }
            base.Dispose(disposing);
        }
    }

}
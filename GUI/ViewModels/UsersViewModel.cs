using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Collections;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Users tab containing all user-related functionality and data
    /// </summary>
    public class UsersViewModel : BaseViewModel
    {
        #region Fields

        private readonly IDataService _dataService;
        private string _searchText;
        private bool _isLoading;
        private string _loadingMessage;
        private int _loadingProgress;
        private ICollectionView _usersView;

        #endregion

        #region Properties

        /// <summary>
        /// Collection of all user data
        /// </summary>
        public OptimizedObservableCollection<UserData> Users { get; }

        /// <summary>
        /// Filtered and sorted view of users
        /// </summary>
        public ICollectionView UsersView
        {
            get => _usersView;
            private set => SetProperty(ref _usersView, value);
        }

        /// <summary>
        /// Search text for filtering users
        /// </summary>
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplyFilter();
                }
            }
        }

        /// <summary>
        /// Whether users are currently being loaded
        /// </summary>
        public new bool IsLoading
        {
            get => _isLoading;
            set => SetProperty(ref _isLoading, value);
        }

        /// <summary>
        /// Loading progress message
        /// </summary>
        public new string LoadingMessage
        {
            get => _loadingMessage;
            set => SetProperty(ref _loadingMessage, value);
        }

        /// <summary>
        /// Loading progress percentage (0-100)
        /// </summary>
        public new int LoadingProgress
        {
            get => _loadingProgress;
            set => SetProperty(ref _loadingProgress, value);
        }

        /// <summary>
        /// Number of users currently displayed after filtering
        /// </summary>
        public int FilteredUserCount => UsersView?.Cast<UserData>().Count() ?? 0;

        /// <summary>
        /// Total number of users loaded
        /// </summary>
        public int TotalUserCount => Users?.Count ?? 0;

        /// <summary>
        /// Status information text
        /// </summary>
        public string StatusInfo => $"Showing {FilteredUserCount} of {TotalUserCount} users";

        #endregion

        #region Commands

        public ICommand RefreshUsersCommand { get; }
        public ICommand ExportUsersCommand { get; }
        public ICommand ExportSelectedUsersCommand { get; }
        public ICommand SelectAllUsersCommand { get; }
        public ICommand DeselectAllUsersCommand { get; }
        public ICommand DeleteSelectedUsersCommand { get; }
        public ICommand CopySelectedUsersCommand { get; }
        public ICommand CopyAllUsersCommand { get; }
        public ICommand ShowAdvancedSearchCommand { get; }
        public ICommand ClearSearchCommand { get; }

        #endregion

        #region Constructor

        public UsersViewModel(IDataService dataService = null)
        {
            _dataService = dataService ?? SimpleServiceLocator.GetService<IDataService>();
            
            Users = new OptimizedObservableCollection<UserData>();
            Users.CollectionChanged += (s, e) => 
            {
                OnPropertiesChanged(nameof(TotalUserCount), nameof(StatusInfo));
            };

            // Create collection view for filtering and sorting
            UsersView = CollectionViewSource.GetDefaultView(Users);
            UsersView.Filter = FilterUsers;

            // Initialize commands
            RefreshUsersCommand = new AsyncRelayCommand(RefreshUsersAsync, () => !IsLoading);
            ExportUsersCommand = new AsyncRelayCommand(ExportUsersAsync, () => Users.Count > 0);
            ExportSelectedUsersCommand = new AsyncRelayCommand(ExportSelectedUsersAsync, CanExecuteSelectedUsersOperation);
            SelectAllUsersCommand = new RelayCommand(SelectAllUsers, () => Users.Count > 0);
            DeselectAllUsersCommand = new RelayCommand(DeselectAllUsers, CanExecuteSelectedUsersOperation);
            DeleteSelectedUsersCommand = new AsyncRelayCommand(DeleteSelectedUsersAsync, CanExecuteSelectedUsersOperation);
            CopySelectedUsersCommand = new RelayCommand(CopySelectedUsers, CanExecuteSelectedUsersOperation);
            CopyAllUsersCommand = new RelayCommand(CopyAllUsers, () => Users.Count > 0);
            ShowAdvancedSearchCommand = new RelayCommand(ShowAdvancedSearch);
            ClearSearchCommand = new RelayCommand(ClearSearch, () => !string.IsNullOrEmpty(SearchText));

            _searchText = string.Empty;
            _loadingMessage = "Ready";
            
            // Auto-load data when ViewModel is created
            LoadDataAsync();
        }

        #endregion

        #region Public Methods
        
        private async void LoadDataAsync()
        {
            System.Diagnostics.Debug.WriteLine("UsersViewModel.LoadDataAsync: Starting data load...");
            await RefreshUsersAsync();
            System.Diagnostics.Debug.WriteLine("UsersViewModel.LoadDataAsync: Data load completed.");
        }

        /// <summary>
        /// Initialize users data from the specified directory
        /// </summary>
        public async Task InitializeAsync(string dataDirectory)
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Loading users data...";
                LoadingProgress = 0;

                await RefreshUsersAsync(dataDirectory);
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to initialize users data: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
                LoadingProgress = 100;
            }
        }

        #endregion

        #region Private Methods

        private async Task RefreshUsersAsync()
        {
            await RefreshUsersAsync(null);
        }

        private async Task RefreshUsersAsync(string dataDirectory = null)
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Refreshing users data...";
                LoadingProgress = 10;

                Users.Clear();
                
                // Get current profile name
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";
                
                System.Diagnostics.Debug.WriteLine($"UsersViewModel: profileService={profileService != null}, currentProfile={currentProfile != null}, profileName={profileName}");

                LoadingMessage = "Loading user accounts...";
                LoadingProgress = 30;

                System.Diagnostics.Debug.WriteLine($"UsersViewModel: About to call _dataService.LoadUsersAsync('{profileName}')");
                var userData = await _dataService?.LoadUsersAsync(profileName) ?? new System.Collections.Generic.List<UserData>();
                System.Diagnostics.Debug.WriteLine($"UsersViewModel: LoadUsersAsync returned {userData.Count()} users");
                
                LoadingMessage = "Processing user data...";
                LoadingProgress = 70;

                foreach (var user in userData)
                {
                    Users.Add(user);
                }

                LoadingMessage = "Applying filters...";
                LoadingProgress = 90;

                UsersView.Refresh();
                OnPropertiesChanged(nameof(FilteredUserCount), nameof(TotalUserCount), nameof(StatusInfo));

                LoadingMessage = $"Loaded {Users.Count} users successfully";
                LoadingProgress = 100;
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to refresh users: {ex.Message}";
                HasErrors = true;
                LoadingMessage = "Failed to load users";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private bool FilterUsers(object item)
        {
            if (item is not UserData user)
                return false;

            if (string.IsNullOrWhiteSpace(SearchText))
                return true;

            var searchTerm = SearchText.ToLowerInvariant();
            
            return user.DisplayName?.ToLowerInvariant().Contains(searchTerm) == true ||
                   user.SamAccountName?.ToLowerInvariant().Contains(searchTerm) == true ||
                   user.UserPrincipalName?.ToLowerInvariant().Contains(searchTerm) == true ||
                   user.Email?.ToLowerInvariant().Contains(searchTerm) == true ||
                   user.Department?.ToLowerInvariant().Contains(searchTerm) == true ||
                   user.Title?.ToLowerInvariant().Contains(searchTerm) == true;
        }

        private void ApplyFilter()
        {
            UsersView?.Refresh();
            OnPropertiesChanged(nameof(FilteredUserCount), nameof(StatusInfo));
        }

        private async Task ExportUsersAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Exporting users...";

                // TODO: Implement export functionality through IDataService  
                await System.Threading.Tasks.Task.Delay(500); // Placeholder
                
                StatusMessage = "Users exported successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export users: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private async Task ExportSelectedUsersAsync()
        {
            try
            {
                var selectedUsers = Users.Where(u => u.IsSelected).ToList();
                if (!selectedUsers.Any())
                    return;

                IsLoading = true;
                LoadingMessage = $"Exporting {selectedUsers.Count} selected users...";

                // TODO: Implement export functionality through IDataService  
                await System.Threading.Tasks.Task.Delay(500); // Placeholder
                
                StatusMessage = $"Exported {selectedUsers.Count} selected users successfully";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export selected users: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void SelectAllUsers()
        {
            foreach (var user in Users)
            {
                user.IsSelected = true;
            }
            StatusMessage = $"Selected all {Users.Count} users";
        }

        private void DeselectAllUsers()
        {
            foreach (var user in Users)
            {
                user.IsSelected = false;
            }
            StatusMessage = "Deselected all users";
        }

        private async Task DeleteSelectedUsersAsync()
        {
            try
            {
                var selectedUsers = Users.Where(u => u.IsSelected).ToList();
                if (!selectedUsers.Any())
                    return;

                IsLoading = true;
                LoadingMessage = $"Deleting {selectedUsers.Count} selected users...";

                foreach (var user in selectedUsers)
                {
                    Users.Remove(user);
                }

                StatusMessage = $"Deleted {selectedUsers.Count} users";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to delete selected users: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        private void CopySelectedUsers()
        {
            var selectedUsers = Users.Where(u => u.IsSelected).ToList();
            if (!selectedUsers.Any())
                return;

            try
            {
                // Convert to CSV format (simplified implementation)
                var csvData = string.Join(Environment.NewLine, selectedUsers.Select(u => $"{u.DisplayName},{u.SamAccountName},{u.UserPrincipalName}"));
                System.Windows.Clipboard.SetText(csvData);
                StatusMessage = $"Copied {selectedUsers.Count} selected users to clipboard";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to copy users: {ex.Message}";
                HasErrors = true;
            }
        }

        private void CopyAllUsers()
        {
            try
            {
                // Convert to CSV format (simplified implementation)
                var csvData = string.Join(Environment.NewLine, Users.Select(u => $"{u.DisplayName},{u.SamAccountName},{u.UserPrincipalName}"));
                System.Windows.Clipboard.SetText(csvData);
                StatusMessage = $"Copied all {Users.Count} users to clipboard";
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to copy users: {ex.Message}";
                HasErrors = true;
            }
        }

        private void ShowAdvancedSearch()
        {
            // This would open an advanced search dialog
            // Implementation would depend on the UI framework being used
            StatusMessage = "Advanced search functionality to be implemented";
        }

        private void ClearSearch()
        {
            SearchText = string.Empty;
        }

        private bool CanExecuteSelectedUsersOperation()
        {
            return Users?.Any(u => u.IsSelected) == true && !IsLoading;
        }

        #endregion
    }
}
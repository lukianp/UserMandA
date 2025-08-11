using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the Computer Detail pane showing detailed computer information and related assets
    /// </summary>
    public class ComputerDetailViewModel : BaseViewModel
    {
        #region Fields

        private readonly InfrastructureData _computer;
        private readonly CsvDataService _csvDataService;

        #endregion

        #region Properties

        /// <summary>
        /// The selected computer device
        /// </summary>
        public InfrastructureData Computer => _computer;

        /// <summary>
        /// Users assigned to this computer
        /// </summary>
        public ObservableCollection<UserData> AssignedUsers { get; }

        /// <summary>
        /// Applications installed on this computer
        /// </summary>
        public ObservableCollection<ApplicationData> InstalledApplications { get; }

        /// <summary>
        /// Device groups this computer belongs to
        /// </summary>
        public ObservableCollection<GroupData> DeviceGroups { get; }

        /// <summary>
        /// GPOs applied to this computer (using GroupData for policy information)
        /// </summary>
        public ObservableCollection<GroupData> AppliedGpos { get; }

        /// <summary>
        /// Child assets (e.g., VMs hosted on this server)
        /// </summary>
        public ObservableCollection<InfrastructureData> ChildAssets { get; }

        /// <summary>
        /// Whether assigned users data is available
        /// </summary>
        public bool HasAssignedUsers => AssignedUsers?.Count > 0;

        /// <summary>
        /// Whether installed applications data is available
        /// </summary>
        public bool HasInstalledApplications => InstalledApplications?.Count > 0;

        /// <summary>
        /// Whether device groups data is available
        /// </summary>
        public bool HasDeviceGroups => DeviceGroups?.Count > 0;

        /// <summary>
        /// Whether applied GPOs data is available
        /// </summary>
        public bool HasAppliedGpos => AppliedGpos?.Count > 0;

        /// <summary>
        /// Whether child assets data is available
        /// </summary>
        public bool HasChildAssets => ChildAssets?.Count > 0;

        #endregion

        #region Commands

        public ICommand CloseCommand { get; }
        public ICommand RefreshCommand { get; }
        public ICommand ExportCommand { get; }

        #endregion

        #region Events

        /// <summary>
        /// Event raised when the view requests to be closed
        /// </summary>
        public event Action CloseRequested;

        #endregion

        #region Constructor

        public ComputerDetailViewModel(InfrastructureData computer, CsvDataService csvDataService)
        {
            _computer = computer ?? throw new ArgumentNullException(nameof(computer));
            _csvDataService = csvDataService ?? throw new ArgumentNullException(nameof(csvDataService));

            // Initialize collections
            AssignedUsers = new ObservableCollection<UserData>();
            InstalledApplications = new ObservableCollection<ApplicationData>();
            DeviceGroups = new ObservableCollection<GroupData>();
            AppliedGpos = new ObservableCollection<GroupData>();
            ChildAssets = new ObservableCollection<InfrastructureData>();

            // Initialize commands
            CloseCommand = new RelayCommand(Close);
            RefreshCommand = new AsyncRelayCommand(LoadAsync, () => !IsLoading);
            ExportCommand = new AsyncRelayCommand(ExportAsync, () => !IsLoading);

            // Load related data asynchronously
            _ = LoadAsync();
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Loads all related data for the computer asynchronously
        /// </summary>
        public async Task LoadAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Loading computer details...";
                HasErrors = false;
                ErrorMessage = string.Empty;

                // Get current profile name
                var profileService = SimpleServiceLocator.GetService<IProfileService>();
                var currentProfile = await profileService?.GetCurrentProfileAsync();
                var profileName = currentProfile?.CompanyName ?? "ljpops";

                // Load all related data in parallel for better performance
                var tasks = new[]
                {
                    LoadAssignedUsersAsync(profileName),
                    LoadInstalledApplicationsAsync(profileName),
                    LoadDeviceGroupsAsync(profileName),
                    LoadAppliedGposAsync(profileName),
                    LoadChildAssetsAsync(profileName)
                };

                await Task.WhenAll(tasks);
                LoadingMessage = "Computer details loaded successfully";
            }
            catch (Exception ex)
            {
                HasErrors = true;
                ErrorMessage = $"Failed to load computer details: {ex.Message}";
                System.Diagnostics.Debug.WriteLine($"ComputerDetailViewModel.LoadAsync error: {ex}");
            }
            finally
            {
                IsLoading = false;
                OnPropertiesChanged(
                    nameof(HasAssignedUsers), 
                    nameof(HasInstalledApplications),
                    nameof(HasDeviceGroups),
                    nameof(HasAppliedGpos),
                    nameof(HasChildAssets)
                );
            }
        }

        #endregion

        #region Private Methods

        /// <summary>
        /// Finds users assigned to this computer
        /// </summary>
        private async Task LoadAssignedUsersAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading assigned users...";
                
                var users = await _csvDataService.LoadUsersAsync(profileName);
                var assignedUsers = new List<UserData>();

                foreach (var user in users)
                {
                    // Try to match users to this computer by various fields
                    var isAssigned = IsUserAssignedToComputer(user, _computer);
                    if (isAssigned)
                    {
                        assignedUsers.Add(user);
                    }
                }

                // Update UI on dispatcher thread
                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    AssignedUsers.Clear();
                    foreach (var user in assignedUsers)
                    {
                        AssignedUsers.Add(user);
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"LoadAssignedUsersAsync error: {ex.Message}");
            }
        }

        /// <summary>
        /// Finds applications installed on this computer
        /// </summary>
        private async Task LoadInstalledApplicationsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading installed applications...";
                
                var applications = await _csvDataService.LoadApplicationsAsync(profileName);
                var installedApps = new List<ApplicationData>();

                foreach (var app in applications)
                {
                    var isInstalled = IsApplicationInstalledOnComputer(app, _computer);
                    if (isInstalled)
                    {
                        installedApps.Add(app);
                    }
                }

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    InstalledApplications.Clear();
                    foreach (var app in installedApps)
                    {
                        InstalledApplications.Add(app);
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"LoadInstalledApplicationsAsync error: {ex.Message}");
            }
        }

        /// <summary>
        /// Finds device groups this computer belongs to
        /// </summary>
        private async Task LoadDeviceGroupsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading device groups...";
                
                var groups = await _csvDataService.LoadGroupsAsync(profileName);
                var deviceGroups = new List<GroupData>();

                foreach (var group in groups)
                {
                    var isMember = IsComputerInGroup(group, _computer);
                    if (isMember)
                    {
                        deviceGroups.Add(group);
                    }
                }

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    DeviceGroups.Clear();
                    foreach (var group in deviceGroups)
                    {
                        DeviceGroups.Add(group);
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"LoadDeviceGroupsAsync error: {ex.Message}");
            }
        }

        /// <summary>
        /// Finds GPOs applied to this computer
        /// </summary>
        private async Task LoadAppliedGposAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading applied GPOs...";
                
                // Try to load GPO data if available (using GroupData for policy groups)
                var groups = await _csvDataService.LoadGroupsAsync(profileName);
                var appliedGpos = new List<GroupData>();

                foreach (var group in groups)
                {
                    // Only include policy-type groups
                    if (group.Type?.Contains("Policy", StringComparison.OrdinalIgnoreCase) == true ||
                        group.Type?.Contains("GPO", StringComparison.OrdinalIgnoreCase) == true)
                    {
                        var isApplied = IsGpoAppliedToComputer(group, _computer);
                        if (isApplied)
                        {
                            appliedGpos.Add(group);
                        }
                    }
                }

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    AppliedGpos.Clear();
                    foreach (var gpo in appliedGpos)
                    {
                        AppliedGpos.Add(gpo);
                    }
                });
            }
            catch (Exception ex)
            {
                // GPO data might not be available, which is okay
                System.Diagnostics.Debug.WriteLine($"LoadAppliedGposAsync error (expected if no GPO data): {ex.Message}");
            }
        }

        /// <summary>
        /// Finds child assets hosted on this computer
        /// </summary>
        private async Task LoadChildAssetsAsync(string profileName)
        {
            try
            {
                LoadingMessage = "Loading child assets...";
                
                // Only look for child assets if this is a host type (server, etc.)
                if (!IsHostType(_computer.Type))
                {
                    return;
                }

                var infrastructure = await _csvDataService.LoadInfrastructureAsync(profileName);
                var childAssets = new List<InfrastructureData>();

                foreach (var asset in infrastructure)
                {
                    var isChild = IsChildAsset(asset, _computer);
                    if (isChild)
                    {
                        childAssets.Add(asset);
                    }
                }

                await System.Windows.Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    ChildAssets.Clear();
                    foreach (var asset in childAssets)
                    {
                        ChildAssets.Add(asset);
                    }
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"LoadChildAssetsAsync error: {ex.Message}");
            }
        }

        #region Helper Methods for Data Matching

        /// <summary>
        /// Determines if a user is assigned to the computer
        /// </summary>
        private bool IsUserAssignedToComputer(UserData user, InfrastructureData computer)
        {
            if (user == null || computer == null) return false;

            // Try to match by various fields that might link a user to a device
            // This depends on the actual CSV structure and available fields
            
            // Check if computer name matches user domain or company (simplified matching)
            var computerNameMatch = !string.IsNullOrEmpty(computer.Name) && (
                user.Domain?.Equals(computer.Domain, StringComparison.OrdinalIgnoreCase) == true ||
                user.CompanyName?.Equals(computer.Name, StringComparison.OrdinalIgnoreCase) == true
            );

            // For now, we'll use simple domain-based matching since detailed device assignment data might not be available
            var domainMatch = !string.IsNullOrEmpty(computer.Domain) && 
                             user.Domain?.Equals(computer.Domain, StringComparison.OrdinalIgnoreCase) == true;

            return computerNameMatch || domainMatch;
        }

        /// <summary>
        /// Determines if an application is installed on the computer
        /// </summary>
        private bool IsApplicationInstalledOnComputer(ApplicationData app, InfrastructureData computer)
        {
            if (app == null || computer == null) return false;

            // Check if the computer appears in the application's install location path
            var deviceMatch = !string.IsNullOrEmpty(computer.Name) && (
                app.InstallLocation?.Contains(computer.Name, StringComparison.OrdinalIgnoreCase) == true ||
                app.Publisher?.Equals(computer.Manufacturer, StringComparison.OrdinalIgnoreCase) == true
            );

            return deviceMatch;
        }

        /// <summary>
        /// Determines if the computer is a member of the group
        /// </summary>
        private bool IsComputerInGroup(GroupData group, InfrastructureData computer)
        {
            if (group == null || computer == null) return false;

            // Check if the computer matches the group by domain (simplified matching)
            var memberMatch = !string.IsNullOrEmpty(computer.Name) && (
                group.Domain?.Equals(computer.Domain, StringComparison.OrdinalIgnoreCase) == true ||
                group.Description?.Contains(computer.Name, StringComparison.OrdinalIgnoreCase) == true
            );

            return memberMatch;
        }

        /// <summary>
        /// Determines if a GPO is applied to the computer
        /// </summary>
        private bool IsGpoAppliedToComputer(GroupData gpo, InfrastructureData computer)
        {
            if (gpo == null || computer == null) return false;

            // Check if the computer matches the GPO by domain (simplified matching for policy groups)
            var deviceMatch = !string.IsNullOrEmpty(computer.Name) && (
                gpo.Domain?.Equals(computer.Domain, StringComparison.OrdinalIgnoreCase) == true ||
                gpo.Description?.Contains(computer.Name, StringComparison.OrdinalIgnoreCase) == true
            );

            return deviceMatch;
        }

        /// <summary>
        /// Determines if an asset is a child of this computer
        /// </summary>
        private bool IsChildAsset(InfrastructureData asset, InfrastructureData parent)
        {
            if (asset == null || parent == null || asset.Id == parent.Id) return false;

            // Check if the asset might be hosted by this computer (simplified matching)
            var parentMatch = !string.IsNullOrEmpty(parent.Name) && (
                asset.Description?.Contains(parent.Name, StringComparison.OrdinalIgnoreCase) == true ||
                asset.Domain?.Equals(parent.Domain, StringComparison.OrdinalIgnoreCase) == true
            );

            return parentMatch;
        }

        /// <summary>
        /// Determines if the computer type can host other assets
        /// </summary>
        private bool IsHostType(string computerType)
        {
            if (string.IsNullOrEmpty(computerType)) return false;

            var hostTypes = new[] { "Physical Server", "Server", "VMware Host", "Hyper-V Host", "Host" };
            return hostTypes.Any(ht => computerType.Contains(ht, StringComparison.OrdinalIgnoreCase));
        }

        #endregion

        private void Close()
        {
            CloseRequested?.Invoke();
        }

        private async Task ExportAsync()
        {
            try
            {
                IsLoading = true;
                LoadingMessage = "Exporting computer details...";

                // Create export data combining all related information
                var exportData = new List<string>
                {
                    "=== COMPUTER DETAILS ===",
                    $"Name: {Computer.Name}",
                    $"Type: {Computer.Type}",
                    $"Operating System: {Computer.OperatingSystem}",
                    $"Version: {Computer.Version}",
                    $"IP Address: {Computer.IPAddress}",
                    $"Status: {Computer.Status}",
                    $"Location: {Computer.Location}",
                    $"Manufacturer: {Computer.Manufacturer}",
                    $"Model: {Computer.Model}",
                    $"Last Seen: {Computer.LastSeen}",
                    "",
                    "=== ASSIGNED USERS ===",
                };

                foreach (var user in AssignedUsers)
                {
                    exportData.Add($"- {user.DisplayName} ({user.UserPrincipalName})");
                }

                exportData.Add("");
                exportData.Add("=== INSTALLED APPLICATIONS ===");
                foreach (var app in InstalledApplications)
                {
                    exportData.Add($"- {app.Name} v{app.Version} ({app.Publisher})");
                }

                exportData.Add("");
                exportData.Add("=== DEVICE GROUPS ===");
                foreach (var group in DeviceGroups)
                {
                    exportData.Add($"- {group.Name} ({group.Type})");
                }

                if (AppliedGpos.Any())
                {
                    exportData.Add("");
                    exportData.Add("=== APPLIED POLICIES ===");
                    foreach (var gpo in AppliedGpos)
                    {
                        exportData.Add($"- {gpo.Name} ({gpo.Type})");
                    }
                }

                if (ChildAssets.Any())
                {
                    exportData.Add("");
                    exportData.Add("=== CHILD ASSETS ===");
                    foreach (var child in ChildAssets)
                    {
                        exportData.Add($"- {child.Name} ({child.Type})");
                    }
                }

                var saveDialog = new Microsoft.Win32.SaveFileDialog
                {
                    Title = "Export Computer Details",
                    Filter = "Text files (*.txt)|*.txt|All files (*.*)|*.*",
                    DefaultExt = "txt",
                    FileName = $"{Computer.Name}_Details_{DateTime.Now:yyyyMMdd_HHmmss}.txt"
                };

                if (saveDialog.ShowDialog() == true)
                {
                    await System.IO.File.WriteAllLinesAsync(saveDialog.FileName, exportData);
                    StatusMessage = $"Computer details exported to {System.IO.Path.GetFileName(saveDialog.FileName)}";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Failed to export computer details: {ex.Message}";
                HasErrors = true;
            }
            finally
            {
                IsLoading = false;
                LoadingMessage = "Ready";
            }
        }

        #endregion
    }
}
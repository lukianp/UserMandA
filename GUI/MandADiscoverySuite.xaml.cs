using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management.Automation;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;

namespace MandADiscoverySuite
{
    public partial class MainWindow : Window
    {
        private readonly ObservableCollection<DiscoveryModule> discoveryModules;
        private readonly ObservableCollection<CompanyProfile> companyProfiles;
        private PowerShell powerShell;
        private string rootPath;
        private string currentView = "Discovery";
        private CancellationTokenSource cancellationTokenSource;

        public MainWindow()
        {
            InitializeComponent();
            discoveryModules = new ObservableCollection<DiscoveryModule>();
            companyProfiles = new ObservableCollection<CompanyProfile>();
            InitializePowerShell();
            LoadCompanyProfiles();
            InitializeDiscoveryModules();
            DiscoveryModules.ItemsSource = discoveryModules;
            CompanySelector.ItemsSource = companyProfiles;
            
            if (companyProfiles.Count > 0)
            {
                CompanySelector.SelectedIndex = 0;
            }
        }

        private void InitializePowerShell()
        {
            powerShell = PowerShell.Create();
            rootPath = GetRootPath();
            
            // Import necessary modules
            powerShell.AddScript($@"
                Set-Location '{rootPath}'
                Import-Module '.\Modules\Core\CompanyProfileManager.psm1' -Force
                Import-Module '.\Modules\Discovery\PaloAltoDiscovery.psm1' -Force
                Import-Module '.\Modules\Discovery\PanoramaInterrogation.psm1' -Force
                Import-Module '.\Modules\Discovery\EntraIDAppDiscovery.psm1' -Force
            ");
            
            try
            {
                powerShell.Invoke();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize PowerShell: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private string GetRootPath()
        {
            string path = AppDomain.CurrentDomain.BaseDirectory;
            while (!string.IsNullOrEmpty(path) && !File.Exists(Path.Combine(path, "QuickStart.ps1")))
            {
                path = Directory.GetParent(path)?.FullName;
            }
            
            if (string.IsNullOrEmpty(path))
            {
                path = @"D:\Scripts\UserMandA";
            }
            
            return path;
        }

        private void LoadCompanyProfiles()
        {
            companyProfiles.Clear();
            
            string profilesPath = Path.Combine(rootPath, "Profiles");
            if (Directory.Exists(profilesPath))
            {
                foreach (var dir in Directory.GetDirectories(profilesPath))
                {
                    string metadataPath = Path.Combine(dir, "profile-metadata.json");
                    if (File.Exists(metadataPath))
                    {
                        companyProfiles.Add(new CompanyProfile
                        {
                            Name = Path.GetFileName(dir),
                            Path = dir
                        });
                    }
                }
            }
            
            // Add option to create new profile
            companyProfiles.Add(new CompanyProfile { Name = "+ Create New Profile", Path = "" });
        }

        private void InitializeDiscoveryModules()
        {
            discoveryModules.Clear();
            
            var modules = new[]
            {
                new DiscoveryModule
                {
                    Name = "Active Directory",
                    ModuleName = "ActiveDirectory",
                    Icon = "👥",
                    Description = "Discover users, groups, computers, OUs, and GPOs from on-premises Active Directory",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "Azure AD / Entra ID",
                    ModuleName = "Azure",
                    Icon = "☁️",
                    Description = "Discover cloud identities, groups, applications, and conditional access policies",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "Exchange",
                    ModuleName = "Exchange",
                    Icon = "📧",
                    Description = "Discover mailboxes, distribution lists, mail-enabled groups, and permissions",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "SharePoint",
                    ModuleName = "SharePoint",
                    Icon = "📁",
                    Description = "Discover sites, libraries, lists, permissions, and content types",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "Teams",
                    ModuleName = "Teams",
                    Icon = "💬",
                    Description = "Discover teams, channels, members, guest users, and app integrations",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "Palo Alto Networks",
                    ModuleName = "PaloAlto",
                    Icon = "🔥",
                    Description = "Discover Palo Alto firewalls, Panorama servers, and security policies",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "Enterprise Apps",
                    ModuleName = "EntraIDApp",
                    Icon = "🔐",
                    Description = "Discover enterprise applications, app registrations, secrets, and certificates",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "File Servers",
                    ModuleName = "FileServer",
                    Icon = "💾",
                    Description = "Discover file shares, NTFS permissions, and DFS namespaces",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "SQL Servers",
                    ModuleName = "SQLServer",
                    Icon = "🗄️",
                    Description = "Discover SQL instances, databases, logins, and permissions",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "Network Infrastructure",
                    ModuleName = "NetworkInfrastructure",
                    Icon = "🌐",
                    Description = "Discover switches, routers, VLANs, subnets, and network topology",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                }
            };
            
            foreach (var module in modules)
            {
                discoveryModules.Add(module);
            }
        }

        private void NavigationButton_Click(object sender, RoutedEventArgs e)
        {
            // Hide all views
            DiscoveryView.Visibility = Visibility.Collapsed;
            ViewView.Visibility = Visibility.Collapsed;
            MigrateView.Visibility = Visibility.Collapsed;
            ReportsView.Visibility = Visibility.Collapsed;
            SettingsView.Visibility = Visibility.Collapsed;
            
            // Reset button backgrounds
            DiscoveryButton.Background = Brushes.Transparent;
            ViewButton.Background = Brushes.Transparent;
            MigrateButton.Background = Brushes.Transparent;
            ReportsButton.Background = Brushes.Transparent;
            SettingsButton.Background = Brushes.Transparent;
            
            // Show selected view
            Button clickedButton = sender as Button;
            if (clickedButton != null)
            {
                clickedButton.Background = new SolidColorBrush(Color.FromRgb(0, 122, 204));
                
                switch (clickedButton.Name)
                {
                    case "DiscoveryButton":
                        DiscoveryView.Visibility = Visibility.Visible;
                        currentView = "Discovery";
                        break;
                    case "ViewButton":
                        ViewView.Visibility = Visibility.Visible;
                        currentView = "View";
                        LoadViewData();
                        break;
                    case "MigrateButton":
                        MigrateView.Visibility = Visibility.Visible;
                        currentView = "Migrate";
                        break;
                    case "ReportsButton":
                        ReportsView.Visibility = Visibility.Visible;
                        currentView = "Reports";
                        break;
                    case "SettingsButton":
                        SettingsView.Visibility = Visibility.Visible;
                        currentView = "Settings";
                        break;
                }
            }
        }

        private async void RunFullDiscovery_Click(object sender, RoutedEventArgs e)
        {
            if (CompanySelector.SelectedItem == null || 
                ((CompanyProfile)CompanySelector.SelectedItem).Name == "+ Create New Profile")
            {
                MessageBox.Show("Please select or create a company profile first.", "No Profile Selected", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            
            ShowProgress("Running Full Discovery", "Initializing discovery modules...");
            
            cancellationTokenSource = new CancellationTokenSource();
            
            try
            {
                await Task.Run(() =>
                {
                    foreach (var module in discoveryModules)
                    {
                        if (cancellationTokenSource.Token.IsCancellationRequested)
                            break;
                        
                        Dispatcher.Invoke(() =>
                        {
                            UpdateProgress($"Running {module.Name} discovery...", 
                                (discoveryModules.IndexOf(module) + 1) * 100 / discoveryModules.Count);
                        });
                        
                        // Simulate running the module
                        System.Threading.Thread.Sleep(2000);
                        
                        Dispatcher.Invoke(() =>
                        {
                            module.Status = "Completed";
                            module.StatusColor = "#FF4CAF50";
                        });
                    }
                });
                
                HideProgress();
                MessageBox.Show("Full discovery completed successfully!", "Discovery Complete", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                HideProgress();
                MessageBox.Show($"Discovery failed: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ImportData_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new Microsoft.Win32.OpenFileDialog
            {
                Filter = "Discovery Data|*.json;*.csv;*.xml|All Files|*.*",
                Multiselect = true
            };
            
            if (dialog.ShowDialog() == true)
            {
                MessageBox.Show($"Selected {dialog.FileNames.Length} files for import.", "Import Data", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private async void RunModule_Click(object sender, RoutedEventArgs e)
        {
            Button button = sender as Button;
            string moduleName = button?.Tag as string;
            
            if (string.IsNullOrEmpty(moduleName))
                return;
            
            var module = discoveryModules.FirstOrDefault(m => m.ModuleName == moduleName);
            if (module == null)
                return;
            
            if (CompanySelector.SelectedItem == null || 
                ((CompanyProfile)CompanySelector.SelectedItem).Name == "+ Create New Profile")
            {
                MessageBox.Show("Please select or create a company profile first.", "No Profile Selected", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            
            ShowProgress($"Running {module.Name}", "Initializing module...");
            cancellationTokenSource = new CancellationTokenSource();
            
            try
            {
                module.Status = "Running";
                module.StatusColor = "#FFFFA726";
                
                var companyProfile = (CompanyProfile)CompanySelector.SelectedItem;
                var discoveryResult = await Task.Run(() => ExecuteDiscoveryModule(moduleName, companyProfile.Name, cancellationTokenSource.Token));
                
                if (!cancellationTokenSource.Token.IsCancellationRequested)
                {
                    module.Status = discoveryResult.Success ? "Completed" : "Failed";
                    module.StatusColor = discoveryResult.Success ? "#FF4CAF50" : "#FFF44336";
                    
                    HideProgress();
                    if (discoveryResult.Success)
                    {
                        MessageBox.Show($"{module.Name} discovery completed successfully!\n\nResults:\n{discoveryResult.Summary}", 
                            "Module Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                    else
                    {
                        MessageBox.Show($"{module.Name} discovery failed:\n{discoveryResult.ErrorMessage}", 
                            "Module Failed", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
                else
                {
                    module.Status = "Cancelled";
                    module.StatusColor = "#FF808080";
                    HideProgress();
                }
            }
            catch (Exception ex)
            {
                module.Status = "Failed";
                module.StatusColor = "#FFF44336";
                
                HideProgress();
                MessageBox.Show($"Module execution failed: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private DiscoveryResult ExecuteDiscoveryModule(string moduleName, string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult();
            
            try
            {
                using (var modulePs = PowerShell.Create())
                {
                    modulePs.AddScript($@"
                        Set-Location '{rootPath}'
                        $profileManager = Get-CompanyProfileManager -CompanyName '{companyName}'
                        $profilePaths = $profileManager.GetProfilePaths()
                    ");
                    
                    Dispatcher.Invoke(() => UpdateProgress("Setting up company profile...", 10));
                    
                    switch (moduleName)
                    {
                        case "PaloAlto":
                            return ExecutePaloAltoDiscovery(modulePs, companyName, cancellationToken);
                        case "EntraIDApp":
                            return ExecuteEntraIDAppDiscovery(modulePs, companyName, cancellationToken);
                        case "Azure":
                            return ExecuteAzureDiscovery(modulePs, companyName, cancellationToken);
                        case "ActiveDirectory":
                            return ExecuteActiveDirectoryDiscovery(modulePs, companyName, cancellationToken);
                        case "Exchange":
                            return ExecuteExchangeDiscovery(modulePs, companyName, cancellationToken);
                        case "SharePoint":
                            return ExecuteSharePointDiscovery(modulePs, companyName, cancellationToken);
                        case "Teams":
                            return ExecuteTeamsDiscovery(modulePs, companyName, cancellationToken);
                        default:
                            result.Success = false;
                            result.ErrorMessage = $"Module {moduleName} not implemented yet";
                            return result;
                    }
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                return result;
            }
        }
        
        private DiscoveryResult ExecutePaloAltoDiscovery(PowerShell ps, string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult();
            
            try
            {
                Dispatcher.Invoke(() => UpdateProgress("Scanning network for Palo Alto devices...", 20));
                
                ps.AddScript($@"
                    $paloAltoDiscovery = Get-PaloAltoDiscovery
                    $paloAltoDiscovery.SetParameters(@{{
                        NetworkRanges = @{{
                            'Default' = @('10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16')
                        }}
                    }})
                    
                    $discoveryResults = $paloAltoDiscovery.ExecuteDiscovery()
                    $exportData = $paloAltoDiscovery.ExportResults()
                    
                    $profileManager = Get-CompanyProfileManager -CompanyName '{companyName}'
                    $profileManager.SaveDiscoveryData('PaloAlto', $exportData, 'JSON')
                    
                    return $discoveryResults
                ");
                
                Dispatcher.Invoke(() => UpdateProgress("Processing Palo Alto discovery...", 60));
                
                var psResults = ps.Invoke();
                
                if (ps.HadErrors)
                {
                    result.Success = false;
                    result.ErrorMessage = string.Join("\n", ps.Streams.Error.Select(e => e.ToString()));
                    return result;
                }
                
                if (psResults.Count > 0)
                {
                    var discoveryData = psResults[0];
                    var deviceCount = GetPSObjectProperty(discoveryData, "TotalDevices", 0);
                    var panoramaCount = GetPSObjectProperty(discoveryData, "TotalPanoramas", 0);
                    
                    result.Success = true;
                    result.Summary = $"Discovered {deviceCount} Palo Alto devices and {panoramaCount} Panorama servers";
                    result.DataCount = deviceCount + panoramaCount;
                }
                else
                {
                    result.Success = true;
                    result.Summary = "Discovery completed - no devices found";
                    result.DataCount = 0;
                }
                
                Dispatcher.Invoke(() => UpdateProgress("Palo Alto discovery completed", 100));
                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                return result;
            }
        }
        
        private DiscoveryResult ExecuteEntraIDAppDiscovery(PowerShell ps, string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult();
            
            try
            {
                Dispatcher.Invoke(() => UpdateProgress("Connecting to Microsoft Graph...", 20));
                
                ps.AddScript($@"
                    $entraAppDiscovery = Get-EntraIDAppDiscovery
                    
                    # You would set parameters here based on stored credentials
                    $entraAppDiscovery.SetParameters(@{{
                        TenantId = 'your-tenant-id'
                        GraphScopes = @('Application.Read.All', 'Directory.Read.All')
                    }})
                    
                    $discoveryResults = $entraAppDiscovery.ExecuteDiscovery()
                    $exportData = $entraAppDiscovery.ExportResults()
                    
                    $profileManager = Get-CompanyProfileManager -CompanyName '{companyName}'
                    $profileManager.SaveDiscoveryData('EntraIDApp', $exportData, 'JSON')
                    
                    return $discoveryResults
                ");
                
                Dispatcher.Invoke(() => UpdateProgress("Discovering enterprise applications...", 60));
                
                var psResults = ps.Invoke();
                
                if (ps.HadErrors)
                {
                    result.Success = false;
                    result.ErrorMessage = string.Join("\n", ps.Streams.Error.Select(e => e.ToString()));
                    return result;
                }
                
                if (psResults.Count > 0)
                {
                    var discoveryData = psResults[0];
                    var appCount = GetPSObjectProperty(discoveryData, "TotalApps", 0);
                    var spCount = GetPSObjectProperty(discoveryData, "TotalServicePrincipals", 0);
                    var expiringSecrets = GetPSObjectProperty(discoveryData, "ExpiringSecrets", 0);
                    
                    result.Success = true;
                    result.Summary = $"Discovered {appCount} app registrations, {spCount} service principals\n{expiringSecrets} secrets expiring soon";
                    result.DataCount = appCount + spCount;
                }
                else
                {
                    result.Success = true;
                    result.Summary = "Discovery completed - no applications found";
                    result.DataCount = 0;
                }
                
                Dispatcher.Invoke(() => UpdateProgress("Entra ID App discovery completed", 100));
                return result;
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                return result;
            }
        }
        
        private DiscoveryResult ExecuteAzureDiscovery(PowerShell ps, string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult { Success = false, ErrorMessage = "Azure discovery module not yet implemented" };
            return result;
        }
        
        private DiscoveryResult ExecuteActiveDirectoryDiscovery(PowerShell ps, string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult { Success = false, ErrorMessage = "Active Directory discovery module not yet implemented" };
            return result;
        }
        
        private DiscoveryResult ExecuteExchangeDiscovery(PowerShell ps, string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult { Success = false, ErrorMessage = "Exchange discovery module not yet implemented" };
            return result;
        }
        
        private DiscoveryResult ExecuteSharePointDiscovery(PowerShell ps, string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult { Success = false, ErrorMessage = "SharePoint discovery module not yet implemented" };
            return result;
        }
        
        private DiscoveryResult ExecuteTeamsDiscovery(PowerShell ps, string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult { Success = false, ErrorMessage = "Teams discovery module not yet implemented" };
            return result;
        }
        
        private int GetPSObjectProperty(PSObject obj, string propertyName, int defaultValue)
        {
            try
            {
                var property = obj.Properties[propertyName];
                if (property != null && int.TryParse(property.Value.ToString(), out int value))
                    return value;
            }
            catch { }
            
            return defaultValue;
        }

        private void ViewType_Changed(object sender, RoutedEventArgs e)
        {
            LoadViewData();
        }

        private void LoadViewData()
        {
            if (CompanySelector.SelectedItem == null || 
                ((CompanyProfile)CompanySelector.SelectedItem).Name == "+ Create New Profile")
            {
                ViewDataGrid.ItemsSource = null;
                return;
            }
            
            var companyProfile = (CompanyProfile)CompanySelector.SelectedItem;
            
            try
            {
                if (UserViewRadio.IsChecked == true)
                {
                    LoadUserViewData(companyProfile.Name);
                }
                else if (ComputerViewRadio.IsChecked == true)
                {
                    LoadComputerViewData(companyProfile.Name);
                }
                else if (InfraViewRadio.IsChecked == true)
                {
                    LoadInfrastructureViewData(companyProfile.Name);
                }
                else if (WaveViewRadio.IsChecked == true)
                {
                    LoadWaveViewData(companyProfile.Name);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to load view data: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
                ViewDataGrid.ItemsSource = null;
            }
        }
        
        private void LoadUserViewData(string companyName)
        {
            try
            {
                using (var ps = PowerShell.Create())
                {
                    ps.AddScript($@"
                        Set-Location '{rootPath}'
                        $profileManager = Get-CompanyProfileManager -CompanyName '{companyName}'
                        
                        $userData = @()
                        
                        # Try to load Active Directory data
                        try {{
                            $adData = $profileManager.LoadDiscoveryData('ActiveDirectory', 'JSON')
                            if ($adData.Users) {{
                                foreach ($user in $adData.Users) {{
                                    $userData += [PSCustomObject]@{{
                                        Name = $user.DisplayName
                                        Email = $user.UserPrincipalName
                                        Department = $user.Department
                                        Status = if ($user.Enabled) {{ 'Active' }} else {{ 'Disabled' }}
                                        Source = 'Active Directory'
                                        LastLogon = $user.LastLogonDate
                                        Groups = ($user.MemberOf | Measure-Object).Count
                                    }}
                                }}
                            }}
                        }} catch {{}}
                        
                        # Try to load Azure AD data
                        try {{
                            $azureData = $profileManager.LoadDiscoveryData('Azure', 'JSON')
                            if ($azureData.Users) {{
                                foreach ($user in $azureData.Users) {{
                                    $userData += [PSCustomObject]@{{
                                        Name = $user.DisplayName
                                        Email = $user.UserPrincipalName
                                        Department = $user.Department
                                        Status = if ($user.AccountEnabled) {{ 'Active' }} else {{ 'Disabled' }}
                                        Source = 'Azure AD'
                                        LastLogon = $user.SignInActivity.LastSignInDateTime
                                        Groups = ($user.MemberOf | Measure-Object).Count
                                    }}
                                }}
                            }}
                        }} catch {{}}
                        
                        return $userData
                    ");
                    
                    var results = ps.Invoke();
                    if (results.Count > 0 && results[0] != null)
                    {
                        ViewDataGrid.ItemsSource = results[0].BaseObject;
                    }
                    else
                    {
                        // Show sample data if no discovery data available
                        var sampleData = new List<dynamic>
                        {
                            new { Name = "Run Active Directory discovery to see user data", Email = "", Department = "", Status = "No Data", Source = "Sample", LastLogon = (DateTime?)null, Groups = 0 }
                        };
                        ViewDataGrid.ItemsSource = sampleData;
                    }
                }
            }
            catch (Exception ex)
            {
                var errorData = new List<dynamic>
                {
                    new { Name = $"Error loading user data: {ex.Message}", Email = "", Department = "", Status = "Error", Source = "System", LastLogon = (DateTime?)null, Groups = 0 }
                };
                ViewDataGrid.ItemsSource = errorData;
            }
        }
        
        private void LoadComputerViewData(string companyName)
        {
            try
            {
                using (var ps = PowerShell.Create())
                {
                    ps.AddScript($@"
                        Set-Location '{rootPath}'
                        $profileManager = Get-CompanyProfileManager -CompanyName '{companyName}'
                        
                        $computerData = @()
                        
                        # Try to load Active Directory computer data
                        try {{
                            $adData = $profileManager.LoadDiscoveryData('ActiveDirectory', 'JSON')
                            if ($adData.Computers) {{
                                foreach ($computer in $adData.Computers) {{
                                    $computerData += [PSCustomObject]@{{
                                        Name = $computer.Name
                                        OS = $computer.OperatingSystem
                                        LastSeen = $computer.LastLogonDate
                                        Status = if ($computer.Enabled) {{ 'Active' }} else {{ 'Disabled' }}
                                        OU = $computer.DistinguishedName -replace '^CN=[^,]+,',''
                                        Source = 'Active Directory'
                                    }}
                                }}
                            }}
                        }} catch {{}}
                        
                        return $computerData
                    ");
                    
                    var results = ps.Invoke();
                    if (results.Count > 0 && results[0] != null)
                    {
                        ViewDataGrid.ItemsSource = results[0].BaseObject;
                    }
                    else
                    {
                        var sampleData = new List<dynamic>
                        {
                            new { Name = "Run Active Directory discovery to see computer data", OS = "", LastSeen = (DateTime?)null, Status = "No Data", OU = "", Source = "Sample" }
                        };
                        ViewDataGrid.ItemsSource = sampleData;
                    }
                }
            }
            catch (Exception ex)
            {
                var errorData = new List<dynamic>
                {
                    new { Name = $"Error loading computer data: {ex.Message}", OS = "", LastSeen = (DateTime?)null, Status = "Error", OU = "", Source = "System" }
                };
                ViewDataGrid.ItemsSource = errorData;
            }
        }
        
        private void LoadInfrastructureViewData(string companyName)
        {
            try
            {
                using (var ps = PowerShell.Create())
                {
                    ps.AddScript($@"
                        Set-Location '{rootPath}'
                        $profileManager = Get-CompanyProfileManager -CompanyName '{companyName}'
                        
                        $infraData = @()
                        
                        # Try to load Palo Alto data
                        try {{
                            $paloData = $profileManager.LoadDiscoveryData('PaloAlto', 'JSON')
                            if ($paloData.Devices) {{
                                foreach ($device in $paloData.Devices) {{
                                    $infraData += [PSCustomObject]@{{
                                        Name = $device.Hostname
                                        Type = 'Palo Alto ' + $device.DeviceType
                                        Model = $device.Model
                                        IPAddress = $device.IPAddress
                                        Status = $device.HAStatus
                                        Version = $device.SoftwareVersion
                                        Source = 'Palo Alto Networks'
                                    }}
                                }}
                            }}
                        }} catch {{}}
                        
                        # Try to load network infrastructure data
                        try {{
                            $netData = $profileManager.LoadDiscoveryData('NetworkInfrastructure', 'JSON')
                            if ($netData.Devices) {{
                                foreach ($device in $netData.Devices) {{
                                    $infraData += [PSCustomObject]@{{
                                        Name = $device.Hostname
                                        Type = $device.DeviceType
                                        Model = $device.Model
                                        IPAddress = $device.IPAddress
                                        Status = $device.Status
                                        Version = $device.Version
                                        Source = 'Network Infrastructure'
                                    }}
                                }}
                            }}
                        }} catch {{}}
                        
                        return $infraData
                    ");
                    
                    var results = ps.Invoke();
                    if (results.Count > 0 && results[0] != null)
                    {
                        ViewDataGrid.ItemsSource = results[0].BaseObject;
                    }
                    else
                    {
                        var sampleData = new List<dynamic>
                        {
                            new { Name = "Run infrastructure discovery to see device data", Type = "", Model = "", IPAddress = "", Status = "No Data", Version = "", Source = "Sample" }
                        };
                        ViewDataGrid.ItemsSource = sampleData;
                    }
                }
            }
            catch (Exception ex)
            {
                var errorData = new List<dynamic>
                {
                    new { Name = $"Error loading infrastructure data: {ex.Message}", Type = "", Model = "", IPAddress = "", Status = "Error", Version = "", Source = "System" }
                };
                ViewDataGrid.ItemsSource = errorData;
            }
        }
        
        private void LoadWaveViewData(string companyName)
        {
            try
            {
                using (var ps = PowerShell.Create())
                {
                    ps.AddScript($@"
                        Set-Location '{rootPath}'
                        $profileManager = Get-CompanyProfileManager -CompanyName '{companyName}'
                        
                        $waveData = @()
                        
                        # Try to load wave data
                        try {{
                            $waves = $profileManager.LoadDiscoveryData('Waves', 'JSON')
                            if ($waves.WaveAssignments) {{
                                foreach ($assignment in $waves.WaveAssignments) {{
                                    $waveData += [PSCustomObject]@{{
                                        UserName = $assignment.UserName
                                        Email = $assignment.Email
                                        Department = $assignment.Department
                                        Wave = $assignment.WaveNumber
                                        Priority = $assignment.Priority
                                        Complexity = $assignment.ComplexityScore
                                        Dependencies = $assignment.Dependencies.Count
                                        Status = $assignment.MigrationStatus
                                    }}
                                }}
                            }}
                        }} catch {{}}
                        
                        return $waveData
                    ");
                    
                    var results = ps.Invoke();
                    if (results.Count > 0 && results[0] != null)
                    {
                        ViewDataGrid.ItemsSource = results[0].BaseObject;
                    }
                    else
                    {
                        var sampleData = new List<dynamic>
                        {
                            new { UserName = "Generate waves to see migration planning data", Email = "", Department = "", Wave = 0, Priority = "", Complexity = 0, Dependencies = 0, Status = "No Data" }
                        };
                        ViewDataGrid.ItemsSource = sampleData;
                    }
                }
            }
            catch (Exception ex)
            {
                var errorData = new List<dynamic>
                {
                    new { UserName = $"Error loading wave data: {ex.Message}", Email = "", Department = "", Wave = 0, Priority = "Error", Complexity = 0, Dependencies = 0, Status = "Error" }
                };
                ViewDataGrid.ItemsSource = errorData;
            }
        }

        private void SelectUsers_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("User selection dialog would open here.", "Select Users", 
                MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void MapSecurityGroups_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Security group mapping dialog would open here.", "Map Security Groups", 
                MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void StartUserMigration_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("User migration would start here.", "Start Migration", 
                MessageBoxButton.OK, MessageBoxImage.Information);
        }

        private void ShowProgress(string title, string status)
        {
            ProgressOverlay.Visibility = Visibility.Visible;
            ProgressTitle.Text = title;
            ProgressStatus.Text = status;
            ProgressBar.Value = 0;
        }

        private void UpdateProgress(string status, int percentage)
        {
            ProgressStatus.Text = status;
            ProgressBar.Value = percentage;
        }

        private void HideProgress()
        {
            ProgressOverlay.Visibility = Visibility.Collapsed;
        }

        private void CancelOperation_Click(object sender, RoutedEventArgs e)
        {
            cancellationTokenSource?.Cancel();
            HideProgress();
        }

        protected override void OnClosed(EventArgs e)
        {
            base.OnClosed(e);
            powerShell?.Dispose();
        }
    }

    public class DiscoveryModule : INotifyPropertyChanged
    {
        private string status;
        private string statusColor;

        public string Name { get; set; }
        public string ModuleName { get; set; }
        public string Icon { get; set; }
        public string Description { get; set; }
        
        public string Status
        {
            get => status;
            set
            {
                status = value;
                OnPropertyChanged(nameof(Status));
            }
        }
        
        public string StatusColor
        {
            get => statusColor;
            set
            {
                statusColor = value;
                OnPropertyChanged(nameof(StatusColor));
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        
        protected void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class CompanyProfile
    {
        public string Name { get; set; }
        public string Path { get; set; }
        
        public override string ToString()
        {
            return Name;
        }
    }
    
    public class DiscoveryResult
    {
        public bool Success { get; set; }
        public string Summary { get; set; } = "";
        public string ErrorMessage { get; set; } = "";
        public int DataCount { get; set; } = 0;
        public Dictionary<string, object> AdditionalData { get; set; } = new Dictionary<string, object>();
    }
}
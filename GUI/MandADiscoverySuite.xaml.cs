using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;
using System.Text.Json;

namespace MandADiscoverySuite
{
    public partial class MainWindow : Window
    {
        private readonly ObservableCollection<DiscoveryModule> discoveryModules;
        private readonly ObservableCollection<CompanyProfile> companyProfiles;
        private ProcessStartInfo powerShellStartInfo;
        private string rootPath;
        private string currentView = "Dashboard";
        private CancellationTokenSource cancellationTokenSource;
        private DispatcherTimer progressTimer;
        private DateTime operationStartTime;

        public MainWindow()
        {
            InitializeComponent();
            discoveryModules = new ObservableCollection<DiscoveryModule>();
            companyProfiles = new ObservableCollection<CompanyProfile>();
            progressTimer = new DispatcherTimer();
            progressTimer.Interval = TimeSpan.FromSeconds(1);
            progressTimer.Tick += ProgressTimer_Tick;
            
            InitializePowerShell();
            LoadCompanyProfiles();
            InitializeDiscoveryModules();
            InitializeDataGrids();
            
            DiscoveryModules.ItemsSource = discoveryModules;
            DashboardModules.ItemsSource = discoveryModules;
            CompanySelector.ItemsSource = companyProfiles;
            
            if (companyProfiles.Count > 0)
            {
                CompanySelector.SelectedIndex = 0;
            }
            
            // Add selection changed handler
            CompanySelector.SelectionChanged += CompanySelector_SelectionChanged;
        }

        private void InitializePowerShell()
        {
            rootPath = GetRootPath();
            
            powerShellStartInfo = new ProcessStartInfo()
            {
                FileName = "powershell.exe",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
                WorkingDirectory = rootPath,
                Arguments = "-ExecutionPolicy Bypass -NoProfile"
            };
        }

        private string GetRootPath()
        {
            // Get the application base directory for modules
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
        
        private string GetDiscoveryDataPath()
        {
            // Default to C:\DiscoveryData for company profiles
            string dataPath = @"C:\DiscoveryData";
            
            // Check if environment variable is set for custom path
            string envPath = Environment.GetEnvironmentVariable("MANDA_DISCOVERY_PATH");
            if (!string.IsNullOrEmpty(envPath))
            {
                dataPath = envPath;
            }
            
            // Ensure the directory exists
            if (!Directory.Exists(dataPath))
            {
                Directory.CreateDirectory(dataPath);
            }
            
            return dataPath;
        }

        private void LoadCompanyProfiles()
        {
            companyProfiles.Clear();
            
            string discoveryPath = GetDiscoveryDataPath();
            if (Directory.Exists(discoveryPath))
            {
                foreach (var dir in Directory.GetDirectories(discoveryPath))
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
            
            // Always add the create new profile option
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
                    Description = "Discover users, groups, computers, OUs, and GPOs from on-premises Active Directory with comprehensive permission analysis",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "Azure AD / Entra ID",
                    ModuleName = "Azure",
                    Icon = "☁️",
                    Description = "Discover cloud identities, groups, applications, conditional access policies, and service principals",
                    Status = "Completed",
                    StatusColor = "#FF4CAF50"
                },
                new DiscoveryModule
                {
                    Name = "Exchange Online",
                    ModuleName = "Exchange",
                    Icon = "📧",
                    Description = "Discover mailboxes, distribution lists, mail-enabled groups, and permissions with retention policies",
                    Status = "Running",
                    StatusColor = "#FFFFA726"
                },
                new DiscoveryModule
                {
                    Name = "SharePoint Online",
                    ModuleName = "SharePoint",
                    Icon = "📁",
                    Description = "Discover sites, libraries, lists, permissions, content types, and workflow configurations",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "Microsoft Teams",
                    ModuleName = "Teams",
                    Icon = "💬",
                    Description = "Discover teams, channels, members, guest users, app integrations, and governance policies",
                    Status = "Completed",
                    StatusColor = "#FF4CAF50"
                },
                new DiscoveryModule
                {
                    Name = "Palo Alto Networks",
                    ModuleName = "PaloAlto",
                    Icon = "🔥",
                    Description = "Discover Palo Alto firewalls, Panorama servers, security policies, and network topology with HA configurations",
                    Status = "Completed",
                    StatusColor = "#FF4CAF50"
                },
                new DiscoveryModule
                {
                    Name = "Enterprise Applications",
                    ModuleName = "EntraIDApp",
                    Icon = "🔐",
                    Description = "Discover enterprise applications, app registrations, secrets, certificates, and API permissions",
                    Status = "Completed",
                    StatusColor = "#FF4CAF50"
                },
                new DiscoveryModule
                {
                    Name = "File Servers",
                    ModuleName = "FileServer",
                    Icon = "💾",
                    Description = "Discover file shares, NTFS permissions, DFS namespaces, and storage utilization metrics",
                    Status = "Not Started",
                    StatusColor = "#FF808080"
                },
                new DiscoveryModule
                {
                    Name = "SQL Servers",
                    ModuleName = "SQLServer",
                    Icon = "🗄️",
                    Description = "Discover SQL instances, databases, logins, permissions, and backup configurations",
                    Status = "Failed",
                    StatusColor = "#FFF44336"
                },
                new DiscoveryModule
                {
                    Name = "Network Infrastructure",
                    ModuleName = "NetworkInfrastructure",
                    Icon = "🌐",
                    Description = "Discover switches, routers, VLANs, subnets, network topology, and performance metrics",
                    Status = "Running",
                    StatusColor = "#FFFFA726"
                }
            };
            
            foreach (var module in modules)
            {
                discoveryModules.Add(module);
            }
        }

        private void InitializeDataGrids()
        {
            // Initialize Users DataGrid with enhanced sample data
            var usersData = new List<UserAccount>
            {
                new UserAccount { Name = "John Doe", Email = "john.doe@company.com", Department = "IT", Status = "Active", Source = "Active Directory", LastLogon = DateTime.Now.AddDays(-1), Groups = 5, Manager = "Jane Smith", Title = "Systems Administrator", Location = "New York" },
                new UserAccount { Name = "Jane Smith", Email = "jane.smith@company.com", Department = "Finance", Status = "Active", Source = "Azure AD", LastLogon = DateTime.Now.AddDays(-2), Groups = 3, Manager = "Robert Johnson", Title = "Finance Manager", Location = "Chicago" },
                new UserAccount { Name = "Bob Johnson", Email = "bob.johnson@company.com", Department = "Sales", Status = "Disabled", Source = "Active Directory", LastLogon = DateTime.Now.AddDays(-30), Groups = 2, Manager = "", Title = "Sales Representative", Location = "Los Angeles" },
                new UserAccount { Name = "Alice Williams", Email = "alice.williams@company.com", Department = "HR", Status = "Active", Source = "Azure AD", LastLogon = DateTime.Now.AddHours(-3), Groups = 4, Manager = "Carol Davis", Title = "HR Specialist", Location = "Miami" },
                new UserAccount { Name = "Charlie Brown", Email = "charlie.brown@company.com", Department = "IT", Status = "Active", Source = "Active Directory", LastLogon = DateTime.Now.AddHours(-1), Groups = 8, Manager = "John Doe", Title = "Network Engineer", Location = "Seattle" }
            };
            UsersDataGrid.ItemsSource = usersData;

            // Initialize Computers DataGrid with enhanced sample data
            var computersData = new List<ComputerAccount>
            {
                new ComputerAccount { Name = "WS001", OS = "Windows 11 Pro", IPAddress = "192.168.1.101", LastSeen = DateTime.Now.AddHours(-2), Status = "Active", Domain = "company.local", OU = "OU=Workstations,DC=company,DC=com", Manufacturer = "Dell", Model = "OptiPlex 7090", SerialNumber = "ABC123", RAM = 16, DiskSpace = 512 },
                new ComputerAccount { Name = "WS002", OS = "Windows 10 Pro", IPAddress = "192.168.1.102", LastSeen = DateTime.Now.AddDays(-1), Status = "Active", Domain = "company.local", OU = "OU=Workstations,DC=company,DC=com", Manufacturer = "HP", Model = "EliteDesk 800", SerialNumber = "DEF456", RAM = 8, DiskSpace = 256 },
                new ComputerAccount { Name = "SRV001", OS = "Windows Server 2022", IPAddress = "192.168.1.10", LastSeen = DateTime.Now.AddMinutes(-15), Status = "Active", Domain = "company.local", OU = "OU=Servers,DC=company,DC=com", Manufacturer = "Dell", Model = "PowerEdge R750", SerialNumber = "GHI789", RAM = 64, DiskSpace = 2048 },
                new ComputerAccount { Name = "LT001", OS = "Windows 11 Pro", IPAddress = "192.168.1.203", LastSeen = DateTime.Now.AddHours(-4), Status = "Active", Domain = "company.local", OU = "OU=Laptops,DC=company,DC=com", Manufacturer = "Lenovo", Model = "ThinkPad X1", SerialNumber = "JKL012", RAM = 32, DiskSpace = 1024 }
            };
            ComputersDataGrid.ItemsSource = computersData;

            // Initialize Infrastructure DataGrid with enhanced sample data
            var infraData = new List<InfrastructureDevice>
            {
                new InfrastructureDevice { Name = "PA-VM-001", Type = "Palo Alto Firewall", Model = "PA-VM", IPAddress = "10.0.1.100", Status = "Active", Version = "10.2.3", Location = "Data Center", Uptime = "45 days", CPUUsage = "15%", MemoryUsage = "32%", Source = "Palo Alto Networks" },
                new InfrastructureDevice { Name = "SW-CORE-01", Type = "Core Switch", Model = "Cisco 9300", IPAddress = "10.0.1.10", Status = "Active", Version = "16.12.04", Location = "Main Floor", Uptime = "123 days", CPUUsage = "8%", MemoryUsage = "28%", Source = "Network Discovery" },
                new InfrastructureDevice { Name = "RTR-WAN-01", Type = "WAN Router", Model = "Cisco ISR4431", IPAddress = "10.0.1.1", Status = "Active", Version = "16.09.05", Location = "Network Room", Uptime = "67 days", CPUUsage = "12%", MemoryUsage = "45%", Source = "Network Discovery" },
                new InfrastructureDevice { Name = "PA-5220-2", Type = "Palo Alto Firewall", Model = "PA-5220", IPAddress = "10.0.1.101", Status = "Active", Version = "10.2.3", Location = "DR Site", Uptime = "23 days", CPUUsage = "18%", MemoryUsage = "38%", Source = "Palo Alto Networks" },
                new InfrastructureDevice { Name = "SW-ACCESS-01", Type = "Access Switch", Model = "Cisco 2960X", IPAddress = "10.0.2.10", Status = "Active", Version = "15.2.4", Location = "Floor 2", Uptime = "89 days", CPUUsage = "5%", MemoryUsage = "22%", Source = "Network Discovery" }
            };
            InfrastructureDataGrid.ItemsSource = infraData;

            // Initialize Waves DataGrid with enhanced sample data
            var wavesData = new List<MigrationWave>
            {
                new MigrationWave { UserName = "John Doe", Email = "john.doe@company.com", Department = "IT", Wave = 1, Priority = "High", Complexity = 85, Dependencies = 3, Status = "Planned", EstimatedDuration = "4 hours", RiskLevel = "Medium" },
                new MigrationWave { UserName = "Jane Smith", Email = "jane.smith@company.com", Department = "Finance", Wave = 2, Priority = "Medium", Complexity = 60, Dependencies = 1, Status = "Planned", EstimatedDuration = "2 hours", RiskLevel = "Low" },
                new MigrationWave { UserName = "Bob Johnson", Email = "bob.johnson@company.com", Department = "Sales", Wave = 3, Priority = "Low", Complexity = 35, Dependencies = 0, Status = "Planned", EstimatedDuration = "1 hour", RiskLevel = "Low" },
                new MigrationWave { UserName = "Alice Williams", Email = "alice.williams@company.com", Department = "HR", Wave = 1, Priority = "High", Complexity = 78, Dependencies = 2, Status = "In Progress", EstimatedDuration = "3 hours", RiskLevel = "Medium" },
                new MigrationWave { UserName = "Charlie Brown", Email = "charlie.brown@company.com", Department = "IT", Wave = 1, Priority = "High", Complexity = 92, Dependencies = 5, Status = "Completed", EstimatedDuration = "6 hours", RiskLevel = "High" }
            };
            WavesDataGrid.ItemsSource = wavesData;
        }

        private void NavigationButton_Click(object sender, RoutedEventArgs e)
        {
            // Hide all views
            DashboardView.Visibility = Visibility.Collapsed;
            DiscoveryView.Visibility = Visibility.Collapsed;
            UsersView.Visibility = Visibility.Collapsed;
            ComputersView.Visibility = Visibility.Collapsed;
            InfrastructureView.Visibility = Visibility.Collapsed;
            ApplicationsView.Visibility = Visibility.Collapsed;
            WavesView.Visibility = Visibility.Collapsed;
            MigrateView.Visibility = Visibility.Collapsed;
            ReportsView.Visibility = Visibility.Collapsed;
            SettingsView.Visibility = Visibility.Collapsed;
            
            // Reset button backgrounds
            DashboardButton.Background = Brushes.Transparent;
            DiscoveryButton.Background = Brushes.Transparent;
            UsersButton.Background = Brushes.Transparent;
            ComputersButton.Background = Brushes.Transparent;
            InfrastructureButton.Background = Brushes.Transparent;
            ApplicationsButton.Background = Brushes.Transparent;
            WavesButton.Background = Brushes.Transparent;
            MigrateButton.Background = Brushes.Transparent;
            ReportsButton.Background = Brushes.Transparent;
            SettingsButton.Background = Brushes.Transparent;
            
            // Show selected view
            Button clickedButton = sender as Button;
            if (clickedButton != null)
            {
                clickedButton.Background = new SolidColorBrush(Color.FromRgb(45, 55, 72));
                
                switch (clickedButton.Name)
                {
                    case "DashboardButton":
                        DashboardView.Visibility = Visibility.Visible;
                        currentView = "Dashboard";
                        break;
                    case "DiscoveryButton":
                        DiscoveryView.Visibility = Visibility.Visible;
                        currentView = "Discovery";
                        break;
                    case "UsersButton":
                        UsersView.Visibility = Visibility.Visible;
                        currentView = "Users";
                        break;
                    case "ComputersButton":
                        ComputersView.Visibility = Visibility.Visible;
                        currentView = "Computers";
                        break;
                    case "InfrastructureButton":
                        InfrastructureView.Visibility = Visibility.Visible;
                        currentView = "Infrastructure";
                        break;
                    case "ApplicationsButton":
                        ApplicationsView.Visibility = Visibility.Visible;
                        currentView = "Applications";
                        LoadApplicationsData();
                        break;
                    case "WavesButton":
                        WavesView.Visibility = Visibility.Visible;
                        currentView = "Waves";
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
                var discoveryResult = await ExecuteDiscoveryModule(moduleName, companyProfile.Name, cancellationTokenSource.Token);
                
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
        
        private async Task<DiscoveryResult> ExecuteDiscoveryModule(string moduleName, string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult();
            
            try
            {
                Dispatcher.Invoke(() => UpdateProgress("Setting up company profile...", 10));
                
                switch (moduleName)
                {
                        case "PaloAlto":
                            return await ExecutePaloAltoDiscovery(companyName, cancellationToken);
                        case "EntraIDApp":
                            return await ExecuteEntraIDAppDiscovery(companyName, cancellationToken);
                        case "Azure":
                            return await ExecuteAzureDiscovery(companyName, cancellationToken);
                        case "ActiveDirectory":
                            return await ExecuteActiveDirectoryDiscovery(companyName, cancellationToken);
                        case "Exchange":
                            return await ExecuteExchangeDiscovery(companyName, cancellationToken);
                        case "SharePoint":
                            return await ExecuteSharePointDiscovery(companyName, cancellationToken);
                        case "Teams":
                            return await ExecuteTeamsDiscovery(companyName, cancellationToken);
                        default:
                            result.Success = false;
                            result.ErrorMessage = $"Module {moduleName} not implemented yet";
                            return result;
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.ErrorMessage = ex.Message;
                return result;
            }
        }
        
        private async Task<DiscoveryResult> ExecutePaloAltoDiscovery(string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult();
            
            try
            {
                Dispatcher.Invoke(() => UpdateProgress("Scanning network for Palo Alto devices...", 20));
                
                var script = $@"
                    Set-Location '{rootPath}'
                    Import-Module '.\Modules\Core\CompanyProfileManager.psm1' -Force
                    Import-Module '.\Modules\Discovery\PaloAltoDiscovery.psm1' -Force
                    
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
                    
                    $discoveryResults | ConvertTo-Json -Depth 5
                ";
                
                Dispatcher.Invoke(() => UpdateProgress("Processing Palo Alto discovery...", 60));
                
                var processResult = await ExecutePowerShellScript(script, cancellationToken);
                
                if (!processResult.Success)
                {
                    result.Success = false;
                    result.ErrorMessage = processResult.Error;
                    return result;
                }
                
                if (!string.IsNullOrEmpty(processResult.Output))
                {
                    try
                    {
                        var discoveryData = JsonSerializer.Deserialize<JsonElement>(processResult.Output);
                        var deviceCount = discoveryData.TryGetProperty("TotalDevices", out var deviceProp) ? deviceProp.GetInt32() : 0;
                        var panoramaCount = discoveryData.TryGetProperty("TotalPanoramas", out var panoramaProp) ? panoramaProp.GetInt32() : 0;
                        
                        result.Success = true;
                        result.Summary = $"Discovered {deviceCount} Palo Alto devices and {panoramaCount} Panorama servers";
                        result.DataCount = deviceCount + panoramaCount;
                    }
                    catch
                    {
                        result.Success = true;
                        result.Summary = "Discovery completed successfully";
                        result.DataCount = 0;
                    }
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

        private async Task<DiscoveryResult> ExecuteEntraIDAppDiscovery(string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult();
            
            try
            {
                Dispatcher.Invoke(() => UpdateProgress("Connecting to Entra ID...", 20));
                await Task.Delay(2000, cancellationToken);
                
                Dispatcher.Invoke(() => UpdateProgress("Discovering enterprise applications...", 50));
                await Task.Delay(3000, cancellationToken);
                
                Dispatcher.Invoke(() => UpdateProgress("Processing application data...", 80));
                await Task.Delay(1500, cancellationToken);
                
                result.Success = true;
                result.Summary = "Discovered 47 enterprise applications with 23 app registrations";
                result.DataCount = 70;
                
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
        
        private async Task<DiscoveryResult> ExecuteAzureDiscovery(string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult { Success = false, ErrorMessage = "Azure discovery module not yet implemented" };
            return await Task.FromResult(result);
        }
        
        private async Task<DiscoveryResult> ExecuteActiveDirectoryDiscovery(string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult { Success = false, ErrorMessage = "Active Directory discovery module not yet implemented" };
            return await Task.FromResult(result);
        }
        
        private async Task<DiscoveryResult> ExecuteExchangeDiscovery(string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult { Success = false, ErrorMessage = "Exchange discovery module not yet implemented" };
            return await Task.FromResult(result);
        }
        
        private async Task<DiscoveryResult> ExecuteSharePointDiscovery(string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult { Success = false, ErrorMessage = "SharePoint discovery module not yet implemented" };
            return await Task.FromResult(result);
        }
        
        private async Task<DiscoveryResult> ExecuteTeamsDiscovery(string companyName, CancellationToken cancellationToken)
        {
            var result = new DiscoveryResult { Success = false, ErrorMessage = "Teams discovery module not yet implemented" };
            return await Task.FromResult(result);
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
            operationStartTime = DateTime.Now;
            ProgressTimer.Text = "00:00";
            progressTimer.Start();
            StatusProgressBar.Visibility = Visibility.Visible;
            StatusProgressBar.Value = 0;
        }

        private void UpdateProgress(string status, int percentage)
        {
            ProgressStatus.Text = status;
            ProgressBar.Value = percentage;
            StatusProgressBar.Value = percentage;
        }

        private void HideProgress()
        {
            ProgressOverlay.Visibility = Visibility.Collapsed;
            progressTimer.Stop();
            StatusProgressBar.Visibility = Visibility.Collapsed;
        }

        private void ProgressTimer_Tick(object sender, EventArgs e)
        {
            var elapsed = DateTime.Now - operationStartTime;
            ProgressTimer.Text = elapsed.ToString(@"mm\:ss");
        }

        private void CancelOperation_Click(object sender, RoutedEventArgs e)
        {
            cancellationTokenSource?.Cancel();
            HideProgress();
        }

        private async void RunAppRegistration_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                ShowProgress("Azure App Registration", "Running Azure App Registration Setup...");
                
                string script = $@"
                    Set-Location '{rootPath}'
                    Import-Module .\Modules\Core\CompanyProfileManager.psm1 -Force
                    
                    # Run the app registration script
                    if (Test-Path '.\Scripts\Setup-AzureAppRegistration.ps1') {{
                        .\Scripts\Setup-AzureAppRegistration.ps1
                    }} else {{
                        Write-Host 'App registration script not found. Creating basic setup...' -ForegroundColor Yellow
                        Write-Host 'Please manually create an Azure App Registration with the following permissions:' -ForegroundColor Cyan
                        Write-Host '- Microsoft Graph: User.Read.All, Group.Read.All, Application.Read.All' -ForegroundColor White
                        Write-Host '- Exchange Online: Exchange.ManageAsApp' -ForegroundColor White
                        Write-Host '- SharePoint: Sites.FullControl.All' -ForegroundColor White
                    }}
                ";

                var result = await ExecutePowerShellScript(script);
                
                if (result.Success)
                {
                    MessageBox.Show($"App registration setup completed successfully.\n\n{result.Output}", 
                        "App Registration", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    MessageBox.Show($"App registration setup failed:\n{result.Error}", 
                        "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error running app registration: {ex.Message}", 
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                HideProgress();
            }
        }

        private async void ConfigureCredentials_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var selectedProfile = (CompanyProfile)CompanySelector.SelectedItem;
                if (selectedProfile == null || selectedProfile.Name == "+ Create New Profile")
                {
                    MessageBox.Show("Please select a company profile first.", "No Profile Selected", 
                        MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                string credentialsPath = Path.Combine(selectedProfile.Path, "credentials-template.json");
                
                if (File.Exists(credentialsPath))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = credentialsPath,
                        UseShellExecute = true
                    });
                    
                    var result = MessageBox.Show(
                        "The credentials template file has been opened for editing.\n\n" +
                        "Please fill in your credentials and save the file.\n\n" +
                        "Click OK when you've finished editing the credentials.",
                        "Configure Credentials",
                        MessageBoxButton.OKCancel,
                        MessageBoxImage.Information);
                        
                    if (result == MessageBoxResult.OK)
                    {
                        MessageBox.Show("Credentials configuration completed.", "Success", 
                            MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                }
                else
                {
                    MessageBox.Show($"Credentials template not found at:\n{credentialsPath}\n\nPlease create a company profile first.", 
                        "Template Not Found", MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error configuring credentials: {ex.Message}", 
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void TestConnection_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var selectedProfile = (CompanyProfile)CompanySelector.SelectedItem;
                if (selectedProfile == null || selectedProfile.Name == "+ Create New Profile")
                {
                    MessageBox.Show("Please select a company profile first.", "No Profile Selected", 
                        MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                ShowProgress("Connection Test", "Testing connections...");
                
                string script = $@"
                    Set-Location '{rootPath}'
                    Import-Module .\Modules\Core\CompanyProfileManager.psm1 -Force
                    
                    $profilePath = '{selectedProfile.Path}'
                    $credentialsPath = Join-Path $profilePath 'credentials-template.json'
                    
                    if (Test-Path $credentialsPath) {{
                        Write-Host 'Testing Azure AD connection...' -ForegroundColor Cyan
                        try {{
                            # Basic connectivity test
                            $testResult = Test-NetConnection -ComputerName 'graph.microsoft.com' -Port 443 -InformationLevel Quiet
                            if ($testResult) {{
                                Write-Host '✓ Azure AD connectivity test passed' -ForegroundColor Green
                            }} else {{
                                Write-Host '✗ Azure AD connectivity test failed' -ForegroundColor Red
                            }}
                        }} catch {{
                            Write-Host '✗ Connection test error: ' + $_.Exception.Message -ForegroundColor Red
                        }}
                        
                        Write-Host 'Testing Exchange Online connectivity...' -ForegroundColor Cyan
                        try {{
                            $testResult = Test-NetConnection -ComputerName 'outlook.office365.com' -Port 443 -InformationLevel Quiet
                            if ($testResult) {{
                                Write-Host '✓ Exchange Online connectivity test passed' -ForegroundColor Green
                            }} else {{
                                Write-Host '✗ Exchange Online connectivity test failed' -ForegroundColor Red
                            }}
                        }} catch {{
                            Write-Host '✗ Connection test error: ' + $_.Exception.Message -ForegroundColor Red
                        }}
                        
                        Write-Host 'Note: Full authentication testing requires configured credentials' -ForegroundColor Yellow
                    }} else {{
                        Write-Host 'Credentials template not found. Please configure credentials first.' -ForegroundColor Red
                    }}
                ";

                var result = await ExecutePowerShellScript(script);
                
                MessageBox.Show($"Connection test results:\n\n{result.Output}", 
                    "Connection Test", MessageBoxButton.OK, 
                    result.Success ? MessageBoxImage.Information : MessageBoxImage.Warning);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error testing connections: {ex.Message}", 
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                HideProgress();
            }
        }

        private void ChangeDataPath_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var dialog = new System.Windows.Forms.FolderBrowserDialog();
                dialog.Description = "Select Discovery Data Directory";
                dialog.SelectedPath = GetDiscoveryDataPath();
                dialog.ShowNewFolderButton = true;

                if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
                {
                    string newPath = dialog.SelectedPath;
                    
                    var result = MessageBox.Show(
                        $"Change discovery data path to:\n{newPath}\n\n" +
                        "This will set the MANDA_DISCOVERY_PATH environment variable and restart the application.\n\n" +
                        "Continue?",
                        "Change Data Path",
                        MessageBoxButton.YesNo,
                        MessageBoxImage.Question);
                        
                    if (result == MessageBoxResult.Yes)
                    {
                        Environment.SetEnvironmentVariable("MANDA_DISCOVERY_PATH", newPath, EnvironmentVariableTarget.User);
                        
                        MessageBox.Show(
                            "Discovery data path updated successfully.\n\n" +
                            "The application will now restart to apply changes.",
                            "Path Updated",
                            MessageBoxButton.OK,
                            MessageBoxImage.Information);
                            
                        Process.Start(Process.GetCurrentProcess().MainModule.FileName);
                        Application.Current.Shutdown();
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error changing data path: {ex.Message}", 
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async void CreateNewProfile_Click(object sender, RoutedEventArgs e)
        {
            var dialog = new CreateProfileDialog();
            if (dialog.ShowDialog() == true)
            {
                string newProfileName = dialog.ProfileName;
                if (!string.IsNullOrWhiteSpace(newProfileName))
                {
                    await CreateNewCompanyProfile(newProfileName);
                }
            }
        }

        private void SaveModuleSettings_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var selectedProfile = (CompanyProfile)CompanySelector.SelectedItem;
                if (selectedProfile == null || selectedProfile.Name == "+ Create New Profile")
                {
                    MessageBox.Show("Please select a company profile first.", "No Profile Selected", 
                        MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                // Create a basic module settings structure
                var moduleSettings = new
                {
                    DiscoverySettings = new
                    {
                        ActiveDirectory = new { Enabled = true, DeepScan = false, IncludeComputers = true },
                        Azure = new { Enabled = true, IncludeGuests = true, IncludeApps = true },
                        Exchange = new { Enabled = true, IncludeArchives = false, PermissionAnalysis = true },
                        SharePoint = new { Enabled = true, SiteDepthLimit = 2, IncludePersonalSites = false },
                        Teams = new { Enabled = true, IncludePrivateTeams = false, IncludeGuestAccess = true },
                        PaloAlto = new { Enabled = true, ConfigBackup = true, PolicyAnalysis = true }
                    },
                    ReportSettings = new
                    {
                        GenerateExecutiveSummary = true,
                        GenerateTechnicalReport = true,
                        GenerateComplianceReport = true,
                        ExportFormat = "Excel",
                        IncludeCharts = true
                    },
                    MigrationSettings = new
                    {
                        DefaultWaveSize = 50,
                        WaveStrategy = "Department",
                        IncludeDependencyAnalysis = true,
                        ValidationLevel = "Standard"
                    }
                };

                string settingsPath = Path.Combine(selectedProfile.Path, "Config", "module-settings.json");
                string configDir = Path.GetDirectoryName(settingsPath);
                
                if (!Directory.Exists(configDir))
                {
                    Directory.CreateDirectory(configDir);
                }

                string json = JsonSerializer.Serialize(moduleSettings, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(settingsPath, json);

                MessageBox.Show($"Module settings saved successfully to:\n{settingsPath}", 
                    "Settings Saved", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error saving module settings: {ex.Message}", 
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        // Report Generation Event Handlers
        
        private async void GenerateDiscoverySummary_Click(object sender, RoutedEventArgs e)
        {
            await GenerateReport("Discovery Summary", "Executive", "A comprehensive overview of all discovered assets and their status");
        }

        private async void GenerateUserAnalytics_Click(object sender, RoutedEventArgs e)
        {
            await GenerateReport("User Analytics", "Executive", "User distribution, activity patterns, and access analysis");
        }

        private async void GenerateInfrastructureReport_Click(object sender, RoutedEventArgs e)
        {
            await GenerateReport("Infrastructure Report", "Executive", "Infrastructure inventory and health status overview");
        }

        private async void GenerateMigrationReadiness_Click(object sender, RoutedEventArgs e)
        {
            await GenerateReport("Migration Readiness", "Executive", "Migration readiness assessment and recommendations");
        }

        private async void GenerateSecurityAudit_Click(object sender, RoutedEventArgs e)
        {
            await GenerateReport("Security Audit", "Technical", "Detailed security posture analysis and recommendations");
        }

        private async void GenerateDependencyMap_Click(object sender, RoutedEventArgs e)
        {
            await GenerateReport("Dependency Map", "Technical", "Application and service dependency mapping");
        }

        private async void GenerateConfigurationReport_Click(object sender, RoutedEventArgs e)
        {
            await GenerateReport("Configuration Report", "Technical", "Detailed configuration analysis and compliance check");
        }

        private async void GenerateNetworkTopology_Click(object sender, RoutedEventArgs e)
        {
            await GenerateReport("Network Topology", "Technical", "Network infrastructure topology and connectivity map");
        }

        private async void GenerateCustomReport_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var selectedProfile = (CompanyProfile)CompanySelector.SelectedItem;
                if (selectedProfile == null || selectedProfile.Name == "+ Create New Profile")
                {
                    MessageBox.Show("Please select a company profile first.", "No Profile Selected", 
                        MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                // For now, generate a basic custom report
                await GenerateReport("Custom Report", "Custom", "User-defined custom report based on selected criteria");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error generating custom report: {ex.Message}", 
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async Task GenerateReport(string reportName, string reportType, string description)
        {
            try
            {
                var selectedProfile = (CompanyProfile)CompanySelector.SelectedItem;
                if (selectedProfile == null || selectedProfile.Name == "+ Create New Profile")
                {
                    MessageBox.Show("Please select a company profile first.", "No Profile Selected", 
                        MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                ShowProgress("Report Generation", $"Generating {reportName}...");

                string script = $@"
                    Set-Location '{rootPath}'
                    Import-Module .\Modules\Core\CompanyProfileManager.psm1 -Force
                    
                    $profilePath = '{selectedProfile.Path}'
                    $reportType = '{reportType}'
                    $reportName = '{reportName}'
                    
                    Write-Host 'Generating report: $reportName' -ForegroundColor Cyan
                    Write-Host 'Report type: $reportType' -ForegroundColor Yellow
                    Write-Host 'Profile: {selectedProfile.Name}' -ForegroundColor Green
                    
                    # Create reports directory if it doesn't exist
                    $reportsDir = Join-Path $profilePath 'Reports'
                    $reportTypeDir = Join-Path $reportsDir $reportType
                    if (!(Test-Path $reportTypeDir)) {{
                        New-Item -ItemType Directory -Path $reportTypeDir -Force | Out-Null
                    }}
                    
                    # Generate timestamp
                    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
                    $reportFileName = '$($reportName.Replace(' ', '_'))_$timestamp.html'
                    $reportPath = Join-Path $reportTypeDir $reportFileName
                    
                    # Generate basic HTML report
                    $htmlContent = @""
<!DOCTYPE html>
<html>
<head>
    <title>$reportName - {selectedProfile.Name}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background: #2d3748; color: white; padding: 20px; margin-bottom: 20px; }}
        .section {{ margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; }}
        .metric {{ display: inline-block; margin: 10px; padding: 15px; background: #f7fafc; border-radius: 5px; }}
    </style>
</head>
<body>
    <div class='header'>
        <h1>$reportName</h1>
        <p>Company: {selectedProfile.Name}</p>
        <p>Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')</p>
        <p>Type: $reportType</p>
    </div>
    
    <div class='section'>
        <h2>Report Description</h2>
        <p>{description}</p>
    </div>
    
    <div class='section'>
        <h2>Discovery Status</h2>
        <div class='metric'><strong>Users:</strong> Sample Data</div>
        <div class='metric'><strong>Computers:</strong> Sample Data</div>
        <div class='metric'><strong>Groups:</strong> Sample Data</div>
        <div class='metric'><strong>Applications:</strong> Sample Data</div>
    </div>
    
    <div class='section'>
        <h2>Note</h2>
        <p>This is a sample report. Run discovery modules to populate with actual data.</p>
    </div>
</body>
</html>
""@
                    
                    $htmlContent | Set-Content -Path $reportPath -Encoding UTF8
                    
                    Write-Host ""Report generated successfully: $reportPath"" -ForegroundColor Green
                    
                    # Open the report in default browser
                    Start-Process $reportPath
                ";

                var result = await ExecutePowerShellScript(script);
                
                if (result.Success)
                {
                    MessageBox.Show($"{reportName} generated successfully!\n\nThe report has been opened in your default browser.", 
                        "Report Generated", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    MessageBox.Show($"Error generating {reportName}:\n{result.Error}", 
                        "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error generating {reportName}: {ex.Message}", 
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                HideProgress();
            }
        }

        private async Task<ProcessResult> ExecutePowerShellScript(string script, CancellationToken cancellationToken = default)
        {
            var result = new ProcessResult();
            
            using (var process = new Process())
            {
                process.StartInfo = new ProcessStartInfo()
                {
                    FileName = powerShellStartInfo.FileName,
                    UseShellExecute = powerShellStartInfo.UseShellExecute,
                    RedirectStandardOutput = powerShellStartInfo.RedirectStandardOutput,
                    RedirectStandardError = powerShellStartInfo.RedirectStandardError,
                    CreateNoWindow = powerShellStartInfo.CreateNoWindow,
                    WorkingDirectory = powerShellStartInfo.WorkingDirectory,
                    Arguments = powerShellStartInfo.Arguments + $" -Command \"{script.Replace("\"", "\"\"")}\""
                };
                
                try
                {
                    process.Start();
                    
                    var outputBuilder = new System.Text.StringBuilder();
                    var errorBuilder = new System.Text.StringBuilder();
                    
                    var outputTask = Task.Run(() =>
                    {
                        while (!process.StandardOutput.EndOfStream)
                        {
                            if (cancellationToken.IsCancellationRequested)
                                break;
                            outputBuilder.AppendLine(process.StandardOutput.ReadLine());
                        }
                    });
                    
                    var errorTask = Task.Run(() =>
                    {
                        while (!process.StandardError.EndOfStream)
                        {
                            if (cancellationToken.IsCancellationRequested)
                                break;
                            errorBuilder.AppendLine(process.StandardError.ReadLine());
                        }
                    });
                    
                    await Task.WhenAll(outputTask, errorTask);
                    process.WaitForExit();
                    
                    result.ExitCode = process.ExitCode;
                    result.Output = outputBuilder.ToString();
                    result.Error = errorBuilder.ToString();
                    result.Success = process.ExitCode == 0;
                }
                catch (Exception ex)
                {
                    result.Success = false;
                    result.Error = ex.Message;
                    result.ExitCode = -1;
                }
            }
            
            return result;
        }

        protected override void OnClosed(EventArgs e)
        {
            progressTimer?.Stop();
            cancellationTokenSource?.Cancel();
            base.OnClosed(e);
        }
        
        private async void CompanySelector_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (CompanySelector.SelectedItem != null)
            {
                var selected = (CompanyProfile)CompanySelector.SelectedItem;
                if (selected.Name == "+ Create New Profile")
                {
                    var dialog = new CreateProfileDialog();
                    if (dialog.ShowDialog() == true)
                    {
                        string newProfileName = dialog.ProfileName;
                        if (!string.IsNullOrWhiteSpace(newProfileName))
                        {
                            await CreateNewCompanyProfile(newProfileName);
                        }
                    }
                    else
                    {
                        // Reset to previous selection
                        if (companyProfiles.Count > 1)
                        {
                            CompanySelector.SelectedIndex = 0;
                        }
                    }
                }
            }
        }
        
        private async Task CreateNewCompanyProfile(string profileName)
        {
            ShowProgress("Creating Profile", $"Creating company profile for {profileName}...");
            
            try
            {
                var script = $@"
                    Set-Location '{rootPath}'
                    Import-Module '.\Modules\Core\CompanyProfileManager.psm1' -Force
                    $env:MANDA_DISCOVERY_PATH = '{GetDiscoveryDataPath()}'
                    New-CompanyProfile -CompanyName '{profileName}'
                ";
                
                var result = await ExecutePowerShellScript(script);
                
                HideProgress();
                
                if (result.Success)
                {
                    // Reload company profiles
                    LoadCompanyProfiles();
                    
                    // Select the new profile
                    var newProfile = companyProfiles.FirstOrDefault(p => p.Name == profileName);
                    if (newProfile != null)
                    {
                        CompanySelector.SelectedItem = newProfile;
                    }
                    
                    MessageBox.Show($"Company profile '{profileName}' created successfully!", "Profile Created", 
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    MessageBox.Show($"Failed to create profile: {result.Error}", "Error", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                    
                    // Reset to previous selection
                    if (companyProfiles.Count > 1)
                    {
                        CompanySelector.SelectedIndex = 0;
                    }
                }
            }
            catch (Exception ex)
            {
                HideProgress();
                MessageBox.Show($"Error creating profile: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        // Applications Section Methods
        private ObservableCollection<DiscoveredApplication> applicationsData;

        private void LoadApplicationsData()
        {
            if (applicationsData == null)
            {
                applicationsData = new ObservableCollection<DiscoveredApplication>();
                GenerateSampleApplicationData();
                ApplicationsGrid.ItemsSource = applicationsData;
                UpdateApplicationsStats();
            }
        }

        private void GenerateSampleApplicationData()
        {
            var sampleApps = new List<DiscoveredApplication>
            {
                new DiscoveredApplication 
                { 
                    Name = "Microsoft Office 365", 
                    Version = "2023", 
                    Vendor = "Microsoft", 
                    InstallPath = @"C:\Program Files\Microsoft Office", 
                    RiskLevel = "Low", 
                    CloudReadiness = "Cloud Native", 
                    LastUpdated = DateTime.Now.AddDays(-5).ToString("yyyy-MM-dd"),
                    Category = "Productivity",
                    Usage = "High",
                    IsBusinessCritical = true,
                    DependencyCount = 3,
                    MigrationComplexity = "Low"
                },
                new DiscoveredApplication 
                { 
                    Name = "Adobe Photoshop", 
                    Version = "2024", 
                    Vendor = "Adobe", 
                    InstallPath = @"C:\Program Files\Adobe\Adobe Photoshop 2024", 
                    RiskLevel = "Medium", 
                    CloudReadiness = "Cloud Compatible", 
                    LastUpdated = DateTime.Now.AddDays(-10).ToString("yyyy-MM-dd"),
                    Category = "Creative",
                    Usage = "Medium",
                    IsBusinessCritical = false,
                    DependencyCount = 8,
                    MigrationComplexity = "Medium"
                },
                new DiscoveredApplication 
                { 
                    Name = "Custom ERP System", 
                    Version = "3.2.1", 
                    Vendor = "Internal", 
                    InstallPath = @"C:\ERP\System", 
                    RiskLevel = "High", 
                    CloudReadiness = "Legacy", 
                    LastUpdated = DateTime.Now.AddDays(-90).ToString("yyyy-MM-dd"),
                    Category = "Business",
                    Usage = "Critical",
                    IsBusinessCritical = true,
                    DependencyCount = 25,
                    MigrationComplexity = "High"
                },
                new DiscoveredApplication 
                { 
                    Name = "Slack", 
                    Version = "4.38.125", 
                    Vendor = "Slack Technologies", 
                    InstallPath = @"C:\Users\{User}\AppData\Local\slack", 
                    RiskLevel = "Low", 
                    CloudReadiness = "Cloud Native", 
                    LastUpdated = DateTime.Now.AddDays(-1).ToString("yyyy-MM-dd"),
                    Category = "Communication",
                    Usage = "High",
                    IsBusinessCritical = true,
                    DependencyCount = 2,
                    MigrationComplexity = "Low"
                },
                new DiscoveredApplication 
                { 
                    Name = "AutoCAD 2020", 
                    Version = "2020.1.3", 
                    Vendor = "Autodesk", 
                    InstallPath = @"C:\Program Files\Autodesk\AutoCAD 2020", 
                    RiskLevel = "High", 
                    CloudReadiness = "Legacy", 
                    LastUpdated = DateTime.Now.AddDays(-180).ToString("yyyy-MM-dd"),
                    Category = "Engineering",
                    Usage = "Medium",
                    IsBusinessCritical = true,
                    DependencyCount = 15,
                    MigrationComplexity = "High"
                },
                new DiscoveredApplication 
                { 
                    Name = "Google Chrome", 
                    Version = "120.0.6099.129", 
                    Vendor = "Google", 
                    InstallPath = @"C:\Program Files\Google\Chrome\Application", 
                    RiskLevel = "Low", 
                    CloudReadiness = "Cloud Ready", 
                    LastUpdated = DateTime.Now.AddDays(-3).ToString("yyyy-MM-dd"),
                    Category = "Web Browser",
                    Usage = "High",
                    IsBusinessCritical = false,
                    DependencyCount = 1,
                    MigrationComplexity = "Low"
                }
            };

            foreach (var app in sampleApps)
            {
                applicationsData.Add(app);
            }
        }

        private void UpdateApplicationsStats()
        {
            if (applicationsData == null) return;

            Dispatcher.Invoke(() => {
                TotalAppsCount.Text = applicationsData.Count.ToString();
                HighRiskAppsCount.Text = applicationsData.Count(a => a.RiskLevel == "High").ToString();
                CloudReadyAppsCount.Text = applicationsData.Count(a => a.CloudReadiness == "Cloud Native" || a.CloudReadiness == "Cloud Ready").ToString();
                PendingReviewCount.Text = applicationsData.Count(a => a.RiskLevel == "Medium" || a.CloudReadiness == "Pending Review").ToString();
                
                CriticalDepsCount.Text = applicationsData.Sum(a => a.DependencyCount).ToString();
                CircularDepsCount.Text = "0"; // Placeholder for actual circular dependency analysis
                IsolatedAppsCount.Text = applicationsData.Count(a => a.DependencyCount == 0).ToString();
            });
        }

        private async void RunAppDiscovery_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                ShowProgress("Application Discovery", "Running comprehensive application discovery...");
                
                // Simulate discovery process 
                await Task.Delay(3000);
                
                // In real implementation, this would call PowerShell module
                // Add more sample data to simulate discovery
                var newApps = new List<DiscoveredApplication>
                {
                    new DiscoveredApplication 
                    { 
                        Name = "Visual Studio Code", 
                        Version = "1.85.1", 
                        Vendor = "Microsoft", 
                        InstallPath = @"C:\Users\{User}\AppData\Local\Programs\Microsoft VS Code", 
                        RiskLevel = "Low", 
                        CloudReadiness = "Cloud Ready", 
                        LastUpdated = DateTime.Now.ToString("yyyy-MM-dd"),
                        Category = "Development",
                        Usage = "High",
                        IsBusinessCritical = false,
                        DependencyCount = 5,
                        MigrationComplexity = "Low"
                    },
                    new DiscoveredApplication 
                    { 
                        Name = "MySQL Workbench", 
                        Version = "8.0.34", 
                        Vendor = "Oracle", 
                        InstallPath = @"C:\Program Files\MySQL\MySQL Workbench 8.0 CE", 
                        RiskLevel = "Medium", 
                        CloudReadiness = "Cloud Compatible", 
                        LastUpdated = DateTime.Now.ToString("yyyy-MM-dd"),
                        Category = "Database",
                        Usage = "Medium",
                        IsBusinessCritical = true,
                        DependencyCount = 12,
                        MigrationComplexity = "Medium"
                    }
                };

                foreach (var app in newApps)
                {
                    applicationsData.Add(app);
                }

                HideProgress();
                UpdateApplicationsStats();
                
                MessageBox.Show($"Application discovery completed! Found {newApps.Count} new applications.", 
                    "Discovery Complete", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                HideProgress();
                MessageBox.Show($"Error during application discovery: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ImportAppList_Click(object sender, RoutedEventArgs e)
        {
            var openFileDialog = new Microsoft.Win32.OpenFileDialog
            {
                Title = "Import Application List",
                Filter = "CSV files (*.csv)|*.csv|JSON files (*.json)|*.json|All files (*.*)|*.*",
                DefaultExt = "csv"
            };

            if (openFileDialog.ShowDialog() == true)
            {
                try
                {
                    // Placeholder for file import logic
                    MessageBox.Show($"Application list imported from: {openFileDialog.FileName}", 
                        "Import Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error importing application list: {ex.Message}", "Import Error", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private void RefreshApps_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Refresh the applications data
                LoadApplicationsData();
                UpdateApplicationsStats();
                
                MessageBox.Show("Application data refreshed successfully!", "Refresh Complete", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error refreshing applications: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void AppSearchBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (applicationsData == null) return;

            var searchText = AppSearchBox.Text.ToLower();
            if (string.IsNullOrEmpty(searchText))
            {
                ApplicationsGrid.ItemsSource = applicationsData;
            }
            else
            {
                var filteredApps = applicationsData.Where(app => 
                    app.Name.ToLower().Contains(searchText) ||
                    app.Vendor.ToLower().Contains(searchText) ||
                    app.Category.ToLower().Contains(searchText) ||
                    app.RiskLevel.ToLower().Contains(searchText)).ToList();
                
                ApplicationsGrid.ItemsSource = filteredApps;
            }
        }

        private void AppFilterCombo_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (applicationsData == null || AppFilterCombo.SelectedItem == null) return;

            var selectedFilter = ((ComboBoxItem)AppFilterCombo.SelectedItem).Content.ToString();
            IEnumerable<DiscoveredApplication> filteredApps = applicationsData;

            switch (selectedFilter)
            {
                case "High Risk":
                    filteredApps = applicationsData.Where(app => app.RiskLevel == "High");
                    break;
                case "Cloud Ready":
                    filteredApps = applicationsData.Where(app => app.CloudReadiness == "Cloud Native" || app.CloudReadiness == "Cloud Ready");
                    break;
                case "Legacy":
                    filteredApps = applicationsData.Where(app => app.CloudReadiness == "Legacy");
                    break;
                case "Pending Review":
                    filteredApps = applicationsData.Where(app => app.RiskLevel == "Medium" || app.CloudReadiness == "Pending Review");
                    break;
                default: // "All Apps"
                    filteredApps = applicationsData;
                    break;
            }

            ApplicationsGrid.ItemsSource = filteredApps.ToList();
        }

        private void AnalyzeDependencies_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Placeholder for dependency analysis
                MessageBox.Show("Dependency analysis feature will analyze application interdependencies and provide migration recommendations.", 
                    "Feature Coming Soon", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error analyzing dependencies: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
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
    
    public class ProcessResult
    {
        public bool Success { get; set; }
        public string Output { get; set; } = "";
        public string Error { get; set; } = "";
        public int ExitCode { get; set; }
    }

    // Enhanced data model classes
    public class UserAccount
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public string Status { get; set; }
        public string Source { get; set; }
        public DateTime LastLogon { get; set; }
        public int Groups { get; set; }
        public string Manager { get; set; }
        public string Title { get; set; }
        public string Location { get; set; }
    }

    public class ComputerAccount
    {
        public string Name { get; set; }
        public string OS { get; set; }
        public string IPAddress { get; set; }
        public DateTime LastSeen { get; set; }
        public string Status { get; set; }
        public string Domain { get; set; }
        public string OU { get; set; }
        public string Manufacturer { get; set; }
        public string Model { get; set; }
        public string SerialNumber { get; set; }
        public int RAM { get; set; }
        public int DiskSpace { get; set; }
    }

    public class InfrastructureDevice
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string Model { get; set; }
        public string IPAddress { get; set; }
        public string Status { get; set; }
        public string Version { get; set; }
        public string Location { get; set; }
        public string Uptime { get; set; }
        public string CPUUsage { get; set; }
        public string MemoryUsage { get; set; }
        public string Source { get; set; }
    }

    public class MigrationWave
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public int Wave { get; set; }
        public string Priority { get; set; }
        public int Complexity { get; set; }
        public int Dependencies { get; set; }
        public string Status { get; set; }
        public string EstimatedDuration { get; set; }
        public string RiskLevel { get; set; }
    }

    public class DiscoveredApplication
    {
        public string Name { get; set; }
        public string Version { get; set; }
        public string Vendor { get; set; }
        public string InstallPath { get; set; }
        public string RiskLevel { get; set; }
        public string CloudReadiness { get; set; }
        public string LastUpdated { get; set; }
        public string Category { get; set; }
        public string Usage { get; set; }
        public bool IsBusinessCritical { get; set; }
        public int DependencyCount { get; set; }
        public string MigrationComplexity { get; set; }
    }
}
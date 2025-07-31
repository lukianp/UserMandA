using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management.Automation;
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
            
            ShowProgress($"Running {module.Name}", "Initializing module...");
            
            try
            {
                module.Status = "Running";
                module.StatusColor = "#FFFFA726";
                
                await Task.Run(() =>
                {
                    // Simulate module execution
                    for (int i = 0; i <= 100; i += 10)
                    {
                        System.Threading.Thread.Sleep(500);
                        Dispatcher.Invoke(() => UpdateProgress($"Processing... {i}%", i));
                    }
                });
                
                module.Status = "Completed";
                module.StatusColor = "#FF4CAF50";
                
                HideProgress();
                MessageBox.Show($"{module.Name} discovery completed successfully!", "Module Complete", 
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                module.Status = "Failed";
                module.StatusColor = "#FFF44336";
                
                HideProgress();
                MessageBox.Show($"Module failed: {ex.Message}", "Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ViewType_Changed(object sender, RoutedEventArgs e)
        {
            LoadViewData();
        }

        private void LoadViewData()
        {
            // Load appropriate data based on selected view type
            if (UserViewRadio.IsChecked == true)
            {
                // Load user data
                var userData = new List<dynamic>
                {
                    new { Name = "John Doe", Email = "john.doe@company.com", Department = "IT", Status = "Active" },
                    new { Name = "Jane Smith", Email = "jane.smith@company.com", Department = "HR", Status = "Active" }
                };
                ViewDataGrid.ItemsSource = userData;
            }
            else if (ComputerViewRadio.IsChecked == true)
            {
                // Load computer data
                var computerData = new List<dynamic>
                {
                    new { Name = "DESKTOP-001", OS = "Windows 11", LastSeen = DateTime.Now.AddHours(-2), Status = "Online" },
                    new { Name = "LAPTOP-002", OS = "Windows 10", LastSeen = DateTime.Now.AddDays(-1), Status = "Offline" }
                };
                ViewDataGrid.ItemsSource = computerData;
            }
            // Add more view types as needed
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
}
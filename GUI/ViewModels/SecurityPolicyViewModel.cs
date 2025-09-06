using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Collections;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the integrated Security Policy and Group Policy view
    /// Provides comprehensive security assessment capabilities for M&A teams
    /// </summary>
    public class SecurityPolicyViewModel : BaseViewModel
    {
        private readonly ICsvDataLoader _csvDataLoader;
        private readonly ILogger<SecurityPolicyViewModel> _logger;
        
        // Tab Management
        private string _activeTab = "Dashboard";
        
        // Dashboard Properties
        private int _overallSecurityScore = 0;
        private int _activeGPOCount = 0;
        private int _highRiskGroupsCount = 0;
        private int _activeThreatsCount = 0;
        private int _compliancePercentage = 0;
        private string _environmentType = "Detecting...";
        private EnvironmentInfo _environmentInfo;
        
        // Search and Filtering
        private string _searchText = string.Empty;
        private string _selectedSeverityFilter = "All";
        private string _selectedStatusFilter = "All";
        private bool _showEnabledOnly = false;
        private bool _showRecentlyModified = false;
        
        // Collection Views
        private ICollectionView _filteredGPOs;
        private ICollectionView _filteredSecurityGroups;
        private ICollectionView _filteredThreats;
        private ICollectionView _filteredComplianceControls;
        private ICollectionView _filteredCriticalIssues;
        
        // Loading States
        private bool _isDashboardLoading = false;
        private bool _isGPOLoading = false;
        private bool _isSecurityGroupsLoading = false;
        private bool _isInfrastructureLoading = false;
        private bool _isThreatsLoading = false;
        private bool _isComplianceLoading = false;

        public SecurityPolicyViewModel(ILogger<SecurityPolicyViewModel> logger = null)
        {
            try
            {
                _logger = logger;
                // Use the injected ICsvDataLoader from the service locator
                _csvDataLoader = SimpleServiceLocator.Instance.GetService<ICsvDataLoader>();
                
                InitializeCollections();
                InitializeCollectionViews();
                InitializeCommands();
                InitializeEnvironmentDetection();
                
                TabTitle = "Security & Group Policy";
                CanClose = true;
                
                _logger?.LogDebug("[SecurityPolicyViewModel] Constructor completed successfully");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[SecurityPolicyViewModel] Constructor failed");
                HasErrors = true;
                LastError = $"Failed to initialize Security Policy view: {ex.Message}";
                
                // Initialize minimum required properties to prevent further crashes
                TabTitle = "Security & Group Policy";
                CanClose = true;
                InitializeCollections();
            }
        }

        #region Properties

        // Tab Management
        public string ActiveTab
        {
            get => _activeTab;
            set => SetProperty(ref _activeTab, value);
        }

        // Dashboard KPIs
        public int OverallSecurityScore
        {
            get => _overallSecurityScore;
            set => SetProperty(ref _overallSecurityScore, value);
        }

        public int ActiveGPOCount
        {
            get => _activeGPOCount;
            set => SetProperty(ref _activeGPOCount, value);
        }

        public int HighRiskGroupsCount
        {
            get => _highRiskGroupsCount;
            set => SetProperty(ref _highRiskGroupsCount, value);
        }

        public int ActiveThreatsCount
        {
            get => _activeThreatsCount;
            set => SetProperty(ref _activeThreatsCount, value);
        }

        public int CompliancePercentage
        {
            get => _compliancePercentage;
            set => SetProperty(ref _compliancePercentage, value);
        }

        public string EnvironmentType
        {
            get => _environmentType;
            set => SetProperty(ref _environmentType, value);
        }

        public EnvironmentInfo EnvironmentInfo
        {
            get => _environmentInfo;
            set => SetProperty(ref _environmentInfo, value);
        }

        // Search and Filtering
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    RefreshFilters();
                }
            }
        }

        public string SelectedSeverityFilter
        {
            get => _selectedSeverityFilter;
            set
            {
                if (SetProperty(ref _selectedSeverityFilter, value))
                {
                    RefreshFilters();
                }
            }
        }

        public string SelectedStatusFilter
        {
            get => _selectedStatusFilter;
            set
            {
                if (SetProperty(ref _selectedStatusFilter, value))
                {
                    RefreshFilters();
                }
            }
        }

        public bool ShowEnabledOnly
        {
            get => _showEnabledOnly;
            set
            {
                if (SetProperty(ref _showEnabledOnly, value))
                {
                    RefreshFilters();
                }
            }
        }

        public bool ShowRecentlyModified
        {
            get => _showRecentlyModified;
            set
            {
                if (SetProperty(ref _showRecentlyModified, value))
                {
                    RefreshFilters();
                }
            }
        }

        // Collections
        public OptimizedObservableCollection<GroupPolicyObject> GroupPolicies { get; private set; }
        public OptimizedObservableCollection<SecurityGroup> SecurityGroups { get; private set; }
        public OptimizedObservableCollection<AntivirusProduct> AntivirusProducts { get; private set; }
        public OptimizedObservableCollection<FirewallProfile> FirewallProfiles { get; private set; }
        public OptimizedObservableCollection<SecurityAppliance> SecurityAppliances { get; private set; }
        public OptimizedObservableCollection<SecurityThreatIndicator> ThreatIndicators { get; private set; }
        public OptimizedObservableCollection<ComplianceControl> ComplianceControls { get; private set; }
        public OptimizedObservableCollection<CriticalIssue> CriticalIssues { get; private set; }
        public OptimizedObservableCollection<SecurityKPI> SecurityKPIs { get; private set; }

        // Filtered Collection Views
        public ICollectionView FilteredGPOs
        {
            get => _filteredGPOs;
            private set => SetProperty(ref _filteredGPOs, value);
        }

        public ICollectionView FilteredSecurityGroups
        {
            get => _filteredSecurityGroups;
            private set => SetProperty(ref _filteredSecurityGroups, value);
        }

        public ICollectionView FilteredThreats
        {
            get => _filteredThreats;
            private set => SetProperty(ref _filteredThreats, value);
        }

        public ICollectionView FilteredComplianceControls
        {
            get => _filteredComplianceControls;
            private set => SetProperty(ref _filteredComplianceControls, value);
        }

        public ICollectionView FilteredCriticalIssues
        {
            get => _filteredCriticalIssues;
            private set => SetProperty(ref _filteredCriticalIssues, value);
        }

        // Loading States
        public bool IsDashboardLoading
        {
            get => _isDashboardLoading;
            set => SetProperty(ref _isDashboardLoading, value);
        }

        public bool IsGPOLoading
        {
            get => _isGPOLoading;
            set => SetProperty(ref _isGPOLoading, value);
        }

        public bool IsSecurityGroupsLoading
        {
            get => _isSecurityGroupsLoading;
            set => SetProperty(ref _isSecurityGroupsLoading, value);
        }

        public bool IsInfrastructureLoading
        {
            get => _isInfrastructureLoading;
            set => SetProperty(ref _isInfrastructureLoading, value);
        }

        public bool IsThreatsLoading
        {
            get => _isThreatsLoading;
            set => SetProperty(ref _isThreatsLoading, value);
        }

        public bool IsComplianceLoading
        {
            get => _isComplianceLoading;
            set => SetProperty(ref _isComplianceLoading, value);
        }

        // Filter Options
        public ObservableCollection<string> SeverityFilterOptions { get; } = new()
        {
            "All", "Critical", "High", "Medium", "Low"
        };

        public ObservableCollection<string> StatusFilterOptions { get; } = new()
        {
            "All", "Active", "Inactive", "Warning", "Error"
        };

        #endregion

        #region Commands

        public ICommand NavigateTabCommand { get; private set; }
        public ICommand RefreshDataCommand { get; private set; }
        public ICommand ClearFiltersCommand { get; private set; }
        public ICommand ExportDataCommand { get; private set; }
        public ICommand ShowGPODetailsCommand { get; private set; }
        public ICommand ShowGroupDetailsCommand { get; private set; }
        public ICommand ShowThreatDetailsCommand { get; private set; }
        public ICommand RemediateThreatCommand { get; private set; }
        public ICommand GenerateReportCommand { get; private set; }

        #endregion

        #region Initialization

        private void InitializeCollections()
        {
            GroupPolicies = new OptimizedObservableCollection<GroupPolicyObject>();
            SecurityGroups = new OptimizedObservableCollection<SecurityGroup>();
            AntivirusProducts = new OptimizedObservableCollection<AntivirusProduct>();
            FirewallProfiles = new OptimizedObservableCollection<FirewallProfile>();
            SecurityAppliances = new OptimizedObservableCollection<SecurityAppliance>();
            ThreatIndicators = new OptimizedObservableCollection<SecurityThreatIndicator>();
            ComplianceControls = new OptimizedObservableCollection<ComplianceControl>();
            CriticalIssues = new OptimizedObservableCollection<CriticalIssue>();
            SecurityKPIs = new OptimizedObservableCollection<SecurityKPI>();
        }

        private void InitializeCollectionViews()
        {
            try
            {
                FilteredGPOs = CollectionViewSource.GetDefaultView(GroupPolicies);
                if (FilteredGPOs != null)
                    FilteredGPOs.Filter = FilterGPO;

                FilteredSecurityGroups = CollectionViewSource.GetDefaultView(SecurityGroups);
                if (FilteredSecurityGroups != null)
                    FilteredSecurityGroups.Filter = FilterSecurityGroup;

                FilteredThreats = CollectionViewSource.GetDefaultView(ThreatIndicators);
                if (FilteredThreats != null)
                    FilteredThreats.Filter = FilterThreat;

                FilteredComplianceControls = CollectionViewSource.GetDefaultView(ComplianceControls);
                if (FilteredComplianceControls != null)
                    FilteredComplianceControls.Filter = FilterComplianceControl;

                FilteredCriticalIssues = CollectionViewSource.GetDefaultView(CriticalIssues);
                if (FilteredCriticalIssues != null)
                    FilteredCriticalIssues.Filter = FilterCriticalIssue;
                    
                _logger?.LogDebug("[SecurityPolicyViewModel] Collection views initialized successfully");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[SecurityPolicyViewModel] Failed to initialize collection views");
            }
        }

        protected override void InitializeCommands()
        {
            base.InitializeCommands(); // Call base class implementation
            
            NavigateTabCommand = new RelayCommand<string>(ExecuteNavigateTab);
            RefreshDataCommand = new AsyncRelayCommand(LoadAsync);
            ClearFiltersCommand = new RelayCommand(ExecuteClearFilters);
            ExportDataCommand = new RelayCommand<string>(ExecuteExportData);
            ShowGPODetailsCommand = new RelayCommand<GroupPolicyObject>(ExecuteShowGPODetails);
            ShowGroupDetailsCommand = new RelayCommand<SecurityGroup>(ExecuteShowGroupDetails);
            ShowThreatDetailsCommand = new RelayCommand<SecurityThreatIndicator>(ExecuteShowThreatDetails);
            RemediateThreatCommand = new RelayCommand<SecurityThreatIndicator>(ExecuteRemediateThreat);
            GenerateReportCommand = new RelayCommand<string>(ExecuteGenerateReport);
        }

        private void InitializeEnvironmentDetection()
        {
            _environmentInfo = new EnvironmentInfo
            {
                Type = "Detecting...",
                HasAzureAD = false,
                HasOnPremAD = false,
                HasExchange = false,
                HasOffice365 = false,
                DiscoveredModules = new List<string>()
            };
        }

        #endregion

        #region Data Loading

        public override async Task LoadAsync()
        {
            var sw = Stopwatch.StartNew();
            try
            {
                IsLoading = true;
                LastError = null;
                HasErrors = false;
                RaiseAllLoadingProperties();

                _logger?.LogInformation("[SecurityPolicyViewModel] Starting comprehensive security data load");

                // Clear existing data
                System.Windows.Application.Current.Dispatcher.Invoke(() =>
                {
                    GroupPolicies.Clear();
                    SecurityGroups.Clear();
                    AntivirusProducts.Clear();
                    FirewallProfiles.Clear();
                    SecurityAppliances.Clear();
                    ThreatIndicators.Clear();
                    ComplianceControls.Clear();
                    CriticalIssues.Clear();
                    SecurityKPIs.Clear();
                });

                // Load all security data in parallel
                var loadTasks = new List<Task>
                {
                    LoadGroupPoliciesAsync(),
                    LoadSecurityGroupsAsync(),
                    LoadInfrastructureSecurityAsync(),
                    LoadThreatIndicatorsAsync(),
                    LoadComplianceDataAsync(),
                    LoadCriticalIssuesAsync()
                };

                await Task.WhenAll(loadTasks);

                // Calculate dashboard metrics
                CalculateDashboardMetrics();

                // Detect environment type
                DetectEnvironmentType();

                // Update HasData
                HasData = GroupPolicies.Count > 0 || SecurityGroups.Count > 0 || 
                         ThreatIndicators.Count > 0 || ComplianceControls.Count > 0;

                _logger?.LogInformation($"[SecurityPolicyViewModel] Security data loaded successfully in {sw.ElapsedMilliseconds}ms");
            }
            catch (Exception ex)
            {
                LastError = $"Failed to load security data: {ex.Message}";
                HasErrors = true;
                _logger?.LogError(ex, "[SecurityPolicyViewModel] Error loading security data");
            }
            finally
            {
                IsLoading = false;
                RaiseAllLoadingProperties();
            }
        }

        private async Task LoadGroupPoliciesAsync()
        {
            try
            {
                IsGPOLoading = true;
                var result = await _csvDataLoader.LoadGroupPoliciesAsync("ljpops");
                
                if (result.IsSuccess && result.Data != null)
                {
                    var gpoPolicies = result.Data.Select(ConvertToGroupPolicyObject).ToList();
                    
                    System.Windows.Application.Current.Dispatcher.Invoke(() =>
                    {
                        foreach (var gpo in gpoPolicies)
                        {
                            GroupPolicies.Add(gpo);
                        }
                    });

                    _logger?.LogInformation($"[SecurityPolicyViewModel] Loaded {gpoPolicies.Count} Group Policy Objects");
                }

                // Add any warnings to HeaderWarnings
                if (result.HeaderWarnings != null && result.HeaderWarnings.Any())
                {
                    System.Windows.Application.Current.Dispatcher.Invoke(() =>
                    {
                        foreach (var warning in result.HeaderWarnings)
                        {
                            HeaderWarnings.Add($"GPO: {warning}");
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[SecurityPolicyViewModel] Error loading Group Policies");
            }
            finally
            {
                IsGPOLoading = false;
            }
        }

        private async Task LoadSecurityGroupsAsync()
        {
            try
            {
                IsSecurityGroupsLoading = true;
                var result = await _csvDataLoader.LoadGroupsAsync("ljpops");
                
                if (result.IsSuccess && result.Data != null)
                {
                    var securityGroups = result.Data.Select(ConvertToSecurityGroup).ToList();
                    
                    System.Windows.Application.Current.Dispatcher.Invoke(() =>
                    {
                        foreach (var group in securityGroups)
                        {
                            SecurityGroups.Add(group);
                        }
                    });

                    _logger?.LogInformation($"[SecurityPolicyViewModel] Loaded {securityGroups.Count} Security Groups");
                }

                if (result.HeaderWarnings != null && result.HeaderWarnings.Any())
                {
                    System.Windows.Application.Current.Dispatcher.Invoke(() =>
                    {
                        foreach (var warning in result.HeaderWarnings)
                        {
                            HeaderWarnings.Add($"Groups: {warning}");
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[SecurityPolicyViewModel] Error loading Security Groups");
            }
            finally
            {
                IsSecurityGroupsLoading = false;
            }
        }

        private async Task LoadInfrastructureSecurityAsync()
        {
            try
            {
                IsInfrastructureLoading = true;
                
                // Try to load real infrastructure security data from CSV
                await Task.Run(async () =>
                {
                    try
                    {
                        // Load security data from CSV files if available
                        // Collections will remain empty if no data found - showing proper empty state
                        System.Windows.Application.Current.Dispatcher.Invoke(() =>
                        {
                            AntivirusProducts.Clear();
                            FirewallProfiles.Clear();
                            SecurityAppliances.Clear();
                        });
                        
                        // TODO: Load real CSV data when security discovery modules are available
                        // For now, collections remain empty to show proper empty state handling
                    }
                    catch (Exception ex)
                    {
                        ErrorMessage = $"Failed to load security data: {ex.Message}";
                    }
                });

                _logger?.LogInformation("[SecurityPolicyViewModel] Loaded Infrastructure Security data");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[SecurityPolicyViewModel] Error loading Infrastructure Security");
            }
            finally
            {
                IsInfrastructureLoading = false;
            }
        }

        private async Task LoadThreatIndicatorsAsync()
        {
            try
            {
                IsThreatsLoading = true;
                
                // Load real threat indicators from CSV data when available
                await Task.Run(() =>
                {
                    // Collections will remain empty if no CSV data is found - showing proper empty state
                    System.Windows.Application.Current.Dispatcher.Invoke(() =>
                    {
                        ThreatIndicators.Clear();
                        // TODO: Load real CSV data when threat indicator discovery modules are available
                    });
                });

                _logger?.LogInformation($"[SecurityPolicyViewModel] Loaded {ThreatIndicators.Count} Threat Indicators");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[SecurityPolicyViewModel] Error loading Threat Indicators");
            }
            finally
            {
                IsThreatsLoading = false;
            }
        }

        private async Task LoadComplianceDataAsync()
        {
            try
            {
                IsComplianceLoading = true;
                
                // Load real compliance controls from CSV data when available
                await Task.Run(() =>
                {
                    // Collections will remain empty if no CSV data is found - showing proper empty state
                    System.Windows.Application.Current.Dispatcher.Invoke(() =>
                    {
                        ComplianceControls.Clear();
                        // TODO: Load real CSV data when compliance discovery modules are available
                    });
                });

                _logger?.LogInformation($"[SecurityPolicyViewModel] Loaded {ComplianceControls.Count} Compliance Controls");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[SecurityPolicyViewModel] Error loading Compliance data");
            }
            finally
            {
                IsComplianceLoading = false;
            }
        }

        private async Task LoadCriticalIssuesAsync()
        {
            try
            {
                // Load real critical issues from CSV data when available
                await Task.Run(() =>
                {
                    // Collections will remain empty if no CSV data is found - showing proper empty state
                    System.Windows.Application.Current.Dispatcher.Invoke(() =>
                    {
                        CriticalIssues.Clear();
                        // TODO: Load real CSV data when critical issue discovery modules are available
                    });
                });

                _logger?.LogInformation($"[SecurityPolicyViewModel] Loaded {CriticalIssues.Count} Critical Issues");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[SecurityPolicyViewModel] Error loading Critical Issues");
            }
        }

        #endregion

        #region Data Conversion Methods

        private GroupPolicyObject ConvertToGroupPolicyObject(PolicyData policy)
        {
            return new GroupPolicyObject(
                Name: policy.Name,
                DisplayName: policy.Name,
                Path: policy.Path,
                Domain: ExtractDomainFromPath(policy.Path),
                LinkedOUs: policy.LinkedOUs,
                Enabled: policy.Enabled,
                ComputerSettingsEnabled: policy.ComputerSettingsEnabled,
                UserSettingsEnabled: policy.UserSettingsEnabled,
                HasWMIFilter: !string.IsNullOrEmpty(policy.Description) && policy.Description.Contains("WMI"),
                WMIFilter: policy.Description?.Contains("WMI") == true ? "Custom WMI Filter" : null,
                SecurityFiltering: "Authenticated Users", // Default
                PolicySettings: DeriveSettingsFromDescription(policy.Description),
                CreatedTime: policy.CreatedTime,
                ModifiedTime: policy.ModifiedTime,
                Description: policy.Description,
                Owner: "Domain Admins", // Default
                LastModifiedBy: "System", // Default
                Version: 1,
                Status: policy.Enabled ? "Active" : "Disabled"
            );
        }

        private SecurityGroup ConvertToSecurityGroup(GroupData group)
        {
            var isPrivileged = DetermineIfPrivileged(group.DisplayName);
            return new SecurityGroup(
                DisplayName: group.DisplayName,
                GroupType: group.GroupType,
                Domain: "domain.local", // Default
                MailEnabled: group.MailEnabled,
                SecurityEnabled: group.SecurityEnabled,
                Mail: group.Mail,
                Description: group.Description,
                ManagedBy: "IT Security Team", // Default
                CreatedDateTime: group.CreatedDateTime,
                LastModified: group.CreatedDateTime,
                MemberCount: group.MemberCount,
                OwnerCount: group.OwnerCount,
                Visibility: group.Visibility,
                IsPrivileged: isPrivileged,
                NestedGroups: isPrivileged ? "Yes" : "No",
                Permissions: DerivePermissionsFromGroupType(group.GroupType, isPrivileged),
                RiskFactors: CalculateGroupRiskFactors(group.DisplayName, group.MemberCount, isPrivileged)
            );
        }

        #endregion

        #region Helper Methods

        private string ExtractDomainFromPath(string path)
        {
            if (string.IsNullOrEmpty(path)) return "Unknown";
            var parts = path.Split(',');
            var dcParts = parts.Where(p => p.Trim().StartsWith("DC=", StringComparison.OrdinalIgnoreCase)).ToList();
            return dcParts.Any() ? string.Join(".", dcParts.Select(dc => dc.Trim().Substring(3))) : "Unknown";
        }

        private string DeriveSettingsFromDescription(string description)
        {
            if (string.IsNullOrEmpty(description)) return "Standard Settings";
            if (description.Contains("Security", StringComparison.OrdinalIgnoreCase)) return "Security Settings";
            if (description.Contains("Admin", StringComparison.OrdinalIgnoreCase)) return "Administrative Settings";
            return "Standard Settings";
        }

        private bool DetermineIfPrivileged(string groupName)
        {
            if (string.IsNullOrEmpty(groupName)) return false;
            
            var privilegedKeywords = new[] { "admin", "domain", "enterprise", "schema", "backup", "operator", "power" };
            return privilegedKeywords.Any(keyword => groupName.Contains(keyword, StringComparison.OrdinalIgnoreCase));
        }

        private string DerivePermissionsFromGroupType(string groupType, bool isPrivileged)
        {
            if (isPrivileged) return "High: Administrative Access";
            if (groupType?.Contains("Security") == true) return "Medium: Resource Access";
            return "Low: Standard Access";
        }

        private string CalculateGroupRiskFactors(string groupName, int memberCount, bool isPrivileged)
        {
            var factors = new List<string>();
            
            if (isPrivileged) factors.Add("Privileged Group");
            if (memberCount > 100) factors.Add("Large Membership");
            if (memberCount == 0) factors.Add("Empty Group");
            if (string.IsNullOrEmpty(groupName)) factors.Add("Missing Name");
            
            return factors.Any() ? string.Join(", ", factors) : "None";
        }

        private void DetectEnvironmentType()
        {
            var hasAzureData = SecurityGroups.Any(g => g.Domain?.Contains("onmicrosoft") == true);
            var hasOnPremData = SecurityGroups.Any(g => !string.IsNullOrEmpty(g.Domain) && !g.Domain.Contains("onmicrosoft"));
            
            _environmentInfo.HasAzureAD = hasAzureData;
            _environmentInfo.HasOnPremAD = hasOnPremData;
            
            if (hasAzureData && hasOnPremData)
            {
                _environmentInfo.Type = "Hybrid";
                EnvironmentType = "🔄 Hybrid Environment";
            }
            else if (hasAzureData)
            {
                _environmentInfo.Type = "Azure";
                EnvironmentType = "☁️ Azure Environment";
            }
            else
            {
                _environmentInfo.Type = "OnPrem";
                EnvironmentType = "🏢 On-Premises";
            }
        }

        private void CalculateDashboardMetrics()
        {
            // Calculate overall security score based on multiple factors
            var scoreFactors = new List<int>();
            
            // GPO health score
            if (GroupPolicies.Any())
            {
                var enabledGPOs = GroupPolicies.Count(g => g.Enabled);
                var gpoScore = (int)((double)enabledGPOs / GroupPolicies.Count * 100);
                scoreFactors.Add(gpoScore);
            }
            
            // Group risk score
            if (SecurityGroups.Any())
            {
                var lowRiskGroups = SecurityGroups.Count(g => g.RiskLevel == "Low");
                var groupScore = (int)((double)lowRiskGroups / SecurityGroups.Count * 100);
                scoreFactors.Add(groupScore);
            }
            
            // Compliance score
            if (ComplianceControls.Any())
            {
                var compliantControls = ComplianceControls.Count(c => c.IsCompliant);
                var complianceScore = (int)((double)compliantControls / ComplianceControls.Count * 100);
                scoreFactors.Add(complianceScore);
                CompliancePercentage = complianceScore;
            }
            
            // Threat response score
            if (ThreatIndicators.Any())
            {
                var resolvedThreats = ThreatIndicators.Count(t => !t.IsActive);
                var threatScore = (int)((double)resolvedThreats / ThreatIndicators.Count * 100);
                scoreFactors.Add(threatScore);
            }
            
            // Calculate weighted average
            OverallSecurityScore = scoreFactors.Any() ? (int)scoreFactors.Average() : 85;
            
            // Update KPI counts
            ActiveGPOCount = GroupPolicies.Count(g => g.Enabled);
            HighRiskGroupsCount = SecurityGroups.Count(g => g.RiskLevel == "High" || g.RiskLevel == "Critical");
            ActiveThreatsCount = ThreatIndicators.Count(t => t.IsActive && (t.Severity == "Critical" || t.Severity == "High"));
            
            // Generate KPI cards
            GenerateSecurityKPIs();
        }

        private void GenerateSecurityKPIs()
        {
            System.Windows.Application.Current.Dispatcher.Invoke(() =>
            {
                SecurityKPIs.Clear();
                
                SecurityKPIs.Add(new SecurityKPI
                {
                    Name = "Security Score",
                    Value = $"{OverallSecurityScore}/100",
                    Trend = OverallSecurityScore >= 80 ? "↗️" : "↘️",
                    Status = OverallSecurityScore >= 80 ? "Good" : "Needs Attention",
                    Icon = OverallSecurityScore >= 80 ? "✅" : "⚠️",
                    Color = OverallSecurityScore >= 80 ? "#059669" : "#D97706",
                    Description = "Overall security posture assessment"
                });
                
                SecurityKPIs.Add(new SecurityKPI
                {
                    Name = "Active GPOs",
                    Value = ActiveGPOCount.ToString(),
                    Trend = "→",
                    Status = "Monitored",
                    Icon = "📋",
                    Color = "#0EA5E9",
                    Description = "Group Policy Objects currently active"
                });
                
                SecurityKPIs.Add(new SecurityKPI
                {
                    Name = "High-Risk Groups",
                    Value = HighRiskGroupsCount.ToString(),
                    Trend = HighRiskGroupsCount > 5 ? "↗️" : "→",
                    Status = HighRiskGroupsCount > 5 ? "High" : "Normal",
                    Icon = HighRiskGroupsCount > 5 ? "🔴" : "🟡",
                    Color = HighRiskGroupsCount > 5 ? "#DC2626" : "#D97706",
                    Description = "Security groups requiring attention"
                });
                
                SecurityKPIs.Add(new SecurityKPI
                {
                    Name = "Active Threats",
                    Value = ActiveThreatsCount.ToString(),
                    Trend = ActiveThreatsCount > 0 ? "⚠️" : "✅",
                    Status = ActiveThreatsCount > 0 ? "Active" : "Clear",
                    Icon = ActiveThreatsCount > 0 ? "🚨" : "🛡️",
                    Color = ActiveThreatsCount > 0 ? "#DC2626" : "#059669",
                    Description = "Critical and high-severity threats"
                });
                
                SecurityKPIs.Add(new SecurityKPI
                {
                    Name = "Compliance",
                    Value = $"{CompliancePercentage}%",
                    Trend = CompliancePercentage >= 90 ? "↗️" : "↘️",
                    Status = CompliancePercentage >= 90 ? "Compliant" : "Gaps",
                    Icon = CompliancePercentage >= 90 ? "✅" : "📋",
                    Color = CompliancePercentage >= 90 ? "#059669" : "#D97706",
                    Description = "Regulatory compliance status"
                });
            });
        }

        #endregion

        #region Filtering Methods

        private void RefreshFilters()
        {
            try
            {
                FilteredGPOs?.Refresh();
                FilteredSecurityGroups?.Refresh();
                FilteredThreats?.Refresh();
                FilteredComplianceControls?.Refresh();
                FilteredCriticalIssues?.Refresh();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "[SecurityPolicyViewModel] Error refreshing filters");
            }
        }

        private bool FilterGPO(object item)
        {
            if (item is not GroupPolicyObject gpo) return false;
            
            // Search filter
            if (!string.IsNullOrEmpty(SearchText))
            {
                return gpo.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                       gpo.DisplayName.Contains(SearchText, StringComparison.OrdinalIgnoreCase);
            }
            
            return true;
        }

        private bool FilterSecurityGroup(object item)
        {
            if (item is not SecurityGroup group) return false;
            
            // Search filter
            if (!string.IsNullOrEmpty(SearchText))
            {
                return group.DisplayName.Contains(SearchText, StringComparison.OrdinalIgnoreCase);
            }
            
            return true;
        }

        private bool FilterThreat(object item)
        {
            if (item is not SecurityThreatIndicator threat) return false;
            
            // Search and severity filters
            if (!string.IsNullOrEmpty(SearchText))
            {
                if (!threat.Description?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true &&
                    !threat.Value?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true) return false;
            }
            
            if (SelectedSeverityFilter != "All")
            {
                if (threat.Severity != SelectedSeverityFilter) return false;
            }
            
            return true;
        }

        private bool FilterComplianceControl(object item)
        {
            if (item is not ComplianceControl control) return false;
            
            // Search filter
            if (!string.IsNullOrEmpty(SearchText))
            {
                return control.ControlName?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true ||
                       control.Description?.Contains(SearchText, StringComparison.OrdinalIgnoreCase) == true;
            }
            
            return true;
        }

        private bool FilterCriticalIssue(object item)
        {
            if (item is not CriticalIssue issue) return false;
            
            // Search filter
            if (!string.IsNullOrEmpty(SearchText))
            {
                return issue.Title.Contains(SearchText, StringComparison.OrdinalIgnoreCase);
            }
            
            return true;
        }

        #endregion

        #region Command Execution Methods

        private void ExecuteNavigateTab(string tabName)
        {
            if (!string.IsNullOrEmpty(tabName))
            {
                ActiveTab = tabName;
            }
        }

        private void ExecuteClearFilters()
        {
            SearchText = string.Empty;
            SelectedSeverityFilter = "All";
            SelectedStatusFilter = "All";
            ShowEnabledOnly = false;
            ShowRecentlyModified = false;
        }

        private void ExecuteExportData(string dataType)
        {
            try
            {
                // TODO: Implement data export functionality
                _logger?.LogInformation($"[SecurityPolicyViewModel] Export requested for: {dataType}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"[SecurityPolicyViewModel] Error exporting {dataType}");
            }
        }

        private void ExecuteShowGPODetails(GroupPolicyObject gpo)
        {
            if (gpo != null)
            {
                // TODO: Show GPO details dialog
                _logger?.LogInformation($"[SecurityPolicyViewModel] Show details for GPO: {gpo.Name}");
            }
        }

        private void ExecuteShowGroupDetails(SecurityGroup group)
        {
            if (group != null)
            {
                // TODO: Show group details dialog
                _logger?.LogInformation($"[SecurityPolicyViewModel] Show details for group: {group.DisplayName}");
            }
        }

        private void ExecuteShowThreatDetails(SecurityThreatIndicator threat)
        {
            if (threat != null)
            {
                // TODO: Show threat details dialog
                _logger?.LogInformation($"[SecurityPolicyViewModel] Show details for threat: {threat.Value ?? threat.Description}");
            }
        }

        private void ExecuteRemediateThreat(SecurityThreatIndicator threat)
        {
            if (threat != null)
            {
                // TODO: Implement threat remediation workflow
                _logger?.LogInformation($"[SecurityPolicyViewModel] Remediate threat: {threat.Value ?? threat.Description}");
            }
        }

        private void ExecuteGenerateReport(string reportType)
        {
            try
            {
                // TODO: Implement report generation
                _logger?.LogInformation($"[SecurityPolicyViewModel] Generate report: {reportType}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"[SecurityPolicyViewModel] Error generating report: {reportType}");
            }
        }

        private new void RaiseAllLoadingProperties()
        {
            OnPropertyChanged(nameof(IsDashboardLoading));
            OnPropertyChanged(nameof(IsGPOLoading));
            OnPropertyChanged(nameof(IsSecurityGroupsLoading));
            OnPropertyChanged(nameof(IsInfrastructureLoading));
            OnPropertyChanged(nameof(IsThreatsLoading));
            OnPropertyChanged(nameof(IsComplianceLoading));
        }

        #endregion

        #region IDisposable
        protected override void OnDisposing()
        {
            // Clean up resources
            FilteredGPOs = null;
            FilteredSecurityGroups = null;
            FilteredThreats = null;
            FilteredComplianceControls = null;
            FilteredCriticalIssues = null;
            
            base.OnDisposing();
        }

        #endregion
    }
}

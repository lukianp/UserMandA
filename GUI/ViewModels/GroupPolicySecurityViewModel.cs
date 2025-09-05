using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Comprehensive Group Policy and Security ViewModel using unified loading pipeline
    /// </summary>
    public class GroupPolicySecurityViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collections
        public ObservableCollection<PolicyData> GroupPolicies { get; } = new();
        public ObservableCollection<GroupData> SecurityGroups { get; } = new();
        public ObservableCollection<SecurityInfrastructureItem> InfrastructureItems { get; } = new();
        public ObservableCollection<ThreatIndicator> ThreatIndicators { get; } = new();
        public ObservableCollection<ComplianceItem> ComplianceItems { get; } = new();
        
        // Filtered collections for UI binding
        public ObservableCollection<PolicyData> FilteredGroupPolicies { get; } = new();
        public ObservableCollection<GroupData> FilteredSecurityGroups { get; } = new();
        public ObservableCollection<SecurityInfrastructureItem> FilteredInfrastructureItems { get; } = new();
        public ObservableCollection<ThreatIndicator> FilteredThreatIndicators { get; } = new();
        public ObservableCollection<ComplianceItem> FilteredComplianceItems { get; } = new();
        
        // Dashboard metrics
        private SecurityDashboardMetrics _dashboardMetrics = new();
        public SecurityDashboardMetrics DashboardMetrics
        {
            get => _dashboardMetrics;
            set
            {
                _dashboardMetrics = value;
                OnPropertyChanged();
            }
        }
        
        // Search and filtering
        private string _searchText = string.Empty;
        public string SearchText
        {
            get => _searchText;
            set
            {
                _searchText = value;
                OnPropertyChanged();
                ApplyFilters();
            }
        }
        
        private string _selectedFilter = "All";
        public string SelectedFilter
        {
            get => _selectedFilter;
            set
            {
                _selectedFilter = value;
                OnPropertyChanged();
                ApplyFilters();
            }
        }
        
        public ObservableCollection<string> AvailableFilters { get; } = new()
        {
            "All", "Active", "Enabled", "Security", "High Risk", "Critical", "Failed"
        };
        
        // Data availability properties
        public bool HasGroupPolicyData => GroupPolicies.Count > 0;
        public bool HasSecurityGroupData => SecurityGroups.Count > 0;
        public bool HasInfrastructureData => InfrastructureItems.Count > 0;
        public bool HasThreatData => ThreatIndicators.Count > 0;
        public bool HasComplianceData => ComplianceItems.Count > 0;
        
        // Implement HasData for base class
        public override bool HasData => HasGroupPolicyData || HasSecurityGroupData || 
                                       HasInfrastructureData || HasThreatData || HasComplianceData;
        
        // Commands
        public ICommand RefreshCommand { get; }
        public ICommand ExportCommand { get; }
        
        public GroupPolicySecurityViewModel(
            CsvDataServiceNew csvService, 
            ILogger<GroupPolicySecurityViewModel> logger, 
            ProfileService profileService) 
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
            
            // Initialize commands
            RefreshCommand = new AsyncRelayCommand(LoadAsync);
            ExportCommand = new AsyncRelayCommand(ExportDataAsync);
        }

        /// <summary>
        /// Unified LoadAsync implementation following specification pattern
        /// </summary>
        public override async Task LoadAsync()
        {
            var sw = Stopwatch.StartNew();
            IsLoading = true; 
            HasData = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try 
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "group_policy_security" }, "Starting Group Policy & Security view load");
                
                // Get current profile
                var profile = _profileService.CurrentProfile ?? "ljpops";
                
                // Load all data sources in parallel for better performance
                var loadTasks = new List<Task>
                {
                    LoadGroupPoliciesAsync(profile),
                    LoadSecurityGroupsAsync(profile),
                    LoadInfrastructureAsync(profile),
                    LoadThreatDataAsync(profile),
                    LoadComplianceDataAsync(profile)
                };
                
                await Task.WhenAll(loadTasks);
                
                // Calculate dashboard metrics
                CalculateDashboardMetrics();
                
                // Apply filters to populate filtered collections
                ApplyFilters();
                
                // Update HasData properties
                OnPropertyChanged(nameof(HasGroupPolicyData));
                OnPropertyChanged(nameof(HasSecurityGroupData));
                OnPropertyChanged(nameof(HasInfrastructureData));
                OnPropertyChanged(nameof(HasThreatData));
                OnPropertyChanged(nameof(HasComplianceData));
                OnPropertyChanged(nameof(HasData));
                
                HasData = this.HasData;
                StructuredLogger?.LogInfo(LogSourceName, new { 
                    action = "load_complete", 
                    component = "group_policy_security", 
                    policies = GroupPolicies.Count, 
                    groups = SecurityGroups.Count,
                    infrastructure = InfrastructureItems.Count,
                    threats = ThreatIndicators.Count,
                    compliance = ComplianceItems.Count,
                    warnings = HeaderWarnings.Count, 
                    elapsed_ms = sw.ElapsedMilliseconds 
                }, "Group Policy & Security view load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Failed to load security data: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "group_policy_security" }, "Failed to load Group Policy & Security view");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }
        
        private async Task LoadGroupPoliciesAsync(string profile)
        {
            try
            {
                var result = await _csvService.LoadGroupPoliciesAsync(profile);
                
                // Collect header warnings
                foreach (var warning in result.HeaderWarnings) 
                    HeaderWarnings.Add($"Group Policies: {warning}");
                    
                // Clear and load data
                GroupPolicies.Clear();
                foreach (var policy in result.Data) 
                    GroupPolicies.Add(policy);
                    
                StructuredLogger?.LogDebug(LogSourceName, new { policies = GroupPolicies.Count }, "Loaded group policies");
            }
            catch (Exception ex)
            {
                HeaderWarnings.Add($"Failed to load group policies: {ex.Message}");
                StructuredLogger?.LogError(LogSourceName, ex, new { component = "group_policies" }, "Failed to load group policies");
            }
        }
        
        private async Task LoadSecurityGroupsAsync(string profile)
        {
            try
            {
                var result = await _csvService.LoadGroupsAsync(profile);
                
                // Collect header warnings
                foreach (var warning in result.HeaderWarnings) 
                    HeaderWarnings.Add($"Security Groups: {warning}");
                    
                // Clear and load data - filter for security groups only
                SecurityGroups.Clear();
                foreach (var group in result.Data.Where(g => g.SecurityEnabled)) 
                    SecurityGroups.Add(group);
                    
                StructuredLogger?.LogDebug(LogSourceName, new { groups = SecurityGroups.Count }, "Loaded security groups");
            }
            catch (Exception ex)
            {
                HeaderWarnings.Add($"Failed to load security groups: {ex.Message}");
                StructuredLogger?.LogError(LogSourceName, ex, new { component = "security_groups" }, "Failed to load security groups");
            }
        }
        
        private async Task LoadInfrastructureAsync(string profile)
        {
            try
            {
                // Load infrastructure data from CSV - this would be from SecurityInfrastructureDiscovery module
                // For now, generate sample data until the CSV integration is available
                await Task.Delay(100); // Simulate async operation
                
                InfrastructureItems.Clear();
                
                // Sample data for infrastructure items
                var sampleInfrastructure = new[]
                {
                    new SecurityInfrastructureItem("Windows Defender", "Antivirus", "Active", "4.18.2107.4", "All Endpoints", "Low", DateTimeOffset.Now, "Microsoft Windows Defender Antivirus", "Microsoft", "Up to date", "Real-time protection enabled"),
                    new SecurityInfrastructureItem("Palo Alto Firewall", "Firewall", "Active", "10.2.3", "Network Perimeter", "Medium", DateTimeOffset.Now, "Next-generation firewall", "Palo Alto Networks", "Operational", "Threat prevention enabled"),
                    new SecurityInfrastructureItem("Splunk SIEM", "SIEM", "Active", "8.2.6", "Security Operations Center", "Low", DateTimeOffset.Now, "Security Information and Event Management", "Splunk", "Healthy", "Log aggregation active"),
                    new SecurityInfrastructureItem("CyberArk PAM", "Privileged Access", "Active", "12.6", "Data Center", "High", DateTimeOffset.Now, "Privileged Access Management", "CyberArk", "Operational", "Password vaulting enabled"),
                    new SecurityInfrastructureItem("Veeam Backup", "Backup", "Active", "11.0", "Backup Infrastructure", "Medium", DateTimeOffset.Now, "Backup and recovery solution", "Veeam", "Healthy", "Daily backups running")
                };
                
                foreach (var item in sampleInfrastructure)
                    InfrastructureItems.Add(item);
                    
                StructuredLogger?.LogDebug(LogSourceName, new { infrastructure = InfrastructureItems.Count }, "Loaded infrastructure items");
            }
            catch (Exception ex)
            {
                HeaderWarnings.Add($"Failed to load infrastructure data: {ex.Message}");
                StructuredLogger?.LogError(LogSourceName, ex, new { component = "infrastructure" }, "Failed to load infrastructure data");
            }
        }
        
        private async Task LoadThreatDataAsync(string profile)
        {
            try
            {
                // Load threat detection data - this would be from ThreatDetectionEngine module
                // For now, generate sample data
                await Task.Delay(100); // Simulate async operation
                
                ThreatIndicators.Clear();
                
                // Initialize empty collection - threat data should be loaded from security sources
                // ThreatIndicators remains empty until real threat data is available
                    
                StructuredLogger?.LogDebug(LogSourceName, new { threats = ThreatIndicators.Count }, "Loaded threat indicators");
            }
            catch (Exception ex)
            {
                HeaderWarnings.Add($"Failed to load threat data: {ex.Message}");
                StructuredLogger?.LogError(LogSourceName, ex, new { component = "threats" }, "Failed to load threat data");
            }
        }
        
        private async Task LoadComplianceDataAsync(string profile)
        {
            try
            {
                // Load compliance assessment data - this would be from ComplianceAssessmentFramework module
                // For now, generate sample data
                await Task.Delay(100); // Simulate async operation
                
                ComplianceItems.Clear();
                
                // Sample compliance data
                var sampleCompliance = new[]
                {
                    new ComplianceItem("AC-2", "NIST", "Account Management", "Passed", "Medium", "IT Security", DateTimeOffset.Now.AddDays(30), "User account management controls", "Account policies configured", "Regular review required", 85.0, "Access Control"),
                    new ComplianceItem("AC-3", "NIST", "Access Enforcement", "Failed", "High", "IT Security", DateTimeOffset.Now.AddDays(15), "Access control enforcement", "Missing controls identified", "Implement RBAC", 45.0, "Access Control"),
                    new ComplianceItem("AU-2", "NIST", "Audit Events", "Passed", "Medium", "IT Operations", DateTimeOffset.Now.AddDays(60), "Audit event monitoring", "Logging configured", "Review log retention", 90.0, "Audit"),
                    new ComplianceItem("SI-4", "NIST", "Information System Monitoring", "Partial", "High", "Security Team", DateTimeOffset.Now.AddDays(7), "System monitoring capabilities", "SIEM partially configured", "Complete SIEM deployment", 65.0, "System Integrity"),
                    new ComplianceItem("RA-5", "NIST", "Vulnerability Scanning", "Passed", "Medium", "Security Team", DateTimeOffset.Now.AddDays(45), "Regular vulnerability assessments", "Scanning tools deployed", "Maintain scan schedule", 80.0, "Risk Assessment")
                };
                
                foreach (var item in sampleCompliance)
                    ComplianceItems.Add(item);
                    
                StructuredLogger?.LogDebug(LogSourceName, new { compliance = ComplianceItems.Count }, "Loaded compliance items");
            }
            catch (Exception ex)
            {
                HeaderWarnings.Add($"Failed to load compliance data: {ex.Message}");
                StructuredLogger?.LogError(LogSourceName, ex, new { component = "compliance" }, "Failed to load compliance data");
            }
        }
        
        private void CalculateDashboardMetrics()
        {
            try
            {
                var metrics = new SecurityDashboardMetrics
                {
                    GroupPolicyCount = GroupPolicies.Count,
                    SecurityGroupCount = SecurityGroups.Count,
                    InfrastructureItemCount = InfrastructureItems.Count,
                    ThreatIndicatorCount = ThreatIndicators.Count,
                    ActiveThreats = ThreatIndicators.Count(t => t.IsActive),
                    CriticalRisks = InfrastructureItems.Count(i => i.RiskLevel?.ToLower() == "critical") +
                                   ThreatIndicators.Count(t => t.Severity?.ToLower() == "critical"),
                    HighRisks = InfrastructureItems.Count(i => i.RiskLevel?.ToLower() == "high") +
                               ThreatIndicators.Count(t => t.Severity?.ToLower() == "high"),
                    PassedControls = ComplianceItems.Count(c => c.Status?.ToLower() == "passed"),
                    FailedControls = ComplianceItems.Count(c => c.Status?.ToLower() == "failed"),
                    TotalControls = ComplianceItems.Count,
                    LastUpdated = DateTimeOffset.Now
                };
                
                // Calculate compliance score
                if (metrics.TotalControls > 0)
                {
                    var totalScore = ComplianceItems.Sum(c => c.Score);
                    metrics.ComplianceScore = totalScore / metrics.TotalControls;
                }
                else
                {
                    metrics.ComplianceScore = 0;
                }
                
                DashboardMetrics = metrics;
                
                StructuredLogger?.LogDebug(LogSourceName, new { 
                    policies = metrics.GroupPolicyCount,
                    groups = metrics.SecurityGroupCount,
                    infrastructure = metrics.InfrastructureItemCount,
                    threats = metrics.ThreatIndicatorCount,
                    compliance_score = metrics.ComplianceScore
                }, "Calculated dashboard metrics");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { component = "metrics" }, "Failed to calculate dashboard metrics");
            }
        }
        
        private void ApplyFilters()
        {
            try
            {
                var searchLower = SearchText.ToLower();
                var filter = SelectedFilter;
                
                // Filter Group Policies
                FilteredGroupPolicies.Clear();
                var filteredPolicies = GroupPolicies.Where(p => 
                    (string.IsNullOrEmpty(SearchText) || 
                     (p.Name?.ToLower().Contains(searchLower) == true) ||
                     (p.Description?.ToLower().Contains(searchLower) == true)) &&
                    (filter == "All" || 
                     (filter == "Enabled" && p.Enabled) ||
                     (filter == "Active" && p.Enabled))
                );
                foreach (var policy in filteredPolicies)
                    FilteredGroupPolicies.Add(policy);
                
                // Filter Security Groups
                FilteredSecurityGroups.Clear();
                var filteredGroups = SecurityGroups.Where(g => 
                    (string.IsNullOrEmpty(SearchText) || 
                     (g.DisplayName?.ToLower().Contains(searchLower) == true) ||
                     (g.Description?.ToLower().Contains(searchLower) == true)) &&
                    (filter == "All" || 
                     (filter == "Security" && g.SecurityEnabled))
                );
                foreach (var group in filteredGroups)
                    FilteredSecurityGroups.Add(group);
                
                // Filter Infrastructure Items
                FilteredInfrastructureItems.Clear();
                var filteredInfrastructure = InfrastructureItems.Where(i => 
                    (string.IsNullOrEmpty(SearchText) || 
                     (i.Component?.ToLower().Contains(searchLower) == true) ||
                     (i.Description?.ToLower().Contains(searchLower) == true)) &&
                    (filter == "All" || 
                     (filter == "Active" && i.Status?.ToLower() == "active") ||
                     (filter == "High Risk" && i.RiskLevel?.ToLower() == "high") ||
                     (filter == "Critical" && i.RiskLevel?.ToLower() == "critical"))
                );
                foreach (var item in filteredInfrastructure)
                    FilteredInfrastructureItems.Add(item);
                
                // Filter Threat Indicators
                FilteredThreatIndicators.Clear();
                var filteredThreats = ThreatIndicators.Where(t => 
                    (string.IsNullOrEmpty(SearchText) || 
                     (t.ThreatType?.ToLower().Contains(searchLower) == true) ||
                     (t.Description?.ToLower().Contains(searchLower) == true)) &&
                    (filter == "All" || 
                     (filter == "Active" && t.IsActive) ||
                     (filter == "High Risk" && t.Severity?.ToLower() == "high") ||
                     (filter == "Critical" && t.Severity?.ToLower() == "critical"))
                );
                foreach (var threat in filteredThreats)
                    FilteredThreatIndicators.Add(threat);
                
                // Filter Compliance Items
                FilteredComplianceItems.Clear();
                var filteredCompliance = ComplianceItems.Where(c => 
                    (string.IsNullOrEmpty(SearchText) || 
                     (c.Title?.ToLower().Contains(searchLower) == true) ||
                     (c.Description?.ToLower().Contains(searchLower) == true)) &&
                    (filter == "All" || 
                     (filter == "Failed" && c.Status?.ToLower() == "failed") ||
                     (filter == "High Risk" && c.RiskLevel?.ToLower() == "high") ||
                     (filter == "Critical" && c.RiskLevel?.ToLower() == "critical"))
                );
                foreach (var item in filteredCompliance)
                    FilteredComplianceItems.Add(item);
                    
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { component = "filtering" }, "Failed to apply filters");
            }
        }
        
        private async Task ExportDataAsync()
        {
            try
            {
                IsLoading = true;
                StructuredLogger?.LogInfo(LogSourceName, new { action = "export_start" }, "Starting security data export");
                
                // Simulate export operation
                await Task.Delay(1000);
                
                // In a real implementation, this would export all data to CSV/Excel
                StructuredLogger?.LogInfo(LogSourceName, new { action = "export_complete" }, "Security data export completed");
            }
            catch (Exception ex)
            {
                LastError = $"Failed to export data: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "export_fail" }, "Failed to export security data");
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}
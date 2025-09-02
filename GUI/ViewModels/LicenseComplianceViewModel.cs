using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Data;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for license compliance management and reporting interface
    /// Provides comprehensive license compliance monitoring for T-038 implementation
    /// </summary>
    public class LicenseComplianceViewModel : BaseViewModel
    {
        #region Private Fields
        private readonly ILicenseAssignmentService _licenseService;
        private readonly ILogger<LicenseComplianceViewModel> _logger;
        
        // Target tenant selection
        private ObservableCollection<string> _availableTargetCompanies;
        private string _selectedTargetCompany;
        
        // License data
        private ObservableCollection<LicenseSku> _availableLicenseSkus;
        private ObservableCollection<UserLicenseAssignment> _userLicenseAssignments;
        private ObservableCollection<ComplianceIssue> _complianceIssues;
        
        // Compliance reporting
        private LicenseComplianceReport _complianceReport;
        private LicenseUtilizationStats _utilizationStats;
        private bool _isGeneratingReport;
        private string _reportStatus = "No report generated";
        
        // Filtering and search
        private string _searchText;
        private string _selectedComplianceFilter = "All";
        private string _selectedLicenseTypeFilter = "All";
        private bool _showOnlyIssues;
        
        // Collection views
        private ICollectionView _userAssignmentsView;
        private ICollectionView _complianceIssuesView;
        private ICollectionView _licenseSkusView;
        
        // Bulk operations
        private ObservableCollection<UserLicenseAssignment> _selectedUsers;
        private ObservableCollection<string> _bulkAssignSkuIds;
        private bool _isBulkOperationInProgress;
        #endregion
        
        #region Constructor
        public LicenseComplianceViewModel(ILogger<LicenseComplianceViewModel> logger = null, 
            ILicenseAssignmentService licenseService = null) : base(logger)
        {
            _logger = logger;
            _licenseService = licenseService ?? new LicenseAssignmentService(logger);
            
            InitializeCollections();
            InitializeCommands();
            InitializeCollectionViews();
            
            TabTitle = "License Compliance";
        }
        #endregion
        
        #region Properties
        
        // Target Company Selection
        public ObservableCollection<string> AvailableTargetCompanies
        {
            get => _availableTargetCompanies;
            set => SetProperty(ref _availableTargetCompanies, value);
        }
        
        public string SelectedTargetCompany
        {
            get => _selectedTargetCompany;
            set
            {
                if (SetProperty(ref _selectedTargetCompany, value))
                {
                    _ = LoadTenantDataAsync();
                }
            }
        }
        
        // License Data Properties
        public ObservableCollection<LicenseSku> AvailableLicenseSkus
        {
            get => _availableLicenseSkus;
            set => SetProperty(ref _availableLicenseSkus, value);
        }
        
        public ObservableCollection<UserLicenseAssignment> UserLicenseAssignments
        {
            get => _userLicenseAssignments;
            set => SetProperty(ref _userLicenseAssignments, value);
        }
        
        public ObservableCollection<ComplianceIssue> ComplianceIssues
        {
            get => _complianceIssues;
            set => SetProperty(ref _complianceIssues, value);
        }
        
        // Reporting Properties
        public LicenseComplianceReport ComplianceReport
        {
            get => _complianceReport;
            set => SetProperty(ref _complianceReport, value);
        }
        
        public LicenseUtilizationStats UtilizationStats
        {
            get => _utilizationStats;
            set => SetProperty(ref _utilizationStats, value);
        }
        
        public bool IsGeneratingReport
        {
            get => _isGeneratingReport;
            set => SetProperty(ref _isGeneratingReport, value);
        }
        
        public string ReportStatus
        {
            get => _reportStatus;
            set => SetProperty(ref _reportStatus, value);
        }
        
        // Filtering Properties
        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplyFilters();
                }
            }
        }
        
        public string SelectedComplianceFilter
        {
            get => _selectedComplianceFilter;
            set
            {
                if (SetProperty(ref _selectedComplianceFilter, value))
                {
                    ApplyFilters();
                }
            }
        }
        
        public string SelectedLicenseTypeFilter
        {
            get => _selectedLicenseTypeFilter;
            set
            {
                if (SetProperty(ref _selectedLicenseTypeFilter, value))
                {
                    ApplyFilters();
                }
            }
        }
        
        public bool ShowOnlyIssues
        {
            get => _showOnlyIssues;
            set
            {
                if (SetProperty(ref _showOnlyIssues, value))
                {
                    ApplyFilters();
                }
            }
        }
        
        // Collection Views
        public ICollectionView UserAssignmentsView
        {
            get => _userAssignmentsView;
            private set => SetProperty(ref _userAssignmentsView, value);
        }
        
        public ICollectionView ComplianceIssuesView
        {
            get => _complianceIssuesView;
            private set => SetProperty(ref _complianceIssuesView, value);
        }
        
        public ICollectionView LicenseSkusView
        {
            get => _licenseSkusView;
            private set => SetProperty(ref _licenseSkusView, value);
        }
        
        // Bulk Operations Properties
        public ObservableCollection<UserLicenseAssignment> SelectedUsers
        {
            get => _selectedUsers;
            set => SetProperty(ref _selectedUsers, value);
        }
        
        public ObservableCollection<string> BulkAssignSkuIds
        {
            get => _bulkAssignSkuIds;
            set => SetProperty(ref _bulkAssignSkuIds, value);
        }
        
        public bool IsBulkOperationInProgress
        {
            get => _isBulkOperationInProgress;
            set => SetProperty(ref _isBulkOperationInProgress, value);
        }
        
        // Filter options for UI binding
        public List<string> ComplianceFilterOptions { get; } = new() { "All", "Compliant", "Non-Compliant", "Unlicensed" };
        public List<string> LicenseTypeFilterOptions { get; } = new() { "All", "E1", "E3", "E5", "F1", "F3" };
        #endregion
        
        #region Commands
        public ICommand LoadTenantDataCommand { get; private set; }
        public ICommand GenerateComplianceReportCommand { get; private set; }
        public ICommand GenerateUtilizationStatsCommand { get; private set; }
        public ICommand ScanForIssuesCommand { get; private set; }
        public ICommand ResolveIssueCommand { get; private set; }
        public ICommand ExportReportCommand { get; private set; }
        public ICommand RefreshDataCommand { get; private set; }
        public ICommand ClearFiltersCommand { get; private set; }
        
        // Bulk operation commands
        public ICommand BulkAssignLicensesCommand { get; private set; }
        public ICommand BulkRemoveLicensesCommand { get; private set; }
        public ICommand SelectAllUsersCommand { get; private set; }
        public ICommand SelectNoneUsersCommand { get; private set; }
        #endregion
        
        #region Private Methods
        
        private void InitializeCollections()
        {
            AvailableTargetCompanies = new ObservableCollection<string>();
            AvailableLicenseSkus = new ObservableCollection<LicenseSku>();
            UserLicenseAssignments = new ObservableCollection<UserLicenseAssignment>();
            ComplianceIssues = new ObservableCollection<ComplianceIssue>();
            SelectedUsers = new ObservableCollection<UserLicenseAssignment>();
            BulkAssignSkuIds = new ObservableCollection<string>();
            
            LoadAvailableTargetCompanies();
        }
        
        private new void InitializeCommands()
        {
            LoadTenantDataCommand = new AsyncRelayCommand(LoadTenantDataAsync);
            GenerateComplianceReportCommand = new AsyncRelayCommand(GenerateComplianceReportAsync);
            GenerateUtilizationStatsCommand = new AsyncRelayCommand(GenerateUtilizationStatsAsync);
            ScanForIssuesCommand = new AsyncRelayCommand(ScanForIssuesAsync);
            ResolveIssueCommand = new AsyncRelayCommand<ComplianceIssue>(ResolveIssueAsync);
            ExportReportCommand = new AsyncRelayCommand(ExportReportAsync);
            RefreshDataCommand = new AsyncRelayCommand(RefreshDataAsync);
            ClearFiltersCommand = new RelayCommand(ClearFilters);
            
            // Bulk operations
            BulkAssignLicensesCommand = new AsyncRelayCommand(BulkAssignLicensesAsync, CanPerformBulkOperation);
            BulkRemoveLicensesCommand = new AsyncRelayCommand(BulkRemoveLicensesAsync, CanPerformBulkOperation);
            SelectAllUsersCommand = new RelayCommand(SelectAllUsers);
            SelectNoneUsersCommand = new RelayCommand(SelectNoneUsers);
        }
        
        private void InitializeCollectionViews()
        {
            UserAssignmentsView = CollectionViewSource.GetDefaultView(UserLicenseAssignments);
            UserAssignmentsView.Filter = FilterUserAssignments;
            
            ComplianceIssuesView = CollectionViewSource.GetDefaultView(ComplianceIssues);
            LicenseSkusView = CollectionViewSource.GetDefaultView(AvailableLicenseSkus);
        }
        
        private void LoadAvailableTargetCompanies()
        {
            try
            {
                var root = ConfigurationService.Instance.DiscoveryDataRootPath;
                AvailableTargetCompanies.Clear();
                if (System.IO.Directory.Exists(root))
                {
                    foreach (var dir in System.IO.Directory.GetDirectories(root))
                    {
                        AvailableTargetCompanies.Add(System.IO.Path.GetFileName(dir));
                    }
                }

                // Default selection
                var saved = ConfigurationService.Instance.SelectedTargetCompany;
                if (!string.IsNullOrWhiteSpace(saved) && AvailableTargetCompanies.Contains(saved))
                {
                    SelectedTargetCompany = saved;
                }
                else if (AvailableTargetCompanies.Any())
                {
                    SelectedTargetCompany = AvailableTargetCompanies.First();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error loading available target companies");
                HasErrors = true;
                ErrorMessage = $"Failed to load target companies: {ex.Message}";
            }
        }
        
        private async Task LoadTenantDataAsync()
        {
            if (string.IsNullOrWhiteSpace(SelectedTargetCompany))
                return;

            try
            {
                IsLoading = true;
                LoadingMessage = "Loading tenant license data...";

                var targetTenantId = ConfigurationService.Instance.TryResolveTenantId(SelectedTargetCompany);
                if (string.IsNullOrWhiteSpace(targetTenantId))
                {
                    HasErrors = true;
                    ErrorMessage = "Target tenant not configured";
                    return;
                }

                // Load license SKUs
                var skus = await _licenseService.GetAvailableLicenseSkusAsync(targetTenantId);
                Application.Current.Dispatcher.Invoke(() =>
                {
                    AvailableLicenseSkus.Clear();
                    foreach (var sku in skus)
                    {
                        AvailableLicenseSkus.Add(sku);
                    }
                });

                HasData = AvailableLicenseSkus.Any();
                LoadingMessage = $"Loaded {skus.Count} license SKUs";
                
                _logger?.LogInformation($"Loaded tenant data for {SelectedTargetCompany}: {skus.Count} SKUs");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to load tenant data");
                HasErrors = true;
                ErrorMessage = $"Failed to load tenant data: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        private async Task GenerateComplianceReportAsync()
        {
            if (string.IsNullOrWhiteSpace(SelectedTargetCompany))
            {
                MessageBox.Show("Please select a target company.", "Target Required", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                IsGeneratingReport = true;
                ReportStatus = "Generating compliance report...";

                var targetTenantId = ConfigurationService.Instance.TryResolveTenantId(SelectedTargetCompany);
                ComplianceReport = await _licenseService.GenerateComplianceReportAsync(
                    targetTenantId, includeUsers: true, includeIssues: true);

                // Update UI collections
                Application.Current.Dispatcher.Invoke(() =>
                {
                    UserLicenseAssignments.Clear();
                    foreach (var assignment in ComplianceReport.UserAssignments)
                    {
                        UserLicenseAssignments.Add(assignment);
                    }

                    ComplianceIssues.Clear();
                    foreach (var issue in ComplianceReport.ComplianceIssues)
                    {
                        ComplianceIssues.Add(issue);
                    }
                });

                ReportStatus = $"Report generated: {ComplianceReport.TotalUsers} users, " +
                              $"{ComplianceReport.TotalComplianceIssues} issues";
                HasData = true;
                
                _logger?.LogInformation($"Generated compliance report for {SelectedTargetCompany}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to generate compliance report");
                ReportStatus = $"Report generation failed: {ex.Message}";
                HasErrors = true;
                ErrorMessage = ex.Message;
            }
            finally
            {
                IsGeneratingReport = false;
            }
        }
        
        private async Task GenerateUtilizationStatsAsync()
        {
            if (string.IsNullOrWhiteSpace(SelectedTargetCompany))
            {
                MessageBox.Show("Please select a target company.", "Target Required", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                IsLoading = true;
                LoadingMessage = "Generating utilization statistics...";

                var targetTenantId = ConfigurationService.Instance.TryResolveTenantId(SelectedTargetCompany);
                UtilizationStats = await _licenseService.GetLicenseUtilizationStatsAsync(targetTenantId);

                LoadingMessage = $"Utilization stats: {UtilizationStats.OverallUtilizationPercentage:F1}% overall";
                
                _logger?.LogInformation($"Generated utilization stats for {SelectedTargetCompany}");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to generate utilization stats");
                HasErrors = true;
                ErrorMessage = $"Failed to generate utilization stats: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        private async Task ScanForIssuesAsync()
        {
            if (string.IsNullOrWhiteSpace(SelectedTargetCompany))
            {
                MessageBox.Show("Please select a target company.", "Target Required", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                IsLoading = true;
                LoadingMessage = "Scanning for compliance issues...";

                var targetTenantId = ConfigurationService.Instance.TryResolveTenantId(SelectedTargetCompany);
                var issues = await _licenseService.ScanForComplianceIssuesAsync(targetTenantId);

                Application.Current.Dispatcher.Invoke(() =>
                {
                    ComplianceIssues.Clear();
                    foreach (var issue in issues)
                    {
                        ComplianceIssues.Add(issue);
                    }
                });

                LoadingMessage = $"Found {issues.Count} compliance issues";
                _logger?.LogInformation($"Compliance scan completed: {issues.Count} issues found");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to scan for compliance issues");
                HasErrors = true;
                ErrorMessage = $"Compliance scan failed: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        private async Task ResolveIssueAsync(ComplianceIssue issue)
        {
            if (issue == null) return;

            var result = MessageBox.Show($"Mark issue '{issue.IssueType}' as resolved?", 
                "Resolve Issue", MessageBoxButton.YesNo, MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                try
                {
                    await _licenseService.ResolveComplianceIssueAsync(
                        issue.Id, "Manually resolved by administrator", Environment.UserName);

                    ComplianceIssues.Remove(issue);
                    _logger?.LogInformation($"Resolved compliance issue {issue.Id}");
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Failed to resolve compliance issue");
                    MessageBox.Show($"Failed to resolve issue: {ex.Message}", "Error", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }
        
        private async Task ExportReportAsync()
        {
            if (ComplianceReport == null)
            {
                MessageBox.Show("No compliance report to export. Generate a report first.", 
                    "No Report", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                // TODO: Implement report export functionality
                MessageBox.Show("Export functionality will be implemented in Phase 2", 
                    "Feature Coming Soon", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to export report");
                MessageBox.Show($"Export failed: {ex.Message}", "Export Error", 
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        
        private async Task RefreshDataAsync()
        {
            await LoadTenantDataAsync();
            if (ComplianceReport != null)
            {
                await GenerateComplianceReportAsync();
            }
        }
        
        private void ApplyFilters()
        {
            UserAssignmentsView?.Refresh();
        }
        
        private bool FilterUserAssignments(object item)
        {
            if (!(item is UserLicenseAssignment assignment)) return false;

            // Text search
            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                var searchLower = SearchText.ToLowerInvariant();
                if (!assignment.UserPrincipalName?.ToLowerInvariant().Contains(searchLower) == true &&
                    !assignment.DisplayName?.ToLowerInvariant().Contains(searchLower) == true &&
                    !assignment.Department?.ToLowerInvariant().Contains(searchLower) == true)
                {
                    return false;
                }
            }

            // Compliance filter
            if (SelectedComplianceFilter != "All")
            {
                var isCompliant = assignment.IsCompliant;
                var hasLicenses = assignment.AssignedSkus?.Any() == true;

                switch (SelectedComplianceFilter)
                {
                    case "Compliant" when !isCompliant:
                    case "Non-Compliant" when isCompliant:
                    case "Unlicensed" when hasLicenses:
                        return false;
                }
            }

            // License type filter
            if (SelectedLicenseTypeFilter != "All" && assignment.AssignedSkus?.Any() == true)
            {
                var hasTargetLicense = assignment.AssignedSkus.Any(sku => 
                    sku.SkuPartNumber?.Contains(SelectedLicenseTypeFilter, StringComparison.OrdinalIgnoreCase) == true);
                if (!hasTargetLicense) return false;
            }

            return true;
        }
        
        private void ClearFilters()
        {
            SearchText = string.Empty;
            SelectedComplianceFilter = "All";
            SelectedLicenseTypeFilter = "All";
            ShowOnlyIssues = false;
        }
        
        // Bulk Operations
        private bool CanPerformBulkOperation()
        {
            return SelectedUsers?.Any() == true && !IsBulkOperationInProgress;
        }
        
        private async Task BulkAssignLicensesAsync()
        {
            if (!BulkAssignSkuIds?.Any() == true)
            {
                MessageBox.Show("Please select licenses to assign.", "No Licenses Selected", 
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            var result = MessageBox.Show($"Assign licenses to {SelectedUsers.Count} selected users?", 
                "Confirm Bulk Assignment", MessageBoxButton.YesNo, MessageBoxImage.Question);

            if (result == MessageBoxResult.Yes)
            {
                try
                {
                    IsBulkOperationInProgress = true;
                    var targetTenantId = ConfigurationService.Instance.TryResolveTenantId(SelectedTargetCompany);
                    
                    var operation = new BulkLicenseOperation
                    {
                        Id = Guid.NewGuid().ToString(),
                        OperationType = BulkLicenseOperationType.Assign,
                        UserIds = SelectedUsers.Select(u => u.UserId).ToList(),
                        SkuIds = BulkAssignSkuIds.ToList(),
                        TotalUsers = SelectedUsers.Count
                    };

                    await _licenseService.ExecuteBulkLicenseOperationAsync(targetTenantId, operation);
                    
                    MessageBox.Show($"Bulk license assignment completed. Check logs for details.", 
                        "Bulk Operation Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                    
                    // Refresh data
                    await RefreshDataAsync();
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Bulk license assignment failed");
                    MessageBox.Show($"Bulk assignment failed: {ex.Message}", "Error", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
                finally
                {
                    IsBulkOperationInProgress = false;
                }
            }
        }
        
        private async Task BulkRemoveLicensesAsync()
        {
            var result = MessageBox.Show($"Remove all licenses from {SelectedUsers.Count} selected users?", 
                "Confirm Bulk Removal", MessageBoxButton.YesNo, MessageBoxImage.Warning);

            if (result == MessageBoxResult.Yes)
            {
                try
                {
                    IsBulkOperationInProgress = true;
                    var targetTenantId = ConfigurationService.Instance.TryResolveTenantId(SelectedTargetCompany);
                    
                    // Get all SKUs assigned to selected users
                    var allSkuIds = SelectedUsers
                        .SelectMany(u => u.AssignedSkus ?? new List<LicenseSku>())
                        .Select(sku => sku.SkuId)
                        .Distinct()
                        .ToList();

                    var operation = new BulkLicenseOperation
                    {
                        Id = Guid.NewGuid().ToString(),
                        OperationType = BulkLicenseOperationType.Remove,
                        UserIds = SelectedUsers.Select(u => u.UserId).ToList(),
                        SkuIds = allSkuIds,
                        TotalUsers = SelectedUsers.Count
                    };

                    await _licenseService.ExecuteBulkLicenseOperationAsync(targetTenantId, operation);
                    
                    MessageBox.Show($"Bulk license removal completed. Check logs for details.", 
                        "Bulk Operation Complete", MessageBoxButton.OK, MessageBoxImage.Information);
                    
                    // Refresh data
                    await RefreshDataAsync();
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Bulk license removal failed");
                    MessageBox.Show($"Bulk removal failed: {ex.Message}", "Error", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
                finally
                {
                    IsBulkOperationInProgress = false;
                }
            }
        }
        
        private void SelectAllUsers()
        {
            SelectedUsers.Clear();
            foreach (var assignment in UserLicenseAssignments)
            {
                SelectedUsers.Add(assignment);
            }
        }
        
        private void SelectNoneUsers()
        {
            SelectedUsers.Clear();
        }
        
        #endregion
        
        #region Overrides
        public override async Task LoadAsync()
        {
            IsLoading = true;
            HasData = false;
            LastError = null;
            HeaderWarnings.Clear();

            try
            {
                _logger?.LogDebug($"[{GetType().Name}] Load start");
                
                LoadAvailableTargetCompanies();
                
                if (!string.IsNullOrWhiteSpace(SelectedTargetCompany))
                {
                    await LoadTenantDataAsync();
                }

                HasData = true;
                _logger?.LogInformation($"[{GetType().Name}] Load ok");
            }
            catch (Exception ex)
            {
                LastError = $"Unexpected error: {ex.Message}";
                _logger?.LogError($"[{GetType().Name}] Load fail ex={ex}");
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        protected override void OnDisposing()
        {
            // Cleanup resources
            base.OnDisposing();
        }
        #endregion
    }
}
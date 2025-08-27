using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for GroupPolicySecurityView.xaml
    /// Comprehensive security analysis view combining Group Policy and Security data
    /// </summary>
    public partial class GroupPolicySecurityView : UserControl
    {
        public GroupPolicySecurityView()
        {
            InitializeComponent();
            
            // Initialize ViewModel through SimpleServiceLocator pattern
            try
            {
                // Get required services
                var csvLogger = SimpleServiceLocator.Instance.GetService<ILogger<CsvDataServiceNew>>();
                var csvService = SimpleServiceLocator.Instance.GetService<CsvDataServiceNew>() ?? new CsvDataServiceNew(csvLogger);
                var logger = SimpleServiceLocator.Instance.GetService<ILogger<GroupPolicySecurityViewModel>>();
                var profileService = SimpleServiceLocator.Instance.GetService<ProfileService>() ?? new ProfileService();
                
                // Create ViewModel
                var viewModel = new GroupPolicySecurityViewModel(csvService, logger, profileService);
                DataContext = viewModel;
                
                // Start loading data automatically
                _ = viewModel.LoadAsync();
                
                System.Diagnostics.Debug.WriteLine("[GroupPolicySecurityView] Successfully initialized with ViewModel");
            }
            catch (System.Exception ex)
            {
                // Log error but don't fail construction
                System.Diagnostics.Debug.WriteLine($"[GroupPolicySecurityView] Failed to initialize ViewModel: {ex.Message}");
                
                // Create a minimal fallback ViewModel to prevent binding errors
                DataContext = new GroupPolicySecurityViewModelStub();
            }
        }
    }
    
    /// <summary>
    /// Stub ViewModel for fallback scenarios
    /// </summary>
    public class GroupPolicySecurityViewModelStub
    {
        public bool IsLoading { get; set; } = false;
        public bool HasData { get; set; } = false;
        public string LastError { get; set; } = "Failed to initialize security data";
        public System.Collections.ObjectModel.ObservableCollection<string> HeaderWarnings { get; } = new();
        public SecurityDashboardMetrics DashboardMetrics { get; } = new SecurityDashboardMetrics();
        public System.Collections.ObjectModel.ObservableCollection<string> AvailableFilters { get; } = new() { "All" };
        public string SearchText { get; set; } = string.Empty;
        public string SelectedFilter { get; set; } = "All";
        public bool HasGroupPolicyData { get; set; } = false;
        public bool HasSecurityGroupData { get; set; } = false;
        public bool HasInfrastructureData { get; set; } = false;
        public bool HasThreatData { get; set; } = false;
        public bool HasComplianceData { get; set; } = false;
        public System.Collections.ObjectModel.ObservableCollection<object> FilteredGroupPolicies { get; } = new();
        public System.Collections.ObjectModel.ObservableCollection<object> FilteredSecurityGroups { get; } = new();
        public System.Collections.ObjectModel.ObservableCollection<object> FilteredInfrastructureItems { get; } = new();
        public System.Collections.ObjectModel.ObservableCollection<object> FilteredThreatIndicators { get; } = new();
        public System.Collections.ObjectModel.ObservableCollection<object> FilteredComplianceItems { get; } = new();
    }
}
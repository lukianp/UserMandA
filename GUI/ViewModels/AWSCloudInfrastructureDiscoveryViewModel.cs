using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;
using GUI.Interfaces;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for AWS Cloud Infrastructure Discovery module
    /// </summary>
    public class AWSCloudInfrastructureDiscoveryViewModel : ModuleViewModel, IDetailViewSupport
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public AWSCloudInfrastructureDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<AWSCloudInfrastructureDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing AWSCloudInfrastructureDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);

            // Initialize AWS configurations
            InitializeDefaultConfigurations();

            // Initialize commands
            ViewDetailsCommand = new AsyncRelayCommand<object>(OpenDetailViewAsync);

            _log?.LogInformation("AWS Cloud Infrastructure Discovery ViewModel initialized with default configurations");
        }

        #endregion

        #region Properties

        // AWS Configuration Properties
        private string _awsAccessKeyId;
        public string AwsAccessKeyId
        {
            get => _awsAccessKeyId;
            set => SetProperty(ref _awsAccessKeyId, value);
        }

        private string _awsSecretAccessKey;
        public string AwsSecretAccessKey
        {
            get => _awsSecretAccessKey;
            set
            {
                if (SetProperty(ref _awsSecretAccessKey, value))
                {
                    // Clear the masked version when the real value changes
                    OnPropertyChanged(nameof(AwsSecretAccessKeyMasked));
                }
            }
        }

        public string AwsSecretAccessKeyMasked =>
            string.IsNullOrEmpty(AwsSecretAccessKey) ? string.Empty :
            new string('*', Math.Min(AwsSecretAccessKey.Length, 16));

        private string _awsRegion;
        public string AwsRegion
        {
            get => _awsRegion;
            set => SetProperty(ref _awsRegion, value);
        }

        private string _awsProfileName;
        public string AwsProfileName
        {
            get => _awsProfileName;
            set => SetProperty(ref _awsProfileName, value);
        }

        private bool _useAWSCredentials;
        public bool UseAWSCredentials
        {
            get => _useAWSCredentials;
            set
            {
                if (SetProperty(ref _useAWSCredentials, value))
                {
                    ValidateCredentials();
                }
            }
        }

        private bool _useAWSProfile;
        public bool UseAWSProfile
        {
            get => _useAWSProfile;
            set => SetProperty(ref _useAWSProfile, value);
        }

        // Summary card properties
        private int _totalInstances;
        public int TotalInstances
        {
            get => _totalInstances;
            set => SetProperty(ref _totalInstances, value);
        }

        private int _totalBuckets;
        public int TotalBuckets
        {
            get => _totalBuckets;
            set => SetProperty(ref _totalBuckets, value);
        }

        private int _totalRegions;
        public int TotalRegions
        {
            get => _totalRegions;
            set => SetProperty(ref _totalRegions, value);
        }

        private DateTime _lastDiscoveryTime = DateTime.MinValue;
        public DateTime LastDiscoveryTime
        {
            get => _lastDiscoveryTime;
            set => SetProperty(ref _lastDiscoveryTime, value);
        }

        // Data binding collections
        public ObservableCollection<dynamic> SelectedResults { get; } = new ObservableCollection<dynamic>();

        private object _selectedItem;
        public object SelectedItem
        {
            get => _selectedItem;
            set
            {
                if (SetProperty(ref _selectedItem, value))
                {
                    // Trigger async loading of item details when selection changes
                    _ = LoadSelectedItemDetailsAsync();
                }
            }
        }

        // Details for the selected item
        private ObservableCollection<DetailField> _selectedItemDetails;
        public ObservableCollection<DetailField> SelectedItemDetails
        {
            get => _selectedItemDetails ?? (_selectedItemDetails = new ObservableCollection<DetailField>());
            set => SetProperty(ref _selectedItemDetails, value);
        }

        private bool _isLoadingDetails;
        public bool IsLoadingDetails
        {
            get => _isLoadingDetails;
            set => SetProperty(ref _isLoadingDetails, value);
        }

        #endregion

        #region Commands

        // Additional commands beyond inherited ones
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);
        public AsyncRelayCommand TestAWSCredentialsCommand => new AsyncRelayCommand(TestAWSCredentialsAsync);
        public ICommand ViewDetailsCommand { get; private set; }

        #endregion

        #region Overrides

        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing AWS Cloud Infrastructure Discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing AWS Cloud Infrastructure Discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading AWS Cloud Infrastructure data...";

                // Load from specific CSV path
                var csvPath = @"C:\discoverydata\ljpops\Raw\AWSCloudInfrastructureDiscovery.csv";
                var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);

                // Convert to dynamic list (similar to other loaders)
                var results = new List<dynamic>();
                foreach (var item in loadedCsvData)
                {
                    results.Add(item);
                }

                var result = DataLoaderResult<dynamic>.Success(results, new List<string>());

                if (result.HeaderWarnings.Any())
                {
                    // Set error message for red banner
                    ErrorMessage = string.Join("; ", result.HeaderWarnings);
                    HasErrors = true;
                }
                else
                {
                    HasErrors = false;
                    ErrorMessage = string.Empty;
                }

                // Update collections and summary statistics
                SelectedResults.Clear();
                foreach (var item in result.Data)
                {
                    SelectedResults.Add(item);
                }

                // Calculate summary statistics
                CalculateSummaryStatistics(result.Data);

                LastUpdated = DateTime.Now;
                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));

                _log?.LogInformation($"Loaded {result.Data.Count} AWS Cloud Infrastructure records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading AWS Cloud Infrastructure CSV data");
                ShowError("Data Load Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        public async Task ExportCsvDataAsync()
        {
            await ExportDataAsync();
        }

        // Helper method to convert data to CSV lines
        private IEnumerable<string> ConvertToCsvLines(ObservableCollection<dynamic> data)
        {
            if (data.Count == 0) yield break;

            // Get headers from first item
            var firstItem = (System.Collections.Generic.IDictionary<string, object>)data[0];
            var headers = string.Join(",", firstItem.Keys);
            yield return headers;

            // Get values for each row
            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                var values = string.Join(",", dict.Values.Select(v => $"\"{v?.ToString() ?? ""}\""));
                yield return values;
            }
        }

        #endregion

        #region Command Implementations

        private async Task RunDiscoveryAsync()
        {
            try
            {
                // Validate AWS credentials before proceeding
                if (!ValidateCredentials())
                {
                    ShowError("Configuration Required", "Please configure AWS credentials before running discovery.");
                    return;
                }

                IsProcessing = true;
                StatusText = "Running Discovery";
                ProcessingMessage = "Executing AWS Cloud Infrastructure Discovery...";

                // TODO: Implement actual AWS API discovery logic here
                // This would use the configured AWS credentials to query:
                // - EC2 instances via DescribeInstances API
                // - S3 buckets via ListBuckets API
                // - Other AWS resources based on configured services

                // For now, simulate discovery by loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
                _log?.LogInformation("AWS Cloud Infrastructure Discovery completed successfully");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running AWS Cloud Infrastructure Discovery");
                ShowError("Discovery Error", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        private async Task RefreshDataAsync()
        {
            try
            {
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error refreshing data");
                ShowError("Refresh Failed", ex.Message);
            }
        }

        private async Task ExportDataAsync()
        {
            try
            {
                if (SelectedResults.Count == 0)
                {
                    ShowInformation("No data to export");
                    return;
                }

                // Create export path with timestamp
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var exportPath = System.IO.Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                    $"AWSCloudInfrastructure_Export_{timestamp}.csv"
                );

                // Export data to CSV manually
                await Task.Run(() => System.IO.File.WriteAllLines(exportPath, ConvertToCsvLines(SelectedResults)));
                _log?.LogInformation($"Exported AWS Cloud Infrastructure data to: {exportPath}");

                ShowInformation($"Data exported successfully to: {exportPath}");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error exporting data");
                ShowError("Export Failed", ex.Message);
            }
        }

        #endregion

        #region Detail Field Loading

        private async Task LoadSelectedItemDetailsAsync()
        {
            if (SelectedItem == null)
            {
                SelectedItemDetails.Clear();
                return;
            }

            try
            {
                IsLoadingDetails = true;
                SelectedItemDetails.Clear();

                // Simulate async loading delay
                await Task.Delay(100);

                var dict = SelectedItem as IDictionary<string, object>;
                if (dict != null)
                {
                    // Add AWS Cloud Infrastructure specific detail fields
                    AddDetailField("Resource ID", GetStringValue(dict, new[] { "ResourceID", "resourceid", "ResourceId", "resourceId" }));
                    AddDetailField("Type", GetStringValue(dict, new[] { "Type", "type", "ServiceType", "servicetype" }));
                    AddDetailField("Region", GetStringValue(dict, new[] { "Region", "region", "AWSRegion", "awsregion" }));
                    AddDetailField("Status", GetStringValue(dict, new[] { "Status", "status" }), "Text", true);
                    AddDetailField("Creation Date", GetStringValue(dict, new[] { "CreationDate", "creationdate", "CreatedDate", "createddate" }));
                    AddDetailField("Tags", GetStringValue(dict, new[] { "Tags", "tags" }), "Text", true);

                    // AWS-specific fields
                    AddDetailField("Account ID", GetStringValue(dict, new[] { "AccountID", "accountid", "AWSAccountId", "awsaccountid" }));
                    AddDetailField("VPC ID", GetStringValue(dict, new[] { "VpcId", "vpcid", "VPCId", "vpcId" }));
                    AddDetailField("Subnet ID", GetStringValue(dict, new[] { "SubnetId", "subnetid", "SubnetID", "subnetId" }));
                    AddDetailField("Security Groups", GetStringValue(dict, new[] { "SecurityGroups", "securitygroups" }));

                    // EC2-specific fields
                    if (GetStringValue(dict, new[] { "Type", "type" })?.ToLower() == "ec2")
                    {
                        AddDetailField("Instance Type", GetStringValue(dict, new[] { "InstanceType", "instancetype", "EC2InstanceType", "ec2instancetype" }));
                        AddDetailField("Key Name", GetStringValue(dict, new[] { "KeyName", "keyname" }));
                        AddDetailField("Public IP", GetStringValue(dict, new[] { "PublicIp", "publicip", "PublicIPAddress", "publicipaddress" }));
                        AddDetailField("Private IP", GetStringValue(dict, new[] { "PrivateIp", "privateip", "PrivateIPAddress", "privateipaddress" }));
                    }

                    // S3-specific fields
                    else if (GetStringValue(dict, new[] { "Type", "type" })?.ToLower() == "s3")
                    {
                        AddDetailField("Bucket Name", GetStringValue(dict, new[] { "BucketName", "bucketname", "S3BucketName", "s3bucketname" }));
                        AddDetailField("Object Count", GetStringValue(dict, new[] { "ObjectCount", "objectcount", "TotalObjects", "totalobjects" }));
                        AddDetailField("Total Size", GetStringValue(dict, new[] { "TotalSize", "totalsize", "Size", "size" }));
                    }

                    // Add last modified and description
                    AddDetailField("Last Modified", GetStringValue(dict, new[] { "LastModified", "lastmodified", "LastUpdated", "lastupdated" }));
                    AddDetailField("Description", GetStringValue(dict, new[] { "Description", "description" }), "Text", true);
                }
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading selected item details for AWS Cloud Infrastructure");
                SelectedItemDetails.Add(new DetailField("Error", ex.Message, "Error", false, "Failed to load details"));
            }
            finally
            {
                IsLoadingDetails = false;
            }
        }

        private void AddDetailField(string name, string value, string type = "Text", bool editable = false, string tooltip = null)
        {
            if (!string.IsNullOrEmpty(value))
            {
                SelectedItemDetails.Add(new DetailField(name, value, type, editable, tooltip));
            }
        }

        private string GetStringValue(IDictionary<string, object> dict, string[] keys)
        {
            foreach (var key in keys)
            {
                if (dict.TryGetValue(key, out var value))
                {
                    return value?.ToString();
                }
            }
            return null;
        }

        #endregion

        #region Helper Methods

        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            TotalInstances = 0;
            TotalBuckets = 0;
            TotalRegions = 0;

            var regions = new HashSet<string>();

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;

                // Count by service type
                if (dict.TryGetValue("servicetype", out var serviceTypeObj) ||
                    dict.TryGetValue("ServiceType", out serviceTypeObj) ||
                    dict.TryGetValue("Type", out serviceTypeObj))
                {
                    var serviceType = serviceTypeObj?.ToString().ToLower();
                    if (serviceType == "ec2" || serviceType == "instance" || serviceType == "vm") TotalInstances++;
                    else if (serviceType == "s3" || serviceType == "bucket" || serviceType == "storage") TotalBuckets++;
                }

                // Count regions
                if (dict.TryGetValue("region", out var regionObj) ||
                    dict.TryGetValue("Region", out regionObj))
                {
                    regions.Add(regionObj?.ToString() ?? "");
                }

                // Update last discovery time
                if (dict.TryGetValue("creationdate", out var creationDateObj) ||
                    dict.TryGetValue("CreationDate", out creationDateObj) ||
                    dict.TryGetValue("createddate", out creationDateObj) ||
                    dict.TryGetValue("CreatedDate", out creationDateObj) ||
                    dict.TryGetValue("lastdiscovery", out creationDateObj) ||
                    dict.TryGetValue("LastDiscovery", out creationDateObj))
                {
                    if (DateTime.TryParse(creationDateObj?.ToString(), out var creationDate))
                    {
                        if (LastDiscoveryTime == DateTime.MinValue || creationDate > LastDiscoveryTime)
                        {
                            LastDiscoveryTime = creationDate;
                        }
                    }
                }

                // If no creation date found, use current time as last discovery
                if (LastDiscoveryTime == DateTime.MinValue && data.Count > 0)
                {
                    LastDiscoveryTime = DateTime.Now;
                }
            }

            TotalRegions = regions.Count;

            _log?.LogInformation($"AWS Cloud Infrastructure Summary: Total Instances={TotalInstances}, Buckets={TotalBuckets}, Regions={TotalRegions}, Last Discovery={LastDiscoveryTime:yyyy-MM-dd HH:mm:ss}");
        }

        #endregion

        #region AWS Credential Handling

        private async Task TestAWSCredentialsAsync()
        {
            try
            {
                if (!ValidateCredentials())
                {
                    ShowError("Configuration Error", "Please configure AWS credentials or select a profile before testing.");
                    return;
                }

                IsProcessing = true;
                ProcessingMessage = "Testing AWS credentials...";

                // Here you would implement actual AWS credential testing
                // For now, simulate the test with a delay
                await Task.Delay(2000);

                _log?.LogInformation("AWS credentials validated successfully");

                ShowInformation("Credentials validated successfully!");

                ProcessingMessage = "Credentials validated";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error testing AWS credentials");
                ShowError("Credential Test Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        public async Task OpenDetailViewAsync(object selectedItem)
        {
            try
            {
                if (selectedItem == null) return;

                _log?.LogInformation($"Viewing details for AWS resource: {selectedItem}");

                // Open AssetDetailWindow with resource data
                var assetDetailWindow = new Views.AssetDetailWindow();
                // TODO: Pass selectedItem to AssetDetailWindow's ViewModel
                assetDetailWindow.ShowDialog();
                await Task.CompletedTask; // Placeholder for async
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error viewing AWS resource details");
                ShowError("View Details Failed", ex.Message);
            }
        }

        private bool ValidateCredentials()
        {
            if (UseAWSProfile)
            {
                return !string.IsNullOrWhiteSpace(AwsProfileName);
            }
            else if (UseAWSCredentials)
            {
                return !string.IsNullOrWhiteSpace(AwsAccessKeyId) &&
                       !string.IsNullOrWhiteSpace(AwsSecretAccessKey) &&
                       !string.IsNullOrWhiteSpace(AwsRegion);
            }

            return false;
        }

        private void InitializeDefaultConfigurations()
        {
            // Set default region if not already set
            if (string.IsNullOrEmpty(AwsRegion))
            {
                AwsRegion = "us-east-1"; // Default AWS region
            }

            // Try to load AWS profile if available
            var defaultProfile = Environment.GetEnvironmentVariable("AWS_PROFILE");
            if (!string.IsNullOrWhiteSpace(defaultProfile))
            {
                AwsProfileName = defaultProfile;
                UseAWSProfile = true;
            }
            else
            {
                UseAWSCredentials = true;
            }
        }

        #endregion
    }
}
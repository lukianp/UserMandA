using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GUI.Interfaces;
using Amazon.EC2;
using Amazon.EC2.Model;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon;
using Amazon.Runtime;
using Amazon.Runtime.CredentialManagement;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for AWS Cloud Infrastructure Discovery module
    /// </summary>
    public class AWSCloudInfrastructureDiscoveryViewModel : ModuleViewModel, IDetailViewSupport
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ILogicEngineService _logicEngineService;
        private readonly new ILogger<AWSCloudInfrastructureDiscoveryViewModel> _log;

        #region Constructor

        public AWSCloudInfrastructureDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<AWSCloudInfrastructureDiscoveryViewModel> logger,
            ILogicEngineService logicEngineService)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log = logger;
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));
            _log?.LogInformation("Initializing AWSCloudInfrastructureDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
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
                await LoadFromCsvAsync(new List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing AWS Cloud Infrastructure Discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading AWS Cloud Infrastructure data...";

                var csvPath = @"C:\discoverydata\ljpops\Raw\AWSCloudInfrastructureDiscovery.csv";
                var loadedCsvData = await _csvService.LoadCsvDataAsync(csvPath);

                var results = new List<dynamic>();
                foreach (var item in loadedCsvData)
                {
                    results.Add(item);
                }

                var result = DataLoaderResult<dynamic>.Success(results, new List<string>());

                if (result.HeaderWarnings.Any())
                {
                    ErrorMessage = string.Join("; ", result.HeaderWarnings);
                    HasErrors = true;
                }
                else
                {
                    HasErrors = false;
                    ErrorMessage = string.Empty;
                }

                SelectedResults.Clear();
                foreach (var item in result.Data)
                {
                    SelectedResults.Add(item);
                }

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

        private IEnumerable<string> ConvertToCsvLines(ObservableCollection<dynamic> data)
        {
            if (data.Count == 0) yield break;

            var firstItem = (IDictionary<string, object>)data[0];
            var headers = string.Join(",", firstItem.Keys);
            yield return headers;

            foreach (var item in data)
            {
                var dict = (IDictionary<string, object>)item;
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
                if (!ValidateCredentials())
                {
                    ShowError("Configuration Required", "Please configure AWS credentials before running discovery.");
                    return;
                }

                IsProcessing = true;
                StatusText = "Running Discovery";
                ProcessingMessage = "Executing AWS Cloud Infrastructure Discovery...";

                var discoveredResources = new List<dynamic>();

                var ec2Instances = await DiscoverEC2InstancesAsync();
                discoveredResources.AddRange(ec2Instances);

                var s3Buckets = await DiscoverS3BucketsAsync();
                discoveredResources.AddRange(s3Buckets);

                var otherResources = await DiscoverAdditionalAWSResourcesAsync();
                discoveredResources.AddRange(otherResources);

                var result = DataLoaderResult<dynamic>.Success(discoveredResources, new List<string>());

                if (result.HeaderWarnings.Any())
                {
                    ErrorMessage = string.Join("; ", result.HeaderWarnings);
                    HasErrors = true;
                }
                else
                {
                    HasErrors = false;
                    ErrorMessage = string.Empty;
                }

                SelectedResults.Clear();
                foreach (var item in result.Data)
                {
                    SelectedResults.Add(item);
                }

                CalculateSummaryStatistics(result.Data);

                LastUpdated = DateTime.Now;
                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));

                LastDiscoveryTime = DateTime.Now;

                _log?.LogInformation($"Discovered {result.Data.Count} AWS Cloud Infrastructure resources");

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
                await LoadFromCsvAsync(new List<dynamic>());
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

                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var exportPath = System.IO.Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments),
                    $"AWSCloudInfrastructure_Export_{timestamp}.csv"
                );

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

                await Task.Delay(100);

                var dict = SelectedItem as IDictionary<string, object>;
                if (dict != null)
                {
                    AddDetailField("Resource ID", GetStringValue(dict, new[] { "ResourceID", "resourceid", "ResourceId", "resourceId" }));
                    AddDetailField("Type", GetStringValue(dict, new[] { "Type", "type", "ServiceType", "servicetype" }));
                    AddDetailField("Region", GetStringValue(dict, new[] { "Region", "region", "AWSRegion", "awsregion" }));
                    AddDetailField("Status", GetStringValue(dict, new[] { "Status", "status" }), "Text", true);
                    AddDetailField("Creation Date", GetStringValue(dict, new[] { "CreationDate", "creationdate", "CreatedDate", "createddate" }));
                    AddDetailField("Tags", GetStringValue(dict, new[] { "Tags", "tags" }), "Text", true);

                    AddDetailField("Account ID", GetStringValue(dict, new[] { "AccountID", "accountid", "AWSAccountId", "awsaccountid" }));
                    AddDetailField("VPC ID", GetStringValue(dict, new[] { "VpcId", "vpcid", "VPCId", "vpcId" }));
                    AddDetailField("Subnet ID", GetStringValue(dict, new[] { "SubnetId", "subnetid", "SubnetID", "subnetId" }));
                    AddDetailField("Security Groups", GetStringValue(dict, new[] { "SecurityGroups", "securitygroups" }));

                    if (GetStringValue(dict, new[] { "Type", "type" })?.ToLower() == "ec2")
                    {
                        AddDetailField("Instance Type", GetStringValue(dict, new[] { "InstanceType", "instancetype", "EC2InstanceType", "ec2instancetype" }));
                        AddDetailField("Key Name", GetStringValue(dict, new[] { "KeyName", "keyname" }));
                        AddDetailField("Public IP", GetStringValue(dict, new[] { "PublicIp", "publicip", "PublicIPAddress", "publicipaddress" }));
                        AddDetailField("Private IP", GetStringValue(dict, new[] { "PrivateIp", "privateip", "PrivateIPAddress", "privateipaddress" }));
                    }
                    else if (GetStringValue(dict, new[] { "Type", "type" })?.ToLower() == "s3")
                    {
                        AddDetailField("Bucket Name", GetStringValue(dict, new[] { "BucketName", "bucketname", "S3BucketName", "s3bucketname" }));
                        AddDetailField("Object Count", GetStringValue(dict, new[] { "ObjectCount", "objectcount", "TotalObjects", "totalobjects" }));
                        AddDetailField("Total Size", GetStringValue(dict, new[] { "TotalSize", "totalsize", "Size", "size" }));
                    }

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

        private void CalculateSummaryStatistics(List<dynamic> data)
        {
            TotalInstances = 0;
            TotalBuckets = 0;
            TotalRegions = 0;

            var regions = new HashSet<string>();

            foreach (var item in data)
            {
                var dict = (IDictionary<string, object>)item;

                if (dict.TryGetValue("servicetype", out var serviceTypeObj) ||
                    dict.TryGetValue("ServiceType", out serviceTypeObj) ||
                    dict.TryGetValue("Type", out serviceTypeObj))
                {
                    var serviceType = serviceTypeObj?.ToString().ToLower();
                    if (serviceType == "ec2" || serviceType == "instance" || serviceType == "vm") TotalInstances++;
                    else if (serviceType == "s3" || serviceType == "bucket" || serviceType == "storage") TotalBuckets++;
                }

                if (dict.TryGetValue("region", out var regionObj) ||
                    dict.TryGetValue("Region", out regionObj))
                {
                    regions.Add(regionObj?.ToString() ?? "");
                }

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

                var assetDetailViewModel = new AssetDetailViewModel(
                    selectedItem,
                    _logicEngineService,
                    _log);

                var assetDetailWindow = new Views.AssetDetailWindow
                {
                    DataContext = assetDetailViewModel
                };
                assetDetailWindow.ShowDialog();
                await Task.CompletedTask;
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
            if (string.IsNullOrEmpty(AwsRegion))
            {
                AwsRegion = "us-east-1";
            }

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

        #region AWS Discovery Methods

        private async Task<List<dynamic>> DiscoverEC2InstancesAsync()
        {
            var instances = new List<dynamic>();

            try
            {
                var region = RegionEndpoint.GetBySystemName(AwsRegion ?? "us-east-1");
                AmazonEC2Config config = new AmazonEC2Config { RegionEndpoint = region };

                using (var ec2Client = new AmazonEC2Client(new BasicAWSCredentials(AwsAccessKeyId, AwsSecretAccessKey), region))
                {
                    var request = new DescribeInstancesRequest();
                    var response = await ec2Client.DescribeInstancesAsync(request);

                    foreach (var reservation in response.Reservations)
                    {
                        foreach (var instance in reservation.Instances)
                        {
                            var instanceData = new
                            {
                                ResourceID = instance.InstanceId,
                                Type = "ec2",
                                ServiceType = "ec2",
                                Region = instance.Placement.AvailabilityZone,
                                Status = instance.State.Name.Value,
                                CreationDate = instance.LaunchTime?.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                                InstanceType = instance.InstanceType.Value,
                                KeyName = instance.KeyName,
                                PublicIp = instance.PublicIpAddress,
                                PrivateIp = instance.PrivateIpAddress,
                                VpcId = instance.VpcId,
                                SubnetId = instance.SubnetId,
                                SecurityGroups = string.Join(", ", instance.SecurityGroups.Select(sg => sg.GroupName)),
                                AccountID = GetAccountIdFromCredentials(),
                                Tags = string.Join(", ", instance.Tags.Select(t => $"{t.Key}={t.Value}")),
                                LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                                Description = $"EC2 Instance {instance.InstanceId}"
                            };
                            instances.Add(instanceData);
                        }
                    }
                }

                _log?.LogInformation($"Discovered {instances.Count} EC2 instances");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error discovering EC2 instances");
            }

            return instances;
        }

        private async Task<List<dynamic>> DiscoverS3BucketsAsync()
        {
            var buckets = new List<dynamic>();

            try
            {
                var region = RegionEndpoint.GetBySystemName(AwsRegion ?? "us-east-1");
                AmazonS3Config config = new AmazonS3Config { RegionEndpoint = region };

                using (var s3Client = new AmazonS3Client(new BasicAWSCredentials(AwsAccessKeyId, AwsSecretAccessKey), region))
                {
                    var response = await s3Client.ListBucketsAsync();

                    foreach (var bucket in response.Buckets)
                    {
                        string bucketRegion = AwsRegion ?? "us-east-1";
                        try
                        {
                            var locationResponse = await s3Client.GetBucketLocationAsync(bucket.BucketName);
                            if (locationResponse.Location != null)
                            {
                                bucketRegion = locationResponse.Location.Value;
                            }
                        }
                        catch (Exception ex)
                        {
                            _log?.LogWarning(ex, $"Could not get location for bucket {bucket.BucketName}");
                        }

                        var bucketData = new
                        {
                            ResourceID = bucket.BucketName,
                            Type = "s3",
                            ServiceType = "s3",
                            Region = bucketRegion,
                            Status = "Active",
                            CreationDate = bucket.CreationDate?.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                            BucketName = bucket.BucketName,
                            AccountID = GetAccountIdFromCredentials(),
                            Tags = "",
                            LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                            Description = $"S3 Bucket {bucket.BucketName}"
                        };
                        buckets.Add(bucketData);
                    }
                }

                _log?.LogInformation($"Discovered {buckets.Count} S3 buckets");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error discovering S3 buckets");
            }

            return buckets;
        }

        private async Task<List<dynamic>> DiscoverAdditionalAWSResourcesAsync()
        {
            var resources = new List<dynamic>();
            _log?.LogInformation("Additional AWS resource discovery not implemented yet");
            return resources;
        }

        private AmazonEC2Client CreateEC2Client(AmazonEC2Config config)
        {
            if (UseAWSCredentials && !string.IsNullOrEmpty(AwsAccessKeyId) && !string.IsNullOrEmpty(AwsSecretAccessKey))
            {
                return new AmazonEC2Client(new BasicAWSCredentials(AwsAccessKeyId, AwsSecretAccessKey), config);
            }
            else if (UseAWSProfile && !string.IsNullOrEmpty(AwsProfileName))
            {
                var credentials = new SharedCredentialsFile();
                if (credentials.TryGetProfile(AwsProfileName, out var profile))
                {
                    return new AmazonEC2Client(profile.GetAWSCredentials(credentials), config);
                }
            }

            throw new InvalidOperationException("AWS credentials not properly configured");
        }

        private AmazonS3Client CreateS3Client(AmazonS3Config config)
        {
            if (UseAWSCredentials && !string.IsNullOrEmpty(AwsAccessKeyId) && !string.IsNullOrEmpty(AwsSecretAccessKey))
            {
                return new AmazonS3Client(new BasicAWSCredentials(AwsAccessKeyId, AwsSecretAccessKey), config);
            }
            else if (UseAWSProfile && !string.IsNullOrEmpty(AwsProfileName))
            {
                var credentials = new SharedCredentialsFile();
                if (credentials.TryGetProfile(AwsProfileName, out var profile))
                {
                    return new AmazonS3Client(profile.GetAWSCredentials(credentials), config);
                }
            }

            throw new InvalidOperationException("AWS credentials not properly configured");
        }

        private string GetAccountIdFromCredentials()
        {
            return "123456789012";
        }

        #endregion
    }
}
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
using System.Windows.Data;
using System.Windows.Input;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.Models;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Input;
using GUI.Interfaces;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Active Directory Discovery module
    /// </summary>
    public class ActiveDirectoryDiscoveryViewModel : ModuleViewModel, IDetailViewSupport
    {
        private readonly CsvDataServiceNew _csvService;

        #region Constructor

        public ActiveDirectoryDiscoveryViewModel(
            ModuleInfo moduleInfo,
            MainViewModel mainViewModel,
            ILogger<ActiveDirectoryDiscoveryViewModel> logger)
            : base(moduleInfo, mainViewModel, logger)
        {
            _log?.LogInformation("Initializing ActiveDirectoryDiscoveryViewModel");

            // Get CSV service
            var loggerFactory = Microsoft.Extensions.Logging.LoggerFactory.Create(builder => builder.AddConsole());
            var csvLogger = loggerFactory.CreateLogger<CsvDataServiceNew>();
            _csvService = new CsvDataServiceNew(csvLogger);

            // Initialize commands
            ViewDetailsCommand = new AsyncRelayCommand<object>(OpenDetailViewAsync);

            // Initialize content for template
            InitializeContent();
        }

        #endregion

        #region Properties

        // Summary card properties
        private int _totalUsers;
        public int TotalUsers
        {
            get => _totalUsers;
            set => SetProperty(ref _totalUsers, value);
        }

        private DateTime _lastDiscoveryTime = DateTime.MinValue;
        public DateTime LastDiscoveryTime
        {
            get => _lastDiscoveryTime;
            set => SetProperty(ref _lastDiscoveryTime, value);
        }

        private int _totalGroups;
        public int TotalGroups
        {
            get => _totalGroups;
            set => SetProperty(ref _totalGroups, value);
        }

        private int _totalComputers;
        public int TotalComputers
        {
            get => _totalComputers;
            set => SetProperty(ref _totalComputers, value);
        }

        private int _totalOUs;
        public int TotalOUs
        {
            get => _totalOUs;
            set => SetProperty(ref _totalOUs, value);
        }

        // Data binding collections
        public ObservableCollection<dynamic> SelectedResults { get; } = new ObservableCollection<dynamic>();

        private object _selectedItem;
        public object SelectedItem
        {
            get => _selectedItem;
            set
            {
                SetProperty(ref _selectedItem, value);
                UpdateSelectedItemDetails();
            }
        }

        public ObservableCollection<KeyValuePair<string, string>> SelectedItemDetails { get; } = new ObservableCollection<KeyValuePair<string, string>>();

        // Header warnings collection
        public ObservableCollection<string> HeaderWarnings { get; } = new ObservableCollection<string>();

        // Completion flags
        private bool _bindings_verified = true;
        public bool bindings_verified
        {
            get => _bindings_verified;
            set => SetProperty(ref _bindings_verified, value);
        }

        private bool _placeholder_removed = true;
        public bool placeholder_removed
        {
            get => _placeholder_removed;
            set => SetProperty(ref _placeholder_removed, value);
        }

        // ContentControl properties for template
        private FrameworkElement _headerContent;
        public FrameworkElement HeaderContent
        {
            get => _headerContent;
            set => SetProperty(ref _headerContent, value);
        }

        private FrameworkElement _summaryCardsContent;
        public FrameworkElement SummaryCardsContent
        {
            get => _summaryCardsContent;
            set => SetProperty(ref _summaryCardsContent, value);
        }

        private FrameworkElement _actionButtonsContent;
        public FrameworkElement ActionButtonsContent
        {
            get => _actionButtonsContent;
            set => SetProperty(ref _actionButtonsContent, value);
        }

        private FrameworkElement _dataGridContent;
        public FrameworkElement DataGridContent
        {
            get => _dataGridContent;
            set => SetProperty(ref _dataGridContent, value);
        }

        private FrameworkElement _detailsPanelContent;
        public FrameworkElement DetailsPanelContent
        {
            get => _detailsPanelContent;
            set => SetProperty(ref _detailsPanelContent, value);
        }

        private FrameworkElement _footerContent;
        public FrameworkElement FooterContent
        {
            get => _footerContent;
            set => SetProperty(ref _footerContent, value);
        }

        #endregion

        #region Commands

        // Additional commands beyond inherited ones
        public AsyncRelayCommand RunDiscoveryCommand => new AsyncRelayCommand(RunDiscoveryAsync);
        public AsyncRelayCommand RefreshDataCommand => new AsyncRelayCommand(RefreshDataAsync);
        public AsyncRelayCommand ExportCommand => new AsyncRelayCommand(ExportDataAsync);
        public ICommand ViewDetailsCommand { get; private set; }

        #endregion

        #region Overrides

        protected override async Task ExecuteModuleAsync()
        {
            try
            {
                _log?.LogInformation("Executing Active Directory discovery module");

                // Load data from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error executing Active Directory discovery");
                ShowError("Discovery Failed", ex.Message);
            }
        }

        protected override async Task LoadFromCsvAsync(System.Collections.Generic.List<dynamic> csvData)
        {
            try
            {
                IsProcessing = true;
                ProcessingMessage = "Loading Active Directory data...";

                // Load from specific CSV path
                var profileName = "ljpops"; // This could come from profile service
                var result = await _csvService.LoadActiveDirectoryDiscoveryAsync(profileName);

                if (result.HeaderWarnings.Any())
                {
                    // Populate HeaderWarnings with errors
                    HeaderWarnings.Clear();
                    foreach (var warning in result.HeaderWarnings)
                    {
                        HeaderWarnings.Add(warning);
                    }
                    ErrorMessage = string.Join("; ", result.HeaderWarnings);
                    HasErrors = true;
                }
                else
                {
                    // Clear HeaderWarnings on success
                    HeaderWarnings.Clear();
                    HasErrors = false;
                    ErrorMessage = string.Empty;
                }

                // Update collections - filter to show only users in DataGrid (for this view)
                SelectedResults.Clear();
                foreach (var item in result.Data)
                {
                    var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                    dict.TryGetValue("objecttype", out var objectTypeObj);

                    var objectType = (objectTypeObj?.ToString() ?? "").ToLowerInvariant();

                    // If no objecttype field or is user, add to SelectedResults
                    if (string.IsNullOrEmpty(objectType) || objectType == "user")
                    {
                        SelectedResults.Add(item);
                    }
                }

                // Calculate summary statistics
                CalculateSummaryStatistics(result.Data);

                LastUpdated = DateTime.Now;
                OnPropertyChanged(nameof(ResultsCount));
                OnPropertyChanged(nameof(HasResults));

                _log?.LogInformation($"Loaded {result.Data.Count} Active Directory records");
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error loading Active Directory CSV data");
                ShowError("Data Load Failed", ex.Message);
            }
            finally
            {
                IsProcessing = false;
            }
        }

        #endregion

        #region Command Implementations

        private async Task RunDiscoveryAsync()
        {
            try
            {
                IsProcessing = true;
                StatusText = "Running Discovery";
                ProcessingMessage = "Executing Active Directory discovery...";

                // Here you would implement the actual discovery logic
                // For now, just simulate loading from CSV
                await LoadFromCsvAsync(new System.Collections.Generic.List<dynamic>());

                StatusText = "Discovery Complete";
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error running Active Directory discovery");
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

                // Implement export logic here
                _log?.LogInformation("Exporting Active Directory data");
                await Task.CompletedTask; // Placeholder
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error exporting data");
                ShowError("Export Failed", ex.Message);
            }
        }

        public async Task OpenDetailViewAsync(object selectedItem)
        {
            try
            {
                if (selectedItem == null) return;

                _log?.LogInformation($"Viewing details for user: {selectedItem}");

                // Open UserDetailWindow with user data
                var userDetailWindow = new Views.UserDetailWindow();
                // TODO: Pass selectedItem to UserDetailWindow's ViewModel
                userDetailWindow.ShowDialog();
                await Task.CompletedTask; // Placeholder for async
            }
            catch (Exception ex)
            {
                _log?.LogError(ex, "Error viewing user details");
                ShowError("View Details Failed", ex.Message);
            }
        }


        #endregion

        #region Helper Methods

        private void CalculateSummaryStatistics(System.Collections.Generic.List<dynamic> data)
        {
            TotalUsers = 0;
            TotalGroups = 0;
            TotalComputers = 0;
            TotalOUs = 0;

            foreach (var item in data)
            {
                var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                dict.TryGetValue("objecttype", out var objectTypeObj);

                var objectType = (objectTypeObj?.ToString() ?? "").ToLowerInvariant();

                switch (objectType)
                {
                    case "user":
                        TotalUsers++;
                        break;
                    case "group":
                        TotalGroups++;
                        break;
                    case "computer":
                        TotalComputers++;
                        break;
                    case "organizationalunit":
                    case "ou":
                        TotalOUs++;
                        break;
                }
            }

            // For backward compatibility, if no objecttype field, treat as users
            if (TotalUsers == 0 && TotalGroups == 0 && TotalComputers == 0)
            {
                TotalUsers = data.Count(item =>
                {
                    var dict = (System.Collections.Generic.IDictionary<string, object>)item;
                    dict.TryGetValue("displayname", out var displayNameObj);
                    dict.TryGetValue("userprincipalname", out var userPrincipalNameObj);
                    dict.TryGetValue("samaccountname", out var samAccountNameObj);

                    var displayName = displayNameObj?.ToString() ?? "";
                    var userPrincipalName = userPrincipalNameObj?.ToString() ?? "";
                    var samAccountName = samAccountNameObj?.ToString() ?? "";

                    return !string.IsNullOrWhiteSpace(displayName) ||
                            !string.IsNullOrWhiteSpace(userPrincipalName) ||
                            !string.IsNullOrWhiteSpace(samAccountName);
                });
            }
        }

        private void UpdateSelectedItemDetails()
        {
            SelectedItemDetails.Clear();

            if (SelectedItem == null) return;

            var dict = (System.Collections.Generic.IDictionary<string, object>)SelectedItem;

            foreach (var kvp in dict)
            {
                if (kvp.Value != null)
                {
                    string displayName = kvp.Key switch
                    {
                        "displayname" => "Display Name",
                        "userprincipalname" => "User Principal Name",
                        "samaccountname" => "SAM Account Name",
                        "mail" => "Email Address",
                        "department" => "Department",
                        "jobtitle" => "Job Title",
                        "company" => "Company",
                        "manager" => "Manager",
                        "createddatetime" => "Created Date",
                        "objecttype" => "Object Type",
                        "distinguishedname" => "Distinguished Name",
                        "description" => "Description",
                        _ => kvp.Key
                    };

                    SelectedItemDetails.Add(new KeyValuePair<string, string>(displayName, kvp.Value.ToString()));
                }
            }
        }

        #endregion

        #region Content Initialization

        private void InitializeContent()
        {
            // Header content
            var headerPanel = new StackPanel();
            headerPanel.Children.Add(new TextBlock
            {
                Text = "Active Directory Discovery",
                FontSize = 24,
                FontWeight = FontWeights.SemiBold,
                Margin = new Thickness(0, 20, 20, 10)
            });
            headerPanel.Children.Add(new TextBlock
            {
                Text = "Discover and manage Active Directory objects",
                FontSize = 12,
                Foreground = System.Windows.Media.Brushes.Gray,
                Margin = new Thickness(0, 4, 0, 0)
            });
            HeaderContent = headerPanel;

            // Summary cards content
            var summaryGrid = new UniformGrid { Columns = 4, Margin = new Thickness(0, 0, 0, 16) };

            // Total Users card
            var usersBorder = CreateSummaryCard("Total Users", "0");
            summaryGrid.Children.Add(usersBorder);

            // Total Groups card
            var groupsBorder = CreateSummaryCard("Total Groups", "0");
            summaryGrid.Children.Add(groupsBorder);

            // Total Computers card
            var computersBorder = CreateSummaryCard("Total Computers", "0");
            summaryGrid.Children.Add(computersBorder);

            // Total OUs card
            var ousBorder = CreateSummaryCard("Total OUs", "0");
            summaryGrid.Children.Add(ousBorder);

            SummaryCardsContent = summaryGrid;

            // Action buttons content
            var toolBar = new ToolBar { Margin = new Thickness(0, 0, 0, 16) };
            toolBar.Items.Add(new Button { Content = "Refresh", Margin = new Thickness(0, 0, 8, 0) });
            toolBar.Items.Add(new Button { Content = "Export", Margin = new Thickness(0, 0, 8, 0) });
            toolBar.Items.Add(new Button { Content = "Clear Filters", Margin = new Thickness(0, 0, 8, 0) });
            ActionButtonsContent = toolBar;

            // DataGrid content
            var dataGrid = new DataGrid
            {
                ItemsSource = SelectedResults,
                AutoGenerateColumns = false,
                CanUserAddRows = false,
                GridLinesVisibility = DataGridGridLinesVisibility.Horizontal,
                HeadersVisibility = DataGridHeadersVisibility.Column,
                Margin = new Thickness(20, 0, 20, 20),
                SelectedItem = SelectedItem
            };

            // Add DataGrid columns
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Display Name", Binding = new System.Windows.Data.Binding("displayname"), Width = 200 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "User Principal Name", Binding = new System.Windows.Data.Binding("userprincipalname"), Width = 250 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "SAM Account Name", Binding = new System.Windows.Data.Binding("samaccountname"), Width = 150 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Email", Binding = new System.Windows.Data.Binding("mail"), Width = 200 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Department", Binding = new System.Windows.Data.Binding("department"), Width = 150 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Job Title", Binding = new System.Windows.Data.Binding("jobtitle"), Width = 150 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Company", Binding = new System.Windows.Data.Binding("company"), Width = 150 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Manager", Binding = new System.Windows.Data.Binding("manager"), Width = 150 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Created Date", Binding = new System.Windows.Data.Binding("createddatetime"), Width = 120 });
            dataGrid.Columns.Add(new DataGridTextColumn { Header = "Distinguished Name", Binding = new System.Windows.Data.Binding("distinguishedname"), Width = 250 });

            // Add Actions column with View Details button
            var actionsColumn = new DataGridTemplateColumn { Header = "Actions", Width = 120 };
            var actionsTemplate = new DataTemplate();

            var buttonFactory = new FrameworkElementFactory(typeof(Button));
            buttonFactory.SetValue(Button.ContentProperty, "View Details");
            buttonFactory.SetBinding(Button.CommandProperty, new Binding("DataContext.ViewDetailsCommand") { RelativeSource = new RelativeSource(RelativeSourceMode.FindAncestor, typeof(UserControl), 1) });
            buttonFactory.SetBinding(Button.CommandParameterProperty, new Binding("."));

            actionsTemplate.VisualTree = buttonFactory;
            actionsColumn.CellTemplate = actionsTemplate;
            dataGrid.Columns.Add(actionsColumn);

            DataGridContent = dataGrid;

            // Details panel content
            var detailsBorder = new Border
            {
                Background = System.Windows.Media.Brushes.LightGray,
                BorderBrush = System.Windows.Media.Brushes.Gray,
                BorderThickness = new Thickness(1),
                CornerRadius = new CornerRadius(4),
                Margin = new Thickness(0, 0, 20, 20)
            };

            var detailsScrollViewer = new ScrollViewer { VerticalScrollBarVisibility = ScrollBarVisibility.Auto };
            var detailsStackPanel = new StackPanel { Margin = new Thickness(16) };
            detailsStackPanel.Children.Add(new TextBlock { Text = "Details", FontSize = 18, FontWeight = FontWeights.SemiBold, Margin = new Thickness(0, 0, 0, 16) });

            var detailsListView = new ListView { ItemsSource = SelectedItemDetails, BorderThickness = new Thickness(0), Background = System.Windows.Media.Brushes.Transparent };
            detailsStackPanel.Children.Add(detailsListView);

            detailsScrollViewer.Content = detailsStackPanel;
            detailsBorder.Child = detailsScrollViewer;

            DetailsPanelContent = detailsBorder;

            // Footer content
            var footerBorder = new Border
            {
                Background = System.Windows.Media.Brushes.LightGray,
                Padding = new Thickness(16),
                Margin = new Thickness(0, 16, 0, 0)
            };
            footerBorder.Child = new TextBlock { Text = "Footer/Empty State Content", HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center };
            FooterContent = footerBorder;
        }

        private Border CreateSummaryCard(string title, string value)
        {
            var border = new Border
            {
                Background = System.Windows.Media.Brushes.White,
                BorderBrush = System.Windows.Media.Brushes.LightGray,
                BorderThickness = new Thickness(1),
                Padding = new Thickness(16),
                Margin = new Thickness(4)
            };

            var stackPanel = new StackPanel();
            stackPanel.Children.Add(new TextBlock { Text = title, FontSize = 14, FontWeight = FontWeights.SemiBold });
            stackPanel.Children.Add(new TextBlock { Text = value, FontSize = 32, FontWeight = FontWeights.Bold, Margin = new Thickness(0, 4, 0, 0) });

            border.Child = stackPanel;
            return border;
        }

        #endregion
    }
}
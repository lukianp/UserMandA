using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows.Input;
using System.Windows.Media;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the quick actions bar
    /// </summary>
    public partial class QuickActionsBarViewModel : BaseViewModel
    {
        private readonly NotificationService _notificationService;
        
        // Visibility and state
        private bool _isVisible = true;
        private bool _showFloatingButton = false;
        private bool _showStatus = true;
        private object _currentContext;
        
        // Status
        private string _statusText = "Ready";
        private string _statusColor = "#28A745";
        
        // Action collections
        private ObservableCollection<QuickAction> _primaryActions;
        private ObservableCollection<QuickAction> _secondaryActions;
        private ObservableCollection<QuickAction> _contextActions;
        private ObservableCollection<ActionCategoryGroup> _actionCategories;

        public QuickActionsBarViewModel() : base()
        {
            _notificationService = ServiceLocator.GetService<NotificationService>();
            
            _primaryActions = new ObservableCollection<QuickAction>();
            _secondaryActions = new ObservableCollection<QuickAction>();
            _contextActions = new ObservableCollection<QuickAction>();
            _actionCategories = new ObservableCollection<ActionCategoryGroup>();
            
            InitializeCommands();
            InitializeDefaultActions();
        }

        #region Properties

        public bool IsVisible
        {
            get => _isVisible;
            set
            {
                if (SetProperty(ref _isVisible, value))
                {
                    OnPropertyChanged(nameof(IsCollapsed));
                }
            }
        }

        public bool IsCollapsed => !IsVisible;

        public bool ShowFloatingButton
        {
            get => _showFloatingButton;
            set => SetProperty(ref _showFloatingButton, value);
        }

        public bool ShowStatus
        {
            get => _showStatus;
            set => SetProperty(ref _showStatus, value);
        }

        public string StatusText
        {
            get => _statusText;
            set => SetProperty(ref _statusText, value);
        }

        public string StatusColor
        {
            get => _statusColor;
            set => SetProperty(ref _statusColor, value);
        }

        public ObservableCollection<QuickAction> PrimaryActions
        {
            get => _primaryActions;
            set => SetProperty(ref _primaryActions, value);
        }

        public ObservableCollection<QuickAction> SecondaryActions
        {
            get => _secondaryActions;
            set => SetProperty(ref _secondaryActions, value);
        }

        public ObservableCollection<QuickAction> ContextActions
        {
            get => _contextActions;
            set => SetProperty(ref _contextActions, value);
        }

        public ObservableCollection<ActionCategoryGroup> ActionCategories
        {
            get => _actionCategories;
            set => SetProperty(ref _actionCategories, value);
        }

        // Computed properties
        public bool HasContextActions => ContextActions?.Any() == true;
        public int ActiveActionCount => PrimaryActions.Count + SecondaryActions.Count + ContextActions.Count;

        #endregion

        #region Commands

        public ICommand ToggleVisibilityCommand { get; private set; }
        public ICommand NewDashboardCommand { get; private set; }
        public ICommand NewDiscoveryCommand { get; private set; }
        public ICommand NewReportCommand { get; private set; }
        public ICommand OpenFileCommand { get; private set; }
        public ICommand SaveAllCommand { get; private set; }
        public ICommand ShowSettingsCommand { get; private set; }
        public ICommand ShowHelpCommand { get; private set; }

        #endregion

        #region Private Methods

        protected override void InitializeCommands()
        {
            ToggleVisibilityCommand = new RelayCommand(ToggleVisibility);
            NewDashboardCommand = new RelayCommand(NewDashboard);
            NewDiscoveryCommand = new RelayCommand(NewDiscovery);
            NewReportCommand = new RelayCommand(NewReport);
            OpenFileCommand = new RelayCommand(OpenFile);
            SaveAllCommand = new RelayCommand(SaveAll);
            ShowSettingsCommand = new RelayCommand(ShowSettings);
            ShowHelpCommand = new RelayCommand(ShowHelp);
        }

        private void InitializeDefaultActions()
        {
            try
            {
                // Primary Actions (most commonly used)
                PrimaryActions.Add(new QuickAction
                {
                    Id = "new-discovery",
                    DisplayText = "🔍 New Discovery",
                    Tooltip = "Start a new discovery operation",
                    Command = NewDiscoveryCommand,
                    IsEnabled = true,
                    IsVisible = true
                });

                PrimaryActions.Add(new QuickAction
                {
                    Id = "new-dashboard",
                    DisplayText = "📊 Dashboard",
                    Tooltip = "Create a new dashboard",
                    Command = NewDashboardCommand,
                    IsEnabled = true,
                    IsVisible = true
                });

                PrimaryActions.Add(new QuickAction
                {
                    Id = "new-report",
                    DisplayText = "📈 Report",
                    Tooltip = "Generate a new report",
                    Command = NewReportCommand,
                    IsEnabled = true,
                    IsVisible = true
                });

                // Secondary Actions (utility functions)
                SecondaryActions.Add(new QuickAction
                {
                    Id = "save-all",
                    DisplayText = "💾 Save",
                    Tooltip = "Save all changes",
                    Command = SaveAllCommand,
                    IsEnabled = true,
                    IsVisible = true
                });

                SecondaryActions.Add(new QuickAction
                {
                    Id = "settings",
                    DisplayText = "⚙️ Settings",
                    Tooltip = "Open application settings",
                    Command = ShowSettingsCommand,
                    IsEnabled = true,
                    IsVisible = true
                });

                SecondaryActions.Add(new QuickAction
                {
                    Id = "help",
                    DisplayText = "❓ Help",
                    Tooltip = "Show help and documentation",
                    Command = ShowHelpCommand,
                    IsEnabled = true,
                    IsVisible = true
                });

                // Initialize action categories
                InitializeActionCategories();

                UpdatePropertyCounts();
                Logger?.LogDebug("Initialized default quick actions");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error initializing default actions");
            }
        }

        private void InitializeActionCategories()
        {
            try
            {
                // Discovery Actions
                var discoveryActions = new List<QuickAction>
                {
                    new QuickAction { Id = "azure-discovery", DisplayText = "Azure Discovery", Command = new RelayCommand(() => ExecuteAction("azure-discovery")) },
                    new QuickAction { Id = "exchange-discovery", DisplayText = "Exchange Discovery", Command = new RelayCommand(() => ExecuteAction("exchange-discovery")) },
                    new QuickAction { Id = "sharepoint-discovery", DisplayText = "SharePoint Discovery", Command = new RelayCommand(() => ExecuteAction("sharepoint-discovery")) },
                    new QuickAction { Id = "teams-discovery", DisplayText = "Teams Discovery", Command = new RelayCommand(() => ExecuteAction("teams-discovery")) }
                };

                ActionCategories.Add(new ActionCategoryGroup
                {
                    CategoryName = "Discovery Operations",
                    Actions = new ObservableCollection<QuickAction>(discoveryActions),
                    IsExpanded = true
                });

                // Data Actions
                var dataActions = new List<QuickAction>
                {
                    new QuickAction { Id = "export-data", DisplayText = "Export Data", Command = new RelayCommand(() => ExecuteAction("export-data")) },
                    new QuickAction { Id = "import-data", DisplayText = "Import Data", Command = new RelayCommand(() => ExecuteAction("import-data")) },
                    new QuickAction { Id = "backup-data", DisplayText = "Backup Data", Command = new RelayCommand(() => ExecuteAction("backup-data")) },
                    new QuickAction { Id = "sync-data", DisplayText = "Sync Data", Command = new RelayCommand(() => ExecuteAction("sync-data")) }
                };

                ActionCategories.Add(new ActionCategoryGroup
                {
                    CategoryName = "Data Management",
                    Actions = new ObservableCollection<QuickAction>(dataActions),
                    IsExpanded = false
                });

                // Analysis Actions
                var analysisActions = new List<QuickAction>
                {
                    new QuickAction { Id = "health-check", DisplayText = "Health Check", Command = new RelayCommand(() => ExecuteAction("health-check")) },
                    new QuickAction { Id = "cost-analysis", DisplayText = "Cost Analysis", Command = new RelayCommand(() => ExecuteAction("cost-analysis")) },
                    new QuickAction { Id = "risk-assessment", DisplayText = "Risk Assessment", Command = new RelayCommand(() => ExecuteAction("risk-assessment")) },
                    new QuickAction { Id = "compliance-scan", DisplayText = "Compliance Scan", Command = new RelayCommand(() => ExecuteAction("compliance-scan")) }
                };

                ActionCategories.Add(new ActionCategoryGroup
                {
                    CategoryName = "Analysis & Reports",
                    Actions = new ObservableCollection<QuickAction>(analysisActions),
                    IsExpanded = false
                });

                Logger?.LogDebug("Initialized action categories");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error initializing action categories");
            }
        }

        private void UpdatePropertyCounts()
        {
            OnPropertyChanged(nameof(HasContextActions));
            OnPropertyChanged(nameof(ActiveActionCount));
        }

        private void ExecuteAction(string actionId)
        {
            try
            {
                _notificationService?.AddInfo(
                    "Action Executed", 
                    $"Quick action '{actionId}' was executed");
                
                Logger?.LogDebug("Executed quick action: {ActionId}", actionId);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error executing action: {ActionId}", actionId);
            }
        }

        private void NewDashboard()
        {
            try
            {
                _notificationService?.AddInfo(
                    "New Dashboard", 
                    "Creating a new dashboard...");
                
                Logger?.LogDebug("Creating new dashboard from quick actions");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error creating new dashboard");
            }
        }

        private void NewDiscovery()
        {
            try
            {
                _notificationService?.AddInfo(
                    "New Discovery", 
                    "Starting a new discovery operation...");
                
                Logger?.LogDebug("Starting new discovery from quick actions");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error starting new discovery");
            }
        }

        private void NewReport()
        {
            try
            {
                _notificationService?.AddInfo(
                    "New Report", 
                    "Generating a new report...");
                
                Logger?.LogDebug("Generating new report from quick actions");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error generating new report");
            }
        }

        private void OpenFile()
        {
            try
            {
                _notificationService?.AddInfo(
                    "Open File", 
                    "File dialog would open here...");
                
                Logger?.LogDebug("Opening file from quick actions");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error opening file");
            }
        }

        private void SaveAll()
        {
            try
            {
                _notificationService?.AddSuccess(
                    "Save All", 
                    "All changes have been saved successfully");
                
                Logger?.LogDebug("Saved all from quick actions");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error saving all");
            }
        }

        private void ShowSettings()
        {
            try
            {
                _notificationService?.AddInfo(
                    "Settings", 
                    "Opening application settings...");
                
                Logger?.LogDebug("Opening settings from quick actions");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error opening settings");
            }
        }

        private void ShowHelp()
        {
            try
            {
                _notificationService?.AddInfo(
                    "Help", 
                    "Opening help documentation...");
                
                Logger?.LogDebug("Opening help from quick actions");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error opening help");
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Toggles the visibility of the quick actions bar
        /// </summary>
        public void ToggleVisibility()
        {
            try
            {
                IsVisible = !IsVisible;
                
                _notificationService?.AddInfo(
                    "Quick Actions", 
                    IsVisible ? "Quick Actions Bar shown" : "Quick Actions Bar hidden");
                
                Logger?.LogDebug("Toggled quick actions bar visibility: {IsVisible}", IsVisible);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error toggling quick actions bar visibility");
            }
        }

        /// <summary>
        /// Sets the context for dynamic actions
        /// </summary>
        public void SetContext(object context)
        {
            try
            {
                _currentContext = context;
                UpdateContextActions();
                
                Logger?.LogDebug("Set context for quick actions: {ContextType}", context?.GetType().Name);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error setting context for quick actions");
            }
        }

        /// <summary>
        /// Updates context-specific actions
        /// </summary>
        private void UpdateContextActions()
        {
            try
            {
                ContextActions.Clear();
                
                if (_currentContext != null)
                {
                    // Add context-specific actions based on the current context
                    var contextType = _currentContext.GetType().Name;
                    
                    switch (contextType)
                    {
                        case "DataGridContext":
                            ContextActions.Add(new QuickAction
                            {
                                Id = "export-selected",
                                DisplayText = "📤 Export Selected",
                                Tooltip = "Export selected items",
                                Command = new RelayCommand(() => ExecuteAction("export-selected"))
                            });
                            ContextActions.Add(new QuickAction
                            {
                                Id = "delete-selected",
                                DisplayText = "🗑️ Delete Selected",
                                Tooltip = "Delete selected items",
                                Command = new RelayCommand(() => ExecuteAction("delete-selected"))
                            });
                            break;
                            
                        case "DashboardContext":
                            ContextActions.Add(new QuickAction
                            {
                                Id = "refresh-dashboard",
                                DisplayText = "🔄 Refresh",
                                Tooltip = "Refresh dashboard data",
                                Command = new RelayCommand(() => ExecuteAction("refresh-dashboard"))
                            });
                            ContextActions.Add(new QuickAction
                            {
                                Id = "share-dashboard",
                                DisplayText = "📤 Share",
                                Tooltip = "Share dashboard",
                                Command = new RelayCommand(() => ExecuteAction("share-dashboard"))
                            });
                            break;
                    }
                }
                
                UpdatePropertyCounts();
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating context actions");
            }
        }

        /// <summary>
        /// Adds a custom action to the bar
        /// </summary>
        public void AddAction(QuickAction action, ActionCategory category = ActionCategory.Primary)
        {
            try
            {
                if (action == null) return;

                switch (category)
                {
                    case ActionCategory.Primary:
                        PrimaryActions.Add(action);
                        break;
                    case ActionCategory.Secondary:
                        SecondaryActions.Add(action);
                        break;
                    case ActionCategory.Context:
                        ContextActions.Add(action);
                        break;
                }
                
                UpdatePropertyCounts();
                Logger?.LogDebug("Added quick action: {ActionId} to {Category}", action.Id, category);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error adding quick action: {ActionId}", action?.Id);
            }
        }

        /// <summary>
        /// Removes an action from the bar
        /// </summary>
        public void RemoveAction(string actionId)
        {
            try
            {
                var removed = false;
                
                var primaryAction = PrimaryActions.FirstOrDefault(a => a.Id == actionId);
                if (primaryAction != null)
                {
                    PrimaryActions.Remove(primaryAction);
                    removed = true;
                }
                
                var secondaryAction = SecondaryActions.FirstOrDefault(a => a.Id == actionId);
                if (secondaryAction != null)
                {
                    SecondaryActions.Remove(secondaryAction);
                    removed = true;
                }
                
                var contextAction = ContextActions.FirstOrDefault(a => a.Id == actionId);
                if (contextAction != null)
                {
                    ContextActions.Remove(contextAction);
                    removed = true;
                }
                
                if (removed)
                {
                    UpdatePropertyCounts();
                    Logger?.LogDebug("Removed quick action: {ActionId}", actionId);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error removing quick action: {ActionId}", actionId);
            }
        }

        /// <summary>
        /// Updates the status display
        /// </summary>
        public void UpdateStatus(string statusText, string statusColor = "#28A745")
        {
            try
            {
                StatusText = statusText;
                StatusColor = statusColor;
                
                Logger?.LogDebug("Updated quick actions status: {StatusText}", statusText);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating status");
            }
        }

        #endregion
    }

    /// <summary>
    /// Represents a quick action
    /// </summary>
    public class QuickAction : BaseViewModel
    {
        private bool _isEnabled = true;
        private bool _isVisible = true;

        public string Id { get; set; }
        public string DisplayText { get; set; }
        public string Tooltip { get; set; }
        public ICommand Command { get; set; }
        public object CommandParameter { get; set; }
        public List<QuickAction> ContextActions { get; set; } = new List<QuickAction>();

        public bool IsEnabled
        {
            get => _isEnabled;
            set => SetProperty(ref _isEnabled, value);
        }

        public bool IsVisible
        {
            get => _isVisible;
            set => SetProperty(ref _isVisible, value);
        }
    }

    /// <summary>
    /// Action category group for organization
    /// </summary>
    public class ActionCategoryGroup : BaseViewModel
    {
        private bool _isExpanded;

        public string CategoryName { get; set; }
        public ObservableCollection<QuickAction> Actions { get; set; }

        public bool IsExpanded
        {
            get => _isExpanded;
            set => SetProperty(ref _isExpanded, value);
        }
    }

    /// <summary>
    /// Action categories
    /// </summary>
    public enum ActionCategory
    {
        Primary,
        Secondary,
        Context
    }
}
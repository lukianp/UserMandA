using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Messages;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for breadcrumb navigation control
    /// </summary>
    public partial class BreadcrumbNavigationViewModel : BaseViewModel,
        IRecipient<NavigationMessage>
    {
        #region Private Fields

        private const int MaxVisibleBreadcrumbs = 4;
        private readonly ObservableCollection<BreadcrumbItem> _allBreadcrumbs;
        private ObservableCollection<BreadcrumbItem> _visibleBreadcrumbs;
        private ObservableCollection<BreadcrumbItem> _overflowItems;
        private bool _showOverflow;
        private bool _hasBreadcrumbs;

        #endregion

        #region Properties

        public ObservableCollection<BreadcrumbItem> VisibleBreadcrumbs
        {
            get => _visibleBreadcrumbs;
            set => SetProperty(ref _visibleBreadcrumbs, value);
        }

        public ObservableCollection<BreadcrumbItem> OverflowItems
        {
            get => _overflowItems;
            set => SetProperty(ref _overflowItems, value);
        }

        public bool ShowOverflow
        {
            get => _showOverflow;
            set => SetProperty(ref _showOverflow, value);
        }

        public bool HasBreadcrumbs
        {
            get => _hasBreadcrumbs;
            set => SetProperty(ref _hasBreadcrumbs, value);
        }

        #endregion

        #region Commands

        public ICommand NavigateHomeCommand { get; }
        public ICommand NavigateCommand { get; }
        public ICommand ClearBreadcrumbsCommand { get; }

        #endregion

        #region Constructor

        public BreadcrumbNavigationViewModel() : base()
        {
            _allBreadcrumbs = new ObservableCollection<BreadcrumbItem>();
            _visibleBreadcrumbs = new ObservableCollection<BreadcrumbItem>();
            _overflowItems = new ObservableCollection<BreadcrumbItem>();

            // Register for navigation messages
            Messenger.Register<NavigationMessage>(this);

            // Initialize commands
            NavigateHomeCommand = new RelayCommand(NavigateHome);
            NavigateCommand = new RelayCommand<BreadcrumbItem>(NavigateTo);
            ClearBreadcrumbsCommand = new RelayCommand(ClearBreadcrumbs);

            // Initialize with home
            InitializeBreadcrumbs();
        }

        #endregion

        #region Message Handlers

        public void Receive(NavigationMessage message)
        {
            try
            {
                UpdateBreadcrumbs(message.ViewName, message.Parameters);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating breadcrumbs for navigation: {ViewName}", message.ViewName);
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Adds a new breadcrumb item
        /// </summary>
        public void AddBreadcrumb(string displayName, string viewName, object parameters = null, string toolTip = null)
        {
            try
            {
                // Remove any existing breadcrumb with the same view name
                var existing = _allBreadcrumbs.FirstOrDefault(b => b.ViewName == viewName);
                if (existing != null)
                {
                    var index = _allBreadcrumbs.IndexOf(existing);
                    // Remove this breadcrumb and all subsequent ones
                    for (int i = _allBreadcrumbs.Count - 1; i >= index; i--)
                    {
                        _allBreadcrumbs.RemoveAt(i);
                    }
                }

                var breadcrumb = new BreadcrumbItem
                {
                    DisplayName = displayName,
                    ViewName = viewName,
                    Parameters = parameters,
                    ToolTip = toolTip ?? displayName,
                    NavigateCommand = NavigateCommand,
                    IsNavigable = true
                };

                _allBreadcrumbs.Add(breadcrumb);
                UpdateVisibleItems();
                
                Logger?.LogDebug("Added breadcrumb: {DisplayName} -> {ViewName}", displayName, viewName);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error adding breadcrumb: {DisplayName}", displayName);
            }
        }

        /// <summary>
        /// Removes breadcrumbs back to the specified view
        /// </summary>
        public void NavigateBackTo(string viewName)
        {
            try
            {
                var targetIndex = _allBreadcrumbs.ToList().FindIndex(b => b.ViewName == viewName);
                if (targetIndex >= 0)
                {
                    // Remove all breadcrumbs after the target
                    for (int i = _allBreadcrumbs.Count - 1; i > targetIndex; i--)
                    {
                        _allBreadcrumbs.RemoveAt(i);
                    }
                    UpdateVisibleItems();
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error navigating back to: {ViewName}", viewName);
            }
        }

        #endregion

        #region Private Methods

        private void InitializeBreadcrumbs()
        {
            // Start with Dashboard as the root
            AddBreadcrumb("Dashboard", "Dashboard", null, "Return to main dashboard");
        }

        private void UpdateBreadcrumbs(string viewName, object parameters)
        {
            var displayName = GetDisplayNameForView(viewName);
            var toolTip = GetToolTipForView(viewName, parameters);
            
            AddBreadcrumb(displayName, viewName, parameters, toolTip);
        }

        private string GetDisplayNameForView(string viewName)
        {
            return viewName switch
            {
                "Dashboard" => "Dashboard",
                "Discovery" => "Discovery",
                "Users" => "Users",
                "Computers" => "Infrastructure",
                "Groups" => "Groups",
                "Reports" => "Reports",
                "Settings" => "Settings",
                "ProjectManagement" => "Project Management",
                "UserDetail" => "User Details",
                "ComputerDetail" => "Infrastructure Details",
                "GroupDetail" => "Group Details",
                "DiscoveryModule" => "Module Configuration",
                "Export" => "Data Export",
                "Import" => "Data Import",
                _ => viewName
            };
        }

        private string GetToolTipForView(string viewName, object parameters)
        {
            var baseTooltip = viewName switch
            {
                "Dashboard" => "Main application dashboard",
                "Discovery" => "Configure and run discovery modules",
                "Users" => "View and manage discovered users",
                "Computers" => "View and manage discovered infrastructure",
                "Groups" => "View and manage discovered groups",
                "Reports" => "Generate and view reports",
                "Settings" => "Application settings and configuration",
                "ProjectManagement" => "M&A project management dashboard",
                "UserDetail" => "Detailed user information and attributes",
                "ComputerDetail" => "Detailed infrastructure information",
                "GroupDetail" => "Detailed group information and members",
                "DiscoveryModule" => "Configure discovery module settings",
                "Export" => "Export data to various formats",
                "Import" => "Import data from external sources",
                _ => $"Navigate to {viewName}"
            };

            // Add parameter information if available
            if (parameters != null)
            {
                baseTooltip += $" ({parameters})";
            }

            return baseTooltip;
        }

        private void UpdateVisibleItems()
        {
            try
            {
                HasBreadcrumbs = _allBreadcrumbs.Count > 0;

                if (_allBreadcrumbs.Count <= MaxVisibleBreadcrumbs)
                {
                    // Show all breadcrumbs
                    ShowOverflow = false;
                    VisibleBreadcrumbs.Clear();
                    OverflowItems.Clear();

                    foreach (var item in _allBreadcrumbs)
                    {
                        item.ShowSeparator = item != _allBreadcrumbs.Last();
                        item.IsNavigable = item != _allBreadcrumbs.Last(); // Last item is current, not navigable
                        VisibleBreadcrumbs.Add(item);
                    }
                }
                else
                {
                    // Show overflow menu
                    ShowOverflow = true;
                    VisibleBreadcrumbs.Clear();
                    OverflowItems.Clear();

                    // Add overflow items (all except first and last few)
                    var overflowCount = _allBreadcrumbs.Count - MaxVisibleBreadcrumbs + 1;
                    for (int i = 1; i < 1 + overflowCount; i++)
                    {
                        var item = _allBreadcrumbs[i];
                        item.IsNavigable = true;
                        OverflowItems.Add(item);
                    }

                    // Add visible items (first + last few)
                    var firstItem = _allBreadcrumbs[0];
                    firstItem.ShowSeparator = true;
                    firstItem.IsNavigable = true;
                    VisibleBreadcrumbs.Add(firstItem);

                    var startIndex = 1 + overflowCount;
                    for (int i = startIndex; i < _allBreadcrumbs.Count; i++)
                    {
                        var item = _allBreadcrumbs[i];
                        item.ShowSeparator = i != _allBreadcrumbs.Count - 1;
                        item.IsNavigable = i != _allBreadcrumbs.Count - 1;
                        VisibleBreadcrumbs.Add(item);
                    }
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error updating visible breadcrumb items");
            }
        }

        private void NavigateHome()
        {
            try
            {
                ClearBreadcrumbs();
                Messenger.Send(new NavigationMessage("Dashboard", null));
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error navigating home");
            }
        }

        private void NavigateTo(BreadcrumbItem item)
        {
            if (item == null || !item.IsNavigable) return;

            try
            {
                NavigateBackTo(item.ViewName);
                Messenger.Send(new NavigationMessage(item.ViewName, item.Parameters));
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error navigating to breadcrumb: {ViewName}", item.ViewName);
            }
        }

        private void ClearBreadcrumbs()
        {
            _allBreadcrumbs.Clear();
            UpdateVisibleItems();
        }

        #endregion

        #region Dispose

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                Messenger.Unregister<NavigationMessage>(this);
            }
            base.Dispose(disposing);
        }

        #endregion
    }

    /// <summary>
    /// Represents a single breadcrumb item
    /// </summary>
    public class BreadcrumbItem
    {
        public string DisplayName { get; set; }
        public string ViewName { get; set; }
        public object Parameters { get; set; }
        public string ToolTip { get; set; }
        public ICommand NavigateCommand { get; set; }
        public bool IsNavigable { get; set; }
        public bool ShowSeparator { get; set; }
    }
}
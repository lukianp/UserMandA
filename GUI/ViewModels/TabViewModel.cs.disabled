using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the tab view control
    /// </summary>
    public partial class TabViewModel : BaseViewModel
    {
        private readonly NotificationService _notificationService;
        private ObservableCollection<TabItemViewModel> _tabs;
        private TabItemViewModel _selectedTab;
        private string _statusText = "";

        public TabViewModel() : base()
        {
            _notificationService = ServiceLocator.GetService<NotificationService>();
            _tabs = new ObservableCollection<TabItemViewModel>();
            
            InitializeCommands();
            CreateWelcomeTab();
        }

        #region Properties

        public ObservableCollection<TabItemViewModel> Tabs
        {
            get => _tabs;
            set => SetProperty(ref _tabs, value);
        }

        public TabItemViewModel SelectedTab
        {
            get => _selectedTab;
            set
            {
                if (SetProperty(ref _selectedTab, value))
                {
                    UpdateStatusText();
                }
            }
        }

        public string StatusText
        {
            get => _statusText;
            set => SetProperty(ref _statusText, value);
        }

        public int TabCount => Tabs.Count;

        public bool HasTabs => TabCount > 0;

        public bool CanCloseAllTabs => TabCount > 1; // Keep at least one tab

        #endregion

        #region Commands

        public ICommand NewTabCommand { get; private set; }
        public ICommand CloseTabCommand { get; private set; }
        public ICommand CloseAllTabsCommand { get; private set; }
        public ICommand ShowAllTabsCommand { get; private set; }
        public ICommand DuplicateTabCommand { get; private set; }

        #endregion

        #region Private Methods

        protected override void InitializeCommands()
        {
            NewTabCommand = new RelayCommand(CreateNewTab);
            CloseTabCommand = new RelayCommand<TabItemViewModel>(CloseTab);
            CloseAllTabsCommand = new RelayCommand(CloseAllTabs);
            ShowAllTabsCommand = new RelayCommand(ShowAllTabs);
            DuplicateTabCommand = new RelayCommand<TabItemViewModel>(DuplicateTab);
        }

        private void CreateWelcomeTab()
        {
            var welcomeTab = new TabItemViewModel
            {
                Id = Guid.NewGuid(),
                Title = "Welcome",
                Icon = "🏠",
                TabType = TabType.Welcome,
                Content = CreateWelcomeContent(),
                CanClose = false
            };

            Tabs.Add(welcomeTab);
            SelectedTab = welcomeTab;
            UpdateCounts();
        }

        private object CreateWelcomeContent()
        {
            // Return a simple welcome message for now
            // In a real implementation, this would be a proper UserControl
            return "Welcome to M&A Discovery Suite! Use the tabs to organize your work.";
        }

        private void CreateNewTab()
        {
            try
            {
                var newTab = new TabItemViewModel
                {
                    Id = Guid.NewGuid(),
                    Title = $"New Tab {TabCount}",
                    Icon = "📄",
                    TabType = TabType.Document,
                    Content = CreateNewTabContent(),
                    CanClose = true
                };

                Tabs.Add(newTab);
                SelectedTab = newTab;
                UpdateCounts();

                _notificationService?.AddInfo(
                    "New Tab Created", 
                    $"Created new tab: {newTab.Title}");

                Logger?.LogDebug("Created new tab: {TabTitle}", newTab.Title);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error creating new tab");
                _notificationService?.AddError(
                    "Tab Creation Failed", 
                    "Unable to create new tab.");
            }
        }

        private object CreateNewTabContent()
        {
            // Return placeholder content for new tabs
            return "New tab content - ready for your work!";
        }

        private void CloseTab(TabItemViewModel tab)
        {
            try
            {
                if (tab == null || !tab.CanClose) return;

                // Check for unsaved changes
                if (tab.HasChanges)
                {
                    var result = System.Windows.MessageBox.Show(
                        $"Tab '{tab.Title}' has unsaved changes.\n\nDo you want to close it anyway?",
                        "Unsaved Changes",
                        System.Windows.MessageBoxButton.YesNo,
                        System.Windows.MessageBoxImage.Warning);

                    if (result != System.Windows.MessageBoxResult.Yes)
                        return;
                }

                // Select adjacent tab if current tab is being closed
                if (tab == SelectedTab)
                {
                    var index = Tabs.IndexOf(tab);
                    if (index > 0)
                        SelectedTab = Tabs[index - 1];
                    else if (Tabs.Count > 1)
                        SelectedTab = Tabs[index + 1];
                }

                Tabs.Remove(tab);
                UpdateCounts();

                // Ensure at least one tab remains
                if (Tabs.Count == 0)
                {
                    CreateWelcomeTab();
                }

                Logger?.LogDebug("Closed tab: {TabTitle}", tab.Title);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error closing tab: {TabTitle}", tab?.Title);
                _notificationService?.AddError(
                    "Tab Close Failed", 
                    "Unable to close the tab.");
            }
        }

        private void CloseAllTabs()
        {
            try
            {
                var tabsWithChanges = Tabs.Where(t => t.HasChanges && t.CanClose).ToList();
                
                if (tabsWithChanges.Any())
                {
                    var result = System.Windows.MessageBox.Show(
                        $"{tabsWithChanges.Count} tabs have unsaved changes.\n\nDo you want to close all tabs anyway?",
                        "Unsaved Changes",
                        System.Windows.MessageBoxButton.YesNo,
                        System.Windows.MessageBoxImage.Warning);

                    if (result != System.Windows.MessageBoxResult.Yes)
                        return;
                }

                // Keep only non-closable tabs (like Welcome)
                var tabsToRemove = Tabs.Where(t => t.CanClose).ToList();
                foreach (var tab in tabsToRemove)
                {
                    Tabs.Remove(tab);
                }

                UpdateCounts();

                // Ensure at least one tab remains
                if (Tabs.Count == 0)
                {
                    CreateWelcomeTab();
                }
                else
                {
                    SelectedTab = Tabs.First();
                }

                _notificationService?.AddInfo(
                    "Tabs Closed", 
                    $"Closed {tabsToRemove.Count} tabs");

                Logger?.LogDebug("Closed {Count} tabs", tabsToRemove.Count);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error closing all tabs");
                _notificationService?.AddError(
                    "Close All Failed", 
                    "Unable to close all tabs.");
            }
        }

        private void ShowAllTabs()
        {
            try
            {
                // This could open a tab overview/switcher dialog
                var tabList = string.Join(", ", Tabs.Select(t => t.Title));
                
                _notificationService?.AddInfo(
                    "Open Tabs", 
                    $"Currently open: {tabList}");

                Logger?.LogDebug("Showed all tabs list");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing all tabs");
            }
        }

        private void DuplicateTab(TabItemViewModel tab)
        {
            try
            {
                if (tab == null) return;

                var duplicateTab = new TabItemViewModel
                {
                    Id = Guid.NewGuid(),
                    Title = $"{tab.Title} (Copy)",
                    Icon = tab.Icon,
                    TabType = tab.TabType,
                    Content = tab.Content, // In real implementation, would clone content
                    CanClose = true
                };

                var index = Tabs.IndexOf(tab);
                Tabs.Insert(index + 1, duplicateTab);
                SelectedTab = duplicateTab;
                UpdateCounts();

                Logger?.LogDebug("Duplicated tab: {TabTitle}", tab.Title);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error duplicating tab: {TabTitle}", tab?.Title);
                _notificationService?.AddError(
                    "Tab Duplication Failed", 
                    "Unable to duplicate the tab.");
            }
        }

        private void UpdateCounts()
        {
            OnPropertyChanged(nameof(TabCount));
            OnPropertyChanged(nameof(HasTabs));
            OnPropertyChanged(nameof(CanCloseAllTabs));
        }

        private void UpdateStatusText()
        {
            if (SelectedTab != null)
            {
                StatusText = $"Active: {SelectedTab.Title}";
                if (SelectedTab.HasChanges)
                    StatusText += " (modified)";
            }
            else
            {
                StatusText = "No tab selected";
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Opens a new tab with specific content
        /// </summary>
        public TabItemViewModel OpenTab(string title, string icon, TabType tabType, object content)
        {
            try
            {
                var newTab = new TabItemViewModel
                {
                    Id = Guid.NewGuid(),
                    Title = title,
                    Icon = icon,
                    TabType = tabType,
                    Content = content,
                    CanClose = true
                };

                Tabs.Add(newTab);
                SelectedTab = newTab;
                UpdateCounts();

                Logger?.LogDebug("Opened tab: {TabTitle}", title);
                return newTab;
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error opening tab: {TabTitle}", title);
                _notificationService?.AddError(
                    "Tab Open Failed", 
                    "Unable to open the requested tab.");
                return null;
            }
        }

        /// <summary>
        /// Finds a tab by ID
        /// </summary>
        public TabItemViewModel FindTab(Guid tabId)
        {
            return Tabs.FirstOrDefault(t => t.Id == tabId);
        }

        /// <summary>
        /// Closes a tab by ID
        /// </summary>
        public void CloseTab(Guid tabId)
        {
            var tab = FindTab(tabId);
            if (tab != null)
            {
                CloseTab(tab);
            }
        }

        #endregion
    }

    /// <summary>
    /// ViewModel for individual tab items
    /// </summary>
    public class TabItemViewModel : BaseViewModel
    {
        private string _title = "";
        private string _icon = "";
        private bool _hasChanges;
        private object _content;

        public Guid Id { get; set; }

        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public string Icon
        {
            get => _icon;
            set => SetProperty(ref _icon, value);
        }

        public bool HasChanges
        {
            get => _hasChanges;
            set => SetProperty(ref _hasChanges, value);
        }

        public object Content
        {
            get => _content;
            set => SetProperty(ref _content, value);
        }

        public TabType TabType { get; set; }
        public new bool CanClose { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime LastAccessed { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Types of tabs
    /// </summary>
    public enum TabType
    {
        Welcome,
        Document,
        Discovery,
        Dashboard,
        Settings,
        Report,
        Graph,
        Export
    }
}
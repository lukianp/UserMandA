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
    /// ViewModel for the split view control
    /// </summary>
    public partial class SplitViewViewModel : BaseViewModel
    {
        private readonly NotificationService _notificationService;
        private SplitLayout _currentLayout = SplitLayout.Single;
        private ObservableCollection<SplitPane> _panes;

        // Individual panes
        private SplitPane _singlePane;
        private SplitPane _topPane;
        private SplitPane _bottomPane;
        private SplitPane _leftPane;
        private SplitPane _rightPane;
        private SplitPane _topLeftPane;
        private SplitPane _topRightPane;
        private SplitPane _bottomLeftPane;
        private SplitPane _bottomRightPane;

        public SplitViewViewModel() : base()
        {
            _notificationService = ServiceLocator.GetService<NotificationService>();
            _panes = new ObservableCollection<SplitPane>();
            
            InitializeCommands();
            InitializePanes();
        }

        #region Properties

        public SplitLayout CurrentLayout
        {
            get => _currentLayout;
            set
            {
                if (SetProperty(ref _currentLayout, value))
                {
                    UpdateLayoutProperties();
                }
            }
        }

        public ObservableCollection<SplitPane> Panes
        {
            get => _panes;
            set => SetProperty(ref _panes, value);
        }

        public int PaneCount => Panes.Count(p => p.IsVisible);

        // Layout properties
        public bool IsSingleLayout => CurrentLayout == SplitLayout.Single;
        public bool IsHorizontalLayout => CurrentLayout == SplitLayout.Horizontal;
        public bool IsVerticalLayout => CurrentLayout == SplitLayout.Vertical;
        public bool IsQuadLayout => CurrentLayout == SplitLayout.Quad;

        // Individual panes
        public SplitPane SinglePane
        {
            get => _singlePane;
            set => SetProperty(ref _singlePane, value);
        }

        public SplitPane TopPane
        {
            get => _topPane;
            set => SetProperty(ref _topPane, value);
        }

        public SplitPane BottomPane
        {
            get => _bottomPane;
            set => SetProperty(ref _bottomPane, value);
        }

        public SplitPane LeftPane
        {
            get => _leftPane;
            set => SetProperty(ref _leftPane, value);
        }

        public SplitPane RightPane
        {
            get => _rightPane;
            set => SetProperty(ref _rightPane, value);
        }

        public SplitPane TopLeftPane
        {
            get => _topLeftPane;
            set => SetProperty(ref _topLeftPane, value);
        }

        public SplitPane TopRightPane
        {
            get => _topRightPane;
            set => SetProperty(ref _topRightPane, value);
        }

        public SplitPane BottomLeftPane
        {
            get => _bottomLeftPane;
            set => SetProperty(ref _bottomLeftPane, value);
        }

        public SplitPane BottomRightPane
        {
            get => _bottomRightPane;
            set => SetProperty(ref _bottomRightPane, value);
        }

        #endregion

        #region Commands

        public ICommand SetLayoutCommand { get; private set; }
        public ICommand AddPaneCommand { get; private set; }
        public ICommand ClosePaneCommand { get; private set; }
        public ICommand SyncPanesCommand { get; private set; }
        public ICommand ShowOptionsCommand { get; private set; }

        #endregion

        #region Private Methods

        private void InitializeCommands()
        {
            SetLayoutCommand = new RelayCommand<string>(SetLayout);
            AddPaneCommand = new RelayCommand(AddPane);
            ClosePaneCommand = new RelayCommand<string>(ClosePane);
            SyncPanesCommand = new RelayCommand(SyncPanes);
            ShowOptionsCommand = new RelayCommand(ShowOptions);
        }

        private void InitializePanes()
        {
            // Create default panes
            SinglePane = new SplitPane
            {
                Id = "Single",
                Title = "Main View",
                Position = SplitPosition.Single,
                Content = CreateDefaultContent("Main content area"),
                IsVisible = true
            };

            TopPane = new SplitPane
            {
                Id = "Top",
                Title = "Top Pane",
                Position = SplitPosition.Top,
                Content = CreateDefaultContent("Top pane content"),
                IsVisible = false
            };

            BottomPane = new SplitPane
            {
                Id = "Bottom",
                Title = "Bottom Pane",
                Position = SplitPosition.Bottom,
                Content = CreateDefaultContent("Bottom pane content"),
                IsVisible = false
            };

            LeftPane = new SplitPane
            {
                Id = "Left",
                Title = "Left Pane",
                Position = SplitPosition.Left,
                Content = CreateDefaultContent("Left pane content"),
                IsVisible = false
            };

            RightPane = new SplitPane
            {
                Id = "Right",
                Title = "Right Pane",
                Position = SplitPosition.Right,
                Content = CreateDefaultContent("Right pane content"),
                IsVisible = false
            };

            TopLeftPane = new SplitPane
            {
                Id = "TopLeft",
                Title = "Top-Left",
                Position = SplitPosition.TopLeft,
                Content = CreateDefaultContent("Top-left quadrant"),
                IsVisible = false
            };

            TopRightPane = new SplitPane
            {
                Id = "TopRight",
                Title = "Top-Right",
                Position = SplitPosition.TopRight,
                Content = CreateDefaultContent("Top-right quadrant"),
                IsVisible = false
            };

            BottomLeftPane = new SplitPane
            {
                Id = "BottomLeft",
                Title = "Bottom-Left",
                Position = SplitPosition.BottomLeft,
                Content = CreateDefaultContent("Bottom-left quadrant"),
                IsVisible = false
            };

            BottomRightPane = new SplitPane
            {
                Id = "BottomRight",
                Title = "Bottom-Right",
                Position = SplitPosition.BottomRight,
                Content = CreateDefaultContent("Bottom-right quadrant"),
                IsVisible = false
            };

            // Add panes to collection
            Panes.Add(SinglePane);
            Panes.Add(TopPane);
            Panes.Add(BottomPane);
            Panes.Add(LeftPane);
            Panes.Add(RightPane);
            Panes.Add(TopLeftPane);
            Panes.Add(TopRightPane);
            Panes.Add(BottomLeftPane);
            Panes.Add(BottomRightPane);
        }

        private object CreateDefaultContent(string text)
        {
            return new System.Windows.Controls.StackPanel
            {
                Children =
                {
                    new System.Windows.Controls.TextBlock 
                    { 
                        Text = text, 
                        HorizontalAlignment = System.Windows.HorizontalAlignment.Center,
                        VerticalAlignment = System.Windows.VerticalAlignment.Center,
                        FontSize = 14,
                        Margin = new System.Windows.Thickness(0, 20, 0, 0)
                    },
                    new System.Windows.Controls.TextBlock 
                    { 
                        Text = "Content will be displayed here", 
                        HorizontalAlignment = System.Windows.HorizontalAlignment.Center,
                        VerticalAlignment = System.Windows.VerticalAlignment.Center,
                        FontSize = 12,
                        Opacity = 0.7,
                        Margin = new System.Windows.Thickness(0, 8, 0, 0)
                    }
                }
            };
        }

        private void SetLayout(string layoutName)
        {
            try
            {
                if (!Enum.TryParse<SplitLayout>(layoutName, out var newLayout))
                    return;

                var previousLayout = CurrentLayout;
                CurrentLayout = newLayout;

                // Update pane visibility based on layout
                UpdatePaneVisibility();

                _notificationService?.AddInfo(
                    "Layout Changed", 
                    $"Switched from {previousLayout} to {newLayout} layout");

                Logger?.LogDebug("Changed split view layout from {Previous} to {New}", previousLayout, newLayout);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error setting split view layout: {LayoutName}", layoutName);
                _notificationService?.AddError(
                    "Layout Error", 
                    "Unable to change the split view layout.");
            }
        }

        private void UpdatePaneVisibility()
        {
            // Reset all visibility
            foreach (var pane in Panes)
            {
                pane.IsVisible = false;
            }

            // Set visibility based on current layout
            switch (CurrentLayout)
            {
                case SplitLayout.Single:
                    SinglePane.IsVisible = true;
                    break;

                case SplitLayout.Horizontal:
                    TopPane.IsVisible = true;
                    BottomPane.IsVisible = true;
                    break;

                case SplitLayout.Vertical:
                    LeftPane.IsVisible = true;
                    RightPane.IsVisible = true;
                    break;

                case SplitLayout.Quad:
                    TopLeftPane.IsVisible = true;
                    TopRightPane.IsVisible = true;
                    BottomLeftPane.IsVisible = true;
                    BottomRightPane.IsVisible = true;
                    break;
            }

            OnPropertyChanged(nameof(PaneCount));
        }

        private void AddPane()
        {
            try
            {
                // Cycle to next layout when adding a pane
                var nextLayout = CurrentLayout switch
                {
                    SplitLayout.Single => SplitLayout.Horizontal,
                    SplitLayout.Horizontal => SplitLayout.Vertical,
                    SplitLayout.Vertical => SplitLayout.Quad,
                    SplitLayout.Quad => SplitLayout.Single,
                    _ => SplitLayout.Single
                };

                SetLayout(nextLayout.ToString());

                Logger?.LogDebug("Added pane by cycling to {Layout} layout", nextLayout);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error adding pane");
                _notificationService?.AddError(
                    "Add Pane Error", 
                    "Unable to add a new pane.");
            }
        }

        private void ClosePane(string paneId)
        {
            try
            {
                var pane = Panes.FirstOrDefault(p => p.Id == paneId);
                if (pane == null) return;

                pane.IsVisible = false;

                // If closing a pane results in only one visible pane, switch to single layout
                var visiblePanes = Panes.Count(p => p.IsVisible);
                if (visiblePanes <= 1)
                {
                    SetLayout("Single");
                }

                _notificationService?.AddInfo(
                    "Pane Closed", 
                    $"{pane.Title} has been closed");

                Logger?.LogDebug("Closed pane: {PaneTitle}", pane.Title);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error closing pane: {PaneId}", paneId);
                _notificationService?.AddError(
                    "Close Pane Error", 
                    "Unable to close the pane.");
            }
        }

        private void SyncPanes()
        {
            try
            {
                // Synchronize content across visible panes (useful for comparing views)
                var visiblePanes = Panes.Where(p => p.IsVisible).ToList();
                
                if (visiblePanes.Count <= 1) return;

                // For demonstration, we'll just show a notification
                _notificationService?.AddInfo(
                    "Panes Synchronized", 
                    $"Synchronized {visiblePanes.Count} visible panes");

                Logger?.LogDebug("Synchronized {Count} visible panes", visiblePanes.Count);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error synchronizing panes");
                _notificationService?.AddError(
                    "Sync Error", 
                    "Unable to synchronize panes.");
            }
        }

        private void ShowOptions()
        {
            try
            {
                var layoutInfo = $"Current Layout: {CurrentLayout}\n" +
                               $"Visible Panes: {PaneCount}\n" +
                               $"Available Layouts: Single, Horizontal, Vertical, Quad";

                _notificationService?.AddInfo(
                    "Split View Options", 
                    layoutInfo);

                Logger?.LogDebug("Showed split view options");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing split view options");
            }
        }

        private void UpdateLayoutProperties()
        {
            OnPropertyChanged(nameof(IsSingleLayout));
            OnPropertyChanged(nameof(IsHorizontalLayout));
            OnPropertyChanged(nameof(IsVerticalLayout));
            OnPropertyChanged(nameof(IsQuadLayout));
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Sets content for a specific pane
        /// </summary>
        public void SetPaneContent(string paneId, object content, string title = null)
        {
            try
            {
                var pane = Panes.FirstOrDefault(p => p.Id == paneId);
                if (pane != null)
                {
                    pane.Content = content;
                    if (!string.IsNullOrEmpty(title))
                    {
                        pane.Title = title;
                    }

                    Logger?.LogDebug("Set content for pane: {PaneId}", paneId);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error setting pane content: {PaneId}", paneId);
            }
        }

        /// <summary>
        /// Gets a pane by ID
        /// </summary>
        public SplitPane GetPane(string paneId)
        {
            return Panes.FirstOrDefault(p => p.Id == paneId);
        }

        /// <summary>
        /// Gets all visible panes
        /// </summary>
        public SplitPane[] GetVisiblePanes()
        {
            return Panes.Where(p => p.IsVisible).ToArray();
        }

        #endregion
    }

    /// <summary>
    /// Represents a single pane in the split view
    /// </summary>
    public class SplitPane : BaseViewModel
    {
        private string _title = "";
        private bool _isVisible;
        private object _content;

        public string Id { get; set; }

        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public bool IsVisible
        {
            get => _isVisible;
            set => SetProperty(ref _isVisible, value);
        }

        public object Content
        {
            get => _content;
            set => SetProperty(ref _content, value);
        }

        public SplitPosition Position { get; set; }
        public DateTime LastAccessed { get; set; } = DateTime.Now;
    }

    /// <summary>
    /// Split view layouts
    /// </summary>
    public enum SplitLayout
    {
        Single,
        Horizontal,
        Vertical,
        Quad
    }

    /// <summary>
    /// Split pane positions
    /// </summary>
    public enum SplitPosition
    {
        Single,
        Top,
        Bottom,
        Left,
        Right,
        TopLeft,
        TopRight,
        BottomLeft,
        BottomRight
    }
}
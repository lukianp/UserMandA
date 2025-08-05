using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the docking panel system
    /// </summary>
    public partial class DockingPanelViewModel : BaseViewModel
    {
        private readonly NotificationService _notificationService;
        private readonly Dictionary<string, DockablePanel> _panels;
        private readonly Dictionary<string, Window> _floatingWindows;
        
        private object _mainContent;
        private object _leftPanelContent;
        private object _rightPanelContent;
        private object _bottomPanelContent;

        public DockingPanelViewModel() : base()
        {
            _notificationService = ServiceLocator.GetService<NotificationService>();
            _panels = new Dictionary<string, DockablePanel>();
            _floatingWindows = new Dictionary<string, Window>();
            
            InitializeCommands();
            InitializePanels();
        }

        #region Properties

        public object MainContent
        {
            get => _mainContent;
            set => SetProperty(ref _mainContent, value);
        }

        public object LeftPanelContent
        {
            get => _leftPanelContent;
            set => SetProperty(ref _leftPanelContent, value);
        }

        public object RightPanelContent
        {
            get => _rightPanelContent;
            set => SetProperty(ref _rightPanelContent, value);
        }

        public object BottomPanelContent
        {
            get => _bottomPanelContent;
            set => SetProperty(ref _bottomPanelContent, value);
        }

        public ObservableCollection<DockablePanel> AvailablePanels { get; private set; }

        #endregion

        #region Commands

        public ICommand TogglePinCommand { get; private set; }
        public ICommand FloatPanelCommand { get; private set; }
        public ICommand DockPanelCommand { get; private set; }
        public ICommand ClosePanelCommand { get; private set; }
        public ICommand ShowPanelOptionsCommand { get; private set; }
        public ICommand ResetLayoutCommand { get; private set; }

        #endregion

        #region Private Methods

        private void InitializeCommands()
        {
            TogglePinCommand = new RelayCommand<string>(TogglePin);
            FloatPanelCommand = new RelayCommand<string>(FloatPanel);
            DockPanelCommand = new RelayCommand<DockPanelInfo>(DockPanel);
            ClosePanelCommand = new RelayCommand<string>(ClosePanel);
            ShowPanelOptionsCommand = new RelayCommand(ShowPanelOptions);
            ResetLayoutCommand = new RelayCommand(ResetLayout);
        }

        private void InitializePanels()
        {
            AvailablePanels = new ObservableCollection<DockablePanel>();

            // Initialize default panels
            var explorerPanel = new DockablePanel
            {
                Id = "Explorer",
                Title = "Explorer",
                Icon = "🗂️",
                Position = DockPosition.Left,
                IsPinned = true,
                IsVisible = true,
                Content = CreateExplorerContent()
            };

            var propertiesPanel = new DockablePanel
            {
                Id = "Properties",
                Title = "Properties",
                Icon = "⚙️",
                Position = DockPosition.Right,
                IsPinned = true,
                IsVisible = true,
                Content = CreatePropertiesContent()
            };

            var outputPanel = new DockablePanel
            {
                Id = "Output",
                Title = "Output",
                Icon = "📊",
                Position = DockPosition.Bottom,
                IsPinned = true,
                IsVisible = true,
                Content = CreateOutputContent()
            };

            _panels["Left"] = explorerPanel;
            _panels["Right"] = propertiesPanel;
            _panels["Bottom"] = outputPanel;

            AvailablePanels.Add(explorerPanel);
            AvailablePanels.Add(propertiesPanel);
            AvailablePanels.Add(outputPanel);

            // Set initial content
            LeftPanelContent = explorerPanel.Content;
            RightPanelContent = propertiesPanel.Content;
            BottomPanelContent = outputPanel.Content;
            MainContent = "Main content area - your primary workspace";
        }

        private object CreateExplorerContent()
        {
            return new StackPanel
            {
                Children =
                {
                    new System.Windows.Controls.TextBlock { Text = "📁 Discovery Modules", Margin = new Thickness(0, 0, 0, 8), FontWeight = FontWeights.SemiBold },
                    new System.Windows.Controls.TextBlock { Text = "└ Azure Discovery", Margin = new Thickness(16, 0, 0, 4) },
                    new System.Windows.Controls.TextBlock { Text = "└ Exchange Discovery", Margin = new Thickness(16, 0, 0, 4) },
                    new System.Windows.Controls.TextBlock { Text = "└ SharePoint Discovery", Margin = new Thickness(16, 0, 0, 4) },
                    new System.Windows.Controls.TextBlock { Text = "└ Teams Discovery", Margin = new Thickness(16, 0, 0, 8) },
                    new System.Windows.Controls.TextBlock { Text = "📊 Reports", Margin = new Thickness(0, 8, 0, 8), FontWeight = FontWeights.SemiBold },
                    new System.Windows.Controls.TextBlock { Text = "└ Migration Analysis", Margin = new Thickness(16, 0, 0, 4) },
                    new System.Windows.Controls.TextBlock { Text = "└ Cost Assessment", Margin = new Thickness(16, 0, 0, 4) },
                    new System.Windows.Controls.TextBlock { Text = "└ Risk Analysis", Margin = new Thickness(16, 0, 0, 4) }
                }
            };
        }

        private object CreatePropertiesContent()
        {
            return new StackPanel
            {
                Children =
                {
                    new System.Windows.Controls.TextBlock { Text = "Properties", FontWeight = FontWeights.SemiBold, Margin = new Thickness(0, 0, 0, 8) },
                    new System.Windows.Controls.TextBlock { Text = "Name: Discovery Module", Margin = new Thickness(0, 0, 0, 4) },
                    new System.Windows.Controls.TextBlock { Text = "Type: Azure Discovery", Margin = new Thickness(0, 0, 0, 4) },
                    new System.Windows.Controls.TextBlock { Text = "Status: Ready", Margin = new Thickness(0, 0, 0, 4) },
                    new System.Windows.Controls.TextBlock { Text = "Last Run: Never", Margin = new Thickness(0, 0, 0, 8) },
                    new System.Windows.Controls.TextBlock { Text = "Configuration", FontWeight = FontWeights.SemiBold, Margin = new Thickness(0, 8, 0, 8) },
                    new System.Windows.Controls.TextBlock { Text = "Tenant ID: Not Set", Margin = new Thickness(0, 0, 0, 4) },
                    new System.Windows.Controls.TextBlock { Text = "Subscription: Not Set", Margin = new Thickness(0, 0, 0, 4) },
                    new System.Windows.Controls.TextBlock { Text = "Resource Groups: All", Margin = new Thickness(0, 0, 0, 4) }
                }
            };
        }

        private object CreateOutputContent()
        {
            return new StackPanel
            {
                Children =
                {
                    new System.Windows.Controls.TextBlock { Text = "Output Console", FontWeight = FontWeights.SemiBold, Margin = new Thickness(0, 0, 0, 8) },
                    new System.Windows.Controls.TextBlock { Text = "[INFO] Discovery service initialized", Margin = new Thickness(0, 0, 0, 2), FontFamily = new System.Windows.Media.FontFamily("Consolas") },
                    new System.Windows.Controls.TextBlock { Text = "[INFO] Loading discovery modules...", Margin = new Thickness(0, 0, 0, 2), FontFamily = new System.Windows.Media.FontFamily("Consolas") },
                    new System.Windows.Controls.TextBlock { Text = "[SUCCESS] Azure Discovery module loaded", Margin = new Thickness(0, 0, 0, 2), FontFamily = new System.Windows.Media.FontFamily("Consolas") },
                    new System.Windows.Controls.TextBlock { Text = "[SUCCESS] Exchange Discovery module loaded", Margin = new Thickness(0, 0, 0, 2), FontFamily = new System.Windows.Media.FontFamily("Consolas") },
                    new System.Windows.Controls.TextBlock { Text = "[INFO] Ready for discovery operations", Margin = new Thickness(0, 0, 0, 2), FontFamily = new System.Windows.Media.FontFamily("Consolas") }
                }
            };
        }

        private void TogglePin(string panelPosition)
        {
            try
            {
                if (_panels.TryGetValue(panelPosition, out var panel))
                {
                    panel.IsPinned = !panel.IsPinned;
                    
                    var status = panel.IsPinned ? "pinned" : "unpinned";
                    
                    _notificationService?.AddInfo(
                        "Panel Updated", 
                        $"{panel.Title} panel {status}");

                    Logger?.LogDebug("Toggled pin for {PanelTitle}: {IsPinned}", panel.Title, panel.IsPinned);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error toggling pin for panel: {PanelPosition}", panelPosition);
                _notificationService?.AddError(
                    "Panel Error", 
                    "Unable to toggle panel pin state.");
            }
        }

        private void FloatPanel(string panelPosition)
        {
            try
            {
                if (_panels.TryGetValue(panelPosition, out var panel))
                {
                    // Create floating window
                    var floatingWindow = new Window
                    {
                        Title = panel.Title,
                        Width = 400,
                        Height = 300,
                        WindowStyle = WindowStyle.ToolWindow,
                        ShowInTaskbar = false,
                        Content = panel.Content,
                        Owner = Application.Current.MainWindow
                    };

                    // Position window near the panel
                    floatingWindow.Left = Application.Current.MainWindow.Left + 100;
                    floatingWindow.Top = Application.Current.MainWindow.Top + 100;

                    _floatingWindows[panelPosition] = floatingWindow;
                    floatingWindow.Show();

                    // Clear the docked content
                    switch (panelPosition)
                    {
                        case "Left":
                            LeftPanelContent = null;
                            break;
                        case "Right":
                            RightPanelContent = null;
                            break;
                        case "Bottom":
                            BottomPanelContent = null;
                            break;
                    }

                    panel.IsFloating = true;
                    
                    _notificationService?.AddInfo(
                        "Panel Floated", 
                        $"{panel.Title} panel is now floating");

                    Logger?.LogDebug("Floated panel: {PanelTitle}", panel.Title);

                    // Handle window closing
                    floatingWindow.Closed += (s, e) => DockFloatingPanel(panelPosition);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error floating panel: {PanelPosition}", panelPosition);
                _notificationService?.AddError(
                    "Panel Error", 
                    "Unable to float the panel.");
            }
        }

        private void DockFloatingPanel(string panelPosition)
        {
            try
            {
                if (_panels.TryGetValue(panelPosition, out var panel) && _floatingWindows.ContainsKey(panelPosition))
                {
                    _floatingWindows.Remove(panelPosition);
                    
                    // Restore docked content
                    switch (panelPosition)
                    {
                        case "Left":
                            LeftPanelContent = panel.Content;
                            break;
                        case "Right":
                            RightPanelContent = panel.Content;
                            break;
                        case "Bottom":
                            BottomPanelContent = panel.Content;
                            break;
                    }

                    panel.IsFloating = false;
                    
                    Logger?.LogDebug("Docked floating panel: {PanelTitle}", panel.Title);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error docking floating panel: {PanelPosition}", panelPosition);
            }
        }

        private void DockPanel(DockPanelInfo dockInfo)
        {
            try
            {
                if (dockInfo?.Panel == null) return;

                var panel = dockInfo.Panel;
                
                // Update panel position
                panel.Position = dockInfo.TargetPosition;
                panel.IsFloating = false;

                // Set content based on target position
                switch (dockInfo.TargetPosition)
                {
                    case DockPosition.Left:
                        LeftPanelContent = panel.Content;
                        _panels["Left"] = panel;
                        break;
                    case DockPosition.Right:
                        RightPanelContent = panel.Content;
                        _panels["Right"] = panel;
                        break;
                    case DockPosition.Bottom:
                        BottomPanelContent = panel.Content;
                        _panels["Bottom"] = panel;
                        break;
                }

                _notificationService?.AddInfo(
                    "Panel Docked", 
                    $"{panel.Title} docked to {dockInfo.TargetPosition}");

                Logger?.LogDebug("Docked panel {PanelTitle} to {Position}", panel.Title, dockInfo.TargetPosition);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error docking panel: {PanelTitle}", dockInfo?.Panel?.Title);
                _notificationService?.AddError(
                    "Panel Error", 
                    "Unable to dock the panel.");
            }
        }

        private void ClosePanel(string panelPosition)
        {
            try
            {
                if (_panels.TryGetValue(panelPosition, out var panel))
                {
                    // Close floating window if exists
                    if (_floatingWindows.TryGetValue(panelPosition, out var window))
                    {
                        window.Close();
                        _floatingWindows.Remove(panelPosition);
                    }

                    // Clear docked content
                    switch (panelPosition)
                    {
                        case "Left":
                            LeftPanelContent = null;
                            break;
                        case "Right":
                            RightPanelContent = null;
                            break;
                        case "Bottom":
                            BottomPanelContent = null;
                            break;
                    }

                    panel.IsVisible = false;
                    
                    _notificationService?.AddInfo(
                        "Panel Closed", 
                        $"{panel.Title} panel closed");

                    Logger?.LogDebug("Closed panel: {PanelTitle}", panel.Title);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error closing panel: {PanelPosition}", panelPosition);
                _notificationService?.AddError(
                    "Panel Error", 
                    "Unable to close the panel.");
            }
        }

        private void ShowPanelOptions()
        {
            try
            {
                // This could show a dialog with panel management options
                var panelInfo = string.Join("\n", _panels.Values.Select(p => 
                    $"• {p.Title}: {p.Position} ({(p.IsVisible ? "Visible" : "Hidden")}, {(p.IsPinned ? "Pinned" : "Unpinned")})"));

                _notificationService?.AddInfo(
                    "Panel Information", 
                    $"Current panels:\n{panelInfo}");

                Logger?.LogDebug("Showed panel options");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing panel options");
            }
        }

        private void ResetLayout()
        {
            try
            {
                // Close all floating windows
                foreach (var window in _floatingWindows.Values.ToList())
                {
                    window.Close();
                }
                _floatingWindows.Clear();

                // Reset all panels to default positions
                foreach (var panel in _panels.Values)
                {
                    panel.IsFloating = false;
                    panel.IsVisible = true;
                    panel.IsPinned = true;
                }

                // Restore default content
                InitializePanels();

                _notificationService?.AddSuccess(
                    "Layout Reset", 
                    "Panel layout has been reset to default");

                Logger?.LogInformation("Reset panel layout to default");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error resetting panel layout");
                _notificationService?.AddError(
                    "Layout Reset Failed", 
                    "Unable to reset panel layout.");
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Shows a panel by position
        /// </summary>
        public void ShowPanel(string panelPosition)
        {
            if (_panels.TryGetValue(panelPosition, out var panel))
            {
                panel.IsVisible = true;
                
                switch (panelPosition)
                {
                    case "Left":
                        LeftPanelContent = panel.Content;
                        break;
                    case "Right":
                        RightPanelContent = panel.Content;
                        break;
                    case "Bottom":
                        BottomPanelContent = panel.Content;
                        break;
                }
            }
        }

        /// <summary>
        /// Hides a panel by position
        /// </summary>
        public void HidePanel(string panelPosition)
        {
            if (_panels.TryGetValue(panelPosition, out var panel))
            {
                panel.IsVisible = false;
                
                switch (panelPosition)
                {
                    case "Left":
                        LeftPanelContent = null;
                        break;
                    case "Right":
                        RightPanelContent = null;
                        break;
                    case "Bottom":
                        BottomPanelContent = null;
                        break;
                }
            }
        }

        #endregion
    }

    /// <summary>
    /// Represents a dockable panel
    /// </summary>
    public class DockablePanel : BaseViewModel
    {
        private bool _isPinned = true;
        private bool _isVisible = true;
        private bool _isFloating;
        private object _content;

        public string Id { get; set; }
        public string Title { get; set; }
        public string Icon { get; set; }
        public DockPosition Position { get; set; }

        public bool IsPinned
        {
            get => _isPinned;
            set => SetProperty(ref _isPinned, value);
        }

        public bool IsVisible
        {
            get => _isVisible;
            set => SetProperty(ref _isVisible, value);
        }

        public bool IsFloating
        {
            get => _isFloating;
            set => SetProperty(ref _isFloating, value);
        }

        public object Content
        {
            get => _content;
            set => SetProperty(ref _content, value);
        }

        public double Width { get; set; } = 250;
        public double Height { get; set; } = 200;
        public double MinWidth { get; set; } = 150;
        public double MinHeight { get; set; } = 100;
    }

    /// <summary>
    /// Information for docking operations
    /// </summary>
    public class DockPanelInfo
    {
        public DockablePanel Panel { get; set; }
        public DockPosition TargetPosition { get; set; }
        public Point DropPoint { get; set; }
    }

    /// <summary>
    /// Dock positions for panels
    /// </summary>
    public enum DockPosition
    {
        Left,
        Right,
        Top,
        Bottom,
        Center,
        Floating
    }
}
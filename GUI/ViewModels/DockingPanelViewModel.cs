using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
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
        private readonly IDockingLayoutService _layoutService;
        private readonly Dictionary<string, DockablePanel> _panels;
        private readonly Dictionary<string, Window> _floatingWindows;
        
        private object _mainContent;
        private object _leftPanelContent;
        private object _rightPanelContent;
        private object _bottomPanelContent;

        public DockingPanelViewModel() : base()
        {
            _notificationService = ServiceLocator.GetService<NotificationService>();
            _layoutService = SimpleServiceLocator.GetService<IDockingLayoutService>() ?? new DockingLayoutService();
            _panels = new Dictionary<string, DockablePanel>();
            _floatingWindows = new Dictionary<string, Window>();
            
            InitializeCommands();
            _ = InitializePanelsAsync();
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
        public ICommand SaveLayoutCommand { get; private set; }
        public ICommand LoadLayoutCommand { get; private set; }
        public ICommand SaveLayoutAsCommand { get; private set; }
        public ICommand ManageLayoutsCommand { get; private set; }

        #endregion

        #region Private Methods

        protected override void InitializeCommands()
        {
            TogglePinCommand = new RelayCommand<string>(TogglePin);
            FloatPanelCommand = new RelayCommand<string>(FloatPanel);
            DockPanelCommand = new RelayCommand<DockPanelInfo>(DockPanel);
            ClosePanelCommand = new RelayCommand<string>(ClosePanel);
            ShowPanelOptionsCommand = new RelayCommand(ShowPanelOptions);
            ResetLayoutCommand = new RelayCommand(ResetLayout);
            SaveLayoutCommand = new RelayCommand(() => Task.Run(SaveCurrentLayoutAsync));
            LoadLayoutCommand = new RelayCommand(() => Task.Run(LoadDefaultLayoutAsync));
            SaveLayoutAsCommand = new RelayCommand(SaveLayoutAs);
            ManageLayoutsCommand = new RelayCommand(ManageLayouts);
        }

        private async Task InitializePanelsAsync()
        {
            try
            {
                AvailablePanels = new ObservableCollection<DockablePanel>();

                // Load saved layout or use default
                var layout = await _layoutService.LoadLayoutAsync();
                await ApplyLayoutAsync(layout);

                Logger?.LogInformation("Initialized panels with saved layout");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error initializing panels, using defaults");
                InitializeDefaultPanels();
            }
        }

        private void InitializeDefaultPanels()
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
                Content = CreateExplorerContent(),
                Width = 250,
                Height = 400
            };

            var propertiesPanel = new DockablePanel
            {
                Id = "Properties",
                Title = "Properties",
                Icon = "⚙️",
                Position = DockPosition.Right,
                IsPinned = true,
                IsVisible = true,
                Content = CreatePropertiesContent(),
                Width = 300,
                Height = 400
            };

            var outputPanel = new DockablePanel
            {
                Id = "Output",
                Title = "Output",
                Icon = "📊",
                Position = DockPosition.Bottom,
                IsPinned = true,
                IsVisible = true,
                Content = CreateOutputContent(),
                Width = 800,
                Height = 200
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
                    
                    // Auto-save layout after floating
                    _ = Task.Run(SaveCurrentLayoutAsync);
                    
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
                    
                    // Auto-save layout after docking
                    _ = Task.Run(SaveCurrentLayoutAsync);
                    
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
                    
                    // Auto-save layout after closing
                    _ = Task.Run(SaveCurrentLayoutAsync);
                    
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
                InitializeDefaultPanels();

                // Save the reset layout
                _ = Task.Run(SaveCurrentLayoutAsync);

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

        private async Task SaveCurrentLayoutAsync()
        {
            try
            {
                var layout = CreateLayoutFromCurrentState();
                await _layoutService.SaveLayoutAsync(layout);

                _notificationService?.AddSuccess(
                    "Layout Saved", 
                    "Current panel layout has been saved");

                Logger?.LogInformation("Saved current layout");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error saving current layout");
                _notificationService?.AddError(
                    "Save Failed", 
                    "Unable to save current layout.");
            }
        }

        private async Task LoadDefaultLayoutAsync()
        {
            try
            {
                var layout = await _layoutService.LoadLayoutAsync();
                await ApplyLayoutAsync(layout);

                _notificationService?.AddSuccess(
                    "Layout Loaded", 
                    "Panel layout has been restored");

                Logger?.LogInformation("Loaded default layout");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error loading layout");
                _notificationService?.AddError(
                    "Load Failed", 
                    "Unable to load saved layout.");
            }
        }

        private void SaveLayoutAs()
        {
            try
            {
                // For now, use a timestamp-based name since InputBox is not available
                var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
                var name = $"Layout_{timestamp}";

                var layout = CreateLayoutFromCurrentState();
                layout.Name = name;
                
                Task.Run(async () =>
                {
                    try
                    {
                        await _layoutService.SaveLayoutAsync(name, layout);
                        
                        Application.Current.Dispatcher.Invoke(() =>
                        {
                            _notificationService?.AddSuccess(
                                "Layout Saved", 
                                $"Layout '{name}' has been saved");
                        });
                    }
                    catch (Exception ex)
                    {
                        Logger?.LogError(ex, "Error saving layout: {LayoutName}", name);
                        Application.Current.Dispatcher.Invoke(() =>
                        {
                            _notificationService?.AddError(
                                "Save Failed", 
                                $"Unable to save layout '{name}'");
                        });
                    }
                });
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error in SaveLayoutAs");
                _notificationService?.AddError(
                    "Error", 
                    "Unable to save layout");
            }
        }

        private void ManageLayouts()
        {
            try
            {
                // This would show a dialog to manage saved layouts
                Task.Run(async () =>
                {
                    var layouts = await _layoutService.GetSavedLayoutsAsync();
                    var layoutList = string.Join("\n", layouts.Select((name, index) => $"{index + 1}. {name}"));

                    Application.Current.Dispatcher.Invoke(() =>
                    {
                        _notificationService?.AddInfo(
                            "Saved Layouts", 
                            $"Available layouts:\n{layoutList}");
                    });
                });

                Logger?.LogDebug("Showed layout management");
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error showing layout management");
                _notificationService?.AddError(
                    "Error", 
                    "Unable to show layout management");
            }
        }

        private DockingLayout CreateLayoutFromCurrentState()
        {
            var layout = new DockingLayout
            {
                Name = "Current Layout",
                LastModified = DateTime.Now,
                Panels = new List<PanelLayout>()
            };

            foreach (var kvp in _panels)
            {
                var panel = kvp.Value;
                var panelLayout = new PanelLayout
                {
                    Id = panel.Id,
                    Title = panel.Title,
                    Icon = panel.Icon,
                    Position = panel.Position,
                    IsVisible = panel.IsVisible,
                    IsPinned = panel.IsPinned,
                    IsFloating = panel.IsFloating,
                    Width = panel.Width,
                    Height = panel.Height
                };

                // Get floating window position if exists
                if (_floatingWindows.TryGetValue(kvp.Key, out var floatingWindow))
                {
                    panelLayout.FloatingX = floatingWindow.Left;
                    panelLayout.FloatingY = floatingWindow.Top;
                }

                layout.Panels.Add(panelLayout);
            }

            return layout;
        }

        private async Task ApplyLayoutAsync(DockingLayout layout)
        {
            try
            {
                // Clear current panels
                _panels.Clear();
                _floatingWindows.Clear();
                AvailablePanels?.Clear();

                if (AvailablePanels == null)
                    AvailablePanels = new ObservableCollection<DockablePanel>();

                // Apply each panel from the layout
                foreach (var panelLayout in layout.Panels)
                {
                    var panel = new DockablePanel
                    {
                        Id = panelLayout.Id,
                        Title = panelLayout.Title,
                        Icon = panelLayout.Icon,
                        Position = panelLayout.Position,
                        IsVisible = panelLayout.IsVisible,
                        IsPinned = panelLayout.IsPinned,
                        IsFloating = panelLayout.IsFloating,
                        Width = panelLayout.Width,
                        Height = panelLayout.Height,
                        Content = CreatePanelContent(panelLayout.Id)
                    };

                    // Map panel to position
                    var positionKey = GetPositionKey(panelLayout.Position);
                    if (!string.IsNullOrEmpty(positionKey))
                    {
                        _panels[positionKey] = panel;
                    }

                    AvailablePanels.Add(panel);

                    // Handle floating panels
                    if (panelLayout.IsFloating)
                    {
                        await Application.Current.Dispatcher.InvokeAsync(() =>
                        {
                            var floatingWindow = new Window
                            {
                                Title = panel.Title,
                                Width = panelLayout.Width,
                                Height = panelLayout.Height,
                                Left = panelLayout.FloatingX,
                                Top = panelLayout.FloatingY,
                                WindowStyle = WindowStyle.ToolWindow,
                                ShowInTaskbar = false,
                                Content = panel.Content,
                                Owner = Application.Current.MainWindow
                            };

                            _floatingWindows[positionKey] = floatingWindow;
                            floatingWindow.Show();
                            floatingWindow.Closed += (s, e) => DockFloatingPanel(positionKey);
                        });
                    }
                }

                // Set panel content for docked panels
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    LeftPanelContent = _panels.TryGetValue("Left", out var leftPanel) && leftPanel.IsVisible && !leftPanel.IsFloating ? leftPanel.Content : null;
                    RightPanelContent = _panels.TryGetValue("Right", out var rightPanel) && rightPanel.IsVisible && !rightPanel.IsFloating ? rightPanel.Content : null;
                    BottomPanelContent = _panels.TryGetValue("Bottom", out var bottomPanel) && bottomPanel.IsVisible && !bottomPanel.IsFloating ? bottomPanel.Content : null;
                    MainContent = "Main content area - your primary workspace";
                });

                Logger?.LogInformation("Applied layout: {LayoutName}", layout.Name);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error applying layout");
                throw;
            }
        }

        private string GetPositionKey(DockPosition position)
        {
            return position switch
            {
                DockPosition.Left => "Left",
                DockPosition.Right => "Right",
                DockPosition.Bottom => "Bottom",
                DockPosition.Top => "Top",
                _ => null
            };
        }

        private object CreatePanelContent(string panelId)
        {
            return panelId switch
            {
                "Explorer" => CreateExplorerContent(),
                "Properties" => CreatePropertiesContent(),
                "Output" => CreateOutputContent(),
                _ => new System.Windows.Controls.TextBlock { Text = $"Content for {panelId}" }
            };
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
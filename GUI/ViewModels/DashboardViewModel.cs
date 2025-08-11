using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    public class DashboardViewModel : BaseViewModel
    {
        private readonly IWidgetLayoutService _widgetLayoutService;
        private readonly ILogger<DashboardViewModel> _logger;
        private ObservableCollection<WidgetViewModel> _widgets;
        private bool _isEditMode;

        public DashboardViewModel(IWidgetLayoutService widgetLayoutService = null, ILogger<DashboardViewModel> logger = null)
        {
            _widgetLayoutService = widgetLayoutService ?? SimpleServiceLocator.GetService<IWidgetLayoutService>() ?? new WidgetLayoutService();
            _logger = logger;

            TabTitle = "Dashboard";
            CanClose = false;

            Widgets = new ObservableCollection<WidgetViewModel>();

            // Commands
            RefreshAllWidgetsCommand = new AsyncRelayCommand(RefreshAllWidgetsAsync);
            ToggleEditModeCommand = new RelayCommand(ToggleEditMode);
            ResetLayoutCommand = new AsyncRelayCommand(ResetLayoutAsync);
            SaveLayoutCommand = new AsyncRelayCommand(SaveLayoutAsync);
            RefreshWidgetCommand = new RelayCommand<WidgetViewModel>(widget => Task.Run(() => RefreshWidgetAsync(widget)));

            // Load widgets on initialization
            Task.Run(LoadWidgetsAsync);
        }

        public ObservableCollection<WidgetViewModel> Widgets
        {
            get => _widgets;
            set => SetProperty(ref _widgets, value);
        }


        public bool IsEditMode
        {
            get => _isEditMode;
            set => SetProperty(ref _isEditMode, value);
        }

        // Commands
        public ICommand RefreshAllWidgetsCommand { get; }
        public ICommand ToggleEditModeCommand { get; }
        public ICommand ResetLayoutCommand { get; }
        public ICommand SaveLayoutCommand { get; }
        public ICommand RefreshWidgetCommand { get; }

        private async Task LoadWidgetsAsync()
        {
            try
            {
                IsLoading = true;
                ErrorMessage = null;

                var configurations = await _widgetLayoutService.LoadWidgetLayoutAsync();
                
                var widgets = configurations == null 
                    ? await _widgetLayoutService.CreateDefaultWidgetsAsync()
                    : configurations.Select(config => ((WidgetLayoutService)_widgetLayoutService).CreateWidgetFromConfiguration(config)).ToList();

                // Clear and populate widgets on UI thread
                await Application.Current.Dispatcher.InvokeAsync(() =>
                {
                    Widgets.Clear();
                    foreach (var widget in widgets)
                    {
                        Widgets.Add(widget);
                    }
                });

                // Don't wait for all widgets to refresh - let them load asynchronously
                // This prevents the perpetual loading state
                var refreshTasks = widgets.Where(w => w.IsVisible)
                    .Select(w => Task.Run(() => w.RefreshAsync().ContinueWith(t => 
                    {
                        if (t.IsFaulted)
                        {
                            _logger?.LogWarning(t.Exception, "Widget refresh failed for {WidgetType}", w.WidgetType);
                        }
                    })))
                    .ToArray();

                // Don't await all tasks - let dashboard show while widgets load
                _ = Task.WhenAll(refreshTasks);

                _logger?.LogInformation("Loaded {Count} dashboard widgets", widgets.Count);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to load dashboard widgets");
                ErrorMessage = $"Failed to load dashboard: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task RefreshAllWidgetsAsync()
        {
            try
            {
                IsLoading = true;
                ErrorMessage = null;

                var refreshTasks = Widgets
                    .Where(w => w.IsVisible)
                    .Select(w => Task.Run(() => w.RefreshAsync()))
                    .ToArray();

                await Task.WhenAll(refreshTasks);

                _logger?.LogInformation("Refreshed all dashboard widgets");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to refresh dashboard widgets");
                ErrorMessage = $"Failed to refresh widgets: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task RefreshWidgetAsync(WidgetViewModel widget)
        {
            if (widget == null) return;

            try
            {
                await Task.Run(async () => await widget.RefreshAsync());
                _logger?.LogInformation("Refreshed widget: {WidgetType}", widget.WidgetType);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to refresh widget: {WidgetType}", widget?.WidgetType);
                widget.ErrorMessage = $"Refresh failed: {ex.Message}";
            }
        }

        private void ToggleEditMode()
        {
            IsEditMode = !IsEditMode;
            _logger?.LogInformation("Dashboard edit mode: {IsEditMode}", IsEditMode);
        }

        private async Task SaveLayoutAsync()
        {
            try
            {
                await _widgetLayoutService.SaveWidgetLayoutAsync(Widgets);
                _logger?.LogInformation("Saved dashboard layout");
                
                // Exit edit mode after saving
                IsEditMode = false;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to save dashboard layout");
                ErrorMessage = $"Failed to save layout: {ex.Message}";
            }
        }

        private async Task ResetLayoutAsync()
        {
            try
            {
                await _widgetLayoutService.ResetToDefaultLayoutAsync();
                await LoadWidgetsAsync();
                
                IsEditMode = false;
                _logger?.LogInformation("Reset dashboard layout to defaults");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Failed to reset dashboard layout");
                ErrorMessage = $"Failed to reset layout: {ex.Message}";
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                // Dispose all widgets that implement IDisposable
                if (Widgets != null)
                {
                    foreach (var widget in Widgets.OfType<IDisposable>())
                    {
                        try
                        {
                            widget.Dispose();
                        }
                        catch (Exception ex)
                        {
                            _logger?.LogWarning(ex, "Error disposing widget: {WidgetType}", widget.GetType().Name);
                        }
                    }
                    Widgets.Clear();
                }
            }

            base.Dispose(disposing);
        }
    }
}
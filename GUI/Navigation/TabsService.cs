using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Navigation
{
    /// <summary>
    /// Service for managing tabs and preventing duplicates
    /// </summary>
    public class TabsService
    {
        private readonly ObservableCollection<BaseViewModel> _openTabs;
        private readonly MainViewModel _mainViewModel;

        public TabsService(ObservableCollection<BaseViewModel> openTabs, MainViewModel mainViewModel)
        {
            _openTabs = openTabs ?? throw new ArgumentNullException(nameof(openTabs));
            _mainViewModel = mainViewModel ?? throw new ArgumentNullException(nameof(mainViewModel));
        }

        /// <summary>
        /// Show or activate a tab. If tab exists, activate it. Otherwise create new tab.
        /// </summary>
        public BaseViewModel ShowOrActivateTab(string key, string title)
        {
            try
            {
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"TabsService: ShowOrActivateTab called - key='{key}', title='{title}'");

                // Check if tab already exists
                var existingTab = _openTabs.FirstOrDefault(t => 
                    string.Equals(t.TabTitle, title, StringComparison.OrdinalIgnoreCase));

                if (existingTab != null)
                {
                    _ = EnhancedLoggingService.Instance.LogInformationAsync($"TabsService: Found existing tab for '{title}', activating");
                    // Set as current tab (if MainViewModel has this concept)
                    return existingTab;
                }

                // Create new tab using ViewRegistry
                var view = ViewRegistry.Resolve(key);
                if (view == null)
                {
                    _ = EnhancedLoggingService.Instance.LogWarningAsync($"TabsService: ViewRegistry returned null for key '{key}'");
                    return null;
                }

                // Create a wrapper ViewModel for the view if needed
                var tabViewModel = CreateTabViewModelWrapper(view, title);
                
                _openTabs.Add(tabViewModel);
                
                _ = EnhancedLoggingService.Instance.LogInformationAsync($"TabsService: Created new tab '{title}', total tabs: {_openTabs.Count}");
                
                return tabViewModel;
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"TabsService.ShowOrActivateTab failed: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Create a wrapper ViewModel for a UserControl view
        /// </summary>
        private BaseViewModel CreateTabViewModelWrapper(UserControl view, string title)
        {
            // For now, create a simple wrapper - in the future this could be more sophisticated
            var wrapper = new TabViewModelWrapper
            {
                TabTitle = title,
                Content = view
            };

            // If the view has a ViewModel that implements LoadAsync, trigger load
            if (view.DataContext is BaseViewModel loadable)
            {
                _ = System.Threading.Tasks.Task.Run(async () =>
                {
                    try
                    {
                        await loadable.LoadAsync();
                    }
                    catch (Exception ex)
                    {
                        _ = EnhancedLoggingService.Instance.LogErrorAsync($"TabsService: LoadAsync failed for view '{title}': {ex.Message}");
                    }
                });
            }

            return wrapper;
        }

        /// <summary>
        /// Close a tab
        /// </summary>
        public void CloseTab(BaseViewModel tabViewModel)
        {
            try
            {
                if (tabViewModel != null && _openTabs.Contains(tabViewModel))
                {
                    _openTabs.Remove(tabViewModel);
                    _ = EnhancedLoggingService.Instance.LogInformationAsync($"TabsService: Closed tab '{tabViewModel.TabTitle}', remaining tabs: {_openTabs.Count}");
                }
            }
            catch (Exception ex)
            {
                _ = EnhancedLoggingService.Instance.LogErrorAsync($"TabsService.CloseTab failed: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Simple wrapper ViewModel for UserControl-based views
    /// </summary>
    public class TabViewModelWrapper : BaseViewModel
    {
        public UserControl Content { get; set; }
    }
}
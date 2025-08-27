using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Groups ViewModel using unified loading pipeline
    /// </summary>
    public class GroupsViewModel : BaseViewModel
    {
        private readonly CsvDataServiceNew _csvService;
        private readonly ProfileService _profileService;
        
        // Data collection
        public ObservableCollection<GroupData> Groups { get; } = new();
        
        // Implement HasData for this specific view
        private bool _hasData;
        public override bool HasData 
        { 
            get => _hasData; 
            protected set => SetProperty(ref _hasData, value); 
        }
        
        public GroupsViewModel(
            CsvDataServiceNew csvService, 
            ILogger<GroupsViewModel> logger, 
            ProfileService profileService) 
            : base(logger)
        {
            _csvService = csvService ?? throw new ArgumentNullException(nameof(csvService));
            _profileService = profileService ?? throw new ArgumentNullException(nameof(profileService));
        }
        
        /// <summary>
        /// Unified LoadAsync implementation - follows exact specification pattern
        /// </summary>
        public override async Task LoadAsync()
        {
            IsLoading = true; 
            HasData = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try 
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "groups" }, "Starting groups view load");
                
                // Use Groups loader method
                var result = await _csvService.LoadGroupsAsync(_profileService.CurrentProfile ?? "ljpops");
                
                // Process warnings - these become red banners (must be done on UI thread)
                await Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    foreach (var warning in result.HeaderWarnings) 
                        HeaderWarnings.Add(warning);
                });
                
                // Update data collection (must be done on UI thread)
                await Application.Current.Dispatcher.BeginInvoke(() =>
                {
                    Groups.Clear();
                    foreach (var item in result.Data) 
                        Groups.Add(item);
                });
                
                HasData = Groups.Count > 0;
                OnPropertyChanged(nameof(HasData));
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "groups", rows = Groups.Count, warnings = HeaderWarnings.Count }, "Groups view load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Unexpected error: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "groups" }, "Failed to load groups view");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }
    }
}
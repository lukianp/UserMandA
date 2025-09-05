using System;
using System.Collections.ObjectModel;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Sample ViewModel demonstrating customizable DataGrid functionality
    /// </summary>
    public class CustomizableDataGridExampleViewModel : BaseViewModel
    {
        private ObservableCollection<SampleUserData> _sampleData;

        public CustomizableDataGridExampleViewModel()
        {
            InitializeSampleData();
        }

        /// <summary>
        /// Sample data for the DataGrid
        /// </summary>
        public ObservableCollection<SampleUserData> SampleData
        {
            get => _sampleData;
            set => SetProperty(ref _sampleData, value);
        }

        private void InitializeSampleData()
        {
            // Initialize empty collection - data should be loaded from CSV sources
            SampleData = new ObservableCollection<SampleUserData>();
        }
    }

    /// <summary>
    /// Sample user data model for demonstration
    /// </summary>
    public class SampleUserData
    {
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string Department { get; set; }
        public string JobTitle { get; set; }
        public string Manager { get; set; }
        public bool IsEnabled { get; set; }
        public DateTime LastLogon { get; set; }
        public string UserPrincipalName { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
    }
}
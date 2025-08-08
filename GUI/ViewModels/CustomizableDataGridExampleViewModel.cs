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
            SampleData = new ObservableCollection<SampleUserData>
            {
                new SampleUserData
                {
                    DisplayName = "John Smith",
                    Email = "john.smith@company.com",
                    Department = "IT",
                    JobTitle = "Software Developer",
                    Manager = "Sarah Johnson",
                    IsEnabled = true,
                    LastLogon = DateTime.Now.AddDays(-1),
                    UserPrincipalName = "john.smith@company.com",
                    City = "New York",
                    Country = "United States"
                },
                new SampleUserData
                {
                    DisplayName = "Sarah Johnson",
                    Email = "sarah.johnson@company.com",
                    Department = "IT",
                    JobTitle = "IT Manager",
                    Manager = "Michael Brown",
                    IsEnabled = true,
                    LastLogon = DateTime.Now.AddHours(-2),
                    UserPrincipalName = "sarah.johnson@company.com",
                    City = "New York",
                    Country = "United States"
                },
                new SampleUserData
                {
                    DisplayName = "Michael Brown",
                    Email = "michael.brown@company.com",
                    Department = "Management",
                    JobTitle = "CTO",
                    Manager = "CEO",
                    IsEnabled = true,
                    LastLogon = DateTime.Now.AddDays(-0.5),
                    UserPrincipalName = "michael.brown@company.com",
                    City = "San Francisco",
                    Country = "United States"
                },
                new SampleUserData
                {
                    DisplayName = "Emily Davis",
                    Email = "emily.davis@company.com",
                    Department = "Marketing",
                    JobTitle = "Marketing Specialist",
                    Manager = "David Wilson",
                    IsEnabled = true,
                    LastLogon = DateTime.Now.AddDays(-3),
                    UserPrincipalName = "emily.davis@company.com",
                    City = "Chicago",
                    Country = "United States"
                },
                new SampleUserData
                {
                    DisplayName = "David Wilson",
                    Email = "david.wilson@company.com",
                    Department = "Marketing",
                    JobTitle = "Marketing Manager",
                    Manager = "Michael Brown",
                    IsEnabled = false,
                    LastLogon = DateTime.Now.AddDays(-10),
                    UserPrincipalName = "david.wilson@company.com",
                    City = "Los Angeles",
                    Country = "United States"
                }
            };
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
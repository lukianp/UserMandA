using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Threading;
using MandADiscoverySuite.Themes;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite
{
    public partial class ManagerSelectionDialog : Window
    {
        public UserInfo SelectedManager { get; private set; }
        
        private readonly ObservableCollection<UserInfo> _allManagers;
        private readonly ObservableCollection<UserInfo> _filteredManagers;
        private readonly DispatcherTimer _searchTimer;

        public ManagerSelectionDialog()
        {
            InitializeComponent();
            
            // Apply current theme
            ThemeManager.Instance.ApplyThemeToWindow(this);
            
            _allManagers = new ObservableCollection<UserInfo>();
            _filteredManagers = new ObservableCollection<UserInfo>();
            
            // Set up search timer for debounced search
            _searchTimer = new DispatcherTimer()
            {
                Interval = TimeSpan.FromMilliseconds(300)
            };
            _searchTimer.Tick += SearchTimer_Tick;
            
            ManagerDataGrid.ItemsSource = _filteredManagers;
            
            // Load managers asynchronously
            LoadManagersAsync();
        }

        private async void LoadManagersAsync()
        {
            try
            {
                LoadingPanel.Visibility = Visibility.Visible;
                ManagerDataGrid.Visibility = Visibility.Collapsed;
                NoResultsTextBlock.Visibility = Visibility.Collapsed;
                
                // Simulate loading managers - in real implementation, this would query AD/Azure AD
                await Task.Delay(1000); // Simulate network delay
                
                var managers = await GetManagersFromDirectoryAsync();
                
                Dispatcher.Invoke(() =>
                {
                    _allManagers.Clear();
                    foreach (var manager in managers)
                    {
                        _allManagers.Add(manager);
                    }
                    
                    ApplyFilters();
                    
                    LoadingPanel.Visibility = Visibility.Collapsed;
                    
                    if (_filteredManagers.Any())
                    {
                        ManagerDataGrid.Visibility = Visibility.Visible;
                        NoResultsTextBlock.Visibility = Visibility.Collapsed;
                    }
                    else
                    {
                        ManagerDataGrid.Visibility = Visibility.Collapsed;
                        NoResultsTextBlock.Visibility = Visibility.Visible;
                    }
                    
                    UpdateResultsCount();
                });
            }
            catch (Exception ex)
            {
                Dispatcher.Invoke(() =>
                {
                    LoadingPanel.Visibility = Visibility.Collapsed;
                    ManagerDataGrid.Visibility = Visibility.Collapsed;
                    NoResultsTextBlock.Text = $"Error loading managers: {ex.Message}";
                    NoResultsTextBlock.Visibility = Visibility.Visible;
                });
            }
        }

        private async Task<List<UserInfo>> GetManagersFromDirectoryAsync()
        {
            // In a real implementation, this would query Active Directory or Azure AD
            // For now, return sample data
            var managers = new List<UserInfo>
            {
                new UserInfo
                {
                    DisplayName = "Sarah Johnson",
                    Email = "sarah.johnson@company.com",
                    Department = "IT",
                    Title = "IT Director",
                    OfficeLocation = "New York",
                    Manager = "John Smith"
                },
                new UserInfo
                {
                    DisplayName = "Michael Chen",
                    Email = "michael.chen@company.com",
                    Department = "Finance",
                    Title = "Finance Manager",
                    OfficeLocation = "San Francisco",
                    Manager = "Lisa Davis"
                },
                new UserInfo
                {
                    DisplayName = "Emily Rodriguez",
                    Email = "emily.rodriguez@company.com",
                    Department = "HR",
                    Title = "HR Manager",
                    OfficeLocation = "Chicago",
                    Manager = "David Wilson"
                },
                new UserInfo
                {
                    DisplayName = "Robert Thompson",
                    Email = "robert.thompson@company.com",
                    Department = "Sales",
                    Title = "Sales Director",
                    OfficeLocation = "Dallas",
                    Manager = "Jennifer Brown"
                },
                new UserInfo
                {
                    DisplayName = "Amanda Wilson",
                    Email = "amanda.wilson@company.com",
                    Department = "Marketing",
                    Title = "Marketing Manager",
                    OfficeLocation = "Los Angeles",
                    Manager = "Mark Anderson"
                },
                new UserInfo
                {
                    DisplayName = "David Kim",
                    Email = "david.kim@company.com",
                    Department = "Operations",
                    Title = "Operations Manager",
                    OfficeLocation = "Seattle",
                    Manager = "Susan Taylor"
                },
                new UserInfo
                {
                    DisplayName = "Lisa Martinez",
                    Email = "lisa.martinez@company.com",
                    Department = "Legal",
                    Title = "Legal Counsel",
                    OfficeLocation = "Boston",
                    Manager = "Thomas Moore"
                },
                new UserInfo
                {
                    DisplayName = "James Anderson",
                    Email = "james.anderson@company.com",
                    Department = "Executive",
                    Title = "VP of Operations",
                    OfficeLocation = "New York",
                    Manager = "CEO"
                }
            };

            return managers;
        }

        private void SearchTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            _searchTimer.Stop();
            _searchTimer.Start();
        }

        private void SearchTimer_Tick(object sender, EventArgs e)
        {
            _searchTimer.Stop();
            ApplyFilters();
        }

        private void DepartmentFilterComboBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            ApplyFilters();
        }

        private void ApplyFilters()
        {
            if (_allManagers == null) return;

            var searchText = SearchTextBox?.Text?.ToLower() ?? "";
            var selectedDepartment = (DepartmentFilterComboBox?.SelectedItem as ComboBoxItem)?.Content?.ToString();
            
            var filtered = _allManagers.Where(manager =>
            {
                // Search filter
                bool matchesSearch = string.IsNullOrEmpty(searchText) ||
                    manager.DisplayName.ToLower().Contains(searchText) ||
                    manager.Email.ToLower().Contains(searchText) ||
                    manager.Title.ToLower().Contains(searchText);

                // Department filter
                bool matchesDepartment = selectedDepartment == "All Departments" ||
                    string.IsNullOrEmpty(selectedDepartment) ||
                    manager.Department.Equals(selectedDepartment, StringComparison.OrdinalIgnoreCase);

                return matchesSearch && matchesDepartment;
            }).ToList();

            _filteredManagers.Clear();
            foreach (var manager in filtered.OrderBy(m => m.DisplayName))
            {
                _filteredManagers.Add(manager);
            }

            UpdateResultsCount();
            
            // Show/hide appropriate panels
            if (_filteredManagers.Any())
            {
                ManagerDataGrid.Visibility = Visibility.Visible;
                NoResultsTextBlock.Visibility = Visibility.Collapsed;
            }
            else if (LoadingPanel.Visibility == Visibility.Collapsed)
            {
                ManagerDataGrid.Visibility = Visibility.Collapsed;
                NoResultsTextBlock.Visibility = Visibility.Visible;
            }
        }

        private void UpdateResultsCount()
        {
            var count = _filteredManagers?.Count ?? 0;
            ResultsCountTextBlock.Text = count == 1 ? "1 manager found" : $"{count} managers found";
        }

        private void ManagerDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            var selectedManager = ManagerDataGrid.SelectedItem as UserInfo;
            
            if (selectedManager != null)
            {
                SelectedManagerNameTextBlock.Text = selectedManager.DisplayName;
                SelectedManagerDetailsTextBlock.Text = $"{selectedManager.Title} • {selectedManager.Department} • {selectedManager.Email}";
                
                SelectedManagerPanel.Visibility = Visibility.Visible;
                SelectButton.IsEnabled = true;
            }
            else
            {
                SelectedManagerPanel.Visibility = Visibility.Collapsed;
                SelectButton.IsEnabled = false;
            }
        }

        private void ClearSelection_Click(object sender, RoutedEventArgs e)
        {
            ManagerDataGrid.SelectedItem = null;
            SelectedManagerPanel.Visibility = Visibility.Collapsed;
            SelectButton.IsEnabled = false;
        }

        private void SelectManager_Click(object sender, RoutedEventArgs e)
        {
            SelectedManager = ManagerDataGrid.SelectedItem as UserInfo;
            if (SelectedManager != null)
            {
                DialogResult = true;
                Close();
            }
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        protected override void OnClosed(EventArgs e)
        {
            _searchTimer?.Stop();
            base.OnClosed(e);
        }
    }
}
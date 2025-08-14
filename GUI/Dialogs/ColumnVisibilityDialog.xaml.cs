using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Windows;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Dialogs
{
    public partial class ColumnVisibilityDialog : Window, INotifyPropertyChanged
    {
        private readonly string _gridName;
        private List<ColumnDefinition> _columns;
        private string _windowTitle;

        public List<ColumnDefinition> Columns
        {
            get => _columns;
            set
            {
                _columns = value;
                OnPropertyChanged(nameof(Columns));
            }
        }

        public string WindowTitle
        {
            get => _windowTitle;
            set
            {
                _windowTitle = value;
                OnPropertyChanged(nameof(WindowTitle));
            }
        }

        public ColumnVisibilityDialog(string gridName)
        {
            InitializeComponent();
            
            _gridName = gridName;
            WindowTitle = $"Column Visibility - {gridName}";
            
            // Load columns from service
            Columns = ColumnVisibilityService.Instance.GetColumnsForGrid(gridName)
                .Select(c => new ColumnDefinition 
                { 
                    ColumnName = c.ColumnName, 
                    DisplayName = c.DisplayName, 
                    IsVisible = c.IsVisible 
                })
                .ToList();

            DataContext = this;
        }

        private void ApplyButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Update the service with new visibility settings
                foreach (var column in Columns)
                {
                    ColumnVisibilityService.Instance.UpdateColumnVisibility(_gridName, column.ColumnName, column.IsVisible);
                }

                DialogResult = true;
                Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error applying column settings: {ex.Message}", "Error", 
                               MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private void ShowAllButton_Click(object sender, RoutedEventArgs e)
        {
            foreach (var column in Columns)
            {
                column.IsVisible = true;
            }
        }

        private void HideAllButton_Click(object sender, RoutedEventArgs e)
        {
            // Keep the first column (usually Select or Name) visible
            for (int i = 1; i < Columns.Count; i++)
            {
                Columns[i].IsVisible = false;
            }
        }

        private void ResetButton_Click(object sender, RoutedEventArgs e)
        {
            foreach (var column in Columns)
            {
                column.IsVisible = true;
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
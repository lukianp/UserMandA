using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Controls;

namespace MandADiscoverySuite.Controls
{
    public partial class ColumnChooser : UserControl
    {
        public class ColumnInfo : INotifyPropertyChanged
        {
            private bool _isVisible;
            private string _header;
            private DataGridColumn _column;

            public string Header
            {
                get => _header;
                set
                {
                    _header = value;
                    OnPropertyChanged();
                }
            }

            public bool IsVisible
            {
                get => _isVisible;
                set
                {
                    _isVisible = value;
                    OnPropertyChanged();
                    UpdateColumnVisibility();
                }
            }

            public DataGridColumn Column
            {
                get => _column;
                set => _column = value;
            }

            private void UpdateColumnVisibility()
            {
                if (Column != null)
                {
                    Column.Visibility = IsVisible ? Visibility.Visible : Visibility.Collapsed;
                }
            }

            public event PropertyChangedEventHandler? PropertyChanged;

            protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
            {
                PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
            }
        }

        public ObservableCollection<ColumnInfo> Columns { get; set; }
        private DataGrid _targetDataGrid;

        public DataGrid TargetDataGrid
        {
            get => _targetDataGrid;
            set
            {
                _targetDataGrid = value;
                InitializeColumns();
            }
        }

        public ColumnChooser()
        {
#pragma warning disable CS0103 // The name 'InitializeComponent' does not exist in the current context
            InitializeComponent();
#pragma warning restore CS0103
            Columns = new ObservableCollection<ColumnInfo>();
#pragma warning disable CS0103 // The name 'ColumnsItemsControl' does not exist in the current context
            ColumnsItemsControl.ItemsSource = Columns;
#pragma warning restore CS0103
        }

        private void InitializeColumns()
        {
            if (_targetDataGrid == null)
                return;

            Columns.Clear();
            
            foreach (var column in _targetDataGrid.Columns)
            {
                var columnInfo = new ColumnInfo
                {
                    Header = column.Header?.ToString() ?? "Column",
                    IsVisible = column.Visibility == Visibility.Visible,
                    Column = column
                };
                
                Columns.Add(columnInfo);
            }
        }

        private void SelectAllButton_Click(object sender, RoutedEventArgs e)
        {
            foreach (var column in Columns)
            {
                column.IsVisible = true;
            }
        }

        private void DeselectAllButton_Click(object sender, RoutedEventArgs e)
        {
            foreach (var column in Columns)
            {
                column.IsVisible = false;
            }
        }

        private void ResetButton_Click(object sender, RoutedEventArgs e)
        {
            // Reset to default visibility (all visible)
            foreach (var column in Columns)
            {
                column.IsVisible = true;
            }
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            // Find parent window or popup and close it
            var parent = Window.GetWindow(this);
            if (parent != null)
            {
                parent.Close();
            }
        }
    }
}
using System;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for CustomizableDataGrid.xaml
    /// </summary>
    public partial class CustomizableDataGrid : UserControl
    {
        private CustomizableDataGridViewModel _viewModel;

        public CustomizableDataGrid()
        {
            InitializeComponent();
            _viewModel = new CustomizableDataGridViewModel();
            DataContext = _viewModel;
            
            // Initialize the data grid with columns
            _viewModel.InitializeDataGrid(MainDataGrid);
        }

        #region Event Handlers

        private void MainDataGrid_ColumnReordered(object sender, DataGridColumnEventArgs e)
        {
            try
            {
                _viewModel?.HandleColumnReordered(e.Column);
            }
            catch (Exception ex)
            {
                _viewModel?.LogError(ex, "Error handling column reordered event");
            }
        }

        private void MainDataGrid_ColumnResized(object sender, DataGridColumnEventArgs e)
        {
            try
            {
                _viewModel?.HandleColumnResized(e.Column);
            }
            catch (Exception ex)
            {
                _viewModel?.LogError(ex, "Error handling column resized event");
            }
        }

        private void MainDataGrid_Sorting(object sender, DataGridSortingEventArgs e)
        {
            try
            {
                _viewModel?.HandleColumnSorting(e.Column, e);
            }
            catch (Exception ex)
            {
                _viewModel?.LogError(ex, "Error handling column sorting event");
            }
        }

        #endregion

        #region Public Properties

        /// <summary>
        /// Gets the view model for the customizable data grid
        /// </summary>
        public CustomizableDataGridViewModel ViewModel => _viewModel;

        /// <summary>
        /// Gets the underlying DataGrid control
        /// </summary>
        public DataGrid DataGrid => MainDataGrid;

        #endregion

        #region Public Methods

        /// <summary>
        /// Sets the data source for the grid
        /// </summary>
        public void SetDataSource(System.Collections.IEnumerable dataSource)
        {
            _viewModel?.SetDataSource(dataSource);
        }

        /// <summary>
        /// Adds a custom column to the grid
        /// </summary>
        public void AddColumn(string propertyName, string header, double width = 100, bool isVisible = true)
        {
            _viewModel?.AddColumn(propertyName, header, width, isVisible);
        }

        /// <summary>
        /// Removes a column from the grid
        /// </summary>
        public void RemoveColumn(string propertyName)
        {
            _viewModel?.RemoveColumn(propertyName);
        }

        /// <summary>
        /// Shows or hides a column
        /// </summary>
        public void SetColumnVisibility(string propertyName, bool isVisible)
        {
            _viewModel?.SetColumnVisibility(propertyName, isVisible);
        }

        /// <summary>
        /// Saves the current column layout
        /// </summary>
        public void SaveLayout(string layoutName)
        {
            _viewModel?.SaveLayout(layoutName);
        }

        /// <summary>
        /// Loads a saved column layout
        /// </summary>
        public void LoadLayout(string layoutName)
        {
            _viewModel?.LoadLayout(layoutName);
        }

        /// <summary>
        /// Resets the grid to default layout
        /// </summary>
        public void ResetToDefault()
        {
            _viewModel?.ResetToDefault();
        }

        #endregion
    }
}
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows.Input;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the column chooser dialog
    /// </summary>
    public class ColumnChooserViewModel : BaseViewModel
    {
        private DataGridColumnConfiguration _configuration;
        private ObservableCollection<ColumnViewModel> _availableColumns;
        private ObservableCollection<ColumnViewModel> _visibleColumns;
        private ColumnViewModel _selectedAvailableColumn;
        private ColumnViewModel _selectedVisibleColumn;

        public ColumnChooserViewModel(DataGridColumnConfiguration configuration)
        {
            Configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            
            InitializeColumns();
            InitializeCommands();
        }

        #region Properties

        /// <summary>
        /// The column configuration being edited
        /// </summary>
        public DataGridColumnConfiguration Configuration
        {
            get => _configuration;
            set => SetProperty(ref _configuration, value);
        }

        /// <summary>
        /// Available columns (hidden)
        /// </summary>
        public ObservableCollection<ColumnViewModel> AvailableColumns
        {
            get => _availableColumns;
            set => SetProperty(ref _availableColumns, value);
        }

        /// <summary>
        /// Visible columns
        /// </summary>
        public ObservableCollection<ColumnViewModel> VisibleColumns
        {
            get => _visibleColumns;
            set => SetProperty(ref _visibleColumns, value);
        }

        /// <summary>
        /// Selected column in available list
        /// </summary>
        public ColumnViewModel SelectedAvailableColumn
        {
            get => _selectedAvailableColumn;
            set => SetProperty(ref _selectedAvailableColumn, value);
        }

        /// <summary>
        /// Selected column in visible list
        /// </summary>
        public ColumnViewModel SelectedVisibleColumn
        {
            get => _selectedVisibleColumn;
            set => SetProperty(ref _selectedVisibleColumn, value);
        }

        #endregion

        #region Commands

        public ICommand ShowColumnCommand { get; private set; }
        public ICommand HideColumnCommand { get; private set; }
        public ICommand MoveUpCommand { get; private set; }
        public ICommand MoveDownCommand { get; private set; }
        public ICommand ResetCommand { get; private set; }
        public ICommand ShowAllCommand { get; private set; }
        public ICommand HideAllCommand { get; private set; }
        public ICommand OkCommand { get; private set; }
        public ICommand CancelCommand { get; private set; }

        #endregion

        #region Events

        public event EventHandler<bool> CloseRequested;

        #endregion

        #region Private Methods

        private void InitializeColumns()
        {
            AvailableColumns = new ObservableCollection<ColumnViewModel>(
                Configuration.HiddenColumns);

            VisibleColumns = new ObservableCollection<ColumnViewModel>(
                Configuration.VisibleColumns);
        }

        protected override void InitializeCommands()
        {
            ShowColumnCommand = new RelayCommand(ShowColumn, CanShowColumn);
            HideColumnCommand = new RelayCommand(HideColumn, CanHideColumn);
            MoveUpCommand = new RelayCommand(MoveUp, CanMoveUp);
            MoveDownCommand = new RelayCommand(MoveDown, CanMoveDown);
            ResetCommand = new RelayCommand(Reset);
            ShowAllCommand = new RelayCommand(ShowAll, CanShowAll);
            HideAllCommand = new RelayCommand(HideAll, CanHideAll);
            OkCommand = new RelayCommand(Ok);
            CancelCommand = new RelayCommand(Cancel);
        }

        private bool CanShowColumn()
        {
            return SelectedAvailableColumn != null;
        }

        private void ShowColumn()
        {
            if (SelectedAvailableColumn != null)
            {
                var column = SelectedAvailableColumn;
                AvailableColumns.Remove(column);
                
                column.IsVisible = true;
                column.DisplayOrder = VisibleColumns.Count;
                
                VisibleColumns.Add(column);
                UpdateConfiguration();
            }
        }

        private bool CanHideColumn()
        {
            return SelectedVisibleColumn != null && VisibleColumns.Count > 1;
        }

        private void HideColumn()
        {
            if (SelectedVisibleColumn != null && VisibleColumns.Count > 1)
            {
                var column = SelectedVisibleColumn;
                VisibleColumns.Remove(column);
                
                column.IsVisible = false;
                
                AvailableColumns.Add(column);
                ReorderVisibleColumns();
                UpdateConfiguration();
            }
        }

        private bool CanMoveUp()
        {
            return SelectedVisibleColumn != null && VisibleColumns.IndexOf(SelectedVisibleColumn) > 0;
        }

        private void MoveUp()
        {
            if (CanMoveUp())
            {
                var currentIndex = VisibleColumns.IndexOf(SelectedVisibleColumn);
                var column = SelectedVisibleColumn;
                
                VisibleColumns.RemoveAt(currentIndex);
                VisibleColumns.Insert(currentIndex - 1, column);
                
                ReorderVisibleColumns();
                UpdateConfiguration();
            }
        }

        private bool CanMoveDown()
        {
            return SelectedVisibleColumn != null && 
                   VisibleColumns.IndexOf(SelectedVisibleColumn) < VisibleColumns.Count - 1;
        }

        private void MoveDown()
        {
            if (CanMoveDown())
            {
                var currentIndex = VisibleColumns.IndexOf(SelectedVisibleColumn);
                var column = SelectedVisibleColumn;
                
                VisibleColumns.RemoveAt(currentIndex);
                VisibleColumns.Insert(currentIndex + 1, column);
                
                ReorderVisibleColumns();
                UpdateConfiguration();
            }
        }

        private void Reset()
        {
            // Reset to original configuration
            InitializeColumns();
            UpdateConfiguration();
        }

        private bool CanShowAll()
        {
            return AvailableColumns.Count > 0;
        }

        private void ShowAll()
        {
            var columnsToMove = AvailableColumns.ToList();
            
            foreach (var column in columnsToMove)
            {
                AvailableColumns.Remove(column);
                column.IsVisible = true;
                column.DisplayOrder = VisibleColumns.Count;
                VisibleColumns.Add(column);
            }
            
            UpdateConfiguration();
        }

        private bool CanHideAll()
        {
            return VisibleColumns.Count > 1; // Keep at least one visible
        }

        private void HideAll()
        {
            var columnsToMove = VisibleColumns.Skip(1).ToList(); // Keep first column visible
            
            foreach (var column in columnsToMove)
            {
                VisibleColumns.Remove(column);
                column.IsVisible = false;
                AvailableColumns.Add(column);
            }
            
            ReorderVisibleColumns();
            UpdateConfiguration();
        }

        private void Ok()
        {
            CloseRequested?.Invoke(this, true);
        }

        private void Cancel()
        {
            CloseRequested?.Invoke(this, false);
        }

        private void ReorderVisibleColumns()
        {
            for (int i = 0; i < VisibleColumns.Count; i++)
            {
                VisibleColumns[i].DisplayOrder = i;
            }
        }

        private void UpdateConfiguration()
        {
            Configuration.Columns.Clear();
            
            // Add visible columns
            foreach (var column in VisibleColumns)
            {
                Configuration.Columns.Add(column);
            }
            
            // Add hidden columns
            foreach (var column in AvailableColumns)
            {
                Configuration.Columns.Add(column);
            }
            
            Configuration.ModifiedDate = DateTime.Now;
        }

        #endregion
    }
}
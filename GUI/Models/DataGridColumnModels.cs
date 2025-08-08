using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Windows;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Model representing a customizable DataGrid column
    /// </summary>
    public class ColumnViewModel : INotifyPropertyChanged
    {
        private string _header;
        private string _propertyName;
        private bool _isVisible = true;
        private bool _isSortable = true;
        private bool _isResizable = true;
        private double _width = double.NaN;
        private double _minWidth = 50;
        private double _maxWidth = double.PositiveInfinity;
        private int _displayOrder;
        private string _format;
        private ColumnType _columnType = ColumnType.Text;

        public event PropertyChangedEventHandler PropertyChanged;

        /// <summary>
        /// Column header text
        /// </summary>
        public string Header
        {
            get => _header;
            set => SetProperty(ref _header, value);
        }

        /// <summary>
        /// Property name to bind to
        /// </summary>
        public string PropertyName
        {
            get => _propertyName;
            set => SetProperty(ref _propertyName, value);
        }

        /// <summary>
        /// Whether the column is visible
        /// </summary>
        public bool IsVisible
        {
            get => _isVisible;
            set => SetProperty(ref _isVisible, value);
        }

        /// <summary>
        /// Whether the column is sortable
        /// </summary>
        public bool IsSortable
        {
            get => _isSortable;
            set => SetProperty(ref _isSortable, value);
        }

        /// <summary>
        /// Whether the column is resizable
        /// </summary>
        public bool IsResizable
        {
            get => _isResizable;
            set => SetProperty(ref _isResizable, value);
        }

        /// <summary>
        /// Column width
        /// </summary>
        public double Width
        {
            get => _width;
            set => SetProperty(ref _width, value);
        }

        /// <summary>
        /// Minimum column width
        /// </summary>
        public double MinWidth
        {
            get => _minWidth;
            set => SetProperty(ref _minWidth, value);
        }

        /// <summary>
        /// Maximum column width
        /// </summary>
        public double MaxWidth
        {
            get => _maxWidth;
            set => SetProperty(ref _maxWidth, value);
        }

        /// <summary>
        /// Display order of the column
        /// </summary>
        public int DisplayOrder
        {
            get => _displayOrder;
            set => SetProperty(ref _displayOrder, value);
        }

        /// <summary>
        /// Format string for the column data
        /// </summary>
        public string Format
        {
            get => _format;
            set => SetProperty(ref _format, value);
        }

        /// <summary>
        /// Type of the column
        /// </summary>
        public ColumnType ColumnType
        {
            get => _columnType;
            set => SetProperty(ref _columnType, value);
        }

        /// <summary>
        /// Gets the visibility for binding to DataGrid
        /// </summary>
        public Visibility Visibility => IsVisible ? Visibility.Visible : Visibility.Collapsed;

        /// <summary>
        /// Set property helper with PropertyChanged notification
        /// </summary>
        protected virtual bool SetProperty<T>(ref T field, T value, [System.Runtime.CompilerServices.CallerMemberName] string propertyName = null)
        {
            if (Equals(field, value)) return false;
            field = value;
            OnPropertyChanged(propertyName);
            
            // Notify Visibility change when IsVisible changes
            if (propertyName == nameof(IsVisible))
            {
                OnPropertyChanged(nameof(Visibility));
            }
            
            return true;
        }

        /// <summary>
        /// Raise PropertyChanged event
        /// </summary>
        protected virtual void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    /// <summary>
    /// Column type enumeration
    /// </summary>
    public enum ColumnType
    {
        Text,
        Number,
        Date,
        Boolean,
        Image,
        Button,
        Hyperlink,
        Progress,
        Custom
    }

    /// <summary>
    /// Column configuration for different views
    /// </summary>
    public class DataGridColumnConfiguration
    {
        public string ViewName { get; set; }
        public string ConfigurationName { get; set; }
        public bool IsDefault { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime ModifiedDate { get; set; } = DateTime.Now;
        public List<ColumnViewModel> Columns { get; set; } = new List<ColumnViewModel>();
        
        /// <summary>
        /// Gets visible columns ordered by DisplayOrder
        /// </summary>
        public IEnumerable<ColumnViewModel> VisibleColumns => 
            Columns.Where(c => c.IsVisible).OrderBy(c => c.DisplayOrder);
        
        /// <summary>
        /// Gets hidden columns ordered by Header
        /// </summary>
        public IEnumerable<ColumnViewModel> HiddenColumns => 
            Columns.Where(c => !c.IsVisible).OrderBy(c => c.Header);
    }
}
using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Optimized form panel using SharedSizeGroup for consistent layout
    /// </summary>
    public partial class OptimizedFormPanel : UserControl
    {
        private readonly GridLayoutOptimizationService _gridService;
        private readonly List<FormField> _fields = new();

        #region Dependency Properties

        public static readonly DependencyProperty FormLayoutTypeProperty =
            DependencyProperty.Register(nameof(FormLayoutType), typeof(FormLayoutType), typeof(OptimizedFormPanel),
                new PropertyMetadata(FormLayoutType.TwoColumn, OnFormLayoutTypeChanged));

        public static readonly DependencyProperty SizeGroupNameProperty =
            DependencyProperty.Register(nameof(SizeGroupName), typeof(string), typeof(OptimizedFormPanel),
                new PropertyMetadata("DefaultForm", OnSizeGroupNameChanged));

        public static readonly DependencyProperty IsOptimizedProperty =
            DependencyProperty.Register(nameof(IsOptimized), typeof(bool), typeof(OptimizedFormPanel),
                new PropertyMetadata(true, OnOptimizationChanged));

        #endregion

        #region Properties

        /// <summary>
        /// Gets or sets the form layout type
        /// </summary>
        public FormLayoutType FormLayoutType
        {
            get => (FormLayoutType)GetValue(FormLayoutTypeProperty);
            set => SetValue(FormLayoutTypeProperty, value);
        }

        /// <summary>
        /// Gets or sets the SharedSizeGroup name
        /// </summary>
        public string SizeGroupName
        {
            get => (string)GetValue(SizeGroupNameProperty);
            set => SetValue(SizeGroupNameProperty, value);
        }

        /// <summary>
        /// Gets or sets whether the form should be optimized
        /// </summary>
        public bool IsOptimized
        {
            get => (bool)GetValue(IsOptimizedProperty);
            set => SetValue(IsOptimizedProperty, value);
        }

        /// <summary>
        /// Gets the list of form fields
        /// </summary>
        public IReadOnlyList<FormField> Fields => _fields.AsReadOnly();

        #endregion

        public OptimizedFormPanel()
        {
            InitializeComponent();
            _gridService = ServiceLocator.GetService<GridLayoutOptimizationService>() ?? new GridLayoutOptimizationService();
            
            Loaded += OnLoaded;
        }

        #region Public Methods

        /// <summary>
        /// Adds a form field to the panel
        /// </summary>
        public void AddField(string label, UIElement control, UIElement actionControl = null)
        {
            var field = new FormField
            {
                Label = label,
                Control = control,
                ActionControl = actionControl
            };

            _fields.Add(field);
            CreateFieldUI(field);
        }

        /// <summary>
        /// Adds multiple form fields at once
        /// </summary>
        public void AddFields(params (string label, UIElement control, UIElement action)[] fields)
        {
            foreach (var (label, control, action) in fields)
            {
                AddField(label, control, action);
            }
        }

        /// <summary>
        /// Clears all form fields
        /// </summary>
        public void ClearFields()
        {
            _fields.Clear();
            FormContentPanel.Children.Clear();
        }

        /// <summary>
        /// Applies optimization to the form layout
        /// </summary>
        public void OptimizeLayout()
        {
            if (!IsOptimized) return;

            _gridService.RegisterGrid(MainGrid, SizeGroupName, GridSizeScope.Global);
            _gridService.ApplyFormLayoutPattern(MainGrid, FormLayoutType);
            _gridService.OptimizeGridPerformance(MainGrid);
        }

        /// <summary>
        /// Gets optimization statistics for this form
        /// </summary>
        public GridOptimizationStats GetOptimizationStats()
        {
            return _gridService.GetOptimizationStats();
        }

        #endregion

        #region Event Handlers

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            OptimizeLayout();
        }

        private static void OnFormLayoutTypeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is OptimizedFormPanel panel && panel.IsLoaded)
            {
                panel.UpdateFormLayout();
            }
        }

        private static void OnSizeGroupNameChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is OptimizedFormPanel panel && panel.IsLoaded)
            {
                panel.OptimizeLayout();
            }
        }

        private static void OnOptimizationChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is OptimizedFormPanel panel && panel.IsLoaded)
            {
                if ((bool)e.NewValue)
                {
                    panel.OptimizeLayout();
                }
            }
        }

        #endregion

        #region Private Methods

        private void CreateFieldUI(FormField field)
        {
            Grid fieldGrid;

            switch (FormLayoutType)
            {
                case FormLayoutType.TwoColumn:
                    fieldGrid = CreateTwoColumnField(field);
                    break;
                case FormLayoutType.ThreeColumn:
                    fieldGrid = CreateThreeColumnField(field);
                    break;
                case FormLayoutType.DataEntry:
                    fieldGrid = CreateDataEntryField(field);
                    break;
                default:
                    fieldGrid = CreateTwoColumnField(field);
                    break;
            }

            FormContentPanel.Children.Add(fieldGrid);
        }

        private Grid CreateTwoColumnField(FormField field)
        {
            var grid = new Grid { Margin = new Thickness(0, 4, 0, 0) };
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = GridLength.Auto, SharedSizeGroup = "FormLabel" });
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star), SharedSizeGroup = "FormInput" });

            // Label
            var label = new TextBlock
            {
                Text = field.Label,
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(0, 0, 16, 0),
                Style = FindResource("ModernTextStyle") as Style
            };
            Grid.SetColumn(label, 0);
            grid.Children.Add(label);

            // Control
            if (field.Control != null)
            {
                if (field.Control is FrameworkElement element)
                {
                    element.VerticalAlignment = VerticalAlignment.Center;
                }
                Grid.SetColumn(field.Control, 1);
                grid.Children.Add(field.Control);
            }

            return grid;
        }

        private Grid CreateThreeColumnField(FormField field)
        {
            var grid = new Grid { Margin = new Thickness(0, 4, 0, 0) };
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = GridLength.Auto, SharedSizeGroup = "FormLabel" });
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star), SharedSizeGroup = "FormInput" });
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = GridLength.Auto, SharedSizeGroup = "FormAction" });

            // Label
            var label = new TextBlock
            {
                Text = field.Label,
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(0, 0, 16, 0),
                Style = FindResource("ModernTextStyle") as Style
            };
            Grid.SetColumn(label, 0);
            grid.Children.Add(label);

            // Control
            if (field.Control != null)
            {
                if (field.Control is FrameworkElement element)
                {
                    element.VerticalAlignment = VerticalAlignment.Center;
                    element.Margin = new Thickness(0, 0, 8, 0);
                }
                Grid.SetColumn(field.Control, 1);
                grid.Children.Add(field.Control);
            }

            // Action Control
            if (field.ActionControl != null)
            {
                if (field.ActionControl is FrameworkElement actionElement)
                {
                    actionElement.VerticalAlignment = VerticalAlignment.Center;
                }
                Grid.SetColumn(field.ActionControl, 2);
                grid.Children.Add(field.ActionControl);
            }

            return grid;
        }

        private Grid CreateDataEntryField(FormField field)
        {
            var grid = new Grid { Margin = new Thickness(0, 4, 0, 0) };
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = GridLength.Auto, SharedSizeGroup = "DataLabel" });
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = new GridLength(1, GridUnitType.Star), SharedSizeGroup = "DataInput" });
            grid.ColumnDefinitions.Add(new System.Windows.Controls.ColumnDefinition { Width = GridLength.Auto, SharedSizeGroup = "DataValidation" });

            // Label
            var label = new TextBlock
            {
                Text = field.Label,
                VerticalAlignment = VerticalAlignment.Center,
                Margin = new Thickness(0, 0, 16, 0),
                Style = FindResource("ModernTextStyle") as Style
            };
            Grid.SetColumn(label, 0);
            grid.Children.Add(label);

            // Control
            if (field.Control != null)
            {
                if (field.Control is FrameworkElement element)
                {
                    element.VerticalAlignment = VerticalAlignment.Center;
                    element.Margin = new Thickness(0, 0, 8, 0);
                }
                Grid.SetColumn(field.Control, 1);
                grid.Children.Add(field.Control);
            }

            // Validation indicator (placeholder)
            var validationIcon = new TextBlock
            {
                Text = "✓",
                Foreground = System.Windows.Media.Brushes.Green,
                VerticalAlignment = VerticalAlignment.Center,
                Width = 20,
                TextAlignment = TextAlignment.Center
            };
            Grid.SetColumn(validationIcon, 2);
            grid.Children.Add(validationIcon);

            return grid;
        }

        private void UpdateFormLayout()
        {
            // Clear existing fields and recreate with new layout
            var existingFields = new List<FormField>(_fields);
            ClearFields();
            
            foreach (var field in existingFields)
            {
                CreateFieldUI(field);
            }

            OptimizeLayout();
        }

        #endregion
    }

    /// <summary>
    /// Represents a form field with label, control, and optional action
    /// </summary>
    public class FormField
    {
        public string Label { get; set; }
        public UIElement Control { get; set; }
        public UIElement ActionControl { get; set; }

        public override string ToString()
        {
            return $"FormField: {Label}";
        }
    }
}
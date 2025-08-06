using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Control for displaying empty state placeholders with customizable messages and actions
    /// </summary>
    public partial class EmptyStateControl : UserControl
    {
        public EmptyStateControl()
        {
            InitializeComponent();
        }

        #region Dependency Properties

        public static readonly DependencyProperty TitleProperty =
            DependencyProperty.Register(nameof(Title), typeof(string), typeof(EmptyStateControl),
                new PropertyMetadata("No Data Available", OnTitleChanged));

        public static readonly DependencyProperty DescriptionProperty =
            DependencyProperty.Register(nameof(Description), typeof(string), typeof(EmptyStateControl),
                new PropertyMetadata("Start by running a discovery module to populate this view with data.", OnDescriptionChanged));

        public static readonly DependencyProperty IconDataProperty =
            DependencyProperty.Register(nameof(IconData), typeof(Geometry), typeof(EmptyStateControl),
                new PropertyMetadata(null, OnIconDataChanged));

        public static readonly DependencyProperty ShowActionButtonProperty =
            DependencyProperty.Register(nameof(ShowActionButton), typeof(bool), typeof(EmptyStateControl),
                new PropertyMetadata(false, OnShowActionButtonChanged));

        public static readonly DependencyProperty ActionButtonTextProperty =
            DependencyProperty.Register(nameof(ActionButtonText), typeof(string), typeof(EmptyStateControl),
                new PropertyMetadata("Run Discovery", OnActionButtonTextChanged));

        public static readonly DependencyProperty ActionCommandProperty =
            DependencyProperty.Register(nameof(ActionCommand), typeof(System.Windows.Input.ICommand), typeof(EmptyStateControl));

        public static readonly DependencyProperty IsLoadingProperty =
            DependencyProperty.Register(nameof(IsLoading), typeof(bool), typeof(EmptyStateControl),
                new PropertyMetadata(false, OnIsLoadingChanged));

        #endregion

        #region Properties

        public string Title
        {
            get => (string)GetValue(TitleProperty);
            set => SetValue(TitleProperty, value);
        }

        public string Description
        {
            get => (string)GetValue(DescriptionProperty);
            set => SetValue(DescriptionProperty, value);
        }

        public Geometry IconData
        {
            get => (Geometry)GetValue(IconDataProperty);
            set => SetValue(IconDataProperty, value);
        }

        public bool ShowActionButton
        {
            get => (bool)GetValue(ShowActionButtonProperty);
            set => SetValue(ShowActionButtonProperty, value);
        }

        public string ActionButtonText
        {
            get => (string)GetValue(ActionButtonTextProperty);
            set => SetValue(ActionButtonTextProperty, value);
        }

        public System.Windows.Input.ICommand ActionCommand
        {
            get => (System.Windows.Input.ICommand)GetValue(ActionCommandProperty);
            set => SetValue(ActionCommandProperty, value);
        }

        public bool IsLoading
        {
            get => (bool)GetValue(IsLoadingProperty);
            set => SetValue(IsLoadingProperty, value);
        }

        #endregion

        #region Property Changed Handlers

        private static void OnTitleChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is EmptyStateControl control)
            {
                control.TitleText.Text = e.NewValue as string ?? "";
            }
        }

        private static void OnDescriptionChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is EmptyStateControl control)
            {
                control.DescriptionText.Text = e.NewValue as string ?? "";
            }
        }

        private static void OnIconDataChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is EmptyStateControl control && e.NewValue is Geometry geometry)
            {
                control.IconPath.Data = geometry;
            }
        }

        private static void OnShowActionButtonChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is EmptyStateControl control)
            {
                control.ActionButton.Visibility = (bool)e.NewValue ? Visibility.Visible : Visibility.Collapsed;
            }
        }

        private static void OnActionButtonTextChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is EmptyStateControl control)
            {
                control.ActionButton.Content = e.NewValue as string ?? "";
            }
        }

        private static void OnIsLoadingChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is EmptyStateControl control)
            {
                control.LoadingOverlay.Visibility = (bool)e.NewValue ? Visibility.Visible : Visibility.Collapsed;
            }
        }

        #endregion

        #region Pre-defined States

        public void SetUserEmptyState()
        {
            Title = "No Users Found";
            Description = "Run the Active Directory or Azure AD discovery module to import user data.";
            IconData = Geometry.Parse("M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z");
        }

        public void SetInfrastructureEmptyState()
        {
            Title = "No Infrastructure Data";
            Description = "Discover your network infrastructure by running the Infrastructure Discovery module.";
            IconData = Geometry.Parse("M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z");
        }

        public void SetGroupEmptyState()
        {
            Title = "No Groups Available";
            Description = "Import group data from Active Directory or Azure AD to see group information.";
            IconData = Geometry.Parse("M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z");
        }

        public void SetSearchEmptyState()
        {
            Title = "No Results Found";
            Description = "Try adjusting your search criteria or clearing filters to see more results.";
            IconData = Geometry.Parse("M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z");
        }

        #endregion
    }
}
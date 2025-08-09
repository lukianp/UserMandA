using System;
using System.Windows;
using System.Windows.Controls;

namespace MandADiscoverySuite.Controls
{
    public partial class LoadingOverlay : UserControl
    {
        public static readonly DependencyProperty IsLoadingProperty =
            DependencyProperty.Register("IsLoading", typeof(bool), typeof(LoadingOverlay), 
                new PropertyMetadata(false));

        public static readonly DependencyProperty LoadingMessageProperty =
            DependencyProperty.Register("LoadingMessage", typeof(string), typeof(LoadingOverlay), 
                new PropertyMetadata("Loading..."));

        public static readonly DependencyProperty LoadingProgressProperty =
            DependencyProperty.Register("LoadingProgress", typeof(double), typeof(LoadingOverlay), 
                new PropertyMetadata(0.0));

        public static readonly DependencyProperty ShowProgressProperty =
            DependencyProperty.Register("ShowProgress", typeof(bool), typeof(LoadingOverlay), 
                new PropertyMetadata(false));

        public static readonly DependencyProperty ShowCancelButtonProperty =
            DependencyProperty.Register("ShowCancelButton", typeof(bool), typeof(LoadingOverlay), 
                new PropertyMetadata(false));

        public bool IsLoading
        {
            get { return (bool)GetValue(IsLoadingProperty); }
            set { SetValue(IsLoadingProperty, value); }
        }

        public string LoadingMessage
        {
            get { return (string)GetValue(LoadingMessageProperty); }
            set { SetValue(LoadingMessageProperty, value); }
        }

        public double LoadingProgress
        {
            get { return (double)GetValue(LoadingProgressProperty); }
            set { SetValue(LoadingProgressProperty, value); }
        }

        public bool ShowProgress
        {
            get { return (bool)GetValue(ShowProgressProperty); }
            set { SetValue(ShowProgressProperty, value); }
        }

        public bool ShowCancelButton
        {
            get { return (bool)GetValue(ShowCancelButtonProperty); }
            set { SetValue(ShowCancelButtonProperty, value); }
        }

        public event EventHandler CancelRequested;

        public LoadingOverlay()
        {
            InitializeComponent();
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            CancelRequested?.Invoke(this, EventArgs.Empty);
        }

        public void Show(string message = "Loading...", bool showProgress = false, bool showCancel = false)
        {
            LoadingMessage = message;
            ShowProgress = showProgress;
            ShowCancelButton = showCancel;
            IsLoading = true;
        }

        public void Hide()
        {
            IsLoading = false;
        }

        public void UpdateProgress(double progress, string message = null)
        {
            LoadingProgress = progress;
            if (!string.IsNullOrEmpty(message))
            {
                LoadingMessage = message;
            }
        }
    }
}
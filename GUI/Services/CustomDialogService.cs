using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for showing custom-styled dialog windows
    /// </summary>
    public class CustomDialogService
    {
        /// <summary>
        /// Shows a custom message dialog
        /// </summary>
        public static Task<MessageBoxResult> ShowMessageAsync(
            string title, 
            string message, 
            MessageBoxButton buttons = MessageBoxButton.OK,
            MessageDialogIcon icon = MessageDialogIcon.Information,
            Window owner = null)
        {
            return Application.Current.Dispatcher.InvokeAsync(() =>
            {
                var dialog = new CustomMessageDialog
                {
                    Title = title,
                    Message = message,
                    Icon = icon,
                    Buttons = buttons,
                    Owner = owner ?? Application.Current.MainWindow,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner
                };

                return dialog.ShowDialog() == true ? MessageBoxResult.Yes : MessageBoxResult.No;
            }).Task;
        }

        /// <summary>
        /// Shows a custom confirmation dialog
        /// </summary>
        public static Task<bool> ShowConfirmationAsync(
            string title,
            string message,
            string confirmText = "Confirm",
            string cancelText = "Cancel",
            Window owner = null)
        {
            return Application.Current.Dispatcher.InvokeAsync(() =>
            {
                var dialog = new CustomConfirmationDialog
                {
                    Title = title,
                    Message = message,
                    ConfirmText = confirmText,
                    CancelText = cancelText,
                    Owner = owner ?? Application.Current.MainWindow,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner
                };

                return dialog.ShowDialog() == true;
            }).Task;
        }

        /// <summary>
        /// Shows a custom input dialog
        /// </summary>
        public static Task<string> ShowInputAsync(
            string title,
            string message,
            string defaultValue = "",
            Window owner = null)
        {
            return Application.Current.Dispatcher.InvokeAsync(() =>
            {
                var dialog = new CustomInputDialog
                {
                    Title = title,
                    Message = message,
                    InputValue = defaultValue,
                    Owner = owner ?? Application.Current.MainWindow,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner
                };

                return dialog.ShowDialog() == true ? dialog.InputValue : null;
            }).Task;
        }

        /// <summary>
        /// Shows a custom progress dialog
        /// </summary>
        public static CustomProgressDialog ShowProgress(
            string title,
            string message = "Please wait...",
            bool cancellable = false,
            Window owner = null)
        {
            var dialog = new CustomProgressDialog
            {
                Title = title,
                Message = message,
                IsCancellable = cancellable,
                Owner = owner ?? Application.Current.MainWindow,
                WindowStartupLocation = WindowStartupLocation.CenterOwner
            };

            dialog.Show();
            return dialog;
        }

        /// <summary>
        /// Shows a custom error dialog with detailed information
        /// </summary>
        public static Task ShowErrorAsync(
            string title,
            string message,
            Exception exception = null,
            Window owner = null)
        {
            return Application.Current.Dispatcher.InvokeAsync(() =>
            {
                var dialog = new CustomErrorDialog
                {
                    Title = title,
                    Message = message,
                    Exception = exception,
                    Owner = owner ?? Application.Current.MainWindow,
                    WindowStartupLocation = WindowStartupLocation.CenterOwner
                };

                dialog.ShowDialog();
            }).Task;
        }
    }

    /// <summary>
    /// Icons for message dialogs
    /// </summary>
    public enum MessageDialogIcon
    {
        None,
        Information,
        Warning,
        Error,
        Question,
        Success
    }

    /// <summary>
    /// Base class for custom dialogs
    /// </summary>
    public abstract class CustomDialogBase : Window
    {
        protected CustomDialogBase()
        {
            InitializeDialog();
        }

        private void InitializeDialog()
        {
            // Set common properties
            WindowStyle = WindowStyle.None;
            AllowsTransparency = true;
            Background = Brushes.Transparent;
            ResizeMode = ResizeMode.NoResize;
            ShowInTaskbar = false;
            
            // Set styling
            Resources.MergedDictionaries.Add(new ResourceDictionary
            {
                Source = new Uri("pack://application:,,,/MandADiscoverySuite;component/Styles/CustomDialogStyles.xaml")
            });
            
            Style = (Style)FindResource("CustomDialogWindowStyle");
        }
    }

    /// <summary>
    /// Custom message dialog implementation
    /// </summary>
    public class CustomMessageDialog : CustomDialogBase
    {
        public string Message { get; set; }
        public new MessageDialogIcon Icon { get; set; }
        public MessageBoxButton Buttons { get; set; }
        
        public CustomMessageDialog()
        {
            InitializeComponent();
        }
        
        private void InitializeComponent()
        {
            Width = 450;
            Height = 200;
            Content = CreateContent();
        }
        
        private object CreateContent()
        {
            // Implementation would create the visual content
            // This is a simplified version - full implementation would create proper WPF controls
            return new TextBlock { Text = Message ?? "Dialog message" };
        }
    }

    /// <summary>
    /// Custom confirmation dialog implementation
    /// </summary>
    public class CustomConfirmationDialog : CustomDialogBase
    {
        public string Message { get; set; }
        public string ConfirmText { get; set; } = "Confirm";
        public string CancelText { get; set; } = "Cancel";
        
        public CustomConfirmationDialog()
        {
            InitializeComponent();
        }
        
        private void InitializeComponent()
        {
            Width = 400;
            Height = 180;
            Content = CreateContent();
        }
        
        private object CreateContent()
        {
            // Implementation would create the visual content with confirm/cancel buttons
            return new TextBlock { Text = Message ?? "Confirmation message" };
        }
    }

    /// <summary>
    /// Custom input dialog implementation
    /// </summary>
    public class CustomInputDialog : CustomDialogBase
    {
        public string Message { get; set; }
        public string InputValue { get; set; }
        
        public CustomInputDialog()
        {
            InitializeComponent();
        }
        
        private void InitializeComponent()
        {
            Width = 400;
            Height = 200;
            Content = CreateContent();
        }
        
        private object CreateContent()
        {
            // Implementation would create the visual content with text input
            return new TextBox { Text = InputValue ?? "" };
        }
    }

    /// <summary>
    /// Custom progress dialog implementation
    /// </summary>
    public class CustomProgressDialog : CustomDialogBase
    {
        public string Message { get; set; }
        public bool IsCancellable { get; set; }
        public double Progress { get; set; }
        
        public CustomProgressDialog()
        {
            InitializeComponent();
        }
        
        private void InitializeComponent()
        {
            Width = 400;
            Height = 150;
            Content = CreateContent();
        }
        
        private object CreateContent()
        {
            // Implementation would create the visual content with progress bar
            return new ProgressBar { Value = Progress };
        }
        
        public void UpdateProgress(double value, string message = null)
        {
            Progress = value;
            if (!string.IsNullOrEmpty(message))
                Message = message;
            
            // Update UI elements
        }
    }

    /// <summary>
    /// Custom error dialog implementation
    /// </summary>
    public class CustomErrorDialog : CustomDialogBase
    {
        public string Message { get; set; }
        public Exception Exception { get; set; }
        
        public CustomErrorDialog()
        {
            InitializeComponent();
        }
        
        private void InitializeComponent()
        {
            Width = 500;
            Height = 300;
            Content = CreateContent();
        }
        
        private object CreateContent()
        {
            // Implementation would create the visual content with error details
            return new TextBlock { Text = Message ?? "An error occurred" };
        }
    }
}
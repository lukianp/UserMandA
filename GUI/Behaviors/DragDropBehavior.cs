using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Behaviors
{
    /// <summary>
    /// Behavior for handling drag-and-drop operations in MVVM pattern
    /// </summary>
    public static class DragDropBehavior
    {
        #region Attached Properties

        /// <summary>
        /// Enables drag-drop functionality on the target element
        /// </summary>
        public static readonly DependencyProperty IsEnabledProperty =
            DependencyProperty.RegisterAttached(
                "IsEnabled",
                typeof(bool),
                typeof(DragDropBehavior),
                new PropertyMetadata(false, OnIsEnabledChanged));

        /// <summary>
        /// Command to execute when files are dropped
        /// </summary>
        public static readonly DependencyProperty DropCommandProperty =
            DependencyProperty.RegisterAttached(
                "DropCommand",
                typeof(ICommand),
                typeof(DragDropBehavior),
                new PropertyMetadata(null));

        /// <summary>
        /// Allowed file extensions (comma-separated)
        /// </summary>
        public static readonly DependencyProperty AllowedExtensionsProperty =
            DependencyProperty.RegisterAttached(
                "AllowedExtensions",
                typeof(string),
                typeof(DragDropBehavior),
                new PropertyMetadata(".json"));

        /// <summary>
        /// Drop zone text to display
        /// </summary>
        public static readonly DependencyProperty DropZoneTextProperty =
            DependencyProperty.RegisterAttached(
                "DropZoneText",
                typeof(string),
                typeof(DragDropBehavior),
                new PropertyMetadata("Drop profile files here"));

        /// <summary>
        /// Whether to show visual feedback during drag operations
        /// </summary>
        public static readonly DependencyProperty ShowVisualFeedbackProperty =
            DependencyProperty.RegisterAttached(
                "ShowVisualFeedback",
                typeof(bool),
                typeof(DragDropBehavior),
                new PropertyMetadata(true));

        #endregion

        #region Property Accessors

        public static bool GetIsEnabled(DependencyObject obj)
        {
            return (bool)obj.GetValue(IsEnabledProperty);
        }

        public static void SetIsEnabled(DependencyObject obj, bool value)
        {
            obj.SetValue(IsEnabledProperty, value);
        }

        public static ICommand GetDropCommand(DependencyObject obj)
        {
            return (ICommand)obj.GetValue(DropCommandProperty);
        }

        public static void SetDropCommand(DependencyObject obj, ICommand value)
        {
            obj.SetValue(DropCommandProperty, value);
        }

        public static string GetAllowedExtensions(DependencyObject obj)
        {
            return (string)obj.GetValue(AllowedExtensionsProperty);
        }

        public static void SetAllowedExtensions(DependencyObject obj, string value)
        {
            obj.SetValue(AllowedExtensionsProperty, value);
        }

        public static string GetDropZoneText(DependencyObject obj)
        {
            return (string)obj.GetValue(DropZoneTextProperty);
        }

        public static void SetDropZoneText(DependencyObject obj, string value)
        {
            obj.SetValue(DropZoneTextProperty, value);
        }

        public static bool GetShowVisualFeedback(DependencyObject obj)
        {
            return (bool)obj.GetValue(ShowVisualFeedbackProperty);
        }

        public static void SetShowVisualFeedback(DependencyObject obj, bool value)
        {
            obj.SetValue(ShowVisualFeedbackProperty, value);
        }

        #endregion

        #region Event Handlers

        private static void OnIsEnabledChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is FrameworkElement element)
            {
                if ((bool)e.NewValue)
                {
                    element.AllowDrop = true;
                    element.DragEnter += OnDragEnter;
                    element.DragOver += OnDragOver;
                    element.DragLeave += OnDragLeave;
                    element.Drop += OnDrop;
                }
                else
                {
                    element.AllowDrop = false;
                    element.DragEnter -= OnDragEnter;
                    element.DragOver -= OnDragOver;
                    element.DragLeave -= OnDragLeave;
                    element.Drop -= OnDrop;
                }
            }
        }

        private static void OnDragEnter(object sender, DragEventArgs e)
        {
            HandleDragEvent(sender as FrameworkElement, e, true);
        }

        private static void OnDragOver(object sender, DragEventArgs e)
        {
            HandleDragEvent(sender as FrameworkElement, e, false);
        }

        private static void OnDragLeave(object sender, DragEventArgs e)
        {
            if (sender is FrameworkElement element && GetShowVisualFeedback(element))
            {
                // Remove visual feedback
                element.Opacity = 1.0;
                RemoveDropZoneOverlay(element);
            }
        }

        private static async void OnDrop(object sender, DragEventArgs e)
        {
            if (sender is FrameworkElement element)
            {
                try
                {
                    // Remove visual feedback
                    if (GetShowVisualFeedback(element))
                    {
                        element.Opacity = 1.0;
                        RemoveDropZoneOverlay(element);
                    }

                    // Get dropped files
                    if (e.Data.GetDataPresent(DataFormats.FileDrop))
                    {
                        var files = (string[])e.Data.GetData(DataFormats.FileDrop);
                        var allowedExtensions = GetAllowedExtensions(element)?.Split(',') ?? new[] { ".json" };
                        
                        // Filter files by allowed extensions
                        var validFiles = files.Where(f => 
                            allowedExtensions.Any(ext => 
                                Path.GetExtension(f).Equals(ext.Trim(), StringComparison.OrdinalIgnoreCase)))
                            .ToArray();

                        if (validFiles.Any())
                        {
                            // Execute drop command
                            var command = GetDropCommand(element);
                            if (command != null)
                            {
                                if (command.CanExecute(validFiles))
                                {
                                    command.Execute(validFiles);
                                }
                            }
                            else
                            {
                                // Fallback: Try to find MainViewModel and call HandleDropAsync
                                if (element.DataContext is MainViewModel viewModel)
                                {
                                    await viewModel.HandleDropAsync(validFiles);
                                }
                            }
                        }
                    }

                    e.Handled = true;
                }
                catch (Exception ex)
                {
                    // Handle error - could show message or log
                    MessageBox.Show($"Drop operation failed: {ex.Message}", "Error", 
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        #endregion

        #region Helper Methods

        private static void HandleDragEvent(FrameworkElement element, DragEventArgs e, bool isEnter)
        {
            if (element == null) return;

            // Check if we have files
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                var files = (string[])e.Data.GetData(DataFormats.FileDrop);
                var allowedExtensions = GetAllowedExtensions(element)?.Split(',') ?? new[] { ".json" };
                
                // Check if any files have allowed extensions
                var hasValidFiles = files.Any(f => 
                    allowedExtensions.Any(ext => 
                        Path.GetExtension(f).Equals(ext.Trim(), StringComparison.OrdinalIgnoreCase)));

                if (hasValidFiles)
                {
                    e.Effects = DragDropEffects.Copy;
                    
                    // Show visual feedback
                    if (GetShowVisualFeedback(element) && isEnter)
                    {
                        ShowDropZoneOverlay(element);
                        element.Opacity = 0.8;
                    }
                }
                else
                {
                    e.Effects = DragDropEffects.None;
                }
            }
            else
            {
                e.Effects = DragDropEffects.None;
            }

            e.Handled = true;
        }

        private static void ShowDropZoneOverlay(FrameworkElement element)
        {
            // Create visual overlay to indicate drop zone
            // This is a simple implementation - could be enhanced with custom styling
            var dropZoneText = GetDropZoneText(element);
            element.ToolTip = dropZoneText;
        }

        private static void RemoveDropZoneOverlay(FrameworkElement element)
        {
            element.ToolTip = null;
        }

        #endregion
    }

    /// <summary>
    /// Command for handling drag-drop operations asynchronously
    /// </summary>
    public class AsyncDropCommand : ICommand
    {
        private readonly Func<string[], Task> _execute;
        private readonly Func<string[], bool> _canExecute;
        private bool _isExecuting;

        public AsyncDropCommand(Func<string[], Task> execute, Func<string[], bool> canExecute = null)
        {
            _execute = execute ?? throw new ArgumentNullException(nameof(execute));
            _canExecute = canExecute;
        }

        public event EventHandler CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }

        public bool CanExecute(object parameter)
        {
            if (_isExecuting) return false;
            
            if (parameter is string[] files)
            {
                return _canExecute?.Invoke(files) ?? true;
            }
            
            return false;
        }

        public async void Execute(object parameter)
        {
            if (parameter is string[] files && CanExecute(parameter))
            {
                _isExecuting = true;
                CommandManager.InvalidateRequerySuggested();

                try
                {
                    await _execute(files);
                }
                finally
                {
                    _isExecuting = false;
                    CommandManager.InvalidateRequerySuggested();
                }
            }
        }
    }
}
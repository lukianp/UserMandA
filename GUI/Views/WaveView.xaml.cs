using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// ShareGate-inspired Wave Management view with drag-and-drop functionality
    /// </summary>
    public partial class WaveView : UserControl
    {
        private bool _isDragging = false;
        private User _draggedUser = null;
        
        public WaveView()
        {
            InitializeComponent();
            
            // Create dependencies using the unified pattern
            var loggerFactory = LoggerFactory.Create(builder => builder.AddDebug());
            var vmLogger = loggerFactory.CreateLogger<WaveViewModel>();
            
            // Create project dependency
            var project = new Models.MigrationProject();
            
            // Create and set ViewModel
            var vm = new WaveViewModel(project, vmLogger);
            DataContext = vm;
            
            // Load data when view loads
            Loaded += async (_, __) => await vm.LoadAsync();
        }
        
        #region Drag and Drop Event Handlers
        
        /// <summary>
        /// Handles mouse down on user cards to initiate drag operation
        /// </summary>
        private void OnUserCardMouseDown(object sender, MouseButtonEventArgs e)
        {
            try
            {
                if (e.LeftButton == MouseButtonState.Pressed && sender is FrameworkElement element)
                {
                    _draggedUser = element.Tag as User;
                    if (_draggedUser != null)
                    {
                        _isDragging = true;
                        
                        // Create drag data
                        var dragData = new DataObject("User", _draggedUser);
                        
                        // Start drag operation
                        DragDrop.DoDragDrop(element, dragData, DragDropEffects.Move);
                        
                        _isDragging = false;
                        _draggedUser = null;
                    }
                }
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in OnUserCardMouseDown: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Handles drag over events to provide visual feedback
        /// </summary>
        private void OnDragOver(object sender, DragEventArgs e)
        {
            try
            {
                if (e.Data.GetDataPresent("User"))
                {
                    e.Effects = DragDropEffects.Move;
                    
                    // Add visual feedback
                    if (sender is Border border)
                    {
                        border.Tag = "DragOver";
                        border.Opacity = 0.8;
                    }
                }
                else
                {
                    e.Effects = DragDropEffects.None;
                }
                
                e.Handled = true;
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in OnDragOver: {ex.Message}");
                e.Effects = DragDropEffects.None;
            }
        }
        
        /// <summary>
        /// Handles drag leave events to remove visual feedback
        /// </summary>
        private void OnDragLeave(object sender, DragEventArgs e)
        {
            try
            {
                if (sender is Border border)
                {
                    border.Tag = null;
                    border.Opacity = 1.0;
                }
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in OnDragLeave: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Handles drop events for assigning users to waves
        /// </summary>
        private void OnAssignedUsersDrop(object sender, DragEventArgs e)
        {
            try
            {
                if (e.Data.GetDataPresent("User") && sender is Border border)
                {
                    var droppedUser = e.Data.GetData("User") as User;
                    if (droppedUser != null && DataContext is WaveViewModel viewModel)
                    {
                        // Add user to the selected wave
                        if (viewModel.AddUserToWaveCommand?.CanExecute(droppedUser) == true)
                        {
                            viewModel.AddUserToWaveCommand.Execute(droppedUser);
                            
                            // Log the action
                            System.Diagnostics.Debug.WriteLine($"User {droppedUser.Name} assigned to {viewModel.SelectedWave?.Name}");
                        }
                    }
                    
                    // Remove visual feedback
                    border.Tag = null;
                    border.Opacity = 1.0;
                }
                
                e.Handled = true;
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in OnAssignedUsersDrop: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Handles drop events for removing users from waves (back to available pool)
        /// </summary>
        private void OnAvailableUsersDrop(object sender, DragEventArgs e)
        {
            try
            {
                if (e.Data.GetDataPresent("User") && sender is Border border)
                {
                    var droppedUser = e.Data.GetData("User") as User;
                    if (droppedUser != null && DataContext is WaveViewModel viewModel)
                    {
                        // Remove user from the selected wave (if they're assigned)
                        if (viewModel.RemoveUserFromWaveCommand?.CanExecute(droppedUser) == true)
                        {
                            viewModel.RemoveUserFromWaveCommand.Execute(droppedUser);
                            
                            // Log the action
                            System.Diagnostics.Debug.WriteLine($"User {droppedUser.Name} removed from {viewModel.SelectedWave?.Name}");
                        }
                    }
                    
                    // Remove visual feedback
                    border.Tag = null;
                    border.Opacity = 1.0;
                }
                
                e.Handled = true;
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in OnAvailableUsersDrop: {ex.Message}");
            }
        }
        
        #endregion
        
        #region Helper Methods
        
        /// <summary>
        /// Gets the WaveViewModel from the DataContext
        /// </summary>
        private WaveViewModel GetViewModel()
        {
            return DataContext as WaveViewModel;
        }
        
        /// <summary>
        /// Provides visual feedback for drag operations
        /// </summary>
        private void SetDragFeedback(FrameworkElement element, bool isDragTarget)
        {
            try
            {
                if (element != null)
                {
                    element.Opacity = isDragTarget ? 0.7 : 1.0;
                }
            }
            catch (System.Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error in SetDragFeedback: {ex.Message}");
            }
        }
        
        #endregion
    }
}
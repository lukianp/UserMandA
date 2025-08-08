using System.ComponentModel;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for ScriptEditorView.xaml
    /// </summary>
    public partial class ScriptEditorView : UserControl
    {
        public ScriptEditorView()
        {
            InitializeComponent();
            
            // Handle data context changes to wire up events
            DataContextChanged += OnDataContextChanged;
            
            // Set up keyboard shortcuts for the text editor
            ScriptEditor.KeyDown += OnScriptEditorKeyDown;
        }

        private void OnDataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            // Wire up property change notifications when data context changes
            if (e.OldValue is ScriptEditorViewModel oldViewModel)
            {
                oldViewModel.PropertyChanged -= OnViewModelPropertyChanged;
            }
            
            if (e.NewValue is ScriptEditorViewModel newViewModel)
            {
                newViewModel.PropertyChanged += OnViewModelPropertyChanged;
                
                // Initialize the editor with the current script text
                if (!string.IsNullOrEmpty(newViewModel.ScriptText))
                {
                    ScriptEditor.Text = newViewModel.ScriptText;
                }
            }
        }

        private void OnViewModelPropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(ScriptEditorViewModel.ScriptText))
            {
                var viewModel = sender as ScriptEditorViewModel;
                if (viewModel != null && ScriptEditor.Text != viewModel.ScriptText)
                {
                    ScriptEditor.Text = viewModel.ScriptText ?? string.Empty;
                }
            }
        }

        private async void OnScriptEditorKeyDown(object sender, KeyEventArgs e)
        {
            var viewModel = DataContext as ScriptEditorViewModel;
            if (viewModel == null) return;

            // Handle keyboard shortcuts
            if (e.KeyboardDevice.Modifiers == ModifierKeys.Control)
            {
                switch (e.Key)
                {
                    case Key.N: // New
                        if (viewModel.NewFileCommand.CanExecute(null))
                        {
                            viewModel.NewFileCommand.Execute(null);
                            e.Handled = true;
                        }
                        break;
                        
                    case Key.O: // Open
                        if (viewModel.OpenFileCommand.CanExecute(null))
                        {
                            await System.Threading.Tasks.Task.Run(() => viewModel.OpenFileCommand.Execute(null));
                            e.Handled = true;
                        }
                        break;
                        
                    case Key.S: // Save
                        if (viewModel.SaveFileCommand.CanExecute(null))
                        {
                            await System.Threading.Tasks.Task.Run(() => viewModel.SaveFileCommand.Execute(null));
                            e.Handled = true;
                        }
                        break;
                }
            }
            else if (e.Key == Key.F5) // Execute
            {
                if (viewModel.ExecuteScriptCommand.CanExecute(null))
                {
                    await System.Threading.Tasks.Task.Run(() => viewModel.ExecuteScriptCommand.Execute(null));
                    e.Handled = true;
                }
            }
        }
    }
}
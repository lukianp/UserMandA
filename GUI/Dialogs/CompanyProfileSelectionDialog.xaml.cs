using System;
using System.Windows;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Dialogs
{
    public partial class CompanyProfileSelectionDialog : Window
    {
        private CompanyProfileSelectionViewModel _viewModel;

        public string SelectedProfileName { get; private set; } = "";
        public bool ProfileSelected { get; private set; } = false;

        public CompanyProfileSelectionDialog()
        {
            InitializeComponent();
            
            _viewModel = new CompanyProfileSelectionViewModel();
            DataContext = _viewModel;
            
            // Subscribe to ViewModel events
            _viewModel.ProfileSelected += OnProfileSelected;
            _viewModel.DialogClosed += OnDialogClosed;
            _viewModel.PropertyChanged += OnViewModelPropertyChanged;
            
            // Initialize button text
            UpdateActionButtonText();
        }
        
        private void OnViewModelPropertyChanged(object sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(_viewModel.IsNewProfile))
            {
                UpdateActionButtonText();
            }
        }
        
        private void UpdateActionButtonText()
        {
            if (ActionButton != null)
            {
                ActionButton.Content = _viewModel.IsNewProfile ? "Create" : "Select";
            }
        }

        private void OnProfileSelected(object sender, string profileName)
        {
            SelectedProfileName = profileName;
            ProfileSelected = true;
            DialogResult = true;
            Close();
        }

        private void OnDialogClosed(object sender, EventArgs e)
        {
            DialogResult = false;
            Close();
        }

        protected override void OnClosed(EventArgs e)
        {
            // Unsubscribe from events to prevent memory leaks
            if (_viewModel != null)
            {
                _viewModel.ProfileSelected -= OnProfileSelected;
                _viewModel.DialogClosed -= OnDialogClosed;
                _viewModel.PropertyChanged -= OnViewModelPropertyChanged;
            }
            
            base.OnClosed(e);
        }
    }
}
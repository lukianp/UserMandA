using System;
using System.Windows;
using System.Windows.Input;
using MandADiscoverySuite.Themes;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite
{
    public partial class CreateProfileDialog : Window
    {
        private readonly CreateProfileDialogViewModel _viewModel;
        
        public CreateProfileDialogViewModel ViewModel => _viewModel;
        public CompanyProfile CreatedProfile { get; private set; }
        public string ProfileName => _viewModel.ProfileName;
        public CompanyProfile Profile => CreatedProfile;

        public CreateProfileDialog()
        {
            InitializeComponent();
            
            _viewModel = new CreateProfileDialogViewModel();
            _viewModel.ProfileCreated += OnProfileCreated;
            _viewModel.DialogClosed += OnDialogClosed;
            
            DataContext = _viewModel;
            
            // Apply current theme
            ThemeManager.Instance.ApplyThemeToWindow(this);
            
            ProfileNameTextBox.Focus();
        }

        public CreateProfileDialog(CompanyProfile existingProfile)
        {
            InitializeComponent();
            
            _viewModel = new CreateProfileDialogViewModel(existingProfile);
            _viewModel.ProfileCreated += OnProfileCreated;
            _viewModel.DialogClosed += OnDialogClosed;
            
            DataContext = _viewModel;
            
            // Apply current theme
            ThemeManager.Instance.ApplyThemeToWindow(this);
            
            ProfileNameTextBox.Focus();
        }

        private void OnProfileCreated(object sender, CompanyProfile profile)
        {
            CreatedProfile = profile;
            DialogResult = true;
            Close();
        }

        private void OnDialogClosed(object sender, EventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private void ProfileNameTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                if (_viewModel.CreateCommand.CanExecute(null))
                    _viewModel.CreateCommand.Execute(null);
            }
            else if (e.Key == Key.Escape)
            {
                _viewModel.CancelCommand.Execute(null);
            }
        }

        private void ProfileNameTextBox_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
        {
            _viewModel.ProfileName = ProfileNameTextBox.Text;
            _viewModel.ValidateProfileName();
        }





        protected override void OnClosed(EventArgs e)
        {
            _viewModel.ProfileCreated -= OnProfileCreated;
            _viewModel.DialogClosed -= OnDialogClosed;
            base.OnClosed(e);
        }
    }
}
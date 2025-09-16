using System;
using System.Windows;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Dialogs
{
    public partial class AdvancedSearchDialog : Window
    {
        private readonly AdvancedSearchDialogViewModel _viewModel;

        public AdvancedSearchDialogViewModel ViewModel => _viewModel;
        public SearchFilter AppliedFilter { get; private set; }
        public SearchFilter CurrentFilter => _viewModel.CurrentFilter;

        public AdvancedSearchDialog(string viewName, SearchFilter? existingFilter = null)
        {
            InitializeComponent();
            
            _viewModel = new AdvancedSearchDialogViewModel(viewName, existingFilter);
            _viewModel.FilterApplied += OnFilterApplied;
            _viewModel.DialogClosed += OnDialogClosed;
            
            DataContext = _viewModel;
        }

        private void OnFilterApplied(object sender, SearchFilter filter)
        {
            AppliedFilter = filter;
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
            _viewModel.FilterApplied -= OnFilterApplied;
            _viewModel.DialogClosed -= OnDialogClosed;
            base.OnClosed(e);
        }
    }
}
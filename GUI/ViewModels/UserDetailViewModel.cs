using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using MandADiscoverySuite.Services;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the UserDetailWindow
    /// </summary>
    public class UserDetailViewModel : BaseViewModel
    {
        private readonly ILogicEngineService _logicEngineService;
        private object _userData;
        private string _displayName;
        private string _userPrincipalName;
        private string _samAccountName;
        private string _email;
        private string _department;
        private string _jobTitle;
        private string _company;
        private string _manager;
        private string _createdDateTime;
        private string _objectType;
        private string _distinguishedName;
        private string _description;
        private string _selectedUserIdentifier;

        public UserDetailViewModel(object userData)
        {
            _userData = userData;
            LoadUserData();
            CloseCommand = new RelayCommand(Close);
        }

        public UserDetailViewModel(ILogicEngineService logicEngineService, ILogger logger)
            : base(logger)
        {
            _logicEngineService = logicEngineService ?? throw new ArgumentNullException(nameof(logicEngineService));
            CloseCommand = new RelayCommand(Close);
        }

        public string SelectedUserIdentifier
        {
            get => _selectedUserIdentifier;
            set
            {
                if (value != _selectedUserIdentifier)
                {
                    _selectedUserIdentifier = value;
                    OnPropertyChanged();
                    _ = Task.Run(LoadUserDetailAsync);
                }
            }
        }

        public string DisplayName
        {
            get => _displayName;
            set => SetProperty(ref _displayName, value);
        }

        public string UserPrincipalName
        {
            get => _userPrincipalName;
            set => SetProperty(ref _userPrincipalName, value);
        }

        public string SamAccountName
        {
            get => _samAccountName;
            set => SetProperty(ref _samAccountName, value);
        }

        public string Email
        {
            get => _email;
            set => SetProperty(ref _email, value);
        }

        public string Department
        {
            get => _department;
            set => SetProperty(ref _department, value);
        }

        public string JobTitle
        {
            get => _jobTitle;
            set => SetProperty(ref _jobTitle, value);
        }

        public string Company
        {
            get => _company;
            set => SetProperty(ref _company, value);
        }

        public string Manager
        {
            get => _manager;
            set => SetProperty(ref _manager, value);
        }

        public string CreatedDateTime
        {
            get => _createdDateTime;
            set => SetProperty(ref _createdDateTime, value);
        }

        public string ObjectType
        {
            get => _objectType;
            set => SetProperty(ref _objectType, value);
        }

        public string DistinguishedName
        {
            get => _distinguishedName;
            set => SetProperty(ref _distinguishedName, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public RelayCommand CloseCommand { get; }

        public override async Task LoadAsync()
        {
            await LoadUserDetailAsync();
        }

        private async Task LoadUserDetailAsync()
        {
            if (string.IsNullOrEmpty(SelectedUserIdentifier))
            {
                return;
            }

            if (_logicEngineService != null)
            {
                try
                {
                    // Load user data from LogicEngineService
                    var userData = await _logicEngineService.GetUserDetailAsync(SelectedUserIdentifier);
                    if (userData != null)
                    {
                        _userData = userData;
                        LoadUserData();
                    }
                }
                catch (Exception ex)
                {
                    // Log error if logger available
                    (Logger as ILogger)?.LogError(ex, "Failed to load user detail for {UserIdentifier}", SelectedUserIdentifier);
                }
            }
        }

        private void LoadUserData()
        {
            if (_userData is IDictionary<string, object> dict)
            {
                DisplayName = GetValue(dict, "displayname");
                UserPrincipalName = GetValue(dict, "userprincipalname");
                SamAccountName = GetValue(dict, "samaccountname");
                Email = GetValue(dict, "mail");
                Department = GetValue(dict, "department");
                JobTitle = GetValue(dict, "jobtitle");
                Company = GetValue(dict, "company");
                Manager = GetValue(dict, "manager");
                CreatedDateTime = GetValue(dict, "createddatetime");
                ObjectType = GetValue(dict, "objecttype");
                DistinguishedName = GetValue(dict, "distinguishedname");
                Description = GetValue(dict, "description");
            }
        }

        private string GetValue(IDictionary<string, object> dict, string key)
        {
            return dict.TryGetValue(key, out var value) ? value?.ToString() ?? "" : "";
        }

        private void Close()
        {
            // Close the window - this will be handled by the view
            Application.Current.Windows.OfType<Views.UserDetailWindow>().FirstOrDefault()?.Close();
        }
    }
}
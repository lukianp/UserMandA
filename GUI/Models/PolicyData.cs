using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    /// <summary>
    /// Represents a Group Policy Object discovered during inventory.
    /// </summary>
    public partial class PolicyData : INotifyPropertyChanged
    {
        private string _id;
        private string _name;
        private string _path;
        private string _type;
        private DateTime? _createdTime;
        private DateTime? _modifiedTime;
        private string _scope;
        private string _linkedOUs;
        private bool _enabled;
        private bool _computerSettingsEnabled;
        private bool _userSettingsEnabled;
        private string _description;
        private string _securityFiltering;
        private string _wmiFilters;
        private string _additionalSettings;

        public string Id
        {
            get => _id;
            set => SetProperty(ref _id, value);
        }

        public string Name
        {
            get => _name;
            set => SetProperty(ref _name, value);
        }

        public string Path
        {
            get => _path;
            set => SetProperty(ref _path, value);
        }

        public string Type
        {
            get => _type;
            set => SetProperty(ref _type, value);
        }

        public DateTime? CreatedTime
        {
            get => _createdTime;
            set => SetProperty(ref _createdTime, value);
        }

        public DateTime? ModifiedTime
        {
            get => _modifiedTime;
            set => SetProperty(ref _modifiedTime, value);
        }

        public string Scope
        {
            get => _scope;
            set => SetProperty(ref _scope, value);
        }

        /// <summary>
        /// Comma-separated list of Organizational Units this policy is linked to.
        /// </summary>
        public string LinkedOUs
        {
            get => _linkedOUs;
            set => SetProperty(ref _linkedOUs, value);
        }

        public bool Enabled
        {
            get => _enabled;
            set => SetProperty(ref _enabled, value);
        }

        public bool ComputerSettingsEnabled
        {
            get => _computerSettingsEnabled;
            set => SetProperty(ref _computerSettingsEnabled, value);
        }

        public bool UserSettingsEnabled
        {
            get => _userSettingsEnabled;
            set => SetProperty(ref _userSettingsEnabled, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        /// <summary>
        /// Groups or users this policy applies to.
        /// </summary>
        public string SecurityFiltering
        {
            get => _securityFiltering;
            set => SetProperty(ref _securityFiltering, value);
        }

        public string WmiFilters
        {
            get => _wmiFilters;
            set => SetProperty(ref _wmiFilters, value);
        }

        /// <summary>
        /// Additional key settings represented as JSON or semicolon separated list.
        /// </summary>
        public string AdditionalSettings
        {
            get => _additionalSettings;
            set => SetProperty(ref _additionalSettings, value);
        }

        /// <summary>
        /// User supplied migration notes or tags to assist planning.
        /// </summary>
        public List<string> MigrationNotes { get; set; } = new();

        public event PropertyChangedEventHandler PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string propertyName = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));

        protected bool SetProperty<T>(ref T storage, T value, [CallerMemberName] string propertyName = null)
        {
            if (EqualityComparer<T>.Default.Equals(storage, value))
                return false;
            storage = value;
            OnPropertyChanged(propertyName);
            return true;
        }
    }
}

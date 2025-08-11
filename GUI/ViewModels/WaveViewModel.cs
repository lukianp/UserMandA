using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for Wave Management
    /// </summary>
    public class WaveViewModel : BaseViewModel
    {
        private MigrationProject _project;
        private ObservableCollection<MigrationProjectWave> _migrationWaves;
        private ObservableCollection<User> _availableUsers;
        private MigrationProjectWave _selectedWave;

        public WaveViewModel(MigrationProject project)
        {
            _project = project;
            
            InitializeData();
            InitializeCommands();
        }

        #region Properties

        public MigrationProject Project
        {
            get => _project;
            set
            {
                if (SetProperty(ref _project, value))
                {
                    InitializeData();
                }
            }
        }

        public ObservableCollection<MigrationProjectWave> MigrationProjectWaves
        {
            get => _migrationWaves;
            set => SetProperty(ref _migrationWaves, value);
        }

        public ObservableCollection<User> AvailableUsers
        {
            get => _availableUsers;
            set => SetProperty(ref _availableUsers, value);
        }

        public MigrationProjectWave SelectedWave
        {
            get => _selectedWave;
            set
            {
                if (SetProperty(ref _selectedWave, value))
                {
                    OnPropertyChanged(nameof(IsWaveSelected));
                    OnPropertyChanged(nameof(SelectedWaveUsers));
                    OnPropertyChanged(nameof(UnassignedUsers));
                    
                    // Update command can execute states
                    // Commands will automatically update their can execute state
                }
            }
        }

        public bool IsWaveSelected => SelectedWave != null;

        public ObservableCollection<User> SelectedWaveUsers => SelectedWave?.AssignedUsers ?? new ObservableCollection<User>();

        public ObservableCollection<User> UnassignedUsers
        {
            get
            {
                if (AvailableUsers == null || SelectedWave?.AssignedUsers == null)
                    return new ObservableCollection<User>();

                var unassigned = AvailableUsers
                    .Where(u => !SelectedWave.AssignedUsers.Any(au => au.Name == u.Name))
                    .ToList();

                return new ObservableCollection<User>(unassigned);
            }
        }

        #endregion

        #region Commands

        public ICommand CreateWaveCommand { get; private set; }
        public ICommand DeleteWaveCommand { get; private set; }
        public ICommand AddUserToWaveCommand { get; private set; }
        public ICommand RemoveUserFromWaveCommand { get; private set; }

        protected override void InitializeCommands()
        {
            CreateWaveCommand = new RelayCommand(ExecuteCreateWave);
            DeleteWaveCommand = new RelayCommand(ExecuteDeleteWave, CanExecuteDeleteWave);
            AddUserToWaveCommand = new RelayCommand<User>(ExecuteAddUserToWave, CanExecuteAddUserToWave);
            RemoveUserFromWaveCommand = new RelayCommand<User>(ExecuteRemoveUserFromWave, CanExecuteRemoveUserFromWave);
        }

        private void ExecuteCreateWave()
        {
            var dialog = new WaveCreationDialog();
            dialog.Owner = Application.Current.MainWindow;

            if (dialog.ShowDialog() == true)
            {
                var newWave = new MigrationProjectWave
                {
                    Name = dialog.WaveName,
                    Description = dialog.WaveDescription,
                    StartDate = dialog.StartDate,
                    EndDate = dialog.EndDate,
                    Status = WaveStatus.Planned,
                    Progress = 0
                };

                MigrationProjectWaves.Add(newWave);
                Project.Waves.Add(newWave);
                SelectedWave = newWave;
            }
        }

        private void ExecuteDeleteWave()
        {
            if (SelectedWave == null) return;

            var result = MessageBox.Show(
                $"Are you sure you want to delete the wave '{SelectedWave.Name}'?",
                "Confirm Deletion",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning);

            if (result == MessageBoxResult.Yes)
            {
                MigrationProjectWaves.Remove(SelectedWave);
                Project.Waves.Remove(SelectedWave);
                SelectedWave = MigrationProjectWaves.FirstOrDefault();
            }
        }

        private bool CanExecuteDeleteWave() => SelectedWave != null;

        private void ExecuteAddUserToWave(User user)
        {
            if (user == null || SelectedWave == null) return;

            if (!SelectedWave.AssignedUsers.Any(u => u.Name == user.Name))
            {
                SelectedWave.AssignedUsers.Add(new User { Name = user.Name, Role = user.Role });
                OnPropertyChanged(nameof(SelectedWaveUsers));
                OnPropertyChanged(nameof(UnassignedUsers));
            }
        }

        private bool CanExecuteAddUserToWave(User user) => user != null && SelectedWave != null;

        private void ExecuteRemoveUserFromWave(User user)
        {
            if (user == null || SelectedWave == null) return;

            var userToRemove = SelectedWave.AssignedUsers.FirstOrDefault(u => u.Name == user.Name);
            if (userToRemove != null)
            {
                SelectedWave.AssignedUsers.Remove(userToRemove);
                OnPropertyChanged(nameof(SelectedWaveUsers));
                OnPropertyChanged(nameof(UnassignedUsers));
            }
        }

        private bool CanExecuteRemoveUserFromWave(User user) => user != null && SelectedWave != null;

        #endregion

        #region Methods

        private void InitializeData()
        {
            // Initialize migration waves from project
            if (Project?.Waves != null)
            {
                MigrationProjectWaves = new ObservableCollection<MigrationProjectWave>(Project.Waves);
            }
            else
            {
                MigrationProjectWaves = new ObservableCollection<MigrationProjectWave>();
            }

            // Initialize available users (mock data)
            AvailableUsers = new ObservableCollection<User>
            {
                new User { Name = "John Smith", Role = "Project Manager" },
                new User { Name = "Sarah Johnson", Role = "Technical Lead" },
                new User { Name = "Mike Chen", Role = "Business Analyst" },
                new User { Name = "Lisa Davis", Role = "Change Management" },
                new User { Name = "Tom Wilson", Role = "System Administrator" },
                new User { Name = "Amy Rodriguez", Role = "Database Administrator" },
                new User { Name = "David Park", Role = "Identity Specialist" },
                new User { Name = "Jennifer Lee", Role = "Security Analyst" },
                new User { Name = "Chris Thompson", Role = "Application Developer" },
                new User { Name = "Maria Garcia", Role = "QA Engineer" },
                new User { Name = "Robert Brown", Role = "Network Administrator" },
                new User { Name = "Emily White", Role = "Data Analyst" },
                new User { Name = "James Taylor", Role = "DevOps Engineer" },
                new User { Name = "Jessica Miller", Role = "User Training Specialist" },
                new User { Name = "Michael Davis", Role = "Infrastructure Architect" }
            };

            // Select first wave if available
            SelectedWave = MigrationProjectWaves.FirstOrDefault();
        }

        /// <summary>
        /// Updates wave progress based on associated phase completion
        /// </summary>
        public void UpdateWaveProgress()
        {
            if (Project?.Phases == null) return;

            foreach (var wave in MigrationProjectWaves)
            {
                if (wave.AssociatedPhases?.Any() == true)
                {
                    var associatedPhases = Project.Phases
                        .Where(p => wave.AssociatedPhases.Contains(p.Name))
                        .ToList();

                    if (associatedPhases.Any())
                    {
                        wave.Progress = associatedPhases.Average(p => p.Progress);
                        
                        // Update status based on progress
                        if (wave.Progress >= 100)
                            wave.Status = WaveStatus.Completed;
                        else if (wave.Progress > 0)
                            wave.Status = WaveStatus.Active;
                        else
                            wave.Status = WaveStatus.Planned;
                    }
                }
            }
        }

        /// <summary>
        /// Gets waves that are currently active
        /// </summary>
        public IEnumerable<MigrationProjectWave> GetActiveWaves()
        {
            return MigrationProjectWaves?.Where(w => w.Status == WaveStatus.Active) ?? Enumerable.Empty<MigrationProjectWave>();
        }

        /// <summary>
        /// Gets waves that are overdue
        /// </summary>
        public IEnumerable<MigrationProjectWave> GetOverdueWaves()
        {
            var today = DateTime.Today;
            return MigrationProjectWaves?.Where(w => w.EndDate < today && w.Status != WaveStatus.Completed) ?? Enumerable.Empty<MigrationProjectWave>();
        }

        /// <summary>
        /// Gets user workload (number of active waves assigned)
        /// </summary>
        public int GetUserWorkload(string userName)
        {
            return MigrationProjectWaves?
                .Where(w => w.Status == WaveStatus.Active)
                .Count(w => w.AssignedUsers?.Any(u => u.Name == userName) == true) ?? 0;
        }

        #endregion
    }

    /// <summary>
    /// Simple dialog for creating new waves (would typically be a proper WPF dialog)
    /// </summary>
    public class WaveCreationDialog : Window
    {
        public string WaveName { get; set; }
        public string WaveDescription { get; set; }
        public DateTime StartDate { get; set; } = DateTime.Today;
        public DateTime EndDate { get; set; } = DateTime.Today.AddDays(30);

        // This would be implemented as a proper dialog with TextBoxes, DatePickers, etc.
        // For now, just simulate the dialog result
        public WaveCreationDialog()
        {
            // Mock dialog - in real implementation, this would show actual UI
            WaveName = $"Wave {DateTime.Now.Ticks % 100}";
            WaveDescription = "New migration wave";
            StartDate = DateTime.Today.AddDays(10);
            EndDate = DateTime.Today.AddDays(40);
        }

        public new bool? ShowDialog()
        {
            // Mock dialog result - in real implementation, this would show the actual dialog
            return true;
        }
    }
}
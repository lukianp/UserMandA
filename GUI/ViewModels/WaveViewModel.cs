using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ShareGate-inspired Wave Management ViewModel with analytics and optimization
    /// </summary>
    public class WaveViewModel : BaseViewModel
    {
        private MigrationProject _project;
        private ObservableCollection<MigrationProjectWave> _migrationWaves;
        private ObservableCollection<User> _availableUsers;
        private MigrationProjectWave _selectedWave;
        
        // ShareGate-inspired properties
        private string _userSearchText = string.Empty;
        private string _complexityFilter = "All";
        private ObservableCollection<User> _filteredUnassignedUsers = new ObservableCollection<User>();
        
        // Analytics properties
        private int _highComplexityCount = 0;
        private int _mediumComplexityCount = 0;
        private int _lowComplexityCount = 0;
        private double _highComplexityPercent = 0;
        private double _mediumComplexityPercent = 0;
        private double _lowComplexityPercent = 0;
        private double _optimizationScore = 0;
        private ObservableCollection<string> _optimizationSuggestions = new ObservableCollection<string>();
        
        // Dependency properties
        private ObservableCollection<DependencyInfo> _criticalDependencies = new ObservableCollection<DependencyInfo>();
        private ObservableCollection<DependencyInfo> _normalDependencies = new ObservableCollection<DependencyInfo>();

        public override bool HasData => MigrationProjectWaves?.Count > 0;

        public WaveViewModel(MigrationProject project, ILogger<WaveViewModel> logger) : base(logger)
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

        /// <summary>
        /// Alias for Project property for compatibility
        /// </summary>
        public MigrationProject CurrentProject
        {
            get => _project;
            set => Project = value;
        }

        public ObservableCollection<MigrationProjectWave> MigrationProjectWaves
        {
            get => _migrationWaves;
            set
            {
                if (SetProperty(ref _migrationWaves, value))
                {
                    OnPropertyChanged(nameof(MigrationWaves));
                }
            }
        }

        /// <summary>
        /// Alias for MigrationProjectWaves for compatibility with view binding
        /// </summary>
        public ObservableCollection<MigrationProjectWave> MigrationWaves => MigrationProjectWaves;

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
        
        #region ShareGate-inspired Properties
        
        public string UserSearchText
        {
            get => _userSearchText;
            set
            {
                if (SetProperty(ref _userSearchText, value))
                {
                    OnPropertyChanged(nameof(IsUserSearchEmpty));
                    UpdateFilteredUsers();
                }
            }
        }
        
        public bool IsUserSearchEmpty => string.IsNullOrWhiteSpace(_userSearchText);
        
        public string ComplexityFilter
        {
            get => _complexityFilter;
            set
            {
                if (SetProperty(ref _complexityFilter, value))
                {
                    UpdateFilteredUsers();
                }
            }
        }
        
        public ObservableCollection<User> FilteredUnassignedUsers
        {
            get => _filteredUnassignedUsers;
            set => SetProperty(ref _filteredUnassignedUsers, value);
        }
        
        public bool HasAssignedUsers => SelectedWave?.AssignedUsers?.Count > 0;
        public bool HasUnassignedUsers => UnassignedUsers?.Count > 0;
        
        #endregion
        
        #region Analytics Properties
        
        public int HighComplexityCount
        {
            get => _highComplexityCount;
            set => SetProperty(ref _highComplexityCount, value);
        }
        
        public int MediumComplexityCount
        {
            get => _mediumComplexityCount;
            set => SetProperty(ref _mediumComplexityCount, value);
        }
        
        public int LowComplexityCount
        {
            get => _lowComplexityCount;
            set => SetProperty(ref _lowComplexityCount, value);
        }
        
        public double HighComplexityPercent
        {
            get => _highComplexityPercent;
            set => SetProperty(ref _highComplexityPercent, value);
        }
        
        public double MediumComplexityPercent
        {
            get => _mediumComplexityPercent;
            set => SetProperty(ref _mediumComplexityPercent, value);
        }
        
        public double LowComplexityPercent
        {
            get => _lowComplexityPercent;
            set => SetProperty(ref _lowComplexityPercent, value);
        }
        
        public double OptimizationScore
        {
            get => _optimizationScore;
            set => SetProperty(ref _optimizationScore, value);
        }
        
        public ObservableCollection<string> OptimizationSuggestions
        {
            get => _optimizationSuggestions;
            set => SetProperty(ref _optimizationSuggestions, value);
        }
        
        #endregion
        
        #region Dependency Properties
        
        public ObservableCollection<DependencyInfo> CriticalDependencies
        {
            get => _criticalDependencies;
            set => SetProperty(ref _criticalDependencies, value);
        }
        
        public ObservableCollection<DependencyInfo> NormalDependencies
        {
            get => _normalDependencies;
            set => SetProperty(ref _normalDependencies, value);
        }
        
        public bool HasCriticalDependencies => CriticalDependencies?.Count > 0;
        public bool HasNormalDependencies => NormalDependencies?.Count > 0;
        public bool HasAnyDependencies => HasCriticalDependencies || HasNormalDependencies;
        
        #endregion

        #endregion

        #region Commands

        public ICommand CreateWaveCommand { get; private set; }
        public ICommand DeleteWaveCommand { get; private set; }
        public ICommand AddUserToWaveCommand { get; private set; }
        public ICommand RemoveUserFromWaveCommand { get; private set; }
        
        // ShareGate-inspired commands
        public ICommand OptimizeWavesCommand { get; private set; }
        public ICommand RefreshAnalyticsCommand { get; private set; }

        protected override void InitializeCommands()
        {
            CreateWaveCommand = new RelayCommand(ExecuteCreateWave);
            DeleteWaveCommand = new RelayCommand(ExecuteDeleteWave, CanExecuteDeleteWave);
            AddUserToWaveCommand = new RelayCommand<User>(ExecuteAddUserToWave, CanExecuteAddUserToWave);
            RemoveUserFromWaveCommand = new RelayCommand<User>(ExecuteRemoveUserFromWave, CanExecuteRemoveUserFromWave);
            
            // ShareGate-inspired commands
            OptimizeWavesCommand = new AsyncRelayCommand(OptimizeWavesAsync);
            RefreshAnalyticsCommand = new RelayCommand(RefreshAnalytics);
        }

        private void ExecuteCreateWave()
        {
            try
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
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"WaveViewModel.ExecuteCreateWave failed: {ex.Message}");
                MessageBox.Show($"Failed to create wave: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ExecuteDeleteWave()
        {
            try
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
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"WaveViewModel.ExecuteDeleteWave failed: {ex.Message}");
                MessageBox.Show($"Failed to delete wave: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private bool CanExecuteDeleteWave() => SelectedWave != null;

        private void ExecuteAddUserToWave(User user)
        {
            if (user == null || SelectedWave == null) return;

            if (!SelectedWave.AssignedUsers.Any(u => u.Name == user.Name))
            {
                // Create enhanced user with complexity info
                var enhancedUser = CreateEnhancedUser(user);
                SelectedWave.AssignedUsers.Add(enhancedUser);
                
                OnPropertyChanged(nameof(SelectedWaveUsers));
                OnPropertyChanged(nameof(UnassignedUsers));
                OnPropertyChanged(nameof(HasAssignedUsers));
                OnPropertyChanged(nameof(HasUnassignedUsers));
                
                UpdateFilteredUsers();
                RefreshAnalytics();
                UpdateDependencies();
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
                OnPropertyChanged(nameof(HasAssignedUsers));
                OnPropertyChanged(nameof(HasUnassignedUsers));
                
                UpdateFilteredUsers();
                RefreshAnalytics();
                UpdateDependencies();
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

            // Initialize available users with ShareGate-inspired complexity data
            AvailableUsers = new ObservableCollection<User>
            {
                CreateEnhancedUser(new User { Name = "John Smith", Role = "Project Manager", Department = "Executive" }),
                CreateEnhancedUser(new User { Name = "Sarah Johnson", Role = "Technical Lead", Department = "IT" }),
                CreateEnhancedUser(new User { Name = "Mike Chen", Role = "Business Analyst", Department = "Finance" }),
                CreateEnhancedUser(new User { Name = "Lisa Davis", Role = "Change Management", Department = "HR" }),
                CreateEnhancedUser(new User { Name = "Tom Wilson", Role = "System Administrator", Department = "IT" }),
                CreateEnhancedUser(new User { Name = "Amy Rodriguez", Role = "Database Administrator", Department = "IT" }),
                CreateEnhancedUser(new User { Name = "David Park", Role = "Identity Specialist", Department = "IT" }),
                CreateEnhancedUser(new User { Name = "Jennifer Lee", Role = "Security Analyst", Department = "IT" }),
                CreateEnhancedUser(new User { Name = "Chris Thompson", Role = "Application Developer", Department = "IT" }),
                CreateEnhancedUser(new User { Name = "Maria Garcia", Role = "QA Engineer", Department = "IT" }),
                CreateEnhancedUser(new User { Name = "Robert Brown", Role = "Network Administrator", Department = "IT" }),
                CreateEnhancedUser(new User { Name = "Emily White", Role = "Data Analyst", Department = "Finance" }),
                CreateEnhancedUser(new User { Name = "James Taylor", Role = "DevOps Engineer", Department = "IT" }),
                CreateEnhancedUser(new User { Name = "Jessica Miller", Role = "User Training Specialist", Department = "HR" }),
                CreateEnhancedUser(new User { Name = "Michael Davis", Role = "Infrastructure Architect", Department = "IT" }),
                CreateEnhancedUser(new User { Name = "Rachel Green", Role = "Sales Manager", Department = "Sales" }),
                CreateEnhancedUser(new User { Name = "Mark Johnson", Role = "Marketing Director", Department = "Marketing" }),
                CreateEnhancedUser(new User { Name = "Nina Patel", Role = "Legal Counsel", Department = "Legal" }),
                CreateEnhancedUser(new User { Name = "Alex Wang", Role = "Operations Manager", Department = "Operations" }),
                CreateEnhancedUser(new User { Name = "Sophie Brown", Role = "Support Specialist", Department = "Support" })
            };

            // Initialize filtered users
            UpdateFilteredUsers();
            
            // Select first wave if available
            SelectedWave = MigrationProjectWaves.FirstOrDefault();
            
            // Initialize analytics and dependencies
            RefreshAnalytics();
            UpdateDependencies();
        }

        /// <summary>
        /// Updates wave progress based on associated phase completion
        /// </summary>
        public void UpdateWaveProgress()
        {
            try
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
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"WaveViewModel.UpdateWaveProgress failed: {ex.Message}");
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

        /// <summary>
        /// Unified LoadAsync implementation for wave data
        /// </summary>
        public override async Task LoadAsync()
        {
            IsLoading = true; 
            HasData = false; 
            LastError = null; 
            HeaderWarnings.Clear();

            try 
            {
                StructuredLogger?.LogDebug(LogSourceName, new { action = "load_start", component = "wave" }, "Starting ShareGate-inspired wave view load");
                
                // Initialize wave data with enhanced features
                InitializeData();
                
                // Update wave progress from any associated phases
                UpdateWaveProgress();
                
                // Load discovery data if available
                await LoadDiscoveryDataAsync();
                
                HasData = MigrationProjectWaves?.Count > 0 || AvailableUsers?.Count > 0;
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "load_complete", component = "wave", waves = MigrationProjectWaves?.Count ?? 0, users = AvailableUsers?.Count ?? 0 }, "ShareGate-inspired wave view load completed successfully");
            }
            catch (Exception ex) 
            {
                LastError = $"Failed to load wave data: {ex.Message}";
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_fail", component = "wave" }, "Failed to load wave view");
            }
            finally 
            { 
                IsLoading = false; 
            }
        }

        /// <summary>
        /// Calculates the overall progress across all migration waves
        /// </summary>
        /// <returns>Overall progress percentage (0-100)</returns>
        public double GetOverallWaveProgress()
        {
            if (MigrationProjectWaves == null || !MigrationProjectWaves.Any())
                return 0;

            return MigrationProjectWaves.Average(w => w.Progress);
        }

        #region ShareGate-inspired Methods
        
        /// <summary>
        /// Creates an enhanced user with complexity scoring and dependency info
        /// </summary>
        private User CreateEnhancedUser(User baseUser)
        {
            var random = new Random(baseUser.Name.GetHashCode()); // Consistent randomization
            
            // Calculate complexity score based on role and department
            var complexityScore = CalculateComplexityScore(baseUser, random);
            var complexityLevel = GetComplexityLevel(complexityScore);
            var complexityColor = GetComplexityColor(complexityLevel);
            
            // Calculate dependencies
            var dependencyCount = random.Next(0, 5);
            var hasDependencies = dependencyCount > 0;
            
            return new User
            {
                Name = baseUser.Name,
                Role = baseUser.Role,
                Department = baseUser.Department ?? "General",
                ComplexityScore = complexityScore,
                ComplexityLevel = complexityLevel,
                ComplexityColor = complexityColor,
                DependencyCount = dependencyCount,
                HasDependencies = hasDependencies
            };
        }
        
        /// <summary>
        /// Calculates complexity score based on user attributes
        /// </summary>
        private int CalculateComplexityScore(User user, Random random)
        {
            int baseScore = 30; // Base complexity
            
            // Role-based complexity
            var roleComplexity = user.Role?.ToLower() switch
            {
                var r when r.Contains("admin") || r.Contains("architect") => 40,
                var r when r.Contains("manager") || r.Contains("lead") => 30,
                var r when r.Contains("analyst") || r.Contains("developer") => 25,
                var r when r.Contains("specialist") => 20,
                _ => 15
            };
            
            // Department-based complexity
            var deptComplexity = user.Department?.ToLower() switch
            {
                "it" => 35,
                "executive" => 30,
                "finance" => 25,
                "legal" => 25,
                "hr" => 20,
                "sales" => 15,
                "marketing" => 15,
                "operations" => 15,
                "support" => 10,
                _ => 15
            };
            
            // Add some randomization for demo purposes
            var randomFactor = random.Next(-10, 20);
            
            return Math.Max(10, Math.Min(100, baseScore + roleComplexity + deptComplexity + randomFactor));
        }
        
        /// <summary>
        /// Gets complexity level from score
        /// </summary>
        private string GetComplexityLevel(int score)
        {
            return score switch
            {
                >= 70 => "High",
                >= 40 => "Med",
                _ => "Low"
            };
        }
        
        /// <summary>
        /// Gets color brush for complexity level
        /// </summary>
        private SolidColorBrush GetComplexityColor(string level)
        {
            return level switch
            {
                "High" => new SolidColorBrush(Colors.OrangeRed),
                "Med" => new SolidColorBrush(Colors.Orange),
                _ => new SolidColorBrush(Colors.Green)
            };
        }
        
        /// <summary>
        /// Updates filtered users based on search and complexity filter
        /// </summary>
        private void UpdateFilteredUsers()
        {
            if (UnassignedUsers == null)
            {
                FilteredUnassignedUsers.Clear();
                return;
            }
            
            var filtered = UnassignedUsers.AsEnumerable();
            
            // Apply search filter
            if (!string.IsNullOrWhiteSpace(UserSearchText))
            {
                var searchLower = UserSearchText.ToLower();
                filtered = filtered.Where(u => 
                    u.Name?.ToLower().Contains(searchLower) == true ||
                    u.Role?.ToLower().Contains(searchLower) == true ||
                    u.Department?.ToLower().Contains(searchLower) == true);
            }
            
            // Apply complexity filter
            if (!string.IsNullOrEmpty(ComplexityFilter) && ComplexityFilter != "All")
            {
                filtered = filtered.Where(u => u.ComplexityLevel?.StartsWith(ComplexityFilter) == true);
            }
            
            FilteredUnassignedUsers.Clear();
            foreach (var user in filtered.OrderBy(u => u.Name))
            {
                FilteredUnassignedUsers.Add(user);
            }
        }
        
        /// <summary>
        /// Refreshes analytics based on current wave data
        /// </summary>
        private void RefreshAnalytics()
        {
            var allUsers = AvailableUsers?.ToList() ?? new List<User>();
            var totalUsers = allUsers.Count;
            
            if (totalUsers == 0)
            {
                HighComplexityCount = MediumComplexityCount = LowComplexityCount = 0;
                HighComplexityPercent = MediumComplexityPercent = LowComplexityPercent = 0;
                OptimizationScore = 0;
                OptimizationSuggestions.Clear();
                return;
            }
            
            // Calculate complexity distribution
            HighComplexityCount = allUsers.Count(u => u.ComplexityLevel == "High");
            MediumComplexityCount = allUsers.Count(u => u.ComplexityLevel == "Med");
            LowComplexityCount = allUsers.Count(u => u.ComplexityLevel == "Low");
            
            HighComplexityPercent = (double)HighComplexityCount / totalUsers * 100;
            MediumComplexityPercent = (double)MediumComplexityCount / totalUsers * 100;
            LowComplexityPercent = (double)LowComplexityCount / totalUsers * 100;
            
            // Calculate optimization score
            CalculateOptimizationScore();
            
            // Generate optimization suggestions
            GenerateOptimizationSuggestions();
            
            // Trigger property change notifications
            OnPropertyChanged(nameof(HighComplexityCount));
            OnPropertyChanged(nameof(MediumComplexityCount));
            OnPropertyChanged(nameof(LowComplexityCount));
            OnPropertyChanged(nameof(HighComplexityPercent));
            OnPropertyChanged(nameof(MediumComplexityPercent));
            OnPropertyChanged(nameof(LowComplexityPercent));
        }
        
        /// <summary>
        /// Calculates wave optimization score
        /// </summary>
        private void CalculateOptimizationScore()
        {
            var score = 100.0;
            
            // Penalty for waves with only high complexity users
            foreach (var wave in MigrationProjectWaves ?? new ObservableCollection<MigrationProjectWave>())
            {
                if (wave.AssignedUsers?.Count > 0)
                {
                    var highComplexInWave = wave.AssignedUsers.Count(u => u.ComplexityLevel == "High");
                    var highComplexRatio = (double)highComplexInWave / wave.AssignedUsers.Count;
                    
                    if (highComplexRatio > 0.7) score -= 20; // Too many high complexity users
                    if (wave.AssignedUsers.Count > 50) score -= 10; // Wave too large
                    if (wave.AssignedUsers.Count < 5) score -= 5; // Wave too small
                }
            }
            
            // Bonus for good distribution
            if (MigrationProjectWaves?.Count >= 3) score += 10;
            
            OptimizationScore = Math.Max(0, Math.Min(100, score));
        }
        
        /// <summary>
        /// Generates optimization suggestions
        /// </summary>
        private void GenerateOptimizationSuggestions()
        {
            OptimizationSuggestions.Clear();
            
            if (HighComplexityPercent > 50)
            {
                OptimizationSuggestions.Add("⚠️ High complexity users dominate - consider more waves");
            }
            
            if (MigrationProjectWaves?.Any(w => w.AssignedUsers?.Count > 50) == true)
            {
                OptimizationSuggestions.Add("📊 Some waves are too large - consider splitting");
            }
            
            if (MigrationProjectWaves?.Count < 3)
            {
                OptimizationSuggestions.Add("💻 Create more waves for better risk distribution");
            }
            
            if (OptimizationSuggestions.Count == 0)
            {
                OptimizationSuggestions.Add("✅ Wave distribution looks good!");
            }
        }
        
        /// <summary>
        /// Updates dependency information
        /// </summary>
        private void UpdateDependencies()
        {
            CriticalDependencies.Clear();
            NormalDependencies.Clear();
            
            if (SelectedWave?.AssignedUsers == null)
            {
                OnPropertyChanged(nameof(HasCriticalDependencies));
                OnPropertyChanged(nameof(HasNormalDependencies));
                OnPropertyChanged(nameof(HasAnyDependencies));
                return;
            }
            
            // Generate mock dependencies for demo
            var random = new Random(42);
            foreach (var user in SelectedWave.AssignedUsers.Take(3)) // Limit for demo
            {
                if (random.NextDouble() < 0.3) // 30% chance of critical dependency
                {
                    CriticalDependencies.Add(new DependencyInfo
                    {
                        DependentUser = user.Name,
                        DependencyDescription = "Manager relationship requires coordinated migration",
                        DependencyType = "Manager"
                    });
                }
                else if (random.NextDouble() < 0.6) // 60% chance of normal dependency
                {
                    NormalDependencies.Add(new DependencyInfo
                    {
                        DependentUser = user.Name,
                        DependencyDescription = "Shared resources",
                        DependencyType = "Resource"
                    });
                }
            }
            
            OnPropertyChanged(nameof(HasCriticalDependencies));
            OnPropertyChanged(nameof(HasNormalDependencies));
            OnPropertyChanged(nameof(HasAnyDependencies));
        }
        
        /// <summary>
        /// Auto-optimizes wave assignments using ShareGate-inspired algorithms
        /// </summary>
        private async Task OptimizeWavesAsync()
        {
            try
            {
                StructuredLogger?.LogInfo(LogSourceName, new { action = "optimize_start", component = "wave" }, "Starting wave optimization");
                
                IsLoading = true;
                
                // Simulate optimization process
                await Task.Delay(2000);
                
                // Simple optimization: redistribute users to balance complexity
                var allAssignedUsers = MigrationProjectWaves
                    ?.SelectMany(w => w.AssignedUsers ?? new ObservableCollection<User>())
                    .ToList() ?? new List<User>();
                
                // Clear current assignments
                foreach (var wave in MigrationProjectWaves ?? new ObservableCollection<MigrationProjectWave>())
                {
                    wave.AssignedUsers?.Clear();
                }
                
                // Redistribute based on complexity
                var sortedUsers = allAssignedUsers
                    .OrderBy(u => u.ComplexityScore)
                    .ToList();
                
                var waveIndex = 0;
                foreach (var user in sortedUsers)
                {
                    if (MigrationProjectWaves?.Count > waveIndex)
                    {
                        MigrationProjectWaves[waveIndex].AssignedUsers?.Add(user);
                        waveIndex = (waveIndex + 1) % MigrationProjectWaves.Count;
                    }
                }
                
                // Refresh all properties
                OnPropertyChanged(nameof(SelectedWaveUsers));
                OnPropertyChanged(nameof(UnassignedUsers));
                OnPropertyChanged(nameof(HasAssignedUsers));
                OnPropertyChanged(nameof(HasUnassignedUsers));
                UpdateFilteredUsers();
                RefreshAnalytics();
                UpdateDependencies();
                
                StructuredLogger?.LogInfo(LogSourceName, new { action = "optimize_complete", component = "wave", users_redistributed = allAssignedUsers.Count }, "Wave optimization completed");
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "optimize_fail", component = "wave" }, "Wave optimization failed");
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        /// <summary>
        /// Loads discovery data from CSV files if available
        /// </summary>
        private async Task LoadDiscoveryDataAsync()
        {
            try
            {
                var configService = ConfigurationService.Instance;
                var dataPath = configService.GetCompanyRawDataPath("ljpops");
                
                if (!System.IO.Directory.Exists(dataPath))
                    return;
                
                var usersCsvPath = System.IO.Path.Combine(dataPath, "Users.csv");
                if (System.IO.File.Exists(usersCsvPath))
                {
                    // Load actual user data from CSV
                    var lines = await System.IO.File.ReadAllLinesAsync(usersCsvPath);
                    if (lines.Length > 1) // Has header and data
                    {
                        var headers = lines[0].Split(',');
                        var discoveredUsers = new List<User>();
                        
                        for (int i = 1; i < Math.Min(lines.Length, 50); i++) // Limit to 50 for demo
                        {
                            var values = lines[i].Split(',');
                            if (values.Length >= 2)
                            {
                                var user = new User
                                {
                                    Name = values.Length > 0 ? values[0].Trim('"') : $"User {i}",
                                    Role = values.Length > 1 ? values[1].Trim('"') : "User",
                                    Department = values.Length > 2 ? values[2].Trim('"') : "General"
                                };
                                
                                discoveredUsers.Add(CreateEnhancedUser(user));
                            }
                        }
                        
                        // Replace mock data with discovered data
                        if (discoveredUsers.Any())
                        {
                            AvailableUsers.Clear();
                            foreach (var user in discoveredUsers)
                            {
                                AvailableUsers.Add(user);
                            }
                            
                            UpdateFilteredUsers();
                            RefreshAnalytics();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                StructuredLogger?.LogError(LogSourceName, ex, new { action = "load_discovery_data", component = "wave" }, "Failed to load discovery data, using mock data");
            }
        }
        
        #endregion
        
        #endregion
    }
    
    /// <summary>
    /// Represents dependency information for ShareGate-inspired visualization
    /// </summary>
    public class DependencyInfo
    {
        public string DependentUser { get; set; } = string.Empty;
        public string DependencyDescription { get; set; } = string.Empty;
        public string DependencyType { get; set; } = string.Empty;
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
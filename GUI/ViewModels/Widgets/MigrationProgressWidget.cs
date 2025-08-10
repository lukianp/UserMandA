using System;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace MandADiscoverySuite.ViewModels.Widgets
{
    public class MigrationWave
    {
        public string Name { get; set; }
        public int TotalItems { get; set; }
        public int CompletedItems { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; }
        public double ProgressPercentage => TotalItems > 0 ? (double)CompletedItems / TotalItems * 100 : 0;
        public string ProgressText => $"{CompletedItems}/{TotalItems}";
    }

    public class MigrationProgressWidget : WidgetViewModel
    {
        private ObservableCollection<MigrationWave> _migrationWaves;
        private int _totalUsers;
        private int _migratedUsers;
        private int _totalSystems;
        private int _migratedSystems;
        private double _overallProgress;

        public MigrationProgressWidget()
        {
            Title = "Migration Progress";
            Icon = "🚀";
            RowSpan = 1;
            ColumnSpan = 2;
            MigrationWaves = new ObservableCollection<MigrationWave>();
        }

        public override string WidgetType => "MigrationProgress";

        public ObservableCollection<MigrationWave> MigrationWaves
        {
            get => _migrationWaves;
            set => SetProperty(ref _migrationWaves, value);
        }

        public int TotalUsers
        {
            get => _totalUsers;
            set => SetProperty(ref _totalUsers, value);
        }

        public int MigratedUsers
        {
            get => _migratedUsers;
            set => SetProperty(ref _migratedUsers, value);
        }

        public int TotalSystems
        {
            get => _totalSystems;
            set => SetProperty(ref _totalSystems, value);
        }

        public int MigratedSystems
        {
            get => _migratedSystems;
            set => SetProperty(ref _migratedSystems, value);
        }

        public double OverallProgress
        {
            get => _overallProgress;
            set => SetProperty(ref _overallProgress, value);
        }

        public override async Task RefreshAsync()
        {
            try
            {
                IsLoading = true;

                await Task.Delay(900);

                var waves = new[]
                {
                    new MigrationWave 
                    { 
                        Name = "Wave 1 - Pilot", 
                        TotalItems = 50, 
                        CompletedItems = 45, 
                        StartDate = DateTime.Now.AddDays(-30),
                        EndDate = DateTime.Now.AddDays(-15),
                        Status = "Completed"
                    },
                    new MigrationWave 
                    { 
                        Name = "Wave 2 - Finance", 
                        TotalItems = 150, 
                        CompletedItems = 75, 
                        StartDate = DateTime.Now.AddDays(-15),
                        EndDate = null,
                        Status = "In Progress"
                    },
                    new MigrationWave 
                    { 
                        Name = "Wave 3 - Operations", 
                        TotalItems = 200, 
                        CompletedItems = 0, 
                        StartDate = DateTime.Now.AddDays(15),
                        EndDate = null,
                        Status = "Planned"
                    },
                    new MigrationWave 
                    { 
                        Name = "Wave 4 - All Remaining", 
                        TotalItems = 800, 
                        CompletedItems = 0, 
                        StartDate = DateTime.Now.AddDays(45),
                        EndDate = null,
                        Status = "Planned"
                    },
                };

                MigrationWaves.Clear();
                foreach (var wave in waves)
                {
                    MigrationWaves.Add(wave);
                }

                // Calculate totals
                TotalUsers = 0;
                MigratedUsers = 0;
                TotalSystems = 0;
                MigratedSystems = 0;

                foreach (var wave in waves)
                {
                    TotalUsers += wave.TotalItems;
                    MigratedUsers += wave.CompletedItems;
                }

                // Mock system migration data
                TotalSystems = 450;
                MigratedSystems = 120;

                // Calculate overall progress
                var totalItems = TotalUsers + TotalSystems;
                var completedItems = MigratedUsers + MigratedSystems;
                OverallProgress = totalItems > 0 ? (double)completedItems / totalItems * 100 : 0;

                OnRefreshCompleted();
            }
            catch (Exception ex)
            {
                OnRefreshError($"Failed to refresh migration progress: {ex.Message}");
            }
        }
    }
}
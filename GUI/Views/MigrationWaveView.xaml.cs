using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Repository;

namespace MandADiscoverySuite.Views
{
    public partial class MigrationWaveView : Window
    {
        private readonly IUnitOfWork _unitOfWork;
        public ObservableCollection<MigrationWave> MigrationWaves { get; } = new();

        public MigrationWaveView(IUnitOfWork unitOfWork = null)
        {
            InitializeComponent();
            _unitOfWork = unitOfWork ?? new UnitOfWork();
            DataContext = this;
            Loaded += MigrationWaveView_Loaded;
        }

        private async void MigrationWaveView_Loaded(object sender, RoutedEventArgs e)
        {
            var waveRepo = _unitOfWork.GetRepository<MigrationWave, string>();
            var assignmentRepo = _unitOfWork.GetRepository<WaveAssignment, string>();
            var waves = await waveRepo.GetAllAsync();
            var assignments = await assignmentRepo.GetAllAsync();

            foreach (var wave in waves)
            {
                wave.Assignments = new ObservableCollection<WaveAssignment>(assignments.Where(a => a.WaveId == wave.Id));
                MigrationWaves.Add(wave);
            }
        }
    }
}

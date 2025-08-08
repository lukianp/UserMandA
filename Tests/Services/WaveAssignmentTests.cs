using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Repository;
using System.Collections.ObjectModel;

namespace MandADiscoverySuite.Tests.Services
{
    public class WaveAssignmentTests
    {
        [Fact]
        public async Task AddAndRemoveAssignmentUpdatesWave()
        {
            var uow = new UnitOfWork();
            var waveRepo = uow.GetRepository<MigrationWave, string>();
            var assignmentRepo = uow.GetRepository<WaveAssignment, string>();

            var wave = await waveRepo.AddAsync(new MigrationWave
            {
                Name = "Wave A",
                PlannedStartDate = DateTime.Today,
                PlannedEndDate = DateTime.Today.AddDays(1)
            });
            wave.Assignments = new ObservableCollection<WaveAssignment>();
            await uow.SaveChangesAsync();

            var assignment = await assignmentRepo.AddAsync(new WaveAssignment
            {
                UserId = "user1",
                DisplayName = "User One",
                WaveId = wave.Id
            });
            wave.Assignments.Add(assignment);
            await uow.SaveChangesAsync();

            Assert.Single(wave.Assignments);
            Assert.Equal(1, wave.AssignedUserCount);

            await assignmentRepo.RemoveAsync(assignment.Id);
            wave.Assignments.Remove(assignment);
            await uow.SaveChangesAsync();

            Assert.Empty(wave.Assignments);
            Assert.Equal(0, wave.AssignedUserCount);
        }
    }
}

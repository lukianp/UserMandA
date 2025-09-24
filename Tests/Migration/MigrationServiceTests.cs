using System;
using System.Threading.Tasks;
using MandADiscoverySuite.Migration;
using MandADiscoverySuite.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace MandADiscoverySuite.Tests.Migration
{
    [TestClass]
    public class MigrationServiceTests
    {
        [TestMethod]
        public void MigrationWave_CanBeCreated()
        {
            // Arrange & Act
            var wave = new MigrationWave();

            // Assert
            Assert.IsNotNull(wave);
            Assert.IsInstanceOfType(wave, typeof(MigrationWave));
        }

        [TestMethod]
        public void MigrationSettings_CanBeCreated()
        {
            // Arrange & Act
            var settings = new MigrationSettings();

            // Assert
            Assert.IsNotNull(settings);
            Assert.IsInstanceOfType(settings, typeof(MigrationSettings));
        }

        [TestMethod]
        public void MigrationResult_CanBeCreated()
        {
            // Arrange & Act
            var result = new Models.MigrationResult
            {
                OverallStatus = MigrationStatus.Completed,
                TotalItems = 5,
                SuccessfulItems = 5,
                FailedItems = 0
            };

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(MigrationStatus.Completed, result.OverallStatus);
            Assert.AreEqual(5, result.TotalItems);
            Assert.AreEqual(5, result.SuccessfulItems);
            Assert.AreEqual(0, result.FailedItems);
            Assert.AreEqual(100.0, result.SuccessRate);
        }
    }
}

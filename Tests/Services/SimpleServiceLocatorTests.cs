using System;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Services;
using Microsoft.Extensions.Logging;

namespace MandADiscoverySuite.Tests.Services
{
    [TestClass]
    public class SimpleServiceLocatorTests
    {
        [TestMethod]
        public void ConcurrentRegistrationAndRetrieval_ShouldBeThreadSafe()
        {
            // Arrange
            var serviceInstance = new TestService();

            // Act - Register from multiple threads
            Parallel.For(0, 10, i =>
            {
                SimpleServiceLocator.RegisterService(serviceInstance);
            });

            // Assert - Retrieve from multiple threads
            Parallel.For(0, 10, i =>
            {
                var retrieved = SimpleServiceLocator.Instance.GetService<TestService>();
                Assert.IsNotNull(retrieved);
                Assert.AreEqual(serviceInstance, retrieved);
            });
        }

        [TestMethod]
        public void ConcurrentGetService_ShouldHandleMultipleRequests()
        {
            // Arrange

            // Act & Assert - Multiple concurrent retrievals
            var tasks = new Task[20];
            for (int i = 0; i < 20; i++)
            {
                tasks[i] = Task.Run(() =>
                {
                    var logger = SimpleServiceLocator.Instance.GetService<ILogger<SimpleServiceLocatorTests>>();
                    Assert.IsNotNull(logger);
                });
            }

            Task.WaitAll(tasks);
        }

        [TestMethod]
        public void RegisterService_ConcurrentOverwrite_ShouldNotThrow()
        {
            // Arrange

            // Act - Concurrent registrations overwriting each other
            Parallel.For(0, 5, i =>
            {
                SimpleServiceLocator.RegisterService(new TestService { Id = i });
            });

            // Assert - Should not throw and should return one of the instances
            var retrieved = SimpleServiceLocator.Instance.GetService<TestService>();
            Assert.IsNotNull(retrieved);
            Assert.IsInstanceOfType(retrieved, typeof(TestService));
        }

        private class TestService
        {
            public int Id { get; set; }
        }
    }
}
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Tests.ViewModels
{
    /// <summary>
    /// Unit tests for BaseViewModel
    /// </summary>
    public class BaseViewModelTests
    {
        private class TestViewModel : BaseViewModel
        {
            public TestViewModel(ILogger logger = null, IMessenger messenger = null)
                : base(logger, messenger)
            {
            }

            public async Task<string> TestExecuteAsync()
            {
                return await ExecuteAsync(async () =>
                {
                    await Task.Delay(10);
                    return "Success";
                }, "Test Operation");
            }

            public async Task TestExecuteAsyncVoid()
            {
                await ExecuteAsync(async () =>
                {
                    await Task.Delay(10);
                }, "Test Operation");
            }

            public async Task TestExecuteAsyncWithError()
            {
                await ExecuteAsync(async () =>
                {
                    await Task.Delay(10);
                    throw new InvalidOperationException("Test error");
                }, "Test Operation");
            }

            public void TestOnPropertiesChangedBatched(params string[] propertyNames)
            {
                OnPropertiesChangedBatched(propertyNames);
            }

            public void TestFlushPendingNotifications()
            {
                FlushPendingNotifications();
            }
        }

        private readonly Mock<ILogger> _mockLogger;
        private readonly Mock<IMessenger> _mockMessenger;

        public BaseViewModelTests()
        {
            _mockLogger = new Mock<ILogger>();
            _mockMessenger = new Mock<IMessenger>();
        }

        [Fact]
        public void Constructor_WithParameters_InitializesCorrectly()
        {
            // Act
            var viewModel = new TestViewModel(_mockLogger.Object, _mockMessenger.Object);

            // Assert
            Assert.NotNull(viewModel);
            Assert.False(viewModel.IsLoading);
            Assert.False(viewModel.HasErrors);
            Assert.Empty(viewModel.StatusMessage);
            Assert.Empty(viewModel.ErrorMessage);
            Assert.NotNull(viewModel.ClearErrorsCommand);
        }

        [Fact]
        public void Constructor_WithoutParameters_InitializesCorrectly()
        {
            // Act
            var viewModel = new TestViewModel();

            // Assert
            Assert.NotNull(viewModel);
            Assert.False(viewModel.IsLoading);
            Assert.False(viewModel.HasErrors);
        }

        [Fact]
        public async Task ExecuteAsync_SuccessfulOperation_SetsCorrectStates()
        {
            // Arrange
            var viewModel = new TestViewModel(_mockLogger.Object, _mockMessenger.Object);

            // Act
            var result = await viewModel.TestExecuteAsync();

            // Assert
            Assert.Equal("Success", result);
            Assert.False(viewModel.IsLoading);
            Assert.False(viewModel.HasErrors);
            Assert.Contains("completed successfully", viewModel.StatusMessage);
        }

        [Fact]
        public async Task ExecuteAsync_VoidOperation_SetsCorrectStates()
        {
            // Arrange
            var viewModel = new TestViewModel(_mockLogger.Object, _mockMessenger.Object);

            // Act
            await viewModel.TestExecuteAsyncVoid();

            // Assert
            Assert.False(viewModel.IsLoading);
            Assert.False(viewModel.HasErrors);
            Assert.Contains("completed successfully", viewModel.StatusMessage);
        }

        [Fact]
        public async Task ExecuteAsync_WithError_SetsErrorState()
        {
            // Arrange
            var viewModel = new TestViewModel(_mockLogger.Object, _mockMessenger.Object);

            // Act
            await viewModel.TestExecuteAsyncWithError();

            // Assert
            Assert.False(viewModel.IsLoading);
            Assert.True(viewModel.HasErrors);
            Assert.Equal("Test error", viewModel.ErrorMessage);
            Assert.Contains("failed", viewModel.StatusMessage);
        }

        [Fact]
        public void ClearErrors_WithErrors_ClearsErrorState()
        {
            // Arrange
            var viewModel = new TestViewModel(_mockLogger.Object, _mockMessenger.Object);
            // Manually set error state
            viewModel.GetType().GetProperty("HasErrors").SetValue(viewModel, true);
            viewModel.GetType().GetProperty("ErrorMessage").SetValue(viewModel, "Test error");
            viewModel.GetType().GetProperty("StatusMessage").SetValue(viewModel, "Test status");

            // Act
            viewModel.ClearErrors();

            // Assert
            Assert.False(viewModel.HasErrors);
            Assert.Empty(viewModel.ErrorMessage);
            Assert.Empty(viewModel.StatusMessage);
        }

        [Fact]
        public void SetProperty_WithNewValue_RaisesPropertyChanged()
        {
            // Arrange
            var viewModel = new TestViewModel();
            var propertyChangedRaised = false;
            viewModel.PropertyChanged += (s, e) => 
            {
                if (e.PropertyName == nameof(viewModel.StatusMessage))
                    propertyChangedRaised = true;
            };

            // Act
            viewModel.StatusMessage = "New Status";

            // Assert
            Assert.True(propertyChangedRaised);
            Assert.Equal("New Status", viewModel.StatusMessage);
        }

        [Fact]
        public void Dispose_CallsDispose_DoesNotThrow()
        {
            // Arrange
            var viewModel = new TestViewModel(_mockLogger.Object, _mockMessenger.Object);

            // Act & Assert
            var exception = Record.Exception(() => viewModel.Dispose());
            Assert.Null(exception);
        }

        [Fact]
        public void ProcessPendingNotifications_ProcessesAllQueuedNotifications()
        {
            // Arrange
            var viewModel = new TestViewModel(_mockLogger.Object, _mockMessenger.Object);
            var propertyChangedEvents = new System.Collections.Generic.List<string>();
            viewModel.PropertyChanged += (s, e) => propertyChangedEvents.Add(e.PropertyName);

            // Act - Queue more than 20 notifications (the old limit)
            for (int i = 0; i < 30; i++)
            {
                viewModel.TestOnPropertiesChangedBatched($"Property{i}");
            }

            // Force immediate processing
            viewModel.TestFlushPendingNotifications();

            // Assert - All notifications should have been processed
            Assert.Equal(30, propertyChangedEvents.Count);
            for (int i = 0; i < 30; i++)
            {
                Assert.Contains($"Property{i}", propertyChangedEvents);
            }
        }
    }
}
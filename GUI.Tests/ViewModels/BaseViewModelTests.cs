using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using Moq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;

namespace GUI.Tests.ViewModels
{
    [TestClass]
    public class BaseViewModelTests
    {
        private Mock<ILogger<BaseViewModel>> _mockLogger;
        private TestableBaseViewModel _viewModel;

        [TestInitialize]
        public void Setup()
        {
            _mockLogger = new Mock<ILogger<BaseViewModel>>();
            _viewModel = new TestableBaseViewModel(_mockLogger.Object);
        }

        [TestMethod]
        public void Constructor_InitializesPropertiesCorrectly()
        {
            // Arrange & Act
            var vm = new TestableBaseViewModel(_mockLogger.Object);

            // Assert
            Assert.IsNotNull(vm);
            Assert.IsFalse(vm.IsLoading);
            Assert.AreEqual("Loading...", vm.LoadingMessage);
            Assert.AreEqual(0, vm.LoadingProgress);
            Assert.AreEqual(string.Empty, vm.StatusMessage);
            Assert.IsFalse(vm.HasErrors);
            Assert.AreEqual(string.Empty, vm.ErrorMessage);
            Assert.IsFalse(vm.HasData);
            Assert.IsTrue(vm.HasNoData);
            Assert.IsTrue(vm.CanClose);
        }

        [TestMethod]
        public void SetProperty_ChangesValueAndRaisesEvent()
        {
            // Arrange
            var propertyChangedRaised = false;
            string changedPropertyName = null;
            _viewModel.PropertyChanged += (sender, args) =>
            {
                propertyChangedRaised = true;
                changedPropertyName = args.PropertyName;
            };

            // Act
            _viewModel.TestStringProperty = "New Value";

            // Assert
            Assert.IsTrue(propertyChangedRaised);
            Assert.AreEqual(nameof(_viewModel.TestStringProperty), changedPropertyName);
            Assert.AreEqual("New Value", _viewModel.TestStringProperty);
        }

        [TestMethod]
        public void SetProperty_DoesNotRaiseEventWhenValueUnchanged()
        {
            // Arrange
            var propertyChangedRaised = false;
            _viewModel.PropertyChanged += (sender, args) => propertyChangedRaised = true;

            // Set initial value
            _viewModel.TestStringProperty = "Initial Value";

            // Act - set same value again
            _viewModel.TestStringProperty = "Initial Value";

            // Assert
            Assert.IsFalse(propertyChangedRaised);
        }

        [TestMethod]
        public void SetProperty_WithAction_ExecutesActionOnChange()
        {
            // Arrange
            var actionExecuted = false;
            var testVm = new TestableBaseViewModel(_mockLogger.Object);
            testVm.SetTestAction(() => actionExecuted = true);

            // Act
            testVm.TestStringProperty = "Trigger Action";

            // Assert
            Assert.IsTrue(actionExecuted);
        }

        [TestMethod]
        public void OnPropertyChanged_Immediate_RaisesEvent()
        {
            // Arrange
            var propertyChangedRaised = false;
            string changedPropertyName = null;
            _viewModel.PropertyChanged += (sender, args) =>
            {
                propertyChangedRaised = true;
                changedPropertyName = args.PropertyName;
            };

            // Act
            _viewModel.RaiseTestPropertyChanged();

            // Assert
            Assert.IsTrue(propertyChangedRaised);
            Assert.AreEqual("TestProperty", changedPropertyName);
        }

        [TestMethod]
        public void OnPropertyChangedBatched_QueuesNotifications()
        {
            // Arrange
            var propertyChangedRaised = false;
            string changedPropertyName = null;
            _viewModel.PropertyChanged += (sender, args) =>
            {
                propertyChangedRaised = true;
                changedPropertyName = args.PropertyName;
            };

            // Act - Queue multiple notifications
            _viewModel.QueueTestPropertyChanged();
            _viewModel.QueueAnotherPropertyChanged();

            // Wait for timer to process (this is a bit of a hack for testing)
            System.Threading.Thread.Sleep(100);

            // Assert that FlushPendingNotifications works
            _viewModel.FlushPendingNotifications();
        }

        [TestMethod]
        public void IsLoading_PropertyChanges_UpdateHasNoData()
        {
            // Arrange
            _viewModel.HasData = false;
            Assert.IsTrue(_viewModel.HasNoData);

            // Act
            _viewModel.IsLoading = true;

            // Assert - should still be true when loading
            Assert.IsTrue(_viewModel.HasNoData);

            // Act
            _viewModel.IsLoading = false;

            // Assert - should still be true when not loading and no data
            Assert.IsTrue(_viewModel.HasNoData);
        }

        [TestMethod]
        public void HasData_PropertyChanges_UpdateHasNoData()
        {
            // Arrange
            _viewModel.IsLoading = false;
            Assert.IsTrue(_viewModel.HasNoData);

            // Act
            _viewModel.HasData = true;

            // Assert
            Assert.IsFalse(_viewModel.HasNoData);
        }

        [TestMethod]
        public async Task ExecuteAsync_SuccessfulOperation_UpdatesStatus()
        {
            // Arrange
            var operationCompleted = false;
            Func<Task> operation = async () =>
            {
                await Task.Delay(10);
                operationCompleted = true;
            };

            // Act
            var task = _viewModel.ExecuteTestAsync(operation, "Test Operation");

            // Wait for completion
            await task;

            // Assert
            Assert.IsTrue(operationCompleted);
            Assert.IsFalse(_viewModel.IsLoading);
            Assert.IsFalse(_viewModel.HasErrors);
            Assert.AreEqual("Test Operation completed successfully", _viewModel.StatusMessage);
        }

        [TestMethod]
        public async Task ExecuteAsync_FailedOperation_UpdatesErrorState()
        {
            // Arrange
            var operationCompleted = false;
            Func<Task> operation = async () =>
            {
                await Task.Delay(10);
                operationCompleted = true;
                throw new InvalidOperationException("Test error");
            };

            // Act & Assert
            var task = _viewModel.ExecuteTestAsync(operation, "Test Operation");
            await task;

            // Assert
            Assert.IsTrue(operationCompleted);
            Assert.IsFalse(_viewModel.IsLoading);
            Assert.IsTrue(_viewModel.HasErrors);
            Assert.AreEqual("Test error", _viewModel.ErrorMessage);
            Assert.IsTrue(_viewModel.StatusMessage.Contains("failed"));
        }

        [TestMethod]
        public async Task ExecuteAsyncWithResult_SuccessfulOperation_ReturnsResult()
        {
            // Arrange
            var expectedResult = "Test Result";
            Func<Task<string>> operation = async () => await Task.FromResult(expectedResult);

            // Act
            var result = await _viewModel.ExecuteTestAsync(operation, "Test Operation", "Default");

            // Assert
            Assert.AreEqual(expectedResult, result);
            Assert.IsFalse(_viewModel.HasErrors);
        }

        [TestMethod]
        public void ClearErrors_ResetsErrorState()
        {
            // Arrange
            _viewModel.HasErrors = true;
            _viewModel.ErrorMessage = "Test error";
            _viewModel.StatusMessage = "Test status";

            // Act
            _viewModel.ClearErrors();

            // Assert
            Assert.IsFalse(_viewModel.HasErrors);
            Assert.AreEqual(string.Empty, _viewModel.ErrorMessage);
            Assert.AreEqual(string.Empty, _viewModel.StatusMessage);
        }

        [TestMethod]
        public void RelayCommand_CanExecuteWithoutCondition_AlwaysTrue()
        {
            // Arrange
            var command = new BaseViewModel.RelayCommand(() => { });

            // Act & Assert
            Assert.IsTrue(command.CanExecute(null));
        }

        [TestMethod]
        public void RelayCommand_CanExecuteWithCondition_UsesCondition()
        {
            // Arrange
            var canExecute = false;
            var command = new BaseViewModel.RelayCommand(() => { }, () => canExecute);

            // Act & Assert
            Assert.IsFalse(command.CanExecute(null));

            canExecute = true;
            Assert.IsTrue(command.CanExecute(null));
        }

        [TestMethod]
        public void RelayCommand_Execute_CallsAction()
        {
            // Arrange
            var executed = false;
            var command = new BaseViewModel.RelayCommand(() => executed = true);

            // Act
            command.Execute(null);

            // Assert
            Assert.IsTrue(executed);
        }

        [TestMethod]
        public void RelayCommandWithParameter_Execute_CallsActionWithParameter()
        {
            // Arrange
            string receivedParameter = null;
            var command = new BaseViewModel.RelayCommand<string>(param => receivedParameter = param);

            // Act
            command.Execute("Test Parameter");

            // Assert
            Assert.AreEqual("Test Parameter", receivedParameter);
        }

        [TestMethod]
        public void AsyncRelayCommand_InitialState_CanExecute()
        {
            // Arrange
            var command = new BaseViewModel.AsyncRelayCommand(async () => await Task.Delay(1));

            // Act & Assert
            Assert.IsTrue(command.CanExecute(null));
        }

        [TestMethod]
        public void AsyncRelayCommand_DuringExecution_CannotExecute()
        {
            // Arrange
            var command = new BaseViewModel.AsyncRelayCommand(async () =>
            {
                await Task.Delay(100); // Long running operation
            });

            // Act - Start execution
            command.Execute(null);

            // Assert - Should not be able to execute while running
            Assert.IsFalse(command.CanExecute(null));
        }

        [TestMethod]
        public void AsyncRelayCommand_AfterExecution_CanExecuteAgain()
        {
            // Arrange
            var command = new BaseViewModel.AsyncRelayCommand(async () => await Task.Delay(10));

            // Act
            command.Execute(null);

            // Wait for completion
            System.Threading.Thread.Sleep(50);

            // Assert - Should be able to execute again
            Assert.IsTrue(command.CanExecute(null));
        }

        [TestMethod]
        public void Dispose_CleansUpResources()
        {
            // Arrange - Create a viewModel with timer
            var vm = new TestableBaseViewModel(_mockLogger.Object);

            // Act
            vm.Dispose();

            // Assert
            Assert.IsTrue(vm.IsDisposed);
        }

        [TestMethod]
        public void Dispose_ThrowsIfDisposed()
        {
            // Arrange
            _viewModel.Dispose();

            // Act & Assert
            Assert.ThrowsException<ObjectDisposedException>(() => _viewModel.ThrowIfDisposed());
        }

        [TestMethod]
        public void HeaderWarnings_CollectionOperations()
        {
            // Arrange
            var warnings = _viewModel.HeaderWarnings;

            // Act
            warnings.Add("Warning 1");
            warnings.Add("Warning 2");

            // Assert
            Assert.AreEqual(2, warnings.Count);
            Assert.AreEqual("Warning 1", warnings[0]);
        }

        // Test helper class
        private class TestableBaseViewModel : BaseViewModel
        {
            public TestableBaseViewModel(ILogger logger) : base(logger) { }

            private string _testStringProperty;
            public string TestStringProperty
            {
                get => _testStringProperty;
                set => SetProperty(ref _testStringProperty, value);
            }

            private Action _testAction;
            public void SetTestAction(Action action) => _testAction = action;

            protected override bool SetProperty<T>(ref T field, T value, Action onChanged, string propertyName = null)
            {
                var result = base.SetProperty(ref field, value, propertyName);
                if (result && onChanged != null)
                {
                    onChanged();
                }
                return result;
            }

            public void RaiseTestPropertyChanged() => OnPropertyChanged("TestProperty");
            public void QueueTestPropertyChanged() => OnPropertyChangedBatched("TestProperty");
            public void QueueAnotherPropertyChanged() => OnPropertyChangedBatched("AnotherProperty");

            public async Task ExecuteTestAsync(Func<Task> operation, string operationName)
            {
                await ExecuteAsync(operation, operationName);
            }

            public async Task<T> ExecuteTestAsync<T>(Func<Task<T>> operation, string operationName, T defaultValue = default)
            {
                return await ExecuteAsync(operation, operationName, defaultValue);
            }

            public bool IsDisposed { get; private set; }

            protected override void Dispose(bool disposing)
            {
                IsDisposed = true;
                base.Dispose(disposing);
            }
        }
    }
}
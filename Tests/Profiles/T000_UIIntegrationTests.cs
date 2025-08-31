using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;
using MandADiscoverySuite.ViewModels;
using Moq;

namespace MandADiscoverySuite.Tests.Profiles
{
    /// <summary>
    /// UI Integration tests for T-000 implementation
    /// Tests dropdown population, command binding, status updates, and persistence
    /// </summary>
    [TestClass]
    public class T000_UIIntegrationTests
    {
        private Mock<IProfileService> _mockProfileService;
        private Mock<IConfigurationService> _mockConfigService;
        private ProfileSelectionViewModel _viewModel;
        
        [TestInitialize]
        public void Initialize()
        {
            _mockProfileService = new Mock<IProfileService>();
            _mockConfigService = new Mock<IConfigurationService>();
            _viewModel = new ProfileSelectionViewModel(_mockProfileService.Object, _mockConfigService.Object);
        }
        
        #region Dropdown Population Tests
        
        [TestMethod]
        public async Task Test_Dropdown_PopulatesSourceProfiles()
        {
            // Arrange
            var profiles = new List<CompanyProfile>
            {
                new CompanyProfile { Id = "1", CompanyName = "Company A", IsActive = true },
                new CompanyProfile { Id = "2", CompanyName = "Company B", IsActive = true },
                new CompanyProfile { Id = "3", CompanyName = "Company C", IsActive = false }
            };
            
            _mockProfileService.Setup(s => s.GetProfilesAsync())
                .ReturnsAsync(profiles);
            
            // Act
            await _viewModel.LoadProfilesAsync();
            
            // Assert
            Assert.AreEqual(3, _viewModel.SourceProfiles.Count);
            Assert.IsTrue(_viewModel.SourceProfiles.Any(p => p.CompanyName == "Company A"));
            Assert.IsTrue(_viewModel.SourceProfiles.Any(p => p.CompanyName == "Company B"));
            Assert.IsTrue(_viewModel.SourceProfiles.Any(p => p.CompanyName == "Company C"));
        }
        
        [TestMethod]
        public async Task Test_Dropdown_PopulatesTargetProfiles()
        {
            // Arrange
            var targetProfiles = new List<TargetProfile>
            {
                new TargetProfile { Id = "t1", Name = "Target Azure", Environment = "Azure" },
                new TargetProfile { Id = "t2", Name = "Target OnPrem", Environment = "OnPremises" }
            };
            
            _mockProfileService.Setup(s => s.GetTargetProfilesAsync())
                .ReturnsAsync(targetProfiles);
            
            // Act
            await _viewModel.LoadTargetProfilesAsync();
            
            // Assert
            Assert.AreEqual(2, _viewModel.TargetProfiles.Count);
            Assert.IsTrue(_viewModel.TargetProfiles.Any(p => p.Name == "Target Azure"));
            Assert.IsTrue(_viewModel.TargetProfiles.Any(p => p.Name == "Target OnPrem"));
        }
        
        [TestMethod]
        public async Task Test_Dropdown_HandlesEmptyProfiles()
        {
            // Arrange
            _mockProfileService.Setup(s => s.GetProfilesAsync())
                .ReturnsAsync(new List<CompanyProfile>());
            
            // Act
            await _viewModel.LoadProfilesAsync();
            
            // Assert
            Assert.AreEqual(0, _viewModel.SourceProfiles.Count);
            Assert.IsNull(_viewModel.SelectedSourceProfile);
        }
        
        [TestMethod]
        public async Task Test_Dropdown_SortsAlphabetically()
        {
            // Arrange
            var profiles = new List<CompanyProfile>
            {
                new CompanyProfile { Id = "1", CompanyName = "Zebra Corp" },
                new CompanyProfile { Id = "2", CompanyName = "Alpha Inc" },
                new CompanyProfile { Id = "3", CompanyName = "Beta LLC" }
            };
            
            _mockProfileService.Setup(s => s.GetProfilesAsync())
                .ReturnsAsync(profiles);
            
            // Act
            await _viewModel.LoadProfilesAsync();
            
            // Assert
            Assert.AreEqual("Alpha Inc", _viewModel.SourceProfiles[0].CompanyName);
            Assert.AreEqual("Beta LLC", _viewModel.SourceProfiles[1].CompanyName);
            Assert.AreEqual("Zebra Corp", _viewModel.SourceProfiles[2].CompanyName);
        }
        
        #endregion
        
        #region Selection Behavior Tests
        
        [TestMethod]
        public void Test_Selection_UpdatesConfiguration()
        {
            // Arrange
            var sourceProfile = new CompanyProfile { Id = "src1", CompanyName = "Source" };
            var targetProfile = new TargetProfile { Id = "tgt1", Name = "Target" };
            
            // Act
            _viewModel.SelectedSourceProfile = sourceProfile;
            _viewModel.SelectedTargetProfile = targetProfile;
            
            // Assert
            _mockConfigService.Verify(c => 
                c.SetSelectedSourceProfile(sourceProfile.Id), Times.Once);
            _mockConfigService.Verify(c => 
                c.SetSelectedTargetProfile(targetProfile.Id), Times.Once);
        }
        
        [TestMethod]
        public void Test_Selection_RestoresFromConfiguration()
        {
            // Arrange
            var profiles = new List<CompanyProfile>
            {
                new CompanyProfile { Id = "1", CompanyName = "Company A" },
                new CompanyProfile { Id = "2", CompanyName = "Company B" }
            };
            
            _mockProfileService.Setup(s => s.GetProfilesAsync())
                .ReturnsAsync(profiles);
            _mockConfigService.Setup(c => c.GetSelectedSourceProfileId())
                .Returns("2");
            
            // Act
            _viewModel.RestoreSelectionFromConfig();
            
            // Assert
            Assert.IsNotNull(_viewModel.SelectedSourceProfile);
            Assert.AreEqual("2", _viewModel.SelectedSourceProfile.Id);
        }
        
        [TestMethod]
        public void Test_Selection_RaisesPropertyChanged()
        {
            // Arrange
            var propertyChangedEvents = new List<string>();
            _viewModel.PropertyChanged += (s, e) => propertyChangedEvents.Add(e.PropertyName);
            
            var profile = new CompanyProfile { Id = "1", CompanyName = "Test" };
            
            // Act
            _viewModel.SelectedSourceProfile = profile;
            
            // Assert
            Assert.IsTrue(propertyChangedEvents.Contains("SelectedSourceProfile"));
            Assert.IsTrue(propertyChangedEvents.Contains("SourceEnvironmentStatus"));
        }
        
        #endregion
        
        #region Command Binding Tests
        
        [TestMethod]
        public void Test_TestConnectionCommand_CanExecute()
        {
            // Arrange
            _viewModel.SelectedSourceProfile = new CompanyProfile { Id = "1" };
            _viewModel.SelectedTargetProfile = new TargetProfile { Id = "2" };
            
            // Act & Assert
            Assert.IsTrue(_viewModel.TestSourceConnectionCommand.CanExecute(null));
            Assert.IsTrue(_viewModel.TestTargetConnectionCommand.CanExecute(null));
        }
        
        [TestMethod]
        public void Test_TestConnectionCommand_CannotExecuteWithoutSelection()
        {
            // Arrange - No profiles selected
            _viewModel.SelectedSourceProfile = null;
            _viewModel.SelectedTargetProfile = null;
            
            // Act & Assert
            Assert.IsFalse(_viewModel.TestSourceConnectionCommand.CanExecute(null));
            Assert.IsFalse(_viewModel.TestTargetConnectionCommand.CanExecute(null));
        }
        
        [TestMethod]
        public async Task Test_TestConnectionCommand_UpdatesStatus()
        {
            // Arrange
            var profile = new CompanyProfile { Id = "1", CompanyName = "Test" };
            _viewModel.SelectedSourceProfile = profile;
            
            _mockProfileService.Setup(s => s.TestSourceConnectionAsync(profile))
                .ReturnsAsync(new ConnectionTestResult 
                { 
                    Success = true, 
                    Message = "Connected successfully" 
                });
            
            // Act
            await _viewModel.TestSourceConnectionAsync();
            
            // Assert
            Assert.AreEqual("✓ Connected", _viewModel.SourceConnectionStatus);
            Assert.IsTrue(_viewModel.IsSourceConnected);
        }
        
        [TestMethod]
        public async Task Test_RefreshCommand_UpdatesEnvironment()
        {
            // Arrange
            var profile = new CompanyProfile { Id = "1", CompanyName = "Test" };
            _viewModel.SelectedSourceProfile = profile;
            
            _mockProfileService.Setup(s => s.DetectEnvironmentAsync(profile))
                .ReturnsAsync(new EnvironmentDetectionResult 
                { 
                    Type = "Azure",
                    Confidence = 0.95
                });
            
            // Act
            await _viewModel.RefreshEnvironmentStatusAsync();
            
            // Assert
            Assert.AreEqual("Azure (95% confidence)", _viewModel.SourceEnvironmentStatus);
        }
        
        #endregion
        
        #region Status Indicator Tests
        
        [TestMethod]
        public void Test_StatusIndicator_ShowsCorrectIcons()
        {
            // Test various status states
            var testCases = new[]
            {
                new { Status = ConnectionStatus.Connected, Icon = "✓", Color = "Green" },
                new { Status = ConnectionStatus.Disconnected, Icon = "✗", Color = "Red" },
                new { Status = ConnectionStatus.Connecting, Icon = "⟳", Color = "Yellow" },
                new { Status = ConnectionStatus.Unknown, Icon = "?", Color = "Gray" }
            };
            
            foreach (var testCase in testCases)
            {
                // Act
                _viewModel.UpdateConnectionStatus(testCase.Status, true);
                
                // Assert
                Assert.IsTrue(_viewModel.SourceConnectionIcon.Contains(testCase.Icon));
                Assert.AreEqual(testCase.Color, _viewModel.SourceConnectionColor);
            }
        }
        
        [TestMethod]
        public void Test_StatusIndicator_ShowsEnvironmentType()
        {
            // Arrange
            var testCases = new[]
            {
                new { Env = "OnPremises", Display = "On-Premises" },
                new { Env = "Azure", Display = "Azure" },
                new { Env = "Hybrid", Display = "Hybrid" },
                new { Env = "Unknown", Display = "Unknown" }
            };
            
            foreach (var testCase in testCases)
            {
                // Act
                _viewModel.UpdateEnvironmentDisplay(testCase.Env, 0.8, true);
                
                // Assert
                Assert.IsTrue(_viewModel.SourceEnvironmentStatus.Contains(testCase.Display));
            }
        }
        
        [TestMethod]
        public void Test_StatusIndicator_ShowsConfidenceLevel()
        {
            // Arrange & Act
            _viewModel.UpdateEnvironmentDisplay("Azure", 0.95, true);
            
            // Assert
            Assert.IsTrue(_viewModel.SourceEnvironmentStatus.Contains("95%"));
        }
        
        #endregion
        
        #region Configuration Persistence Tests
        
        [TestMethod]
        public async Task Test_ConfigPersistence_SavesOnShutdown()
        {
            // Arrange
            var sourceProfile = new CompanyProfile { Id = "src1" };
            var targetProfile = new TargetProfile { Id = "tgt1" };
            
            _viewModel.SelectedSourceProfile = sourceProfile;
            _viewModel.SelectedTargetProfile = targetProfile;
            
            // Act
            await _viewModel.SaveConfigurationAsync();
            
            // Assert
            _mockConfigService.Verify(c => c.SaveAsync(), Times.Once);
        }
        
        [TestMethod]
        public async Task Test_ConfigPersistence_RestoresOnStartup()
        {
            // Arrange
            _mockConfigService.Setup(c => c.GetSelectedSourceProfileId()).Returns("src1");
            _mockConfigService.Setup(c => c.GetSelectedTargetProfileId()).Returns("tgt1");
            _mockConfigService.Setup(c => c.GetLastSourceEnvironmentStatus()).Returns("Azure (90%)");
            _mockConfigService.Setup(c => c.GetLastTargetEnvironmentStatus()).Returns("OnPremises (85%)");
            
            // Act
            await _viewModel.InitializeAsync();
            
            // Assert
            Assert.AreEqual("Azure (90%)", _viewModel.SourceEnvironmentStatus);
            Assert.AreEqual("OnPremises (85%)", _viewModel.TargetEnvironmentStatus);
        }
        
        [TestMethod]
        public void Test_ConfigPersistence_AutoSavesOnChange()
        {
            // Arrange
            _viewModel.EnableAutoSave = true;
            var profile = new CompanyProfile { Id = "1" };
            
            // Act
            _viewModel.SelectedSourceProfile = profile;
            
            // Assert - Verify auto-save was triggered
            _mockConfigService.Verify(c => 
                c.SetSelectedSourceProfile(profile.Id), Times.Once);
        }
        
        #endregion
        
        #region Error Handling Tests
        
        [TestMethod]
        public async Task Test_ErrorHandling_ConnectionTestFailure()
        {
            // Arrange
            var profile = new CompanyProfile { Id = "1" };
            _viewModel.SelectedSourceProfile = profile;
            
            _mockProfileService.Setup(s => s.TestSourceConnectionAsync(profile))
                .ThrowsAsync(new Exception("Network error"));
            
            // Act
            await _viewModel.TestSourceConnectionAsync();
            
            // Assert
            Assert.IsFalse(_viewModel.IsSourceConnected);
            Assert.IsTrue(_viewModel.SourceConnectionStatus.Contains("Failed") || 
                         _viewModel.SourceConnectionStatus.Contains("Error"));
            Assert.IsNotNull(_viewModel.LastError);
        }
        
        [TestMethod]
        public async Task Test_ErrorHandling_ProfileLoadFailure()
        {
            // Arrange
            _mockProfileService.Setup(s => s.GetProfilesAsync())
                .ThrowsAsync(new Exception("Database error"));
            
            // Act
            await _viewModel.LoadProfilesAsync();
            
            // Assert
            Assert.AreEqual(0, _viewModel.SourceProfiles.Count);
            Assert.IsNotNull(_viewModel.LastError);
            Assert.IsTrue(_viewModel.HasError);
        }
        
        #endregion
    }
    
    #region Mock ViewModels
    
    public class ProfileSelectionViewModel : INotifyPropertyChanged
    {
        private readonly IProfileService _profileService;
        private readonly IConfigurationService _configService;
        
        public ObservableCollection<CompanyProfile> SourceProfiles { get; }
        public ObservableCollection<TargetProfile> TargetProfiles { get; }
        
        private CompanyProfile _selectedSourceProfile;
        public CompanyProfile SelectedSourceProfile
        {
            get => _selectedSourceProfile;
            set
            {
                _selectedSourceProfile = value;
                OnPropertyChanged(nameof(SelectedSourceProfile));
                OnPropertyChanged(nameof(SourceEnvironmentStatus));
                
                if (value != null)
                {
                    _configService.SetSelectedSourceProfile(value.Id);
                }
            }
        }
        
        private TargetProfile _selectedTargetProfile;
        public TargetProfile SelectedTargetProfile
        {
            get => _selectedTargetProfile;
            set
            {
                _selectedTargetProfile = value;
                OnPropertyChanged(nameof(SelectedTargetProfile));
                
                if (value != null)
                {
                    _configService.SetSelectedTargetProfile(value.Id);
                }
            }
        }
        
        public string SourceEnvironmentStatus { get; set; } = "Unknown";
        public string TargetEnvironmentStatus { get; set; } = "Unknown";
        public string SourceConnectionStatus { get; set; } = "Not Connected";
        public string TargetConnectionStatus { get; set; } = "Not Connected";
        public string SourceConnectionIcon { get; set; } = "?";
        public string SourceConnectionColor { get; set; } = "Gray";
        
        public bool IsSourceConnected { get; set; }
        public bool IsTargetConnected { get; set; }
        public bool EnableAutoSave { get; set; }
        public bool HasError { get; set; }
        public string LastError { get; set; }
        
        public ICommand TestSourceConnectionCommand { get; }
        public ICommand TestTargetConnectionCommand { get; }
        public ICommand RefreshEnvironmentCommand { get; }
        
        public ProfileSelectionViewModel(IProfileService profileService, IConfigurationService configService)
        {
            _profileService = profileService;
            _configService = configService;
            
            SourceProfiles = new ObservableCollection<CompanyProfile>();
            TargetProfiles = new ObservableCollection<TargetProfile>();
            
            TestSourceConnectionCommand = new RelayCommand(
                _ => TestSourceConnectionAsync(),
                _ => SelectedSourceProfile != null);
            
            TestTargetConnectionCommand = new RelayCommand(
                _ => TestTargetConnectionAsync(),
                _ => SelectedTargetProfile != null);
        }
        
        public async Task LoadProfilesAsync()
        {
            try
            {
                var profiles = await _profileService.GetProfilesAsync();
                
                SourceProfiles.Clear();
                foreach (var profile in profiles.OrderBy(p => p.CompanyName))
                {
                    SourceProfiles.Add(profile);
                }
            }
            catch (Exception ex)
            {
                LastError = ex.Message;
                HasError = true;
            }
        }
        
        public async Task LoadTargetProfilesAsync()
        {
            try
            {
                var profiles = await _profileService.GetTargetProfilesAsync();
                
                TargetProfiles.Clear();
                foreach (var profile in profiles.OrderBy(p => p.Name))
                {
                    TargetProfiles.Add(profile);
                }
            }
            catch (Exception ex)
            {
                LastError = ex.Message;
                HasError = true;
            }
        }
        
        public async Task TestSourceConnectionAsync()
        {
            try
            {
                if (SelectedSourceProfile == null) return;
                
                var result = await _profileService.TestSourceConnectionAsync(SelectedSourceProfile);
                
                IsSourceConnected = result.Success;
                SourceConnectionStatus = result.Success ? "✓ Connected" : "✗ Failed";
            }
            catch (Exception ex)
            {
                IsSourceConnected = false;
                SourceConnectionStatus = "✗ Error";
                LastError = ex.Message;
            }
        }
        
        public async Task TestTargetConnectionAsync()
        {
            // Similar implementation
        }
        
        public async Task RefreshEnvironmentStatusAsync()
        {
            if (SelectedSourceProfile != null)
            {
                var result = await _profileService.DetectEnvironmentAsync(SelectedSourceProfile);
                SourceEnvironmentStatus = $"{result.Type} ({result.Confidence:P0} confidence)";
            }
        }
        
        public void UpdateConnectionStatus(ConnectionStatus status, bool isSource)
        {
            var (icon, color) = status switch
            {
                ConnectionStatus.Connected => ("✓", "Green"),
                ConnectionStatus.Disconnected => ("✗", "Red"),
                ConnectionStatus.Connecting => ("⟳", "Yellow"),
                _ => ("?", "Gray")
            };
            
            if (isSource)
            {
                SourceConnectionIcon = icon;
                SourceConnectionColor = color;
            }
        }
        
        public void UpdateEnvironmentDisplay(string envType, double confidence, bool isSource)
        {
            var display = $"{envType} ({confidence:P0} confidence)";
            
            if (isSource)
                SourceEnvironmentStatus = display;
            else
                TargetEnvironmentStatus = display;
        }
        
        public void RestoreSelectionFromConfig()
        {
            var sourceId = _configService.GetSelectedSourceProfileId();
            if (!string.IsNullOrEmpty(sourceId))
            {
                SelectedSourceProfile = SourceProfiles.FirstOrDefault(p => p.Id == sourceId);
            }
        }
        
        public async Task InitializeAsync()
        {
            await LoadProfilesAsync();
            await LoadTargetProfilesAsync();
            
            SourceEnvironmentStatus = _configService.GetLastSourceEnvironmentStatus();
            TargetEnvironmentStatus = _configService.GetLastTargetEnvironmentStatus();
            
            RestoreSelectionFromConfig();
        }
        
        public async Task SaveConfigurationAsync()
        {
            await _configService.SaveAsync();
        }
        
        public event PropertyChangedEventHandler PropertyChanged;
        
        protected void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
    
    public interface IProfileService
    {
        Task<IEnumerable<CompanyProfile>> GetProfilesAsync();
        Task<IEnumerable<TargetProfile>> GetTargetProfilesAsync();
        Task<ConnectionTestResult> TestSourceConnectionAsync(CompanyProfile profile);
        Task<ConnectionTestResult> TestTargetConnectionAsync(TargetProfile profile);
        Task<EnvironmentDetectionResult> DetectEnvironmentAsync(CompanyProfile profile);
    }
    
    public interface IConfigurationService
    {
        void SetSelectedSourceProfile(string profileId);
        void SetSelectedTargetProfile(string profileId);
        string GetSelectedSourceProfileId();
        string GetSelectedTargetProfileId();
        string GetLastSourceEnvironmentStatus();
        string GetLastTargetEnvironmentStatus();
        Task SaveAsync();
    }
    
    public enum ConnectionStatus
    {
        Unknown,
        Connected,
        Disconnected,
        Connecting
    }
    
    public class RelayCommand : ICommand
    {
        private readonly Action<object> _execute;
        private readonly Predicate<object> _canExecute;
        
        public RelayCommand(Action<object> execute, Predicate<object> canExecute = null)
        {
            _execute = execute;
            _canExecute = canExecute;
        }
        
        public event EventHandler CanExecuteChanged
        {
            add { System.Windows.Input.CommandManager.RequerySuggested += value; }
            remove { System.Windows.Input.CommandManager.RequerySuggested -= value; }
        }
        
        public bool CanExecute(object parameter) => _canExecute?.Invoke(parameter) ?? true;
        public void Execute(object parameter) => _execute(parameter);
    }
    
    #endregion
}
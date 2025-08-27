# M&A Migration Platform Test Suite

This comprehensive test suite validates all components of the M&A Discovery Suite's migration platform, ensuring reliability, performance, and data integrity across GUI components, PowerShell modules, and integration points.

## 📋 Test Structure Overview

```
Tests/Migration/
├── Unit/                           # Unit tests for individual components
│   ├── Models/                     # Data model validation tests
│   │   └── MigrationModelsTests.cs
│   ├── ViewModels/                 # ViewModel behavior tests
│   │   └── MigrateViewModelTests.cs
│   └── Services/                   # Service layer tests
├── PowerShell/                     # Pester tests for PS modules
│   ├── MailboxMigration/
│   │   └── MailboxMigration.Tests.ps1
│   ├── SharePointMigration/
│   │   └── SharePointMigration.Tests.ps1
│   └── [Other Module Tests]/
├── Integration/                    # Cross-component integration tests
│   └── MigrationIntegrationTests.cs
├── Functional/                     # End-to-end workflow tests
├── Performance/                    # Load and performance tests
├── TestData/                       # Test data generators
│   └── TestDataGenerator.cs
├── Mocks/                          # Mock services and data
│   └── MockPowerShellModules.cs
├── Helpers/                        # Test utilities
├── MigrationTestSuite.csproj      # Test project file
└── Run-MigrationTests.ps1         # Automated test runner
```

## 🚀 Quick Start

### Prerequisites

1. **.NET 6.0 SDK** or later
2. **PowerShell 5.1** or later
3. **Pester 5.0** or later
4. **Visual Studio** or **VS Code** (recommended for development)

### Installation

```powershell
# Install required PowerShell modules
Install-Module Pester -Force -SkipPublisherCheck
Install-Module Microsoft.PowerShell.ConsoleGuiTools

# Navigate to test directory
cd "D:\Scripts\UserMandA\Tests\Migration"

# Restore NuGet packages
dotnet restore
```

### Running Tests

#### Run All Tests
```powershell
.\Run-MigrationTests.ps1 -TestType All -GenerateReport -OutputPath "C:\TestResults"
```

#### Run Specific Test Types
```powershell
# Run only unit tests
.\Run-MigrationTests.ps1 -TestType Unit

# Run only PowerShell module tests
.\Run-MigrationTests.ps1 -TestType PowerShell -Parallel

# Run integration tests
.\Run-MigrationTests.ps1 -TestType Integration

# Run performance tests
.\Run-MigrationTests.ps1 -TestType Performance

# Run build validation
.\Run-MigrationTests.ps1 -TestType Build
```

#### Advanced Options
```powershell
# Run with code coverage
.\Run-MigrationTests.ps1 -TestType All -Coverage -GenerateReport

# Run in parallel mode
.\Run-MigrationTests.ps1 -TestType PowerShell -Parallel

# Continue on failure (for CI/CD)
.\Run-MigrationTests.ps1 -TestType All -ContinueOnFailure
```

## 📊 Test Categories

### 1. Unit Tests

**Purpose**: Test individual components in isolation

**Coverage**:
- **Data Models**: All migration-related model classes
  - Property change notifications
  - Data validation
  - Enumeration values
  - Calculated properties
  
- **ViewModels**: MVVM pattern compliance
  - Command execution
  - Property binding
  - Tab navigation
  - Error handling
  
- **Services**: Business logic validation
  - Data transformation
  - File operations
  - Configuration management

**Example**:
```csharp
[TestMethod]
public void MigrationMetrics_PropertyChanged_ShouldFireWhenPropertyUpdated()
{
    // Arrange
    var metrics = new MigrationMetrics();
    var propertyChangedEvents = new List<string>();
    metrics.PropertyChanged += (sender, e) => propertyChangedEvents.Add(e.PropertyName);

    // Act
    metrics.TotalProjects = 10;

    // Assert
    propertyChangedEvents.Should().Contain("TotalProjects");
}
```

### 2. PowerShell Module Tests

**Purpose**: Validate PowerShell migration modules using Pester framework

**Coverage**:
- **MailboxMigration.psm1**: Exchange migration functionality
- **SharePointMigration.psm1**: SharePoint content migration
- **FileSystemMigration.psm1**: File share migration
- **UserMigration.psm1**: User account migration
- **UserProfileMigration.psm1**: User profile migration
- **VirtualMachineMigration.psm1**: VM migration capabilities

**Test Types**:
- Function parameter validation
- Return object structure verification
- Error handling scenarios
- Mock-based isolated testing
- Performance benchmarks

**Example**:
```powershell
Describe "MailboxMigration Class" {
    Context "Constructor and Initialization" {
        It "Should create instance with valid migration type" {
            $migration = [MailboxMigration]::new("CloudToCloud")
            
            $migration | Should -Not -BeNullOrEmpty
            $migration.MigrationType | Should -Be "CloudToCloud"
        }
    }
}
```

### 3. Integration Tests

**Purpose**: Test interaction between GUI and PowerShell components

**Coverage**:
- GUI to PowerShell communication
- Data flow validation
- Cross-component error handling
- Real-time progress updates
- Complex object serialization

**Key Scenarios**:
- Executing PowerShell scripts from C# GUI
- Passing complex migration objects between layers
- Handling PowerShell timeouts and errors
- Validating CSV data loading and transformation

### 4. Functional Tests

**Purpose**: End-to-end migration workflow validation

**Coverage**:
- Complete migration project lifecycle
- Wave-based migration execution
- Validation and pre-flight checks
- Report generation and export
- Rollback and recovery scenarios

### 5. Performance Tests

**Purpose**: Ensure system performance under load

**Coverage**:
- Large dataset processing (10,000+ users)
- Memory usage validation
- Concurrent operation handling
- Response time benchmarks
- Resource utilization monitoring

**Benchmarks**:
- Large dataset transformation: < 5 seconds for 10,000 items
- Memory usage: < 100MB increase for 50,000 items
- Concurrent operations: 10 parallel tasks successfully
- GUI responsiveness: UI updates within 100ms

## 🔧 Test Data Generation

The test suite includes comprehensive test data generators for realistic testing scenarios:

### TestDataGenerator Class

```csharp
// Generate realistic user data
var generator = new TestDataGenerator(seed: 42);
var users = generator.GenerateUsers(1000, "contoso.com");

// Generate migration projects
var project = generator.GenerateMigrationProject("Test Migration");

// Export to various formats
generator.ExportUsersToCsv(users, "test_users.csv");
generator.ExportMigrationProjectToJson(project, "test_project.json");
```

### Generated Data Types

- **Users**: Realistic user accounts with departments, managers, contact info
- **Groups**: Security and distribution groups with membership data
- **Migration Projects**: Complete project structures with waves and batches
- **Migration Items**: Various migration types with realistic sizes and properties

## 🎭 Mock Services

Comprehensive mock implementations for testing without external dependencies:

### MockPowerShellExecutor

```csharp
var mockExecutor = new MockPowerShellExecutor();

// Execute mock PowerShell commands
var result = await mockExecutor.ExecuteCommandAsync("Start-MailboxMigration", parameters);

// Returns realistic mock data for testing
```

### Supported Mock Commands

- **Mailbox Migration**: All major mailbox migration operations
- **SharePoint Migration**: Site analysis, content migration, reporting
- **File System Migration**: File scanning, transfer operations, monitoring
- **User Migration**: Account creation, group mapping, license assignment
- **VM Migration**: Infrastructure assessment, migration execution
- **User Profile Migration**: Profile backup, restoration, validation

## 📈 Test Reporting

### Automated Reports

The test runner generates comprehensive reports in multiple formats:

#### JSON Report
```json
{
  "overallStatus": "Passed",
  "duration": "00:15:23",
  "testType": "All",
  "results": [
    {
      "testSuite": "C# Unit Tests",
      "status": "Passed",
      "resultsFile": "CSharpUnitTests.trx"
    }
  ],
  "environment": {
    "powerShellVersion": "7.3.0",
    "dotNetVersion": "6.0.0",
    "operatingSystem": "Microsoft Windows"
  }
}
```

#### HTML Report
- Visual dashboard with color-coded status
- Detailed test suite breakdown
- Environment information
- Performance metrics
- Error details and recommendations

### Test Metrics Tracked

- **Overall Status**: Pass/Fail for entire test suite
- **Test Count**: Total, passed, failed, skipped tests
- **Duration**: Total execution time and per-suite timing
- **Coverage**: Code coverage percentages (when enabled)
- **Performance**: Memory usage, response times, throughput
- **Environment**: Platform details, dependencies, configuration

## 🛠️ Continuous Integration

### CI/CD Integration

```yaml
# Example Azure DevOps pipeline
- task: PowerShell@2
  displayName: 'Run Migration Tests'
  inputs:
    targetType: 'filePath'
    filePath: 'Tests/Migration/Run-MigrationTests.ps1'
    arguments: '-TestType All -GenerateReport -OutputPath "$(Agent.TempDirectory)/TestResults" -ContinueOnFailure'

- task: PublishTestResults@2
  displayName: 'Publish Test Results'
  inputs:
    testResultsFormat: 'VSTest'
    testResultsFiles: '**/*.trx'
    searchFolder: '$(Agent.TempDirectory)/TestResults'
```

### Quality Gates

- **Minimum 80% test pass rate** for build approval
- **Zero critical test failures** for production deployment
- **Performance regression detection** with 10% tolerance
- **Memory leak detection** for long-running operations

## 🔍 Troubleshooting

### Common Issues

#### Test Execution Failures

**Problem**: Tests fail to execute
```
Error: Prerequisites not met
```

**Solution**: 
```powershell
# Install missing prerequisites
Install-Module Pester -Force
winget install Microsoft.DotNet.SDK.6
```

#### PowerShell Module Loading Issues

**Problem**: PowerShell modules fail to load
```
Error: Failed to load module MailboxMigration.psm1
```

**Solution**:
```powershell
# Check execution policy
Get-ExecutionPolicy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Import module manually
Import-Module ".\Modules\Migration\MailboxMigration.psm1" -Force
```

#### Performance Test Timeouts

**Problem**: Performance tests exceed time limits

**Solution**:
1. Reduce test dataset size for development
2. Run performance tests on dedicated hardware
3. Increase timeout values in test configuration

### Debug Mode

Enable verbose logging for troubleshooting:

```powershell
# Run with detailed logging
.\Run-MigrationTests.ps1 -TestType All -Verbose -GenerateReport
```

### Test Data Cleanup

```powershell
# Clean up test artifacts
Remove-Item "TestResults" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "TestData/Generated" -Recurse -Force -ErrorAction SilentlyContinue
```

## 📚 Contributing

### Adding New Tests

1. **Unit Tests**: Create new test classes in appropriate folders
2. **PowerShell Tests**: Follow Pester naming conventions (*.Tests.ps1)
3. **Integration Tests**: Add scenarios to integration test classes
4. **Test Data**: Update TestDataGenerator for new data types

### Test Naming Conventions

```csharp
// C# Test Naming
[TestMethod]
public void ComponentName_Scenario_ExpectedBehavior()

// PowerShell Test Naming
Describe "Component Name" {
    Context "Scenario" {
        It "Should exhibit expected behavior" {
            # Test logic
        }
    }
}
```

### Code Coverage Requirements

- **Minimum 80%** code coverage for new features
- **100%** coverage for critical migration logic
- **Exclude** auto-generated code and external dependencies

## 📋 Test Execution Checklist

### Pre-Migration Testing

- [ ] All unit tests pass
- [ ] PowerShell modules load without errors
- [ ] Integration tests validate data flow
- [ ] Performance tests meet benchmarks
- [ ] Build validation succeeds

### Migration Execution Testing

- [ ] Test connectivity to source and target environments
- [ ] Validate migration project configuration
- [ ] Execute dry-run migration scenarios
- [ ] Verify error handling and rollback procedures
- [ ] Test real-time monitoring and reporting

### Post-Migration Validation

- [ ] Data integrity verification
- [ ] Permission preservation validation
- [ ] Performance impact assessment
- [ ] User acceptance testing
- [ ] Cleanup and documentation

## 🏆 Quality Standards

### Test Quality Metrics

- **Test Coverage**: Minimum 80% for new code
- **Test Execution Time**: Complete suite under 30 minutes
- **Test Reliability**: Less than 5% flaky test rate
- **Test Maintainability**: Clear, readable, well-documented tests

### Best Practices

1. **Isolation**: Tests should not depend on external systems
2. **Repeatability**: Tests should produce consistent results
3. **Performance**: Tests should complete within reasonable time
4. **Coverage**: Critical paths must have comprehensive test coverage
5. **Documentation**: Complex test scenarios should be well-documented

---

## 📞 Support

For questions or issues with the test suite:

1. **Documentation**: Check this README and inline code comments
2. **Logs**: Review test execution logs in the output directory
3. **Issues**: Create detailed issue reports with reproduction steps
4. **Enhancements**: Submit feature requests with clear requirements

---

*This test suite ensures the M&A Migration Platform meets the highest standards of quality, reliability, and performance for enterprise migration scenarios.*
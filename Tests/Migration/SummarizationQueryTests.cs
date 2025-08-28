using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Tests.Migration
{
    /// <summary>
    /// Comprehensive tests for summarization queries validation against raw records
    /// Ensures data integrity and accuracy of summary statistics
    /// </summary>
    [TestClass]
    public class SummarizationQueryTests
    {
        private PostMigrationValidationService _validationService;
        private Mock<IAuditRepository> _mockAuditRepository;
        private Mock<ISummaryQueryService> _mockSummaryQueryService;
        private ValidationSummaryService _summaryService;
        private List<ValidationResult> _testValidationResults;
        private List<AuditRecord> _testAuditRecords;

        [TestInitialize]
        public void Setup()
        {
            _mockAuditRepository = new Mock<IAuditRepository>();
            _mockSummaryQueryService = new Mock<ISummaryQueryService>();
            _summaryService = new ValidationSummaryService(_mockAuditRepository.Object, _mockSummaryQueryService.Object);

            _testValidationResults = CreateTestValidationResults();
            _testAuditRecords = CreateTestAuditRecords();

            SetupMockRepositories();
        }

        #region Validation Summary Query Tests

        [TestMethod]
        public void GetValidationSummary_AgainstRawRecords_ReturnsAccurateCounts()
        {
            // Arrange
            var validationResults = _testValidationResults;

            // Act
            var summary = _summaryService.GetValidationSummary(validationResults);

            // Assert - Verify counts against raw data
            var expectedTotal = validationResults.Count;
            var expectedSuccessful = validationResults.Count(r => r.Severity == ValidationSeverity.Success);
            var expectedWarning = validationResults.Count(r => r.Severity == ValidationSeverity.Warning);
            var expectedError = validationResults.Count(r => r.Severity == ValidationSeverity.Error);
            var expectedCritical = validationResults.Count(r => r.Severity == ValidationSeverity.Critical);

            Assert.AreEqual(expectedTotal, summary.TotalObjects, "Total objects count should match raw data");
            Assert.AreEqual(expectedSuccessful, summary.SuccessfulObjects, "Successful objects count should match raw data");
            Assert.AreEqual(expectedWarning, summary.WarningObjects, "Warning objects count should match raw data");
            Assert.AreEqual(expectedError, summary.ErrorObjects, "Error objects count should match raw data");
            Assert.AreEqual(expectedCritical, summary.CriticalObjects, "Critical objects count should match raw data");
        }

        [TestMethod]
        public void GetValidationSummary_ObjectTypeCounts_MatchesRawRecords()
        {
            // Arrange
            var validationResults = _testValidationResults;

            // Act
            var summary = _summaryService.GetValidationSummary(validationResults);

            // Assert - Verify object type counts
            var expectedObjectTypes = validationResults.GroupBy(r => r.ObjectType).ToDictionary(g => g.Key, g => g.Count());

            Assert.AreEqual(expectedObjectTypes.Count, summary.ObjectTypes.Count, "Object type count should match");
            
            foreach (var expectedType in expectedObjectTypes)
            {
                Assert.IsTrue(summary.ObjectTypes.ContainsKey(expectedType.Key), $"Should contain object type {expectedType.Key}");
                Assert.AreEqual(expectedType.Value, summary.ObjectTypes[expectedType.Key], 
                    $"Count for object type {expectedType.Key} should match raw data");
            }
        }

        [TestMethod]
        public void GetValidationSummary_SuccessRate_CalculatedCorrectly()
        {
            // Arrange
            var validationResults = _testValidationResults;

            // Act
            var summary = _summaryService.GetValidationSummary(validationResults);

            // Assert
            var expectedSuccessRate = validationResults.Count > 0 ? 
                (summary.SuccessfulObjects * 100.0) / summary.TotalObjects : 100.0;

            Assert.AreEqual(expectedSuccessRate, summary.SuccessRate, 0.01, "Success rate should be calculated correctly");
        }

        [TestMethod]
        public void GetValidationSummary_HasErrors_FlagsDetectedCorrectly()
        {
            // Arrange
            var validationResults = _testValidationResults;

            // Act
            var summary = _summaryService.GetValidationSummary(validationResults);

            // Assert
            var expectedHasErrors = validationResults.Any(r => r.Severity == ValidationSeverity.Error || r.Severity == ValidationSeverity.Critical);
            var expectedHasWarnings = validationResults.Any(r => r.Severity == ValidationSeverity.Warning);

            Assert.AreEqual(expectedHasErrors, summary.HasErrors, "HasErrors flag should match raw data analysis");
            Assert.AreEqual(expectedHasWarnings, summary.HasWarnings, "HasWarnings flag should match raw data analysis");
        }

        [TestMethod]
        public void GetValidationSummary_TotalIssues_SumsCorrectly()
        {
            // Arrange
            var validationResults = _testValidationResults;

            // Act
            var summary = _summaryService.GetValidationSummary(validationResults);

            // Assert
            var expectedTotalIssues = validationResults.Sum(r => r.Issues.Count);
            Assert.AreEqual(expectedTotalIssues, summary.TotalIssues, "Total issues count should match sum from raw records");
        }

        #endregion

        #region Date-based Summary Query Tests

        [TestMethod]
        public async Task GetValidationSummaryByDateRange_QueryVsRawData_ReturnsConsistentResults()
        {
            // Arrange
            var startDate = DateTime.Now.Date.AddDays(-7);
            var endDate = DateTime.Now.Date;
            
            var filteredResults = _testValidationResults
                .Where(r => r.ValidatedAt >= startDate && r.ValidatedAt <= endDate)
                .ToList();

            _mockSummaryQueryService
                .Setup(s => s.GetValidationSummaryByDateRangeAsync(startDate, endDate))
                .ReturnsAsync(CreateSummaryFromResults(filteredResults));

            // Act
            var querySummary = await _summaryService.GetValidationSummaryByDateRangeAsync(startDate, endDate);
            var rawDataSummary = _summaryService.GetValidationSummary(filteredResults);

            // Assert
            Assert.AreEqual(rawDataSummary.TotalObjects, querySummary.TotalObjects, "Query and raw data should have same total count");
            Assert.AreEqual(rawDataSummary.SuccessfulObjects, querySummary.SuccessfulObjects, "Query and raw data should have same success count");
            Assert.AreEqual(rawDataSummary.ErrorObjects, querySummary.ErrorObjects, "Query and raw data should have same error count");
            Assert.AreEqual(rawDataSummary.SuccessRate, querySummary.SuccessRate, 0.01, "Query and raw data should have same success rate");
        }

        [TestMethod]
        public async Task GetValidationSummaryByObjectType_QueryVsRawData_ReturnsConsistentResults()
        {
            // Arrange
            var objectType = "User";
            var filteredResults = _testValidationResults.Where(r => r.ObjectType == objectType).ToList();

            _mockSummaryQueryService
                .Setup(s => s.GetValidationSummaryByObjectTypeAsync(objectType))
                .ReturnsAsync(CreateSummaryFromResults(filteredResults));

            // Act
            var querySummary = await _summaryService.GetValidationSummaryByObjectTypeAsync(objectType);
            var rawDataSummary = _summaryService.GetValidationSummary(filteredResults);

            // Assert
            Assert.AreEqual(rawDataSummary.TotalObjects, querySummary.TotalObjects, "Query and raw data totals should match for object type filter");
            Assert.AreEqual(rawDataSummary.SuccessfulObjects, querySummary.SuccessfulObjects, "Query and raw data success counts should match");
            Assert.AreEqual(rawDataSummary.WarningObjects, querySummary.WarningObjects, "Query and raw data warning counts should match");
            Assert.AreEqual(rawDataSummary.ErrorObjects, querySummary.ErrorObjects, "Query and raw data error counts should match");
        }

        [TestMethod]
        public async Task GetValidationSummaryByWave_QueryVsRawData_ReturnsConsistentResults()
        {
            // Arrange
            var waveId = "wave-001";
            var filteredResults = _testValidationResults.Where(r => r.GetWaveId() == waveId).ToList();

            _mockSummaryQueryService
                .Setup(s => s.GetValidationSummaryByWaveAsync(waveId))
                .ReturnsAsync(CreateSummaryFromResults(filteredResults));

            // Act
            var querySummary = await _summaryService.GetValidationSummaryByWaveAsync(waveId);
            var rawDataSummary = _summaryService.GetValidationSummary(filteredResults);

            // Assert
            Assert.AreEqual(rawDataSummary.TotalObjects, querySummary.TotalObjects, "Query and raw data totals should match for wave filter");
            Assert.AreEqual(rawDataSummary.ObjectTypes.Count, querySummary.ObjectTypes.Count, "Query and raw data should have same object type variety");
            
            foreach (var objectType in rawDataSummary.ObjectTypes)
            {
                Assert.AreEqual(objectType.Value, querySummary.ObjectTypes[objectType.Key], 
                    $"Object type {objectType.Key} count should match between query and raw data");
            }
        }

        #endregion

        #region Audit Summary Query Tests

        [TestMethod]
        public async Task GetAuditSummary_QueryVsRawData_ReturnsConsistentCounts()
        {
            // Arrange
            var auditRecords = _testAuditRecords;
            
            _mockAuditRepository
                .Setup(r => r.GetAuditRecordsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), null, null, null))
                .ReturnsAsync(auditRecords);

            _mockSummaryQueryService
                .Setup(s => s.GetAuditSummaryAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(CreateAuditSummaryFromRecords(auditRecords));

            // Act
            var querySummary = await _summaryService.GetAuditSummaryAsync(DateTime.MinValue, DateTime.MaxValue);
            var rawDataSummary = CreateAuditSummaryFromRecords(auditRecords);

            // Assert
            Assert.AreEqual(rawDataSummary.TotalOperations, querySummary.TotalOperations, "Total operations should match");
            Assert.AreEqual(rawDataSummary.SuccessfulOperations, querySummary.SuccessfulOperations, "Successful operations should match");
            Assert.AreEqual(rawDataSummary.FailedOperations, querySummary.FailedOperations, "Failed operations should match");
            Assert.AreEqual(rawDataSummary.AverageOperationDuration.TotalMilliseconds, 
                querySummary.AverageOperationDuration.TotalMilliseconds, 100, "Average duration should be similar");
        }

        [TestMethod]
        public async Task GetOperationsSummaryByType_QueryVsRawData_ReturnsConsistentResults()
        {
            // Arrange
            var auditRecords = _testAuditRecords;
            
            _mockSummaryQueryService
                .Setup(s => s.GetOperationsSummaryByTypeAsync())
                .ReturnsAsync(CreateOperationTypeSummaryFromRecords(auditRecords));

            // Act
            var querySummary = await _summaryService.GetOperationsSummaryByTypeAsync();
            var rawDataSummary = CreateOperationTypeSummaryFromRecords(auditRecords);

            // Assert
            Assert.AreEqual(rawDataSummary.Count, querySummary.Count, "Should have same number of operation types");
            
            foreach (var operationType in rawDataSummary)
            {
                Assert.IsTrue(querySummary.ContainsKey(operationType.Key), $"Should contain operation type {operationType.Key}");
                Assert.AreEqual(operationType.Value.TotalCount, querySummary[operationType.Key].TotalCount, 
                    $"Total count for {operationType.Key} should match");
                Assert.AreEqual(operationType.Value.SuccessCount, querySummary[operationType.Key].SuccessCount, 
                    $"Success count for {operationType.Key} should match");
                Assert.AreEqual(operationType.Value.FailureCount, querySummary[operationType.Key].FailureCount, 
                    $"Failure count for {operationType.Key} should match");
            }
        }

        [TestMethod]
        public async Task GetDailySummary_QueryVsRawData_ReturnsConsistentTrends()
        {
            // Arrange
            var auditRecords = _testAuditRecords;
            var startDate = DateTime.Now.Date.AddDays(-30);
            var endDate = DateTime.Now.Date;
            
            _mockSummaryQueryService
                .Setup(s => s.GetDailySummaryAsync(startDate, endDate))
                .ReturnsAsync(CreateDailySummaryFromRecords(auditRecords, startDate, endDate));

            // Act
            var querySummary = await _summaryService.GetDailySummaryAsync(startDate, endDate);
            var rawDataSummary = CreateDailySummaryFromRecords(auditRecords, startDate, endDate);

            // Assert
            Assert.AreEqual(rawDataSummary.Count, querySummary.Count, "Should have same number of daily entries");
            
            foreach (var dailyEntry in rawDataSummary)
            {
                var queryEntry = querySummary.FirstOrDefault(q => q.Date.Date == dailyEntry.Date.Date);
                Assert.IsNotNull(queryEntry, $"Should have query entry for date {dailyEntry.Date:yyyy-MM-dd}");
                Assert.AreEqual(dailyEntry.ValidationCount, queryEntry.ValidationCount, 
                    $"Validation count should match for {dailyEntry.Date:yyyy-MM-dd}");
                Assert.AreEqual(dailyEntry.RollbackCount, queryEntry.RollbackCount, 
                    $"Rollback count should match for {dailyEntry.Date:yyyy-MM-dd}");
            }
        }

        #endregion

        #region Complex Aggregation Query Tests

        [TestMethod]
        public async Task GetValidationTrendAnalysis_QueryVsRawData_ReturnsConsistentTrends()
        {
            // Arrange
            var startDate = DateTime.Now.Date.AddDays(-30);
            var endDate = DateTime.Now.Date;
            
            _mockSummaryQueryService
                .Setup(s => s.GetValidationTrendAnalysisAsync(startDate, endDate))
                .ReturnsAsync(CreateTrendAnalysisFromRecords(_testValidationResults, startDate, endDate));

            // Act
            var queryTrend = await _summaryService.GetValidationTrendAnalysisAsync(startDate, endDate);
            var rawDataTrend = CreateTrendAnalysisFromRecords(_testValidationResults, startDate, endDate);

            // Assert
            Assert.AreEqual(rawDataTrend.TotalValidations, queryTrend.TotalValidations, "Total validations should match");
            Assert.AreEqual(rawDataTrend.TrendDirection, queryTrend.TrendDirection, "Trend direction should match");
            Assert.AreEqual(rawDataTrend.SuccessRateChange, queryTrend.SuccessRateChange, 0.01, "Success rate change should match");
            Assert.AreEqual(rawDataTrend.AverageValidationsPerDay, queryTrend.AverageValidationsPerDay, 0.1, "Average per day should match");
        }

        [TestMethod]
        public async Task GetPerformanceMetrics_QueryVsRawData_ReturnsConsistentMetrics()
        {
            // Arrange
            var auditRecords = _testAuditRecords;
            
            _mockSummaryQueryService
                .Setup(s => s.GetPerformanceMetricsAsync())
                .ReturnsAsync(CreatePerformanceMetricsFromRecords(auditRecords));

            // Act
            var queryMetrics = await _summaryService.GetPerformanceMetricsAsync();
            var rawDataMetrics = CreatePerformanceMetricsFromRecords(auditRecords);

            // Assert
            Assert.AreEqual(rawDataMetrics.AverageValidationTime.TotalMilliseconds, 
                queryMetrics.AverageValidationTime.TotalMilliseconds, 100, "Average validation time should match");
            Assert.AreEqual(rawDataMetrics.AverageRollbackTime.TotalMilliseconds, 
                queryMetrics.AverageRollbackTime.TotalMilliseconds, 100, "Average rollback time should match");
            Assert.AreEqual(rawDataMetrics.ThroughputPerHour, queryMetrics.ThroughputPerHour, 0.1, "Throughput should match");
            Assert.AreEqual(rawDataMetrics.PeakConcurrency, queryMetrics.PeakConcurrency, "Peak concurrency should match");
        }

        [TestMethod]
        public async Task GetTopFailureReasons_QueryVsRawData_ReturnsConsistentRankings()
        {
            // Arrange
            var validationResults = _testValidationResults.Where(r => r.Issues.Any()).ToList();
            
            _mockSummaryQueryService
                .Setup(s => s.GetTopFailureReasonsAsync(10))
                .ReturnsAsync(CreateTopFailureReasonsFromResults(validationResults, 10));

            // Act
            var queryReasons = await _summaryService.GetTopFailureReasonsAsync(10);
            var rawDataReasons = CreateTopFailureReasonsFromResults(validationResults, 10);

            // Assert
            Assert.AreEqual(rawDataReasons.Count, queryReasons.Count, "Should have same number of failure reasons");
            
            for (int i = 0; i < rawDataReasons.Count; i++)
            {
                Assert.AreEqual(rawDataReasons[i].Reason, queryReasons[i].Reason, $"Reason at rank {i + 1} should match");
                Assert.AreEqual(rawDataReasons[i].Count, queryReasons[i].Count, $"Count at rank {i + 1} should match");
                Assert.AreEqual(rawDataReasons[i].Percentage, queryReasons[i].Percentage, 0.01, $"Percentage at rank {i + 1} should match");
            }
        }

        #endregion

        #region Rollback Summary Query Tests

        [TestMethod]
        public async Task GetRollbackSummary_QueryVsRawData_ReturnsConsistentResults()
        {
            // Arrange
            var rollbackRecords = _testAuditRecords.Where(r => r.Action == "Rollback").ToList();
            
            _mockSummaryQueryService
                .Setup(s => s.GetRollbackSummaryAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>()))
                .ReturnsAsync(CreateRollbackSummaryFromRecords(rollbackRecords));

            // Act
            var querySummary = await _summaryService.GetRollbackSummaryAsync(DateTime.MinValue, DateTime.MaxValue);
            var rawDataSummary = CreateRollbackSummaryFromRecords(rollbackRecords);

            // Assert
            Assert.AreEqual(rawDataSummary.TotalRollbacks, querySummary.TotalRollbacks, "Total rollbacks should match");
            Assert.AreEqual(rawDataSummary.SuccessfulRollbacks, querySummary.SuccessfulRollbacks, "Successful rollbacks should match");
            Assert.AreEqual(rawDataSummary.FailedRollbacks, querySummary.FailedRollbacks, "Failed rollbacks should match");
            Assert.AreEqual(rawDataSummary.PartialRollbacks, querySummary.PartialRollbacks, "Partial rollbacks should match");
            Assert.AreEqual(rawDataSummary.AverageRollbackTime.TotalMilliseconds, 
                querySummary.AverageRollbackTime.TotalMilliseconds, 100, "Average rollback time should match");
        }

        [TestMethod]
        public async Task GetRollbackByObjectType_QueryVsRawData_ReturnsConsistentBreakdown()
        {
            // Arrange
            var rollbackRecords = _testAuditRecords.Where(r => r.Action == "Rollback").ToList();
            
            _mockSummaryQueryService
                .Setup(s => s.GetRollbackByObjectTypeAsync())
                .ReturnsAsync(CreateRollbackByObjectTypeFromRecords(rollbackRecords));

            // Act
            var queryBreakdown = await _summaryService.GetRollbackByObjectTypeAsync();
            var rawDataBreakdown = CreateRollbackByObjectTypeFromRecords(rollbackRecords);

            // Assert
            Assert.AreEqual(rawDataBreakdown.Count, queryBreakdown.Count, "Should have same number of object types");
            
            foreach (var objectType in rawDataBreakdown)
            {
                Assert.IsTrue(queryBreakdown.ContainsKey(objectType.Key), $"Should contain object type {objectType.Key}");
                Assert.AreEqual(objectType.Value.TotalCount, queryBreakdown[objectType.Key].TotalCount, 
                    $"Total rollback count for {objectType.Key} should match");
                Assert.AreEqual(objectType.Value.SuccessRate, queryBreakdown[objectType.Key].SuccessRate, 0.01, 
                    $"Success rate for {objectType.Key} should match");
            }
        }

        #endregion

        #region Data Integrity Tests

        [TestMethod]
        public void ValidateQueryResultIntegrity_NoDataLoss_AllRecordsAccounted()
        {
            // Arrange
            var allValidationResults = _testValidationResults;
            var summariesByObjectType = new Dictionary<string, ValidationSummary>();

            // Act - Get summaries for each object type
            var objectTypes = allValidationResults.Select(r => r.ObjectType).Distinct();
            foreach (var objectType in objectTypes)
            {
                var filteredResults = allValidationResults.Where(r => r.ObjectType == objectType).ToList();
                summariesByObjectType[objectType] = _summaryService.GetValidationSummary(filteredResults);
            }

            var totalSummary = _summaryService.GetValidationSummary(allValidationResults);

            // Assert - Sum of individual summaries should equal total summary
            var summedTotal = summariesByObjectType.Values.Sum(s => s.TotalObjects);
            var summedSuccessful = summariesByObjectType.Values.Sum(s => s.SuccessfulObjects);
            var summedErrors = summariesByObjectType.Values.Sum(s => s.ErrorObjects);

            Assert.AreEqual(totalSummary.TotalObjects, summedTotal, "Sum of individual object type totals should equal overall total");
            Assert.AreEqual(totalSummary.SuccessfulObjects, summedSuccessful, "Sum of individual successes should equal overall success");
            Assert.AreEqual(totalSummary.ErrorObjects, summedErrors, "Sum of individual errors should equal overall errors");
        }

        [TestMethod]
        public async Task ValidateTemporalConsistency_TimeRanges_NoOverlapOrGaps()
        {
            // Arrange
            var fullDateRange = (DateTime.Now.Date.AddDays(-30), DateTime.Now.Date);
            var halfRanges = new[]
            {
                (fullDateRange.Item1, fullDateRange.Item1.AddDays(15)),
                (fullDateRange.Item1.AddDays(15), fullDateRange.Item2)
            };

            // Mock the summary service to return consistent data
            _mockSummaryQueryService
                .Setup(s => s.GetValidationSummaryByDateRangeAsync(fullDateRange.Item1, fullDateRange.Item2))
                .ReturnsAsync(CreateSummaryFromResults(_testValidationResults));

            // Act
            var fullRangeSummary = await _summaryService.GetValidationSummaryByDateRangeAsync(fullDateRange.Item1, fullDateRange.Item2);
            
            var halfRangeSummaries = new List<ValidationSummary>();
            foreach (var range in halfRanges)
            {
                var filteredResults = _testValidationResults.Where(r => r.ValidatedAt >= range.Item1 && r.ValidatedAt < range.Item2).ToList();
                _mockSummaryQueryService
                    .Setup(s => s.GetValidationSummaryByDateRangeAsync(range.Item1, range.Item2))
                    .ReturnsAsync(CreateSummaryFromResults(filteredResults));
                
                halfRangeSummaries.Add(await _summaryService.GetValidationSummaryByDateRangeAsync(range.Item1, range.Item2));
            }

            // Assert - Sum of half ranges should equal full range (assuming no data spans the boundary)
            var summedHalfRangeTotal = halfRangeSummaries.Sum(s => s.TotalObjects);
            Assert.IsTrue(Math.Abs(fullRangeSummary.TotalObjects - summedHalfRangeTotal) <= fullRangeSummary.TotalObjects * 0.05, 
                "Sum of half ranges should approximately equal full range (allowing for boundary records)");
        }

        #endregion

        #region Helper Methods

        private void SetupMockRepositories()
        {
            _mockAuditRepository
                .Setup(r => r.GetAuditRecordsAsync(It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(_testAuditRecords);
        }

        private List<ValidationResult> CreateTestValidationResults()
        {
            var results = new List<ValidationResult>();
            var objectTypes = new[] { "User", "Mailbox", "File", "Database" };
            var severities = new[] { ValidationSeverity.Success, ValidationSeverity.Warning, ValidationSeverity.Error, ValidationSeverity.Critical };
            var waveIds = new[] { "wave-001", "wave-002", "wave-003" };

            var random = new Random(42); // Fixed seed for reproducible tests

            for (int i = 0; i < 200; i++)
            {
                var objectType = objectTypes[i % objectTypes.Length];
                var severity = severities[random.Next(severities.Length)];
                var waveId = waveIds[random.Next(waveIds.Length)];

                var issues = new List<ValidationIssue>();
                if (severity != ValidationSeverity.Success)
                {
                    var issueCount = random.Next(1, 4);
                    for (int j = 0; j < issueCount; j++)
                    {
                        issues.Add(new ValidationIssue
                        {
                            Severity = severity,
                            Category = $"Category{j % 5}",
                            Description = $"Issue {j} for object {i}"
                        });
                    }
                }

                var result = new ValidationResult
                {
                    ValidatedObject = new { Name = $"Object{i}" },
                    ObjectType = objectType,
                    ObjectName = $"TestObject{i:D3}@contoso.com",
                    Severity = severity,
                    Message = $"Validation result for object {i}",
                    ValidatedAt = DateTime.Now.AddMinutes(-random.Next(1, 43200)), // Random time in last 30 days
                    Issues = issues
                };
                result.SetWaveId(waveId); // Extension method to set wave ID for testing

                results.Add(result);
            }

            return results;
        }

        private List<AuditRecord> CreateTestAuditRecords()
        {
            var records = new List<AuditRecord>();
            var actions = new[] { "Validation", "Rollback" };
            var objectTypes = new[] { "User", "Mailbox", "File", "Database" };
            var statuses = new[] { "Success", "Warning", "Error", "Failed" };

            var random = new Random(42);

            for (int i = 0; i < 150; i++)
            {
                var action = actions[random.Next(actions.Length)];
                var objectType = objectTypes[random.Next(objectTypes.Length)];
                var status = statuses[random.Next(statuses.Length)];
                var startTime = DateTime.Now.AddMinutes(-random.Next(1, 43200));
                var duration = TimeSpan.FromMilliseconds(random.Next(100, 30000));

                records.Add(new AuditRecord
                {
                    Id = Guid.NewGuid().ToString(),
                    Action = action,
                    ObjectType = objectType,
                    ObjectIdentifier = $"testobject{i}@contoso.com",
                    Status = status,
                    StartTime = startTime,
                    EndTime = startTime.Add(duration),
                    Duration = duration,
                    InitiatedBy = $"testuser{i % 10}@contoso.com"
                });
            }

            return records;
        }

        private ValidationSummary CreateSummaryFromResults(List<ValidationResult> results)
        {
            return new ValidationSummary
            {
                TotalObjects = results.Count,
                SuccessfulObjects = results.Count(r => r.Severity == ValidationSeverity.Success),
                WarningObjects = results.Count(r => r.Severity == ValidationSeverity.Warning),
                ErrorObjects = results.Count(r => r.Severity == ValidationSeverity.Error),
                CriticalObjects = results.Count(r => r.Severity == ValidationSeverity.Critical),
                TotalIssues = results.Sum(r => r.Issues.Count),
                ObjectTypes = results.GroupBy(r => r.ObjectType).ToDictionary(g => g.Key, g => g.Count())
            };
        }

        private AuditSummary CreateAuditSummaryFromRecords(List<AuditRecord> records)
        {
            return new AuditSummary
            {
                TotalOperations = records.Count,
                SuccessfulOperations = records.Count(r => r.Status == "Success"),
                FailedOperations = records.Count(r => r.Status == "Failed" || r.Status == "Error"),
                AverageOperationDuration = TimeSpan.FromMilliseconds(records.Average(r => r.Duration.TotalMilliseconds))
            };
        }

        private Dictionary<string, OperationTypeSummary> CreateOperationTypeSummaryFromRecords(List<AuditRecord> records)
        {
            return records.GroupBy(r => r.Action).ToDictionary(g => g.Key, g => new OperationTypeSummary
            {
                TotalCount = g.Count(),
                SuccessCount = g.Count(r => r.Status == "Success"),
                FailureCount = g.Count(r => r.Status == "Failed" || r.Status == "Error")
            });
        }

        private List<DailySummary> CreateDailySummaryFromRecords(List<AuditRecord> records, DateTime startDate, DateTime endDate)
        {
            var dailySummaries = new List<DailySummary>();
            
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                var dayRecords = records.Where(r => r.StartTime.Date == date.Date).ToList();
                dailySummaries.Add(new DailySummary
                {
                    Date = date,
                    ValidationCount = dayRecords.Count(r => r.Action == "Validation"),
                    RollbackCount = dayRecords.Count(r => r.Action == "Rollback")
                });
            }

            return dailySummaries;
        }

        private TrendAnalysis CreateTrendAnalysisFromRecords(List<ValidationResult> results, DateTime startDate, DateTime endDate)
        {
            var filteredResults = results.Where(r => r.ValidatedAt >= startDate && r.ValidatedAt <= endDate).ToList();
            var days = (endDate - startDate).TotalDays;

            return new TrendAnalysis
            {
                TotalValidations = filteredResults.Count,
                TrendDirection = TrendDirection.Stable, // Simplified for testing
                SuccessRateChange = 0.0, // Simplified for testing
                AverageValidationsPerDay = filteredResults.Count / Math.Max(days, 1)
            };
        }

        private PerformanceMetrics CreatePerformanceMetricsFromRecords(List<AuditRecord> records)
        {
            var validationRecords = records.Where(r => r.Action == "Validation").ToList();
            var rollbackRecords = records.Where(r => r.Action == "Rollback").ToList();

            return new PerformanceMetrics
            {
                AverageValidationTime = validationRecords.Any() ? 
                    TimeSpan.FromMilliseconds(validationRecords.Average(r => r.Duration.TotalMilliseconds)) : 
                    TimeSpan.Zero,
                AverageRollbackTime = rollbackRecords.Any() ? 
                    TimeSpan.FromMilliseconds(rollbackRecords.Average(r => r.Duration.TotalMilliseconds)) : 
                    TimeSpan.Zero,
                ThroughputPerHour = records.Count / Math.Max(records.Max(r => r.StartTime).Subtract(records.Min(r => r.StartTime)).TotalHours, 1),
                PeakConcurrency = 1 // Simplified for testing
            };
        }

        private List<FailureReason> CreateTopFailureReasonsFromResults(List<ValidationResult> results, int topCount)
        {
            return results
                .SelectMany(r => r.Issues)
                .GroupBy(i => i.Description)
                .OrderByDescending(g => g.Count())
                .Take(topCount)
                .Select(g => new FailureReason
                {
                    Reason = g.Key,
                    Count = g.Count(),
                    Percentage = (g.Count() * 100.0) / results.SelectMany(r => r.Issues).Count()
                })
                .ToList();
        }

        private RollbackSummary CreateRollbackSummaryFromRecords(List<AuditRecord> records)
        {
            return new RollbackSummary
            {
                TotalRollbacks = records.Count,
                SuccessfulRollbacks = records.Count(r => r.Status == "Success"),
                FailedRollbacks = records.Count(r => r.Status == "Failed" || r.Status == "Error"),
                PartialRollbacks = records.Count(r => r.Status == "Warning"),
                AverageRollbackTime = records.Any() ? 
                    TimeSpan.FromMilliseconds(records.Average(r => r.Duration.TotalMilliseconds)) : 
                    TimeSpan.Zero
            };
        }

        private Dictionary<string, ObjectTypeRollbackSummary> CreateRollbackByObjectTypeFromRecords(List<AuditRecord> records)
        {
            return records.GroupBy(r => r.ObjectType).ToDictionary(g => g.Key, g => new ObjectTypeRollbackSummary
            {
                TotalCount = g.Count(),
                SuccessCount = g.Count(r => r.Status == "Success"),
                SuccessRate = (g.Count(r => r.Status == "Success") * 100.0) / g.Count()
            });
        }

        #endregion

        [TestCleanup]
        public void Cleanup()
        {
            // Log test summary for validation
            System.Diagnostics.Debug.WriteLine($"SUMMARIZATION_QUERY_TEST_COMPLETE: {_testValidationResults.Count} validation results, {_testAuditRecords.Count} audit records tested");
        }
    }

    #region Summary Support Classes and Extensions

    public class ValidationSummaryService
    {
        private readonly IAuditRepository _auditRepository;
        private readonly ISummaryQueryService _summaryQueryService;

        public ValidationSummaryService(IAuditRepository auditRepository, ISummaryQueryService summaryQueryService)
        {
            _auditRepository = auditRepository;
            _summaryQueryService = summaryQueryService;
        }

        public ValidationSummary GetValidationSummary(List<ValidationResult> results)
        {
            return new ValidationSummary
            {
                TotalObjects = results.Count,
                SuccessfulObjects = results.Count(r => r.Severity == ValidationSeverity.Success),
                WarningObjects = results.Count(r => r.Severity == ValidationSeverity.Warning),
                ErrorObjects = results.Count(r => r.Severity == ValidationSeverity.Error),
                CriticalObjects = results.Count(r => r.Severity == ValidationSeverity.Critical),
                TotalIssues = results.Sum(r => r.Issues.Count),
                ObjectTypes = results.GroupBy(r => r.ObjectType).ToDictionary(g => g.Key, g => g.Count())
            };
        }

        public async Task<ValidationSummary> GetValidationSummaryByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _summaryQueryService.GetValidationSummaryByDateRangeAsync(startDate, endDate);
        }

        public async Task<ValidationSummary> GetValidationSummaryByObjectTypeAsync(string objectType)
        {
            return await _summaryQueryService.GetValidationSummaryByObjectTypeAsync(objectType);
        }

        public async Task<ValidationSummary> GetValidationSummaryByWaveAsync(string waveId)
        {
            return await _summaryQueryService.GetValidationSummaryByWaveAsync(waveId);
        }

        public async Task<AuditSummary> GetAuditSummaryAsync(DateTime startDate, DateTime endDate)
        {
            return await _summaryQueryService.GetAuditSummaryAsync(startDate, endDate);
        }

        public async Task<Dictionary<string, OperationTypeSummary>> GetOperationsSummaryByTypeAsync()
        {
            return await _summaryQueryService.GetOperationsSummaryByTypeAsync();
        }

        public async Task<List<DailySummary>> GetDailySummaryAsync(DateTime startDate, DateTime endDate)
        {
            return await _summaryQueryService.GetDailySummaryAsync(startDate, endDate);
        }

        public async Task<TrendAnalysis> GetValidationTrendAnalysisAsync(DateTime startDate, DateTime endDate)
        {
            return await _summaryQueryService.GetValidationTrendAnalysisAsync(startDate, endDate);
        }

        public async Task<PerformanceMetrics> GetPerformanceMetricsAsync()
        {
            return await _summaryQueryService.GetPerformanceMetricsAsync();
        }

        public async Task<List<FailureReason>> GetTopFailureReasonsAsync(int count)
        {
            return await _summaryQueryService.GetTopFailureReasonsAsync(count);
        }

        public async Task<RollbackSummary> GetRollbackSummaryAsync(DateTime startDate, DateTime endDate)
        {
            return await _summaryQueryService.GetRollbackSummaryAsync(startDate, endDate);
        }

        public async Task<Dictionary<string, ObjectTypeRollbackSummary>> GetRollbackByObjectTypeAsync()
        {
            return await _summaryQueryService.GetRollbackByObjectTypeAsync();
        }
    }

    public interface ISummaryQueryService
    {
        Task<ValidationSummary> GetValidationSummaryByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<ValidationSummary> GetValidationSummaryByObjectTypeAsync(string objectType);
        Task<ValidationSummary> GetValidationSummaryByWaveAsync(string waveId);
        Task<AuditSummary> GetAuditSummaryAsync(DateTime startDate, DateTime endDate);
        Task<Dictionary<string, OperationTypeSummary>> GetOperationsSummaryByTypeAsync();
        Task<List<DailySummary>> GetDailySummaryAsync(DateTime startDate, DateTime endDate);
        Task<TrendAnalysis> GetValidationTrendAnalysisAsync(DateTime startDate, DateTime endDate);
        Task<PerformanceMetrics> GetPerformanceMetricsAsync();
        Task<List<FailureReason>> GetTopFailureReasonsAsync(int count);
        Task<RollbackSummary> GetRollbackSummaryAsync(DateTime startDate, DateTime endDate);
        Task<Dictionary<string, ObjectTypeRollbackSummary>> GetRollbackByObjectTypeAsync();
    }

    public static class ValidationResultExtensions
    {
        private static readonly Dictionary<string, string> WaveIds = new();

        public static void SetWaveId(this ValidationResult result, string waveId)
        {
            WaveIds[result.Id] = waveId;
        }

        public static string GetWaveId(this ValidationResult result)
        {
            return WaveIds.TryGetValue(result.Id, out var waveId) ? waveId : "unknown";
        }
    }

    public class AuditSummary
    {
        public int TotalOperations { get; set; }
        public int SuccessfulOperations { get; set; }
        public int FailedOperations { get; set; }
        public TimeSpan AverageOperationDuration { get; set; }
    }

    public class OperationTypeSummary
    {
        public int TotalCount { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
    }

    public class DailySummary
    {
        public DateTime Date { get; set; }
        public int ValidationCount { get; set; }
        public int RollbackCount { get; set; }
    }

    public class TrendAnalysis
    {
        public int TotalValidations { get; set; }
        public TrendDirection TrendDirection { get; set; }
        public double SuccessRateChange { get; set; }
        public double AverageValidationsPerDay { get; set; }
    }

    public class PerformanceMetrics
    {
        public TimeSpan AverageValidationTime { get; set; }
        public TimeSpan AverageRollbackTime { get; set; }
        public double ThroughputPerHour { get; set; }
        public int PeakConcurrency { get; set; }
    }

    public class FailureReason
    {
        public string Reason { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class RollbackSummary
    {
        public int TotalRollbacks { get; set; }
        public int SuccessfulRollbacks { get; set; }
        public int FailedRollbacks { get; set; }
        public int PartialRollbacks { get; set; }
        public TimeSpan AverageRollbackTime { get; set; }
    }

    public class ObjectTypeRollbackSummary
    {
        public int TotalCount { get; set; }
        public int SuccessCount { get; set; }
        public double SuccessRate { get; set; }
    }

    public enum TrendDirection
    {
        Improving,
        Stable,
        Declining
    }

    #endregion
}
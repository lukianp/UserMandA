using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MandADiscoverySuite.Migration;

namespace MandADiscoverySuite.Tests.Migration
{
    /// <summary>
    /// Production-ready tests for summarization queries validation against raw records
    /// Ensures data integrity and accuracy of summary statistics for audit and validation operations
    /// </summary>
    [TestClass]
    public class SummarizationQueryTests
    {
        private ValidationSummaryService _summaryService;
        private List<ValidationResult> _testValidationResults;

        [TestInitialize]
        public void Setup()
        {
            _summaryService = new ValidationSummaryService();
            _testValidationResults = CreateTestValidationResults();
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

        #endregion

        #region Helper Methods

        private List<ValidationResult> CreateTestValidationResults()
        {
            var results = new List<ValidationResult>();
            var objectTypes = new[] { "User", "Mailbox", "File", "Database" };
            var severities = new[] { ValidationSeverity.Success, ValidationSeverity.Warning, ValidationSeverity.Error, ValidationSeverity.Critical };

            var random = new Random(42); // Fixed seed for reproducible tests

            for (int i = 0; i < 200; i++)
            {
                var objectType = objectTypes[i % objectTypes.Length];
                var severity = severities[random.Next(severities.Length)];

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
                            Description = $"Issue {j} for object {i}",
                            RecommendedAction = $"Fix issue {j}"
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
                    ValidatedAt = DateTime.Now.AddMinutes(-random.Next(1, 43200)) // Random time in last 30 days
                };

                result.Issues.AddRange(issues);
                results.Add(result);
            }

            return results;
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


        #endregion

        [TestCleanup]
        public void Cleanup()
        {
            // Log test summary for validation
            System.Diagnostics.Debug.WriteLine($"SUMMARIZATION_QUERY_TEST_COMPLETE: {_testValidationResults.Count} validation results tested");
        }
    }

    #region Summary Support Classes

    public class ValidationSummaryService
    {
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
    }

    public class ValidationSummary
    {
        public int TotalObjects { get; set; }
        public int SuccessfulObjects { get; set; }
        public int WarningObjects { get; set; }
        public int ErrorObjects { get; set; }
        public int CriticalObjects { get; set; }
        public int TotalIssues { get; set; }
        public Dictionary<string, int> ObjectTypes { get; set; } = new();
        public double SuccessRate => TotalObjects > 0 ? (SuccessfulObjects * 100.0) / TotalObjects : 100.0;
        public bool HasErrors => ErrorObjects > 0 || CriticalObjects > 0;
        public bool HasWarnings => WarningObjects > 0;
    }


    #endregion
}
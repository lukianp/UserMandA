using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Enterprise migration scheduling service with dependency resolution and resource optimization
    /// </summary>
    public class MigrationScheduler
    {
        private readonly ILogger<MigrationScheduler> _logger;
        
        public MigrationScheduler(ILogger<MigrationScheduler> logger = null)
        {
            _logger = logger;
        }

        /// <summary>
        /// Create optimized migration schedule with dependency resolution
        /// </summary>
        public async Task<MigrationScheduleResult> CreateScheduleAsync(
            List<MigrationItem> items, 
            SchedulingOptions options = null)
        {
            options = options ?? new SchedulingOptions();
            var result = new MigrationScheduleResult();

            try
            {
                _logger?.LogInformation($"Creating migration schedule for {items.Count} items");

                // Step 1: Validate and resolve dependencies
                var dependencyResult = ResolveDependencies(items);
                if (!dependencyResult.IsValid)
                {
                    result.Errors.AddRange(dependencyResult.Errors);
                    return result;
                }

                // Step 2: Group items into logical batches
                var batches = await CreateOptimalBatchesAsync(dependencyResult.OrderedItems, options);
                
                // Step 3: Schedule batches into waves
                var waves = CreateScheduledWaves(batches, options);
                
                // Step 4: Optimize schedule for resource utilization
                OptimizeSchedule(waves, options);

                result.Waves = waves;
                result.TotalItems = items.Count;
                result.TotalBatches = batches.Count;
                result.TotalWaves = waves.Count;
                result.EstimatedDuration = CalculateTotalDuration(waves);
                result.IsSuccess = true;

                _logger?.LogInformation($"Created migration schedule: {waves.Count} waves, {batches.Count} batches, estimated duration: {result.EstimatedDuration}");
                
                return result;
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Scheduling failed: {ex.Message}");
                _logger?.LogError(ex, "Error creating migration schedule");
                return result;
            }
        }

        /// <summary>
        /// Resolve item dependencies using topological sorting
        /// </summary>
        public DependencyResolutionResult ResolveDependencies(List<MigrationItem> items)
        {
            var result = new DependencyResolutionResult();

            try
            {
                // Create dependency graph
                var graph = new Dictionary<string, HashSet<string>>();
                var inDegree = new Dictionary<string, int>();
                var itemLookup = items.ToDictionary(i => i.Id);

                // Initialize graph
                foreach (var item in items)
                {
                    graph[item.Id] = new HashSet<string>();
                    inDegree[item.Id] = 0;
                }

                // Build dependency edges
                foreach (var item in items)
                {
                    if (item.Dependencies?.Any() == true)
                    {
                        foreach (var dependency in item.Dependencies)
                        {
                            if (itemLookup.ContainsKey(dependency))
                            {
                                graph[dependency].Add(item.Id);
                                inDegree[item.Id]++;
                            }
                            else
                            {
                                result.Errors.Add($"Item '{item.DisplayName}' has missing dependency: {dependency}");
                            }
                        }
                    }
                }

                if (result.Errors.Any())
                {
                    result.IsValid = false;
                    return result;
                }

                // Topological sort using Kahn's algorithm
                var queue = new Queue<string>(inDegree.Where(kv => kv.Value == 0).Select(kv => kv.Key));
                var orderedIds = new List<string>();

                while (queue.Count > 0)
                {
                    var currentId = queue.Dequeue();
                    orderedIds.Add(currentId);

                    foreach (var dependent in graph[currentId])
                    {
                        inDegree[dependent]--;
                        if (inDegree[dependent] == 0)
                        {
                            queue.Enqueue(dependent);
                        }
                    }
                }

                // Check for circular dependencies
                if (orderedIds.Count != items.Count)
                {
                    var cyclicItems = items.Where(i => !orderedIds.Contains(i.Id)).ToList();
                    result.Errors.Add($"Circular dependencies detected involving: {string.Join(", ", cyclicItems.Select(i => i.DisplayName))}");
                    result.IsValid = false;
                    return result;
                }

                // Return ordered items
                result.OrderedItems = orderedIds.Select(id => itemLookup[id]).ToList();
                result.IsValid = true;

                _logger?.LogInformation($"Resolved dependencies for {items.Count} items, found {result.OrderedItems.Count} in correct order");

                return result;
            }
            catch (Exception ex)
            {
                result.Errors.Add($"Dependency resolution failed: {ex.Message}");
                result.IsValid = false;
                _logger?.LogError(ex, "Error resolving dependencies");
                return result;
            }
        }

        /// <summary>
        /// Create optimal migration batches based on various criteria
        /// </summary>
        public async Task<List<MigrationBatch>> CreateOptimalBatchesAsync(
            List<MigrationItem> orderedItems, 
            SchedulingOptions options)
        {
            var batches = new List<MigrationBatch>();
            
            try
            {
                // Group items by type for initial batching
                var typeGroups = orderedItems.GroupBy(i => i.Type).ToList();

                foreach (var typeGroup in typeGroups)
                {
                    var itemsOfType = typeGroup.ToList();
                    
                    // Further subdivide by complexity and size
                    var subGroups = CreateSubGroups(itemsOfType, options);
                    
                    foreach (var subGroup in subGroups)
                    {
                        var batch = new MigrationBatch
                        {
                            Name = GenerateBatchName(subGroup.Key, batches.Count + 1),
                            Description = $"Migration batch for {subGroup.Key} ({subGroup.Value.Count} items)",
                            Type = subGroup.Value.First().Type,
                            Status = MigrationStatus.NotStarted,
                            Priority = DetermineBatchPriority(subGroup.Value),
                            Complexity = DetermineBatchComplexity(subGroup.Value),
                            Items = subGroup.Value,
                            PlannedStartDate = CalculateOptimalStartDate(subGroup.Value, options),
                            EstimatedDuration = CalculateBatchDuration(subGroup.Value)
                        };

                        // Set batch-level properties
                        batch.UpdateProgress();
                        batches.Add(batch);
                    }
                }

                _logger?.LogInformation($"Created {batches.Count} optimal batches from {orderedItems.Count} items");
                return batches;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating optimal batches");
                return batches;
            }
        }

        /// <summary>
        /// Create scheduled waves with resource optimization
        /// </summary>
        public List<MigrationWaveExtended> CreateScheduledWaves(List<MigrationBatch> batches, SchedulingOptions options)
        {
            var waves = new List<MigrationWaveExtended>();

            try
            {
                // Sort batches by priority and dependencies
                var sortedBatches = SortBatchesForScheduling(batches);
                
                // Group batches into waves based on scheduling constraints
                var currentWave = new List<MigrationBatch>();
                var currentWaveStartDate = options.EarliestStartDate;
                var currentWaveCapacity = 0;

                foreach (var batch in sortedBatches)
                {
                    var batchSize = batch.TotalItems;
                    var batchDuration = batch.EstimatedDuration ?? TimeSpan.FromHours(1);

                    // Check if batch fits in current wave
                    bool fitsInCurrentWave = 
                        currentWaveCapacity + batchSize <= options.MaxItemsPerWave &&
                        currentWave.Count < options.MaxBatchesPerWave &&
                        CanScheduleBatchInWave(batch, currentWave, options);

                    if (!fitsInCurrentWave && currentWave.Any())
                    {
                        // Create current wave and start new one
                        var wave = CreateWaveFromBatches(currentWave, waves.Count + 1, currentWaveStartDate);
                        waves.Add(wave);

                        // Start new wave
                        currentWave.Clear();
                        currentWaveCapacity = 0;
                        currentWaveStartDate = CalculateNextWaveStartDate(waves, options);
                    }

                    // Add batch to current wave
                    currentWave.Add(batch);
                    currentWaveCapacity += batchSize;
                    
                    // Update batch planned dates
                    batch.PlannedStartDate = currentWaveStartDate;
                    batch.PlannedEndDate = currentWaveStartDate.Add(batchDuration);
                }

                // Create final wave if there are remaining batches
                if (currentWave.Any())
                {
                    var wave = CreateWaveFromBatches(currentWave, waves.Count + 1, currentWaveStartDate);
                    waves.Add(wave);
                }

                _logger?.LogInformation($"Created {waves.Count} scheduled waves from {batches.Count} batches");
                return waves;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error creating scheduled waves");
                return waves;
            }
        }

        /// <summary>
        /// Optimize schedule for resource utilization and timeline
        /// </summary>
        public void OptimizeSchedule(List<MigrationWaveExtended> waves, SchedulingOptions options)
        {
            try
            {
                // Balance wave sizes
                BalanceWaveSizes(waves, options);
                
                // Optimize start dates to minimize idle time
                OptimizeWaveStartDates(waves, options);
                
                // Adjust for resource constraints
                ApplyResourceConstraints(waves, options);

                _logger?.LogInformation($"Optimized schedule for {waves.Count} waves");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error optimizing schedule");
            }
        }

        private Dictionary<string, List<MigrationItem>> CreateSubGroups(
            List<MigrationItem> items, 
            SchedulingOptions options)
        {
            var subGroups = new Dictionary<string, List<MigrationItem>>();

            // Group by complexity first
            var complexityGroups = items.GroupBy(i => i.Complexity);

            foreach (var complexityGroup in complexityGroups)
            {
                var groupItems = complexityGroup.ToList();
                var groupName = $"{complexityGroup.Key}";

                // Further split large groups by size
                if (groupItems.Count > options.MaxItemsPerBatch)
                {
                    var subGroupIndex = 1;
                    for (int i = 0; i < groupItems.Count; i += options.MaxItemsPerBatch)
                    {
                        var subGroupItems = groupItems.Skip(i).Take(options.MaxItemsPerBatch).ToList();
                        subGroups[$"{groupName}-Part{subGroupIndex}"] = subGroupItems;
                        subGroupIndex++;
                    }
                }
                else
                {
                    subGroups[groupName] = groupItems;
                }
            }

            return subGroups;
        }

        private string GenerateBatchName(string groupKey, int batchNumber)
        {
            return $"Batch-{batchNumber:D3}-{groupKey}";
        }

        private MigrationPriority DetermineBatchPriority(List<MigrationItem> items)
        {
            if (items.Any(i => i.Priority == MigrationPriority.Critical))
                return MigrationPriority.Critical;
            if (items.Any(i => i.Priority == MigrationPriority.High))
                return MigrationPriority.High;
            if (items.All(i => i.Priority == MigrationPriority.Low))
                return MigrationPriority.Low;
            
            return MigrationPriority.Normal;
        }

        private MigrationComplexity DetermineBatchComplexity(List<MigrationItem> items)
        {
            if (items.Any(i => i.Complexity == MigrationComplexity.HighRisk))
                return MigrationComplexity.HighRisk;
            if (items.Any(i => i.Complexity == MigrationComplexity.Complex))
                return MigrationComplexity.Complex;
            if (items.All(i => i.Complexity == MigrationComplexity.Simple))
                return MigrationComplexity.Simple;
            
            return MigrationComplexity.Moderate;
        }

        private DateTime? CalculateOptimalStartDate(List<MigrationItem> items, SchedulingOptions options)
        {
            // Consider business hours, weekends, etc.
            var baseDate = options.EarliestStartDate;
            
            // Skip weekends if required
            if (options.ExcludeWeekends)
            {
                while (baseDate.DayOfWeek == DayOfWeek.Saturday || baseDate.DayOfWeek == DayOfWeek.Sunday)
                {
                    baseDate = baseDate.AddDays(1);
                }
            }

            return baseDate;
        }

        private TimeSpan CalculateBatchDuration(List<MigrationItem> items)
        {
            var totalDuration = items.Sum(i => (i.EstimatedDuration ?? TimeSpan.FromMinutes(30)).TotalMinutes);
            return TimeSpan.FromMinutes(totalDuration * 1.2); // Add 20% buffer
        }

        private List<MigrationBatch> SortBatchesForScheduling(List<MigrationBatch> batches)
        {
            return batches.OrderBy(b => b.Priority switch
            {
                MigrationPriority.Critical => 1,
                MigrationPriority.High => 2,
                MigrationPriority.Normal => 3,
                MigrationPriority.Low => 4,
                _ => 5
            })
            .ThenBy(b => b.PlannedStartDate)
            .ThenBy(b => b.Complexity switch
            {
                MigrationComplexity.Simple => 1,
                MigrationComplexity.Moderate => 2,
                MigrationComplexity.Complex => 3,
                MigrationComplexity.HighRisk => 4,
                _ => 5
            })
            .ToList();
        }

        private bool CanScheduleBatchInWave(
            MigrationBatch batch, 
            List<MigrationBatch> currentWave, 
            SchedulingOptions options)
        {
            // Check for conflicts or constraints
            if (batch.RequiresApproval && string.IsNullOrWhiteSpace(batch.ApprovedBy))
                return false;

            // Check for resource conflicts
            var highRiskBatches = currentWave.Count(b => b.Complexity == MigrationComplexity.HighRisk);
            if (batch.Complexity == MigrationComplexity.HighRisk && highRiskBatches >= options.MaxHighRiskBatchesPerWave)
                return false;

            return true;
        }

        private MigrationWaveExtended CreateWaveFromBatches(
            List<MigrationBatch> batches, 
            int waveNumber, 
            DateTime startDate)
        {
            var wave = new MigrationWaveExtended
            {
                Name = $"Wave-{waveNumber:D2}",
                Status = MigrationStatus.NotStarted,
                Order = waveNumber,
                PlannedStartDate = startDate,
                Batches = batches.ToList(),
                Notes = $"Migration wave {waveNumber} with {batches.Count} batches"
            };

            // Progress is calculated automatically via TotalItems property
            return wave;
        }

        private DateTime CalculateNextWaveStartDate(List<MigrationWaveExtended> existingWaves, SchedulingOptions options)
        {
            if (!existingWaves.Any())
                return options.EarliestStartDate;

            var lastWaveEnd = existingWaves.Any() ? existingWaves.Max(w => w.ActualEndDate ?? w.PlannedStartDate.AddHours(8)) : options.EarliestStartDate;
            return lastWaveEnd.Add(options.WaveInterval);
        }

        private TimeSpan CalculateWaveDuration(List<MigrationBatch> batches)
        {
            if (!batches.Any())
                return TimeSpan.FromHours(1);

            var maxBatchDuration = batches.Max(b => b.EstimatedDuration) ?? TimeSpan.FromHours(1);
            return maxBatchDuration.Add(TimeSpan.FromMinutes(30)); // Add buffer
        }

        private TimeSpan CalculateTotalDuration(List<MigrationWaveExtended> waves)
        {
            if (!waves.Any())
                return TimeSpan.Zero;

            var start = waves.Min(w => w.PlannedStartDate);
            var end = waves.Max(w => w.ActualEndDate ?? w.PlannedStartDate.AddHours(8));
            return end - start;
        }

        private void BalanceWaveSizes(List<MigrationWaveExtended> waves, SchedulingOptions options)
        {
            // Implement wave size balancing logic
            var averageSize = waves.Average(w => w.TotalItems);
            
            foreach (var wave in waves.Where(w => w.TotalItems > averageSize * 1.5))
            {
                // Mark oversized waves for optimization
                wave.Metadata["Tags"] = new List<string> { "Oversized" };
            }
        }

        private void OptimizeWaveStartDates(List<MigrationWaveExtended> waves, SchedulingOptions options)
        {
            // Adjust start dates to minimize gaps and optimize resource utilization
            for (int i = 1; i < waves.Count; i++)
            {
                var previousWave = waves[i - 1];
                var currentWave = waves[i];
                
                var optimalStartDate = (previousWave.ActualEndDate ?? previousWave.PlannedStartDate.AddHours(8)).Add(options.WaveInterval);
                if (currentWave.PlannedStartDate < optimalStartDate)
                {
                    currentWave.PlannedStartDate = optimalStartDate;
                    // PlannedEndDate is calculated automatically
                }
            }
        }

        private void ApplyResourceConstraints(List<MigrationWaveExtended> waves, SchedulingOptions options)
        {
            // Apply resource-based scheduling constraints
            foreach (var wave in waves)
            {
                // Ensure wave doesn't exceed resource limits
                if (wave.TotalItems > options.MaxItemsPerWave)
                {
                    wave.Metadata["Tags"] = new List<string> { "ResourceConstrained" };
                    _logger?.LogWarning($"Wave {wave.Name} exceeds maximum items per wave ({wave.TotalItems} > {options.MaxItemsPerWave})");
                }
            }
        }
    }

    #region Supporting Classes

    public class SchedulingOptions
    {
        public DateTime EarliestStartDate { get; set; } = DateTime.Now.AddDays(1);
        public int MaxItemsPerBatch { get; set; } = 100;
        public int MaxBatchesPerWave { get; set; } = 5;
        public int MaxItemsPerWave { get; set; } = 500;
        public int MaxHighRiskBatchesPerWave { get; set; } = 2;
        public TimeSpan WaveInterval { get; set; } = TimeSpan.FromHours(4);
        public bool ExcludeWeekends { get; set; } = true;
        public bool ExcludeHolidays { get; set; } = true;
        public List<DateTime> BusinessHolidays { get; set; } = new();
        public TimeSpan BusinessHoursStart { get; set; } = TimeSpan.FromHours(8);
        public TimeSpan BusinessHoursEnd { get; set; } = TimeSpan.FromHours(18);
    }

    public class DependencyResolutionResult
    {
        public bool IsValid { get; set; }
        public List<MigrationItem> OrderedItems { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public class MigrationScheduleResult
    {
        public bool IsSuccess { get; set; }
        public List<MigrationWaveExtended> Waves { get; set; } = new();
        public int TotalWaves { get; set; }
        public int TotalBatches { get; set; }
        public int TotalItems { get; set; }
        public TimeSpan EstimatedDuration { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    #endregion
}
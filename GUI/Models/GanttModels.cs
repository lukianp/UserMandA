using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.Models
{
    // Extension methods and properties for existing MigrationWave class to support Gantt functionality
    public static class MigrationWaveExtensions
    {
        public static DateTime StartDate(this MigrationWave wave) => wave.PlannedStartDate;
        public static DateTime EndDate(this MigrationWave wave) => wave.PlannedEndDate ?? DateTime.MaxValue;
        public static bool IsOverdue(this MigrationWave wave) => DateTime.Now > (wave.PlannedEndDate ?? DateTime.MaxValue) && wave.Status != MigrationStatus.Completed;
        public static int DaysRemaining(this MigrationWave wave) => Math.Max(0, (int)((wave.PlannedEndDate ?? DateTime.MaxValue) - DateTime.Now).TotalDays);
        public static TimeSpan Duration(this MigrationWave wave) => (wave.PlannedEndDate ?? DateTime.MaxValue) - wave.PlannedStartDate;
        public static double GetCompletionPercentage(this MigrationWave wave)
        {
            if (!wave.Tasks.Any()) return 0;
            return wave.Tasks.Average(t => t.CompletionPercentage ?? 0);
        }
    }

    public static class MigrationTaskExtensions
    {
        public static DateTime StartDate(this MigrationTask task) => task.PlannedStartDate;
        public static DateTime EndDate(this MigrationTask task) => task.PlannedEndDate;
        public static bool IsOverdue(this MigrationTask task) => DateTime.Now > task.PlannedEndDate && task.Status != "Completed";
        public static TimeSpan Duration(this MigrationTask task) => task.PlannedEndDate - task.PlannedStartDate;
        public static double Progress(this MigrationTask task) => (task.CompletionPercentage ?? 0) / 100.0;
    }

    public class GanttTimeScale
    {
        public TimeScaleType Type { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int IntervalDays { get; set; }
    }

    public enum TimeScaleType
    {
        Days,
        Weeks,
        Months,
        Quarters
    }

    public class GanttSettings
    {
        public bool ShowCriticalPath { get; set; }
        public bool ShowBaseline { get; set; }
        public bool ShowActualDates { get; set; }
        public bool ShowMilestones { get; set; }
        public bool ShowDependencies { get; set; }
        public GanttTimeScale TimeScale { get; set; }
        public bool ShowTaskDetails { get; set; }
        public bool ShowProgress { get; set; }
        public bool ShowResourceNames { get; set; }

        public GanttSettings()
        {
            ShowCriticalPath = true;
            ShowBaseline = true;
            ShowActualDates = true;
            ShowMilestones = true;
            ShowDependencies = true;
            ShowTaskDetails = true;
            ShowProgress = true;
            ShowResourceNames = true;
            TimeScale = new GanttTimeScale
            {
                Type = TimeScaleType.Weeks,
                IntervalDays = 7
            };
        }
    }
}
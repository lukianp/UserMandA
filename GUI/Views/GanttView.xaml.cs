using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using System.Linq;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Views
{
    /// <summary>
    /// Interaction logic for GanttView.xaml
    /// </summary>
    public partial class GanttView : UserControl
    {
        private const double TaskHeight = 32;
        private const double TimelineScale = 10; // pixels per day

        public GanttView()
        {
            InitializeComponent();
            DataContextChanged += GanttView_DataContextChanged;
        }

        private void GanttView_DataContextChanged(object sender, DependencyPropertyChangedEventArgs e)
        {
            if (e.NewValue is GanttViewModel viewModel)
            {
                DrawGanttChart(viewModel);
            }
        }

        private void DrawGanttChart(GanttViewModel viewModel)
        {
            if (viewModel.FlattenedTasks == null || !viewModel.FlattenedTasks.Any())
                return;

            TimelineCanvas.Children.Clear();

            // Calculate canvas dimensions
            var totalDays = viewModel.TimelineDays;
            var canvasWidth = Math.Max(800, totalDays * TimelineScale);
            var canvasHeight = viewModel.FlattenedTasks.Count * TaskHeight;

            TimelineCanvas.Width = canvasWidth;
            TimelineCanvas.Height = canvasHeight;

            // Draw timeline grid
            DrawTimelineGrid(viewModel, canvasWidth, canvasHeight);

            // Draw task bars
            for (int i = 0; i < viewModel.FlattenedTasks.Count; i++)
            {
                var task = viewModel.FlattenedTasks[i];
                DrawTaskBar(task, i, viewModel);
            }

            // Draw dependencies
            DrawDependencyLines(viewModel);

            // Update timeline header
            UpdateTimelineHeader(viewModel);
        }

        private void DrawTimelineGrid(GanttViewModel viewModel, double canvasWidth, double canvasHeight)
        {
            // Draw vertical grid lines (weekly)
            var current = viewModel.TimelineStart;
            while (current <= viewModel.TimelineEnd)
            {
                var offsetDays = (current - viewModel.TimelineStart).TotalDays;
                var x = offsetDays * TimelineScale;

                var line = new Line
                {
                    X1 = x,
                    Y1 = 0,
                    X2 = x,
                    Y2 = canvasHeight,
                    Stroke = new SolidColorBrush(Color.FromRgb(51, 65, 85)),
                    StrokeThickness = 0.5,
                    Opacity = 0.5
                };

                TimelineCanvas.Children.Add(line);
                current = current.AddDays(7);
            }

            // Draw horizontal grid lines
            for (int i = 0; i <= viewModel.FlattenedTasks.Count; i++)
            {
                var y = i * TaskHeight;
                var line = new Line
                {
                    X1 = 0,
                    Y1 = y,
                    X2 = canvasWidth,
                    Y2 = y,
                    Stroke = new SolidColorBrush(Color.FromRgb(51, 65, 85)),
                    StrokeThickness = 0.5,
                    Opacity = 0.3
                };

                TimelineCanvas.Children.Add(line);
            }
        }

        private void DrawTaskBar(MigrationProjectTask task, int index, GanttViewModel viewModel)
        {
            var taskDuration = (task.EndDate - task.StartDate).TotalDays;
            var offsetDays = (task.StartDate - viewModel.TimelineStart).TotalDays;

            var x = offsetDays * TimelineScale;
            var y = index * TaskHeight + 6; // 6px margin from top
            var width = Math.Max(20, taskDuration * TimelineScale); // Minimum 20px width
            var height = 20;

            var taskBar = new Rectangle
            {
                Width = width,
                Height = height,
                RadiusX = 2,
                RadiusY = 2,
                Fill = GetTaskFillBrush(task),
                Stroke = GetTaskStrokeBrush(task),
                StrokeThickness = task.IsCriticalPath ? 2 : 1
            };

            Canvas.SetLeft(taskBar, x);
            Canvas.SetTop(taskBar, y);

            // Add tooltip
            var tooltip = new ToolTip
            {
                Content = new StackPanel
                {
                    Children =
                    {
                        new TextBlock { Text = task.Name, FontWeight = FontWeights.Bold },
                        new TextBlock { Text = task.Description },
                        new TextBlock { Text = $"Owner: {task.Owner}" },
                        new TextBlock { Text = $"Start: {task.StartDate:MMM dd, yyyy}" },
                        new TextBlock { Text = $"End: {task.EndDate:MMM dd, yyyy}" },
                        new TextBlock { Text = $"Duration: {taskDuration} days" },
                        new TextBlock { Text = $"Progress: {task.Progress:F0}%" },
                        new TextBlock { Text = $"Critical Path: {task.IsCriticalPath}" }
                    }
                }
            };

            taskBar.ToolTip = tooltip;

            // Add progress overlay
            if (task.Progress > 0)
            {
                var progressWidth = width * (task.Progress / 100.0);
                var progressBar = new Rectangle
                {
                    Width = progressWidth,
                    Height = height,
                    RadiusX = 2,
                    RadiusY = 2,
                    Fill = new SolidColorBrush(Color.FromArgb(80, 16, 185, 129)), // Semi-transparent green
                    IsHitTestVisible = false
                };

                Canvas.SetLeft(progressBar, x);
                Canvas.SetTop(progressBar, y);
                TimelineCanvas.Children.Add(progressBar);
            }

            TimelineCanvas.Children.Add(taskBar);

            // Add task name overlay for longer bars
            if (width > 100)
            {
                var taskLabel = new TextBlock
                {
                    Text = task.Name.Length > 20 ? task.Name.Substring(0, 20) + "..." : task.Name,
                    Foreground = Brushes.White,
                    FontSize = 10,
                    VerticalAlignment = VerticalAlignment.Center,
                    Margin = new Thickness(4, 0, 0, 0)
                };

                Canvas.SetLeft(taskLabel, x + 2);
                Canvas.SetTop(taskLabel, y + 2);
                TimelineCanvas.Children.Add(taskLabel);
            }
        }

        private Brush GetTaskFillBrush(MigrationProjectTask task)
        {
            if (task.IsCriticalPath)
                return new SolidColorBrush(Color.FromRgb(239, 68, 68)); // Red for critical path

            return task.Status switch
            {
                MigrationProjectTaskStatus.NotStarted => new SolidColorBrush(Color.FromRgb(107, 114, 128)),
                MigrationProjectTaskStatus.InProgress => new SolidColorBrush(Color.FromRgb(59, 130, 246)),
                MigrationProjectTaskStatus.Completed => new SolidColorBrush(Color.FromRgb(16, 185, 129)),
                MigrationProjectTaskStatus.AtRisk => new SolidColorBrush(Color.FromRgb(245, 158, 11)),
                MigrationProjectTaskStatus.Blocked => new SolidColorBrush(Color.FromRgb(239, 68, 68)),
                _ => new SolidColorBrush(Color.FromRgb(107, 114, 128))
            };
        }

        private Brush GetTaskStrokeBrush(MigrationProjectTask task)
        {
            if (task.IsCriticalPath)
                return new SolidColorBrush(Color.FromRgb(220, 38, 38));

            return new SolidColorBrush(Color.FromRgb(51, 65, 85));
        }

        private void DrawDependencyLines(GanttViewModel viewModel)
        {
            var taskPositions = new Dictionary<int, Point>();

            // Calculate task positions
            for (int i = 0; i < viewModel.FlattenedTasks.Count; i++)
            {
                var task = viewModel.FlattenedTasks[i];
                var offsetDays = (task.StartDate - viewModel.TimelineStart).TotalDays;
                var x = offsetDays * TimelineScale;
                var y = i * TaskHeight + 16; // Middle of task bar

                taskPositions[task.Id] = new Point(x, y);
            }

            // Draw dependency arrows
            foreach (var task in viewModel.FlattenedTasks)
            {
                if (task.Dependencies != null && taskPositions.ContainsKey(task.Id))
                {
                    var taskPoint = taskPositions[task.Id];

                    foreach (var depId in task.Dependencies)
                    {
                        if (taskPositions.ContainsKey(depId))
                        {
                            var depTask = viewModel.FlattenedTasks.FirstOrDefault(t => t.Id == depId);
                            if (depTask != null)
                            {
                                var depPoint = taskPositions[depId];
                                var depDuration = (depTask.EndDate - depTask.StartDate).TotalDays;
                                var depEndX = depPoint.X + (depDuration * TimelineScale);

                                DrawDependencyArrow(new Point(depEndX, depPoint.Y), taskPoint);
                            }
                        }
                    }
                }
            }
        }

        private void DrawDependencyArrow(Point from, Point to)
        {
            // Draw a simple line with an arrow
            var line = new Line
            {
                X1 = from.X,
                Y1 = from.Y,
                X2 = to.X - 5, // Stop 5px before the task
                Y2 = to.Y,
                Stroke = new SolidColorBrush(Color.FromRgb(148, 163, 184)),
                StrokeThickness = 1.5,
                StrokeDashArray = new DoubleCollection { 4, 2 }
            };

            TimelineCanvas.Children.Add(line);

            // Simple arrow head
            var arrowHead = new Polygon
            {
                Points = new PointCollection
                {
                    new Point(to.X - 5, to.Y),
                    new Point(to.X - 10, to.Y - 3),
                    new Point(to.X - 10, to.Y + 3)
                },
                Fill = new SolidColorBrush(Color.FromRgb(148, 163, 184))
            };

            TimelineCanvas.Children.Add(arrowHead);
        }

        private void UpdateTimelineHeader(GanttViewModel viewModel)
        {
            TimelineHeader.Items.Clear();

            var current = viewModel.TimelineStart;
            while (current <= viewModel.TimelineEnd)
            {
                var offsetDays = (current - viewModel.TimelineStart).TotalDays;
                var x = offsetDays * TimelineScale;

                var headerText = new TextBlock
                {
                    Text = current.ToString("MMM dd"),
                    Foreground = new SolidColorBrush(Color.FromRgb(148, 163, 184)),
                    FontSize = 12,
                    Margin = new Thickness(2, 10, 0, 0)
                };

                Canvas.SetLeft(headerText, x);
                TimelineHeader.Items.Add(headerText);

                current = current.AddDays(7);
            }
        }

        private void TaskListScrollViewer_ScrollChanged(object sender, ScrollChangedEventArgs e)
        {
            // Synchronize vertical scrolling
            if (e.VerticalChange != 0)
            {
                TimelineScrollViewer.ScrollToVerticalOffset(e.VerticalOffset);
            }
        }

        private void TimelineScrollViewer_ScrollChanged(object sender, ScrollChangedEventArgs e)
        {
            // Synchronize scrolling
            if (e.VerticalChange != 0)
            {
                TaskListScrollViewer.ScrollToVerticalOffset(e.VerticalOffset);
            }
            
            if (e.HorizontalChange != 0)
            {
                HeaderScrollViewer.ScrollToHorizontalOffset(e.HorizontalOffset);
            }
        }
    }
}
using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Shapes;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Interaction logic for GanttChart.xaml
    /// </summary>
    public partial class GanttChart : UserControl
    {
        private GanttChartViewModel _viewModel;
        private bool _isDragging = false;
        private Point _dragStartPoint;
        private FrameworkElement _draggedElement;

        public GanttChart()
        {
            InitializeComponent();
            Loaded += OnLoaded;
        }

        private void OnLoaded(object sender, RoutedEventArgs e)
        {
            _viewModel = DataContext as GanttChartViewModel;
            if (_viewModel != null)
            {
                _viewModel.PropertyChanged += ViewModel_PropertyChanged;
                DrawTimeHeader();
            }
        }

        private void ViewModel_PropertyChanged(object sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            switch (e.PropertyName)
            {
                case nameof(GanttChartViewModel.SelectedTimeScale):
                case nameof(GanttChartViewModel.ZoomLevel):
                    DrawTimeHeader();
                    break;
            }
        }

        private void DrawTimeHeader()
        {
            if (_viewModel == null) return;

            TimeHeaderCanvas.Children.Clear();

            var startDate = _viewModel.ProjectStartDate;
            var endDate = _viewModel.ProjectEndDate;
            var dayWidth = _viewModel.DayWidth * _viewModel.ZoomLevel;
            var totalDays = (endDate - startDate).Days;

            // Draw major time divisions
            var currentDate = startDate;
            var x = 0.0;

            while (currentDate <= endDate)
            {
                // Major divisions (months)
                if (currentDate.Day == 1 || currentDate == startDate)
                {
                    var line = new Line
                    {
                        X1 = x,
                        Y1 = 0,
                        X2 = x,
                        Y2 = 60,
                        Stroke = (Brush)FindResource("BorderBrush"),
                        StrokeThickness = 2
                    };
                    TimeHeaderCanvas.Children.Add(line);

                    var monthLabel = new TextBlock
                    {
                        Text = currentDate.ToString("MMM yyyy"),
                        FontSize = 12,
                        FontWeight = FontWeights.SemiBold,
                        Foreground = (Brush)FindResource("ForegroundBrush")
                    };
                    Canvas.SetLeft(monthLabel, x + 5);
                    Canvas.SetTop(monthLabel, 5);
                    TimeHeaderCanvas.Children.Add(monthLabel);
                }

                // Week divisions
                if (currentDate.DayOfWeek == DayOfWeek.Monday && _viewModel.ZoomLevel >= 0.5)
                {
                    var weekLine = new Line
                    {
                        X1 = x,
                        Y1 = 25,
                        X2 = x,
                        Y2 = 60,
                        Stroke = (Brush)FindResource("BorderBrush"),
                        StrokeThickness = 1,
                        Opacity = 0.5
                    };
                    TimeHeaderCanvas.Children.Add(weekLine);

                    var weekLabel = new TextBlock
                    {
                        Text = $"Week {GetWeekOfYear(currentDate)}",
                        FontSize = 10,
                        Foreground = (Brush)FindResource("SecondaryForegroundBrush")
                    };
                    Canvas.SetLeft(weekLabel, x + 2);
                    Canvas.SetTop(weekLabel, 28);
                    TimeHeaderCanvas.Children.Add(weekLabel);
                }

                // Day numbers (only if zoomed in enough)
                if (_viewModel.ZoomLevel >= 1.0)
                {
                    var dayLabel = new TextBlock
                    {
                        Text = currentDate.Day.ToString(),
                        FontSize = 9,
                        Foreground = (Brush)FindResource("SecondaryForegroundBrush"),
                        HorizontalAlignment = HorizontalAlignment.Center
                    };
                    Canvas.SetLeft(dayLabel, x + 2);
                    Canvas.SetTop(dayLabel, 45);
                    TimeHeaderCanvas.Children.Add(dayLabel);
                }

                currentDate = currentDate.AddDays(1);
                x += dayWidth;
            }
        }

        private void TaskBar_Click(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element && 
                element.DataContext is GanttTaskBar taskBar)
            {
                _viewModel?.SelectTask(taskBar);
                e.Handled = true;
            }
        }

        private void Milestone_Click(object sender, MouseButtonEventArgs e)
        {
            if (sender is FrameworkElement element && 
                element.DataContext is GanttMilestone milestone)
            {
                _viewModel?.SelectMilestone(milestone);
                e.Handled = true;
            }
        }

        private void ChartCanvas_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
            {
                var hitElement = e.OriginalSource as FrameworkElement;
                if (hitElement?.DataContext is GanttTaskBar taskBar)
                {
                    _isDragging = true;
                    _dragStartPoint = e.GetPosition(ChartCanvas);
                    _draggedElement = hitElement;
                    ChartCanvas.CaptureMouse();
                    e.Handled = true;
                }
            }
        }

        private void ChartCanvas_MouseMove(object sender, MouseEventArgs e)
        {
            if (_isDragging && e.LeftButton == MouseButtonState.Pressed && _draggedElement != null)
            {
                var currentPoint = e.GetPosition(ChartCanvas);
                var deltaX = currentPoint.X - _dragStartPoint.X;
                
                if (_draggedElement.DataContext is GanttTaskBar taskBar)
                {
                    // Convert pixel movement to days
                    var dayWidth = _viewModel.DayWidth * _viewModel.ZoomLevel;
                    var daysDelta = (int)(deltaX / dayWidth);
                    
                    if (Math.Abs(daysDelta) >= 1)
                    {
                        _viewModel?.MoveTask(taskBar, daysDelta);
                        _dragStartPoint = currentPoint;
                    }
                }
                
                e.Handled = true;
            }
        }

        private void ChartCanvas_MouseUp(object sender, MouseButtonEventArgs e)
        {
            if (_isDragging)
            {
                _isDragging = false;
                _draggedElement = null;
                ChartCanvas.ReleaseMouseCapture();
                e.Handled = true;
            }
        }

        private void TimelineScroller_ScrollChanged(object sender, ScrollChangedEventArgs e)
        {
            // Sync vertical scrolling between task list and timeline
            if (sender == TimelineScroller)
            {
                TaskListScroller.ScrollToVerticalOffset(e.VerticalOffset);
            }
        }

        private int GetWeekOfYear(DateTime date)
        {
            var jan1 = new DateTime(date.Year, 1, 1);
            var daysOffset = (int)jan1.DayOfWeek;
            var dayOfYear = date.DayOfYear;
            return (dayOfYear + daysOffset - 1) / 7 + 1;
        }
    }
}
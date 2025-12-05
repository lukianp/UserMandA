using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;
using MandADiscoverySuite.ViewModels;

namespace MandADiscoverySuite.Controls
{
    public class LineChart : Control
    {
        private Canvas _chartCanvas;
        private Canvas _axisCanvas;
        private StackPanel _legend;

        public static readonly DependencyProperty TimeSeriesDataProperty =
            DependencyProperty.Register("TimeSeriesData", typeof(IEnumerable<TimeSeriesDataPoint>), typeof(LineChart),
                new PropertyMetadata(null, OnDataChanged));

        public static readonly DependencyProperty ShowPointsProperty =
            DependencyProperty.Register("ShowPoints", typeof(bool), typeof(LineChart),
                new PropertyMetadata(true, OnLayoutChanged));

        public static readonly DependencyProperty ShowGridProperty =
            DependencyProperty.Register("ShowGrid", typeof(bool), typeof(LineChart),
                new PropertyMetadata(true, OnLayoutChanged));

        public IEnumerable<TimeSeriesDataPoint> TimeSeriesData
        {
            get => (IEnumerable<TimeSeriesDataPoint>)GetValue(TimeSeriesDataProperty);
            set => SetValue(TimeSeriesDataProperty, value);
        }

        public bool ShowPoints
        {
            get => (bool)GetValue(ShowPointsProperty);
            set => SetValue(ShowPointsProperty, value);
        }

        public bool ShowGrid
        {
            get => (bool)GetValue(ShowGridProperty);
            set => SetValue(ShowGridProperty, value);
        }

        static LineChart()
        {
            DefaultStyleKeyProperty.OverrideMetadata(typeof(LineChart), new FrameworkPropertyMetadata(typeof(LineChart)));
        }

        public override void OnApplyTemplate()
        {
            base.OnApplyTemplate();
            
            _chartCanvas = GetTemplateChild("PART_ChartCanvas") as Canvas;
            _axisCanvas = GetTemplateChild("PART_AxisCanvas") as Canvas;
            _legend = GetTemplateChild("PART_Legend") as StackPanel;
            
            UpdateChart();
        }

        private static void OnDataChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is LineChart chart)
                chart.UpdateChart();
        }

        private static void OnLayoutChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is LineChart chart)
                chart.UpdateChart();
        }

        private void UpdateChart()
        {
            if (_chartCanvas == null || TimeSeriesData == null)
                return;

            _chartCanvas.Children.Clear();
            _axisCanvas?.Children.Clear();
            _legend?.Children.Clear();

            var dataList = TimeSeriesData.OrderBy(d => d.Date).ToList();
            if (dataList.Count < 2)
                return;

            var canvasWidth = _chartCanvas.ActualWidth;
            var canvasHeight = _chartCanvas.ActualHeight;

            if (canvasWidth == 0 || canvasHeight == 0)
            {
                Dispatcher.BeginInvoke(new Action(UpdateChart), System.Windows.Threading.DispatcherPriority.Render);
                return;
            }

            var minDate = dataList.Min(d => d.Date);
            var maxDate = dataList.Max(d => d.Date);
            var dateRange = (maxDate - minDate).TotalDays;
            var maxValue = dataList.Max(d => d.Value);
            var minValue = dataList.Min(d => d.Value);
            var valueRange = maxValue - minValue;

            if (dateRange == 0) dateRange = 1;
            if (valueRange == 0) valueRange = 1;

            // Draw grid
            if (ShowGrid && _axisCanvas != null)
            {
                DrawGrid(canvasWidth, canvasHeight, minDate, maxDate, minValue, maxValue);
            }

            // Draw main value line
            var points = new PointCollection();

            for (int i = 0; i < dataList.Count; i++)
            {
                var data = dataList[i];
                var x = ((data.Date - minDate).TotalDays / dateRange) * (canvasWidth - 40) + 20;
                var y = canvasHeight - (((data.Value - minValue) / valueRange) * (canvasHeight - 40)) - 20;

                points.Add(new Point(x, y));

                // Draw data points
                if (ShowPoints)
                {
                    var point = new Ellipse
                    {
                        Width = 6,
                        Height = 6,
                        Fill = new SolidColorBrush(Color.FromRgb(66, 153, 225)),
                        Stroke = new SolidColorBrush(Color.FromRgb(226, 232, 240)),
                        StrokeThickness = 2
                    };

                    Canvas.SetLeft(point, x - 3);
                    Canvas.SetTop(point, y - 3);
                    _chartCanvas.Children.Add(point);

                    // Add tooltip on hover (simplified)
                    point.ToolTip = $"{data.Date:yyyy-MM-dd}: {data.Value:N0}";
                }
            }

            // Draw line
            if (points.Count > 1)
            {
                var polyline = new Polyline
                {
                    Points = points,
                    Stroke = new SolidColorBrush(Color.FromRgb(66, 153, 225)),
                    StrokeThickness = 2,
                    Fill = null
                };

                _chartCanvas.Children.Add(polyline);

                // Draw area under curve (optional)
                var areaPoints = new PointCollection(points);
                areaPoints.Add(new Point(points.Last().X, canvasHeight - 20));
                areaPoints.Add(new Point(points.First().X, canvasHeight - 20));

                var areaPolygon = new Polygon
                {
                    Points = areaPoints,
                    Fill = new SolidColorBrush(Color.FromArgb(30, 66, 153, 225)),
                    Stroke = null
                };

                _chartCanvas.Children.Insert(0, areaPolygon);
            }

            // Add legend
            if (_legend != null)
            {
                var legendItem = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(10, 0, 10, 0) };
                
                var colorRect = new Rectangle
                {
                    Width = 12,
                    Height = 12,
                    Fill = new SolidColorBrush(Color.FromRgb(66, 153, 225)),
                    Margin = new Thickness(0, 0, 6, 0)
                };
                
                var text = new TextBlock
                {
                    Text = "Values Over Time",
                    FontSize = 11,
                    Foreground = new SolidColorBrush(Color.FromRgb(160, 174, 192)),
                    VerticalAlignment = VerticalAlignment.Center
                };

                legendItem.Children.Add(colorRect);
                legendItem.Children.Add(text);
                _legend.Children.Add(legendItem);
            }
        }

        private void DrawGrid(double width, double height, DateTime minDate, DateTime maxDate, double minValue, double maxValue)
        {
            var gridLines = 5;
            
            // Horizontal grid lines (for values)
            var valueStep = (maxValue - minValue) / gridLines;
            var heightStep = height / gridLines;

            for (int i = 0; i <= gridLines; i++)
            {
                var y = height - (i * heightStep) - 20;
                
                var line = new Line
                {
                    X1 = 20,
                    Y1 = y,
                    X2 = width - 20,
                    Y2 = y,
                    Stroke = new SolidColorBrush(Color.FromRgb(74, 85, 104)),
                    StrokeThickness = 0.5,
                    StrokeDashArray = new DoubleCollection { 2, 2 }
                };

                _axisCanvas.Children.Add(line);

                // Y-axis labels
                var value = minValue + (i * valueStep);
                var yLabel = new TextBlock
                {
                    Text = FormatValue(value),
                    Foreground = new SolidColorBrush(Color.FromRgb(160, 174, 192)),
                    FontSize = 9,
                    VerticalAlignment = VerticalAlignment.Center
                };

                Canvas.SetLeft(yLabel, 0);
                Canvas.SetTop(yLabel, y - 7);
                _axisCanvas.Children.Add(yLabel);
            }

            // Vertical grid lines (for dates)
            var dateRange = (maxDate - minDate).TotalDays;
            var widthStep = (width - 40) / gridLines;

            for (int i = 0; i <= gridLines; i++)
            {
                var x = 20 + (i * widthStep);
                
                var line = new Line
                {
                    X1 = x,
                    Y1 = 20,
                    X2 = x,
                    Y2 = height - 20,
                    Stroke = new SolidColorBrush(Color.FromRgb(74, 85, 104)),
                    StrokeThickness = 0.5,
                    StrokeDashArray = new DoubleCollection { 2, 2 }
                };

                _axisCanvas.Children.Add(line);

                // X-axis labels
                var date = minDate.AddDays((dateRange / gridLines) * i);
                var xLabel = new TextBlock
                {
                    Text = date.ToString("MM/dd"),
                    Foreground = new SolidColorBrush(Color.FromRgb(160, 174, 192)),
                    FontSize = 9,
                    HorizontalAlignment = HorizontalAlignment.Center
                };

                Canvas.SetLeft(xLabel, x - 20);
                Canvas.SetTop(xLabel, height - 15);
                _axisCanvas.Children.Add(xLabel);
            }
        }

        private string FormatValue(double value)
        {
            if (value >= 1000000)
                return $"{value / 1000000:F1}M";
            if (value >= 1000)
                return $"{value / 1000:F1}K";
            return value.ToString("N0");
        }

        protected override void OnRenderSizeChanged(SizeChangedInfo sizeInfo)
        {
            base.OnRenderSizeChanged(sizeInfo);
            Dispatcher.BeginInvoke(new Action(UpdateChart), System.Windows.Threading.DispatcherPriority.Render);
        }
    }
}
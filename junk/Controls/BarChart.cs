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
    public class BarChart : Control
    {
        private Canvas _chartCanvas;
        private Canvas _axisCanvas;
        private StackPanel _xAxisLabels;

        public static readonly DependencyProperty DataProperty =
            DependencyProperty.Register("Data", typeof(IEnumerable<ChartDataPoint>), typeof(BarChart),
                new PropertyMetadata(null, OnDataChanged));

        public static readonly DependencyProperty ShowValuesProperty =
            DependencyProperty.Register("ShowValues", typeof(bool), typeof(BarChart),
                new PropertyMetadata(true, OnLayoutChanged));

        public static readonly DependencyProperty ShowGridProperty =
            DependencyProperty.Register("ShowGrid", typeof(bool), typeof(BarChart),
                new PropertyMetadata(true, OnLayoutChanged));

        public IEnumerable<ChartDataPoint> Data
        {
            get => (IEnumerable<ChartDataPoint>)GetValue(DataProperty);
            set => SetValue(DataProperty, value);
        }

        public bool ShowValues
        {
            get => (bool)GetValue(ShowValuesProperty);
            set => SetValue(ShowValuesProperty, value);
        }

        public bool ShowGrid
        {
            get => (bool)GetValue(ShowGridProperty);
            set => SetValue(ShowGridProperty, value);
        }

        static BarChart()
        {
            DefaultStyleKeyProperty.OverrideMetadata(typeof(BarChart), new FrameworkPropertyMetadata(typeof(BarChart)));
        }

        public override void OnApplyTemplate()
        {
            base.OnApplyTemplate();
            
            _chartCanvas = GetTemplateChild("PART_ChartCanvas") as Canvas;
            _axisCanvas = GetTemplateChild("PART_AxisCanvas") as Canvas;
            _xAxisLabels = GetTemplateChild("PART_XAxisLabels") as StackPanel;
            
            UpdateChart();
        }

        private static void OnDataChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is BarChart chart)
                chart.UpdateChart();
        }

        private static void OnLayoutChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is BarChart chart)
                chart.UpdateChart();
        }

        private void UpdateChart()
        {
            if (_chartCanvas == null || Data == null)
                return;

            _chartCanvas.Children.Clear();
            _axisCanvas?.Children.Clear();
            _xAxisLabels?.Children.Clear();

            var dataList = Data.Where(d => d.Value > 0).OrderByDescending(d => d.Value).Take(8).ToList();
            if (!dataList.Any())
                return;

            var canvasWidth = _chartCanvas.ActualWidth;
            var canvasHeight = _chartCanvas.ActualHeight;

            if (canvasWidth == 0 || canvasHeight == 0)
            {
                Dispatcher.BeginInvoke(new Action(UpdateChart), System.Windows.Threading.DispatcherPriority.Render);
                return;
            }

            var maxValue = dataList.Max(d => d.Value);
            var barWidth = (canvasWidth - 20) / dataList.Count - 10;
            var barSpacing = barWidth + 10;

            // Draw grid lines
            if (ShowGrid && _axisCanvas != null)
            {
                DrawGrid(canvasWidth, canvasHeight, maxValue);
            }

            // Draw bars
            for (int i = 0; i < dataList.Count; i++)
            {
                var dataPoint = dataList[i];
                var barHeight = (dataPoint.Value / maxValue) * (canvasHeight - 40);
                var x = i * barSpacing + 10;
                var y = canvasHeight - barHeight - 20;

                // Create bar
                var bar = new Rectangle
                {
                    Width = barWidth,
                    Height = barHeight,
                    Fill = GetBrushFromColor(dataPoint.Color),
                    Stroke = new SolidColorBrush(Color.FromRgb(45, 55, 72)),
                    StrokeThickness = 1
                };

                Canvas.SetLeft(bar, x);
                Canvas.SetTop(bar, y);
                _chartCanvas.Children.Add(bar);

                // Add value label on top of bar
                if (ShowValues)
                {
                    var valueLabel = new TextBlock
                    {
                        Text = FormatValue(dataPoint.Value),
                        Foreground = new SolidColorBrush(Color.FromRgb(226, 232, 240)),
                        FontSize = 10,
                        FontWeight = FontWeights.Medium,
                        HorizontalAlignment = HorizontalAlignment.Center
                    };

                    Canvas.SetLeft(valueLabel, x + (barWidth / 2) - 20);
                    Canvas.SetTop(valueLabel, y - 15);
                    _chartCanvas.Children.Add(valueLabel);
                }

                // Add X-axis label
                if (_xAxisLabels != null)
                {
                    var labelText = dataPoint.Label.Length > 12 ? dataPoint.Label.Substring(0, 12) + "..." : dataPoint.Label;
                    var xLabel = new TextBlock
                    {
                        Text = labelText,
                        Foreground = new SolidColorBrush(Color.FromRgb(160, 174, 192)),
                        FontSize = 9,
                        TextAlignment = TextAlignment.Center,
                        Width = barWidth + 10,
                        TextWrapping = TextWrapping.Wrap
                    };

                    _xAxisLabels.Children.Add(xLabel);
                }
            }
        }

        private void DrawGrid(double width, double height, double maxValue)
        {
            var gridLines = 5;
            var step = height / gridLines;
            var valueStep = maxValue / gridLines;

            for (int i = 0; i <= gridLines; i++)
            {
                var y = height - (i * step) - 20;
                
                // Grid line
                var line = new Line
                {
                    X1 = 0,
                    Y1 = y,
                    X2 = width,
                    Y2 = y,
                    Stroke = new SolidColorBrush(Color.FromRgb(74, 85, 104)),
                    StrokeThickness = 0.5,
                    StrokeDashArray = new DoubleCollection { 2, 2 }
                };

                _axisCanvas.Children.Add(line);

                // Y-axis label
                var value = i * valueStep;
                var yLabel = new TextBlock
                {
                    Text = FormatValue(value),
                    Foreground = new SolidColorBrush(Color.FromRgb(160, 174, 192)),
                    FontSize = 9,
                    VerticalAlignment = VerticalAlignment.Center
                };

                Canvas.SetLeft(yLabel, -45);
                Canvas.SetTop(yLabel, y - 7);
                _axisCanvas.Children.Add(yLabel);
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

        private Brush GetBrushFromColor(string colorStr)
        {
            try
            {
                if (string.IsNullOrEmpty(colorStr))
                    return new SolidColorBrush(Color.FromRgb(99, 102, 241));

                if (colorStr.StartsWith("#"))
                {
                    var color = (Color)ColorConverter.ConvertFromString(colorStr);
                    return new SolidColorBrush(color);
                }
                
                return new SolidColorBrush(Color.FromRgb(99, 102, 241));
            }
            catch
            {
                return new SolidColorBrush(Color.FromRgb(99, 102, 241));
            }
        }

        protected override void OnRenderSizeChanged(SizeChangedInfo sizeInfo)
        {
            base.OnRenderSizeChanged(sizeInfo);
            Dispatcher.BeginInvoke(new Action(UpdateChart), System.Windows.Threading.DispatcherPriority.Render);
        }
    }
}
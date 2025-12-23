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
    /// <summary>
    /// Simple chart control for data visualization
    /// </summary>
    public partial class SimpleChart : UserControl
    {
        public static readonly DependencyProperty ChartDataProperty =
            DependencyProperty.Register("ChartData", typeof(IEnumerable<ChartDataPoint>), typeof(SimpleChart),
                new PropertyMetadata(null, OnChartDataChanged));

        public static readonly DependencyProperty ChartTypeProperty =
            DependencyProperty.Register("ChartType", typeof(string), typeof(SimpleChart),
                new PropertyMetadata("Bar", OnChartTypeChanged));

        public IEnumerable<ChartDataPoint> ChartData
        {
            get => (IEnumerable<ChartDataPoint>)GetValue(ChartDataProperty);
            set => SetValue(ChartDataProperty, value);
        }

        public string ChartType
        {
            get => (string)GetValue(ChartTypeProperty);
            set => SetValue(ChartTypeProperty, value);
        }

        public SimpleChart()
        {
            InitializeComponent();
            SizeChanged += OnSizeChanged;
        }

        private static void OnChartDataChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is SimpleChart chart)
            {
                chart.UpdateChart();
            }
        }

        private static void OnChartTypeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is SimpleChart chart)
            {
                chart.UpdateChart();
            }
        }

        private void OnSizeChanged(object sender, SizeChangedEventArgs e)
        {
            UpdateChart();
        }

        private void UpdateChart()
        {
            if (ChartData == null || !ChartData.Any())
                return;

            ChartCanvas.Children.Clear();

            var canvasWidth = ChartCanvas.ActualWidth;
            var canvasHeight = ChartCanvas.ActualHeight;

            if (canvasWidth <= 0 || canvasHeight <= 0)
                return;

            switch (ChartType?.ToLowerInvariant())
            {
                case "pie":
                    DrawPieChart(canvasWidth, canvasHeight);
                    break;
                case "line":
                    DrawLineChart(canvasWidth, canvasHeight);
                    break;
                default:
                    DrawBarChart(canvasWidth, canvasHeight);
                    break;
            }
        }

        private void DrawBarChart(double width, double height)
        {
            var data = ChartData.ToList();
            if (!data.Any()) return;

            var maxValue = data.Max(d => d.Value);
            var barWidth = width / data.Count * 0.8;
            var spacing = width / data.Count * 0.2;

            for (int i = 0; i < data.Count; i++)
            {
                var item = data[i];
                var barHeight = (item.Value / maxValue) * height * 0.8;
                var x = i * (barWidth + spacing) + spacing / 2;
                var y = height - barHeight;

                var rect = new Rectangle
                {
                    Width = barWidth,
                    Height = barHeight,
                    Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString(item.Color ?? "#36A2EB"))
                };

                Canvas.SetLeft(rect, x);
                Canvas.SetTop(rect, y);
                ChartCanvas.Children.Add(rect);

                // Add label
                var label = new TextBlock
                {
                    Text = item.Value.ToString("N0"),
                    FontSize = 10,
                    HorizontalAlignment = HorizontalAlignment.Center
                };

                label.Measure(new Size(double.PositiveInfinity, double.PositiveInfinity));
                Canvas.SetLeft(label, x + barWidth / 2 - label.DesiredSize.Width / 2);
                Canvas.SetTop(label, y - 15);
                ChartCanvas.Children.Add(label);
            }
        }

        private void DrawPieChart(double width, double height)
        {
            var data = ChartData.ToList();
            if (!data.Any()) return;

            var centerX = width / 2;
            var centerY = height / 2;
            var radius = Math.Min(width, height) / 2 * 0.8;
            var total = data.Sum(d => d.Value);

            double currentAngle = 0;

            foreach (var item in data)
            {
                var sweepAngle = (item.Value / total) * 360;
                
                if (sweepAngle > 0)
                {
                    var slice = CreatePieSlice(centerX, centerY, radius, currentAngle, sweepAngle, item.Color ?? "#36A2EB");
                    ChartCanvas.Children.Add(slice);
                    currentAngle += sweepAngle;
                }
            }
        }

        private void DrawLineChart(double width, double height)
        {
            var data = ChartData.ToList();
            if (data.Count < 2) return;

            var maxValue = data.Max(d => d.Value);
            var minValue = data.Min(d => d.Value);
            var valueRange = maxValue - minValue;

            if (valueRange == 0) return;

            var polyline = new Polyline
            {
                Stroke = new SolidColorBrush(Colors.Blue),
                StrokeThickness = 2
            };

            for (int i = 0; i < data.Count; i++)
            {
                var x = (i / (double)(data.Count - 1)) * width;
                var y = height - ((data[i].Value - minValue) / valueRange) * height;
                polyline.Points.Add(new Point(x, y));
            }

            ChartCanvas.Children.Add(polyline);

            // Add data points
            for (int i = 0; i < data.Count; i++)
            {
                var x = (i / (double)(data.Count - 1)) * width;
                var y = height - ((data[i].Value - minValue) / valueRange) * height;

                var dot = new Ellipse
                {
                    Width = 6,
                    Height = 6,
                    Fill = new SolidColorBrush(Colors.Red)
                };

                Canvas.SetLeft(dot, x - 3);
                Canvas.SetTop(dot, y - 3);
                ChartCanvas.Children.Add(dot);
            }
        }

        private System.Windows.Shapes.Path CreatePieSlice(double centerX, double centerY, double radius, double startAngle, double sweepAngle, string color)
        {
            var startAngleRad = startAngle * Math.PI / 180;
            var endAngleRad = (startAngle + sweepAngle) * Math.PI / 180;

            var x1 = centerX + radius * Math.Cos(startAngleRad);
            var y1 = centerY + radius * Math.Sin(startAngleRad);
            var x2 = centerX + radius * Math.Cos(endAngleRad);
            var y2 = centerY + radius * Math.Sin(endAngleRad);

            var isLargeArc = sweepAngle > 180;

            var pathData = $"M {centerX},{centerY} L {x1},{y1} A {radius},{radius} 0 {(isLargeArc ? 1 : 0)},1 {x2},{y2} Z";

            return new System.Windows.Shapes.Path
            {
                Data = Geometry.Parse(pathData),
                Fill = new SolidColorBrush((Color)ColorConverter.ConvertFromString(color))
            };
        }
    }
}
using System;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Messages
{
    /// <summary>
    /// Message sent when the application theme changes
    /// </summary>
    public class ThemeChangedMessage
    {
        public ThemeChangedMessage(ThemeMode theme, AccentColor accentColor)
        {
            Theme = theme;
            AccentColor = accentColor;
            Timestamp = DateTime.Now;
        }

        public ThemeMode Theme { get; }
        public AccentColor AccentColor { get; }
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message sent when the accent color changes
    /// </summary>
    public class AccentColorChangedMessage
    {
        public AccentColorChangedMessage(AccentColor accentColor)
        {
            AccentColor = accentColor;
            Timestamp = DateTime.Now;
        }

        public AccentColor AccentColor { get; }
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message sent when the font size changes
    /// </summary>
    public class FontSizeChangedMessage
    {
        public FontSizeChangedMessage(double fontSize)
        {
            FontSize = fontSize;
            Timestamp = DateTime.Now;
        }

        public double FontSize { get; }
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message sent when motion settings change
    /// </summary>
    public class MotionSettingsChangedMessage
    {
        public MotionSettingsChangedMessage(bool reducedMotion)
        {
            ReducedMotion = reducedMotion;
            Timestamp = DateTime.Now;
        }

        public bool ReducedMotion { get; }
        public DateTime Timestamp { get; }
    }

    /// <summary>
    /// Message sent when high contrast settings change
    /// </summary>
    public class HighContrastChangedMessage
    {
        public HighContrastChangedMessage(bool highContrast)
        {
            HighContrast = highContrast;
            Timestamp = DateTime.Now;
        }

        public bool HighContrast { get; }
        public DateTime Timestamp { get; }
    }
}
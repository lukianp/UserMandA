using System;
using System.ComponentModel;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Controls
{
    /// <summary>
    /// Optimized image control with lazy loading, caching, and error handling
    /// </summary>
    public partial class OptimizedImage : UserControl
    {
        private readonly ImageOptimizationService _imageService;
        private string _currentImagePath;

        #region Dependency Properties

        public static readonly DependencyProperty SourceProperty =
            DependencyProperty.Register(nameof(Source), typeof(string), typeof(OptimizedImage),
                new PropertyMetadata(null, OnSourceChanged));

        public static readonly DependencyProperty MaxWidthPixelsProperty =
            DependencyProperty.Register(nameof(MaxWidthPixels), typeof(int?), typeof(OptimizedImage),
                new PropertyMetadata(null, OnSizeChanged));

        public static readonly DependencyProperty MaxHeightPixelsProperty =
            DependencyProperty.Register(nameof(MaxHeightPixels), typeof(int?), typeof(OptimizedImage),
                new PropertyMetadata(null, OnSizeChanged));

        public static readonly DependencyProperty StretchProperty =
            DependencyProperty.Register(nameof(Stretch), typeof(Stretch), typeof(OptimizedImage),
                new PropertyMetadata(Stretch.Uniform));

        public static readonly DependencyProperty StretchDirectionProperty =
            DependencyProperty.Register(nameof(StretchDirection), typeof(StretchDirection), typeof(OptimizedImage),
                new PropertyMetadata(StretchDirection.Both));

        public static readonly DependencyProperty PlaceholderTextProperty =
            DependencyProperty.Register(nameof(PlaceholderText), typeof(string), typeof(OptimizedImage),
                new PropertyMetadata("No image", OnPlaceholderTextChanged));

        public static readonly DependencyProperty ShowLoadingIndicatorProperty =
            DependencyProperty.Register(nameof(ShowLoadingIndicator), typeof(bool), typeof(OptimizedImage),
                new PropertyMetadata(true));

        public static readonly DependencyProperty EnableCachingProperty =
            DependencyProperty.Register(nameof(EnableCaching), typeof(bool), typeof(OptimizedImage),
                new PropertyMetadata(true));

        public static readonly DependencyProperty LoadingStateProperty =
            DependencyProperty.Register(nameof(LoadingState), typeof(ImageLoadingState), typeof(OptimizedImage),
                new PropertyMetadata(ImageLoadingState.NotLoaded, OnLoadingStateChanged));

        #endregion

        #region Properties

        /// <summary>
        /// Gets or sets the image source path or URI
        /// </summary>
        public string Source
        {
            get => (string)GetValue(SourceProperty);
            set => SetValue(SourceProperty, value);
        }

        /// <summary>
        /// Gets or sets the maximum width in pixels for image decoding
        /// </summary>
        public int? MaxWidthPixels
        {
            get => (int?)GetValue(MaxWidthPixelsProperty);
            set => SetValue(MaxWidthPixelsProperty, value);
        }

        /// <summary>
        /// Gets or sets the maximum height in pixels for image decoding
        /// </summary>
        public int? MaxHeightPixels
        {
            get => (int?)GetValue(MaxHeightPixelsProperty);
            set => SetValue(MaxHeightPixelsProperty, value);
        }

        /// <summary>
        /// Gets or sets how the image is stretched to fill the destination rectangle
        /// </summary>
        public Stretch Stretch
        {
            get => (Stretch)GetValue(StretchProperty);
            set => SetValue(StretchProperty, value);
        }

        /// <summary>
        /// Gets or sets how the image is scaled
        /// </summary>
        public StretchDirection StretchDirection
        {
            get => (StretchDirection)GetValue(StretchDirectionProperty);
            set => SetValue(StretchDirectionProperty, value);
        }

        /// <summary>
        /// Gets or sets the placeholder text shown when no image is loaded
        /// </summary>
        public string PlaceholderText
        {
            get => (string)GetValue(PlaceholderTextProperty);
            set => SetValue(PlaceholderTextProperty, value);
        }

        /// <summary>
        /// Gets or sets whether to show a loading indicator during image load
        /// </summary>
        public bool ShowLoadingIndicator
        {
            get => (bool)GetValue(ShowLoadingIndicatorProperty);
            set => SetValue(ShowLoadingIndicatorProperty, value);
        }

        /// <summary>
        /// Gets or sets whether to enable image caching
        /// </summary>
        public bool EnableCaching
        {
            get => (bool)GetValue(EnableCachingProperty);
            set => SetValue(EnableCachingProperty, value);
        }

        /// <summary>
        /// Gets the current loading state of the image
        /// </summary>
        public ImageLoadingState LoadingState
        {
            get => (ImageLoadingState)GetValue(LoadingStateProperty);
            private set => SetValue(LoadingStateProperty, value);
        }

        #endregion

        #region Events

        /// <summary>
        /// Occurs when the image loading state changes
        /// </summary>
        public event EventHandler<ImageLoadingStateChangedEventArgs> LoadingStateChanged;

        /// <summary>
        /// Occurs when an image fails to load
        /// </summary>
        public event EventHandler<ImageLoadFailedEventArgs> LoadFailed;

        #endregion

        public OptimizedImage()
        {
            InitializeComponent();
            _imageService = ServiceLocator.GetService<ImageOptimizationService>() ?? new ImageOptimizationService();
            
            // Initialize with placeholder state
            LoadingState = ImageLoadingState.NotLoaded;
            UpdateVisualState();
        }

        #region Event Handlers

        private static void OnSourceChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is OptimizedImage control)
            {
                control.LoadImageAsync(e.NewValue as string);
            }
        }

        private static void OnSizeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is OptimizedImage control && !string.IsNullOrEmpty(control._currentImagePath))
            {
                // Reload with new dimensions
                control.LoadImageAsync(control._currentImagePath);
            }
        }

        private static void OnPlaceholderTextChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is OptimizedImage control)
            {
                control.PlaceholderTextBlock.Text = e.NewValue as string ?? "No image";
            }
        }

        private static void OnLoadingStateChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is OptimizedImage control)
            {
                control.UpdateVisualState();
                control.LoadingStateChanged?.Invoke(control, new ImageLoadingStateChangedEventArgs(
                    (ImageLoadingState)e.OldValue, (ImageLoadingState)e.NewValue));
            }
        }

        #endregion

        #region Private Methods

        private async void LoadImageAsync(string imagePath)
        {
            _currentImagePath = imagePath;

            if (string.IsNullOrEmpty(imagePath))
            {
                LoadingState = ImageLoadingState.NotLoaded;
                MainImage.Source = null;
                return;
            }

            try
            {
                LoadingState = ImageLoadingState.Loading;

                var image = await _imageService.LoadOptimizedImageAsync(
                    imagePath, MaxWidthPixels, MaxHeightPixels, EnableCaching);

                if (image != null && _currentImagePath == imagePath) // Check if still current
                {
                    MainImage.Source = image;
                    LoadingState = ImageLoadingState.Loaded;
                }
                else if (_currentImagePath == imagePath) // Still current but failed
                {
                    LoadingState = ImageLoadingState.Failed;
                    LoadFailed?.Invoke(this, new ImageLoadFailedEventArgs(imagePath, "Image could not be loaded"));
                }
            }
            catch (Exception ex)
            {
                if (_currentImagePath == imagePath) // Still current
                {
                    LoadingState = ImageLoadingState.Failed;
                    LoadFailed?.Invoke(this, new ImageLoadFailedEventArgs(imagePath, ex.Message));
                }
            }
        }

        private void UpdateVisualState()
        {
            // Hide all panels first
            MainImage.Visibility = Visibility.Collapsed;
            LoadingPanel.Visibility = Visibility.Collapsed;
            ErrorPanel.Visibility = Visibility.Collapsed;
            PlaceholderPanel.Visibility = Visibility.Collapsed;

            switch (LoadingState)
            {
                case ImageLoadingState.NotLoaded:
                    PlaceholderPanel.Visibility = Visibility.Visible;
                    break;

                case ImageLoadingState.Loading:
                    if (ShowLoadingIndicator)
                        LoadingPanel.Visibility = Visibility.Visible;
                    else
                        PlaceholderPanel.Visibility = Visibility.Visible;
                    break;

                case ImageLoadingState.Loaded:
                    MainImage.Visibility = Visibility.Visible;
                    break;

                case ImageLoadingState.Failed:
                    ErrorPanel.Visibility = Visibility.Visible;
                    break;
            }
        }

        #endregion
    }

    /// <summary>
    /// Represents the loading state of an image
    /// </summary>
    public enum ImageLoadingState
    {
        NotLoaded,
        Loading,
        Loaded,
        Failed
    }

    /// <summary>
    /// Event arguments for image loading state changes
    /// </summary>
    public class ImageLoadingStateChangedEventArgs : EventArgs
    {
        public ImageLoadingState OldState { get; }
        public ImageLoadingState NewState { get; }

        public ImageLoadingStateChangedEventArgs(ImageLoadingState oldState, ImageLoadingState newState)
        {
            OldState = oldState;
            NewState = newState;
        }
    }

    /// <summary>
    /// Event arguments for image load failures
    /// </summary>
    public class ImageLoadFailedEventArgs : EventArgs
    {
        public string ImagePath { get; }
        public string ErrorMessage { get; }

        public ImageLoadFailedEventArgs(string imagePath, string errorMessage)
        {
            ImagePath = imagePath;
            ErrorMessage = errorMessage;
        }
    }
}
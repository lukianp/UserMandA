// Version: 1.0.0
// Author: Lukian Poleschtschuk
// Date Modified: 2025-09-16
using System;
using System.Windows;
using System.Windows.Controls.Primitives;
using System.Windows.Input;
using Microsoft.Extensions.Logging;
using CommunityToolkit.Mvvm.Messaging;
using MandADiscoverySuite.Controls;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Messages;

namespace MandADiscoverySuite.Services
{
    /// <summary>
    /// Service for managing the command palette
    /// </summary>
    public class CommandPaletteService : IDisposable
    {
        private readonly ILogger<CommandPaletteService> _logger;
        private readonly IMessenger _messenger;
        private readonly Func<CommandPaletteViewModel> _viewModelFactory;
        
        private Popup _popup;
        private CommandPalette _commandPalette;
        private CommandPaletteViewModel _viewModel;
        private Window _parentWindow;
        private bool _isOpen;

        public CommandPaletteService(
            ILogger<CommandPaletteService> logger,
            IMessenger messenger,
            Func<CommandPaletteViewModel> viewModelFactory)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _messenger = messenger ?? throw new ArgumentNullException(nameof(messenger));
            _viewModelFactory = viewModelFactory ?? throw new ArgumentNullException(nameof(viewModelFactory));

            // Register for close message
            _messenger.Register<NavigationMessage>(this, OnNavigationMessage);
        }

        /// <summary>
        /// Initializes the command palette for a specific window
        /// </summary>
        public void Initialize(Window parentWindow)
        {
            _parentWindow = parentWindow ?? throw new ArgumentNullException(nameof(parentWindow));
            
            // Register global hotkey
            var openCommand = new RoutedCommand();
            var binding = new CommandBinding(openCommand, (s, e) => Toggle());
            var keyBinding = new KeyBinding(openCommand, Key.P, ModifierKeys.Control | ModifierKeys.Shift);
            
            _parentWindow.CommandBindings.Add(binding);
            _parentWindow.InputBindings.Add(keyBinding);

            _logger.LogInformation("Command palette initialized for window: {WindowTitle}", _parentWindow.Title);
        }

        /// <summary>
        /// Shows the command palette
        /// </summary>
        public void Show()
        {
            if (_isOpen) return;

            try
            {
                CreatePopup();
                PositionPopup();
                
                _popup.IsOpen = true;
                _isOpen = true;
                
                // Focus the search box
                _commandPalette.FocusSearchBox();
                
                _logger.LogDebug("Command palette opened");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error showing command palette");
            }
        }

        /// <summary>
        /// Hides the command palette
        /// </summary>
        public void Hide()
        {
            if (!_isOpen) return;

            try
            {
                if (_popup != null)
                {
                    _popup.IsOpen = false;
                }
                _isOpen = false;
                
                _logger.LogDebug("Command palette closed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error hiding command palette");
            }
        }

        /// <summary>
        /// Toggles the command palette visibility
        /// </summary>
        public void Toggle()
        {
            if (_isOpen)
                Hide();
            else
                Show();
        }

        private void CreatePopup()
        {
            if (_popup == null)
            {
                _viewModel = _viewModelFactory();
                _commandPalette = new CommandPalette
                {
                    DataContext = _viewModel,
                    Width = 600,
                    MaxHeight = 400
                };

                _popup = new Popup
                {
                    Child = _commandPalette,
                    PlacementTarget = _parentWindow,
                    Placement = PlacementMode.Center,
                    AllowsTransparency = true,
                    StaysOpen = false,
                    PopupAnimation = PopupAnimation.Fade
                };

                // Handle popup closed event
                _popup.Closed += (s, e) =>
                {
                    _isOpen = false;
                    _logger.LogDebug("Command palette popup closed");
                };

                // Handle clicks outside to close
                _popup.LostFocus += (s, e) => Hide();
            }
        }

        private void PositionPopup()
        {
            if (_popup != null && _parentWindow != null)
            {
                _popup.HorizontalOffset = (_parentWindow.ActualWidth - _commandPalette.Width) / 2;
                _popup.VerticalOffset = -100; // Position slightly above center
            }
        }

        private void OnNavigationMessage(object recipient, NavigationMessage message)
        {
            if (message.ViewName == "CloseCommandPalette")
            {
                Hide();
            }
        }

        public void Dispose()
        {
            try
            {
                Hide();
                
                _messenger?.Unregister<NavigationMessage>(this);
                
                if (_popup != null)
                {
                    _popup.Child = null;
                    _popup = null;
                }
                
                _viewModel?.Dispose();
                _commandPalette = null;
                
                _logger.LogDebug("Command palette service disposed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disposing command palette service");
            }
        }
    }
}
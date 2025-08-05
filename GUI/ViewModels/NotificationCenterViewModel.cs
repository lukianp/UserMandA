using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows.Input;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using Microsoft.Extensions.Logging;
using Microsoft.Win32;
using MandADiscoverySuite.Messages;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// ViewModel for the notification center
    /// </summary>
    public partial class NotificationCenterViewModel : BaseViewModel, IRecipient<NotificationAddedMessage>, 
        IRecipient<NotificationUpdatedMessage>, IRecipient<NotificationRemovedMessage>, 
        IRecipient<NotificationsClearedMessage>, IRecipient<NotificationBulkUpdateMessage>
    {
        private readonly NotificationService _notificationService;
        private readonly IMessenger _messenger;
        private ObservableCollection<Notification> _notifications;

        public NotificationCenterViewModel() : base()
        {
            _notificationService = ServiceLocator.GetService<NotificationService>();
            _messenger = ServiceLocator.GetService<IMessenger>();
            
            _notifications = new ObservableCollection<Notification>();
            
            InitializeCommands();
            LoadNotifications();
            
            // Register for notification messages
            _messenger.RegisterAll(this);
        }

        #region Properties

        public ObservableCollection<Notification> Notifications
        {
            get => _notifications;
            set => SetProperty(ref _notifications, value);
        }

        public int UnreadCount => _notificationService.UnreadCount;

        public int NotificationCount => _notificationService.TotalCount;

        public bool HasNotifications => NotificationCount > 0;

        public bool HasUnreadNotifications => UnreadCount > 0;

        #endregion

        #region Commands

        public ICommand MarkReadCommand { get; private set; }
        public ICommand MarkAllReadCommand { get; private set; }
        public ICommand RemoveNotificationCommand { get; private set; }
        public ICommand ClearAllCommand { get; private set; }
        public ICommand ExecuteActionCommand { get; private set; }
        public ICommand ExportCommand { get; private set; }

        #endregion

        #region Private Methods

        protected override void InitializeCommands()
        {
            MarkReadCommand = new RelayCommand<Guid>(MarkNotificationRead);
            MarkAllReadCommand = new RelayCommand(MarkAllNotificationsRead);
            RemoveNotificationCommand = new RelayCommand<Guid>(RemoveNotification);
            ClearAllCommand = new RelayCommand(ClearAllNotifications);
            ExecuteActionCommand = new RelayCommand<Notification>(ExecuteNotificationAction);
            ExportCommand = new RelayCommand(ExportNotifications);
        }

        private void LoadNotifications()
        {
            try
            {
                var notifications = _notificationService.Notifications
                    .OrderByDescending(n => n.Timestamp)
                    .Take(50) // Limit to 50 most recent
                    .ToList();

                Notifications.Clear();
                foreach (var notification in notifications)
                {
                    Notifications.Add(notification);
                }

                UpdatePropertyCounts();
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error loading notifications for notification center");
            }
        }

        private void UpdatePropertyCounts()
        {
            OnPropertyChanged(nameof(UnreadCount));
            OnPropertyChanged(nameof(NotificationCount));
            OnPropertyChanged(nameof(HasNotifications));
            OnPropertyChanged(nameof(HasUnreadNotifications));
        }

        private void MarkNotificationRead(Guid notificationId)
        {
            try
            {
                _notificationService.MarkAsRead(notificationId);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error marking notification as read: {Id}", notificationId);
            }
        }

        private void MarkAllNotificationsRead()
        {
            try
            {
                _notificationService.MarkAllAsRead();
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error marking all notifications as read");
            }
        }

        private void RemoveNotification(Guid notificationId)
        {
            try
            {
                _notificationService.RemoveNotification(notificationId);
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error removing notification: {Id}", notificationId);
            }
        }

        private void ClearAllNotifications()
        {
            try
            {
                var result = System.Windows.MessageBox.Show(
                    "This will permanently delete all notifications.\n\nAre you sure you want to continue?",
                    "Clear All Notifications",
                    System.Windows.MessageBoxButton.YesNo,
                    System.Windows.MessageBoxImage.Warning);

                if (result == System.Windows.MessageBoxResult.Yes)
                {
                    _notificationService.ClearAll();
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error clearing all notifications");
            }
        }

        private void ExecuteNotificationAction(Notification notification)
        {
            try
            {
                if (notification?.ActionCallback != null)
                {
                    notification.ActionCallback.Invoke();
                    
                    // Mark as read after action execution
                    _notificationService.MarkAsRead(notification.Id);
                    
                    Logger?.LogDebug("Executed action for notification: {Title}", notification.Title);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error executing notification action: {Title}", notification?.Title);
            }
        }

        private async void ExportNotifications()
        {
            try
            {
                var dialog = new SaveFileDialog
                {
                    Title = "Export Notifications",
                    Filter = "JSON Files (*.json)|*.json|All Files (*.*)|*.*",
                    DefaultExt = ".json",
                    FileName = $"notifications-{DateTime.Now:yyyy-MM-dd}.json"
                };

                if (dialog.ShowDialog() == true)
                {
                    await _notificationService.ExportNotificationsAsync(dialog.FileName);
                    
                    _notificationService.AddSuccess(
                        "Export Completed", 
                        $"Notifications exported to {System.IO.Path.GetFileName(dialog.FileName)}");
                        
                    Logger?.LogInformation("Exported notifications to {FilePath}", dialog.FileName);
                }
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error exporting notifications");
                _notificationService.AddError(
                    "Export Failed", 
                    "An error occurred while exporting notifications.");
            }
        }

        #endregion

        #region Message Handlers

        public void Receive(NotificationAddedMessage message)
        {
            try
            {
                App.Current?.Dispatcher.Invoke(() =>
                {
                    // Insert at the beginning for newest first
                    Notifications.Insert(0, message.Notification);
                    
                    // Keep only the 50 most recent
                    while (Notifications.Count > 50)
                    {
                        Notifications.RemoveAt(Notifications.Count - 1);
                    }
                    
                    UpdatePropertyCounts();
                });
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error handling notification added message");
            }
        }

        public void Receive(NotificationUpdatedMessage message)
        {
            try
            {
                App.Current?.Dispatcher.Invoke(() =>
                {
                    var existingNotification = Notifications.FirstOrDefault(n => n.Id == message.Notification.Id);
                    if (existingNotification != null)
                    {
                        var index = Notifications.IndexOf(existingNotification);
                        Notifications[index] = message.Notification;
                    }
                    
                    UpdatePropertyCounts();
                });
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error handling notification updated message");
            }
        }

        public void Receive(NotificationRemovedMessage message)
        {
            try
            {
                App.Current?.Dispatcher.Invoke(() =>
                {
                    var notification = Notifications.FirstOrDefault(n => n.Id == message.NotificationId);
                    if (notification != null)
                    {
                        Notifications.Remove(notification);
                    }
                    
                    UpdatePropertyCounts();
                });
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error handling notification removed message");
            }
        }

        public void Receive(NotificationsClearedMessage message)
        {
            try
            {
                App.Current?.Dispatcher.Invoke(() =>
                {
                    Notifications.Clear();
                    UpdatePropertyCounts();
                });
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error handling notifications cleared message");
            }
        }

        public void Receive(NotificationBulkUpdateMessage message)
        {
            try
            {
                App.Current?.Dispatcher.Invoke(() =>
                {
                    LoadNotifications(); // Reload all notifications
                });
            }
            catch (Exception ex)
            {
                Logger?.LogError(ex, "Error handling notification bulk update message");
            }
        }

        #endregion

        #region IDisposable

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _messenger?.UnregisterAll(this);
            }
            base.Dispose(disposing);
        }

        #endregion
    }
}
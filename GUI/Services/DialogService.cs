using System.Windows;

namespace MandADiscoverySuite.Services
{
    public interface IDialogService
    {
        bool ShowConfirmationDialog(string title, string message, string confirmButtonText = "Yes", string cancelButtonText = "No");
        void ShowInformationDialog(string title, string message);
        void ShowWarningDialog(string title, string message);
        void ShowErrorDialog(string title, string message);
    }

    public class DialogService : IDialogService
    {
        private static DialogService _instance;
        private static readonly object _lock = new object();

        public static DialogService Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                            _instance = new DialogService();
                    }
                }
                return _instance;
            }
        }

        private DialogService() { }

        public bool ShowConfirmationDialog(string title, string message, string confirmButtonText = "Yes", string cancelButtonText = "No")
        {
            var result = MessageBox.Show(
                message,
                title,
                MessageBoxButton.YesNo,
                MessageBoxImage.Question,
                MessageBoxResult.No
            );

            return result == MessageBoxResult.Yes;
        }

        public void ShowInformationDialog(string title, string message)
        {
            MessageBox.Show(
                message,
                title,
                MessageBoxButton.OK,
                MessageBoxImage.Information
            );
        }

        public void ShowWarningDialog(string title, string message)
        {
            MessageBox.Show(
                message,
                title,
                MessageBoxButton.OK,
                MessageBoxImage.Warning
            );
        }

        public void ShowErrorDialog(string title, string message)
        {
            MessageBox.Show(
                message,
                title,
                MessageBoxButton.OK,
                MessageBoxImage.Error
            );
        }
    }
}
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Stub ViewModel for PolicyDetail for XAML compatibility
    /// </summary>
    public class PolicyDetailViewModel : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler? PropertyChanged;
        
        protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
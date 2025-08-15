using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace MandADiscoverySuite.ViewModels
{
    /// <summary>
    /// Stub ViewModel for DiscoveryModule for XAML compatibility
    /// </summary>
    public class DiscoveryModuleViewModel : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler? PropertyChanged;
        
        protected virtual void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
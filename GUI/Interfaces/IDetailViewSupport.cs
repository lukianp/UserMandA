using System.Threading.Tasks;
using System.Windows.Input;

namespace GUI.Interfaces
{
    public interface IDetailViewSupport
    {
        ICommand ViewDetailsCommand { get; }
        Task OpenDetailViewAsync(object selectedItem);
    }
}
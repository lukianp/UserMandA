using System.Threading.Tasks;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.ViewModels;
using MandADiscoverySuite.Services;
using Moq;
using Xunit;

namespace MandADiscoverySuite.Tests.ViewModels
{
    public class SecurityGroupInventoryViewModelTests
    {
        [Fact]
        public async Task OpenGroupCommand_InvokesDetailWindowService()
        {
            var mockService = new Mock<IDetailWindowService>();
            mockService.Setup(s => s.ShowDetailWindowAsync(It.IsAny<GroupDetailData>(), null))
                       .Returns(Task.FromResult<System.Windows.Window>(null))
                       .Verifiable();

            var vm = new SecurityGroupInventoryViewModel(mockService.Object);
            vm.Groups.Add(new SecurityGroupInfo { Name = "Group One", SamAccountName = "grp1", GroupType = "Security", Scope = "Global" });
            vm.SelectedGroup = vm.Groups[0];

            vm.OpenGroupCommand.Execute(null);
            await Task.Delay(50);

            mockService.Verify();
        }
    }
}

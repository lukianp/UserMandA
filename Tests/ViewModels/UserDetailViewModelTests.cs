using System.Dynamic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using MandADiscoverySuite.ViewModels;
using Xunit;

namespace MandADiscoverySuite.Tests.ViewModels
{
    public class UserDetailViewModelTests
    {
        [Fact]
        public async Task LoadGroupMembershipsAsync_LoadsExtendedMetadata()
        {
            var tempDir = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
            Directory.CreateDirectory(tempDir);
            var csvPath = Path.Combine(tempDir, "Groups.csv");
            var csv = "SamAccountName,Name,GroupCategory,GroupScope,Description,IsNested,Members\n" +
                      "grp1,Group One,Security,Global,First group,false,user1;user2\n" +
                      "grp2,Group Two,Security,Universal,Second group,true,user3\n";
            File.WriteAllText(csvPath, csv);

            dynamic user = new ExpandoObject();
            user.Id = "user1";
            user.DisplayName = "User One";

            var vm = new UserDetailViewModel(user, tempDir);
            await Task.Delay(200);

            Assert.Single(vm.GroupMemberships);
            var g = vm.GroupMemberships.First();
            Assert.Equal("Group One", g.DisplayName);
            Assert.Equal("Security", g.GroupType);
            Assert.Equal("Global", g.Scope);
            Assert.Equal("First group", g.Description);
            Assert.False(g.IsNested);

            Directory.Delete(tempDir, true);
        }
    }
}

using System;
using System.Threading.Tasks;
using System.Windows;
using MandADiscoverySuite.Models;
using MandADiscoverySuite.Services;

namespace MandADiscoverySuite.Extensions
{
    /// <summary>
    /// Extension methods to easily show detail windows
    /// </summary>
    public static class DetailWindowExtensions
    {
        private static IDetailWindowService DetailWindowService => 
            SimpleServiceLocator.Instance.GetService<IDetailWindowService>();

        #region User Details

        /// <summary>
        /// Shows a detail window for a user
        /// </summary>
        public static async Task<Window> ShowUserDetailAsync(this object source, string userId, string displayName = null, string email = null)
        {
            var userData = new UserDetailData
            {
                Id = userId,
                DisplayName = displayName ?? "Unknown User",
                Email = email,
                Title = "User Details",
                LastUpdated = DateTime.Now
            };

            return await DetailWindowService.ShowDetailWindowAsync(userData);
        }

        /// <summary>
        /// Shows a detail window for user data
        /// </summary>
        public static async Task<Window> ShowUserDetailAsync(this object source, UserDetailData userData)
        {
            return await DetailWindowService.ShowDetailWindowAsync(userData);
        }

        #endregion

        #region Computer Details

        /// <summary>
        /// Shows a detail window for a computer
        /// </summary>
        public static async Task<Window> ShowComputerDetailAsync(this object source, string computerId, string computerName = null, string ipAddress = null)
        {
            var computerData = new ComputerDetailData
            {
                Id = computerId,
                ComputerName = computerName ?? "Unknown Computer",
                IPAddress = ipAddress,
                Title = "Computer Details",
                LastUpdated = DateTime.Now
            };

            return await DetailWindowService.ShowDetailWindowAsync(computerData);
        }

        /// <summary>
        /// Shows a detail window for computer data
        /// </summary>
        public static async Task<Window> ShowComputerDetailAsync(this object source, ComputerDetailData computerData)
        {
            return await DetailWindowService.ShowDetailWindowAsync(computerData);
        }

        #endregion

        #region Group Details

        /// <summary>
        /// Shows a detail window for a group
        /// </summary>
        public static async Task<Window> ShowGroupDetailAsync(this object source, string groupId, string groupName = null, string description = null)
        {
            var groupData = new GroupDetailData
            {
                Id = groupId,
                GroupName = groupName ?? "Unknown Group",
                Description = description,
                Title = "Group Details",
                LastUpdated = DateTime.Now
            };

            return await DetailWindowService.ShowDetailWindowAsync(groupData);
        }

        /// <summary>
        /// Shows a detail window for group data
        /// </summary>
        public static async Task<Window> ShowGroupDetailAsync(this object source, GroupDetailData groupData)
        {
            return await DetailWindowService.ShowDetailWindowAsync(groupData);
        }

        #endregion

        #region Generic Details

        /// <summary>
        /// Shows a generic detail window for any data
        /// </summary>
        public static async Task<Window> ShowDetailWindowAsync<T>(this object source, T data, DetailWindowConfiguration config = null) where T : DetailWindowDataBase
        {
            return await DetailWindowService.ShowDetailWindowAsync(data, config);
        }

        /// <summary>
        /// Shows a custom detail window with any content
        /// </summary>
        public static async Task<Window> ShowCustomDetailWindowAsync(this object source, string title, object content, DetailWindowConfiguration config = null)
        {
            return await DetailWindowService.ShowCustomDetailWindowAsync(title, content, config);
        }

        #endregion

        #region Window Management

        /// <summary>
        /// Closes all detail windows of a specific type
        /// </summary>
        public static int CloseDetailWindowsByType(this object source, string windowType)
        {
            return DetailWindowService.CloseDetailWindowsByType(windowType);
        }

        /// <summary>
        /// Closes all detail windows
        /// </summary>
        public static void CloseAllDetailWindows(this object source)
        {
            DetailWindowService.CloseAllDetailWindows();
        }

        /// <summary>
        /// Arranges detail windows in a cascade layout
        /// </summary>
        public static void ArrangeDetailWindowsCascade(this object source)
        {
            DetailWindowService.ArrangeWindowsCascade();
        }

        /// <summary>
        /// Arranges detail windows in a tile layout
        /// </summary>
        public static void ArrangeDetailWindowsTile(this object source)
        {
            DetailWindowService.ArrangeWindowsTile();
        }

        #endregion

        #region Quick Access Methods

        /// <summary>
        /// Shows user detail from a data grid row (assumes User object or similar)
        /// </summary>
        public static async Task ShowDetailFromRow(this object source, object rowData)
        {
            try
            {
                if (rowData == null) return;

                // Use reflection to extract common properties
                var type = rowData.GetType();
                var idProperty = type.GetProperty("Id") ?? type.GetProperty("UserId") ?? type.GetProperty("UserID");
                var nameProperty = type.GetProperty("DisplayName") ?? type.GetProperty("Name") ?? type.GetProperty("UserName");
                var emailProperty = type.GetProperty("Email") ?? type.GetProperty("EmailAddress");

                if (idProperty != null)
                {
                    var id = idProperty.GetValue(rowData)?.ToString();
                    var name = nameProperty?.GetValue(rowData)?.ToString();
                    var email = emailProperty?.GetValue(rowData)?.ToString();

                    // Try to determine the type and show appropriate detail window
                    if (type.Name.ToLower().Contains("user"))
                    {
                        await source.ShowUserDetailAsync(id, name, email);
                    }
                    else if (type.Name.ToLower().Contains("computer"))
                    {
                        await source.ShowComputerDetailAsync(id, name);
                    }
                    else if (type.Name.ToLower().Contains("group"))
                    {
                        await source.ShowGroupDetailAsync(id, name);
                    }
                    else
                    {
                        // Show generic detail window
                        await source.ShowCustomDetailWindowAsync($"Details - {name ?? id}", rowData);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error showing detail window: {ex.Message}", "Error", 
                               MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        #endregion
    }
}
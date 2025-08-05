using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using MandADiscoverySuite.Models;

namespace MandADiscoverySuite.Services
{
    public class ClipboardService
    {
        private static ClipboardService _instance;
        public static ClipboardService Instance => _instance ??= new ClipboardService();

        public bool CopyToClipboard(string text)
        {
            try
            {
                if (string.IsNullOrEmpty(text))
                {
                    return false;
                }

                Clipboard.SetText(text);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public bool CopyUserDataToClipboard(UserData user)
        {
            if (user == null) return false;

            var sb = new StringBuilder();
            sb.AppendLine($"Display Name: {user.DisplayName}");
            sb.AppendLine($"Email: {user.Email}");
            sb.AppendLine($"UPN: {user.UserPrincipalName}");
            sb.AppendLine($"Department: {user.Department}");
            sb.AppendLine($"Job Title: {user.JobTitle}");
            sb.AppendLine($"Status: {user.Status}");
            sb.AppendLine($"Manager: {user.ManagerDisplayName}");
            sb.AppendLine($"City: {user.City}");
            sb.AppendLine($"Last Sign-In: {user.LastSignInDateTime}");
            sb.AppendLine($"Groups: {user.GroupMembershipCount}");

            return CopyToClipboard(sb.ToString());
        }

        public bool CopyUsersToClipboard(IEnumerable<UserData> users)
        {
            if (users == null || !users.Any()) return false;

            var sb = new StringBuilder();
            sb.AppendLine("Display Name\tEmail\tUPN\tDepartment\tJob Title\tStatus\tManager\tCity\tLast Sign-In\tGroups");
            
            foreach (var user in users)
            {
                sb.AppendLine($"{user.DisplayName}\t{user.Email}\t{user.UserPrincipalName}\t{user.Department}\t{user.JobTitle}\t{user.Status}\t{user.ManagerDisplayName}\t{user.City}\t{user.LastSignInDateTime}\t{user.GroupMembershipCount}");
            }

            return CopyToClipboard(sb.ToString());
        }

        public bool CopyInfrastructureDataToClipboard(InfrastructureData infrastructure)
        {
            if (infrastructure == null) return false;

            var sb = new StringBuilder();
            sb.AppendLine($"Name: {infrastructure.Name}");
            sb.AppendLine($"Type: {infrastructure.Type}");
            sb.AppendLine($"Status: {infrastructure.Status}");
            sb.AppendLine($"Location: {infrastructure.Location}");
            sb.AppendLine($"IP Address: {infrastructure.IPAddress}");
            sb.AppendLine($"Operating System: {infrastructure.OperatingSystem}");
            sb.AppendLine($"Version: {infrastructure.Version}");
            sb.AppendLine($"Last Seen: {infrastructure.LastSeen}");
            sb.AppendLine($"Description: {infrastructure.Description}");
            sb.AppendLine($"Manufacturer: {infrastructure.Manufacturer}");
            sb.AppendLine($"Model: {infrastructure.Model}");

            return CopyToClipboard(sb.ToString());
        }

        public bool CopyInfrastructureToClipboard(IEnumerable<InfrastructureData> infrastructure)
        {
            if (infrastructure == null || !infrastructure.Any()) return false;

            var sb = new StringBuilder();
            sb.AppendLine("Name\tType\tStatus\tLocation\tIP Address\tOperating System\tVersion\tLast Seen\tDescription\tManufacturer\tModel");
            
            foreach (var item in infrastructure)
            {
                sb.AppendLine($"{item.Name}\t{item.Type}\t{item.Status}\t{item.Location}\t{item.IPAddress}\t{item.OperatingSystem}\t{item.Version}\t{item.LastSeen}\t{item.Description}\t{item.Manufacturer}\t{item.Model}");
            }

            return CopyToClipboard(sb.ToString());
        }

        public bool CopyGroupDataToClipboard(GroupData group)
        {
            if (group == null) return false;

            var sb = new StringBuilder();
            sb.AppendLine($"Display Name: {group.DisplayName}");
            sb.AppendLine($"Description: {group.Description}");
            sb.AppendLine($"Type: {group.Type}");
            sb.AppendLine($"Mail: {group.Mail}");
            sb.AppendLine($"Visibility: {group.Visibility}");
            sb.AppendLine($"Member Count: {group.MemberCount}");
            sb.AppendLine($"Owner Count: {group.OwnerCount}");
            sb.AppendLine($"Created: {group.CreatedDateTime}");

            return CopyToClipboard(sb.ToString());
        }

        public bool CopyGroupsToClipboard(IEnumerable<GroupData> groups)
        {
            if (groups == null || !groups.Any()) return false;

            var sb = new StringBuilder();
            sb.AppendLine("Display Name\tDescription\tType\tMail\tVisibility\tMember Count\tOwner Count\tCreated");
            
            foreach (var group in groups)
            {
                sb.AppendLine($"{group.DisplayName}\t{group.Description}\t{group.Type}\t{group.Mail}\t{group.Visibility}\t{group.MemberCount}\t{group.OwnerCount}\t{group.CreatedDateTime}");
            }

            return CopyToClipboard(sb.ToString());
        }

        public bool CopySelectedItemsToClipboard<T>(IEnumerable<T> items)
        {
            if (items == null || !items.Any()) return false;

            return items.First() switch
            {
                UserData => CopyUsersToClipboard(items.Cast<UserData>()),
                InfrastructureData => CopyInfrastructureToClipboard(items.Cast<InfrastructureData>()),
                GroupData => CopyGroupsToClipboard(items.Cast<GroupData>()),
                _ => CopyToClipboard(string.Join(Environment.NewLine, items.Select(i => i.ToString())))
            };
        }
    }
}
# Logic Engine Service

The **LogicEngineService** provides an in-memory data fabric built from the discovery CSVs located under `C:\discoverydata\<Profile>\RawData`.  It parses each file into strongly typed DTOs, builds lookup indices, and applies inference rules to produce rich projections for the GUI.

## DTO Schemas

| DTO | Fields |
| --- | ------ |
| **UserDto** | `UPN`, `Sam`, `Sid`, `Mail`, `DisplayName`, `Enabled`, `OU`, `ManagerSid`, `Dept`, `AzureObjectId`, `Groups`, `DiscoveryTimestamp`, `DiscoveryModule`, `SessionId` |
| **GroupDto** | `Sid`, `Name`, `Type`, `Members`, `DiscoveryTimestamp`, `DiscoveryModule`, `SessionId`, `NestedGroups` |
| **DeviceDto** | `Name`, `DNS`, `OU`, `OS`, `PrimaryUserSid`, `InstalledApps`, `DiscoveryTimestamp`, `DiscoveryModule`, `SessionId` |
| **AppDto** | `Id`, `Name`, `Source`, `InstallCounts`, `Executables`, `Publishers`, `DiscoveryTimestamp`, `DiscoveryModule`, `SessionId` |
| **GpoDto** | `Guid`, `Name`, `Links`, `SecurityFilter`, `WmiFilter`, `Enabled`, `DiscoveryTimestamp`, `DiscoveryModule`, `SessionId` |
| **AclEntry** | `Path`, `IdentitySid`, `Rights`, `Inherited`, `IsShare`, `IsNTFS`, `DiscoveryTimestamp`, `DiscoveryModule`, `SessionId` |
| **MailboxDto** | `UPN`, `DisplayName`, `PrimarySmtpAddress`, `TotalSize`, `ProhibitSendQuota`, `MailboxType`, `DiscoveryTimestamp`, `DiscoveryModule`, `SessionId` |
| **AzureRoleAssignment** | `RoleName`, `PrincipalId`, `Scope`, `DiscoveryTimestamp`, `DiscoveryModule`, `SessionId` |
| **SqlDbDto** | `Server`, `Database`, `OwnerSid`, `SizeMb`, `DiscoveryTimestamp`, `DiscoveryModule`, `SessionId` |

*Dates* are parsed with `DateTime.TryParse` and fall back to `DateTime.UtcNow` when invalid.  *Booleans* are parsed with `bool.TryParse` and default to `false`.  Missing columns are ignored and set to `null` or empty collections.

## Indices

The service builds numerous dictionaries for quick lookup:

- `UsersBySid`, `UsersByUpn`
- `GroupsBySid`, `MembersByGroupSid`, `GroupsByUserSid`
- `DevicesByName`, `DevicesByPrimaryUserSid`
- `AppsById`, `AppsByDevice`
- `AclByIdentitySid`
- `GposByGuid`, `GposBySidFilter`, `GposByOu`
- `MailboxByUpn`
- `RolesByPrincipalId`
- `SqlDbsByKey`

## Inference Rules

1. **ACL → Group → User** – propagates ACL entries from group SIDs to all member users.
2. **Mapped Drives** – associates mapped drives with owning users.
3. **GPO Security Filtering** – filters GPO links by security and WMI filters.
4. **Primary Device → User** – relates devices to their primary owners.
5. **Application Usage Hints** – infers applications used by users via installed apps on devices.
6. **Azure Role Assignments** – maps Azure AD roles to users.
7. **SQL Ownership** – links SQL databases to owning users.

## Projections

### UserDetailProjection
- `User` (`UserDto`)
- `Groups` (`List<GroupDto>`)
- `Devices` (`List<DeviceDto>`)
- `Apps` (`List<AppDto>`)
- `Drives` (`List<MappedDriveDto>`)
- `Shares` (`List<AclEntry>`)
- `GpoLinks` (`List<GpoDto>`)
- `GpoFilters` (`List<GpoDto>`)
- `Mailbox` (`MailboxDto?`)
- `AzureRoles` (`List<AzureRoleAssignment>`)
- `SqlDatabases` (`List<SqlDbDto>`)
- `Risks` (`List<LogicEngineRisk>`)
- `MigrationHints` (`List<MigrationHint>`)

### AssetDetailProjection
- `Device` (`DeviceDto`)
- `PrimaryUser` (`UserDto?`)
- `InstalledApps` (`List<AppDto>`)
- `SharesUsed` (`List<AclEntry>`)
- `GposApplied` (`List<GpoDto>`)
- `Backups` (`List<string>`)
- `VulnFindings` (`List<string>`)
- `Risks` (`List<LogicEngineRisk>`)

## Exposed Methods

- `Task<bool> LoadAllAsync()` – loads all CSVs and rebuilds indices.
- `Task<UserDetailProjection?> GetUserDetailAsync(string sidOrUpn)`
- `Task<AssetDetailProjection?> GetAssetDetailAsync(string deviceName)`
- `Task<List<MigrationHint>> SuggestEntitlementsForUserAsync(string sid)`

The service caches file timestamps and reloads data only when CSV files change.

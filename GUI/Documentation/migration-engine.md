# Migration Engine

The migration engine orchestrates transferring users, mailboxes, files and SQL databases between environments. Each object type is handled by a dedicated migrator that reports progress and returns a detailed result structure.

## Components

| Component | Responsibility | Dependencies |
|-----------|---------------|--------------|
| `GraphIdentityMigrator` | Creates users through Microsoft Graph. | Microsoft.Graph SDK, `IGraphUserClient` implementation |
| `ExchangeMailMigrator` | Initiates mailbox moves via Exchange Online PowerShell. | Exchange Online management modules, `IExchangeMailClient` |
| `FileServerMigrator` | Copies files while preserving ACLs and timestamps. | File system access or ShareGate API, `IFileTransferClient` |
| `SqlMigrator` | Restores SQL databases to the target server. | `Microsoft.Data.SqlClient`, `ISqlTransferClient` |
| `MigrationService` | Coordinates all migrators to process a migration wave. | Above migrators |

## Result and Progress Reporting

All migrators return a `MigrationResult` containing success status, warnings and errors. Runtime progress is surfaced via `IProgress<MigrationProgress>` allowing the GUI to display status updates.

## Troubleshooting

- **Authentication failures** – verify service principals and PowerShell sessions have the necessary permissions.
- **License errors** – ensure target tenants possess required licenses before initiating migrations.
- **File copy failures** – locked files or path length limits can halt migrations; retry or shorten paths.
- **SQL restore issues** – confirm backups are compatible and the target database is offline.

## Retrying

Migrators are designed to be idempotent. A failed item can be migrated again after the underlying issue is resolved.

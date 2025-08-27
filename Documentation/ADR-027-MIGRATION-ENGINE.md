# ADR-027: Migration Engine Architecture

## Status
**Accepted** - 2025-08-26

## Context
A unified engine was required to migrate users, mailboxes, files and SQL databases across tenants. The solution needed progress reporting and retry capabilities while abstracting underlying APIs.

## Decision
Introduce dedicated migrator interfaces (`IIdentityMigrator`, `IMailMigrator`, `IFileMigrator`, `ISqlMigrator`) with consistent method signatures returning `MigrationResult`. A central `MigrationService` coordinates these migrators. Provider clients encapsulate calls to Microsoft Graph, Exchange Online PowerShell, file transfer utilities and SQL restore operations.

## Consequences
- Enables modular replacement of migration technologies.
- Provides uniform progress and error reporting across object types.
- Allows retry of individual items without affecting others.

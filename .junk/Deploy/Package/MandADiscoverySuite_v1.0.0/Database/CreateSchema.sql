-- M&A Discovery Suite Database Schema
-- Version 1.0.0

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MandADiscovery')
BEGIN
    CREATE DATABASE MandADiscovery;
END
GO

USE MandADiscovery;
GO

-- Migration Tracking Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Migrations')
BEGIN
    CREATE TABLE Migrations (
        MigrationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        MigrationType NVARCHAR(50) NOT NULL,
        SourceDomain NVARCHAR(255),
        TargetDomain NVARCHAR(255),
        Status NVARCHAR(50) NOT NULL,
        StartedAt DATETIME2 NOT NULL,
        CompletedAt DATETIME2,
        TotalItems INT,
        ProcessedItems INT,
        SuccessfulItems INT,
        FailedItems INT,
        ErrorMessage NVARCHAR(MAX),
        CreatedBy NVARCHAR(100),
        CreatedAt DATETIME2 DEFAULT GETUTCDATE()
    );
END
GO

-- Migration Progress Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MigrationProgress')
BEGIN
    CREATE TABLE MigrationProgress (
        ProgressId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        MigrationId UNIQUEIDENTIFIER NOT NULL,
        Phase NVARCHAR(100),
        PercentComplete INT,
        Message NVARCHAR(MAX),
        CurrentItem NVARCHAR(500),
        Timestamp DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (MigrationId) REFERENCES Migrations(MigrationId)
    );
END
GO

-- Create indexes
CREATE INDEX IX_Migrations_Status ON Migrations(Status);
CREATE INDEX IX_Migrations_StartedAt ON Migrations(StartedAt DESC);
CREATE INDEX IX_MigrationProgress_MigrationId ON MigrationProgress(MigrationId);
GO

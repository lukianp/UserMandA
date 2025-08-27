# Target Profile Setup Guide

This guide explains how to configure target tenant profiles used by the migration engine.

## Create an app registration
1. Sign in to the target Azure AD tenant.
2. Register a new application and record the **Client ID** and **Tenant ID**.
3. Generate a client secret and note its value.
4. Grant API permissions for migration operations such as Microsoft Graph and SharePoint.  Consent to the required scopes.

## Create a target profile
1. Open the **Settings** page in the M&A Discovery Suite GUI and choose **Target Profiles**.
2. Click **New Profile**, provide a friendly name, and enter the client ID, tenant ID, and client secret.
3. The secret is encrypted using DPAPI and written to `C:\discoverydata\ljpops\Configuration`.
4. Save the profile.  Multiple profiles can be created for different target companies.

## Selecting a profile for migration
1. In the migration view, use the **Target Profile** dropdown to choose the destination tenant.
2. The application resolves service providers (`IMailMover`, `IFileMover`, etc.) based on the selected profile.
3. Use the **Test Connection** button to verify connectivity with the target tenant.  Errors are surfaced without exposing credentials.

## Editing or removing profiles
- Return to **Settings → Target Profiles** to update or delete saved profiles.
- Profile secrets remain encrypted and are never written to logs.


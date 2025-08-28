# Target Profiles

Configure one or more target tenants for migration. Secrets are encrypted and stored under the active company profile.

## App registration
1. In the target Microsoft Entra ID (Azure AD) tenant, create an app registration.
2. Capture the Tenant ID and Client ID.
3. Create a Client Secret and copy it once. Assign Graph/Exchange/SharePoint scopes as required (e.g. `User.Read.All`, `Group.Read.All`).

## Create a profile
1. Open the GUI and press `F10` (or use a Settings button) to open Target Profiles.
2. Enter Name, Tenant ID, Client ID, Client Secret, and Scopes (comma‑separated).
3. On save, the secret is encrypted with Windows DPAPI (CurrentUser) and persisted at:
   - `C:\discoverydata\<CompanyProfile>\Configuration\target-profiles.json`

## Select in migration UI
1. In Exchange Migration Planning, choose a target from the Target Profile dropdown.
2. The platform builds a `TargetContext` and resolves migrators via the factory for identity, mail, files, and SQL.

## Security and logging
- Secrets are never logged. Only encrypted values are stored on disk.
- Decryption occurs in‑process via DPAPI for the current Windows user account.


# Claude Code Local Instructions

## App Launch Command

**IMPORTANT**: Always use this command to launch the Electron app:

```bash
powershell.exe -Command "cd C:\enterprisediscovery\guiv2; npm start 2>&1 | Select-Object -First 50"
```

With a **30s timeout**. Do NOT use `Start-Process` - it launches in background and you can't see if it started.

## Deployment Workflow

1. Stop Electron: `powershell.exe -Command "Get-Process -Name electron -ErrorAction SilentlyContinue | Stop-Process -Force"`
2. Copy files to deployment: `C:\enterprisediscovery\`
3. Clean webpack: `if (Test-Path .webpack) { Remove-Item -Recurse -Force .webpack }`
4. Build main: `npm run build:main`
5. Build preload: `npx webpack --config webpack.preload.config.js --mode=production`
6. Build renderer: `npm run build:renderer`
7. Launch with the command above

## Key Directories

- Source: `D:\Scripts\UserMandA`
- Deployment: `C:\enterprisediscovery`
- Profile data: `C:\DiscoveryData\<profileName>`

## Common Issues

- If app doesn't start, check for TypeScript errors first
- Always run full build (main + preload + renderer) after copying files
- The status checking loops need to be fast - don't add delays

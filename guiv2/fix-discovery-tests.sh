#!/bin/bash
# Script to apply common test fixes across discovery view tests

FILES=(
  "ConditionalAccessPoliciesDiscoveryView.test.tsx"
  "DataLossPreventionDiscoveryView.test.tsx"
  "DomainDiscoveryView.test.tsx"
  "EnvironmentDetectionView.test.tsx"
  "ExchangeDiscoveryView.test.tsx"
  "FileSystemDiscoveryView.test.tsx"
  "GoogleWorkspaceDiscoveryView.test.tsx"
  "HyperVDiscoveryView.test.tsx"
  "IdentityGovernanceDiscoveryView.test.tsx"
  "InfrastructureDiscoveryHubView.test.tsx"
  "LicensingDiscoveryView.test.tsx"
  "NetworkDiscoveryView.test.tsx"
  "Office365DiscoveryView.test.tsx"
  "OneDriveDiscoveryView.test.tsx"
  "PowerPlatformDiscoveryView.test.tsx"
  "SQLServerDiscoveryView.test.tsx"
  "SecurityInfrastructureDiscoveryView.test.tsx"
  "SharePointDiscoveryView.test.tsx"
  "TeamsDiscoveryView.test.tsx"
  "VMwareDiscoveryView.test.tsx"
  "WebServerConfigurationDiscoveryView.test.tsx"
)

cd /d/Scripts/UserMandA/guiv2/src/renderer/views/discovery

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # This will be implemented with specific sed/perl commands
  fi
done

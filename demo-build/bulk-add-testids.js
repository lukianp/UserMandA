#!/usr/bin/env node
/**
 * Bulk Add data-testid Attributes to Component Files
 * Adds missing data-testid attributes to buttons, inputs, and key UI elements
 */

const fs = require('fs');
const path = require('path');

const files = [
  // Already done: EnvironmentDetectionView.tsx
  // Batch 1 remaining
  'src/renderer/views/discovery/HyperVDiscoveryView.tsx',
  'src/renderer/views/discovery/IdentityGovernanceDiscoveryView.tsx',
  'src/renderer/views/discovery/GoogleWorkspaceDiscoveryView.tsx',
  'src/renderer/views/discovery/SecurityInfrastructureDiscoveryView.tsx',
  'src/renderer/views/discovery/DataLossPreventionDiscoveryView.tsx',
  'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.tsx',
  'src/renderer/views/discovery/InfrastructureDiscoveryHubView.tsx',
  'src/renderer/views/discovery/LicensingDiscoveryView.tsx',
  'src/renderer/views/discovery/DomainDiscoveryView.tsx',
  'src/renderer/views/discovery/PowerPlatformDiscoveryView.tsx',
  // Analytics
  'src/renderer/views/analytics/UserAnalyticsView.tsx',
  'src/renderer/views/analytics/ExecutiveDashboardView.tsx',
  'src/renderer/views/analytics/MigrationReportView.tsx',
  'src/renderer/views/analytics/CostAnalysisView.tsx',
  'src/renderer/views/analytics/TrendAnalysisView.tsx',
  'src/renderer/views/analytics/ReportTemplatesView.tsx',
  // Advanced
  'src/renderer/views/advanced/AssetLifecycleView.tsx',
  'src/renderer/views/advanced/BenchmarkingView.tsx',
  'src/renderer/views/advanced/BulkOperationsView.tsx',
  'src/renderer/views/advanced/ScriptLibraryView.tsx',
  'src/renderer/views/advanced/NotificationRulesView.tsx',
  'src/renderer/views/advanced/APIManagementView.tsx',
  'src/renderer/views/advanced/EndpointProtectionView.tsx',
  'src/renderer/views/advanced/WebhooksView.tsx',
  'src/renderer/views/advanced/WorkflowAutomationView.tsx',
];

// Patterns to add data-testid attributes
const patterns = [
  // Loading overlays
  {
    search: /<LoadingOverlay\s+([^>]*?)(\/>|>)/g,
    check: /data-testid=/,
    add: (match, attrs) => {
      if (attrs.includes('data-testid=')) return match;
      return match.replace(/(\/>|>)/, ' data-testid="loading-overlay"$1');
    }
  },
  // Start discovery buttons
  {
    search: /<Button\s+([^>]*?)onClick={(?:handleStartDiscovery|startDiscovery)}([^>]*?)>/g,
    check: /data-testid=/,
    add: (match) => {
      if (match.includes('data-testid=')) return match;
      return match.replace(/>$/, ' data-testid="start-discovery-btn">');
    }
  },
  // Cancel buttons
  {
    search: /<Button\s+([^>]*?)onClick={(?:handleCancel|cancelDiscovery|cancel)}([^>]*?)>/g,
    check: /data-testid=/,
    add: (match) => {
      if (match.includes('data-testid=')) return match;
      if (match.includes('Cancel')) {
        return match.replace(/>$/, ' data-testid="cancel-discovery-btn">');
      }
      return match;
    }
  },
  // Export CSV buttons
  {
    search: /<Button\s+([^>]*?)onClick={(?:exportToCSV|handleExportCSV)}([^>]*?)>/g,
    check: /data-testid=/,
    add: (match) => {
      if (match.includes('data-testid=')) return match;
      return match.replace(/>$/, ' data-testid="export-csv-btn">');
    }
  },
  // Export Excel buttons
  {
    search: /<Button\s+([^>]*?)onClick={(?:exportToExcel|handleExportExcel)}([^>]*?)>/g,
    check: /data-testid=/,
    add: (match) => {
      if (match.includes('data-testid=')) return match;
      return match.replace(/>$/, ' data-testid="export-excel-btn">');
    }
  },
  // Export results buttons (generic)
  {
    search: /<Button\s+([^>]*?)onClick={(?:handleExport|exportResults)}([^>]*?)>[\s\S]*?Export[\s\S]*?</g,
    check: /data-testid=/,
    add: (match) => {
      if (match.includes('data-testid=')) return match;
      return match.replace(/>/, ' data-testid="export-results-btn">');
    }
  },
  // Search inputs
  {
    search: /<Input\s+([^>]*?)(?:placeholder=["'][^"']*[Ss]earch[^"']*["']|value={searchText})([^>]*?)(\/>|>)/g,
    check: /data-testid=/,
    add: (match, _attrs, _rest) => {
      if (match.includes('data-testid=')) return match;
      return match.replace(/(\/>|>)/, ' data-testid="search-input"$1');
    }
  },
  // Refresh buttons
  {
    search: /<Button\s+([^>]*?)onClick={(?:handleRefresh|refresh)}([^>]*?)>/g,
    check: /data-testid=/,
    add: (match) => {
      if (match.includes('data-testid=')) return match;
      return match.replace(/>$/, ' data-testid="refresh-data-btn">');
    }
  },
  // Config toggle buttons
  {
    search: /<button\s+([^>]*?)onClick={\(\) => setShowConfig\(!showConfig\)}([^>]*?)>/g,
    check: /data-testid=/,
    add: (match) => {
      if (match.includes('data-testid=')) return match;
      return match.replace(/>$/, ' data-testid="toggle-config-btn">');
    }
  },
];

let totalChanges = 0;
let filesChanged = 0;

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let originalContent = content;
  let fileChanges = 0;

  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern.search);

    for (const match of Array.from(matches)) {
      if (!pattern.check.test(match[0])) {
        const newMatch = pattern.add(match[0], match[1], match[2]);
        if (newMatch !== match[0]) {
          content = content.replace(match[0], newMatch);
          fileChanges++;
        }
      }
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}: Added ${fileChanges} data-testid attributes`);
    totalChanges += fileChanges;
    filesChanged++;
  } else {
    console.log(`✓  ${filePath}: No changes needed`);
  }
});

console.log(`\n📊 Summary: ${totalChanges} attributes added across ${filesChanged} files`);

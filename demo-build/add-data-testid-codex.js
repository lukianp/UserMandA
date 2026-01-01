/**
 * Adds missing data-testid attributes to key discovery/analytics components.
 * Patterns are intentionally conservative; each replacement only occurs when
 * the relevant JSX snippet is present to avoid over-eager rewrites.
 */
const fs = require('fs');
const path = require('path');

const repoRoot = __dirname;

/**
 * Helper to apply a list of regex replacements to a file.
 */
function applyReplacements(file, replacements) {
  const filePath = path.join(repoRoot, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`Target file missing: ${file}`);
    return { updated: false, replacements: 0 };
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  let replacementCount = 0;

  for (const { search, replace, note } of replacements) {
    search.lastIndex = 0;
    if (!search.test(content)) {
      console.warn(`Pattern not found in ${file}${note ? ` (${note})` : ''}`);
      continue;
    }

    const next = content.replace(search, replace);
    if (next !== content) {
      content = next;
      updated = true;
      replacementCount += 1;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return { updated, replacements: replacementCount };
}

const componentMappings = [
  {
    file: 'src/renderer/views/discovery/EnvironmentDetectionView.tsx',
    replacements: [
      {
        search: /(<LoadingOverlay[^>]*)(\/>)/,
        replace: '$1 data-testid="loading-overlay"$2',
        note: 'loading overlay',
      },
      {
        search: /(<Button[^>]*onClick={handleStartDetection}[^>]*)(>)/,
        replace: '$1 data-testid="start-discovery-btn"$2',
        note: 'start button',
      },
    ],
  },
  {
    file: 'src/renderer/views/discovery/ConditionalAccessPoliciesDiscoveryView.tsx',
    replacements: [
      {
        search: /(<Button[^>]*onClick={handleStartDiscovery}[^>]*)(>)/,
        replace: '$1 data-testid="start-discovery-btn"$2',
      },
      {
        search: /(<IconButton[^>]*onClick={handleCancelDiscovery}[^>]*)(>)/,
        replace: '$1 data-testid="cancel-discovery-btn"$2',
      },
      {
        search: /(<Button[^>]*onClick={handleExportResults}[^>]*)(>)/,
        replace: '$1 data-testid="export-results-btn"$2',
      },
    ],
  },
  {
    file: 'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.tsx',
    replacements: [
      {
        search: /(<LoadingOverlay[^>]*open={isDiscovering}[^>]*)(\/>)/,
        replace: '$1 data-testid="loading-overlay"$2',
      },
      {
        search: /(<Button[^>]*onClick={handleStartDiscovery}[^>]*)(>)/,
        replace: '$1 data-testid="start-discovery-btn"$2',
      },
      {
        search: /(<IconButton[^>]*onClick={handleCancelDiscovery}[^>]*)(>)/,
        replace: '$1 data-testid="cancel-discovery-btn"$2',
      },
    ],
  },
];

let filesTouched = 0;
let totalReplacements = 0;

for (const mapping of componentMappings) {
  const { updated, replacements } = applyReplacements(mapping.file, mapping.replacements);
  if (updated) {
    filesTouched += 1;
    totalReplacements += replacements;
  }
}

console.log(`Updated ${filesTouched} files with ${totalReplacements} replacements.`);

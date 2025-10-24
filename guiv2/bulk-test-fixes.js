#!/usr/bin/env node
/**
 * Bulk Test Fixes Script
 * Systematically applies common test fixes across all discovery views
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const DISCOVERY_VIEWS_PATH = 'src/renderer/views/discovery';
const fixesApplied = {
  exportButtonDataCy: 0,
  refreshButtonDataCy: 0,
  configButtonDataCy: 0,
  saveTemplateButtonDataCy: 0,
  clearLogsButtonDataCy: 0
};

/**
 * Fix 1: Ensure export buttons have consistent data-cy attributes
 */
function fixExportButtonDataCy(content, filePath) {
  // Pattern 1: export button without data-cy or with wrong name
  const patterns = [
    // onClick={exportResults} without data-cy
    {
      search: /(onClick=\{exportResults\}(?:(?!data-cy).)*?>)/g,
      check: /data-cy="/,
      insert: ' data-cy="export-btn"'
    },
    // onClick={exportData} without data-cy
    {
      search: /(onClick=\{exportData\}(?:(?!data-cy).)*?>)/g,
      check: /data-cy="/,
      insert: ' data-cy="export-btn"'
    },
    // Export button with icon Download
    {
      search: /(<Button[^>]*icon=\{<Download[^}]*\}[^>]*onClick=\{export[^}]*\}(?:(?!data-cy)[^>])*)(>)/g,
      check: /data-cy="/,
      insert: ' data-cy="export-btn"'
    }
  ];

  let modified = false;
  let newContent = content;

  patterns.forEach(pattern => {
    const matches = content.match(pattern.search);
    if (matches) {
      matches.forEach(match => {
        if (!pattern.check.test(match)) {
          const fixed = match.replace(pattern.search, `$1${pattern.insert}$2`);
          if (fixed !== match) {
            newContent = newContent.replace(match, fixed);
            modified = true;
          }
        }
      });
    }
  });

  if (modified) {
    fixesApplied.exportButtonDataCy++;
    console.log(`✓ Fixed export button data-cy in ${path.basename(filePath)}`);
  }

  return newContent;
}

/**
 * Fix 2: Ensure refresh buttons have data-cy
 */
function fixRefreshButtonDataCy(content, filePath) {
  const patterns = [
    {
      search: /(<Button[^>]*icon=\{<RefreshCw[^}]*\}(?:(?!data-cy)[^>])*)(>)/g,
      insert: ' data-cy="refresh-btn"'
    },
    {
      search: /(onClick=\{refresh[^}]*\}(?:(?!data-cy).)*?)(>)/g,
      insert: ' data-cy="refresh-btn"'
    }
  ];

  let modified = false;
  let newContent = content;

  patterns.forEach(pattern => {
    newContent = newContent.replace(pattern.search, (match, g1, g2) => {
      if (!/data-cy="/.test(match)) {
        modified = true;
        return g1 + pattern.insert + g2;
      }
      return match;
    });
  });

  if (modified) {
    fixesApplied.refreshButtonDataCy++;
    console.log(`✓ Fixed refresh button data-cy in ${path.basename(filePath)}`);
  }

  return newContent;
}

/**
 * Fix 3: Ensure config buttons have data-cy
 */
function fixConfigButtonDataCy(content, filePath) {
  const search = /(<Button[^>]*icon=\{<Settings[^}]*\}(?:(?!data-cy)[^>])*)(>)/g;

  if (search.test(content) && !/data-cy="config-btn"/.test(content)) {
    const newContent = content.replace(search, '$1 data-cy="config-btn"$2');
    if (newContent !== content) {
      fixesApplied.configButtonDataCy++;
      console.log(`✓ Fixed config button data-cy in ${path.basename(filePath)}`);
      return newContent;
    }
  }

  return content;
}

/**
 * Fix 4: Ensure clear logs buttons have data-cy
 */
function fixClearLogsButtonDataCy(content, filePath) {
  const patterns = [
    {
      search: /(onClick=\{clearLogs\}(?:(?!data-cy).)*?)(>)/g,
      insert: ' data-cy="clear-logs-btn"'
    },
    {
      search: /(<Button[^>]*>Clear Logs<\/Button>)/g,
      insert: ' data-cy="clear-logs-btn"'
    }
  ];

  let modified = false;
  let newContent = content;

  patterns.forEach(pattern => {
    if (pattern.search.test(content)) {
      const replaced = content.replace(pattern.search, (match, g1, g2) => {
        if (!/data-cy="/.test(match)) {
          modified = true;
          return g1 + pattern.insert + (g2 || '');
        }
        return match;
      });
      if (replaced !== newContent) {
        newContent = replaced;
      }
    }
  });

  if (modified) {
    fixesApplied.clearLogsButtonDataCy++;
    console.log(`✓ Fixed clear logs button data-cy in ${path.basename(filePath)}`);
  }

  return newContent;
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Starting bulk test fixes...\n');

  const viewFiles = glob.sync(`${DISCOVERY_VIEWS_PATH}/*DiscoveryView.tsx`);
  console.log(`Found ${viewFiles.length} discovery view files\n`);

  let totalFilesModified = 0;

  viewFiles.forEach(filePath => {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Apply all fixes
      content = fixExportButtonDataCy(content, filePath);
      content = fixRefreshButtonDataCy(content, filePath);
      content = fixConfigButtonDataCy(content, filePath);
      content = fixClearLogsButtonDataCy(content, filePath);

      // Write back if modified
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        totalFilesModified++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${filePath}:`, error.message);
    }
  });

  console.log('\n📊 Summary:');
  console.log(`  Files modified: ${totalFilesModified}`);
  console.log(`  Export buttons fixed: ${fixesApplied.exportButtonDataCy}`);
  console.log(`  Refresh buttons fixed: ${fixesApplied.refreshButtonDataCy}`);
  console.log(`  Config buttons fixed: ${fixesApplied.configButtonDataCy}`);
  console.log(`  Clear logs buttons fixed: ${fixesApplied.clearLogsButtonDataCy}`);
  console.log('\n✅ Bulk fixes complete!');
}

main();

#!/usr/bin/env node
/**
 * Automated Test Fixer - Systematically addresses common test failure patterns
 *
 * Fixes:
 * 1. Missing electron API methods (onDiscoveryComplete, onDiscoveryError, onDiscoveryOutput)
 * 2. ReferenceError issues (addLog before initialization)
 * 3. Missing testWrappers imports
 * 4. Basic null safety for stats/data objects
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const FIXES_APPLIED = {
  electronAPIs: 0,
  addLogOrder: 0,
  testWrapperImports: 0,
  nullSafety: 0,
};

// Enhanced electron API mock template
const ENHANCED_ELECTRON_API = `
  // Additional Discovery event handlers
  onDiscoveryComplete: jest.fn((callback) => jest.fn()),
  onDiscoveryError: jest.fn((callback) => jest.fn()),
  onDiscoveryOutput: jest.fn((callback) => jest.fn()),

  // Discovery execution APIs
  executeDiscovery: jest.fn().mockResolvedValue({ success: true, executionId: 'test-exec-id' }),
  cancelDiscovery: jest.fn().mockResolvedValue({ cancelled: true }),
`;

function fixFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const originalContent = content;

  // Fix 1: Add missing electron APIs to setupTests if needed
  if (filePath.endsWith('setupTests.ts')) {
    if (!content.includes('onDiscoveryComplete')) {
      const insertPoint = content.indexOf('// Profile management');
      if (insertPoint > 0) {
        content = content.slice(0, insertPoint) + ENHANCED_ELECTRON_API + '\n  ' + content.slice(insertPoint);
        FIXES_APPLIED.electronAPIs++;
        modified = true;
        console.log('  ✓ Added enhanced electron API methods');
      }
    }
  }

  // Fix 2: Fix addLog initialization order in hooks
  if (filePath.includes('/hooks/') && filePath.endsWith('.ts') && !filePath.includes('.test.')) {
    // Check if addLog is used in dependency array before it's defined
    const dependencyMatch = content.match(/}, \[.*addLog.*\]\);/);
    const definitionMatch = content.match(/const addLog = useCallback/);

    if (dependencyMatch && definitionMatch) {
      const depIndex = content.indexOf(dependencyMatch[0]);
      const defIndex = content.indexOf(definitionMatch[0]);

      if (depIndex < defIndex) {
        // Find the full addLog definition
        const addLogStart = content.indexOf('const addLog = useCallback', defIndex);
        const addLogEnd = content.indexOf('}, []);', addLogStart) + 7;
        const addLogCode = content.substring(addLogStart, addLogEnd);

        // Remove from old location
        content = content.substring(0, addLogStart) + content.substring(addLogEnd);

        // Find a good insertion point (after state declarations, before useEffect)
        const useEffectMatch = content.match(/\/\/ .*(event|Event|listener|Listener|handler|Handler)/);
        if (useEffectMatch) {
          const insertPoint = content.indexOf(useEffectMatch[0]);
          content = content.slice(0, insertPoint) +
                    '  // Utility function for logging\n  ' + addLogCode + '\n\n  ' +
                    content.slice(insertPoint);
          FIXES_APPLIED.addLogOrder++;
          modified = true;
          console.log('  ✓ Fixed addLog initialization order');
        }
      }
    }
  }

  // Fix 3: Add missing testWrappers imports
  if (filePath.includes('.test.') && (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))) {
    if (content.includes("'../../test-utils/testWrappers'") &&
        !fs.existsSync(path.join(path.dirname(filePath), '../../test-utils/testWrappers.tsx')) &&
        !fs.existsSync(path.join(path.dirname(filePath), '../../test-utils/testWrappers.ts'))) {

      // Check if testWrappers actually exists at the relative path
      const testUtilsPath = path.resolve(path.dirname(filePath), '../../test-utils');
      const actualWrapperPath = path.join(testUtilsPath, 'testWrappers.tsx');

      if (!fs.existsSync(actualWrapperPath)) {
        // Replace with correct import or remove if not needed
        if (content.includes('renderWithRouter')) {
          content = content.replace(
            /import \{ renderWithRouter \} from '..\/..\/test-utils\/testWrappers';/g,
            "// renderWithRouter removed - use @testing-library/react directly"
          );
          FIXES_APPLIED.testWrapperImports++;
          modified = true;
          console.log('  ✓ Fixed testWrappers import');
        }
      }
    }
  }

  // Fix 4: Basic null safety for common patterns
  if (filePath.includes('.tsx') && !filePath.includes('.test.')) {
    // Fix stats?.property?.toFixed() patterns
    const toFixedRegex = /stats\.([a-zA-Z_]+)\.toFixed\(/g;
    if (toFixedRegex.test(content)) {
      content = content.replace(
        /stats\.([a-zA-Z_]+)\.toFixed\(([0-9]+)\)/g,
        '(stats?.$1 ?? 0).toFixed($2)'
      );
      FIXES_APPLIED.nullSafety++;
      modified = true;
      console.log('  ✓ Added null safety for toFixed calls');
    }

    // Fix array.map on potentially undefined arrays
    const mapRegex = /([a-zA-Z_]+)\.map\(/g;
    const dataArrayMatch = content.match(/const \[(.*?)\] = useState.*\[\]/);
    if (mapRegex.test(content) && dataArrayMatch) {
      // This is complex - skip for now, needs manual review
    }
  }

  // Write back if modified
  if (modified && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  ✓ File updated successfully');
    return true;
  } else if (modified) {
    console.log('  ⚠ Modifications attempted but content unchanged');
  }

  return false;
}

function main() {
  console.log('=== Automated Test Fixer ===\n');
  console.log('Scanning for files to fix...\n');

  // Fix setupTests.ts first
  const setupTestsPath = path.join(__dirname, 'src/test-utils/setupTests.ts');
  if (fs.existsSync(setupTestsPath)) {
    fixFile(setupTestsPath);
  }

  // Fix hooks with addLog issues
  const hooksDir = path.join(__dirname, 'src/renderer/hooks');
  if (fs.existsSync(hooksDir)) {
    const hookFiles = fs.readdirSync(hooksDir)
      .filter(f => f.endsWith('.ts') && !f.includes('.test.'))
      .filter(f => f.includes('Discovery') || f.includes('Logic'));

    hookFiles.forEach(file => {
      fixFile(path.join(hooksDir, file));
    });
  }

  console.log('\n=== Summary ===');
  console.log(`Electron API enhancements: ${FIXES_APPLIED.electronAPIs}`);
  console.log(`addLog ordering fixes: ${FIXES_APPLIED.addLogOrder}`);
  console.log(`testWrapper import fixes: ${FIXES_APPLIED.testWrapperImports}`);
  console.log(`Null safety additions: ${FIXES_APPLIED.nullSafety}`);
  console.log('\nAutomated fixes complete. Run tests to validate.');
}

main();

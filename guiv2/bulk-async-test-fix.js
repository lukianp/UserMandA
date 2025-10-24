#!/usr/bin/env node
/**
 * Bulk Async Test Fix Script
 * Fixes common async patterns in discovery hook tests
 * Handles: config object vs function, missing waitFor, cancelExecution mocks
 */

const fs = require('fs');
const path = require('path');

// Files to fix from Priority 1 list
const testFiles = [
  'src/renderer/hooks/useAzureDiscoveryLogic.test.ts',
  'src/renderer/hooks/useAWSDiscoveryLogic.test.ts',
  'src/renderer/hooks/useExchangeDiscoveryLogic.test.ts',
  'src/renderer/hooks/useFileSystemDiscoveryLogic.test.ts',
  'src/renderer/hooks/useApplicationDiscoveryLogic.test.ts',
  'src/renderer/hooks/useDomainDiscoveryLogic.test.ts',
  'src/renderer/hooks/useGoogleWorkspaceDiscoveryLogic.test.ts',
  'src/renderer/hooks/useHyperVDiscoveryLogic.test.ts',
  'src/renderer/hooks/useIntuneDiscoveryLogic.test.ts',
  'src/renderer/hooks/useOneDriveDiscoveryLogic.test.ts',
  'src/renderer/hooks/usePowerPlatformDiscoveryLogic.test.ts',
  'src/renderer/hooks/useSharePointDiscoveryLogic.test.ts',
  'src/renderer/hooks/useTeamsDiscoveryLogic.test.ts',
  'src/renderer/hooks/useVMwareDiscoveryLogic.test.ts',
  'src/renderer/hooks/useWebServerDiscoveryLogic.test.ts',
];

const fixes = {
  applied: 0,
  failed: 0,
  skipped: 0,
  details: []
};

function applyFixes(filePath) {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    fixes.skipped++;
    fixes.details.push(`SKIPPED: ${filePath} - File not found`);
    return;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Fix 1: Add waitFor to cancel discovery tests that check cancelExecution
    if (content.includes('expect(mockElectronAPI.cancelExecution).toHaveBeenCalled()') ||
        content.includes('expect(mockElectronAPI.cancelDiscovery).toHaveBeenCalled()')) {

      const cancelTestPattern = /(it\([^)]*cancel[^)]*\)[^{]*\{[\s\S]*?)(expect\(mockElectronAPI\.(?:cancelExecution|cancelDiscovery)\)\.toHaveBeenCalled\(\))/gi;

      content = content.replace(cancelTestPattern, (match, before, expectCall) => {
        if (!before.includes('await waitFor(')) {
          modified = true;
          return `${before}await waitFor(() => {\n        ${expectCall};\n      })`;
        }
        return match;
      });
    }

    // Fix 2: Add waitFor to export tests that check writeFile calls
    if (content.includes('expect(mockElectronAPI.writeFile).toHaveBeenCalled()')) {
      const exportTestPattern = /(it\([^)]*export[^)]*\)[^{]*\{[\s\S]*?)(expect\(mockElectronAPI\.writeFile\)\.toHaveBeenCalled\(\))/gi;

      content = content.replace(exportTestPattern, (match, before, expectCall) => {
        if (!before.includes('await waitFor(')) {
          modified = true;
          return `${before}await waitFor(() => {\n        ${expectCall};\n      })`;
        }
        return match;
      });
    }

    // Fix 3: Add waitFor to progress tests
    if (content.includes('expect(result.current.progress)')) {
      const progressTestPattern = /(it\([^)]*progress[^)]*\)[^{]*\{[\s\S]*?await result\.current\.start[^;]*;[\s\S]*?)(expect\(result\.current\.progress\))/gi;

      content = content.replace(progressTestPattern, (match, before, expectCall) => {
        if (!before.includes('await waitFor(') && !match.includes('await waitFor(')) {
          modified = true;
          return `${before}await waitFor(() => {\n        ${expectCall}.toBeDefined();\n      });\n\n      ${expectCall}`;
        }
        return match;
      });
    }

    // Fix 4: Ensure executeModule/executeDiscovery is called before cancel tests
    const cancelWithoutStartPattern = /describe\([^)]*Cancel[^)]*[\s\S]*?it\([^)]*cancel[^)]*async[^{]*\{[\s\S]*?const \{ result \} = renderHook[\s\S]*?\);[\s\S]*?await act\(async \(\) => \{[\s\S]*?await result\.current\.cancel/gi;

    content = content.replace(cancelWithoutStartPattern, (match) => {
      if (!match.includes('result.current.startDiscovery()') && !match.includes('result.current.start()')) {
        modified = true;
        // Insert start call before cancel
        return match.replace(
          /(const \{ result \} = renderHook[\s\S]*?\);)/,
          `$1\n\n      // Start discovery first\n      await act(async () => {\n        result.current.startDiscovery?.() || result.current.start?.();\n      });\n`
        );
      }
      return match;
    });

    if (modified) {
      // Ensure waitFor is imported
      if (!content.includes('waitFor') && modified) {
        content = content.replace(
          /import \{ renderHook, act \}/,
          'import { renderHook, act, waitFor }'
        );
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      fixes.applied++;
      fixes.details.push(`FIXED: ${filePath}`);
    } else {
      fixes.skipped++;
      fixes.details.push(`SKIPPED: ${filePath} - No patterns matched`);
    }

  } catch (error) {
    fixes.failed++;
    fixes.details.push(`FAILED: ${filePath} - ${error.message}`);
  }
}

// Apply fixes to all files
console.log('Starting bulk async test fixes...\n');
testFiles.forEach(applyFixes);

// Print summary
console.log('\n=== FIX SUMMARY ===');
console.log(`Applied: ${fixes.applied}`);
console.log(`Skipped: ${fixes.skipped}`);
console.log(`Failed: ${fixes.failed}`);
console.log('\n=== DETAILS ===');
fixes.details.forEach(detail => console.log(detail));

process.exit(fixes.failed > 0 ? 1 : 0);

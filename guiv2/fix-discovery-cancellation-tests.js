#!/usr/bin/env node
/**
 * Automated Fix Script for Discovery Hook Cancellation Tests
 *
 * Fixes the pattern where cancellation tests fail because:
 * - Discovery completes immediately before cancel can be called
 *
 * Solution:
 * - Add setTimeout mock to delay discovery completion
 * - Don't await startDiscovery (let it run in background)
 * - Then cancel while it's running
 */

const fs = require('fs');
const path = require('path');

const hookTestsDir = path.join(__dirname, 'src', 'renderer', 'hooks');

// Pattern to match the old cancellation test
const oldPattern = /describe\('Cancellation',[\s\S]*?it\('should cancel discovery when token exists',[\s\S]*?mockCancelExecution\.mockResolvedValueOnce\([^)]*\);[\s]*\n[\s]*const { result } = renderHook[^;]*;[\s]*\n[\s]*await act\(async \(\) => {[\s]*\n[\s]*await result\.current\.startDiscovery\(\);[\s]*\n[\s]*await result\.current\.cancelDiscovery\(\);[\s]*\n[\s]*}\);[\s]*\n[\s]*expect\(mockCancelExecution\)\.toHaveBeenCalled\(\);[\s]*\n[\s]*expect\(result\.current\.isDiscovering\)\.toBe\(false\);[\s]*\n[\s]*}\);[\s]*\n[\s]*}\);/;

// New pattern to replace with
const newPattern = `describe('Cancellation', () => {
    it('should cancel discovery when token exists', async () => {
      mockCancelExecution.mockResolvedValueOnce(undefined);

      // Make discovery take longer so we can cancel it
      mockExecuteModule.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ success: true, data: {} }), 100);
        });
      });

      const { result } = renderHook(() => use\${HOOK_NAME}());

      // Start discovery (don't await completion)
      act(() => {
        result.current.startDiscovery();
      });

      // Cancel while it's running
      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(mockCancelExecution).toHaveBeenCalled();
      expect(result.current.isDiscovering).toBe(false);
    });
  });`;

let filesFixed = 0;
let filesSkipped = 0;
let filesWithIssues = [];

// Get all *DiscoveryLogic.test.ts files
const files = fs.readdirSync(hookTestsDir)
  .filter(f => f.endsWith('DiscoveryLogic.test.ts'));

console.log(`\n🔍 Found ${files.length} discovery hook test files\n`);

files.forEach(file => {
  const filePath = path.join(hookTestsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Extract hook name from filename (e.g., useAzureDiscoveryLogic from useAzureDiscoveryLogic.test.ts)
  const hookName = file.replace('.test.ts', '');

  // Check if file has the problematic pattern
  // Look for simpler pattern: cancellation test that awaits both start and cancel
  const hasProblem = content.includes('describe(\'Cancellation\'') &&
                     content.includes('await result.current.startDiscovery()') &&
                     content.includes('await result.current.cancelDiscovery()') &&
                     content.match(/await act\(async \(\) => {\s*await result\.current\.startDiscovery\(\);\s*await result\.current\.cancelDiscovery\(\);/);

  if (!hasProblem) {
    console.log(`⏭️  ${file} - No issue found or already fixed`);
    filesSkipped++;
    return;
  }

  // Find and replace the cancellation test section
  const cancellationSectionRegex = /(describe\('Cancellation',[\s\S]*?)(\s+it\('should cancel discovery when token exists', async \(\) => {\s+mockCancelExecution\.mockResolvedValueOnce\([^)]*\);\s+const { result } = renderHook\(\(\) => )([^(]+)(\(\)\);\s+await act\(async \(\) => {\s+await result\.current\.startDiscovery\(\);\s+await result\.current\.cancelDiscovery\(\);\s+}\);\s+expect\(mockCancelExecution\)\.toHaveBeenCalled\(\);\s+expect\(result\.current\.isDiscovering\)\.toBe\(false\);\s+}\);)/;

  const match = content.match(cancellationSectionRegex);

  if (match) {
    const hookNameFromContent = match[3];

    const replacement = `$1
    it('should cancel discovery when token exists', async () => {
      mockCancelExecution.mockResolvedValueOnce(undefined);

      // Make discovery take longer so we can cancel it
      mockExecuteModule.mockImplementationOnce(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ success: true, data: {} }), 100);
        });
      });

      const { result } = renderHook(() => ${hookNameFromContent}());

      // Start discovery (don't await completion)
      act(() => {
        result.current.startDiscovery();
      });

      // Cancel while it's running
      await act(async () => {
        await result.current.cancelDiscovery();
      });

      expect(mockCancelExecution).toHaveBeenCalled();
      expect(result.current.isDiscovering).toBe(false);
    });`;

    const newContent = content.replace(cancellationSectionRegex, replacement);

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ ${file} - Fixed cancellation test`);
      filesFixed++;
    } else {
      console.log(`⚠️  ${file} - Pattern matched but replacement failed`);
      filesWithIssues.push(file);
    }
  } else {
    console.log(`⚠️  ${file} - Has issue but couldn't match pattern`);
    filesWithIssues.push(file);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Fixed: ${filesFixed} files`);
console.log(`   ⏭️  Skipped: ${filesSkipped} files`);
console.log(`   ⚠️  Issues: ${filesWithIssues.length} files`);

if (filesWithIssues.length > 0) {
  console.log(`\n⚠️  Files needing manual review:`);
  filesWithIssues.forEach(f => console.log(`   - ${f}`));
}

console.log(`\n✨ Done! Run tests to verify fixes.\n`);

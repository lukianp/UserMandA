#!/usr/bin/env node
/**
 * Apply universal discovery mocks to hook tests
 * Phase 5 Priority 3: Standardize mock data structures
 */

const fs = require('fs');
const path = require('path');

const glob = require('glob');

// Map of discovery hooks to their mock creator functions
const hookToMockMap = {
  'useActiveDirectoryDiscoveryLogic.test.ts': 'activeDirectory',
  'useAzureDiscoveryLogic.test.ts': 'azure',
  'useExchangeDiscoveryLogic.test.ts': 'exchange',
  'useGoogleWorkspaceDiscoveryLogic.test.ts': 'googleWorkspace',
  'useVMwareDiscoveryLogic.test.ts': 'vmware',
  'useIntuneDiscoveryLogic.test.ts': 'intune',
  'useSQLServerDiscoveryLogic.test.ts': 'sqlServer',
};

function addMockImport(content, _mockType) {
  // Check if import already exists
  if (content.includes('mockDiscoveryCreators')) {
    return content;
  }

  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') || lines[i].startsWith('import{')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex === -1) {
    // No imports found, add at the top after comments
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith('/**') && !lines[i].startsWith(' *') && !lines[i].startsWith('*/') && !lines[i].startsWith('//')) {
        insertIndex = i;
        break;
      }
    }
    lines.splice(insertIndex, 0, "import { mockDiscoveryCreators } from '../../test-utils/mockDiscoveryData';");
  } else {
    // Add after last import
    lines.splice(lastImportIndex + 1, 0, "import { mockDiscoveryCreators } from '../../test-utils/mockDiscoveryData';");
  }

  return lines.join('\n');
}

function updateMockData(content, mockType) {
  // Replace hardcoded mock data with calls to mock creators
  const replacements = [
    {
      // Replace empty result objects
      pattern: /const\s+mockResult\s*=\s*\{\s*items:\s*\[\],\s*totalCount:\s*0[^}]*\}/g,
      replacement: `const mockResult = mockDiscoveryCreators.${mockType}(10)`,
    },
    {
      // Replace inline empty results
      pattern: /\{\s*items:\s*\[\],\s*totalCount:\s*0,\s*filteredCount:\s*0[^}]*\}/g,
      replacement: `mockDiscoveryCreators.${mockType}(0)`,
    },
  ];

  let newContent = content;
  let modified = false;

  for (const { pattern, replacement } of replacements) {
    if (pattern.test(newContent)) {
      newContent = newContent.replace(pattern, replacement);
      modified = true;
    }
  }

  return { content: newContent, modified };
}

// Find all discovery logic test files
const testFiles = glob.sync('src/renderer/hooks/use*DiscoveryLogic.test.ts');

console.log(`Found ${testFiles.length} discovery logic test files\n`);

let modifiedCount = 0;

for (const file of testFiles) {
  const basename = path.basename(file);

  // Check if we have a mock mapping for this file
  const mockType = hookToMockMap[basename];
  if (!mockType) {
    console.log(`⏭️  ${basename}: No mock mapping defined`);
    continue;
  }

  console.log(`\nProcessing ${basename} (${mockType}):`);

  // Read file
  let content = fs.readFileSync(file, 'utf8');

  // Add import
  const contentWithImport = addMockImport(content, mockType);
  if (contentWithImport !== content) {
    console.log(`  ✓ Added mock import`);
    content = contentWithImport;
  }

  // Update mock data
  const { content: updatedContent, modified } = updateMockData(content, mockType);

  if (modified) {
    fs.writeFileSync(file, updatedContent, 'utf8');
    modifiedCount++;
    console.log(`  ✓ Updated mock data usage`);
    console.log(`✅ ${basename}: Modified`);
  } else if (contentWithImport !== content) {
    fs.writeFileSync(file, contentWithImport, 'utf8');
    modifiedCount++;
    console.log(`✅ ${basename}: Added import only`);
  } else {
    console.log(`⚠️  ${basename}: No changes made`);
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Modified ${modifiedCount}/${testFiles.length} files`);
console.log(`\nNext steps:`);
console.log(`1. Review changes: git diff src/renderer/hooks/`);
console.log(`2. Run hook tests: npm test -- src/renderer/hooks/ --no-cache`);

/**
 * Comprehensive Autonomous Test Fixer
 * Systematically fixes multiple test patterns across the codebase
 */

const fs = require('fs');
const path = require('path');

// Pattern fixes to apply
const fixes = {
  standardizeMocks: true,
  addDataCyAttributes: true,
  fixNullSafety: true,
  fixAsyncPatterns: true,
};

// Track changes
const changes = {
  mocksStandardized: [],
  dataCyAdded: [],
  nullSafetyFixed: [],
  asyncFixed: [],
};

/**
 * Standardize mock data in discovery hook tests
 */
function standardizeDiscoveryMocks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file already imports from mockDiscoveryData
  const hasMockImport = content.includes('from \'../test-utils/mockDiscoveryData\'') ||
                         content.includes('from \'../../test-utils/mockDiscoveryData\'');

  if (hasMockImport) {
    return false; // Already using standardized mocks
  }

  // Detect which mock type is needed based on filename
  const mockTypeMap = {
    'ActiveDirectory': 'createMockADDiscoveryResult',
    'Azure': 'createMockAzureDiscoveryResult',
    'Exchange': 'createMockExchangeDiscoveryResult',
    'GoogleWorkspace': 'createMockGoogleWorkspaceDiscoveryResult',
    'VMware': 'createMockVMwareDiscoveryResult',
    'Intune': 'createMockIntuneDiscoveryResult',
    'SQLServer': 'createMockSQLServerDiscoveryResult',
  };

  let mockFunctionNeeded = null;
  for (const [key, func] of Object.entries(mockTypeMap)) {
    if (filePath.includes(key)) {
      mockFunctionNeeded = func;
      break;
    }
  }

  if (!mockFunctionNeeded && filePath.includes('Discovery')) {
    mockFunctionNeeded = 'createMockDiscoveryResult';
  }

  if (!mockFunctionNeeded) {
    return false;
  }

  // Add import at top of file (after existing imports)
  const importStatement = `import { ${mockFunctionNeeded} } from '../test-utils/mockDiscoveryData';\n`;

  // Find the last import statement
  const importRegex = /^import .+ from .+;$/gm;
  const imports = content.match(importRegex);

  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length + 1;

    content = content.slice(0, insertPosition) + importStatement + content.slice(insertPosition);
    modified = true;
  }

  // Replace inline mock data patterns with standardized mocks
  // Pattern 1: mockElectron.window.api.discovery.discover returns inline object
  const inlineMockPattern = /mockElectron\.window\.api\.discovery\.discover\.mockResolvedValue\(\s*\{[^}]+\}\s*\)/g;
  if (content.match(inlineMockPattern)) {
    content = content.replace(
      inlineMockPattern,
      `mockElectron.window.api.discovery.discover.mockResolvedValue(${mockFunctionNeeded}(10))`
    );
    modified = true;
  }

  return modified;
}

/**
 * Fix null safety issues in hook files
 */
function fixNullSafety(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: result.items.length without null check
  const lengthPattern = /(\w+)\.items\.length(?!\s*\?\?)/g;
  if (content.match(lengthPattern)) {
    content = content.replace(lengthPattern, (match, varName) => {
      return `${varName}?.items?.length ?? 0`;
    });
    modified = true;
  }

  // Pattern 2: result.items.filter without null check
  const filterPattern = /(\w+)\.items\.filter\(/g;
  if (content.match(filterPattern)) {
    content = content.replace(filterPattern, (match, varName) => {
      return `(${varName}?.items ?? []).filter(`;
    });
    modified = true;
  }

  // Pattern 3: result.items.map without null check
  const mapPattern = /(\w+)\.items\.map\(/g;
  if (content.match(mapPattern)) {
    content = content.replace(mapPattern, (match, varName) => {
      return `(${varName}?.items ?? []).map(`;
    });
    modified = true;
  }

  // Pattern 4: numeric calculations without null check
  const numericPattern = /(\w+)\.(\w+)\.toFixed\(/g;
  if (content.match(numericPattern)) {
    content = content.replace(numericPattern, (match, varName, propName) => {
      return `(${varName}?.${propName} ?? 0).toFixed(`;
    });
    modified = true;
  }

  return modified;
}

/**
 * Add data-cy attributes to view files
 */
function addDataCyAttributes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: Export button without data-cy
  if (content.includes('Export') && !content.includes('data-cy="export-results-btn"')) {
    const exportButtonPattern = /<Button[^>]*onClick=\{[^}]*[Ee]xport[^}]*\}[^>]*>/g;
    const matches = content.match(exportButtonPattern);

    if (matches) {
      matches.forEach(match => {
        if (!match.includes('data-cy')) {
          const fixed = match.replace('<Button', '<Button data-cy="export-results-btn"');
          content = content.replace(match, fixed);
          modified = true;
        }
      });
    }
  }

  // Pattern 2: Cancel button without data-cy
  if (content.includes('Cancel') && !content.includes('data-cy="cancel-discovery-btn"')) {
    const cancelButtonPattern = /<Button[^>]*onClick=\{[^}]*[Cc]ancel[^}]*\}[^>]*>/g;
    const matches = content.match(cancelButtonPattern);

    if (matches) {
      matches.forEach(match => {
        if (!match.includes('data-cy')) {
          const fixed = match.replace('<Button', '<Button data-cy="cancel-discovery-btn"');
          content = content.replace(match, fixed);
          modified = true;
        }
      });
    }
  }

  // Pattern 3: Start Discovery button without data-cy
  if (content.includes('Start Discovery') && !content.includes('data-cy="start-discovery-btn"')) {
    const startButtonPattern = /<Button[^>]*onClick=\{[^}]*[Ss]tart[^}]*\}[^>]*>/g;
    const matches = content.match(startButtonPattern);

    if (matches) {
      matches.forEach(match => {
        if (!match.includes('data-cy')) {
          const fixed = match.replace('<Button', '<Button data-cy="start-discovery-btn"');
          content = content.replace(match, fixed);
          modified = true;
        }
      });
    }
  }

  return modified;
}

/**
 * Fix async/await patterns in tests
 */
function fixAsyncPatterns(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if waitFor is imported
  const hasWaitFor = content.includes('waitFor');

  // Pattern: Tests calling async methods without waitFor
  const asyncTestPattern = /it\(['"]should [^'"]+['"],\s*async\s*\(\)\s*=>\s*\{[^}]*result\.current\.\w+\([^)]*\)[^}]*expect/g;

  if (content.match(asyncTestPattern) && !hasWaitFor) {
    // Add waitFor import if not present
    if (content.includes('from \'@testing-library/react\'')) {
      content = content.replace(
        /from '@testing-library\/react'/,
        'from \'@testing-library/react\''
      );

      // Add waitFor to existing import
      if (!content.includes('waitFor')) {
        content = content.replace(
          /import \{([^}]+)\} from '@testing-library\/react'/,
          'import {$1, waitFor} from \'@testing-library/react\''
        );
        modified = true;
      }
    }
  }

  return modified;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  const fileChanges = [];

  try {
    // Read original content
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let currentContent = originalContent;

    // Apply fixes based on file type
    const isTest = filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx');
    const isView = filePath.includes('/views/');
    const isHook = filePath.includes('/hooks/');
    const isDiscovery = filePath.includes('Discovery');

    if (isTest && isHook && isDiscovery && fixes.standardizeMocks) {
      if (standardizeDiscoveryMocks(filePath)) {
        fileChanges.push('standardized mocks');
        currentContent = fs.readFileSync(filePath, 'utf8');
      }
    }

    if (isHook && fixes.fixNullSafety) {
      const content = fs.readFileSync(filePath, 'utf8');
      const modified = fixNullSafety(filePath);
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        fileChanges.push('null safety');
        currentContent = fs.readFileSync(filePath, 'utf8');
      }
    }

    if (isView && fixes.addDataCyAttributes) {
      const content = fs.readFileSync(filePath, 'utf8');
      const modified = addDataCyAttributes(filePath);
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        fileChanges.push('data-cy attributes');
        currentContent = fs.readFileSync(filePath, 'utf8');
      }
    }

    if (isTest && fixes.fixAsyncPatterns) {
      const content = fs.readFileSync(filePath, 'utf8');
      const modified = fixAsyncPatterns(filePath);
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        fileChanges.push('async patterns');
        currentContent = fs.readFileSync(filePath, 'utf8');
      }
    }

    // Write file if modified
    if (currentContent !== originalContent) {
      fs.writeFileSync(filePath, currentContent, 'utf8');
      return fileChanges;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }

  return fileChanges;
}

/**
 * Main execution
 */
function main() {
  console.log('Starting comprehensive autonomous test fixer...\n');

  // Find all relevant files
  const srcDir = path.join(__dirname, 'src');
  const filesToProcess = [];

  function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        filesToProcess.push(filePath);
      }
    });
  }

  walkDir(srcDir);

  console.log(`Found ${filesToProcess.length} files to process\n`);

  // Process each file
  let processedCount = 0;
  let modifiedCount = 0;

  filesToProcess.forEach(filePath => {
    const changes = processFile(filePath);
    processedCount++;

    if (changes.length > 0) {
      modifiedCount++;
      console.log(`✓ ${path.relative(__dirname, filePath)}: ${changes.join(', ')}`);

      changes.forEach(change => {
        if (change === 'standardized mocks') {
          changes.mocksStandardized.push(filePath);
        } else if (change === 'data-cy attributes') {
          changes.dataCyAdded.push(filePath);
        } else if (change === 'null safety') {
          changes.nullSafetyFixed.push(filePath);
        } else if (change === 'async patterns') {
          changes.asyncFixed.push(filePath);
        }
      });
    }

    if (processedCount % 50 === 0) {
      console.log(`Progress: ${processedCount}/${filesToProcess.length} files processed`);
    }
  });

  console.log('\n=== Summary ===');
  console.log(`Total files processed: ${processedCount}`);
  console.log(`Files modified: ${modifiedCount}`);
  console.log(`Mocks standardized: ${changes.mocksStandardized.length}`);
  console.log(`Data-cy attributes added: ${changes.dataCyAdded.length}`);
  console.log(`Null safety fixed: ${changes.nullSafetyFixed.length}`);
  console.log(`Async patterns fixed: ${changes.asyncFixed.length}`);

  // Write summary to file
  fs.writeFileSync(
    path.join(__dirname, 'autonomous-fix-summary.json'),
    JSON.stringify(changes, null, 2)
  );

  console.log('\nSummary written to autonomous-fix-summary.json');
}

main();

#!/usr/bin/env node
/**
 * Automated script to add missing data-cy attributes to components
 * Phase 5: High-ROI bulk fix for 200-300 tests
 */

const fs = require('fs');
const path = require('path');

// Read the missing attributes file
const missingAttributesFile = path.join(__dirname, 'missing-data-cy.txt');

if (!fs.existsSync(missingAttributesFile)) {
  console.error('Error: missing-data-cy.txt not found. Run test analysis first.');
  process.exit(1);
}

const missingData = fs.readFileSync(missingAttributesFile, 'utf8');
const lines = missingData.trim().split('\n');

// Parse the missing attributes with their counts
const missingAttributes = lines.map(line => {
  const match = line.trim().match(/(\d+)\s+(.+)/);
  if (match) {
    return { count: parseInt(match[1]), attribute: match[2] };
  }
  return null;
}).filter(Boolean);

console.log(`Found ${missingAttributes.length} missing data-cy attributes\n`);

// Map common patterns to component locations
const attributeToComponentMap = {
  // Discovery views
  'start-discovery-button': 'Discovery*View.tsx',
  'cancel-button': '*View.tsx',
  'export-button': '*View.tsx',
  'refresh-button': '*View.tsx',
  'discovery-status': 'Discovery*View.tsx',
  'progress-bar': '*View.tsx',
  'results-grid': '*View.tsx',
  'error-message': '*View.tsx',
  'log-viewer': 'Discovery*View.tsx',

  // Grid components
  'grid-loading': 'VirtualizedDataGrid.tsx',
  'grid-row': 'VirtualizedDataGrid.tsx',
  'grid-cell': 'VirtualizedDataGrid.tsx',
  'grid-header': 'VirtualizedDataGrid.tsx',
  'grid-empty': 'VirtualizedDataGrid.tsx',

  // Common UI elements
  'search-input': '*View.tsx',
  'filter-dropdown': '*View.tsx',
  'sort-button': '*View.tsx',
  'page-title': '*View.tsx',
  'loading-spinner': '*View.tsx',
  'error-alert': '*View.tsx',
  'success-message': '*View.tsx',

  // Forms
  'form-input': '*View.tsx',
  'form-select': '*View.tsx',
  'form-checkbox': '*View.tsx',
  'submit-button': '*View.tsx',
  'reset-button': '*View.tsx',

  // Migration specific
  'migration-status': 'Migration*View.tsx',
  'wave-selector': 'Migration*View.tsx',
  'dependency-graph': 'Migration*View.tsx',
  'validation-results': 'Migration*View.tsx',

  // Settings
  'settings-panel': 'Settings*View.tsx',
  'config-input': '*View.tsx',
  'save-settings-button': '*View.tsx',
};

// JSX patterns to look for when adding attributes
const jsxPatterns = [
  { pattern: /<button[^>]*onClick/, attrPosition: 'button', elementType: 'button' },
  { pattern: /<Button[^>]*onClick/, attrPosition: 'Button', elementType: 'Button' },
  { pattern: /<input[^>]*type=/, attrPosition: 'input', elementType: 'input' },
  { pattern: /<Input[^>]*/, attrPosition: 'Input', elementType: 'Input' },
  { pattern: /<select[^>]*/, attrPosition: 'select', elementType: 'select' },
  { pattern: /<textarea[^>]*/, attrPosition: 'textarea', elementType: 'textarea' },
  { pattern: /<div[^>]*className="[^"]*loading/, attrPosition: 'div', elementType: 'loading-div' },
  { pattern: /<div[^>]*className="[^"]*error/, attrPosition: 'div', elementType: 'error-div' },
  { pattern: /<div[^>]*className="[^"]*grid/, attrPosition: 'div', elementType: 'grid-div' },
];

// Function to find component files matching a pattern
function findComponents(pattern, baseDir = 'src/renderer') {
  const glob = require('glob');
  const fullPattern = path.join(baseDir, '**', pattern);
  return glob.sync(fullPattern);
}

// Function to add data-cy attribute to JSX element
function addDataCyAttribute(content, attribute, elementType) {
  // Don't add if already exists
  if (content.includes(`data-cy="${attribute}"`)) {
    return { modified: false, content };
  }

  // Try to find the appropriate element based on attribute name
  let modified = false;
  let newContent = content;

  // Strategy 1: Find button with specific text/label
  if (attribute.includes('button')) {
    const buttonText = attribute
      .replace('-button', '')
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    // Look for button with this text
    const buttonRegex = new RegExp(
      `(<(?:button|Button)[^>]*>)\\s*${buttonText}`,
      'i'
    );

    if (buttonRegex.test(content)) {
      newContent = content.replace(buttonRegex, (match, opening) => {
        if (!opening.includes('data-cy=')) {
          const newOpening = opening.replace(/>$/, ` data-cy="${attribute}">`);
          return newOpening + buttonText;
        }
        return match;
      });
      modified = newContent !== content;
    }
  }

  // Strategy 2: Find element by className pattern
  if (!modified && attribute.includes('grid-')) {
    const classPattern = attribute.replace('grid-', '');
    const gridRegex = new RegExp(
      `(<div[^>]*className="[^"]*${classPattern}[^"]*"[^>]*)>`,
      'i'
    );

    if (gridRegex.test(content)) {
      newContent = content.replace(gridRegex, (match, opening) => {
        if (!opening.includes('data-cy=')) {
          return opening + ` data-cy="${attribute}">`;
        }
        return match;
      });
      modified = newContent !== content;
    }
  }

  // Strategy 3: Find status/progress elements
  if (!modified && (attribute.includes('status') || attribute.includes('progress'))) {
    const statusRegex = new RegExp(
      `(<div[^>]*className="[^"]*(?:status|progress)[^"]*"[^>]*)>`,
      'i'
    );

    if (statusRegex.test(content)) {
      newContent = content.replace(statusRegex, (match, opening) => {
        if (!opening.includes('data-cy=')) {
          return opening + ` data-cy="${attribute}">`;
        }
        return match;
      });
      modified = newContent !== content;
    }
  }

  return { modified, content: newContent };
}

// Process each missing attribute
let totalModified = 0;
let totalAttempted = 0;

console.log('Processing top 50 missing attributes...\n');

for (const { count, attribute } of missingAttributes.slice(0, 50)) {
  console.log(`\n[${attribute}] Missing in ${count} tests`);
  totalAttempted++;

  // Find potential component files
  const componentPattern = attributeToComponentMap[attribute] || '*View.tsx';
  const componentFiles = findComponents(componentPattern);

  if (componentFiles.length === 0) {
    console.log(`  ⚠️  No component files found for pattern: ${componentPattern}`);
    continue;
  }

  console.log(`  Found ${componentFiles.length} potential files`);

  // Try to add attribute to each file
  let addedToFiles = 0;
  for (const file of componentFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const { modified, content: newContent } = addDataCyAttribute(
      content,
      attribute,
      'auto'
    );

    if (modified) {
      fs.writeFileSync(file, newContent, 'utf8');
      addedToFiles++;
      totalModified++;
      console.log(`  ✓ Added to ${path.basename(file)}`);
    }
  }

  if (addedToFiles === 0) {
    console.log(`  ⚠️  Could not auto-add attribute to any files`);
  }
}

console.log(`\n\n=== SUMMARY ===`);
console.log(`Attempted: ${totalAttempted} attributes`);
console.log(`Modified: ${totalModified} files`);
console.log(`\nNext steps:`);
console.log(`1. Review changes: git diff`);
console.log(`2. Build check: npm run build`);
console.log(`3. Run tests: npm test`);

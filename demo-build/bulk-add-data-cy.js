#!/usr/bin/env node
/**
 * Bulk add data-cy attributes to components based on test analysis
 * Phase 5: Precision bulk fix targeting 200-300 test improvements
 */

const fs = require('fs');
const path = require('path');

// Read the fix list
const fixList = JSON.parse(fs.readFileSync('data-cy-fix-list.json', 'utf8'));

console.log(`Processing ${fixList.length} data-cy attributes...\n`);

// Attribute to JSX element mapping
const attributePatterns = {
  // Buttons
  'export-results-btn': { element: 'button', text: /export.*results/i, role: 'button' },
  'cancel-discovery-btn': { element: 'button', text: /cancel/i, role: 'button' },
  'start-discovery-btn': { element: 'button', text: /start.*discovery/i, role: 'button' },
  'clear-logs-btn': { element: 'button', text: /clear.*logs/i, role: 'button' },
  'export-csv-btn': { element: 'button', text: /export.*csv/i, role: 'button' },
  'refresh-btn': { element: 'button', text: /refresh/i, role: 'button' },

  // Inputs
  'domain-controller-input': { element: 'input', label: /domain.*controller/i, type: 'text' },
  'config-toggle': { element: 'input', type: 'checkbox', label: /config/i },

  // Views (root elements)
  'backup-restore-view': { element: 'div', className: /backup.*restore/i, role: 'main' },
  'security-dashboard-view': { element: 'div', className: /security.*dashboard/i, role: 'main' },
  'azure-discovery-view': { element: 'div', className: /azure.*discovery/i, role: 'main' },

  // Other elements
  'loading-overlay': { element: 'div', className: /loading.*overlay/i, role: 'status' },
  'ag-grid-mock': { element: 'div', className: /ag-grid/i, role: 'grid' },
};

// Function to find JSX elements in component
function findJSXElements(content, attribute) {
  const pattern = attributePatterns[attribute];
  if (!pattern) {
    // Generic fallback
    return findGenericElement(content, attribute);
  }

  const { element, text, className, role, type, label } = pattern;
  const matches = [];

  // Strategy 1: Find by text content (for buttons)
  if (text) {
    const regex = new RegExp(
      `(<(?:${element}|${element.charAt(0).toUpperCase() + element.slice(1)})[^>]*>)([^<]*${text.source}[^<]*)`,
      'gi'
    );

    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        openTag: match[1],
        position: match.index,
        type: 'text-match',
      });
    }
  }

  // Strategy 2: Find by className
  if (className && matches.length === 0) {
    const regex = new RegExp(
      `<${element}[^>]*className=["']([^"']*${className.source}[^"']*)["'][^>]*>`,
      'gi'
    );

    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        openTag: match[0],
        position: match.index,
        type: 'className-match',
      });
    }
  }

  // Strategy 3: Find by type (for inputs)
  if (type && matches.length === 0) {
    const regex = new RegExp(
      `<${element}[^>]*type=["']${type}["'][^>]*>`,
      'gi'
    );

    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        fullMatch: match[0],
        openTag: match[0],
        position: match.index,
        type: 'type-match',
      });
    }
  }

  return matches;
}

// Generic element finder
function findGenericElement(content, attribute) {
  // Extract keywords from attribute
  const keywords = attribute
    .replace(/-btn$/, '')
    .replace(/-input$/, '')
    .replace(/-view$/, '')
    .split('-');

  // Build search pattern
  const pattern = new RegExp(keywords.join('.*'), 'i');

  // Search in button text
  const buttonRegex = new RegExp(
    `(<(?:button|Button)[^>]*>)([^<]*${pattern.source}[^<]*)`,
    'gi'
  );

  let match;
  const matches = [];
  while ((match = buttonRegex.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      openTag: match[1],
      position: match.index,
      type: 'generic-button',
    });
  }

  return matches;
}

// Function to add data-cy to element
function addDataCyToElement(content, attribute, componentFile) {
  // Skip if already has this attribute
  if (content.includes(`data-cy="${attribute}"`)) {
    return { modified: false, content, reason: 'already-exists' };
  }

  // Find potential elements
  const matches = findJSXElements(content, attribute);

  if (matches.length === 0) {
    return { modified: false, content, reason: 'no-match' };
  }

  // Use the first match (most likely candidate)
  const match = matches[0];
  let newContent = content;

  // Insert data-cy attribute
  const { openTag, position } = match;

  // Find the closing > of the open tag
  const closingBracket = openTag.lastIndexOf('>');
  if (closingBracket === -1) {
    return { modified: false, content, reason: 'parse-error' };
  }

  // Insert data-cy before the closing bracket
  const newOpenTag = openTag.slice(0, closingBracket) + ` data-cy="${attribute}"` + openTag.slice(closingBracket);

  // Replace in content
  newContent = content.substring(0, position) + content.substring(position).replace(openTag, newOpenTag);

  return { modified: true, content: newContent, reason: 'added' };
}

// Process each file
let stats = {
  attempted: 0,
  modified: 0,
  alreadyExists: 0,
  noMatch: 0,
  parseError: 0,
};

const processedFiles = new Set();

for (const { attribute, count, componentFile, exists } of fixList) {
  if (!exists) {
    console.log(`⏭️  ${attribute}: Component file not found`);
    continue;
  }

  // Convert Windows path to Unix path
  const filePath = componentFile.replace(/\\/g, '/');

  stats.attempted++;

  // Read file
  const content = fs.readFileSync(filePath, 'utf8');

  // Add data-cy attribute
  const result = addDataCyToElement(content, attribute, filePath);

  if (result.modified) {
    fs.writeFileSync(filePath, result.content, 'utf8');
    stats.modified++;
    processedFiles.add(filePath);
    console.log(`✅ ${attribute} -> ${path.basename(filePath)}`);
  } else {
    stats[result.reason]++;
    if (result.reason !== 'already-exists') {
      console.log(`⚠️  ${attribute}: ${result.reason} (${path.basename(filePath)})`);
    }
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log('BULK DATA-CY ADDITION SUMMARY');
console.log('='.repeat(60));
console.log(`Attempted:       ${stats.attempted}`);
console.log(`Modified:        ${stats.modified} files`);
console.log(`Already exists:  ${stats.alreadyExists}`);
console.log(`No match found:  ${stats.noMatch}`);
console.log(`Parse errors:    ${stats.parseError}`);
console.log(`\nUnique files modified: ${processedFiles.size}`);
console.log(`\nNext steps:`);
console.log(`1. Review changes: git diff`);
console.log(`2. Run TypeScript check: npm run build`);
console.log(`3. Run tests: npm test`);

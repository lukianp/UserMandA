/**
 * Systematic Null Safety Fix for Remaining Issues
 * Finds and fixes undefined.length, .map, .filter, .toLowerCase in component files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all view and hook files
const viewFiles = glob.sync('src/renderer/views/**/*.tsx', { cwd: __dirname });
const hookFiles = glob.sync('src/renderer/hooks/**/*.ts', { cwd: __dirname, ignore: ['**/*.test.ts'] });

const allFiles = [...viewFiles, ...hookFiles];

let fixedCount = 0;
let totalChanges = 0;

console.log(`Processing ${allFiles.length} files...`);

allFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  let changes = 0;

  // Pattern 1: variableName.length where variableName is likely an array/string that could be undefined
  // Look for common patterns like: data.length, items.length, results.length, rules.length
  const arrayVars = ['data', 'items', 'results', 'rules', 'users', 'groups', 'devices', 'computers',
                     'teams', 'channels', 'members', 'operations', 'notifications', 'licenses',
                     'policies', 'roles', 'subscriptions', 'resources', 'domains', 'forests',
                     'subnets', 'mailboxes', 'applications', 'files', 'folders', 'shares',
                     'workloads', 'connectors', 'flows', 'environments', 'instances', 'volumes',
                     'networks', 'snapshots', 'servers', 'sites', 'bindings', 'appPools',
                     'certificates', 'distributionLists', 'publicFolders', 'servicePrincipals',
                     'conditionalAccessPolicies', 'dlpPolicies', 'retentionPolicies',
                     'escalations', 'channels', 'templates'];

  arrayVars.forEach(varName => {
    // Pattern: varName.length (not already wrapped)
    const lengthPattern = new RegExp(`(?<![?)])\\b${varName}\\.length\\b`, 'g');
    const lengthMatches = content.match(lengthPattern);
    if (lengthMatches && lengthMatches.length > 0) {
      content = content.replace(lengthPattern, `(${varName} ?? []).length`);
      modified = true;
      changes += lengthMatches.length;
    }

    // Pattern: varName.map( (not already wrapped)
    const mapPattern = new RegExp(`(?<![?)])\\b${varName}\\.map\\(`, 'g');
    const mapMatches = content.match(mapPattern);
    if (mapMatches && mapMatches.length > 0) {
      content = content.replace(mapPattern, `(${varName} ?? []).map(`);
      modified = true;
      changes += mapMatches.length;
    }

    // Pattern: varName.filter( (not already wrapped)
    const filterPattern = new RegExp(`(?<![?)])\\b${varName}\\.filter\\(`, 'g');
    const filterMatches = content.match(filterPattern);
    if (filterMatches && filterMatches.length > 0) {
      content = content.replace(filterPattern, `(${varName} ?? []).filter(`);
      modified = true;
      changes += filterMatches.length;
    }

    // Pattern: varName.reduce(
    const reducePattern = new RegExp(`(?<![?)])\\b${varName}\\.reduce\\(`, 'g');
    const reduceMatches = content.match(reducePattern);
    if (reduceMatches && reduceMatches.length > 0) {
      content = content.replace(reducePattern, `(${varName} ?? []).reduce(`);
      modified = true;
      changes += reduceMatches.length;
    }

    // Pattern: varName.forEach(
    const forEachPattern = new RegExp(`(?<![?)])\\b${varName}\\.forEach\\(`, 'g');
    const forEachMatches = content.match(forEachPattern);
    if (forEachMatches && forEachMatches.length > 0) {
      content = content.replace(forEachPattern, `(${varName} ?? []).forEach(`);
      modified = true;
      changes += forEachMatches.length;
    }

    // Pattern: varName.find(
    const findPattern = new RegExp(`(?<![?)])\\b${varName}\\.find\\(`, 'g');
    const findMatches = content.match(findPattern);
    if (findMatches && findMatches.length > 0) {
      content = content.replace(findPattern, `(${varName} ?? []).find(`);
      modified = true;
      changes += findMatches.length;
    }

    // Pattern: varName.some(
    const somePattern = new RegExp(`(?<![?)])\\b${varName}\\.some\\(`, 'g');
    const someMatches = content.match(somePattern);
    if (someMatches && someMatches.length > 0) {
      content = content.replace(somePattern, `(${varName} ?? []).some(`);
      modified = true;
      changes += someMatches.length;
    }

    // Pattern: varName.every(
    const everyPattern = new RegExp(`(?<![?)])\\b${varName}\\.every\\(`, 'g');
    const everyMatches = content.match(everyPattern);
    if (everyMatches && everyMatches.length > 0) {
      content = content.replace(everyPattern, `(${varName} ?? []).every(`);
      modified = true;
      changes += everyMatches.length;
    }
  });

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${file} (${changes} changes)`);
    fixedCount++;
    totalChanges += changes;
  }
});

console.log(`\n✨ Null safety fix complete:`);
console.log(`   Files modified: ${fixedCount}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\nRun 'npm test' to verify fixes.`);

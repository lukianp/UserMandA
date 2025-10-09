/**
 * Comprehensive View Testing Script
 * Tests all views for import errors, missing dependencies, and type issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VIEWS_DIR = path.join(__dirname, 'guiv2', 'src', 'renderer', 'views');
const CATEGORIES = ['migration', 'infrastructure', 'security', 'discovery', 'analytics', 'admin', 'advanced'];

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

console.log('🧪 Testing All Views for Errors\n');
console.log('='.repeat(80));

function getAllViewFiles(category) {
  const categoryPath = path.join(VIEWS_DIR, category);
  if (!fs.existsSync(categoryPath)) {
    return [];
  }

  const files = fs.readdirSync(categoryPath);
  return files
    .filter(f => f.endsWith('View.tsx') && !f.endsWith('.test.tsx'))
    .map(f => path.join(categoryPath, f));
}

function testView(viewPath) {
  const viewName = path.basename(viewPath);
  const category = path.basename(path.dirname(viewPath));

  try {
    results.total++;

    // Read the file content
    const content = fs.readFileSync(viewPath, 'utf-8');

    // Check for common issues
    const issues = [];

    // Check 1: Has default export
    if (!content.match(/export default/)) {
      issues.push('Missing default export');
    }

    // Check 2: Has React import
    if (!content.match(/import.*React/)) {
      issues.push('Missing React import');
    }

    // Check 3: Hook imports exist
    const hookMatches = content.match(/from ['"]\.\.\/\.\.\/hooks\/(.*?)['"]/g);
    if (hookMatches) {
      hookMatches.forEach(hookImport => {
        const hookPath = hookImport.match(/from ['"]\.\.\/\.\.\/hooks\/(.*?)['"]/)[1];
        const hookFile = path.join(VIEWS_DIR, '..', 'hooks', hookPath + '.ts');
        if (!fs.existsSync(hookFile) && !fs.existsSync(hookFile + 'x')) {
          issues.push(`Missing hook file: ${hookPath}`);
        }
      });
    }

    // Check 4: Component imports exist
    const componentMatches = content.match(/from ['"]\.\.\/\.\.\/components\/(.*?)['"]/g);
    if (componentMatches) {
      componentMatches.forEach(compImport => {
        const compPath = compImport.match(/from ['"]\.\.\/\.\.\/components\/(.*?)['"]/)[1];
        const compFile = path.join(VIEWS_DIR, '..', 'components', compPath + '.tsx');
        if (!fs.existsSync(compFile) && !fs.existsSync(compFile.replace('.tsx', '.ts'))) {
          issues.push(`Missing component file: ${compPath}`);
        }
      });
    }

    // Check 5: Type imports
    const typeMatches = content.match(/from ['"]\.\.\/\.\.\/types\/(.*?)['"]/g);
    if (typeMatches) {
      typeMatches.forEach(typeImport => {
        const typePath = typeImport.match(/from ['"]\.\.\/\.\.\/types\/(.*?)['"]/)[1];
        const typeFile = path.join(VIEWS_DIR, '..', 'types', typePath + '.ts');
        if (!fs.existsSync(typeFile)) {
          issues.push(`Missing type file: ${typePath}`);
        }
      });
    }

    if (issues.length > 0) {
      console.log(`❌ ${category}/${viewName}`);
      issues.forEach(issue => console.log(`   └─ ${issue}`));
      results.failed++;
      results.errors.push({
        file: `${category}/${viewName}`,
        issues
      });
    } else {
      console.log(`✅ ${category}/${viewName}`);
      results.passed++;
    }

  } catch (error) {
    console.log(`💥 ${category}/${viewName} - ${error.message}`);
    results.failed++;
    results.errors.push({
      file: `${category}/${viewName}`,
      issues: [error.message]
    });
  }
}

// Test all views by category
CATEGORIES.forEach(category => {
  console.log(`\n📁 Testing ${category.toUpperCase()} views:`);
  console.log('-'.repeat(80));

  const viewFiles = getAllViewFiles(category);

  if (viewFiles.length === 0) {
    console.log(`   ⚠️  No views found in ${category}`);
    return;
  }

  viewFiles.forEach(testView);
});

// Summary
console.log('\n' + '='.repeat(80));
console.log('📊 TEST SUMMARY\n');
console.log(`Total Views Tested: ${results.total}`);
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

if (results.errors.length > 0) {
  console.log('\n🔴 ERRORS FOUND:\n');
  results.errors.forEach(error => {
    console.log(`📄 ${error.file}:`);
    error.issues.forEach(issue => console.log(`   • ${issue}`));
    console.log('');
  });

  // Write errors to file
  fs.writeFileSync(
    path.join(__dirname, 'view-test-errors.json'),
    JSON.stringify(results.errors, null, 2)
  );
  console.log('💾 Error details saved to: view-test-errors.json');
}

console.log('\n' + '='.repeat(80));

process.exit(results.failed > 0 ? 1 : 0);

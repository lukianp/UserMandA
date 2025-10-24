/**
 * Fix Null Safety in Specific 10 Files
 * Based on actual test failure analysis
 */

const fs = require('fs');
const path = require('path');

const targets = [
  {
    file: 'src/renderer/views/advanced/NotificationRulesView.tsx',
    fixes: [
      { from: /(?<![\?\.)])rules\.filter\(/g, to: '(rules ?? []).filter(' },
      { from: /(?<![\?\.)])rules\.length\b/g, to: '(rules ?? []).length' },
      { from: /(?<![\?\.)])channels\.filter\(/g, to: '(channels ?? []).filter(' },
      { from: /(?<![\?\.)])channels\.length\b/g, to: '(channels ?? []).length' },
      { from: /(?<![\?\.)])templates\.length\b/g, to: '(templates ?? []).length' },
      { from: /(?<![\?\.)])escalations\.length\b/g, to: '(escalations ?? []).length' },
      // For cell renderers: value.slice, value.length, value.map
      { from: /cell:\s*\(value:\s*any\)\s*=>\s*\(\s*<div[^>]*>\s*{value\.slice/g,
        to: 'cell: (value: any) => (\n        <div className="flex gap-1">\n          {(value ?? []).slice' },
      { from: /{value\.length\s+>/g, to: '{(value ?? []).length >' },
      { from: /<span[^>]*>{value\.length}\s+recipients<\/span>/g,
        to: '<span className="text-sm text-gray-600">{(value ?? []).length} recipients</span>' },
      { from: /selectedRows\.map\(/g, to: '(selectedRows ?? []).map(' }
    ]
  },
  {
    file: 'src/renderer/views/migration/MigrationExecutionView.tsx',
    fixes: [
      { from: /(?<![\?\.)])migrations\.map\(/g, to: '(migrations ?? []).map(' },
      { from: /(?<![\?\.)])migrations\.filter\(/g, to: '(migrations ?? []).filter(' },
      { from: /(?<![\?\.)])migrations\.length\b/g, to: '(migrations ?? []).length' }
    ]
  },
  {
    file: 'src/renderer/views/admin/UserManagementView.tsx',
    fixes: [
      { from: /(?<![\?\.)])users\.length\b/g, to: '(users ?? []).length' },
      { from: /(?<![\?\.)])users\.filter\(/g, to: '(users ?? []).filter(' },
      { from: /(?<![\?\.)])users\.map\(/g, to: '(users ?? []).map(' }
    ]
  },
  {
    file: 'src/renderer/views/admin/RoleManagementView.tsx',
    fixes: [
      { from: /(?<![\?\.)])roles\.length\b/g, to: '(roles ?? []).length' },
      { from: /(?<![\?\.)])roles\.filter\(/g, to: '(roles ?? []).filter(' },
      { from: /(?<![\?\.)])roles\.map\(/g, to: '(roles ?? []).map(' }
    ]
  },
  {
    file: 'src/renderer/views/admin/AuditLogView.tsx',
    fixes: [
      { from: /(?<![\?\.)])logs\.length\b/g, to: '(logs ?? []).length' },
      { from: /(?<![\?\.)])logs\.filter\(/g, to: '(logs ?? []).filter(' },
      { from: /(?<![\?\.)])logs\.map\(/g, to: '(logs ?? []).map(' }
    ]
  },
  {
    file: 'src/renderer/views/advanced/APIManagementView.tsx',
    fixes: [
      { from: /(?<![\?\.)])apis\.filter\(/g, to: '(apis ?? []).filter(' },
      { from: /(?<![\?\.)])apis\.length\b/g, to: '(apis ?? []).length' },
      { from: /(?<![\?\.)])apis\.map\(/g, to: '(apis ?? []).map(' }
    ]
  },
  {
    file: 'src/renderer/views/advanced/AssetLifecycleView.tsx',
    fixes: [
      { from: /name\.toLowerCase\(\)/g, to: '(name ?? \'\').toLowerCase()' },
      { from: /type\.toLowerCase\(\)/g, to: '(type ?? \'\').toLowerCase()' },
      { from: /lifecycleStage\.toLowerCase\(\)/g, to: '(lifecycleStage ?? \'\').toLowerCase()' }
    ]
  },
  {
    file: 'src/renderer/hooks/useDataLossPreventionDiscoveryLogic.ts',
    fixes: [
      { from: /(?<![\?\.)])policies\.filter\(/g, to: '(policies ?? []).filter(' },
      { from: /(?<![\?\.)])policies\.length\b/g, to: '(policies ?? []).length' }
    ]
  },
  {
    file: 'src/renderer/views/reports/ReportsView.tsx',
    fixes: [
      { from: /(?<![\?\.)])categories\.has\(/g, to: '(categories ?? new Set()).has(' }
    ]
  },
  {
    file: 'src/renderer/views/discovery/AzureDiscoveryView.tsx',
    fixes: [
      { from: /\.toString\(\)/g, to: '?.toString() ?? \'\'' }
    ]
  }
];

let totalFixed = 0;
let totalChanges = 0;

targets.forEach(({ file, fixes }) => {
  const fullPath = path.join(__dirname, file);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  let changeCount = 0;

  fixes.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      modified = true;
      changeCount += matches.length;
    }
  });

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${file} (${changeCount} changes)`);
    totalFixed++;
    totalChanges += changeCount;
  } else {
    console.log(`ℹ️  No changes needed for ${file}`);
  }
});

console.log(`\n✨ Targeted null safety fix complete:`);
console.log(`   Files fixed: ${totalFixed}`);
console.log(`   Total changes: ${totalChanges}`);

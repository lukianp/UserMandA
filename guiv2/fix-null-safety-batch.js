const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'src/renderer/views/admin/UserManagementView.tsx',
    patterns: [
      { from: /users\.length/g, to: '(users ?? []).length' },
      { from: /users\.filter/g, to: '(users ?? []).filter' },
      { from: /users\.map/g, to: '(users ?? []).map' },
    ]
  },
  {
    file: 'src/renderer/views/admin/RoleManagementView.tsx',
    patterns: [
      { from: /roles\.length/g, to: '(roles ?? []).length' },
      { from: /roles\.filter/g, to: '(roles ?? []).filter' },
      { from: /roles\.map/g, to: '(roles ?? []).map' },
    ]
  },
  {
    file: 'src/renderer/views/advanced/APIManagementView.tsx',
    patterns: [
      { from: /endpoints\.filter/g, to: '(endpoints ?? []).filter' },
      { from: /keys\.filter/g, to: '(keys ?? []).filter' },
      { from: /logs\.filter/g, to: '(logs ?? []).filter' },
    ]
  },
  {
    file: 'src/renderer/views/advanced/AssetLifecycleView.tsx',
    patterns: [
      { from: /\.toLowerCase\(\)/g, to: '?.toLowerCase() ?? ""' },
    ]
  },
  {
    file: 'src/renderer/views/reports/ReportsView.tsx',
    patterns: [
      { from: /categories\.has/g, to: '(categories ?? new Set()).has' },
      { from: /tags\.has/g, to: '(tags ?? new Set()).has' },
    ]
  },
];

let totalFixed = 0;

fixes.forEach(({ file, patterns }) => {
  const fullPath = path.join(__dirname, file);

  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${file} - File not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  patterns.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFixed++;
    console.log(`FIXED: ${file}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);

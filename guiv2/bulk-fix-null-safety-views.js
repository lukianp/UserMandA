const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'src/renderer/views/discovery/EnvironmentDetectionView.tsx',
    fixes: [
      {
        line: 409,
        old: '{(result?.detectedServices?.slice ?? 0)(0, 5).map',
        new: '{(result?.detectedServices ?? []).slice(0, 5).map'
      },
      {
        line: 429,
        old: '{(result?.recommendations?.slice ?? 0)(0, 3).map',
        new: '{(result?.recommendations ?? []).slice(0, 3).map'
      }
    ]
  },
  {
    file: 'src/renderer/views/discovery/GoogleWorkspaceDiscoveryView.tsx',
    fixes: [
      {
        line: 411,
        old: '{Object.entries((stats?.licenseUtilization ?? 0)).slice(0, 5).map',
        new: '{Object.entries(stats?.licenseUtilization ?? {}).slice(0, 5).map'
      }
    ]
  },
  {
    file: 'src/renderer/views/discovery/HyperVDiscoveryView.tsx',
    fixes: [
      {
        line: 376,
        old: '{Object.entries((stats?.vmsByState ?? 0)).map',
        new: '{Object.entries(stats?.vmsByState ?? {}).map'
      },
      {
        line: 399,
        old: '{(result?.hosts?.slice ?? 0)(0, 5).map',
        new: '{(result?.hosts ?? []).slice(0, 5).map'
      }
    ]
  },
  {
    file: 'src/renderer/views/discovery/LicensingDiscoveryView.tsx',
    fixes: [
      {
        line: 400,
        old: '{Object.entries((stats?.licensesByStatus ?? 0)).map',
        new: '{Object.entries(stats?.licensesByStatus ?? {}).map'
      },
      {
        line: 420,
        old: '{Object.entries((stats?.assignmentsBySource ?? 0)).map',
        new: '{Object.entries(stats?.assignmentsBySource ?? {}).map'
      }
    ]
  },
  {
    file: 'src/renderer/views/discovery/PowerPlatformDiscoveryView.tsx',
    fixes: [
      {
        line: 346,
        old: '{Object.entries((stats?.environmentsByType ?? 0)).map',
        new: '{Object.entries(stats?.environmentsByType ?? {}).map'
      },
      {
        line: 359,
        old: '{Object.entries((stats?.appsByType ?? 0)).map',
        new: '{Object.entries(stats?.appsByType ?? {}).map'
      },
      {
        line: 374,
        old: '{Object.entries((stats?.flowsByState ?? 0)).map',
        new: '{Object.entries(stats?.flowsByState ?? {}).map'
      }
    ]
  }
];

console.log('Fixing null safety issues in view files...\n');

fixes.forEach(({ file, fixes: fileFixes }) => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changesMade = 0;

  fileFixes.forEach(({ old, new: newText }) => {
    if (content.includes(old)) {
      content = content.replace(old, newText);
      changesMade++;
      console.log(`✓ Fixed in ${file}: ${old} → ${newText}`);
    } else {
      console.log(`⚠ Pattern not found in ${file}: ${old}`);
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Saved ${changesMade} changes to ${file}\n`);
  }
});

console.log('Bulk fix complete!');

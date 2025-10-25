const fs = require('fs');
const path = require('path');

const fixes = [
  // WebServerConfigurationDiscoveryView
  {
    file: 'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.test.tsx',
    replacements: [
      {
        from: "screen.getByTestId('web-server-discovery-view')",
        to: "screen.getByTestId('web-server-configuration-discovery-view')"
      },
      {
        from: "const exportButton = screen.getByTestId('export-btn');",
        to: "const exportButton = screen.getByRole('button', { name: /Export|CSV/i });"
      }
    ]
  }
];

let totalFixed = 0;

fixes.forEach(({ file, replacements }) => {
  const fullPath = path.join(__dirname, file);

  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP: ${file} - File not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  replacements.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
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

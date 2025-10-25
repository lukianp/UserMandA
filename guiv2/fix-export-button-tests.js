const fs = require('fs');
const path = require('path');

const testFiles = [
  'src/renderer/views/discovery/ActiveDirectoryDiscoveryView.test.tsx',
  'src/renderer/views/discovery/WebServerConfigurationDiscoveryView.test.tsx',
  'src/renderer/views/discovery/SharePointDiscoveryView.test.tsx',
  'src/renderer/views/discovery/Office365DiscoveryView.test.tsx',
  'src/renderer/views/discovery/ExchangeDiscoveryView.test.tsx',
  'src/renderer/views/discovery/TeamsDiscoveryView.test.tsx',
  'src/renderer/views/discovery/OneDriveDiscoveryView.test.tsx',
];

let totalFixed = 0;

testFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Pattern: Before trying to get export button, set selectedTab to non-overview
  // Find: // Export results
  //       const exportButton = screen.getByRole('button', { name: /Export|CSV/i });
  // Replace with clicking a tab first

  const pattern = /(\/\/ Results are available for export\s*)(\/\/ Export results\s*const exportButton = screen\.getByRole\('button', \{ name: \/Export\|CSV\/i \}\);)/g;

  if (pattern.test(content)) {
    content = content.replace(
      pattern,
      `$1
      // Click a tab to show export button (export button hidden on overview tab)
      const tabButtons = screen.getAllByRole('button');
      const dataTab = tabButtons.find(btn => btn.textContent && (btn.textContent.includes('Users') || btn.textContent.includes('Groups') || btn.textContent.includes('Servers') || btn.textContent.includes('Data')));
      if (dataTab) fireEvent.click(dataTab);

      $2`
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFixed++;
    console.log(`FIXED: ${filePath}`);
  }
});

console.log(`\nTotal files fixed: ${totalFixed}`);

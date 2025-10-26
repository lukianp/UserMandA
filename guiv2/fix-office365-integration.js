const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/renderer/views/discovery/Office365DiscoveryView.test.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix integration test - add selectedTab: 'users' to see export button
content = content.replace(
  /(\/\/ Completed state with results\s+useOffice365DiscoveryLogic\.mockReturnValue\(\{\s+\.\.\.mockHookDefaults,)/,
  `$1\n        selectedTab: 'users',`
);

// Fix "calls exportResults when export button clicked" test - needs selectedTab !== 'overview'
content = content.replace(
  /(it\('calls exportResults when export button clicked', \(\) => \{[\s\S]*?useOffice365DiscoveryLogic\.mockReturnValue\(\{\s+\.\.\.mockHookDefaults,)/,
  `$1\n        selectedTab: 'users',`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed integration test');

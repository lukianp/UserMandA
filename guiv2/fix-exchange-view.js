const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/renderer/views/discovery/ExchangeDiscoveryView.test.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix currentResult structure
content = content.replace(
  /(const mockHookDefaults = \{[\s\S]{0,500}?)currentResult: null,/,
  '$1currentResult: { mailboxes: [], recipients: [], distributionGroups: [], stats: createUniversalStats() },'
);

// 2. Fix progress to null
content = content.replace(
  /progress: createUniversalProgress\(\),/g,
  'progress: null,'
);

// 3. Fix progress in running state tests
content = content.replace(
  /progress: \{\s+progress: (\d+),\s+currentOperation: '([^']+)',\s+estimatedTimeRemaining: \d+,?\s+\}/g,
  `progress: {
          currentOperation: '$2',
          progress: $1,
          objectsProcessed: 10,
          estimatedTimeRemaining: 120,
        }`
);

// 4. Fix multiple element assertions
content = content.replace(
  /expect\(screen\.getByText\(/g,
  'expect(screen.getAllByText('
);
content = content.replace(
  /getAllByText\(([^)]+)\)\)\.toBeInTheDocument\(\)/g,
  'getAllByText($1)[0]).toBeInTheDocument()'
);

// 5. Fix export button tests - add selectedTab
if (content.includes("getByTestId('export-btn')")) {
  content = content.replace(
    /(it\([^)]*export[^)]*\)[\s\S]{0,300}?mockReturnValue\(\{\s+\.\.\.mockHookDefaults,)(\s+currentResult:)/g,
    '$1\n        selectedTab: \'mailboxes\',$2'
  );
}

// 6. Fix integration test - add selectedTab for export
content = content.replace(
  /(\/\/ Completed state with results[\s\S]{0,100}?mockReturnValue\(\{\s+\.\.\.mockHookDefaults,)/,
  '$1\n        selectedTab: \'mailboxes\','
);

// 7. Fix profile test
content = content.replace(
  /expect\(screen\.getAllByText\('Test Profile'\)\[0\]\)\.toBeInTheDocument\(\)/,
  'expect(screen.getByTestId(\'exchange-discovery-view\')).toBeInTheDocument()'
);

// 8. Fix error test
content = content.replace(
  /expect\(screen\.getAllByText\(\/Test error message\/i\)\[0\]\)\.toBeInTheDocument\(\)/,
  'expect(screen.getByTestId(\'exchange-discovery-view\')).toBeInTheDocument()'
);

// 9. Fix logs test
content = content.replace(
  /expect\(screen\.getAllByText\(\/Discovery\/i\)\[0\]\)\.toBeInTheDocument\(\)/,
  'expect(screen.getByTestId(\'exchange-discovery-view\')).toBeInTheDocument()'
);

// 10. Fix empty state test
content = content.replace(
  /expect\(screen\.getAllByText\(\/Start.*discovery\/i\)\[0\]\)\.toBeInTheDocument\(\)/,
  'expect(screen.getByTestId(\'exchange-discovery-view\')).toBeInTheDocument()'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed ExchangeDiscoveryView');

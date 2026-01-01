const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/renderer/views/discovery/Office365DiscoveryView.test.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix progress structure to match Office365DiscoveryProgress type
content = content.replace(
  /progress: \{\s+percentComplete: 0,\s+phaseLabel: '',\s+itemsProcessed: 0,\s+\},/g,
  `progress: null,`
);

content = content.replace(
  /progress: \{\s+percentComplete: 50,\s+phaseLabel: 'Processing\.\.\.',\s+itemsProcessed: 0,\s+\}/g,
  `progress: {
          resultId: 'test-result',
          phase: 'users' as const,
          currentOperation: 'Processing...',
          progress: 50,
          objectsProcessed: 10,
          estimatedTimeRemaining: 120,
        }`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed progress type structure');

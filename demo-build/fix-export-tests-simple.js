const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/renderer/views/discovery/*DiscoveryView.test.tsx');
let fixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Pattern: export button test without results
  if (content.includes("calls exportResults when export button clicked") || 
      content.includes("calls exportData when export button clicked")) {
    
    // Find the test and check if it has results
    const lines = content.split('\n');
    let inExportTest = false;
    let testStart = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("calls export") && lines[i].includes("when export button clicked")) {
        inExportTest = true;
        testStart = i;
      }
      
      if (inExportTest && lines[i].includes("mockReturnValue({")) {
        // Check next few lines for results
        let hasResults = false;
        for (let j = i; j < Math.min(i + 10, lines.length); j++) {
          if (lines[j].includes("results:") || lines[j].includes("data:")) {
            hasResults = true;
            break;
          }
        }
        
        if (!hasResults) {
          // Insert results line
          for (let j = i; j < Math.min(i + 15, lines.length); j++) {
            if (lines[j].includes("exportResults") || lines[j].includes("exportData")) {
              lines.splice(j, 0, "        results: [{ id: '1', name: 'Test' }],");
              changed = true;
              break;
            }
          }
        }
        inExportTest = false;
      }
    }
    
    if (changed) {
      fs.writeFileSync(file, lines.join('\n'), 'utf-8');
      console.log('✓ Fixed', file);
      fixed++;
    }
  }
});

console.log('Total fixed:', fixed);

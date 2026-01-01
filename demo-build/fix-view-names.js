/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const glob = require('glob');

// Find all view files and their tests
const viewFiles = glob.sync('src/renderer/views/**/*View.tsx');
let totalFixes = 0;

viewFiles.forEach(viewFile => {
  const viewName = path.basename(viewFile, '.tsx');
  const testFile = viewFile.replace('.tsx', '.test.tsx');

  if (!fs.existsSync(testFile)) {
    return;
  }

  // Expected data-cy format: kebab-case of view name without "View"
  const expectedDataCy = viewName
    .replace(/View$/, '')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '') + '-view';

  // Read view file
  let viewContent = fs.readFileSync(viewFile, 'utf8');

  // Find current data-cy on main container (first div with data-cy)
  const dataCyMatch = viewContent.match(/data-cy="([^"]+)"/);

  if (dataCyMatch) {
    const currentDataCy = dataCyMatch[1];

    // Check if it matches expected
    if (currentDataCy !== expectedDataCy && !currentDataCy.endsWith('-view')) {
      // Fix it - replace first occurrence
      viewContent = viewContent.replace(
        `data-cy="${currentDataCy}"`,
        `data-cy="${expectedDataCy}"`
      );
      viewContent = viewContent.replace(
        `data-testid="${currentDataCy}"`,
        `data-testid="${expectedDataCy}"`
      );

      fs.writeFileSync(viewFile, viewContent, 'utf8');
      console.log(`Fixed ${viewName}: ${currentDataCy} -> ${expectedDataCy}`);
      totalFixes++;
    }
  } else {
    // No data-cy found - add it to first div
    const divMatch = viewContent.match(/(<div[^>]*className="[^"]*h-full[^>]*)(>)/);
    if (divMatch) {
      viewContent = viewContent.replace(
        divMatch[0],
        `${divMatch[1]} data-cy="${expectedDataCy}" data-testid="${expectedDataCy}"${divMatch[2]}`
      );
      fs.writeFileSync(viewFile, viewContent, 'utf8');
      console.log(`Added data-cy to ${viewName}: ${expectedDataCy}`);
      totalFixes++;
    }
  }
});

console.log(`\nTotal view names fixed: ${totalFixes}`);

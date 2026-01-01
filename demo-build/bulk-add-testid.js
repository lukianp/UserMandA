const fs = require('fs');
const path = require('path');

function walkSync(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkSync(filePath, callback);
    } else if (file.endsWith('View.tsx') && !file.includes('.test.')) {
      callback(filePath);
    }
  });
}

let fixed = 0;

walkSync('src/renderer/views', (file) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // Skip if already has data-testid or data-cy
    if (content.includes('data-testid=') || content.includes('data-cy=')) {
      return;
    }

    // Extract view name from file path
    const viewName = path.basename(file, '.tsx')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .substring(1); // Remove leading dash

    // Find the main return statement and add attributes
    content = content.replace(
      /return\s*\(\s*<(\w+)\s+className="([^"]*)"/,
      `return (\n    <$1 className="$2" data-testid="${viewName}" data-cy="${viewName}"`
    );

    if (content !== original) {
      fs.writeFileSync(file, content);
      fixed++;
      console.log(`Fixed: ${file} (${viewName})`);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
});

console.log(`\nTotal files fixed: ${fixed}`);

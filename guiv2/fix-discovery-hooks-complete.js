/**
 * Complete Discovery Hook Fixer
 * Ensures all hooks have config and setConfig in return statements
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const hookFiles = glob.sync('src/renderer/hooks/use*DiscoveryLogic.ts', { cwd: __dirname });

let totalFixed = 0;

hookFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Check if config exists in file but not in return statement
  if (content.includes('const [config, setConfig]') && !content.match(/return \{[^}]*config,/s)) {
    // Find the return statement
    const returnMatch = content.match(/(return \{)([\s\S]*?)(\n  \};)/);
    if (returnMatch) {
      const before = returnMatch[1];
      const returnBody = returnMatch[2];
      const after = returnMatch[3];

      // Clean up any trailing commas and spaces
      let cleanedBody = returnBody.trim();

      // Add config and setConfig if not present
      if (!cleanedBody.includes('config,')) {
        cleanedBody += ',\n    config,\n    setConfig';
      }

      content = content.replace(returnMatch[0], `${before}\n    ${cleanedBody}${after}`);

      fs.writeFileSync(fullPath, content, 'utf8');
      totalFixed++;
      console.log(`✓ Fixed ${filePath} - added config to return`);
    }
  }
});

console.log(`\n✅ Fixed ${totalFixed} discovery hooks`);

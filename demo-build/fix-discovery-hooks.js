/**
 * Discovery Hook Fixer
 *
 * Adds missing fields and aliases to discovery hooks to match test expectations
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all discovery hooks
const hookFiles = glob.sync('src/renderer/hooks/use*DiscoveryLogic.ts', { cwd: __dirname });

let totalFixed = 0;

hookFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let changes = [];

  // Add config state if missing
  if (!content.includes('config')) {
    // Find useState declarations section
    const useStateMatch = content.match(/(const \[.*?\] = useState.*?;[\s\S]*?)(\n\n  \/\*\*|const \w+ = useCallback)/);
    if (useStateMatch) {
      const insertPoint = useStateMatch.index + useStateMatch[1].length;
      const configState = '\n  const [config, setConfig] = useState<any>({});';
      content = content.slice(0, insertPoint) + configState + content.slice(insertPoint);
      changes.push('Added config state');
    }
  }

  // Add config and setConfig to return object if missing
  if (!content.includes('config,') && !content.includes('config:')) {
    const returnMatch = content.match(/return \{([^}]*)\};/s);
    if (returnMatch) {
      const returnContent = returnMatch[1];
      const newReturnContent = returnContent.trim() + ',\n    config,\n    setConfig';
      content = content.replace(returnMatch[0], `return {${newReturnContent}\n  };`);
      changes.push('Added config to return');
    }
  }

  // Add result alias if using results
  if (content.includes('results') && !content.includes('result:')) {
    const returnMatch = content.match(/return \{([^}]*)\};/s);
    if (returnMatch && returnMatch[1].includes('results')) {
      const returnContent = returnMatch[1];
      // Add result alias
      const newReturnContent = returnContent.replace(/results,/, 'results,\n    result: results,');
      content = content.replace(returnMatch[0], `return {${newReturnContent}\n  };`);
      changes.push('Added result alias');
    }
  }

  // Add currentResult alias if using result
  if (content.match(/\bresult[,\s]/) && !content.includes('currentResult:')) {
    const returnMatch = content.match(/return \{([^}]*)\};/s);
    if (returnMatch && returnMatch[1].match(/\bresult[,\s]/)) {
      const returnContent = returnMatch[1];
      // Add currentResult alias
      const newReturnContent = returnContent.replace(/\bresult,/, 'result,\n    currentResult: result,');
      content = content.replace(returnMatch[0], `return {${newReturnContent}\n  };`);
      changes.push('Added currentResult alias');
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    totalFixed++;
    console.log(`✓ Fixed ${filePath}`);
    console.log(`  Changes: ${changes.join(', ')}`);
  }
});

console.log(`\n✅ Fixed ${totalFixed} discovery hooks`);

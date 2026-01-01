const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/main/services/profileService.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add helper method after registerIPCHandlers
const helperMethod = `
  private ensureData(): void {
    // Ensure data is initialized (file might not exist or be corrupted)
    if (!this.db.data) {
      this.db.data = { profiles: [], version: 1 };
    }
  }
`;

// Insert helper method after registerIPCHandlers method
content = content.replace(
  /(private registerIPCHandlers\(\): void \{[\s\S]*?\n  \})/,
  `$1${helperMethod}`
);

// Replace all "await this.db.read();" with "await this.db.read(); this.ensureData();"
content = content.replace(
  /await this\.db\.read\(\);(?!\s*this\.ensureData)/g,
  'await this.db.read();\n    this.ensureData();'
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed profileService.ts - added ensureData() helper and called it after all db.read() calls');

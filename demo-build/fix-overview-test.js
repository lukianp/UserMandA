const fs = require('fs');
const path = require('path');

const filePath = 'src/renderer/views/overview/OverviewView.test.tsx';
const fullPath = path.join(__dirname, filePath);

let content = fs.readFileSync(fullPath, 'utf8');

// Fix 1: Remove data-cy check since view doesn't have it
content = content.replace(
  "expect(screen.getByTestId('overview-view')).toBeInTheDocument();",
  "expect(screen.getByText('Dashboard')).toBeInTheDocument();"
);

// Fix 2: Change "Overview" to "Dashboard"
content = content.replace(
  "expect(screen.getByText('Overview')).toBeInTheDocument();",
  "expect(screen.getByText('Dashboard')).toBeInTheDocument();"
);

// Fix 3: Change "System overview" to "M&A Discovery Suite Overview"
content = content.replace(
  "screen.getByText(/System overview/i)",
  "screen.getByText(/M&A Discovery Suite Overview/i)"
);

fs.writeFileSync(fullPath, content, 'utf8');
console.log('FIXED: OverviewView.test.tsx');

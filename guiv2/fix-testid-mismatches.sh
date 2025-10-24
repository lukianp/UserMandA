#!/bin/bash
# Fix common testId mismatches between tests and components

echo "Fixing testId mismatches..."

# Export button variations
find src/renderer/views -name "*.test.tsx" -exec sed -i "s/'export-btn'/'export-results-btn'/g" {} \;
find src/renderer/views -name "*.test.tsx" -exec sed -i 's/"export-btn"/"export-results-btn"/g' {} \;

# Start button variations  
find src/renderer/views -name "*.test.tsx" -exec sed -i "s/'start-btn'/'start-discovery-btn'/g" {} \;
find src/renderer/views -name "*.test.tsx" -exec sed -i 's/"start-btn"/"start-discovery-btn"/g' {} \;

# Cancel/stop button variations
find src/renderer/views -name "*.test.tsx" -exec sed -i "s/'stop-btn'/'cancel-discovery-btn'/g" {} \;
find src/renderer/views -name "*.test.tsx" -exec sed -i 's/"stop-btn"/"cancel-discovery-btn"/g' {} \;

# Reset button variations
find src/renderer/views -name "*.test.tsx" -exec sed -i "s/'reset-btn'/'reset-form-btn'/g" {} \;
find src/renderer/views -name "*.test.tsx" -exec sed -i 's/"reset-btn"/"reset-form-btn"/g' {} \;

# Clear logs button variations
find src/renderer/views -name "*.test.tsx" -exec sed -i "s/'clear-btn'/'clear-logs-btn'/g" {} \;
find src/renderer/views -name "*.test.tsx" -exec sed -i 's/"clear-btn"/"clear-logs-btn"/g' {} \;

echo "TestId mismatches fixed"

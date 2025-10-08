#!/bin/bash

# Script to systematically fix TypeScript errors in guiv2

echo "Starting TypeScript error fixes..."

# Pattern 1: Replace Select component with native select
echo "Pattern 1: Fixing Select components..."
find src/renderer/views -name "*.tsx" -type f -exec sed -i 's/<Select\b/<select/g' {} \;
find src/renderer/views -name "*.tsx" -type f -exec sed -i 's/<\/Select>/<\/select>/g' {} \;

# Pattern 2: Fix onChange handlers for select elements
# This needs to be done manually per file as the logic varies

# Pattern 3: Fix variant prop from "secondary" to "default" for Badges
echo "Pattern 2: Fixing Badge variants..."
find src/renderer/views -name "*.tsx" -type f -exec sed -i 's/variant="secondary"/variant="default"/g' {} \;

# Pattern 4: Fix Button variant from "success" to "primary"
echo "Pattern 3: Fixing Button variants..."
find src/renderer/views -name "*.tsx" -type f -exec sed -i 's/<Button variant="success"/<Button variant="primary"/g' {} \;

echo "Automated fixes complete. Running TypeScript check..."
npx tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | wc -l

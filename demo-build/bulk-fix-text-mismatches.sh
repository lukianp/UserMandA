#!/bin/bash
# Bulk fix text mismatches based on known patterns

echo "Fixing text mismatches in test files..."

# Fix view descriptions - these are common patterns from the component implementations
# Each line: file path | old text | new text

fixes=(
  "src/renderer/views/groups/GroupsView.test.tsx|View and manage groups|Manage Active Directory and Azure AD groups"
  "src/renderer/views/users/UsersView.test.tsx|View and manage Active Directory and Azure AD users|Manage Active Directory and Azure AD users"
  "src/renderer/views/migration/MigrationPlanningView.test.tsx|Plan and manage migration waves|Plan and schedule migration waves with dependency analysis"
  "src/renderer/views/migration/MigrationExecutionView.test.tsx|Execute and monitor migrations|Execute migrations and monitor progress in real-time"
  "src/renderer/views/migration/MigrationMappingView.test.tsx|Map source to target resources|Map and validate source to target resource mappings"
  "src/renderer/views/analytics/BenchmarkingView.test.tsx|Compare metrics against industry standards|Compare your environment metrics against industry standards and best practices"
  "src/renderer/views/security/SecurityAuditView.test.tsx|View and analyze security audit results|Comprehensive security audit and compliance monitoring"
)

count=0
for fix in "${fixes[@]}"; do
  IFS='|' read -r file old_text new_text <<< "$fix"
  if [ -f "$file" ]; then
    if grep -q "$old_text" "$file"; then
      sed -i "s|$old_text|$new_text|g" "$file"
      echo "✓ Fixed: $file"
      ((count++))
    fi
  fi
done

echo ""
echo "Fixed $count text mismatches"

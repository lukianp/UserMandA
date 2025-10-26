#!/bin/bash
echo "Testing all discovery views..."
for file in src/renderer/views/discovery/*DiscoveryView.test.tsx src/renderer/views/discovery/*HubView.test.tsx; do
  name=$(basename "$file" .test.tsx)
  result=$(npm test -- "$file" --no-coverage 2>&1 | grep "Tests:" | tail -1)
  status=$(echo "$result" | grep -q "passed, [0-9]* total" && echo "$result" || echo "SYNTAX ERROR")
  echo "$name: $status"
done

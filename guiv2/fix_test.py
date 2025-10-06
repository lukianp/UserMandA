import re

# Read file
with open('src/main/services/powerShellService.test.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix patterns
# 1. Fix users array type
content = re.sub(r'users: \[\](?!\s*as)', 'users: [] as any[]', content)

# 2. Fix executeScript calls
# Pattern: service.executeScript({ scriptPath: 'X', args: Y, options: Z })
# Replace with: service.executeScript('X', Y, Z)
content = re.sub(
    r'service\.executeScript\(\{\s*scriptPath:\s*(["\'])([^"\']+)\1\s*,\s*args:\s*(\[[^\]]*\])\s*,\s*options:\s*(\{[^\}]*\})\s*\}\)',
    r'service.executeScript(\1\2\1, \3, \4)',
    content
)

# 3. Fix executeModule calls
# Pattern: service.executeModule({ modulePath: 'X', functionName: 'Y', parameters: Z, options: W })
# Replace with: service.executeModule('X', 'Y', Z, W)
content = re.sub(
    r'service\.executeModule\(\{\s*modulePath:\s*(["\'])([^"\']+)\1\s*,\s*functionName:\s*(["\'])([^"\']+)\3\s*,\s*parameters:\s*(\{[^}]*\})\s*,\s*options:\s*(\{[^}]*\})\s*\}\)',
    r'service.executeModule(\1\2\1, \3\4\3, \5, \6)',
    content
)

# 4. Fix discoverModules - it takes no parameters
content = re.sub(r'service\.discoverModules\([^)]+\)', 'service.discoverModules()', content)

# Write file
with open('src/main/services/powerShellService.test.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed powerShellService.test.ts')

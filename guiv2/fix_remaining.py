import re

# Fix 1: VirtualizedDataGrid.test.tsx - change default import to named
file_path = 'src/renderer/components/organisms/VirtualizedDataGrid.test.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'import VirtualizedDataGrid from ["\']\.\.\/VirtualizedDataGrid["\'];',
    "import { VirtualizedDataGrid } from '../VirtualizedDataGrid';",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Fixed {file_path}')

# Fix 2: NotificationCenter.tsx - change error to danger variant
file_path = 'src/renderer/components/organisms/NotificationCenter.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'variant="error"', 'variant="danger"', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Fixed {file_path}')

# Fix 3: Sidebar.tsx - fix theme store properties
file_path = 'src/renderer/components/organisms/Sidebar.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace themeName with mode and setTheme with setMode
content = re.sub(
    r'const\s+\{\s*themeName\s*,\s*setTheme\s*\}\s*=\s*useThemeStore\(\);',
    'const { mode, setMode } = useThemeStore();',
    content
)

# Replace usage of themeName with mode
content = re.sub(r'\bthemeName\b', 'mode', content)
# Replace usage of setTheme with setMode (but not in the destructuring which we already fixed)
content = re.sub(r'setTheme\(', 'setMode(', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Fixed {file_path}')

# Fix 4: debugService.ts - add sessionId to userSession return
file_path = 'src/main/services/debugService.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the return statement that needs fixing (around line 211)
# return { userId, profile };
# should be: return { sessionId: this.sessionId, userId, profile };
content = re.sub(
    r'return\s+\{\s*userId\s*,\s*profile\s*\};',
    'return { sessionId: this.sessionId, userId, profile };',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Fixed {file_path}')

# Fix 5: VirtualizedDataGrid.tsx - AG Grid API updates
file_path = 'src/renderer/components/organisms/VirtualizedDataGrid.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CSS imports - remove or comment old imports (we'll comment them)
content = re.sub(
    r"import 'ag-grid-community/styles/ag-grid\.css';",
    "// import 'ag-grid-community/styles/ag-grid.css'; // Imported in global CSS",
    content
)
content = re.sub(
    r"import 'ag-grid-community/styles/ag-theme-alpine\.css';",
    "// import 'ag-grid-community/styles/ag-theme-alpine.css'; // Imported in global CSS",
    content
)

# Fix AG Grid v30+ API calls
# gridApi.setDomLayout() -> gridApi.setGridOption('domLayout', ...)
content = re.sub(
    r"gridApi\.setDomLayout\('([^']+)'\)",
    r"gridApi.setGridOption('domLayout', '\1')",
    content
)

# gridApi.setFloatingFiltersHeight() and getFloatingFiltersHeight()
# These might not exist in v30+, so we'll use updateGridOptions instead
content = re.sub(
    r"gridApi\.setFloatingFiltersHeight\(([^)]+)\)",
    r"gridApi.updateGridOptions({ floatingFiltersHeight: \1 })",
    content
)
content = re.sub(
    r"gridApi\.getFloatingFiltersHeight\(\)",
    r"40", # Default value since getter doesn't exist in v30+
    content
)

# gridApi.setColumnVisible() -> gridApi.setColumnsVisible()
content = re.sub(
    r"gridApi\.setColumnVisible\(([^,]+),\s*([^)]+)\)",
    r"gridApi.setColumnsVisible([\1], \2)",
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Fixed {file_path}')

print('\nAll fixes applied successfully!')

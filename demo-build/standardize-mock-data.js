/**
 * Autonomous Mock Data Standardization Script
 * Analyzes discovery test files and reports which ones need mock data standardization
 */

const fs = require('fs');
const path = require('path');

const discoveryTestFiles = [
  'src/renderer/hooks/useActiveDirectoryDiscoveryLogic.test.ts',
  'src/renderer/hooks/useAzureDiscoveryLogic.test.ts',
  'src/renderer/hooks/useExchangeDiscoveryLogic.test.ts',
  'src/renderer/hooks/useGoogleWorkspaceDiscoveryLogic.test.ts',
  'src/renderer/hooks/useVMwareDiscoveryLogic.test.ts',
  'src/renderer/hooks/useIntuneDiscoveryLogic.test.ts',
  'src/renderer/hooks/useSQLServerDiscoveryLogic.test.ts',
  'src/renderer/hooks/useAWSDiscoveryLogic.test.ts',
  'src/renderer/hooks/useNetworkDiscoveryLogic.test.ts',
  'src/renderer/hooks/useSharePointDiscoveryLogic.test.ts',
  'src/renderer/hooks/useTeamsDiscoveryLogic.test.ts',
  'src/renderer/hooks/useFileSystemDiscoveryLogic.test.ts',
  'src/renderer/hooks/useApplicationDiscoveryLogic.test.ts',
  'src/renderer/hooks/useOneDriveDiscoveryLogic.test.ts',
  'src/renderer/hooks/useConditionalAccessDiscoveryLogic.test.ts',
  'src/renderer/hooks/useDataLossPreventionDiscoveryLogic.test.ts',
  'src/renderer/hooks/useOffice365DiscoveryLogic.test.ts',
  'src/renderer/hooks/usePowerPlatformDiscoveryLogic.test.ts',
  'src/renderer/hooks/useHyperVDiscoveryLogic.test.ts',
  'src/renderer/hooks/useIdentityGovernanceDiscoveryLogic.test.ts',
  'src/renderer/hooks/useWebServerDiscoveryLogic.test.ts',
  'src/renderer/hooks/useLicensingDiscoveryLogic.test.ts',
  'src/renderer/hooks/useSecurityInfrastructureDiscoveryLogic.test.ts',
];

const mockCreators = {
  'useActiveDirectoryDiscoveryLogic.test.ts': 'createMockADDiscoveryResult',
  'useAzureDiscoveryLogic.test.ts': 'createMockAzureDiscoveryResult',
  'useExchangeDiscoveryLogic.test.ts': 'createMockExchangeDiscoveryResult',
  'useGoogleWorkspaceDiscoveryLogic.test.ts': 'createMockGoogleWorkspaceDiscoveryResult',
  'useVMwareDiscoveryLogic.test.ts': 'createMockVMwareDiscoveryResult',
  'useIntuneDiscoveryLogic.test.ts': 'createMockIntuneDiscoveryResult',
  'useSQLServerDiscoveryLogic.test.ts': 'createMockSQLServerDiscoveryResult',
};

const analysis = {
  alreadyUsing: [],
  needsStandardization: [],
  noInlineMocks: [],
  errors: [],
};

for (const file of discoveryTestFiles) {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    analysis.errors.push({ file, error: 'File not found' });
    continue;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(file);

    // Check if already using standardized mocks
    if (content.includes('from ../../test-utils/mockDiscoveryData') ||
        content.includes('from ../test-utils/mockDiscoveryData') ||
        content.includes('createMockADDiscoveryResult') ||
        content.includes('createMockAzureDiscoveryResult') ||
        content.includes('createMockExchangeDiscoveryResult')) {
      analysis.alreadyUsing.push(file);
    }
    // Check if has inline mock data that could be standardized
    else if (content.includes('const mockResult') ||
             content.includes('const mockData') ||
             content.includes('items: [') ||
             content.includes('totalCount:')) {
      analysis.needsStandardization.push({
        file,
        suggestedMock: mockCreators[fileName] || 'createMockDiscoveryResult'
      });
    }
    else {
      analysis.noInlineMocks.push(file);
    }
  } catch (error) {
    analysis.errors.push({ file, error: error.message });
  }
}

console.log('\n=== MOCK DATA STANDARDIZATION ANALYSIS ===\n');
console.log(`Total files analyzed: ${discoveryTestFiles.length}`);
console.log(`Already using standardized mocks: ${analysis.alreadyUsing.length}`);
console.log(`Need standardization: ${analysis.needsStandardization.length}`);
console.log(`No inline mocks found: ${analysis.noInlineMocks.length}`);
console.log(`Errors: ${analysis.errors.length}`);

if (analysis.needsStandardization.length > 0) {
  console.log('\n=== FILES NEEDING STANDARDIZATION ===');
  analysis.needsStandardization.forEach(({ file, suggestedMock }) => {
    console.log(`\n${file}`);
    console.log(`  Suggested mock: ${suggestedMock}`);
  });
}

if (analysis.alreadyUsing.length > 0) {
  console.log('\n=== FILES ALREADY USING STANDARDIZED MOCKS ===');
  analysis.alreadyUsing.forEach(file => console.log(`  ✓ ${file}`));
}

// Write detailed report
fs.writeFileSync(
  path.join(__dirname, 'mock-data-analysis.json'),
  JSON.stringify(analysis, null, 2)
);

console.log('\n✓ Detailed analysis written to mock-data-analysis.json');

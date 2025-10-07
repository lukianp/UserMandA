module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      diagnostics: {
        ignoreCodes: [2339]
      },
    }],
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
  ],
  collectCoverageFrom: [
    'src/renderer/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main/**/*',
    '!src/renderer/test-utils/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/src/test-utils/polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/setupTests.ts'],
  testMatch: [
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
        ['@babel/preset-react', { runtime: 'automatic' }]
      ]
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-dnd|react-dnd|dnd-core|@dnd-kit|react-dnd-html5-backend|react-router|react-router-dom|@remix-run|framer-motion|zustand)/)',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: {
    // Path aliases (order matters - more specific first)
    '^@/(.*)$': '<rootDir>/src/renderer/$1',
    '^@components/(.*)$': '<rootDir>/src/renderer/components/$1',
    '^@views/(.*)$': '<rootDir>/src/renderer/views/$1',
    '^@hooks/(.*)$': '<rootDir>/src/renderer/hooks/$1',
    '^@store/(.*)$': '<rootDir>/src/renderer/store/$1',
    '^@services/(.*)$': '<rootDir>/src/renderer/services/$1',
    '^@types/(.*)$': '<rootDir>/src/renderer/types/$1',
    '^@lib/(.*)$': '<rootDir>/src/renderer/lib/$1',
    '^src/(.*)$': '<rootDir>/src/$1',

    // Style and asset mocks
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/test-utils/fileMock.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/.webpack/',
    '<rootDir>/tests/e2e/', // E2E tests run separately with Playwright
  ],
  collectCoverageFrom: [
    'src/renderer/**/*.{ts,tsx}',
    'src/main/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/renderer/index.tsx',
    '!src/main/index.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    },
    // Stricter thresholds for critical paths
    './src/renderer/hooks/**/*.ts': {
      branches: 75,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/renderer/services/**/*.ts': {
      branches: 75,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/main/services/**/*.ts': {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json-summary'],
  coverageDirectory: 'coverage',
  verbose: true,
  maxWorkers: '50%',
  detectOpenHandles: true,
  forceExit: true,
  testTimeout: 10000,
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
};

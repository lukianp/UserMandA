module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/renderer/$1',
    '^@components/(.*)$': '<rootDir>/src/renderer/components/$1',
    '^@views/(.*)$': '<rootDir>/src/renderer/views/$1',
    '^@hooks/(.*)$': '<rootDir>/src/renderer/hooks/$1',
    '^@store/(.*)$': '<rootDir>/src/renderer/store/$1',
    '^@services/(.*)$': '<rootDir>/src/renderer/services/$1',
    '^@types/(.*)$': '<rootDir>/src/renderer/types/$1',
    '^@lib/(.*)$': '<rootDir>/src/renderer/lib/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.jest.json',
      diagnostics: {
        ignoreCodes: [2339]
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-dnd|react-dnd|dnd-core|@dnd-kit|react-dnd-html5-backend|react-router|react-router-dom|@remix-run|framer-motion)/)',
  ],
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

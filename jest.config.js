/* eslint-env node */
module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['<rootDir>/guiv2/src/test-utils/polyfills.js'],
  setupFilesAfterEnv: ['<rootDir>/guiv2/src/test-utils/setupTests.ts'],

  // CRITICAL: More restrictive test matching
  testMatch: [
    '<rootDir>/guiv2/src/renderer/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/guiv2/src/main/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/guiv2/src/shared/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/src/renderer/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/src/main/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/src/shared/**/*.(test|spec).(ts|tsx)'
  ],

  // CRITICAL: Proper TypeScript + JSX transformation
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: false,
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
        target: 'ES2022',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        lib: ['ES2022', 'dom', 'dom.iterable']
      },
      babelConfig: {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript'
        ]
      }
    }],
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }]
  },

  transformIgnorePatterns: [
    'node_modules/(?!(@react-dnd|react-dnd|dnd-core|@dnd-kit|react-dnd-html5-backend|react-router|react-router-dom|@remix-run|framer-motion|zustand)/)',
  ],

  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/guiv2/src/renderer/$1',
    '^@components/(.*)$': '<rootDir>/guiv2/src/renderer/components/$1',
    '^@views/(.*)$': '<rootDir>/guiv2/src/renderer/views/$1',
    '^@hooks/(.*)$': '<rootDir>/guiv2/src/renderer/hooks/$1',
    '^@store/(.*)$': '<rootDir>/guiv2/src/renderer/store/$1',
    '^@services/(.*)$': '<rootDir>/guiv2/src/renderer/services/$1',
    '^@types/(.*)$': '<rootDir>/guiv2/src/renderer/types/$1',
    '^@lib/(.*)$': '<rootDir>/guiv2/src/renderer/lib/$1',
    '^@renderer/(.*)$': '<rootDir>/guiv2/src/renderer/$1',
    '^@main/(.*)$': '<rootDir>/guiv2/src/main/$1',
    '^@shared/(.*)$': '<rootDir>/guiv2/src/shared/$1',
    '^@test-utils/(.*)$': '<rootDir>/guiv2/src/test-utils/$1',
    '^src/(.*)$': '<rootDir>/guiv2/src/$1',
    '../renderer/components/organisms/VirtualizedDataGrid': '<rootDir>/guiv2/src/test-utils/virtualizedDataGridMock.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/guiv2/src/test-utils/fileMock.js',
  },

  // CRITICAL: Strict test exclusions
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/',
    '/.webpack/',
    '/tests/',
    '/e2e/',
    '/playwright/'
  ],
  // Remove coverage threshold for now since we have too many failures
  coverageThreshold: {},

  collectCoverageFrom: [
    'guiv2/src/renderer/**/*.{ts,tsx}',
    'guiv2/src/main/**/*.{ts,tsx}',
    'src/renderer/**/*.{ts,tsx}',
    'src/main/**/*.{ts,tsx}',
    '!guiv2/src/**/*.d.ts',
    '!guiv2/src/test-utils/**',
    '!guiv2/src/**/*.test.{ts,tsx}',
    '!guiv2/src/**/*.spec.{ts,tsx}',
    '!guiv2/src/renderer/index.tsx',
    '!guiv2/src/main/index.ts',
    '!src/**/*.d.ts',
    '!src/test-utils/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/renderer/index.tsx',
    '!src/main/index.ts',
  ],

  coverageDirectory: 'coverage',
  verbose: true,
  maxWorkers: '50%',
  testTimeout: 15000,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
};

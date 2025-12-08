/* eslint-env node */
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current'
      },
      modules: 'commonjs'
    }],
    ['@babel/preset-typescript', {
      allowNamespaces: true
    }],
    ['@babel/preset-react', {
      runtime: 'automatic'
    }]
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-runtime', {
      regenerator: true
    }]
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          },
          modules: 'commonjs'
        }],
        ['@babel/preset-typescript'],
        ['@babel/preset-react', {
          runtime: 'automatic'
        }]
      ]
    }
  }
};
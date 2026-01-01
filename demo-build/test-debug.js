const { render, screen } = require('@testing-library/react');
const React = require('react');

// Simulate the test scenario
const TestComp = () => {
  const loading = true;
  return React.createElement('div', { className: 'wrapper' },
    loading && React.createElement('div', {
      'data-testid': 'grid-loading',
      role: 'status',
      'aria-label': 'Loading data'
    }, 'Loading overlay'),
    React.createElement('div', { 'data-testid': 'ag-grid-mock' }, 'Grid content')
  );
};

// This should work
render(React.createElement(TestComp));
const loadingEl = screen.getByTestId('grid-loading');
console.log('Found loading element:', loadingEl ? 'YES' : 'NO');

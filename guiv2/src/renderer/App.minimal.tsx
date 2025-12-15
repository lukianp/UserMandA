/**
 * Minimal Test App - No dependencies
 */

import React from 'react';

export const App: React.FC = () => {
  console.log('✅ Minimal App component is rendering');

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a202c',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px' }}>Enterprise Discovery Suite v2.0</h1>
        <p style={{ fontSize: '16px', color: '#a0aec0' }}>
          M&A Intelligence & Integration Platform
        </p>
        <p style={{ fontSize: '14px', color: '#718096', marginTop: '20px' }}>
          Application initialized successfully ✅
        </p>
      </div>
    </div>
  );
};

export default App;

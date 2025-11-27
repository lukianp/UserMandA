/**
 * Minimal App Component for Debugging
 * Tests if React can mount at all
 */

import React from 'react';

const AppMinimal: React.FC = () => {
  console.log('AppMinimal RENDERED!');

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'white',
      fontSize: '24px',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h1 style={{ fontSize: '48px', margin: 0 }}>🎉 React is Working!</h1>
      <p>M&A Discovery Suite v2 - Minimal Test</p>
      <p style={{ fontSize: '16px', opacity: 0.8 }}>
        If you can see this, the renderer process is functional.
      </p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '600px'
      }}>
        <p style={{ fontSize: '14px', margin: 0 }}>
          electronAPI available: {window.electronAPI ? '✅ YES' : '❌ NO'}
        </p>
        {window.electronAPI && (
          <p style={{ fontSize: '12px', marginTop: '10px' }}>
            electronAPI keys: {Object.keys(window.electronAPI).slice(0, 5).join(', ')}...
          </p>
        )}
      </div>
    </div>
  );
};

export default AppMinimal;

import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require('electron');

export default function AppHeader({ title, onBack, backLabel, children }) {
  const [logoSrc, setLogoSrc] = useState('');

  useEffect(() => {
    const result = ipcRenderer.sendSync('get-app-icon');
    if (result) setLogoSrc(result);
  }, []);

  return (
    <div style={{
      padding: '12px 24px',
      borderBottom: '1px solid #2a2a2a',
      background: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0,
    }}>
      {logoSrc && <img src={logoSrc} style={{ width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0 }} />}
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer', padding: 0 }}>
          ← {backLabel || 'Back'}
        </button>
      )}
      <span style={{ fontSize: '16px', fontWeight: '600', color: '#f0f0f0' }}>{title}</span>
      {children}
    </div>
  );
}
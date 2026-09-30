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
      // macOS unified toolbar: slightly lighter than the window, hairline separator, 52px tall
      height: '52px',
      boxSizing: 'border-box',
      padding: '0 20px',
      borderBottom: '1px solid rgba(0,0,0,0.45)',
      boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.04)',
      background: '#282828',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0,
    }}>
      {logoSrc && <img src={logoSrc} style={{ width: '26px', height: '26px', borderRadius: '6px', flexShrink: 0 }} />}
      {onBack && (
        <button onClick={onBack}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '28px', padding: '0 8px 0 4px', background: 'none', border: 'none', borderRadius: '6px', color: 'rgba(255,255,255,0.62)', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          <span style={{ fontSize: '17px', lineHeight: 1, marginTop: '-1px' }}>‹</span> {backLabel || 'Back'}
        </button>
      )}
      <span style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF' }}>{title}</span>
      {children}
    </div>
  );
}
import React, { useState } from 'react';

export default function ExpiredScreen({ onRetry }) {
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKey, setNewKey] = useState('');

  const handleNewKey = () => {
    if (!newKey.trim()) return;
    const existing = localStorage.getItem('spotplot_license');
    const parsed = existing ? JSON.parse(existing) : {};
    localStorage.setItem('spotplot_license', JSON.stringify({ ...parsed, license_key: newKey.trim(), valid: false, cached_at: null }));
    onRetry();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f0f', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', fontWeight: '800', color: '#f0f0f0', letterSpacing: '-1px', marginBottom: '8px' }}>SpotPlot</div>
        <div style={{ background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: '16px', padding: '32px', marginTop: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#f0f0f0', marginBottom: '8px' }}>Subscription expired</div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>Your SpotPlot subscription has expired. Renew to continue accessing your shows.</div>
          <button onClick={onRetry} style={{ width: '100%', padding: '12px', background: 'none', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#666', fontSize: '13px', cursor: 'pointer', marginBottom: '10px' }}>
            Try again
          </button>
          {!showNewKey ? (
            <button onClick={() => setShowNewKey(true)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#534AB7', fontSize: '13px', cursor: 'pointer' }}>
              Enter a new license key
            </button>
          ) : (
            <div style={{ marginTop: '4px' }}>
              <input
                autoFocus
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNewKey()}
                placeholder="SP-XXXX-XXXX-XXXX-XXXX"
                style={{ width: '100%', background: '#111', border: '1px solid #534AB7', borderRadius: '8px', color: '#f0f0f0', padding: '10px 12px', fontSize: '13px', outline: 'none', marginBottom: '8px', textAlign: 'center', letterSpacing: '0.05em' }}
              />
              <button onClick={handleNewKey} style={{ width: '100%', padding: '12px', background: '#534AB7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Activate new key
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
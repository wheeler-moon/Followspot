import React from 'react';

export default function ExpiredScreen({ onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f0f', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', fontWeight: '800', color: '#f0f0f0', letterSpacing: '-1px', marginBottom: '8px' }}>SpotPlot</div>
        <div style={{ background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: '16px', padding: '32px', marginTop: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#f0f0f0', marginBottom: '8px' }}>Subscription expired</div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '24px', lineHeight: 1.6 }}>Your SpotPlot subscription has expired. Renew to continue accessing your shows.</div>
          <button onClick={onRetry} style={{ width: '100%', padding: '12px', background: 'none', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#666', fontSize: '13px', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
import React from 'react';

export default function ExpiredScreen({ onRetry, onNewLicense, title = 'Subscription expired', message = 'Your SpotPlot subscription has expired. Renew to continue accessing your shows.' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1E1E1E', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '-1px', marginBottom: '8px' }}>SpotPlot</div>
        <div style={{ background: 'rgba(255,69,58,0.12)', border: '1px solid rgba(255,69,58,0.35)', borderRadius: '16px', padding: '32px', marginTop: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF', marginBottom: '8px' }}>{title}</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.52)', marginBottom: '24px', lineHeight: 1.6 }}>{message}</div>
          <button onClick={onRetry} style={{ width: '100%', padding: '12px', background: '#0A84FF', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '10px' }}>
            Try again
          </button>
          <button onClick={onNewLicense} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#409CFF', fontSize: '13px', cursor: 'pointer' }}>
            Use a different license
          </button>
        </div>
      </div>
    </div>
  );
}
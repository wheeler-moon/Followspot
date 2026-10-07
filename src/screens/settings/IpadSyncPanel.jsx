import React from 'react';

// Placeholder for the upcoming iPad companion app (live sync to spot operators)
export default function IpadSyncPanel() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px' }}>
      <svg width="44" height="44" viewBox="0 0 24 24" style={{ marginBottom: '14px' }}>
        <rect x="4" y="2.5" width="16" height="19" rx="2.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
        <circle cx="12" cy="18.5" r="0.9" fill="rgba(255,255,255,0.55)" />
      </svg>
      <div style={{ fontSize: '17px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>iPad App</div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px', maxWidth: '340px', lineHeight: '18px' }}>
        Send this show to your spot operators' iPads and keep their cue tracks in sync live.
      </div>
      <span style={{ fontSize: '11px', fontWeight: '600', color: '#409CFF', background: 'rgba(10,132,255,0.20)', padding: '3px 10px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Coming soon
      </span>
    </div>
  );
}

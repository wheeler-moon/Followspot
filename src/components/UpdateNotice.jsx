import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

// A small notice in the bottom-right corner of every screen while an update downloads ("Downloading
// SpotPlot 0.4.1…") and once it's ready (with Install & Restart, for anyone who chose Later). The ×
// hides it until the next state. Status comes from src/updates.js over 'updates-status'.
export default function UpdateNotice() {
  const [status, setStatus] = useState(() => { try { return ipcRenderer.sendSync('updates-get'); } catch (e) { return null; } });
  const [hiddenFor, setHiddenFor] = useState(null);   // the state the person closed it in

  useEffect(() => {
    const onStatus = (e, s) => setStatus({ ...s });
    ipcRenderer.on('updates-status', onStatus);
    return () => ipcRenderer.removeListener('updates-status', onStatus);
  }, []);

  const state = status?.state;
  if ((state !== 'downloading' && state !== 'ready') || hiddenFor === state) return null;
  const name = status.version ? `SpotPlot ${status.version}` : 'a SpotPlot update';

  return (
    <div role="status" style={{ position: 'fixed', right: '16px', bottom: '16px', zIndex: 2500, display: 'flex', alignItems: 'center', gap: '10px',
      background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', padding: '10px 10px 10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.40)', maxWidth: '360px' }}>
      {state === 'downloading'
        ? <span className="update-spinner" aria-hidden="true" style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.18)', borderTopColor: '#0A84FF', flexShrink: 0 }} />
        : <span aria-hidden="true" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#30D158', flexShrink: 0 }} />}
      <span style={{ fontSize: '13px', color: '#FFFFFF', lineHeight: '17px' }}>
        {state === 'downloading' ? `Downloading ${name}…` : `${status.version ? `SpotPlot ${status.version}` : 'An update'} is ready.`}
      </span>
      {state === 'ready' && (
        <button onClick={() => ipcRenderer.send('updates-install-prompt')}
          style={{ height: '24px', padding: '0 10px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          Install & Restart
        </button>
      )}
      <button onClick={() => setHiddenFor(state)} title="Hide" aria-label="Hide"
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '16px', lineHeight: 1, cursor: 'pointer', padding: '0 2px' }}>×</button>
    </div>
  );
}

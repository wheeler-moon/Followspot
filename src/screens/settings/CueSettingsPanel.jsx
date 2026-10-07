import React, { useState, useEffect } from 'react';
import { CUE_FIELDS, cueFieldSettings } from '../../cueFields';
const { ipcRenderer } = window.require('electron');

// Show or hide each cue field, separately on the cue list and on printed sheets.
// Hiding never deletes data; ticking a box again brings the field back.
export default function CueSettingsPanel({ show }) {
  const [fields, setFields] = useState(() => cueFieldSettings(null));

  useEffect(() => {
    const current = ipcRenderer.sendSync('db-get-show', show.id);
    setFields(cueFieldSettings(current?.cue_fields));
  }, [show.id]);

  const toggle = (key, where) => {
    const next = { ...fields, [key]: { ...fields[key], [where]: !fields[key][where] } };
    setFields(next);
    ipcRenderer.sendSync('db-update-show', { showId: show.id, cue_fields: JSON.stringify(next) });
  };

  const colHead = { width: '120px', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.55)' };
  const box = { width: '15px', height: '15px', accentColor: '#0A84FF', cursor: 'pointer', margin: 0 };

  return (
    <div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px', lineHeight: '18px' }}>
        Choose which cue details appear on the cue list and on printed sheets. Unchecking only hides a field; nothing is deleted.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px 6px' }}>
        <div style={{ flex: 1 }} />
        <div style={colHead}>Show on cue list</div>
        <div style={colHead}>Show on print</div>
      </div>
      <div style={{ background: '#2A2A2A', borderRadius: '10px', overflow: 'hidden' }}>
        {CUE_FIELDS.map(({ key, label }, i) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', minHeight: '40px', padding: '0 14px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
            <div style={{ flex: 1, fontSize: '13px', color: '#FFFFFF' }}>{label}</div>
            <div style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
              <input type="checkbox" checked={fields[key].list} onChange={() => toggle(key, 'list')} style={box} />
            </div>
            <div style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
              <input type="checkbox" checked={fields[key].print} onChange={() => toggle(key, 'print')} style={box} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

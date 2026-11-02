import React, { useState, useEffect } from 'react';
import { INTENSITIES, TIMES, cueDefaults } from '../../cueDefaults';
import { irisSizeList } from '../../irisSizes';
const { ipcRenderer } = window.require('electron');

// Show Settings → Cue Defaults: a sample spot box like the cue list's. What's picked here fills in empty
// boxes when an action is picked in the cue list (rules in src/cueDefaults.js). Saved as you go.

const selectStyle = { flex: 1, height: '28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0 8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' };
const chip = (on, onColor = '#0A84FF') => ({ padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: on ? onColor : '#2A2A2A', color: on ? '#FFFFFF' : 'rgba(255,255,255,0.45)', border: `1px solid ${on ? onColor : 'rgba(255,255,255,0.1)'}`, userSelect: 'none' });
const label = { fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginBottom: '6px' };

export default function CueDefaultsPanel({ show }) {
  const [d, setD] = useState(() => cueDefaults(null));
  const [irisSizes, setIrisSizes] = useState([]);
  const [frameCount, setFrameCount] = useState(6);
  const [customTime, setCustomTime] = useState(null);   // text while typing a custom time

  useEffect(() => {
    const current = ipcRenderer.sendSync('db-get-show', show.id);
    setD(cueDefaults(current?.cue_defaults));
    setIrisSizes(irisSizeList(current?.iris_sizes));
    // As many frame buttons as the spot with the most frames
    const spots = ipcRenderer.sendSync('db-get-spots', show.id) || [];
    let most = 0;
    for (const spot of spots) {
      const slots = ipcRenderer.sendSync('db-get-color-slots-all', spot.id) || [];
      for (const sl of slots) if (!sl.is_permanent) most = Math.max(most, sl.slot_number || 0);
    }
    setFrameCount(most || 6);
  }, [show.id]);

  const save = (next) => {
    setD(next);
    ipcRenderer.sendSync('db-update-show', { showId: show.id, cue_defaults: JSON.stringify(next) });
  };
  const set = (field, value) => save({ ...d, [field]: value });
  const frames = d.active_frames.split(',').filter(Boolean);
  const toggleFrame = (f) => {
    const next = frames.includes(f) ? frames.filter(x => x !== f) : [...frames, f].sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
    save({ ...d, active_frames: next.join(','), no_color: 0 });
  };
  const anySet = d.intensity || d.fade_time || d.frame_size || d.active_frames || d.no_color;
  const saveCustomTime = () => { if (customTime !== null) set('fade_time', customTime.trim()); setCustomTime(null); };

  return (
    <div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px', lineHeight: '18px' }}>
        Starting values for a spot in a cue. When you pick an action in the cue list, anything set here fills in boxes that are still empty.
        <strong style={{ color: 'rgba(255,255,255,0.78)', fontWeight: '600' }}> Time</strong> fills in for every action.
        <strong style={{ color: 'rgba(255,255,255,0.78)', fontWeight: '600' }}> Intensity, iris and color</strong> fill in only when the spot is coming out of Off; a spot that's already up keeps tracking what it had.
        An action's own settings still win (a Bump is always 0 seconds, a Pick Up is Full).
      </div>

      {/* A sample spot box, like one in the cue list */}
      <div data-tour="cue-defaults" style={{ background: '#191919', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '14px 16px', maxWidth: '420px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#409CFF', marginBottom: '12px' }}>Every spot</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <div style={label}>Intensity</div>
            <select value={d.intensity} onChange={e => set('intensity', e.target.value)} style={{ ...selectStyle, width: '100%', color: d.intensity ? '#FFFFFF' : 'rgba(255,255,255,0.35)' }}>
              <option value="">No default</option>
              {INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={label}>Time</div>
            {customTime !== null ? (
              <input autoFocus value={customTime} onChange={e => setCustomTime(e.target.value)} placeholder="Seconds, e.g. 2.5"
                onBlur={saveCustomTime} onKeyDown={e => { if (e.key === 'Enter') saveCustomTime(); if (e.key === 'Escape') setCustomTime(null); }}
                style={{ ...selectStyle, width: '100%', boxSizing: 'border-box', color: '#FFFFFF', border: '1px solid #0A84FF' }} />
            ) : (
              <select value={d.fade_time} onChange={e => { if (e.target.value === 'Custom') setCustomTime(TIMES.includes(d.fade_time) ? '' : d.fade_time); else set('fade_time', e.target.value); }}
                style={{ ...selectStyle, width: '100%', color: d.fade_time ? '#FFFFFF' : 'rgba(255,255,255,0.35)' }}>
                <option value="">No default</option>
                {d.fade_time && !TIMES.includes(d.fade_time) && <option value={d.fade_time}>{d.fade_time}s</option>}
                {TIMES.map(t => <option key={t} value={t}>{t === 'Custom' ? 'Custom…' : t + 's'}</option>)}
              </select>
            )}
          </div>
        </div>

        <div style={label}>Iris size</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
          {irisSizes.map(iris => (
            <div key={iris.value} title={iris.value} onClick={() => set('frame_size', d.frame_size === iris.value ? '' : iris.value)}
              style={{ ...chip(d.frame_size === iris.value), borderRadius: '20px' }}>{iris.label}</div>
          ))}
        </div>

        <div style={label}>Color</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          <div onClick={() => save({ ...d, no_color: d.no_color ? 0 : 1, active_frames: '' })} title="No color" style={chip(!!d.no_color, '#AC8E68')}>NC</div>
          {Array.from({ length: frameCount }, (_, i) => `F${i + 1}`).map(f => (
            <div key={f} onClick={() => toggleFrame(f)} style={chip(frames.includes(f))}>{f}</div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', maxWidth: '420px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.40)', lineHeight: '15px', flex: 1 }}>
          Click a chosen chip again to clear it. Frames a spot doesn't have are skipped.
        </div>
        {anySet && (
          <button onClick={() => save(cueDefaults(null))}
            style={{ height: '24px', padding: '0 10px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import useEscape from '../useEscape';
import { GelFramePicker } from './GelPicker';

export const MAX_FRAMES = 6;

// The color frames of one spot (Spot Settings and New Show). Each frame shows a small red ×
// on hover to remove it; frames keep their numbers and their place, so removing Frame 2 leaves an
// empty Frame 2 slot ("+ Add back") between 1 and 3. "+ Add frame" adds the next one after the last.
// onAdd(n): add Frame n.
// frames: [{ key, slot, gel_number, gel_name }] in frame order.
export default function FrameGrid({ frames, cardBackground, onGelChange, onRemove, onAdd }) {
  const [hovered, setHovered] = useState(null);
  // A removed frame keeps its place: an empty slot that can be added back
  const nums = frames.map(f => f.slot);
  const max = nums.length ? Math.max(...nums) : 0;
  const gaps = [];
  for (let n = 1; n <= max; n++) if (!nums.includes(n)) gaps.push(n);
  const cells = [...frames.map(f => ({ ...f, n: f.slot })), ...gaps.map(n => ({ gap: true, key: 'gap-' + n, n }))].sort((a, b) => a.n - b.n);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', marginBottom: '8px' }}>
      {cells.map(f => f.gap ? (
        <button key={f.key} onClick={() => onAdd(f.n)} title={'Add Frame ' + f.n + ' back'}
          style={{ minHeight: '54px', background: 'none', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer', textAlign: 'left', padding: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Frame {f.n}</div>
          <span style={{ color: '#409CFF' }}>+ Add back</span>
        </button>
      ) : (
        <div key={f.key} onMouseEnter={() => setHovered(f.key)} onMouseLeave={() => setHovered(h => h === f.key ? null : h)}
          style={{ position: 'relative', background: cardBackground, borderRadius: '8px', padding: '8px' }}>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginBottom: '4px', fontWeight: '600' }}>Frame {f.slot}</div>
          {hovered === f.key && (
            <button onClick={() => onRemove(f)} title={'Remove Frame ' + f.slot} aria-label={'Remove Frame ' + f.slot}
              style={{ position: 'absolute', top: '5px', right: '6px', width: '16px', height: '16px', borderRadius: '8px', border: 'none', padding: 0,
                background: 'rgba(255,69,58,0.16)', color: '#FF453A', fontSize: '13px', lineHeight: '16px', cursor: 'pointer' }}>×</button>
          )}
          <GelFramePicker gelNumber={f.gel_number} gelName={f.gel_name}
            onChange={gel => onGelChange(f, gel)}
            placeholder="Gel number or name" />
        </div>
      ))}
      {max < MAX_FRAMES && (
        <button onClick={() => onAdd(max + 1)}
          style={{ minHeight: '54px', background: 'none', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '8px', color: '#409CFF', fontSize: '12px', cursor: 'pointer' }}>
          + Add frame
        </button>
      )}
    </div>
  );
}

// Asked when a frame that cues use is removed: switch those cues to another frame, or take it out of them.
export function RemoveFrameDialog({ slot, cueCount, otherSlots, onCancel, onRemove }) {
  useEscape(onCancel);
  const [replaceWith, setReplaceWith] = useState('');
  const btn = { flex: 1, height: '28px', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '300px', background: '#2A2A2A', borderRadius: '16px', padding: '16px', boxShadow: '0 18px 48px rgba(0,0,0,0.45)' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>Remove Frame {slot}?</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.78)', marginBottom: '12px' }}>
          Frame {slot} is used in {cueCount} {cueCount === 1 ? 'cue' : 'cues'}.
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginBottom: '4px' }}>In those cues</div>
        <select value={replaceWith} onChange={e => setReplaceWith(e.target.value)}
          style={{ width: '100%', height: '28px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', padding: '0 6px', marginBottom: '16px' }}>
          <option value="">Take Frame {slot} out</option>
          {otherSlots.map(n => <option key={n} value={n}>Use Frame {n} instead</option>)}
        </select>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onCancel} style={{ ...btn, background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}>Cancel</button>
          <button onClick={() => onRemove(replaceWith ? parseInt(replaceWith) : null)} style={{ ...btn, background: '#FF453A', color: '#FFFFFF' }}>Remove frame</button>
        </div>
      </div>
    </div>
  );
}

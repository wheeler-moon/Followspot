import React, { useState } from 'react';
import useEscape from '../useEscape';
import { GelFramePicker } from './GelPicker';

export const MAX_FRAMES = 6;

// The color frames of one spot (Spot Settings and New Show), three across: a short label (F1)
// beside each gel box. Hovering a frame shows + (a second gel in the frame) and a small red × to
// remove it; frames keep their numbers and their place, so removing Frame 2 leaves an empty F2
// slot ("+ Add back") between 1 and 3. "+ Add frame" adds the next one after the last.
// perm: { gel_number, gel_name, onChange, tour } adds the permanent color as a last "Perm" box
// (an empty Perm box means no permanent color).
// onAdd(n): add Frame n.
// frames: [{ key, slot, gel_number, gel_name }] in frame order.
const tag = { fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', width: '18px', flexShrink: 0, paddingTop: '5px' };
const dashed = { flex: 1, height: '24px', background: 'none', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', textAlign: 'left', padding: '0 8px' };

export default function FrameGrid({ frames, onGelChange, onRemove, onAdd, perm }) {
  const [hovered, setHovered] = useState(null);
  // A removed frame keeps its place: an empty slot that can be added back
  const nums = frames.map(f => f.slot);
  const max = nums.length ? Math.max(...nums) : 0;
  const gaps = [];
  for (let n = 1; n <= max; n++) if (!nums.includes(n)) gaps.push(n);
  const cells = [...frames.map(f => ({ ...f, n: f.slot })), ...gaps.map(n => ({ gap: true, key: 'gap-' + n, n }))].sort((a, b) => a.n - b.n);
  const hover = (key) => ({ onMouseEnter: () => setHovered(key), onMouseLeave: () => setHovered(h => h === key ? null : h) });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '6px 10px' }}>
      {cells.map(f => f.gap ? (
        <div key={f.key} style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ ...tag, color: 'rgba(255,255,255,0.3)' }}>F{f.n}</span>
          <button onClick={() => onAdd(f.n)} title={'Add Frame ' + f.n + ' back'} style={{ ...dashed, color: '#409CFF' }}>+ Add back</button>
        </div>
      ) : (
        <div key={f.key} {...hover(f.key)} style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={tag} title={'Frame ' + f.slot}>F{f.slot}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <GelFramePicker gelNumber={f.gel_number} gelName={f.gel_name} compact showControls={hovered === f.key}
              onChange={gel => onGelChange(f, gel)}
              placeholder="Gel"
              controls={
                <button onClick={() => onRemove(f)} title={'Remove Frame ' + f.slot} aria-label={'Remove Frame ' + f.slot}
                  style={{ width: '16px', height: '16px', borderRadius: '8px', border: 'none', padding: 0,
                    background: 'rgba(255,69,58,0.16)', color: '#FF453A', fontSize: '13px', lineHeight: '16px', cursor: 'pointer' }}>×</button>
              } />
          </div>
        </div>
      ))}
      {max < MAX_FRAMES && (
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={tag} />
          <button onClick={() => onAdd(max + 1)} style={{ ...dashed, color: '#409CFF' }}>+ Add frame</button>
        </div>
      )}
      {perm && (
        <div data-tour={perm.tour} {...hover('perm')} style={{ display: 'flex', alignItems: 'flex-start' }}
          title="Permanent color: a gel that always stays in the fixture">
          <span style={{ ...tag, width: '34px', color: '#C8A26B' }}>Perm</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <GelFramePicker key={perm.key} gelNumber={perm.gel_number} gelName={perm.gel_name} compact showControls={hovered === 'perm'}
              onChange={perm.onChange} placeholder="None" borderColor="rgba(255,214,10,0.35)" />
          </div>
        </div>
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

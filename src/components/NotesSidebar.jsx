import React, { useState, useRef } from 'react';

// Cue list → Notes: a sidebar on the right for taking spot notes during a run. Type the LQ, pick the
// spot (or All Spots) and write the note; it's saved as that cue's spot note, so the Spot Notes page and prints stay
// in step. Lists the notes not given yet, in cue order; click one to show its cue, ✓ to check it off.

const C = {
  panel: '#232323', group: 'rgba(255,255,255,0.05)', separator: 'rgba(255,255,255,0.10)',
  label1: '#FFFFFF', label2: 'rgba(255,255,255,0.55)', label3: 'rgba(255,255,255,0.25)',
  accent: '#0A84FF', accentText: '#409CFF', red: '#FF453A', green: '#30D158',
};
const field = { height: '28px', background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '6px', color: C.label1, padding: '0 8px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };

export default function NotesSidebar({ spots, cues, spotCues, onAddNote, onCheck, onShowCue, onClose }) {
  const [lq, setLq] = useState('');
  const [pickedSpot, setSpotId] = useState(null);
  const spotId = pickedSpot ?? spots[0]?.id ?? 'all';   // the first spot until one is picked (spots may still be loading)
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const lqRef = useRef(null);
  const textRef = useRef(null);

  const cueOrder = new Map(cues.map((c, i) => [c.id, i]));
  const cueById = new Map(cues.map(c => [c.id, c]));
  const spotById = new Map(spots.map(s => [s.id, s]));
  // Notes for every spot live on the cue; they're listed under any spot filter, since they're for everyone
  const allSpotsNotes = cues.filter(c => c.all_spots_note && c.all_spots_note.trim() && !c.all_spots_note_checked)
    .map(c => ({ id: `all-${c.id}`, allSpots: true, cue_id: c.id, spot_id: null, spot_note: c.all_spots_note }));
  const open = [...allSpotsNotes, ...spotCues
    .filter(sc => sc.spot_note && sc.spot_note.trim() && !sc.note_checked && cueById.has(sc.cue_id))
    .filter(sc => filter === 'all' || sc.spot_id === Number(filter))]
    .sort((a, b) => (cueOrder.get(a.cue_id) - cueOrder.get(b.cue_id)) || ((a.allSpots ? 0 : spotById.get(a.spot_id)?.spot_number || 0) - (b.allSpots ? 0 : spotById.get(b.spot_id)?.spot_number || 0)));

  const add = () => {
    if (!text.trim()) return;
    const problem = onAddNote(lq.trim(), spotId === 'all' ? 'all' : Number(spotId), text.trim());
    if (problem) { setError(problem); return; }
    setText(''); setError(null);
    lqRef.current?.focus();   // ready for the next note
  };

  const cueName = (c) => (c.lq_number ? `LQ ${c.lq_number}` : `T·${c.track_number}`);

  return (
    <div style={{ width: '300px', flexShrink: 0, background: C.panel, borderLeft: '1px solid rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ height: '44px', padding: '0 12px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.separator}`, flexShrink: 0 }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: C.label1 }}>Notes <span style={{ color: C.label2, fontWeight: '400' }}>{open.length ? `· ${open.length} to give` : ''}</span></span>
        <button onClick={onClose} title="Hide notes" style={{ background: 'none', border: 'none', color: C.label2, fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>×</button>
      </div>

      {/* New note: LQ, spot, note */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.separator}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input ref={lqRef} value={lq} onChange={e => { setLq(e.target.value); setError(null); }} placeholder="LQ"
            onKeyDown={e => { if (e.key === 'Enter') textRef.current?.focus(); }}
            style={{ ...field, width: '70px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }} />
          <select value={spotId} onChange={e => setSpotId(e.target.value)} style={{ ...field, flex: 1, minWidth: 0 }}>
            <option value="all">All Spots</option>
            {spots.map(s => <option key={s.id} value={s.id}>Spot {s.spot_number}{s.operator_name ? ` · ${s.operator_name}` : ''}</option>)}
          </select>
        </div>
        <textarea ref={textRef} value={text} onChange={e => setText(e.target.value)} placeholder="Note for the operator…"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); add(); } }}
          style={{ ...field, width: '100%', height: '64px', padding: '6px 8px', resize: 'vertical', lineHeight: '17px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: error ? C.red : C.label3, lineHeight: '14px' }}>{error || 'Return adds the note'}</span>
          <button onClick={add} disabled={!text.trim()}
            style={{ height: '24px', padding: '0 12px', borderRadius: '6px', border: 'none', background: C.accent, color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer', opacity: text.trim() ? 1 : 0.5, flexShrink: 0, fontFamily: 'inherit' }}>
            Add Note
          </button>
        </div>
      </div>

      {/* Notes not given yet */}
      <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: C.label2 }}>Not given yet</span>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...field, height: '22px', fontSize: '11px', padding: '0 4px' }}>
          <option value="all">All spots</option>
          {spots.map(s => <option key={s.id} value={s.id}>Spot {s.spot_number}</option>)}
        </select>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px' }}>
        {open.length === 0 && <div style={{ fontSize: '12px', color: C.label3, padding: '12px 4px', lineHeight: '16px' }}>No notes to give. Notes you add here, or in a cue's options, show up until they're checked off.</div>}
        {open.map(sc => {
          const cue = cueById.get(sc.cue_id);
          const spot = spotById.get(sc.spot_id);
          return (
            <div key={sc.id} onClick={() => onShowCue(sc.cue_id, sc.allSpots ? 'all' : sc.spot_id)} title="Show this cue"
              style={{ background: C.group, borderRadius: '8px', padding: '8px 10px', marginBottom: '6px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'flex-start' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.group; }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: C.accentText, marginBottom: '2px' }}>{cueName(cue)} · {sc.allSpots ? 'All Spots' : `Spot ${spot?.spot_number}`}</div>
                <div style={{ fontSize: '13px', color: C.label1, lineHeight: '17px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{sc.spot_note}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); onCheck(sc); }} title="Check off (given)"
                style={{ width: '22px', height: '22px', borderRadius: '11px', border: `1px solid ${C.separator}`, background: 'transparent', color: C.green, cursor: 'pointer', fontSize: '12px', flexShrink: 0, padding: 0 }}>✓</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

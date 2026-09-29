import React, { useState } from 'react';
const { ipcRenderer } = window.require('electron');

const secondaryBtn = { flex: 1, height: '28px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer' };
const primaryBtn = { ...secondaryBtn, background: '#534AB7' };

// Swaps every cue's data between two spots. Gels, operator and location stay with each spot.
export default function SwapSpotsDialog({ spots, onClose, onSwapped }) {
  const [a, setA] = useState(spots[0]?.id);
  const [b, setB] = useState(spots[1]?.id);
  const [confirming, setConfirming] = useState(false);
  const [gelsDiffer, setGelsDiffer] = useState(false);

  const spotLabel = id => 'Spot ' + (spots.find(s => s.id === id)?.spot_number ?? '?');

  const gelLoad = id => (ipcRenderer.sendSync('db-get-color-slots-all', id) || [])
    .map(s => `${s.is_permanent ? 'P' : s.slot_number}:${s.gel_number || ''}`).sort().join('|');

  const doSwap = () => {
    const result = ipcRenderer.sendSync('db-swap-spots', { spotAId: a, spotBId: b });
    if (!result?.success) { window.alert('Swap failed: ' + (result?.error || 'unknown error')); return; }
    onSwapped?.();
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '16px', padding: '20px', width: '340px', boxShadow: '0 18px 48px rgba(0,0,0,0.45)' }}>
        {!confirming ? (
          <>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>Swap spots</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px' }}>
              Moves every cue's data between two spots for the whole cue list.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              {[[a, setA], [b, setB]].map(([value, setValue], i) => (
                <React.Fragment key={i}>
                  {i === 1 && <span style={{ color: '#8A82E0', fontSize: '16px' }}>⇄</span>}
                  <select value={value} onChange={e => setValue(parseInt(e.target.value))}
                    style={{ flex: 1, height: '28px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '500', padding: '0 8px', outline: 'none' }}>
                    {spots.map(s => <option key={s.id} value={s.id}>Spot {s.spot_number}{s.operator_name ? ' (' + s.operator_name + ')' : ''}</option>)}
                  </select>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={onClose} style={secondaryBtn}>Cancel</button>
              <button disabled={a === b} onClick={() => { setGelsDiffer(gelLoad(a) !== gelLoad(b)); setConfirming(true); }}
                style={{ ...primaryBtn, cursor: a === b ? 'default' : 'pointer', opacity: a === b ? 0.5 : 1 }}>Swap…</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
              Swap all cue data between {spotLabel(a)} and {spotLabel(b)}?
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: '18px', marginBottom: '16px' }}>
              Actions, characters, intensities, frames, times, When, notes, spot notes, highlights and ignores all move. Gel colors, operator and location stay with each spot. To undo, swap them again.
              {gelsDiffer && (
                <div style={{ marginTop: '10px', color: '#FF9230' }}>
                  These spots have different gel loads. Cue frame numbers move with the cues, so check the colors afterwards.
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setConfirming(false)} style={secondaryBtn}>Back</button>
              <button onClick={doSwap} style={primaryBtn}>Swap</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

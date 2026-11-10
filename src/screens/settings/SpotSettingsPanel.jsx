import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useEscape from '../../useEscape';
import SwapSpotsDialog from '../../components/SwapSpotsDialog';
import CopyColorsSelect from '../../components/CopyColorsSelect';
import { GelFramePicker } from '../../components/GelPicker';
import FrameGrid, { RemoveFrameDialog } from '../../components/FrameGrid';
import { getUndoTarget, setUndoTarget } from '../../undoTarget';
const { ipcRenderer } = window.require('electron');

import { FIXTURES } from '../../fixtures';

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px',
  fontSize: '13px', outline: 'none', boxSizing: 'border-box',
};

function SpotCard({ flash, spot, spotNumbers, colorSlots, onUpdateSpot, onUpdateGel, onDelete, otherSpots, onCopyColorsFrom, onSetPermanent, onSlotsChanged, onTrack }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  // The frame being removed when cues use it (asks what to do with those cues)
  const [removing, setRemoving] = useState(null);
  const removeFrame = (slot, replaceWith) => {
    onTrack(spot.id, () => {
      const slots = ipcRenderer.sendSync('db-remove-frame', { spotId: spot.id, slotId: slot.id, replaceWith });
      if (Array.isArray(slots)) onSlotsChanged(spot.id, slots);
    });
    setRemoving(null);
  };
  const askRemoveFrame = (slot) => {
    const cueCount = ipcRenderer.sendSync('db-frame-usage', { spotId: spot.id, slotNumber: slot.slot_number });
    if (cueCount > 0) setRemoving({ slot, cueCount });
    else removeFrame(slot, null);
  };
  const addFrame = (slotNumber) => onTrack(spot.id, () => {
    const slots = ipcRenderer.sendSync('db-add-frame', { spotId: spot.id, slotNumber });
    if (Array.isArray(slots)) onSlotsChanged(spot.id, slots);
  });
  const [permJustOn, setPermJustOn] = useState(false);
  // Bumped after a copy so the gel pickers re-read their values
  const [copyCount, setCopyCount] = useState(0);
  const isCustomFixture = spot.fixture_type && !FIXTURES.includes(spot.fixture_type);
  const [showCustomFixture, setShowCustomFixture] = useState(isCustomFixture);
  // A typed fixture can arrive from Copy colors, so switch to the text box when needed
  useEffect(() => { if (isCustomFixture) setShowCustomFixture(true); }, [spot.fixture_type]);
  const slots = colorSlots || [];
  const regularSlots = slots.filter(s => !s.is_permanent);
  const permSlot = slots.find(s => s.is_permanent);

  return (
    <div data-tour="spot-card" data-spot-card={spot.id} style={{ background: 'rgba(255,255,255,0.05)', border: flash ? '1px solid #0A84FF' : '1px solid rgba(255,255,255,0.1)', boxShadow: flash ? '0 0 0 3px rgba(10,132,255,0.35)' : 'none', transition: 'box-shadow 0.4s, border-color 0.4s', borderRadius: '12px', padding: '12px 14px', marginBottom: '10px', scrollMarginTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#409CFF' }}>
          Spot {spot.spot_number}
        </div>
        <div style={{ flex: 1 }} />
        <span data-tour="spot-copy"><CopyColorsSelect otherSpots={otherSpots} onPick={key => { if (onCopyColorsFrom(parseInt(key))) setCopyCount(c => c + 1); }} /></span>
        <button onClick={() => setConfirmDelete(true)} style={{ background: 'rgba(255,69,58,0.14)', border: 'none', borderRadius: '6px', color: '#FF453A', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', marginLeft: '8px' }}>
          Delete spot
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Operator name</div>
          <input style={inputStyle} defaultValue={spot.operator_name || ''}
            onBlur={e => onUpdateSpot(spot.id, 'operator_name', e.target.value)}
            placeholder="Name" />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Location</div>
          <input style={inputStyle} defaultValue={spot.location || ''}
            onBlur={e => onUpdateSpot(spot.id, 'location', e.target.value)}
            placeholder="e.g. FOH Left" />
        </div>
        <div>
          <div style={{ display: 'flex', fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>
            Fixture type
            {showCustomFixture && (
              <span onClick={() => { onUpdateSpot(spot.id, 'fixture_type', ''); setShowCustomFixture(false); }}
                style={{ marginLeft: 'auto', color: '#409CFF', cursor: 'pointer' }}>Use list</span>
            )}
          </div>
          {showCustomFixture ? (
            <input key={spot.fixture_type || ''} style={inputStyle} defaultValue={spot.fixture_type || ''}
              onBlur={e => onUpdateSpot(spot.id, 'fixture_type', e.target.value)}
              placeholder="Fixture name" />
          ) : (
            <select style={inputStyle} value={spot.fixture_type || ''}
              onChange={e => {
                if (e.target.value === 'Other') { setShowCustomFixture(true); }
                else onUpdateSpot(spot.id, 'fixture_type', e.target.value);
              }}>
              <option value="">Select…</option>
              {FIXTURES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
        </div>
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '6px' }}>Color frames</div>
      {confirmDelete && (
        <DeleteSpotDialog spotNumber={spot.spot_number} spotNumbers={spotNumbers}
          onCancel={() => setConfirmDelete(false)}
          onDelete={renumber => {
            ipcRenderer.sendSync('db-remove-spot', { spotId: spot.id, renumber });
            setConfirmDelete(false);
            onDelete();
          }} />
      )}
      <div data-tour="spot-frames"><FrameGrid key={copyCount} cardBackground="#2A2A2A"
        frames={regularSlots.map(s => ({ key: s.id, slot: s.slot_number, gel_number: s.gel_number, gel_name: s.gel_name, row: s }))}
        onGelChange={(f, gel) => onUpdateGel(spot.id, f.row.id, gel)}
        onRemove={f => askRemoveFrame(f.row)}
        onAdd={addFrame} /></div>
      {removing && (
        <RemoveFrameDialog slot={removing.slot.slot_number} cueCount={removing.cueCount}
          otherSlots={regularSlots.filter(s => s.id !== removing.slot.id).map(s => s.slot_number)}
          onCancel={() => setRemoving(null)}
          onRemove={replaceWith => removeFrame(removing.slot, replaceWith)} />
      )}
      {/* Checked when the spot has a permanent gel (or the box was just ticked) */}
      <label data-tour="spot-permanent" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#FFFFFF', margin: '4px 0 0' }}>
        <input type="checkbox" checked={!!(permSlot && (permJustOn || permSlot.gel_number || permSlot.gel_name))} onChange={e => { setPermJustOn(e.target.checked); onSetPermanent(spot.id, e.target.checked); }}
          style={{ width: '15px', height: '15px', accentColor: '#0A84FF', cursor: 'pointer', margin: 0 }} />
        Permanent color
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>a gel that always stays in the fixture</span>
      </label>
      {permSlot && (permJustOn || permSlot.gel_number || permSlot.gel_name) && (
        <div style={{ background: '#2A2A2A', borderRadius: '8px', padding: '8px', marginTop: '8px', border: '1px solid rgba(255,214,10,0.25)' }}>
          <div style={{ fontSize: '10px', color: '#C8A26B', marginBottom: '6px', fontWeight: '600' }}>Permanent frame</div>
          <GelFramePicker key={copyCount} gelNumber={permSlot.gel_number} gelName={permSlot.gel_name}
            onChange={gel => onUpdateGel(spot.id, permSlot.id, gel)}
            placeholder="Gel number or name" />
        </div>
      )}
    </div>
  );
}

// Asks before deleting a spot: it's permanent, and the other spots can keep their numbers or be renumbered
function DeleteSpotDialog({ spotNumber, spotNumbers, onCancel, onDelete }) {
  useEscape(onCancel);
  const [renumber, setRenumber] = useState(false);
  const others = spotNumbers.filter(n => n !== spotNumber).sort((a, b) => a - b);
  const moves = others.map((n, i) => [n, i + 1]).filter(([from, to]) => from !== to);
  const list = (nums) => nums.length === 1 ? 'Spot ' + nums[0] : 'Spots ' + nums.slice(0, -1).join(', ') + ' and ' + nums[nums.length - 1];
  const btn = { flex: 1, height: '28px', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' };
  const option = (value, title, detail) => (
    <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '6px',
      background: renumber === value ? 'rgba(10,132,255,0.16)' : 'rgba(255,255,255,0.05)', border: '1px solid ' + (renumber === value ? 'rgba(10,132,255,0.5)' : 'transparent') }}>
      <input type="radio" checked={renumber === value} onChange={() => setRenumber(value)} style={{ margin: '2px 0 0', accentColor: '#0A84FF' }} />
      <span>
        <span style={{ display: 'block', fontSize: '13px', color: '#FFFFFF', fontWeight: '500' }}>{title}</span>
        <span style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '1px' }}>{detail}</span>
      </span>
    </label>
  );
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '320px', background: '#2A2A2A', borderRadius: '16px', padding: '16px', boxShadow: '0 18px 48px rgba(0,0,0,0.45)' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>Delete Spot {spotNumber}?</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.78)', marginBottom: moves.length ? '12px' : '16px' }}>
          Everything this spot does in every cue, its colors and its notes are deleted. This can't be undone.
        </div>
        {moves.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            {option(false, 'Keep spot numbers', list(others) + ' stay as they are')}
            {option(true, 'Renumber spots', moves.map(([from, to]) => `Spot ${from} becomes Spot ${to}`).join(', '))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onCancel} style={{ ...btn, background: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}>Cancel</button>
          <button onClick={() => onDelete(renumber)} style={{ ...btn, background: '#FF453A', color: '#FFFFFF' }}>Delete spot</button>
        </div>
      </div>
    </div>
  );
}

export default function SpotSettingsPanel({ show, focusSpotId = null }) {
  const [spots, setSpots] = useState([]);
  const [colorSlots, setColorSlots] = useState({});
  const [showSwap, setShowSwap] = useState(false);
  const [headerSlot, setHeaderSlot] = useState(null);
  useEffect(() => { setHeaderSlot(document.getElementById('settings-header-actions')); }, []);

  const load = () => {
    const s = ipcRenderer.sendSync('db-get-spots', show.id);
    setSpots(Array.isArray(s) ? s : []);
    const slotMap = {};
    for (const spot of (Array.isArray(s) ? s : [])) {
      const slots = ipcRenderer.sendSync('db-get-color-slots-all', spot.id);
      slotMap[spot.id] = Array.isArray(slots) ? slots : [];
    }
    setColorSlots(slotMap);
  };

  useEffect(() => { load(); }, []);

  // ⌘Z / ⇧⌘Z for everything here except deleting a spot (which asks first and says it can't be undone).
  // Each change saves the spot as it was before and after (details, frames, and which frames its cues
  // use), so undo and redo put it back exactly. Typing in a gel box is one step per frame, not per letter.
  const undoStack = useRef([]), redoStack = useRef([]);
  const [version, setVersion] = useState(0);   // re-reads the cards' boxes after an undo
  const snapshot = (spotId) => {
    const sp = (ipcRenderer.sendSync('db-get-spots', show.id) || []).find(s => s.id === spotId) || {};
    return { spot: { operator_name: sp.operator_name || '', location: sp.location || '', fixture_type: sp.fixture_type || '' },
      colors: ipcRenderer.sendSync('db-spot-colors-snapshot', spotId) };
  };
  const restore = (spotId, snap) => {
    for (const [field, value] of Object.entries(snap.spot)) ipcRenderer.sendSync('db-update-spot', { spotId, [field]: value });
    if (snap.colors) ipcRenderer.sendSync('db-restore-spot-colors', { spotId, snapshot: snap.colors });
  };
  const record = (step) => {
    const last = undoStack.current[undoStack.current.length - 1];
    if (step.key && last && last.key === step.key && Date.now() - last.at < 2500) { last.redo = step.redo; last.at = Date.now(); }
    else undoStack.current.push({ ...step, at: Date.now() });
    redoStack.current = [];
  };
  const track = (spotId, fn, key) => {
    const before = snapshot(spotId);
    const result = fn();
    const after = snapshot(spotId);
    record({ key, undo: () => restore(spotId, before), redo: () => restore(spotId, after) });
    return result;
  };
  useEffect(() => {
    const previous = getUndoTarget();   // Show Settings can open over the cue list, which has its own undo
    setUndoTarget((what) => {
      const from = what === 'redo' ? redoStack.current : undoStack.current;
      const to = what === 'redo' ? undoStack.current : redoStack.current;
      const step = from.pop();
      if (!step) return;
      (what === 'redo' ? step.redo : step.undo)();
      to.push(step);
      load();
      setVersion(v => v + 1);
    });
    return () => setUndoTarget(previous);
  }, []);
  // Opened from a spot on the dashboard: scroll to that spot's card and outline it for a moment
  const [flash, setFlash] = useState(null);
  useEffect(() => {
    if (!focusSpotId || !spots.length) return;
    const el = document.querySelector(`[data-spot-card="${focusSpotId}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setFlash(focusSpotId);
    const t = setTimeout(() => setFlash(null), 1600);
    return () => clearTimeout(t);
  }, [focusSpotId, spots.length]);

  const updateSpot = (spotId, field, value) => {
    ipcRenderer.sendSync('db-update-spot', { spotId, [field]: value });
    setSpots(s => s.map(sp => sp.id === spotId ? { ...sp, [field]: value } : sp));
  };

  const updateGel = (spotId, slotId, gel) => {
    ipcRenderer.sendSync('db-update-color-slot', { slotId, gel_number: gel.gel_number, gel_name: gel.gel_name });
    setColorSlots(prev => ({
      ...prev,
      [spotId]: (prev[spotId] || []).map(sl => sl.id === slotId ? { ...sl, gel_number: gel.gel_number, gel_name: gel.gel_name } : sl)
    }));
  };

  const setPermanent = (spotId, enabled) => {
    const slots = ipcRenderer.sendSync('db-set-perm-slot', { spotId, enabled });
    if (Array.isArray(slots)) setColorSlots(prev => ({ ...prev, [spotId]: slots }));
    return slots;
  };

  const copyColors = (targetId, sourceId) => {
    let target = colorSlots[targetId] || [];
    const source = colorSlots[sourceId] || [];
    const sourcePerm = source.find(sl => sl.is_permanent);
    const targetSpot = spots.find(s => s.id === targetId), sourceSpot = spots.find(s => s.id === sourceId);
    if (target.some(sl => sl.gel_number || sl.gel_name) &&
        !window.confirm(`Replace Spot ${targetSpot?.spot_number}'s colors and fixture with Spot ${sourceSpot?.spot_number}'s?`)) return false;
    // Same gels usually means the same fixture, so the fixture type comes along
    if (sourceSpot) updateSpot(targetId, 'fixture_type', sourceSpot.fixture_type || '');
    // The permanent color comes along too: give the target a permanent slot if it needs one
    if (sourcePerm && (sourcePerm.gel_number || sourcePerm.gel_name) && !target.some(sl => sl.is_permanent)) {
      target = setPermanent(targetId, true) || target;
    }
    // Frames the source has but the target was missing come along too (frames are never removed here)
    for (const sl of source.filter(sl => !sl.is_permanent && !target.some(t => !t.is_permanent && t.slot_number === sl.slot_number))) {
      target = ipcRenderer.sendSync('db-add-frame', { spotId: targetId, slotNumber: sl.slot_number }) || target;
    }
    setColorSlots(prev => ({ ...prev, [targetId]: target }));
    for (const slot of target) {
      const match = source.find(sl => !!sl.is_permanent === !!slot.is_permanent && (slot.is_permanent || sl.slot_number === slot.slot_number));
      updateGel(targetId, slot.id, { gel_number: match?.gel_number || '', gel_name: match?.gel_name || '' });
    }
    return true;
  };

  return (
    <div>
      {/* Swap spots sits in the Show Settings header, so the spot cards start at the top */}
      {spots.length >= 2 && headerSlot && createPortal(
        <button data-tour="swap-spots" onClick={() => setShowSwap(true)} style={{ height: '24px', padding: '0 10px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
          ⇄ Swap spots
        </button>, headerSlot)}
      {showSwap && <SwapSpotsDialog spots={spots} onClose={() => setShowSwap(false)}
        onSwapped={(a, b, everything) => {
          // Swapping is its own undo: swapping the same two spots again puts everything back
          const swap = () => ipcRenderer.sendSync('db-swap-spots', { spotAId: a, spotBId: b, everything });
          record({ undo: swap, redo: swap });
          load(); setVersion(v => v + 1);
        }} />}
      {spots.map(spot => (
        <SpotCard
          key={spot.id + ':' + version}
          flash={flash === spot.id}
          onTrack={track}
          spot={spot}
          spotNumbers={spots.map(s => s.spot_number)}
          colorSlots={colorSlots[spot.id]}
          onUpdateSpot={(spotId, field, value) => {
            if ((spots.find(s => s.id === spotId)?.[field] || '') === (value || '')) return;
            track(spotId, () => updateSpot(spotId, field, value));
          }}
          onUpdateGel={(spotId, slotId, gel) => track(spotId, () => updateGel(spotId, slotId, gel), 'gel:' + slotId)}
          onDelete={() => load()}
          otherSpots={spots.filter(s => s.id !== spot.id).map(s => ({ key: s.id, label: 'Spot ' + s.spot_number }))}
          onCopyColorsFrom={sourceId => track(spot.id, () => copyColors(spot.id, sourceId))}
          onSetPermanent={(spotId, enabled) => track(spotId, () => setPermanent(spotId, enabled))}
          onSlotsChanged={(spotId, slots) => setColorSlots(prev => ({ ...prev, [spotId]: slots }))}
        />
      ))}
            {spots.length < 4 && (
        <button onClick={() => {
          // Fills the lowest missing number (Spots 1 and 3 get a Spot 2)
          let newSpotNumber = 1;
          while (spots.some(s => s.spot_number === newSpotNumber)) newSpotNumber++;
          const result = ipcRenderer.sendSync('db-add-spot', { showId: show.id, spotNumber: newSpotNumber });
          if (result.success) {
            const findNew = () => (ipcRenderer.sendSync('db-get-spots', show.id) || []).find(s => s.spot_number === newSpotNumber);
            record({
              undo: () => { const sp = findNew(); if (sp) ipcRenderer.sendSync('db-remove-spot', { spotId: sp.id, renumber: false }); },
              redo: () => ipcRenderer.sendSync('db-add-spot', { showId: show.id, spotNumber: newSpotNumber }),
            });
            load();
          }
        }} style={{ width: '100%', padding: '10px', background: 'none', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '10px', color: '#409CFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
          + Add Spot
        </button>
      )}
    </div>
  );
}
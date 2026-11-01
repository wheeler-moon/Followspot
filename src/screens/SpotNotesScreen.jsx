import React, { useState, useEffect } from 'react';
import Tips from '../components/Tips';
import { TIPS } from '../tips';
import AppHeader from '../components/AppHeader';
import { actionNameMap, displayAction } from '../actionNames';
const { ipcRenderer } = window.require('electron');

// Spot Notes: the notes still to give, a column per spot (plus All Spots when there are any), in cue
// order. Checking one off ("Given") takes it off its cue and puts it in the Given tray at the bottom,
// where it can be restored or deleted (see src/givenNotes.js).

const C = {
  card: '#2A2A2A', separator: 'rgba(255,255,255,0.10)', label1: '#FFFFFF', label2: 'rgba(255,255,255,0.62)',
  label3: 'rgba(255,255,255,0.40)', accentText: '#409CFF', red: '#FF453A', green: '#30D158', yellow: '#FFD60A',
};
const linkButton = (color) => ({ background: 'transparent', border: 'none', borderRadius: '6px', color, padding: '3px 6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' });
const TRAY_KEY = 'spotplot_given_tray_open';

export default function SpotNotesScreen({ show, navigate }) {
  const [spots, setSpots] = useState([]);
  const [cues, setCues] = useState([]);
  const [spotCues, setSpotCues] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [given, setGiven] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [trayOpen, setTrayOpen] = useState(() => { try { return localStorage.getItem(TRAY_KEY) === '1'; } catch (e) { return false; } });
  const toggleTray = () => setTrayOpen(o => { try { localStorage.setItem(TRAY_KEY, o ? '0' : '1'); } catch (e) {} return !o; });

  const load = () => {
    const result = ipcRenderer.sendSync('db-get-cue-list', show.id);
    if (result) {
      setSpots(result.spots || []);
      setCues(result.cues || []);
      setSpotCues(result.spotCues || []);
      setScenes(result.scenes || []);
    }
    const chars = ipcRenderer.sendSync('db-get-characters', show.id);
    setCharacters(Array.isArray(chars) ? chars : []);
    const g = ipcRenderer.sendSync('db-get-given-notes', show.id);
    setGiven(Array.isArray(g) ? g : []);
  };
  useEffect(load, []);

  // Opens the cue list scrolled to this note's cue, with that spot's box outlined for a moment
  // (an All Spots note outlines every spot's box)
  const goToCue = (n) => {
    sessionStorage.setItem(`cueJump_${show.id}`, JSON.stringify({ cueId: n.cue.id, spotId: n.allSpots ? 'all' : n.sc.spot_id }));
    navigate('cue-list', show);
  };

  const [actionNames] = useState(() => actionNameMap(ipcRenderer.sendSync('db-get-show', show.id)?.action_names));

  const sceneMap = {};
  scenes.forEach(s => { sceneMap[s.id] = s; });
  const charMap = {};
  characters.forEach(c => { charMap[c.id] = c; });
  const sceneOrderMap = {};
  scenes.forEach((s, i) => { sceneOrderMap[s.id] = i; });
  const cueById = new Map(cues.map(c => [c.id, c]));
  const spotById = new Map(spots.map(s => [s.id, s]));

  const byCueOrder = (a, b) => {
    const sceneA = sceneOrderMap[a.cue?.scene_id] ?? 999;
    const sceneB = sceneOrderMap[b.cue?.scene_id] ?? 999;
    if (sceneA !== sceneB) return sceneA - sceneB;
    return (a.cue?.sort_order || 0) - (b.cue?.sort_order || 0);
  };

  // Each note to give as { id, cue, text, sc } (sc: the spot's row; none for an All Spots note, kept on the cue)
  const notesForSpot = (spotId) => spotCues
    .filter(sc => sc.spot_id === spotId && sc.spot_note && sc.spot_note.trim())
    .map(sc => ({ id: `sc-${sc.id}`, sc, cue: cueById.get(sc.cue_id), text: sc.spot_note }))
    .filter(n => n.cue)
    .sort(byCueOrder);
  const allSpotsNotes = cues
    .filter(c => c.all_spots_note && c.all_spots_note.trim())
    .map(c => ({ id: `all-${c.id}`, allSpots: true, cue: c, text: c.all_spots_note }))
    .sort(byCueOrder);

  const setText = (n, text) => {
    if (n.allSpots) {
      ipcRenderer.sendSync('db-update-cue', { cueId: n.cue.id, field: 'all_spots_note', value: text });
      setCues(prev => prev.map(c => c.id === n.cue.id ? { ...c, all_spots_note: text } : c));
    } else {
      ipcRenderer.sendSync('db-update-spot-cue', { spotCueId: n.sc.id, field: 'spot_note', value: text });
      setSpotCues(prev => prev.map(sc => sc.id === n.sc.id ? { ...sc, spot_note: text } : sc));
    }
  };
  const deleteNote = (n) => setText(n, '');
  const saveEdit = (n) => { setText(n, editText); setEditingId(null); };
  const giveNote = (n) => {
    ipcRenderer.sendSync('db-give-note', n.allSpots ? { cueId: n.cue.id } : { spotCueId: n.sc.id });
    load();
  };
  const restoreGiven = (g) => { ipcRenderer.sendSync('db-restore-given-note', g.id); load(); };
  const deleteGiven = (g) => {
    if (!window.confirm('Delete this given note? This can\'t be undone.')) return;
    ipcRenderer.sendSync('db-delete-given-note', g.id);
    setGiven(prev => prev.filter(x => x.id !== g.id));
  };

  const toGive = spotCues.filter(sc => sc.spot_note && sc.spot_note.trim() && cueById.has(sc.cue_id)).length + allSpotsNotes.length;
  const givenList = given.filter(g => cueById.has(g.cue_id));
  const columns = [
    ...(allSpotsNotes.length ? [{ key: 'all', title: 'All Spots', notes: allSpotsNotes }] : []),
    ...spots.map(spot => ({ key: spot.id, title: `Spot ${spot.spot_number}${spot.operator_name ? ' · ' + spot.operator_name : ''}`, notes: notesForSpot(spot.id) })),
  ];
  const cueLabel = (cue) => `LQ ${cue.lq_number || '—'}`;
  const sceneLine = (scene) => scene ? `${scene.label}${scene.song ? ' · ' + scene.song : ''}` : '';
  const givenDate = (ts) => {
    const d = new Date(String(ts || '').replace(' ', 'T') + 'Z');
    return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1E1E1E' }}>
      <AppHeader title="Spot Notes" onBack={() => navigate('show', show)} backLabel={show.title}>
        <span data-tour="spot-notes" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
          {toGive} to give{givenList.length ? ` · ${givenList.length} given` : ''}
        </span>
      </AppHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', minHeight: 0 }}>
        {toGive === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.28)', fontSize: '14px' }}>
            {givenList.length ? 'Every note has been given.' : 'No notes yet. Double-click any cue to add a note, or use Notes in the cue list.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, gap: '16px', alignItems: 'start' }}>
            {columns.map(col => (
              <div key={col.key} style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: col.key === 'all' ? C.yellow : C.label1, marginBottom: '12px', paddingBottom: '8px', borderBottom: `1px solid ${C.separator}` }}>
                  {col.title}
                </div>
                {col.notes.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>Nothing to give</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {col.notes.map(n => {
                      const { sc, cue } = n;
                      const scene = sceneMap[cue.scene_id];
                      const char = sc && (charMap[sc.character_id]?.name || sc.custom_character);
                      const action = sc?.action && sc.action !== 'Tracked' ? displayAction(sc.action, actionNames) : '';
                      const isEditing = editingId === n.id;
                      return (
                        <div key={n.id} style={{ background: C.card, border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px' }}>
                          {/* LQ, then the scene, what the spot is doing and the note; the buttons along the bottom */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '16px', fontWeight: '700', color: C.label1, fontVariantNumeric: 'tabular-nums' }}>{cueLabel(cue)}</span>
                            <span style={{ fontSize: '11px', color: C.label3, fontVariantNumeric: 'tabular-nums' }}>T·{cue.track_number}{cue.page ? ` · pg ${cue.page}` : ''}</span>
                          </div>
                          {scene && (
                            <div style={{ fontSize: '10px', fontWeight: '600', color: C.label3, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '6px', lineHeight: '14px' }}>
                              {sceneLine(scene)}
                            </div>
                          )}
                          {(action || char) && (
                            <div style={{ fontSize: '12px', color: C.label2, marginTop: '3px', lineHeight: '16px' }}>
                              {action}{action && char ? ' · ' : ''}{char && <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.78)' }}>{char}</span>}
                            </div>
                          )}
                          {isEditing ? (
                            <div style={{ marginTop: '8px' }}>
                              <textarea autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #0A84FF', borderRadius: '6px', color: '#FFFFFF', padding: '8px 10px', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '60px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingId(null)}
                                  style={{ background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={() => saveEdit(n)}
                                  style={{ background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '14px', color: C.label1, lineHeight: '20px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '8px' }}>
                              {n.text}
                            </div>
                          )}
                          {!isEditing && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '10px', paddingTop: '8px', borderTop: `1px solid ${C.separator}`, marginLeft: '-6px' }}>
                              <button onClick={() => goToCue(n)} title="Show this cue in the cue list" style={linkButton(C.accentText)}>Go to Cue ›</button>
                              <span style={{ flex: 1 }} />
                              <button onClick={() => { setEditingId(n.id); setEditText(n.text); }} style={linkButton(C.accentText)}>Edit</button>
                              <button onClick={() => deleteNote(n)} style={linkButton(C.red)}>Delete</button>
                              <button onClick={() => giveNote(n)} title="Mark as given: moves it to Given at the bottom"
                                style={{ background: 'rgba(48,209,88,0.16)', border: 'none', borderRadius: '6px', color: C.green, padding: '3px 10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', marginLeft: '4px' }}>
                                ✓ Given
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Given: checked-off notes, newest first, in a tray along the bottom */}
      {givenList.length > 0 && (
        <div style={{ flexShrink: 0, background: '#232323', borderTop: '1px solid rgba(0,0,0,0.45)', boxShadow: '0 -1px 0 rgba(255,255,255,0.06)' }}>
          <button onClick={toggleTray} data-tour="given-tray"
            style={{ width: '100%', height: '36px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px', background: 'transparent', border: 'none', color: C.label1, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ color: C.green }}>✓</span> Given
            <span style={{ color: C.label3, fontWeight: '400' }}>{givenList.length}</span>
            <span style={{ marginLeft: 'auto', color: C.label3, fontSize: '11px' }}>{trayOpen ? 'Hide ▾' : 'Show ▴'}</span>
          </button>
          {trayOpen && (
            <div style={{ maxHeight: '36vh', overflowY: 'auto', padding: '0 24px 12px' }}>
              {givenList.map(g => {
                const cue = cueById.get(g.cue_id);
                const spot = g.spot_id === null ? null : spotById.get(g.spot_id);
                return (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'baseline', gap: '12px', padding: '7px 0', borderTop: `1px solid ${C.separator}` }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: C.label2, width: '64px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{cueLabel(cue)}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: g.spot_id === null ? C.yellow : C.label3, width: '72px', flexShrink: 0 }}>{g.spot_id === null ? 'All Spots' : `Spot ${spot?.spot_number ?? '?'}`}</span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: '13px', color: C.label2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{g.note}</span>
                    <span style={{ fontSize: '11px', color: C.label3, flexShrink: 0 }}>{givenDate(g.given_at)}</span>
                    <button onClick={() => restoreGiven(g)} title="Put this note back on its cue" style={linkButton(C.accentText)}>Restore</button>
                    <button onClick={() => deleteGiven(g)} style={linkButton(C.red)}>Delete</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <Tips steps={TIPS.spotNotes} />
    </div>
  );
}

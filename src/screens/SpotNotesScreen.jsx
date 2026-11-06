import React, { useState, useEffect } from 'react';
import Tips from '../components/Tips';
import { TIPS } from '../tips';
import AppHeader from '../components/AppHeader';
import { actionNameMap, displayAction } from '../actionNames';
import { characterLabel } from '../characterNames';
import { CueActionIcon } from '../components/ActionIcon';
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

// Small line icons for the note rows (SF Symbols style)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.5" /></svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.6 6.5v4.5M9.4 6.5v4.5" /></svg>
);
const iconButton = (color) => ({ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', borderRadius: '6px', color, cursor: 'pointer', padding: 0, flexShrink: 0 });
// Delete shows when the pointer is over a note; the check is always there. The LQ is the Go to Cue link.
const ROW_CSS = `
.note-row .note-more { opacity: 0; transition: opacity 0.1s; }
.note-row:hover .note-more, .note-row:focus-within .note-more { opacity: 1; }
.note-row:hover { background: rgba(255,255,255,0.04); }
.note-icon:hover { background: rgba(255,255,255,0.08) !important; }
.note-lq { color: #FFFFFF; }
.note-tip { position: absolute; left: -6px; bottom: calc(100% + 5px); z-index: 20; white-space: nowrap; pointer-events: none;
  background: #3A3A3A; color: #FFFFFF; font-size: 11px; font-weight: 500; padding: 3px 7px; border-radius: 5px;
  border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 2px 8px rgba(0,0,0,0.4); opacity: 0; transition: opacity 0.08s; }
.note-lq-wrap:hover .note-tip { opacity: 1; }
.note-lq:hover { color: #409CFF; }
`;

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

  const [{ actionNames, customActions }] = useState(() => {
    const row = ipcRenderer.sendSync('db-get-show', show.id);
    let custom = [];
    try { custom = JSON.parse(row?.custom_actions || '[]'); } catch (e) {}
    return { actionNames: actionNameMap(row?.action_names), customActions: Array.isArray(custom) ? custom : [] };
  });

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
  const deleteNote = (n) => { if (window.confirm('Delete this note?')) setText(n, ''); };
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

      <style>{ROW_CSS}</style>
      <div style={{ flex: 1, overflow: 'auto', padding: '20px', minHeight: 0 }}>
        {toGive === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.28)', fontSize: '14px' }}>
            {givenList.length ? 'Every note has been given.' : 'No notes yet. Double-click any cue to add a note, or use Notes in the cue list.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(230px, 1fr))`, gap: '12px', alignItems: 'start' }}>
            {columns.map(col => (
              <div key={col.key} style={{ minWidth: 0, background: C.card, borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: col.key === 'all' ? C.yellow : C.label1, padding: '11px 14px', background: '#323232', borderBottom: '1px solid rgba(0,0,0,0.35)' }}>
                  {col.title}
                </div>
                {col.notes.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', fontStyle: 'italic', padding: '12px 14px' }}>Nothing to give</div>
                ) : (
                  <div>
                    {col.notes.map((n, i) => {
                      const { sc, cue } = n;
                      const scene = sceneMap[cue.scene_id];
                      const char = sc && characterLabel(sc, charMap);
                      const action = sc?.action && sc.action !== 'Tracked' ? displayAction(sc.action, actionNames) : '';
                      const isEditing = editingId === n.id;
                      // A small scene heading wherever the scene changes down the column
                      const newScene = i === 0 || col.notes[i - 1].cue.scene_id !== cue.scene_id;
                      return (
                        <React.Fragment key={n.id}>
                        {newScene && scene && (
                          // Colored like the cue list's scene bands: green, gold for an act break
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', padding: '5px 14px', background: scene.act_break ? '#3E301B' : '#203A2A', boxShadow: `inset 0 1px 0 ${scene.act_break ? 'rgba(255,159,10,0.35)' : 'rgba(48,209,88,0.32)'}, inset 0 -1px 0 ${scene.act_break ? 'rgba(255,159,10,0.35)' : 'rgba(48,209,88,0.32)'}`, minWidth: 0 }}>
                            {scene.label && <span style={{ fontSize: '12px', fontWeight: '700', color: scene.act_break ? '#FF9F0A' : '#30D158', flexShrink: 0 }}>{scene.label}</span>}
                            {scene.song && <span style={{ fontSize: '12px', color: scene.act_break ? 'rgba(255,159,10,0.75)' : 'rgba(48,209,88,0.72)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{scene.song}</span>}
                          </div>
                        )}
                        {/* A note: the cue and what the spot is doing on top, the note under it at full width */}
                        <div className="note-row" title={isEditing ? undefined : 'Double-click to edit'}
                          onDoubleClick={e => { if (!isEditing && !e.target.closest('button')) { setEditingId(n.id); setEditText(n.text); } }}
                          style={{ padding: '9px 8px 11px 14px', borderTop: newScene ? 'none' : `1px solid ${C.separator}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, height: '24px' }}>
                            <span className="note-lq-wrap" style={{ position: 'relative', flexShrink: 0 }}>
                              <button className="note-lq" onClick={() => goToCue(n)}
                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: '700', lineHeight: '17px', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{cueLabel(cue)}</button>
                              {/* Shows right away on hover (a normal tooltip waits about a second) */}
                              <span className="note-tip">Go to Cue · T·{cue.track_number}{cue.page ? ` · pg ${cue.page}` : ''}</span>
                            </span>
                            {(action || char) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', lineHeight: '15px', minWidth: 0, overflow: 'hidden' }}>
                                {action && <CueActionIcon action={sc.action} customActions={customActions} size={14} />}
                                {action && <span style={{ color: C.label2, whiteSpace: 'nowrap' }}>{action}</span>}
                                {char && <span style={{ color: C.label2, fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{char}</span>}
                              </div>
                            )}
                            <span style={{ flex: 1 }} />
                            {!isEditing && (
                              <>
                                <button className="note-more note-icon" onClick={() => deleteNote(n)} title="Delete" style={iconButton(C.red)}><TrashIcon /></button>
                                <button className="note-icon" onClick={() => giveNote(n)} title="Given: moves it to Given at the bottom" style={iconButton(C.green)}><CheckIcon /></button>
                              </>
                            )}
                          </div>
                          {isEditing ? (
                            <div style={{ marginTop: '4px', paddingRight: '6px' }}>
                              <textarea autoFocus value={editText} onChange={e => setEditText(e.target.value)}
                                onFocus={e => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(n); } if (e.key === 'Escape') setEditingId(null); }}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #0A84FF', borderRadius: '6px', color: '#FFFFFF', padding: '6px 8px', fontSize: '14px', lineHeight: '18px', outline: 'none', resize: 'vertical', minHeight: '54px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setEditingId(null)}
                                  style={{ background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', padding: '4px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                                <button onClick={() => saveEdit(n)}
                                  style={{ background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', padding: '4px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '14px', color: C.label1, lineHeight: '18px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '3px', paddingRight: '6px' }}>{n.text}</div>
                          )}
                        </div>
                        </React.Fragment>
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
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '7px 0', borderTop: `1px solid ${C.separator}` }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: C.label2, width: '64px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{cueLabel(cue)}</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: g.spot_id === null ? C.yellow : C.label3, width: '72px', flexShrink: 0 }}>{g.spot_id === null ? 'All Spots' : `Spot ${spot?.spot_number ?? '?'}`}</span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: '13px', color: C.label2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{g.note}</span>
                    <span style={{ fontSize: '11px', color: C.label3, flexShrink: 0 }}>{givenDate(g.given_at)}</span>
                    <button onClick={() => restoreGiven(g)} title="Put this note back on its cue" style={linkButton(C.accentText)}>Restore</button>
                    <button className="note-icon" onClick={() => deleteGiven(g)} title="Delete" style={iconButton(C.red)}><TrashIcon /></button>
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

import React, { useState, useEffect } from 'react';
import Tips from '../components/Tips';
import { TIPS } from '../tips';
import AppHeader from '../components/AppHeader';
import { actionNameMap, displayAction } from '../actionNames';
const { ipcRenderer } = window.require('electron');

export default function SpotNotesScreen({ show, navigate }) {
  const [spots, setSpots] = useState([]);
  const [cues, setCues] = useState([]);
  const [spotCues, setSpotCues] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const result = ipcRenderer.sendSync('db-get-cue-list', show.id);
    if (result) {
      setSpots(result.spots || []);
      setCues(result.cues || []);
      setSpotCues(result.spotCues || []);
      setScenes(result.scenes || []);
      setScenes(result.scenes || []);
      const chars = ipcRenderer.sendSync('db-get-characters', show.id);
      setCharacters(Array.isArray(chars) ? chars : []);
    }
  }, []);

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

  const byCueOrder = (a, b) => {
    const sceneA = sceneOrderMap[a.cue?.scene_id] ?? 999;
    const sceneB = sceneOrderMap[b.cue?.scene_id] ?? 999;
    if (sceneA !== sceneB) return sceneA - sceneB;
    return (a.cue?.sort_order || 0) - (b.cue?.sort_order || 0);
  };

  // Each note as { id, cue, text, checked, sc } (sc: the spot's row; none for an All Spots note, kept on the cue)
  const notesForSpot = (spotId) => spotCues
    .filter(sc => sc.spot_id === spotId && sc.spot_note && sc.spot_note.trim())
    .map(sc => ({ id: `sc-${sc.id}`, sc, cue: cues.find(c => c.id === sc.cue_id), text: sc.spot_note, checked: !!sc.note_checked }))
    .filter(n => n.cue)
    .sort(byCueOrder);
  const allSpotsNotes = cues
    .filter(c => c.all_spots_note && c.all_spots_note.trim())
    .map(c => ({ id: `all-${c.id}`, allSpots: true, cue: c, text: c.all_spots_note, checked: !!c.all_spots_note_checked }))
    .sort(byCueOrder);

  const setNote = (n, fields) => {
    if (n.allSpots) {
      const cueFields = { text: 'all_spots_note', checked: 'all_spots_note_checked' };
      for (const [k, v] of Object.entries(fields)) ipcRenderer.sendSync('db-update-cue', { cueId: n.cue.id, field: cueFields[k], value: v });
      setCues(prev => prev.map(c => c.id === n.cue.id ? { ...c, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [cueFields[k], v])) } : c));
    } else {
      const scFields = { text: 'spot_note', checked: 'note_checked' };
      for (const [k, v] of Object.entries(fields)) ipcRenderer.sendSync('db-update-spot-cue', { spotCueId: n.sc.id, field: scFields[k], value: v });
      setSpotCues(prev => prev.map(sc => sc.id === n.sc.id ? { ...sc, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [scFields[k], v])) } : sc));
    }
  };
  const deleteNote = (n) => setNote(n, { text: '' });
  const toggleChecked = (n) => setNote(n, { checked: n.checked ? 0 : 1 });
  const saveEdit = (n) => { setNote(n, { text: editText }); setEditingId(null); };

  const totalNotes = spotCues.filter(sc => sc.spot_note && sc.spot_note.trim()).length + allSpotsNotes.length;
  const columns = [
    ...(allSpotsNotes.length ? [{ key: 'all', title: 'All Spots', notes: allSpotsNotes }] : []),
    ...spots.map(spot => ({ key: spot.id, title: `Spot ${spot.spot_number}${spot.operator_name ? ' · ' + spot.operator_name : ''}`, notes: notesForSpot(spot.id) })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1E1E1E' }}>
      <AppHeader title="Spot Notes" onBack={() => navigate('show', show)} backLabel={show.title}>
        <span data-tour="spot-notes" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{totalNotes} note{totalNotes !== 1 ? 's' : ''}</span>
      </AppHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {totalNotes === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.28)', fontSize: '14px' }}>
            No notes yet — double-click any cue to add a note
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: '16px' }}>
            {columns.map(col => {
              const notes = col.notes;
              return (
                <div key={col.key}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: col.key === 'all' ? '#FFD60A' : '#FFFFFF', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
                    {col.title}
                  </div>
                  {notes.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', fontStyle: 'italic' }}>No notes</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {notes.map(n => {
                        const { sc, cue } = n;
                        const scene = sceneMap[cue.scene_id];
                        const isChecked = n.checked;
                        const isEditing = editingId === n.id;
                        return (
                          <div key={n.id} style={{ background: isChecked ? 'rgba(255,255,255,0.05)' : '#2A2A2A', border: `1px solid ${isChecked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', padding: '14px', opacity: isChecked ? 0.6 : 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>LQ {cue.lq_number || '—'}</span>
                                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>T·{cue.track_number}</span>
                                  {scene && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>{scene.label}</span>}
                                </div>
                                {sc?.action && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginTop: '2px' }}>{displayAction(sc.action, actionNames)}{sc.character_id && charMap[sc.character_id] ? ' · ' + charMap[sc.character_id].name : ''}</div>}
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button onClick={() => goToCue(n)} title="Show this cue in the cue list"
                                  style={{ background: 'transparent', border: 'none', borderRadius: '6px', color: '#409CFF', padding: '3px 6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
                                  Go to Cue ›
                                </button>
                                <button onClick={() => toggleChecked(n)}
                                  style={{ background: isChecked ? 'rgba(48,209,88,0.16)' : 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: isChecked ? '#30D158' : '#FFFFFF', padding: '3px 8px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
                                  {isChecked ? '✓ Done' : 'Check off'}
                                </button>
                                <button onClick={() => { setEditingId(n.id); setEditText(n.text); }}
                                  style={{ background: 'transparent', border: 'none', borderRadius: '6px', color: '#409CFF', padding: '3px 6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
                                  Edit
                                </button>
                                <button onClick={() => deleteNote(n)}
                                  style={{ background: 'transparent', border: 'none', borderRadius: '6px', color: '#FF453A', padding: '3px 6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
                                  Delete
                                </button>
                              </div>
                            </div>
                            {isEditing ? (
                              <div>
                                <textarea value={editText} onChange={e => setEditText(e.target.value)}
                                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid #0A84FF', borderRadius: '6px', color: '#FFFFFF', padding: '8px 10px', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '60px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', justifyContent: 'flex-end' }}>
                                  <button onClick={() => setEditingId(null)}
                                    style={{ background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                                  <button onClick={() => saveEdit(n)}
                                    style={{ background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: '13px', color: isChecked ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.78)', lineHeight: 1.5, whiteSpace: 'pre-wrap', textDecoration: isChecked ? 'line-through' : 'none' }}>
                                {n.text}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Tips steps={TIPS.spotNotes} />
    </div>
  );
}

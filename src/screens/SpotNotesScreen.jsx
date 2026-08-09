import React, { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
const { ipcRenderer } = window.require('electron');

export default function SpotNotesScreen({ show, navigate }) {
  const [spots, setSpots] = useState([]);
  const [cues, setCues] = useState([]);
  const [spotCues, setSpotCues] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const result = ipcRenderer.sendSync('db-get-cue-list', show.id);
    if (result) {
      setSpots(result.spots || []);
      setCues(result.cues || []);
      setSpotCues(result.spotCues || []);
      setScenes(result.scenes || []);
    }
  }, []);

  const sceneMap = {};
  scenes.forEach(s => { sceneMap[s.id] = s; });

  const sceneOrderMap = {};
  scenes.forEach((s, i) => { sceneOrderMap[s.id] = i; });

  const notesForSpot = (spotId) => {
    return spotCues
      .filter(sc => sc.spot_id === spotId && sc.spot_note && sc.spot_note.trim())
      .map(sc => {
        const cue = cues.find(c => c.id === sc.cue_id);
        return { sc, cue };
      })
      .filter(({ cue }) => cue)
      .sort((a, b) => {
        const sceneA = sceneOrderMap[a.cue?.scene_id] ?? 999;
        const sceneB = sceneOrderMap[b.cue?.scene_id] ?? 999;
        if (sceneA !== sceneB) return sceneA - sceneB;
        return (a.cue?.sort_order || 0) - (b.cue?.sort_order || 0);
      });
  };

  const deleteNote = (spotCueId) => {
    ipcRenderer.sendSync('db-update-spot-cue', { spotCueId, field: 'spot_note', value: '' });
    setSpotCues(prev => prev.map(sc => sc.id === spotCueId ? { ...sc, spot_note: '' } : sc));
  };

  const toggleChecked = (spotCueId, current) => {
    const newVal = current ? 0 : 1;
    ipcRenderer.sendSync('db-update-spot-cue', { spotCueId, field: 'note_checked', value: newVal });
    setSpotCues(prev => prev.map(sc => sc.id === spotCueId ? { ...sc, note_checked: newVal } : sc));
  };

  const saveEdit = (spotCueId) => {
    ipcRenderer.sendSync('db-update-spot-cue', { spotCueId, field: 'spot_note', value: editText });
    setSpotCues(prev => prev.map(sc => sc.id === spotCueId ? { ...sc, spot_note: editText } : sc));
    setEditingId(null);
  };

  const totalNotes = spotCues.filter(sc => sc.spot_note && sc.spot_note.trim()).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f' }}>
      <AppHeader title="Spot Notes" onBack={() => navigate('show', show)} backLabel={show.title}>
        <span style={{ fontSize: '12px', color: '#555' }}>{totalNotes} note{totalNotes !== 1 ? 's' : ''}</span>
      </AppHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {totalNotes === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#333', fontSize: '14px' }}>
            No notes yet — double-click any cue to add a note
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${spots.length}, 1fr)`, gap: '16px' }}>
            {spots.map(spot => {
              const notes = notesForSpot(spot.id);
              return (
                <div key={spot.id}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#534AB7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #534AB7' }}>
                    Spot {spot.spot_number}{spot.operator_name ? ' · ' + spot.operator_name : ''}
                  </div>
                  {notes.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#333', fontStyle: 'italic' }}>No notes</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {notes.map(({ sc, cue }) => {
                        const scene = sceneMap[cue.scene_id];
                        const isChecked = !!sc.note_checked;
                        const isEditing = editingId === sc.id;
                        return (
                          <div key={sc.id} style={{ background: isChecked ? '#111' : '#1a1a1a', border: `1px solid ${isChecked ? '#1e1e1e' : '#2a2a2a'}`, borderRadius: '10px', padding: '14px', opacity: isChecked ? 0.6 : 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#f0f0f0' }}>LQ {cue.lq_number || '—'}</span>
                                  <span style={{ fontSize: '11px', color: '#555' }}>T·{cue.track_number}</span>
                                  {scene && <span style={{ fontSize: '11px', color: '#534AB7', fontWeight: '600' }}>{scene.label}</span>}
                                </div>
                                {sc.action && <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{sc.action}{sc.character_id ? ' · ' + (cue.character_name || '') : ''}</div>}
                              </div>
                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button onClick={() => toggleChecked(sc.id, isChecked)}
                                  style={{ background: isChecked ? '#1a3a1a' : 'none', border: `1px solid ${isChecked ? '#1D9E75' : '#2a2a2a'}`, borderRadius: '4px', color: isChecked ? '#1D9E75' : '#555', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>
                                  {isChecked ? '✓ Done' : 'Check off'}
                                </button>
                                <button onClick={() => { setEditingId(sc.id); setEditText(sc.spot_note); }}
                                  style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#666', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>
                                  Edit
                                </button>
                                <button onClick={() => deleteNote(sc.id)}
                                  style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#c44', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>
                                  Delete
                                </button>
                              </div>
                            </div>
                            {isEditing ? (
                              <div>
                                <textarea value={editText} onChange={e => setEditText(e.target.value)}
                                  style={{ width: '100%', background: '#111', border: '1px solid #534AB7', borderRadius: '6px', color: '#f0f0f0', padding: '8px 10px', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '60px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', justifyContent: 'flex-end' }}>
                                  <button onClick={() => setEditingId(null)}
                                    style={{ background: 'none', border: '1px solid #333', borderRadius: '6px', color: '#888', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                                  <button onClick={() => saveEdit(sc.id)}
                                    style={{ background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: '13px', color: isChecked ? '#555' : '#ccc', lineHeight: 1.5, whiteSpace: 'pre-wrap', textDecoration: isChecked ? 'line-through' : 'none' }}>
                                {sc.spot_note}
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
    </div>
  );
}
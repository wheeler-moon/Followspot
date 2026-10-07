import React, { useState, useEffect, useRef } from 'react';
import Tips from '../components/Tips';
import { TIPS } from '../tips';
import AppHeader from '../components/AppHeader';
const { ipcRenderer } = window.require('electron');

export default function ScenesScreen({ show, navigate }) {
  const [scenes, setScenes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editSong, setEditSong] = useState('');
  const [editActBreak, setEditActBreak] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newSong, setNewSong] = useState('');
  const [newActBreak, setNewActBreak] = useState(false);
  const [dragOverId, setDragOverId] = useState(null);
  const dragItem = useRef(null);
  const labelInputRef = useRef(null);

  const load = () => {
    const result = ipcRenderer.sendSync('db-get-scenes', show.id);
    setScenes(Array.isArray(result) ? result : []);
  };

  useEffect(() => { load(); }, []);

  const addScene = () => {
    if (!newLabel.trim()) return;
    ipcRenderer.sendSync('db-create-scene', { showId: show.id, label: newLabel, song: newSong, actBreak: newActBreak });
    setNewLabel(''); setNewSong(''); setNewActBreak(false);
    load();
    setTimeout(() => labelInputRef.current?.focus(), 50);
  };

  const startEdit = (scene) => {
    setEditingId(scene.id);
    setEditLabel(scene.label);
    setEditSong(scene.song || '');
    setEditActBreak(!!scene.act_break);
  };

  const saveEdit = () => {
    ipcRenderer.sendSync('db-update-scene', { sceneId: editingId, label: editLabel, song: editSong, actBreak: editActBreak });
    setEditingId(null);
    load();
  };

  const deleteScene = (sceneId) => {
    if (!window.confirm('Delete this scene? Cues assigned to it will become unassigned.')) return;
    ipcRenderer.sendSync('db-delete-scene', sceneId);
    load();
  };

  const moveScene = (index, dir) => {
    const newScenes = [...scenes];
    const target = index + dir;
    if (target < 0 || target >= newScenes.length) return;
    [newScenes[index], newScenes[target]] = [newScenes[target], newScenes[index]];
    const updates = newScenes.map((s, i) => ({ id: s.id, sort_order: (i + 1) * 1000 }));
    ipcRenderer.sendSync('db-reorder-scenes', updates);
    load();
  };

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverId(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragItem.current === null || dragItem.current === index) { setDragOverId(null); return; }
    const newScenes = [...scenes];
    const dragged = newScenes.splice(dragItem.current, 1)[0];
    newScenes.splice(index, 0, dragged);
    const updates = newScenes.map((s, i) => ({ id: s.id, sort_order: (i + 1) * 1000 }));
    ipcRenderer.sendSync('db-reorder-scenes', updates);
    dragItem.current = null;
    setDragOverId(null);
    load();
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
    color: '#FFFFFF', padding: '7px 10px', fontSize: '13px', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1E1E1E' }}>
      <AppHeader title="Scene List" onBack={() => navigate('show', show)} backLabel={show.title}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{scenes.length} scenes</span>
      </AppHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>

          <div data-tour="add-scene-form" style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add scene</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Scene label *</div>
                <input ref={labelInputRef} style={{ ...inputStyle, width: '100%' }} value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addScene()}
                  placeholder="e.g. Scene 1 - The Road" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Song (optional)</div>
                <input style={{ ...inputStyle, width: '100%' }} value={newSong}
                  onChange={e => setNewSong(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addScene()}
                  placeholder="e.g. Time Is My Enemy" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'rgba(255,255,255,0.62)' }}>
                <input type="checkbox" checked={newActBreak} onChange={e => setNewActBreak(e.target.checked)}
                  style={{ accentColor: '#0A84FF' }} />
                Act break
              </label>
              <button onClick={addScene} style={{ padding: '7px 18px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                Add Scene
              </button>
            </div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scene order — drag to reorder
          </div>

          {scenes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.28)', fontSize: '14px' }}>
              No scenes yet — add your first scene above
            </div>
          ) : (
            // Acts wrap two per row so extra act breaks don't squeeze the columns
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px 16px', alignItems: 'start' }}>
              {(() => {
                const columns = [];
                let currentColumn = [];
                scenes.forEach((scene, index) => {
                  if (scene.act_break && currentColumn.length > 0) {
                    columns.push(currentColumn);
                    currentColumn = [];
                  }
                  currentColumn.push({ scene, index });
                });
                if (currentColumn.length > 0) columns.push(currentColumn);
                return columns.map((col, colIndex) => (
                  <div key={colIndex} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 14px' }}>Act {colIndex + 1}</div>
                    {/* Apple grouped list: one rounded panel, rows divided by hairlines */}
                    <div style={{ background: '#2A2A2A', borderRadius: '10px', overflow: 'hidden' }}>
                    {col.map(({ scene, index }, rowIndex) => (
                      <div key={scene.id}
                        draggable
                        onDragStart={e => handleDragStart(e, index)}
                        onDragOver={e => handleDragOver(e, index)}
                        onDrop={e => handleDrop(e, index)}
                        onDragLeave={() => setDragOverId(null)}
                        style={{
                          background: dragOverId === index ? 'rgba(10,132,255,0.16)' : 'transparent',
                          borderTop: rowIndex > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                          boxShadow: dragOverId === index ? 'inset 0 0 0 1px #0A84FF' : 'none',
                          padding: '10px 12px 10px 10px',
                          cursor: 'grab', transition: 'background 0.1s',
                          minWidth: 0,
                        }}>
                        {editingId === scene.id ? (
                          <div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                              <div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Scene label</div>
                                <input style={{ ...inputStyle, width: '100%' }} value={editLabel}
                                  onChange={e => setEditLabel(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                              </div>
                              <div>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Song</div>
                                <input style={{ ...inputStyle, width: '100%' }} value={editSong}
                                  onChange={e => setEditSong(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'rgba(255,255,255,0.62)' }}>
                                <input type="checkbox" checked={editActBreak} onChange={e => setEditActBreak(e.target.checked)}
                                  style={{ accentColor: '#0A84FF' }} />
                                Act break
                              </label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setEditingId(null)} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={saveEdit} style={{ padding: '6px 14px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: '15px', cursor: 'grab', flexShrink: 0 }}>⠿</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: '500', color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums', minWidth: '18px', textAlign: 'right' }}>{index + 1}</span>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>{scene.label}</span>
                                {scene.act_break ? <span style={{ fontSize: '10px', padding: '1px 6px', background: 'rgba(255,159,10,0.16)', color: '#FF9F0A', borderRadius: '6px', fontWeight: '600', whiteSpace: 'nowrap' }}>ACT BREAK</span> : null}
                              </div>
                              {scene.song && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px', marginLeft: '26px' }}>{scene.song}</div>}
                            </div>
                            <div style={{ display: 'flex', flexShrink: 0 }}>
                              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                <button onClick={() => moveScene(index, -1)} disabled={index === 0}
                                  style={{ background: 'transparent', border: 'none', borderRadius: '6px', color: index === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.52)', width: '24px', height: '24px', cursor: index === 0 ? 'default' : 'pointer', fontSize: '12px' }}>↑</button>
                                <button onClick={() => moveScene(index, 1)} disabled={index === scenes.length - 1}
                                  style={{ background: 'transparent', border: 'none', borderRadius: '6px', color: index === scenes.length - 1 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.52)', width: '24px', height: '24px', cursor: index === scenes.length - 1 ? 'default' : 'pointer', fontSize: '12px' }}>↓</button>
                                <button onClick={() => startEdit(scene)}
                                  style={{ background: 'transparent', border: 'none', borderRadius: '6px', color: '#409CFF', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Edit</button>
                                <button onClick={() => deleteScene(scene.id)}
                                  style={{ background: 'transparent', border: 'none', borderRadius: '6px', color: '#FF453A', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Delete</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>
      <Tips steps={TIPS.scenes} />
    </div>
  );
}

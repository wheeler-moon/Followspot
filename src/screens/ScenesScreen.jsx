import React, { useState, useEffect, useRef } from 'react';
import { dropSlot, moveTo, moveItem, dropLineStyle } from '../dropLine';
import Tips from '../components/Tips';
import { TIPS } from '../tips';
import AppHeader from '../components/AppHeader';
import { setUndoTarget } from '../undoTarget';
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

  // ⌘Z / ⇧⌘Z: everything on this screen can be undone and redone. Each step knows how to take itself
  // back (undo) and do itself again (redo).
  const undoStack = useRef([]), redoStack = useRef([]);
  const record = (step) => { undoStack.current.push(step); redoStack.current = []; };
  useEffect(() => {
    setUndoTarget((what) => {
      const from = what === 'redo' ? redoStack.current : undoStack.current;
      const to = what === 'redo' ? undoStack.current : redoStack.current;
      const step = from.pop();
      if (!step) return;
      (what === 'redo' ? step.redo : step.undo)();
      to.push(step);
      setEditingId(null);
      load();
    });
    return () => setUndoTarget(null);
  }, []);
  const getRow = (id) => (ipcRenderer.sendSync('db-get-scenes', show.id) || []).find(s => s.id === id);
  const orderOf = (list) => list.map((s, i) => ({ id: s.id, sort_order: s.sort_order ?? (i + 1) * 1000 }));

  const addScene = () => {
    if (!newLabel.trim() && !newSong.trim()) return;   // a label, a song, or both
    const result = ipcRenderer.sendSync('db-create-scene', { showId: show.id, label: newLabel, song: newSong, actBreak: newActBreak });
    if (result?.success) {
      const row = getRow(result.id);
      record({ undo: () => ipcRenderer.sendSync('db-delete-scene', row.id), redo: () => ipcRenderer.sendSync('db-restore-row', { table: 'scenes', row }) });
    }
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
    if (!editLabel.trim() && !editSong.trim()) return;
    const was = scenes.find(s => s.id === editingId);
    const before = { sceneId: editingId, label: was?.label || '', song: was?.song || '', actBreak: !!was?.act_break };
    const after = { sceneId: editingId, label: editLabel, song: editSong, actBreak: editActBreak };
    ipcRenderer.sendSync('db-update-scene', after);
    record({ undo: () => ipcRenderer.sendSync('db-update-scene', before), redo: () => ipcRenderer.sendSync('db-update-scene', after) });
    setEditingId(null);
    load();
  };

  const deleteScene = (sceneId) => {
    if (!window.confirm('Delete this scene? Its cues become unassigned. ⌘Z brings it back.')) return;
    const result = ipcRenderer.sendSync('db-delete-scene', sceneId);
    if (result?.success && result.row) {
      const { row, cueIds } = result;
      record({
        undo: () => { ipcRenderer.sendSync('db-restore-row', { table: 'scenes', row }); ipcRenderer.sendSync('db-set-cue-scene', { cueIds, sceneId: row.id }); },
        redo: () => ipcRenderer.sendSync('db-delete-scene', row.id),
      });
    }
    load();
  };


  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverId(dropSlot(e, index));
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const slot = dragOverId || dropSlot(e, index);
    if (dragItem.current === null || moveTo(dragItem.current, slot) === dragItem.current) { dragItem.current = null; setDragOverId(null); return; }
    const newScenes = moveItem(scenes, dragItem.current, slot);
    const before = orderOf(scenes);
    const updates = newScenes.map((s, i) => ({ id: s.id, sort_order: (i + 1) * 1000 }));
    ipcRenderer.sendSync('db-reorder-scenes', updates);
    record({ undo: () => ipcRenderer.sendSync('db-reorder-scenes', before), redo: () => ipcRenderer.sendSync('db-reorder-scenes', updates) });
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
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Scene label</div>
                <input ref={labelInputRef} style={{ ...inputStyle, width: '100%' }} value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addScene()}
                  placeholder="Scene name, e.g. Act 1, Scene 1" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Song</div>
                <input style={{ ...inputStyle, width: '100%' }} value={newSong}
                  onChange={e => setNewSong(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addScene()}
                  placeholder="Song or title (optional)" />
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
                        onDragEnd={() => { dragItem.current = null; setDragOverId(null); }}
                        style={{
                          borderTop: rowIndex > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                          ...dropLineStyle(dragOverId, index, dragItem.current),
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
                                <span style={{ fontSize: '13px', fontWeight: '600', color: scene.act_break ? '#FF9F0A' : '#FFFFFF' }}>{scene.label || scene.song}</span>
                                {/* An act break reads like it does in the cue list: its name in orange, with a quiet note */}
                                {scene.act_break ? <span style={{ fontSize: '12px', color: 'rgba(255,159,10,0.75)', whiteSpace: 'nowrap' }}>Act break</span> : null}
                              </div>
                              {scene.label && scene.song && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px', marginLeft: '26px' }}>{scene.song}</div>}
                            </div>
                            <div style={{ display: 'flex', flexShrink: 0 }}>
                              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
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

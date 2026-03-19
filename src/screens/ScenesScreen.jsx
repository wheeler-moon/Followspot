import React, { useState, useEffect, useRef } from 'react';
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
    background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px',
    color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('show', show)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer' }}>← {show.title}</button>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#f0f0f0' }}>Scene List</span>
        <span style={{ fontSize: '12px', color: '#555' }}>{scenes.length} scenes</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add scene</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Scene label *</div>
                <input style={{ ...inputStyle, width: '100%' }} value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addScene()}
                  placeholder="e.g. Scene 1 - The Road" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Song (optional)</div>
                <input style={{ ...inputStyle, width: '100%' }} value={newSong}
                  onChange={e => setNewSong(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addScene()}
                  placeholder="e.g. Time Is My Enemy" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#888' }}>
                <input type="checkbox" checked={newActBreak} onChange={e => setNewActBreak(e.target.checked)}
                  style={{ accentColor: '#534AB7' }} />
                Act break
              </label>
              <button onClick={addScene} style={{ padding: '7px 18px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                Add Scene
              </button>
            </div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scene order — drag to reorder
          </div>

          {scenes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#333', fontSize: '14px' }}>
              No scenes yet — add your first scene above
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {scenes.map((scene, index) => (
                <div key={scene.id}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDrop(e, index)}
                  onDragLeave={() => setDragOverId(null)}
                  style={{
                    background: dragOverId === index ? '#1a1a2e' : '#1a1a1a',
                    border: `1px solid ${dragOverId === index ? '#534AB7' : '#2a2a2a'}`,
                    borderRadius: '10px', padding: '14px 16px',
                    cursor: 'grab', transition: 'border-color 0.1s, background 0.1s',
                  }}>
                  {editingId === scene.id ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Scene label</div>
                          <input style={{ ...inputStyle, width: '100%' }} value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Song</div>
                          <input style={{ ...inputStyle, width: '100%' }} value={editSong}
                            onChange={e => setEditSong(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#888' }}>
                          <input type="checkbox" checked={editActBreak} onChange={e => setEditActBreak(e.target.checked)}
                            style={{ accentColor: '#534AB7' }} />
                          Act break
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setEditingId(null)} style={{ padding: '6px 14px', background: 'none', border: '1px solid #333', borderRadius: '6px', color: '#888', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                          <button onClick={saveEdit} style={{ padding: '6px 14px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#333', fontSize: '18px', cursor: 'grab', flexShrink: 0 }}>⠿</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#555' }}>{index + 1}.</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#f0f0f0' }}>{scene.label}</span>
                          {scene.act_break ? <span style={{ fontSize: '10px', padding: '2px 6px', background: '#2a1a3a', color: '#9070c0', borderRadius: '4px', fontWeight: '600' }}>ACT BREAK</span> : null}
                        </div>
                        {scene.song && <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>♪ {scene.song}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => moveScene(index, -1)} disabled={index === 0}
                          style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '4px', color: index === 0 ? '#2a2a2a' : '#666', width: '26px', height: '26px', cursor: index === 0 ? 'default' : 'pointer', fontSize: '12px' }}>↑</button>
                        <button onClick={() => moveScene(index, 1)} disabled={index === scenes.length - 1}
                          style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '4px', color: index === scenes.length - 1 ? '#2a2a2a' : '#666', width: '26px', height: '26px', cursor: index === scenes.length - 1 ? 'default' : 'pointer', fontSize: '12px' }}>↓</button>
                        <button onClick={() => startEdit(scene)}
                          style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#666', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => deleteScene(scene.id)}
                          style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#c44', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
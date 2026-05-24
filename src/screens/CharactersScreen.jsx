import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '../components/AppHeader';
const { ipcRenderer } = window.require('electron');
const getImageSrc = (path) => {
  if (!path) return null;
  try {
    const fs = window.require('fs');
    const data = fs.readFileSync(path);
    const ext = path.split('.').pop().toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
    return `data:${mime};base64,${data.toString('base64')}`;
  } catch(e) { return null; }
};

export default function CharactersScreen({ show, navigate }) {
  const [characters, setCharacters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editActor, setEditActor] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [newName, setNewName] = useState('');
  const [newActor, setNewActor] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [dragOverId, setDragOverId] = useState(null);
  const dragItem = useRef(null);

  const load = () => {
    const result = ipcRenderer.sendSync('db-get-characters', show.id);
    setCharacters(Array.isArray(result) ? result : []);
  };

  useEffect(() => { load(); }, []);

  const addCharacter = () => {
    if (!newName.trim()) return;
ipcRenderer.sendSync('db-create-character', { showId: show.id, name: newName, actorName: newActor });
    if (newNotes.trim() || newPhoto) {
      const chars = ipcRenderer.sendSync('db-get-characters', show.id);
      const newest = chars[chars.length - 1];
      if (newest) ipcRenderer.sendSync('db-update-character', { characterId: newest.id, name: newName, actorName: newActor, costumeNotes: newNotes, photoPath: newPhoto });
    }
    setNewName(''); setNewActor(''); setNewNotes(''); setNewPhoto('');
    load();
  };

  const startEdit = (char) => {
    setEditingId(char.id);
    setEditName(char.name);
    setEditActor(char.actor_name || '');
    setEditNotes(char.costume_notes || '');
    setEditPhoto(char.photo_path || '');
  };

  const saveEdit = () => {
    ipcRenderer.sendSync('db-update-character', { characterId: editingId, name: editName, actorName: editActor, costumeNotes: editNotes, photoPath: editPhoto });
    setEditingId(null);
    load();
  };

  const deleteCharacter = (id) => {
    if (!window.confirm('Delete this character? They will be removed from all cues.')) return;
    ipcRenderer.sendSync('db-delete-character', id);
    load();
  };

  const choosePhoto = () => {
    const result = ipcRenderer.sendSync('dialog-open-image');
    if (result) setEditPhoto(result);
  };

  const moveCharacter = (index, dir) => {
    const newChars = [...characters];
    const target = index + dir;
    if (target < 0 || target >= newChars.length) return;
    [newChars[index], newChars[target]] = [newChars[target], newChars[index]];
    const updates = newChars.map((c, i) => ({ id: c.id, sort_order: (i + 1) * 1000 }));
    ipcRenderer.sendSync('db-reorder-characters', updates);
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
    const newChars = [...characters];
    const dragged = newChars.splice(dragItem.current, 1)[0];
    newChars.splice(index, 0, dragged);
    const updates = newChars.map((c, i) => ({ id: c.id, sort_order: (i + 1) * 1000 }));
    ipcRenderer.sendSync('db-reorder-characters', updates);
    dragItem.current = null;
    setDragOverId(null);
    load();
  };

  const inputStyle = {
    background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px',
    color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f' }}>
     <AppHeader title="Characters" onBack={() => navigate('show', show)} backLabel={show.title}>
        <span style={{ fontSize: '12px', color: '#555' }}>{characters.length} characters</span>
      </AppHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add character</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Character name *</div>
                <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCharacter()} placeholder="e.g. MARIO" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Actor name</div>
                <input style={inputStyle} value={newActor} onChange={e => setNewActor(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCharacter()} placeholder="e.g. John Smith" />
              </div>
            </div>
<div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Costume notes</div>
              <input style={inputStyle} value={newNotes} onChange={e => setNewNotes(e.target.value)}
                placeholder="e.g. Red jacket, black hat" />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>Photo (optional)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#534AB7'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = '#2a2a2a';
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const result = ipcRenderer.sendSync('dialog-get-dropped-path', file.name);
                      if (result) setNewPhoto(result);
                    }
                  }}
                  style={{ width: '70px', height: '70px', background: '#111', borderRadius: '8px', border: '2px dashed #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.15s', cursor: 'pointer' }}
                  onClick={() => { const result = ipcRenderer.sendSync('dialog-open-image'); if (result) setNewPhoto(result); }}>
                  {newPhoto ? (
                    <img src={getImageSrc(newPhoto)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '6px' }}>
                      <div style={{ fontSize: '18px', color: '#333' }}>+</div>
                      <div style={{ fontSize: '8px', color: '#444', marginTop: '2px' }}>Drop or click</div>
                    </div>
                  )}
                </div>
                {newPhoto && (
                  <button onClick={() => setNewPhoto('')} style={{ padding: '5px 10px', background: 'none', border: '1px solid #3a2a2a', borderRadius: '6px', color: '#c44', fontSize: '11px', cursor: 'pointer' }}>Remove</button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={addCharacter} style={{ padding: '7px 18px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                Add Character
              </button>
            </div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Character list — drag to reorder
          </div>

          {characters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#333', fontSize: '14px' }}>
              No characters yet — add your first character above
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {characters.map((char, index) => (
                <div key={char.id}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDrop(e, index)}
                  onDragLeave={() => setDragOverId(null)}
                  style={{
                    background: dragOverId === index ? '#1a1a2e' : '#1a1a1a',
                    border: `1px solid ${dragOverId === index ? '#534AB7' : '#2a2a2a'}`,
                    borderRadius: '10px', padding: '14px 16px',
                    cursor: 'grab', transition: 'border-color 0.1s',
                  }}>
                  {editingId === char.id ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Character name</div>
                          <input style={inputStyle} value={editName} onChange={e => setEditName(e.target.value)} />
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Actor name</div>
                          <input style={inputStyle} value={editActor} onChange={e => setEditActor(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Costume notes</div>
                        <input style={inputStyle} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="e.g. Red jacket, black hat" />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>Photo (optional)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#534AB7'; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; }}
                    onDrop={e => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = '#2a2a2a';
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        const result = ipcRenderer.sendSync('dialog-get-dropped-path', file.name);
                        if (result) setEditPhoto(result);
                      }
                    }}
                    style={{ width: '60px', height: '60px', background: '#111', borderRadius: '6px', border: '2px dashed #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => { const result = ipcRenderer.sendSync('dialog-open-image'); if (result) setEditPhoto(result); }}>
                    {editPhoto ? (
                      <img src={getImageSrc(editPhoto)}style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '4px' }}>
                        <div style={{ fontSize: '16px', color: '#333' }}>+</div>
                        <div style={{ fontSize: '7px', color: '#444' }}>Drop or click</div>
                      </div>
                    )}
                  </div>
                          <button onClick={choosePhoto} style={{ padding: '6px 12px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', fontSize: '12px', cursor: 'pointer' }}>
                            Choose photo...
                          </button>
                          {editPhoto && <button onClick={() => setEditPhoto('')} style={{ padding: '6px 12px', background: 'none', border: '1px solid #3a2a2a', borderRadius: '6px', color: '#c44', fontSize: '12px', cursor: 'pointer' }}>Remove</button>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingId(null)} style={{ padding: '6px 14px', background: 'none', border: '1px solid #333', borderRadius: '6px', color: '#888', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={saveEdit} style={{ padding: '6px 14px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: '#333', fontSize: '18px', cursor: 'grab', flexShrink: 0 }}>⠿</div>
                      {char.photo_path ? (
                        <img src={getImageSrc(char.photo_path)} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #2a2a2a', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', background: '#111', borderRadius: '6px', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#333', flexShrink: 0 }}>◈</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#555', fontWeight: '600' }}>{index + 1}.</span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#f0f0f0' }}>{char.name}</span>
                          {char.actor_name && <span style={{ fontSize: '12px', color: '#666' }}>— {char.actor_name}</span>}
                        </div>
                        {char.costume_notes && <div style={{ fontSize: '11px', color: '#555', marginTop: '2px', fontStyle: 'italic' }}>{char.costume_notes}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => moveCharacter(index, -1)} disabled={index === 0}
                          style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '4px', color: index === 0 ? '#2a2a2a' : '#666', width: '26px', height: '26px', cursor: index === 0 ? 'default' : 'pointer', fontSize: '12px' }}>↑</button>
                        <button onClick={() => moveCharacter(index, 1)} disabled={index === characters.length - 1}
                          style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '4px', color: index === characters.length - 1 ? '#2a2a2a' : '#666', width: '26px', height: '26px', cursor: index === characters.length - 1 ? 'default' : 'pointer', fontSize: '12px' }}>↓</button>
                        <button onClick={() => startEdit(char)}
                          style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#666', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => deleteCharacter(char.id)}
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
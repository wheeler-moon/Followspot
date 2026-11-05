import React, { useState, useEffect, useRef } from 'react';
import { dropSlot, moveTo, moveItem, dropLineStyle } from '../dropLine';
import Tips from '../components/Tips';
import { TIPS } from '../tips';
import AppHeader from '../components/AppHeader';
import { setUndoTarget } from '../undoTarget';
const { ipcRenderer, webUtils } = window.require('electron');
const getDroppedImagePath = (e) => {
  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return null;
  const filePath = webUtils.getPathForFile(file);
  return filePath ? ipcRenderer.sendSync('store-image', filePath) : null;
};
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
  const nameInputRef = useRef(null);

  // ⌘Z / ⇧⌘Z: everything on this screen can be undone and redone (each step knows both ways)
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
  const getRow = (id) => (ipcRenderer.sendSync('db-get-characters', show.id) || []).find(c => c.id === id);
  const fields = (c) => ({ characterId: c.id, name: c.name, actorName: c.actor_name || '', costumeNotes: c.costume_notes || '', photoPath: c.photo_path || '' });

  const togglePrint = (char, value) => {
    const set = (v) => ipcRenderer.sendSync('db-set-character-print', { characterId: char.id, value: v });
    set(value);
    record({ undo: () => set(!value), redo: () => set(value) });
    setCharacters(cs => cs.map(c => c.id === char.id ? { ...c, print_on_sheet: value ? 1 : 0 } : c));
  };

  const load = () => {
    const result = ipcRenderer.sendSync('db-get-characters', show.id);
    setCharacters(Array.isArray(result) ? result : []);
  };

  useEffect(() => { load(); }, []);

  const addCharacter = () => {
    if (!newName.trim()) return;
    const created = ipcRenderer.sendSync('db-create-character', { showId: show.id, name: newName, actorName: newActor });
    const newId = created?.id ?? (ipcRenderer.sendSync('db-get-characters', show.id) || []).slice(-1)[0]?.id;
    if (newId && (newNotes.trim() || newPhoto)) {
      ipcRenderer.sendSync('db-update-character', { characterId: newId, name: newName, actorName: newActor, costumeNotes: newNotes, photoPath: newPhoto });
    }
    const row = newId && getRow(newId);
    if (row) record({ undo: () => ipcRenderer.sendSync('db-delete-character', row.id), redo: () => ipcRenderer.sendSync('db-restore-row', { table: 'characters', row }) });
    setNewName(''); setNewActor(''); setNewNotes(''); setNewPhoto('');
    load();
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const startEdit = (char) => {
    setEditingId(char.id);
    setEditName(char.name);
    setEditActor(char.actor_name || '');
    setEditNotes(char.costume_notes || '');
    setEditPhoto(char.photo_path || '');
  };

  const saveEdit = () => {
    const was = characters.find(c => c.id === editingId);
    const after = { characterId: editingId, name: editName, actorName: editActor, costumeNotes: editNotes, photoPath: editPhoto };
    ipcRenderer.sendSync('db-update-character', after);
    if (was) { const before = fields(was); record({ undo: () => ipcRenderer.sendSync('db-update-character', before), redo: () => ipcRenderer.sendSync('db-update-character', after) }); }
    setEditingId(null);
    load();
  };

  const deleteCharacter = (id) => {
    if (!window.confirm('Delete this character? They come out of every cue. ⌘Z brings them back.')) return;
    const result = ipcRenderer.sendSync('db-delete-character', id);
    if (result?.success && result.row) {
      const { row, firstIn, extrasBefore } = result;
      record({
        undo: () => { ipcRenderer.sendSync('db-restore-row', { table: 'characters', row }); ipcRenderer.sendSync('db-restore-character-refs', { characterId: row.id, firstIn, extrasBefore }); },
        redo: () => ipcRenderer.sendSync('db-delete-character', row.id),
      });
    }
    load();
  };

  const choosePhoto = () => {
    const result = ipcRenderer.sendSync('dialog-open-image');
    if (result) setEditPhoto(result);
  };

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragItem.current === null) return;   // a photo being dropped, not a character being moved
    setDragOverId(dropSlot(e, index));
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const slot = dragOverId || dropSlot(e, index);
    if (dragItem.current === null || moveTo(dragItem.current, slot) === dragItem.current) { dragItem.current = null; setDragOverId(null); return; }
    const newChars = moveItem(characters, dragItem.current, slot);
    const before = characters.map((c, i) => ({ id: c.id, sort_order: c.sort_order ?? (i + 1) * 1000 }));
    const updates = newChars.map((c, i) => ({ id: c.id, sort_order: (i + 1) * 1000 }));
    ipcRenderer.sendSync('db-reorder-characters', updates);
    record({ undo: () => ipcRenderer.sendSync('db-reorder-characters', before), redo: () => ipcRenderer.sendSync('db-reorder-characters', updates) });
    dragItem.current = null;
    setDragOverId(null);
    load();
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
    color: '#FFFFFF', padding: '7px 10px', fontSize: '13px', outline: 'none', width: '100%',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1E1E1E' }}>
     <AppHeader title="Characters" onBack={() => navigate('show', show)} backLabel={show.title}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{characters.length} characters</span>
      </AppHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          <div data-tour="add-character" style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add character</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Character name *</div>
                  <input ref={nameInputRef} style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCharacter()} placeholder="Character name" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Performer</div>
                <input style={inputStyle} value={newActor} onChange={e => setNewActor(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCharacter()} placeholder="Performer's name" />
              </div>
            </div>
<div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Costume notes</div>
              <input style={inputStyle} value={newNotes} onChange={e => setNewNotes(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCharacter()}
                placeholder="e.g. red jacket, black hat" />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '6px' }}>Photo (optional)</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#0A84FF'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  onDrop={e => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    const droppedPath = getDroppedImagePath(e);
                    if (droppedPath) setNewPhoto(droppedPath);
                  }}
                  style={{ width: '70px', height: '70px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, transition: 'border-color 0.15s', cursor: 'pointer' }}
                  onClick={() => { const result = ipcRenderer.sendSync('dialog-open-image'); if (result) setNewPhoto(result); }}>
                  {newPhoto ? (
                    <img src={getImageSrc(newPhoto)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '6px' }}>
                      <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.28)' }}>+</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', marginTop: '2px' }}>Drop or click</div>
                    </div>
                  )}
                </div>
                {newPhoto && (
                  <button onClick={() => setNewPhoto('')} style={{ padding: '5px 10px', background: 'rgba(255,69,58,0.14)', border: 'none', borderRadius: '6px', color: '#FF453A', fontSize: '11px', cursor: 'pointer' }}>Remove</button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={addCharacter} style={{ padding: '7px 18px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                Add Character
              </button>
            </div>
          </div>

          <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Character list — drag to reorder
          </div>

          {characters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.28)', fontSize: '14px' }}>
              No characters yet — add your first character above
            </div>
          ) : (
            // Apple grouped list: one rounded panel, rows divided by hairlines
            <div style={{ display: 'flex', flexDirection: 'column', background: '#2A2A2A', borderRadius: '10px', overflow: 'hidden' }}>
              {characters.map((char, index) => (
                <div key={char.id}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDrop(e, index)}
                  onDragLeave={() => setDragOverId(null)}
                  onDragEnd={() => { dragItem.current = null; setDragOverId(null); }}
                  style={{
                    borderTop: index > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    ...dropLineStyle(dragOverId, index, dragItem.current),
                    padding: '10px 14px',
                    cursor: 'grab', transition: 'background 0.1s',
                  }}>
                  {editingId === char.id ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Character name</div>
                          <input style={inputStyle} value={editName} onChange={e => setEditName(e.target.value)} />
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Performer</div>
                          <input style={inputStyle} value={editActor} onChange={e => setEditActor(e.target.value)} />
                        </div>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Costume notes</div>
                        <input style={inputStyle} value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="e.g. red jacket, black hat" />
                      </div>
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '6px' }}>Photo (optional)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                    onDragEnter={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = '#0A84FF'; }}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = '#0A84FF'; }}
                    onDragLeave={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    onDrop={e => { 
                      e.preventDefault(); 
                      e.stopPropagation();
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      const droppedPath = getDroppedImagePath(e);
                      if (droppedPath) setEditPhoto(droppedPath);
                    }}
                    style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => { const result = ipcRenderer.sendSync('dialog-open-image'); if (result) setEditPhoto(result); }}>
                    {editPhoto ? (
                      <img src={getImageSrc(editPhoto)}style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '4px' }}>
                        <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.28)' }}>+</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)' }}>Drop or click</div>
                      </div>
                    )}
                  </div>
                          <button onClick={choosePhoto} style={{ padding: '6px 12px', background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'rgba(255,255,255,0.62)', fontSize: '12px', cursor: 'pointer' }}>
                            Choose photo...
                          </button>
                          {editPhoto && <button onClick={() => setEditPhoto('')} style={{ padding: '6px 12px', background: 'rgba(255,69,58,0.14)', border: 'none', borderRadius: '6px', color: '#FF453A', fontSize: '12px', cursor: 'pointer' }}>Remove</button>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setEditingId(null)} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                        <button onClick={saveEdit} style={{ padding: '6px 14px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: '18px', cursor: 'grab', flexShrink: 0 }}>⠿</div>
                      {char.photo_path ? (
                        <img src={getImageSrc(char.photo_path)} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>◈</div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '600' }}>{index + 1}.</span>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF' }}>{char.name}</span>
                          {char.actor_name && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.52)' }}>— {char.actor_name}</span>}
                        </div>
                        {char.costume_notes && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px', fontStyle: 'italic' }}>{char.costume_notes}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <label title="Include this character on the Characters print sheet"
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '6px', cursor: 'pointer', fontSize: '12px', color: char.print_on_sheet === 0 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.75)' }}>
                          <input type="checkbox" checked={char.print_on_sheet !== 0}
                            onChange={e => togglePrint(char, e.target.checked)}
                            style={{ width: '15px', height: '15px', accentColor: '#0A84FF', cursor: 'pointer', margin: 0 }} />
                          Print
                        </label>
                        <button onClick={() => startEdit(char)}
                          style={{ background: 'transparent', border: 'none', borderRadius: '6px', color: '#409CFF', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Edit</button>
                        <button onClick={() => deleteCharacter(char.id)}
                          style={{ background: 'transparent', border: 'none', borderRadius: '6px', color: '#FF453A', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Tips steps={TIPS.characters} />
    </div>
  );
}

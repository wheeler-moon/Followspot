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
    if (!editName.trim()) return;
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

  const addForm = { name: newName, actor: newActor, notes: newNotes, photo: newPhoto };
  const setAddForm = (f) => { setNewName(f.name); setNewActor(f.actor); setNewNotes(f.notes); setNewPhoto(f.photo); };
  const editForm = { name: editName, actor: editActor, notes: editNotes, photo: editPhoto };
  const setEditForm = (f) => { setEditName(f.name); setEditActor(f.actor); setEditNotes(f.notes); setEditPhoto(f.photo); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1E1E1E' }}>
     <AppHeader title="Characters" onBack={() => navigate('show', show)} backLabel={show.title}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{characters.length} characters</span>
      </AppHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>

          <div data-tour="add-character" style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add character</div>
            <CharacterForm form={addForm} onChange={setAddForm} nameRef={nameInputRef}
              onSubmit={addCharacter} submitLabel="Add Character" />
          </div>

          <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Character list — drag to reorder, double-click to edit
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
                  draggable={editingId !== char.id}
                  onDoubleClick={e => { if (editingId !== char.id && !e.target.closest('label, button')) startEdit(char); }}
                  title={editingId === char.id ? undefined : 'Double-click to edit'}
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDrop(e, index)}
                  onDragLeave={() => setDragOverId(null)}
                  onDragEnd={() => { dragItem.current = null; setDragOverId(null); }}
                  style={{
                    borderTop: index > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    ...dropLineStyle(dragOverId, index, dragItem.current),
                    padding: '10px 14px',
                    cursor: editingId === char.id ? 'default' : 'grab', transition: 'background 0.1s',
                  }}>
                  {editingId === char.id ? (
                    <CharacterForm form={editForm} onChange={setEditForm} autoFocus
                      onSubmit={saveEdit} submitLabel="Save" onCancel={() => setEditingId(null)} />
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

const inputStyle = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
  color: '#FFFFFF', padding: '0 10px', height: '28px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
};

// One compact form for adding and editing: photo on the left, name / performer / costume notes beside it.
// Return saves, Escape cancels (when editing).
function CharacterForm({ form, onChange, onSubmit, submitLabel, onCancel, nameRef, autoFocus }) {
  const set = (k) => (e) => onChange({ ...form, [k]: e.target.value });
  const keys = (e) => { if (e.key === 'Enter') onSubmit(); if (e.key === 'Escape' && onCancel) onCancel(); };
  const pick = () => { const result = ipcRenderer.sendSync('dialog-open-image'); if (result) onChange({ ...form, photo: result }); };
  const idle = 'rgba(255,255,255,0.1)';
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }} onDoubleClick={e => e.stopPropagation()}>
      <div title={form.photo ? 'Click to change the photo' : 'Photo: drop an image or click'}
        onDragEnter={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = '#0A84FF'; }}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); e.currentTarget.style.borderColor = '#0A84FF'; }}
        onDragLeave={e => { e.stopPropagation(); e.currentTarget.style.borderColor = idle; }}
        onDrop={e => {
          e.preventDefault(); e.stopPropagation();
          e.currentTarget.style.borderColor = idle;
          const dropped = getDroppedImagePath(e);
          if (dropped) onChange({ ...form, photo: dropped });
        }}
        onClick={pick}
        style={{ position: 'relative', width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: `2px dashed ${idle}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'border-color 0.15s', boxSizing: 'border-box' }}>
        {form.photo ? (
          <>
            <img src={getImageSrc(form.photo)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
            <div title="Remove photo" onClick={e => { e.stopPropagation(); onChange({ ...form, photo: '' }); }}
              style={{ position: 'absolute', top: '-7px', right: '-7px', width: '18px', height: '18px', borderRadius: '9px', background: '#3A3A3A', border: '1px solid rgba(255,255,255,0.2)', color: '#FFFFFF', fontSize: '12px', lineHeight: '16px', textAlign: 'center' }}>×</div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.28)', lineHeight: '16px' }}>+</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', marginTop: '2px' }}>Photo</div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input ref={nameRef} autoFocus={autoFocus} style={inputStyle} value={form.name} onChange={set('name')} onKeyDown={keys} placeholder="Character name" />
          <input style={inputStyle} value={form.actor} onChange={set('actor')} onKeyDown={keys} placeholder="Performer" />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input style={inputStyle} value={form.notes} onChange={set('notes')} onKeyDown={keys} placeholder="Costume notes" />
          {onCancel && (
            <button onClick={onCancel} style={{ height: '28px', padding: '0 12px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>Cancel</button>
          )}
          <button onClick={onSubmit} disabled={!form.name.trim()}
            style={{ height: '28px', padding: '0 14px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: form.name.trim() ? 'pointer' : 'default', opacity: form.name.trim() ? 1 : 0.4, flexShrink: 0, fontFamily: 'inherit' }}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}

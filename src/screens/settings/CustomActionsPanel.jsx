import React, { useState, useEffect } from 'react';
import useEscape from '../../useEscape';
import { actionNameMap } from '../../actionNames';
import ActionIcon from '../../components/ActionIcon';
const { ipcRenderer } = window.require('electron');

const DEFAULT_ACTIONS = [
  { name: 'Pick Up', color: '#30D158' },
  { name: 'Increase', color: '#30D158' },
  { name: 'Decrease', color: '#FF453A' },
  { name: 'Fade Out', color: '#FF453A' },
  { name: 'Fade In Place', color: '#FF453A' },
  { name: 'Bump Up', color: '#30D158' },
  { name: 'Bump Out', color: '#FF453A' },
  { name: 'Swap To', color: '#409CFF' },
  { name: 'Slide To', color: '#409CFF' },
  { name: 'Stay With', color: '#409CFF' },
  { name: 'Iris In', color: '#409CFF' },
  { name: 'Iris Out', color: '#409CFF' },
  { name: 'Iris/Fade Up', color: '#409CFF' },
  { name: 'Iris/Fade Down', color: '#409CFF' },
  { name: 'Iris/Fade Out', color: '#409CFF' },
  { name: 'Up & Out', color: '#30D158' },
  { name: 'Dump & Restore', color: '#30D158' },
  { name: 'Bump Color', color: '#FF9F0A' },
  { name: 'Roll Color', color: '#FF9F0A' },
  { name: 'Ballyhoo', color: '#FF9F0A' },
  { name: 'Off', color: 'rgba(255,255,255,0.28)' },
  { name: 'Tracked', color: 'rgba(255,255,255,0.45)' },
];


// Show Settings → Custom Actions.
// Built-in actions: click one to rename it for this show (cues keep the built-in action, so its symbol and
// behaviour stay; only the name shown changes, see src/actionNames.js). Custom actions: click one to rename
// it (its cues follow), change its icon or delete it. Icons come from SpotPlot's own symbols (the library)
// or an image you choose.

// Symbols a custom action can borrow: the built-in actions' plus plain colored circles (blue and purple
// match the blue action symbols and the iris purple)
const LIBRARY = [...DEFAULT_ACTIONS.filter(a => a.name !== 'Tracked').map(a => a.name), 'Green Circle', 'Red Circle', 'Yellow Circle', 'Blue Circle', 'Purple Circle'];

const imageSrc = (path) => {
  if (!path) return null;
  try {
    const fs = window.require('fs');
    const data = fs.readFileSync(path);
    const ext = path.split('.').pop().toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
    return `data:${mime};base64,${data.toString('base64')}`;
  } catch (e) { return null; }
};

// A custom action's icon: one of SpotPlot's symbols, an image, or nothing (an empty space its size)
function CustomIcon({ action, size = 28 }) {
  if (action.builtinIcon) return <ActionIcon action={action.builtinIcon} size={size} />;
  const src = imageSrc(action.icon);
  if (src) return <img src={src} style={{ width: size, height: size, objectFit: 'contain' }} />;
  return <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" />;
}

const C = { label1: '#FFFFFF', label2: 'rgba(255,255,255,0.55)', label3: 'rgba(255,255,255,0.25)', accent: '#0A84FF', red: '#FF453A', separator: 'rgba(255,255,255,0.10)' };
const inputStyle = { height: '28px', boxSizing: 'border-box', background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '6px', color: '#FFFFFF', padding: '0 10px', fontSize: '13px', outline: 'none', fontFamily: 'inherit' };
const button = (kind) => ({ height: '28px', padding: '0 14px', borderRadius: '14px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
  background: kind === 'primary' ? C.accent : 'rgba(255,255,255,0.08)', color: kind === 'danger' ? C.red : '#FFFFFF' });

// Choose an icon: SpotPlot's symbols (duplicates of built-in actions are fine), your own image, or none
function IconChooser({ value, onChange }) {
  const chooseImage = () => {
    const path = ipcRenderer.sendSync('dialog-open-image');
    if (path) onChange({ icon: path, builtinIcon: null });
  };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {LIBRARY.map(name => {
          const on = value.builtinIcon === name;
          return (
            <div key={name} title={name} onClick={() => onChange({ icon: null, builtinIcon: name })}
              style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', cursor: 'pointer',
                background: on ? 'rgba(10,132,255,0.22)' : 'rgba(255,255,255,0.05)', boxShadow: on ? `inset 0 0 0 1px ${C.accent}` : 'none' }}>
              <ActionIcon action={name} size={24} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={chooseImage} style={button()}>Choose Image…</button>
        <button onClick={() => onChange({ icon: null, builtinIcon: null })} style={button()}>No Icon</button>
        {value.icon && !value.builtinIcon && imageSrc(value.icon) && <img src={imageSrc(value.icon)} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: '4px', boxShadow: `0 0 0 1px ${C.accent}` }} />}
      </div>
    </div>
  );
}

// The edit box for one action (built-in: its name in this show; custom: name, icon, delete; new: name and icon)
function EditAction({ target, actionNames, takenNames, otherActions, countUses, onSaveBuiltin, onSaveCustom, onAdd, onDelete, onReplaceDelete, onClose }) {
  useEscape(onClose);
  const builtin = target.kind === 'builtin';
  const isNew = target.kind === 'new';
  if (isNew) target = { ...target, action: { name: '' } };
  const [name, setName] = useState(builtin ? (actionNames[target.name] || '') : target.action.name);
  const [icon, setIcon] = useState(builtin ? null : { icon: target.action.icon || null, builtinIcon: target.action.builtinIcon || null });
  const [error, setError] = useState(null);
  // Deleting an action that cues use: what those cues get instead (an existing action, or a new one)
  const [deleting, setDeleting] = useState(null);   // { count, to: '' | action name | '__new', newName }
  const startDelete = () => {
    const count = countUses(target.action.name);
    if (!count) { onDelete(target.index); onClose(); return; }
    setDeleting({ count, to: '', newName: '' });
  };
  const confirmDelete = () => {
    if (deleting.to === '__new') {
      const n = deleting.newName.trim();
      if (!n) return setError('Give the new action a name.');
      if (takenNames.has(n.toLowerCase())) return setError(`“${n}” is already an action in this show.`);
      onReplaceDelete(target.index, n, { name: n, color: 'rgba(255,255,255,0.62)', icon: null, builtinIcon: null });
    } else {
      if (!deleting.to) return setError('Choose what those cues should use instead.');
      onReplaceDelete(target.index, deleting.to, null);
    }
    onClose();
  };
  const save = () => {
    const n = name.trim();
    const original = builtin ? target.name : target.action.name;
    if (!builtin && !n) return setError('Give the action a name.');
    if (n && n !== original && takenNames.has(n.toLowerCase())) return setError(`“${n}” is already an action in this show.`);
    if (builtin) onSaveBuiltin(target.name, n);
    else if (isNew) onAdd({ name: n, color: 'rgba(255,255,255,0.62)', icon: icon.icon || null, builtinIcon: icon.builtinIcon || null });
    else onSaveCustom(target.index, { ...target.action, name: n, ...icon });
    onClose();
  };
  const box = (content) => (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '360px', background: '#2A2A2A', borderRadius: '16px', padding: '16px', boxShadow: '0 18px 48px rgba(0,0,0,0.45)' }}>{content}</div>
    </div>
  );
  if (deleting) {
    const cues = `${deleting.count} cue${deleting.count === 1 ? '' : 's'}`;
    return box(
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <CustomIcon action={target.action} size={28} />
          <div style={{ fontSize: '13px', fontWeight: '700', color: C.label1 }}>Delete “{target.action.name}”?</div>
        </div>
        <div style={{ fontSize: '13px', color: C.label2, lineHeight: '18px', marginBottom: '12px' }}>{cues} use this action. What should they use instead?</div>
        <select autoFocus value={deleting.to} onChange={e => { setDeleting({ ...deleting, to: e.target.value }); setError(null); }}
          style={{ ...inputStyle, width: '100%', color: deleting.to ? '#FFFFFF' : C.label2 }}>
          <option value="" disabled>Choose an action…</option>
          {otherActions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          <option value="__new">A new action…</option>
        </select>
        {deleting.to === '__new' && (
          <input autoFocus value={deleting.newName} placeholder="New action name" onChange={e => { setDeleting({ ...deleting, newName: e.target.value }); setError(null); }}
            onKeyDown={e => { if (e.key === 'Enter') confirmDelete(); }} style={{ ...inputStyle, width: '100%', marginTop: '8px' }} />
        )}
        <div style={{ fontSize: '11px', color: error ? C.red : C.label3, margin: '6px 0 0', lineHeight: '14px', minHeight: '14px' }}>
          {error || (deleting.to === '__new' ? 'You can give it an icon afterwards.' : '')}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <div style={{ flex: 1 }} />
          <button onClick={() => { setDeleting(null); setError(null); }} style={button()}>Don’t Delete</button>
          <button onClick={confirmDelete} style={{ ...button(), background: C.red }}>Replace and Delete</button>
        </div>
      </>
    );
  }
  return box(
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          {builtin ? <ActionIcon action={target.name} size={28} /> : <CustomIcon action={{ ...target.action, ...icon }} size={28} />}
          <div style={{ fontSize: '13px', fontWeight: '700', color: C.label1 }}>{builtin ? target.name : isNew ? 'New custom action' : 'Custom action'}</div>
        </div>
        <div style={{ fontSize: '11px', color: C.label2, marginBottom: '4px' }}>{builtin ? 'Name in this show' : 'Name'}</div>
        <input autoFocus value={name} placeholder={builtin ? target.name : 'Action name'} onChange={e => { setName(e.target.value); setError(null); }}
          onKeyDown={e => { if (e.key === 'Enter') save(); }} style={{ ...inputStyle, width: '100%' }} />
        <div style={{ fontSize: '11px', color: error ? C.red : C.label3, margin: '6px 0 12px', lineHeight: '14px' }}>
          {error || (builtin ? 'Shown in this show’s cue list, action menu, prints and on iPads. The symbol stays. Leave empty for the standard name.' : isNew ? 'Pick a SpotPlot symbol or your own image (optional).' : 'Cues that use this action follow the new name.')}
        </div>
        {!builtin && (
          <>
            <div style={{ fontSize: '11px', color: C.label2, marginBottom: '6px' }}>Icon</div>
            <IconChooser value={icon} onChange={setIcon} />
          </>
        )}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {builtin && actionNames[target.name] && <button onClick={() => { onSaveBuiltin(target.name, ''); onClose(); }} style={button()}>Reset</button>}
          {!builtin && !isNew && <button onClick={startDelete} style={button('danger')}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={button()}>Cancel</button>
          <button onClick={save} style={button('primary')}>{isNew ? 'Add' : 'Save'}</button>
        </div>
      </>
  );
}

export default function CustomActionsPanel({ show }) {
  const [customActions, setCustomActions] = useState([]);
  const [actionNames, setActionNames] = useState({});
  const [editing, setEditing] = useState(null);   // { kind: 'builtin', name }, { kind: 'custom', index, action } or { kind: 'new' }

  useEffect(() => {
    const updated = ipcRenderer.sendSync('db-get-show', show.id);
    setCustomActions(updated?.custom_actions ? JSON.parse(updated.custom_actions) : []);
    setActionNames(actionNameMap(updated?.action_names));
  }, []);

  const saveCustoms = (actions) => {
    setCustomActions(actions);
    ipcRenderer.sendSync('db-update-show', { showId: show.id, custom_actions: JSON.stringify(actions) });
  };
  const saveBuiltinName = (builtin, name) => {
    const next = { ...actionNames };
    if (name && name !== builtin) next[builtin] = name; else delete next[builtin];
    setActionNames(next);
    ipcRenderer.sendSync('db-update-show', { showId: show.id, action_names: JSON.stringify(next) });
  };
  const saveCustom = (index, action) => {
    const old = customActions[index];
    if (old.name !== action.name) ipcRenderer.sendSync('db-rename-action', { showId: show.id, from: old.name, to: action.name });
    saveCustoms(customActions.map((a, i) => (i === index ? action : a)));
  };

  // How many cues use an action (any spot), for deleting one
  const countUses = (name) => {
    const data = ipcRenderer.sendSync('db-get-cue-list', show.id);
    return new Set((data?.spotCues || []).filter(sc => sc.action === name).map(sc => sc.cue_id)).size;
  };
  // Delete a custom action, first moving its cues to another action (or a new one, added in its place)
  const replaceAndDelete = (index, to, newAction) => {
    const old = customActions[index];
    ipcRenderer.sendSync('db-rename-action', { showId: show.id, from: old.name, to });
    saveCustoms(newAction ? customActions.map((a, i) => (i === index ? newAction : a)) : customActions.filter((_, i) => i !== index));
  };

  // Every name already in use in this show (built-in names, their renamed names, custom names)
  const taken = new Set([...DEFAULT_ACTIONS.map(a => a.name), ...Object.values(actionNames), ...customActions.map(a => a.name)].map(n => n.toLowerCase()));

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' };

  return (
    <div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.52)', marginBottom: '16px', lineHeight: '18px' }}>
        Click an action to rename it for this show. <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: C.accent, margin: '0 4px 1px 2px' }} />marks your own actions; + adds one.
      </div>

      {/* SpotPlot's actions, then this show's own (a blue dot marks them), then + to add one */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '24px' }}>
        {DEFAULT_ACTIONS.filter(a => a.name !== 'Tracked').map(a => (
          <div key={a.name} onClick={() => setEditing({ kind: 'builtin', name: a.name })} title="Rename for this show" style={card}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            <ActionIcon action={a.name} size={28} />
            <div style={{ fontSize: '11px', color: actionNames[a.name] ? '#FFFFFF' : 'rgba(255,255,255,0.52)', textAlign: 'center', lineHeight: 1.2, fontWeight: actionNames[a.name] ? '600' : '400' }}>
              {actionNames[a.name] || a.name}
              {actionNames[a.name] && <div style={{ fontSize: '9.5px', color: C.label3, fontWeight: '400', marginTop: '2px' }}>{a.name}</div>}
            </div>
          </div>
        ))}
        {customActions.map((a, i) => (
          <div key={'c' + i} onClick={() => setEditing({ kind: 'custom', index: i, action: a })} title="Custom action: click to edit" style={{ ...card, position: 'relative' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            <span style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', borderRadius: '50%', background: C.accent }} />
            <CustomIcon action={a} size={28} />
            <div style={{ fontSize: '11px', color: '#FFFFFF', textAlign: 'center', lineHeight: 1.2 }}>{a.name}</div>
          </div>
        ))}
        <div data-tour="add-custom-action" onClick={() => setEditing({ kind: 'new' })} title="Add a custom action"
          style={{ ...card, justifyContent: 'center', background: 'transparent', border: '1px dashed rgba(255,255,255,0.18)', color: C.label2, fontSize: '22px', fontWeight: '300', minHeight: '64px' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }} onMouseLeave={e => { e.currentTarget.style.color = C.label2; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}>
          +
        </div>
      </div>

      {editing && (
        <EditAction target={editing} actionNames={actionNames} takenNames={taken}
          onSaveBuiltin={saveBuiltinName} onSaveCustom={saveCustom} onAdd={a => saveCustoms([...customActions, a])}
          countUses={countUses} onReplaceDelete={replaceAndDelete}
          otherActions={[
            ...DEFAULT_ACTIONS.filter(a => a.name !== 'Tracked').map(a => ({ value: a.name, label: actionNames[a.name] || a.name })),
            ...customActions.filter((_, i) => editing.kind !== 'custom' || i !== editing.index).map(a => ({ value: a.name, label: a.name })),
          ]}
          onDelete={i => saveCustoms(customActions.filter((_, j) => j !== i))}
          onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

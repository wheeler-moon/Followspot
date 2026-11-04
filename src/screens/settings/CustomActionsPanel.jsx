import React, { useState, useEffect } from 'react';
import useEscape from '../../useEscape';
import { actionNameMap } from '../../actionNames';
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

function ActionIcon({ action, size = 28 }) {
  const s = size;
  switch (action) {
    case 'Pick Up': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 24,20 8,20" fill="#30D158"/><polygon points="16,14 22,26 10,26" fill="#6BD58A" opacity="0.5"/></svg>;
    case 'Increase': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,5 23,18 9,18" fill="#30D158"/></svg>;
    case 'Decrease': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,27 23,14 9,14" fill="#FF453A"/></svg>;
    case 'Fade Out': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,28 24,12 8,12" fill="#FF453A"/><polygon points="16,18 22,6 10,6" fill="#FF6961" opacity="0.5"/></svg>;
    case 'Fade In Place': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#FF453A" strokeWidth="2"/><polygon points="16,27 23,14 9,14" fill="#FF453A"/></svg>;
    case 'Bump Up': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="12" y="9" width="8" height="3" rx="1.5" fill="#30D158"/><rect x="10" y="14" width="12" height="3" rx="1.5" fill="#30D158" opacity="0.6"/><rect x="8" y="19" width="16" height="3" rx="1.5" fill="#30D158" opacity="0.3"/></svg>;
    case 'Bump Out': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="8" y="9" width="16" height="3" rx="1.5" fill="#FF453A" opacity="0.3"/><rect x="10" y="14" width="12" height="3" rx="1.5" fill="#FF453A" opacity="0.6"/><rect x="12" y="19" width="8" height="3" rx="1.5" fill="#FF453A"/></svg>;
    case 'Swap To': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="8" cy="23" r="3.5" fill="#64D2FF" opacity="0.4"/><circle cx="24" cy="23" r="3.5" fill="#64D2FF"/><path d="M9 17 Q16 4 22.5 14.5" fill="none" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><polygon points="19.5,14.5 25,17.5 24.5,11.5" fill="#64D2FF"/></svg>;
    case 'Slide To': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="6" y1="16" x2="26" y2="16" stroke="#64D2FF" strokeWidth="2.5" strokeLinecap="round"/><polygon points="22,10 30,16 22,22" fill="#64D2FF"/><polygon points="10,10 2,16 10,22" fill="#64D2FF"/></svg>;
    case 'Stay With': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="none" stroke="#64D2FF" strokeWidth="2.25"/><circle cx="16" cy="16" r="3" fill="#64D2FF"/><line x1="16" y1="3" x2="16" y2="6.5" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><line x1="16" y1="25.5" x2="16" y2="29" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><line x1="3" y1="16" x2="6.5" y2="16" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><line x1="25.5" y1="16" x2="29" y2="16" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/></svg>;
    case 'Iris In': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#A066D3" strokeWidth="2"/><line x1="8" y1="16" x2="11" y2="16" stroke="#A066D3" strokeWidth="2" strokeLinecap="round"/><polygon points="10,12.5 14.5,16 10,19.5" fill="#A066D3"/><line x1="24" y1="16" x2="21" y2="16" stroke="#A066D3" strokeWidth="2" strokeLinecap="round"/><polygon points="22,12.5 17.5,16 22,19.5" fill="#A066D3"/></svg>;
    case 'Iris Out': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#A066D3" strokeWidth="2"/><line x1="8" y1="16" x2="24" y2="16" stroke="#A066D3" strokeWidth="2" strokeLinecap="round"/><polygon points="10,12 6,16 10,20" fill="#A066D3"/><polygon points="22,12 26,16 22,20" fill="#A066D3"/></svg>;
    case 'Iris/Fade Up': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="18" r="9" fill="none" stroke="#A066D3" strokeWidth="2"/><polygon points="16,4 22,14 10,14" fill="#30D158"/></svg>;
    case 'Iris/Fade Down': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="14" r="9" fill="none" stroke="#A066D3" strokeWidth="2"/><polygon points="16,28 22,18 10,18" fill="#FF453A"/></svg>;
    case 'Iris/Fade Out': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="none" stroke="#A066D3" strokeWidth="2"/><line x1="9" y1="16" x2="23" y2="16" stroke="#FF453A" strokeWidth="2"/><polygon points="11,12 7,16 11,20" fill="#FF453A"/><polygon points="21,12 25,16 21,20" fill="#FF453A"/></svg>;
    case 'Up & Out': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 22,14 10,14" fill="#30D158"/><polygon points="16,28 22,18 10,18" fill="#FF453A"/></svg>;
    case 'Dump & Restore': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="10,4 22,4 16,14" fill="#FF453A"/><polygon points="16,18 22,28 10,28" fill="#30D158"/></svg>;
    case 'Bump Color': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#FF9F0A" strokeWidth="1.5"/><rect x="12" y="11" width="3" height="10" fill="#6BD58A"/><rect x="16" y="11" width="3" height="10" fill="#FF6961"/></svg>;
    case 'Roll Color': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#FF9F0A" strokeWidth="1.5"/><rect x="9" y="8" width="3.5" height="16" rx="1" fill="#FF6961"/><rect x="12.5" y="8" width="3.5" height="16" fill="#FFB340"/><rect x="16" y="8" width="3.5" height="16" fill="#6BD58A"/><rect x="19.5" y="8" width="3.5" height="16" rx="1" fill="#64D2FF"/></svg>;
    case 'Ballyhoo': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="10.5" cy="16" r="7.5" fill="none" stroke="#FF9F0A" strokeWidth="2.25"/><circle cx="21.5" cy="16" r="7.5" fill="none" stroke="#FF9F0A" strokeWidth="2.25"/></svg>;
    // Plain colored circles: extra icons for custom actions (Show Settings → Custom Actions)
    case 'Green Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#30D158"/></svg>;
    case 'Red Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#FF453A"/></svg>;
    case 'Yellow Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#FFD60A"/></svg>;
    case 'Off': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="8" y1="8" x2="24" y2="24" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/><line x1="24" y1="8" x2="8" y2="24" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/></svg>;
    case 'Tracked': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="6" y1="16" x2="26" y2="16" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/><polygon points="20,10 26,16 20,22" fill="#555"/></svg>;
    default: return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="#333"/></svg>;
  }
}

// Show Settings → Custom Actions.
// Built-in actions: click one to rename it for this show (cues keep the built-in action, so its symbol and
// behaviour stay; only the name shown changes, see src/actionNames.js). Custom actions: click one to rename
// it (its cues follow), change its icon or delete it. Icons come from SpotPlot's own symbols (the library)
// or an image you choose.

// Symbols a custom action can borrow: the built-in actions' plus three plain colored circles
const LIBRARY = [...DEFAULT_ACTIONS.filter(a => a.name !== 'Tracked').map(a => a.name), 'Green Circle', 'Red Circle', 'Yellow Circle'];

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

// A custom action's icon: one of SpotPlot's symbols, an image, or a plain dot
function CustomIcon({ action, size = 28 }) {
  if (action.builtinIcon) return <ActionIcon action={action.builtinIcon} size={size} />;
  const src = imageSrc(action.icon);
  if (src) return <img src={src} style={{ width: size, height: size, objectFit: 'contain' }} />;
  return <svg width={size} height={size} viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="#5E5CE6" /></svg>;
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

// The edit box for one action (built-in: its name in this show; custom: name, icon, delete)
function EditAction({ target, actionNames, takenNames, onSaveBuiltin, onSaveCustom, onDelete, onClose }) {
  useEscape(onClose);
  const builtin = target.kind === 'builtin';
  const [name, setName] = useState(builtin ? (actionNames[target.name] || '') : target.action.name);
  const [icon, setIcon] = useState(builtin ? null : { icon: target.action.icon || null, builtinIcon: target.action.builtinIcon || null });
  const [error, setError] = useState(null);
  const save = () => {
    const n = name.trim();
    const original = builtin ? target.name : target.action.name;
    if (!builtin && !n) return setError('Give the action a name.');
    if (n && n !== original && takenNames.has(n.toLowerCase())) return setError(`“${n}” is already an action in this show.`);
    if (builtin) onSaveBuiltin(target.name, n); else onSaveCustom(target.index, { ...target.action, name: n, ...icon });
    onClose();
  };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '360px', background: '#2A2A2A', borderRadius: '16px', padding: '16px', boxShadow: '0 18px 48px rgba(0,0,0,0.45)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          {builtin ? <ActionIcon action={target.name} size={28} /> : <CustomIcon action={{ ...target.action, ...icon }} size={28} />}
          <div style={{ fontSize: '13px', fontWeight: '700', color: C.label1 }}>{builtin ? target.name : 'Custom action'}</div>
        </div>
        <div style={{ fontSize: '11px', color: C.label2, marginBottom: '4px' }}>{builtin ? 'Name in this show' : 'Name'}</div>
        <input autoFocus value={name} placeholder={builtin ? target.name : 'Action name'} onChange={e => { setName(e.target.value); setError(null); }}
          onKeyDown={e => { if (e.key === 'Enter') save(); }} style={{ ...inputStyle, width: '100%' }} />
        <div style={{ fontSize: '11px', color: error ? C.red : C.label3, margin: '6px 0 12px', lineHeight: '14px' }}>
          {error || (builtin ? 'Shown in this show’s cue list, action menu, prints and on iPads. The symbol stays. Leave empty for the standard name.' : 'Cues that use this action follow the new name.')}
        </div>
        {!builtin && (
          <>
            <div style={{ fontSize: '11px', color: C.label2, marginBottom: '6px' }}>Icon</div>
            <IconChooser value={icon} onChange={setIcon} />
          </>
        )}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          {builtin && actionNames[target.name] && <button onClick={() => { onSaveBuiltin(target.name, ''); onClose(); }} style={button()}>Reset</button>}
          {!builtin && <button onClick={() => { onDelete(target.index); onClose(); }} style={button('danger')}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={button()}>Cancel</button>
          <button onClick={save} style={button('primary')}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default function CustomActionsPanel({ show }) {
  const [customActions, setCustomActions] = useState([]);
  const [actionNames, setActionNames] = useState({});
  const [editing, setEditing] = useState(null);   // { kind: 'builtin', name } or { kind: 'custom', index, action }
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState({ icon: null, builtinIcon: null });
  const [addError, setAddError] = useState(null);

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

  // Every name already in use in this show (built-in names, their renamed names, custom names)
  const taken = new Set([...DEFAULT_ACTIONS.map(a => a.name), ...Object.values(actionNames), ...customActions.map(a => a.name)].map(n => n.toLowerCase()));

  const addAction = () => {
    const n = newName.trim();
    if (!n) return;
    if (taken.has(n.toLowerCase())) { setAddError(`“${n}” is already an action in this show.`); return; }
    saveCustoms([...customActions, { name: n, color: 'rgba(255,255,255,0.62)', icon: newIcon.icon || null, builtinIcon: newIcon.builtinIcon || null }]);
    setNewName(''); setNewIcon({ icon: null, builtinIcon: null }); setAddError(null);
  };

  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer' };
  const sectionTitle = { fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.52)', marginBottom: '16px', lineHeight: '18px' }}>
        Click a built-in action to give it a different name in this show. Add your own actions below, and click one to change its name or icon.
      </div>

      <div style={sectionTitle}>Built-in actions</div>
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
      </div>

      {customActions.length > 0 && (
        <>
          <div style={sectionTitle}>Custom actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '24px' }}>
            {customActions.map((a, i) => (
              <div key={i} onClick={() => setEditing({ kind: 'custom', index: i, action: a })} title="Edit" style={{ ...card, background: 'rgba(10,132,255,0.16)', border: '1px solid #0A84FF' }}>
                <CustomIcon action={a} size={28} />
                <div style={{ fontSize: '11px', color: '#FFFFFF', textAlign: 'center', lineHeight: 1.2 }}>{a.name}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', fontWeight: '600' }}>Add custom action</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
          <CustomIcon action={newIcon} size={28} />
          <input style={{ ...inputStyle, flex: 1 }} value={newName} onChange={e => { setNewName(e.target.value); setAddError(null); }}
            onKeyDown={e => e.key === 'Enter' && addAction()} placeholder="Action name" />
          <button onClick={addAction} style={button('primary')}>Add</button>
        </div>
        {addError && <div style={{ fontSize: '11px', color: C.red, marginBottom: '8px' }}>{addError}</div>}
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '6px' }}>Icon: pick a SpotPlot symbol or choose your own image (optional)</div>
        <IconChooser value={newIcon} onChange={setNewIcon} />
      </div>

      {editing && (
        <EditAction target={editing} actionNames={actionNames} takenNames={taken}
          onSaveBuiltin={saveBuiltinName} onSaveCustom={saveCustom}
          onDelete={i => saveCustoms(customActions.filter((_, j) => j !== i))}
          onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

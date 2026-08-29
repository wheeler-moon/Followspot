import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const DEFAULT_ACTIONS = [
  'Pick Up','Fade Up','Fade Down','Fade Out','Fade In Place',
  'Bump Up','Bump Out','Swap To','Slide To','Stay With',
  'Iris In','Iris Out','Iris/Fade Up','Iris/Fade Down','Iris/Fade Out',
  'Up & Out','Bump Color','Roll Color','Ballyhoo','Off','Tracked'
];

export default function CustomActionsPanel({ show }) {
  const [customActions, setCustomActions] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const actions = show.custom_actions ? JSON.parse(show.custom_actions) : [];
    setCustomActions(actions);
  }, []);

  const save = (actions) => {
    ipcRenderer.sendSync('db-update-show', { showId: show.id, custom_actions: JSON.stringify(actions) });
  };

  const addAction = () => {
    if (!newName.trim()) return;
    if (DEFAULT_ACTIONS.includes(newName.trim())) return;
    const updated = [...customActions, { name: newName.trim(), color: '#888' }];
    setCustomActions(updated);
    save(updated);
    setNewName('');
  };

  const deleteAction = (index) => {
    const updated = customActions.filter((_, i) => i !== index);
    setCustomActions(updated);
    save(updated);
  };

  const inputStyle = {
    background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px',
    color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none',
  };

  return (
    <div>
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
        Default actions cannot be deleted. You can add custom actions for this show.
      </div>

      <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Default actions</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {DEFAULT_ACTIONS.map(a => (
          <div key={a} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', color: '#666' }}>
            {a}
          </div>
        ))}
      </div>

      <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom actions</div>
      {customActions.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {customActions.map((a, i) => (
            <div key={i} style={{ background: '#1a1a2e', border: '1px solid #534AB7', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', color: '#f0f0f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {a.name}
              <button onClick={() => deleteAction(i)}
                style={{ background: 'none', border: 'none', color: '#c44', fontSize: '14px', cursor: 'pointer', padding: '0', lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '14px' }}>
        <div style={{ fontSize: '11px', color: '#555', marginBottom: '10px', fontWeight: '600' }}>Add custom action</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Action name</div>
            <input style={{ ...inputStyle, width: '100%' }} value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAction()}
              placeholder="e.g. Tracking Iris" />
          </div>
          <button onClick={addAction}
            style={{ padding: '7px 16px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
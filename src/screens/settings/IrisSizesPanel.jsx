import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const DEFAULT_IRIS_SIZES = [
  { label: 'FB', value: 'Full Body' },
  { label: '3/4', value: '3/4 Body' },
  { label: '1/2', value: '1/2 Body' },
  { label: 'H&S', value: 'Head & Shoulders' },
  { label: 'Hd', value: 'Head' },
];

export default function IrisSizesPanel({ show }) {
  const [customSizes, setCustomSizes] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    const updated = ipcRenderer.sendSync('db-get-show', show.id);
    const sizes = updated?.iris_sizes ? JSON.parse(updated.iris_sizes) : [];
    setCustomSizes(sizes);
  }, []);

  const save = (sizes) => {
    ipcRenderer.sendSync('db-update-show', { showId: show.id, iris_sizes: JSON.stringify(sizes) });
  };

  const addSize = () => {
    if (!newLabel.trim() || !newValue.trim()) return;
    const updated = [...customSizes, { label: newLabel.trim(), value: newValue.trim() }];
    setCustomSizes(updated);
    save(updated);
    setNewLabel('');
    setNewValue('');
  };

  const deleteSize = (index) => {
    const updated = customSizes.filter((_, i) => i !== index);
    setCustomSizes(updated);
    save(updated);
  };

  const inputStyle = {
    background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px',
    color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none',
  };

  return (
    <div>
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
        Default iris sizes are always available. Add custom sizes specific to this show.
      </div>

      <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Default sizes</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {DEFAULT_IRIS_SIZES.map(s => (
          <div key={s.value} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '8px 14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#f0f0f0' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom sizes</div>
      {customSizes.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {customSizes.map((s, i) => (
            <div key={i} style={{ background: '#1a1a2e', border: '1px solid #534AB7', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#f0f0f0' }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{s.value}</div>
              </div>
              <button onClick={() => deleteSize(i)}
                style={{ background: 'none', border: 'none', color: '#c44', fontSize: '16px', cursor: 'pointer', padding: '0 2px' }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '14px' }}>
        <div style={{ fontSize: '11px', color: '#555', marginBottom: '10px', fontWeight: '600' }}>Add custom size</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Button label</div>
            <input style={{ ...inputStyle, width: '80px' }} value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSize()}
              placeholder="e.g. Ks" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Full name</div>
            <input style={{ ...inputStyle, width: '160px' }} value={newValue}
              onChange={e => setNewValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSize()}
              placeholder="e.g. Knees" />
          </div>
          <button onClick={addSize}
            style={{ padding: '7px 16px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
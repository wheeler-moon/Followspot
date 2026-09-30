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
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px',
    color: '#FFFFFF', padding: '7px 10px', fontSize: '13px', outline: 'none',
  };

  return (
    <div>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.52)', marginBottom: '16px' }}>
        Default iris sizes are always available. Add custom sizes specific to this show.
      </div>

      <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Default sizes</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {DEFAULT_IRIS_SIZES.map(s => (
          <div key={s.value} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Custom sizes</div>
      {customSizes.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {customSizes.map((s, i) => (
            <div key={i} style={{ background: 'rgba(10,132,255,0.16)', border: '1px solid #0A84FF', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.62)', marginTop: '2px' }}>{s.value}</div>
              </div>
              <button onClick={() => deleteSize(i)}
                style={{ background: 'none', border: 'none', color: '#FF453A', fontSize: '16px', cursor: 'pointer', padding: '0 2px' }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', fontWeight: '600' }}>Add custom size</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Button label</div>
            <input style={{ ...inputStyle, width: '80px' }} value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSize()}
              placeholder="e.g. Ks" />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Full name</div>
            <input style={{ ...inputStyle, width: '160px' }} value={newValue}
              onChange={e => setNewValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSize()}
              placeholder="e.g. Knees" />
          </div>
          <button onClick={addSize}
            style={{ padding: '7px 16px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
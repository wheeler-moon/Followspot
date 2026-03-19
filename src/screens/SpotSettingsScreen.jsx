import React, { useState, useEffect, useRef } from 'react';
const { ipcRenderer } = window.require('electron');

const FIXTURES = ['Strong Super Trouper','Strong Gladiator','Lycian 1290','Lycian Starklite','Robert Juliat Lancelot','Robert Juliat Merlin','Altman Comet','Robe BMFL','Robe Esprite','High End SolaSpot','Moving Light - Other','Other'];

const inputStyle = {
  width: '100%', background: '#111', border: '1px solid #2a2a2a',
  borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px',
  fontSize: '13px', outline: 'none', boxSizing: 'border-box',
};

function GelPicker({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (query.length < 1) { setResults([]); return; }
    const r = ipcRenderer.sendSync('db-search-gels', query);
    setResults(r || []);
    setOpen((r || []).length > 0);
  }, [query]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (gel) => {
    setQuery(gel.gel_number + ' ' + gel.gel_name);
    onChange({ gel_number: gel.gel_number, gel_name: gel.gel_name });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input style={{ ...inputStyle, fontSize: '11px', padding: '5px 8px' }}
        value={query} placeholder={placeholder || 'Search gel...'}
        onChange={e => { setQuery(e.target.value); onChange({ gel_number: '', gel_name: e.target.value }); }}
        onFocus={() => query.length > 0 && results.length > 0 && setOpen(true)} />
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '6px', maxHeight: '180px', overflowY: 'auto', marginTop: '2px' }}>
          {results.map((gel, i) => (
            <div key={i} onMouseDown={() => select(gel)}
              style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid #2a2a2a', display: 'flex', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: '#534AB7', fontWeight: '600', minWidth: '50px' }}>{gel.gel_number}</span>
              <span style={{ color: '#ccc' }}>{gel.gel_name}</span>
              <span style={{ color: '#555', marginLeft: 'auto' }}>{gel.manufacturer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpotCard({ spot, onUpdate, onRemove, canRemove }) {
  const [form, setForm] = useState({
    operator_name: spot.operator_name || '',
    fixture_type: spot.fixture_type || '',
    location: spot.location || '',
  });
  const [gels, setGels] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const slots = ipcRenderer.sendSync('db-get-color-slots-all', spot.id);
    setGels(Array.isArray(slots) ? slots : []);
  }, [spot.id]);

  const updateGel = (slotId, gelData) => {
    setGels(g => g.map(s => s.id === slotId ? { ...s, ...gelData } : s));
  };

  const save = () => {
    setSaving(true);
    ipcRenderer.sendSync('db-update-spot', { spotId: spot.id, ...form });
    for (const gel of gels) {
      ipcRenderer.sendSync('db-update-color-slot', { slotId: gel.id, gelNumber: gel.gel_number || '', gelName: gel.gel_name || '' });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdate({ ...spot, ...form });
  };

  const regularGels = gels.filter(g => !g.is_permanent);
  const permGel = gels.find(g => g.is_permanent);

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '15px', fontWeight: '600', color: '#534AB7' }}>Spot {spot.spot_number}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saved && <span style={{ fontSize: '12px', color: '#1D9E75' }}>✓ Saved</span>}
          {canRemove && (
            <button onClick={onRemove} style={{ background: 'none', border: '1px solid #3a2a2a', borderRadius: '6px', color: '#c44', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>Remove spot</button>
          )}
          <button onClick={save} disabled={saving} style={{ padding: '6px 16px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Operator name</label>
          <input style={inputStyle} value={form.operator_name}
            onChange={e => setForm(f => ({ ...f, operator_name: e.target.value }))}
            placeholder="e.g. Lindsay" />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Location</label>
          <input style={inputStyle} value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="e.g. FOH Left Booth" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '4px' }}>Fixture type</label>
          <select style={inputStyle} value={form.fixture_type}
            onChange={e => setForm(f => ({ ...f, fixture_type: e.target.value }))}>
            <option value="">Select fixture...</option>
            {FIXTURES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>

      <label style={{ fontSize: '11px', color: '#666', display: 'block', marginBottom: '8px' }}>Color frames</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
        {regularGels.map(gel => (
          <div key={gel.id} style={{ background: '#111', borderRadius: '8px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px', fontWeight: '600' }}>Frame {gel.slot_number}</div>
            <GelPicker
              value={gel.gel_number ? gel.gel_number + ' ' + gel.gel_name : ''}
              onChange={gelData => updateGel(gel.id, gelData)}
              placeholder="Search gel..." />
          </div>
        ))}
      </div>

      {permGel !== undefined && (
        <div style={{ background: '#111', borderRadius: '8px', padding: '8px', border: '1px solid #3a3020' }}>
          <div style={{ fontSize: '10px', color: '#8a6a20', marginBottom: '6px', fontWeight: '600' }}>
            Permanent frame <span style={{ color: '#555', fontWeight: '400' }}>(optional)</span>
          </div>
          <GelPicker
            value={permGel && permGel.gel_number ? permGel.gel_number + ' ' + permGel.gel_name : ''}
            onChange={gelData => updateGel(permGel ? permGel.id : null, gelData)}
            placeholder="Search gel..." />
        </div>
      )}
    </div>
  );
}

export default function SpotSettingsScreen({ show, navigate }) {
  const [spots, setSpots] = useState([]);
  const [adding, setAdding] = useState(false);

  const load = () => {
    const result = ipcRenderer.sendSync('db-get-spots', show.id);
    setSpots(Array.isArray(result) ? result : []);
  };

  useEffect(() => { load(); }, []);

  const addSpot = () => {
    const nextNum = spots.length + 1;
    ipcRenderer.sendSync('db-add-spot', { showId: show.id, spotNumber: nextNum });
    load();
    setAdding(false);
  };

  const removeSpot = (spotId) => {
    if (!window.confirm('Remove this spot? All cue data for this spot will be deleted.')) return;
    ipcRenderer.sendSync('db-remove-spot', spotId);
    load();
  };

  const updateSpot = (updatedSpot) => {
    setSpots(s => s.map(sp => sp.id === updatedSpot.id ? updatedSpot : sp));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('show', show)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer' }}>← {show.title}</button>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#f0f0f0' }}>Spot Settings</span>
        <span style={{ fontSize: '12px', color: '#555' }}>{spots.length} spot{spots.length !== 1 ? 's' : ''}</span>
        <div style={{ flex: 1 }} />
        {spots.length < 4 && (
          <button onClick={addSpot} style={{ padding: '7px 16px', background: 'none', border: '1px solid #534AB7', borderRadius: '6px', color: '#534AB7', fontSize: '13px', cursor: 'pointer' }}>
            + Add spot
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {spots.map(spot => (
            <SpotCard key={spot.id} spot={spot}
              onUpdate={updateSpot}
              onRemove={() => removeSpot(spot.id)}
              canRemove={spots.length > 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
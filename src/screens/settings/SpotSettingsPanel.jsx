import React, { useState, useEffect } from 'react';
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
  const ref = React.useRef();

  React.useEffect(() => {
    if (query.length < 1) { setResults([]); return; }
    const r = ipcRenderer.sendSync('db-search-gels', query);
    setResults(r || []);
    setOpen((r || []).length > 0);
  }, [query]);

  React.useEffect(() => {
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
        value={query}
        placeholder={placeholder || 'Search gel...'}
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

function SpotCard({ spot, colorSlots, onUpdateSpot, onUpdateGel, onDelete }) {
  const isCustomFixture = spot.fixture_type && !FIXTURES.includes(spot.fixture_type);
  const [showCustomFixture, setShowCustomFixture] = useState(isCustomFixture);
  const slots = colorSlots || [];
  const regularSlots = slots.filter(s => !s.is_permanent);
  const permSlot = slots.find(s => s.is_permanent);

  return (
    <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#534AB7' }}>
          Spot {spot.spot_number}
        </div>
        <button onClick={() => {
          if (window.confirm('Delete Spot ' + spot.spot_number + '? All cues and data for this spot will be permanently deleted and cannot be recovered.')) {
            ipcRenderer.sendSync('db-remove-spot', spot.id);
            onDelete();
            onUpdateSpot(spot.id, '_deleted', true);
          }
        }} style={{ background: 'none', border: '1px solid #3a2a2a', borderRadius: '6px', color: '#c44', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
          Delete spot
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Operator name</div>
          <input style={inputStyle} defaultValue={spot.operator_name || ''}
            onBlur={e => onUpdateSpot(spot.id, 'operator_name', e.target.value)}
            placeholder="e.g. Lindsay" />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Location</div>
          <input style={inputStyle} defaultValue={spot.location || ''}
            onBlur={e => onUpdateSpot(spot.id, 'location', e.target.value)}
            placeholder="e.g. FOH Left Booth" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Fixture type</div>
          {showCustomFixture ? (
            <div>
              <input style={inputStyle} defaultValue={spot.fixture_type || ''}
                onBlur={e => onUpdateSpot(spot.id, 'fixture_type', e.target.value)}
                placeholder="Enter fixture type..." />
              <div onClick={() => { onUpdateSpot(spot.id, 'fixture_type', ''); setShowCustomFixture(false); }}
                style={{ fontSize: '11px', color: '#534AB7', cursor: 'pointer', marginTop: '4px' }}>
                Choose from list instead
              </div>
            </div>
          ) : (
            <select style={inputStyle} value={spot.fixture_type || ''}
              onChange={e => {
                if (e.target.value === 'Other') { setShowCustomFixture(true); }
                else onUpdateSpot(spot.id, 'fixture_type', e.target.value);
              }}>
              <option value="">Select fixture...</option>
              {FIXTURES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
        </div>
      </div>
      <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>Color frames</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
        {regularSlots.map(slot => (
          <div key={slot.id} style={{ background: '#1a1a1a', borderRadius: '8px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px', fontWeight: '600' }}>Frame {slot.slot_number}</div>
            <GelPicker
              value={slot.gel_number ? slot.gel_number + ' ' + slot.gel_name : ''}
              onChange={gel => onUpdateGel(spot.id, slot.id, gel)}
              placeholder="Search gel..." />
          </div>
        ))}
      </div>
      {permSlot && (
        <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '8px', border: '1px solid #3a3020' }}>
          <div style={{ fontSize: '10px', color: '#8a6a20', marginBottom: '6px', fontWeight: '600' }}>Permanent frame</div>
          <GelPicker
            value={permSlot.gel_number ? permSlot.gel_number + ' ' + permSlot.gel_name : ''}
            onChange={gel => onUpdateGel(spot.id, permSlot.id, gel)}
            placeholder="Search gel..." />
        </div>
      )}
    </div>
  );
}

export default function SpotSettingsPanel({ show }) {
  const [spots, setSpots] = useState([]);
  const [colorSlots, setColorSlots] = useState({});

  const load = () => {
    const s = ipcRenderer.sendSync('db-get-spots', show.id);
    setSpots(Array.isArray(s) ? s : []);
    const slotMap = {};
    for (const spot of (Array.isArray(s) ? s : [])) {
      const slots = ipcRenderer.sendSync('db-get-color-slots-all', spot.id);
      slotMap[spot.id] = Array.isArray(slots) ? slots : [];
    }
    setColorSlots(slotMap);
  };

  useEffect(() => { load(); }, []);

  const updateSpot = (spotId, field, value) => {
    ipcRenderer.sendSync('db-update-spot', { spotId, [field]: value });
    setSpots(s => s.map(sp => sp.id === spotId ? { ...sp, [field]: value } : sp));
  };

  const updateGel = (spotId, slotId, gel) => {
    ipcRenderer.sendSync('db-update-color-slot', { slotId, gel_number: gel.gel_number, gel_name: gel.gel_name });
    setColorSlots(prev => ({
      ...prev,
      [spotId]: (prev[spotId] || []).map(sl => sl.id === slotId ? { ...sl, gel_number: gel.gel_number, gel_name: gel.gel_name } : sl)
    }));
  };

  return (
    <div>
      {spots.map(spot => (
        <SpotCard
          key={spot.id}
          spot={spot}
          colorSlots={colorSlots[spot.id]}
          onUpdateSpot={updateSpot}
          onUpdateGel={updateGel}
          onDelete={() => load()}
        />
      ))}
            {spots.length < 4 && (
        <button onClick={() => {
          const newSpotNumber = spots.length + 1;
          const result = ipcRenderer.sendSync('db-add-spot', { showId: show.id, spotNumber: newSpotNumber });
          if (result.success) load();
        }} style={{ width: '100%', padding: '10px', background: 'none', border: '1px dashed #2a2a2a', borderRadius: '10px', color: '#534AB7', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
          + Add Spot
        </button>
      )}
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '../components/AppHeader';
import SwapSpotsDialog from '../components/SwapSpotsDialog';
const { ipcRenderer } = window.require('electron');

import { FIXTURES } from '../fixtures';

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px',
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
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '6px', maxHeight: '180px', overflowY: 'auto', marginTop: '2px' }}>
          {results.map((gel, i) => (
            <div key={i} onMouseDown={() => select(gel)}
              style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: '#409CFF', fontWeight: '600', minWidth: '50px' }}>{gel.gel_number}</span>
              <span style={{ color: 'rgba(255,255,255,0.78)' }}>{gel.gel_name}</span>
              <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 'auto' }}>{gel.manufacturer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SpotCard({ spot, onUpdate, onRemove, canRemove }) {
  const isCustomFixture = spot.fixture_type && !FIXTURES.includes(spot.fixture_type);
  const [form, setForm] = useState({
    operator_name: spot.operator_name || '',
    fixture_type: isCustomFixture ? 'Other' : (spot.fixture_type || ''),
    fixture_other: isCustomFixture ? spot.fixture_type : '',
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
    const saveForm = { ...form, fixture_type: form.fixture_type === 'Other' && form.fixture_other ? form.fixture_other : form.fixture_type };
    ipcRenderer.sendSync('db-update-spot', { spotId: spot.id, ...saveForm });
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
    <div style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '15px', fontWeight: '600', color: '#409CFF' }}>Spot {spot.spot_number}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saved && <span style={{ fontSize: '12px', color: '#30D158' }}>✓ Saved</span>}
          {canRemove && (
            <button onClick={onRemove} style={{ background: 'rgba(255,69,58,0.14)', border: 'none', borderRadius: '6px', color: '#FF453A', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>Remove spot</button>
          )}
          <button onClick={save} disabled={saving} style={{ padding: '6px 16px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', display: 'block', marginBottom: '4px' }}>Operator name</label>
          <input style={inputStyle} value={form.operator_name}
            onChange={e => setForm(f => ({ ...f, operator_name: e.target.value }))}
            placeholder="e.g. Lindsay" />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', display: 'block', marginBottom: '4px' }}>Location</label>
          <input style={inputStyle} value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            placeholder="e.g. FOH Left Booth" />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', display: 'block', marginBottom: '4px' }}>Fixture type</label>
          {form.fixture_type === 'Other' ? (
            <div>
              <input style={inputStyle} value={form.fixture_other || ''}
                onChange={e => setForm(f => ({ ...f, fixture_other: e.target.value }))}
                placeholder="Enter fixture type..."
                autoFocus
              />
              <div onClick={() => setForm(f => ({ ...f, fixture_type: '', fixture_other: '' }))}
                style={{ fontSize: '11px', color: '#409CFF', cursor: 'pointer', marginTop: '4px' }}>
                Choose from list instead
              </div>
            </div>
          ) : (
            <select style={inputStyle} value={form.fixture_type}
              onChange={e => setForm(f => ({ ...f, fixture_type: e.target.value, fixture_other: '' }))}>
              <option value="">Select fixture...</option>
              {FIXTURES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
        </div>
      </div>

      <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', display: 'block', marginBottom: '8px' }}>Color frames</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
        {regularGels.map(gel => (
          <div key={gel.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginBottom: '4px', fontWeight: '600' }}>Frame {gel.slot_number}</div>
            <GelPicker
              value={gel.gel_number ? gel.gel_number + ' ' + gel.gel_name : ''}
              onChange={gelData => updateGel(gel.id, gelData)}
              placeholder="Search gel..." />
          </div>
        ))}
      </div>

      {permGel !== undefined && (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px', border: '1px solid rgba(255,214,10,0.25)' }}>
          <div style={{ fontSize: '10px', color: '#C8A26B', marginBottom: '6px', fontWeight: '600' }}>
            Permanent frame <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: '400' }}>(optional)</span>
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

  const [showSwap, setShowSwap] = useState(false);

  const updateSpot = (updatedSpot) => {
    setSpots(s => s.map(sp => sp.id === updatedSpot.id ? updatedSpot : sp));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1E1E1E' }}>
     <AppHeader title="Spot Settings" onBack={() => navigate('show', show)} backLabel={show.title}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{spots.length} spot{spots.length !== 1 ? 's' : ''}</span>
        <div style={{ flex: 1 }} />
        {spots.length >= 2 && (
          <button onClick={() => setShowSwap(true)} style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer', marginRight: '8px' }}>
            ⇄ Swap spots
          </button>
        )}
        {spots.length < 4 && (
          <button onClick={addSpot} style={{ padding: '7px 16px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>
            + Add spot
          </button>
        )}
      </AppHeader>

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

      {showSwap && <SwapSpotsDialog spots={spots} onClose={() => setShowSwap(false)} />}
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
const { ipcRenderer } = window.require('electron');

const FIXTURES = ['Strong Super Trouper','Strong Gladiator','Lycian 1290','Lycian Starklite','Robert Juliat Lancelot','Robert Juliat Merlin','Altman Comet','Robe BMFL','Robe Esprite','High End SolaSpot','Moving Light - Other','Other'];
const labelStyle = { fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px', fontWeight: '500' };
const inputStyle = { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };

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
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
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
      <input
        style={{ ...inputStyle, fontSize: '11px', padding: '5px 8px' }}
        value={query}
        placeholder={placeholder || 'Search gel...'}
        onChange={e => { setQuery(e.target.value); onChange({ gel_number: '', gel_name: e.target.value }); }}
        onFocus={() => query.length > 0 && results.length > 0 && setOpen(true)}
      />
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

function newSpot(number) {
  return {
    spot_number: number,
    operator_name: '',
    location: '',
    fixture_type: '',
    gels: [1,2,3,4,5,6].map(slot => ({ slot, gel_number: '', gel_name: '' })),
    perm_gel_number: '',
    perm_gel_name: '',
  };
}

function SpotSetup({ spot, spotNumber, onChange, onRemove }) {
  const updateGel = (i, gelData) => {
    const newGels = [...spot.gels];
    newGels[i] = { ...newGels[i], ...gelData };
    onChange({ ...spot, gels: newGels });
  };

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '15px', fontWeight: '600', color: '#534AB7' }}>Spot {spotNumber}</span>
        <button onClick={onRemove} style={{ background: 'none', border: '1px solid #3a2a2a', borderRadius: '6px', color: '#c44', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyle}>Operator name</label>
          <input style={inputStyle} value={spot.operator_name}
            onChange={e => onChange({ ...spot, operator_name: e.target.value })}
            placeholder="e.g. Lindsay" />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={spot.location}
            onChange={e => onChange({ ...spot, location: e.target.value })}
            placeholder="e.g. FOH Left Booth" />
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Fixture type</label>
        <select style={inputStyle} value={spot.fixture_type}
          onChange={e => onChange({ ...spot, fixture_type: e.target.value })}>
          <option value="">Select fixture...</option>
          {FIXTURES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <label style={{ ...labelStyle, marginBottom: '8px', display: 'block' }}>Color frames</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
        {spot.gels.map((gel, i) => (
          <div key={i} style={{ background: '#111', borderRadius: '8px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px', fontWeight: '600' }}>Frame {gel.slot}</div>
            <GelPicker
              value={gel.gel_number ? gel.gel_number + ' ' + gel.gel_name : ''}
              onChange={gelData => updateGel(i, gelData)}
              placeholder="Search gel..." />
          </div>
        ))}
      </div>
      <div style={{ background: '#111', borderRadius: '8px', padding: '8px', border: '1px solid #3a3020' }}>
        <div style={{ fontSize: '10px', color: '#8a6a20', marginBottom: '6px', fontWeight: '600' }}>
          Permanent frame <span style={{ color: '#555', fontWeight: '400' }}>(optional)</span>
        </div>
        <GelPicker
          value={spot.perm_gel_number ? spot.perm_gel_number + ' ' + spot.perm_gel_name : ''}
          onChange={gelData => onChange({ ...spot, perm_gel_number: gelData.gel_number, perm_gel_name: gelData.gel_name })}
          placeholder="Search gel..." />
      </div>
    </div>
  );
}

export default function NewShowScreen({ navigate }) {
  const [form, setForm] = useState({
    title: '', theatre: '', producer: '', designer: '',
    associate_ld: '', assistant_ld: '', production_electrician: '', programmer: '',
  });
  const [spots, setSpots] = useState([newSpot(1), newSpot(2)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateForm = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const addSpot = () => { if (spots.length < 4) setSpots(s => [...s, newSpot(s.length + 1)]); };
  const removeSpot = (i) => setSpots(s => s.filter((_, idx) => idx !== i).map((sp, idx) => ({ ...sp, spot_number: idx + 1 })));
  const updateSpot = (i, data) => setSpots(s => s.map((sp, idx) => idx === i ? data : sp));

  const handleSave = () => {
    if (!form.title.trim()) { setError('Show title is required.'); return; }
    console.log('Saving form with logo_path:', form.logo_path);
    setSaving(true);
    if (!form.title.trim()) { setError('Show title is required.'); return; }
    setSaving(true);
    const result = ipcRenderer.sendSync('db-create-show', { form, spots });
    if (result.success) { navigate('home'); }
    else { setError('Error saving. Please try again.'); setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('home')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
        <span style={{ fontSize: '16px', fontWeight: '600' }}>New Show</span>
        <div style={{ flex: 1 }} />
        {error && <span style={{ fontSize: '12px', color: '#f55' }}>{error}</span>}
        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Show'}
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Show info</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#111', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {form.logo_path ? (
                    <img src={form.logo_path} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '10px', color: '#444', textAlign: 'center', padding: '8px' }}>No logo</span>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Show logo</label>
                  <button
                    onClick={async () => {
                      const { ipcRenderer } = window.require('electron');
                      const result = ipcRenderer.sendSync('dialog-open-image');
                      if (result) updateForm('logo_path', result);
                    }}
                    style={{ padding: '6px 12px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', fontSize: '12px', cursor: 'pointer', display: 'block', marginBottom: '4px' }}>
                    Choose image...
                  </button>
                  {form.logo_path && <div style={{ fontSize: '11px', color: '#534AB7', marginTop: '2px' }}>✓ Image selected</div>}
                  <div style={{ fontSize: '11px', color: '#444', marginTop: '4px' }}>PNG, JPG or SVG</div>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Show title *</label>
                <label style={labelStyle}>Show title *</label>
                <input style={{ ...inputStyle, fontSize: '15px' }} value={form.title}
                  onChange={e => updateForm('title', e.target.value)} placeholder="e.g. Hamilton" />
              </div>
              <div>
                <label style={labelStyle}>Theatre</label>
                <input style={inputStyle} value={form.theatre}
                  onChange={e => updateForm('theatre', e.target.value)} placeholder="e.g. Richard Rodgers Theatre" />
              </div>
              <div>
                <label style={labelStyle}>Producer</label>
                <input style={inputStyle} value={form.producer}
                  onChange={e => updateForm('producer', e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lighting team</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                ['designer','Lighting designer'],
                ['associate_ld','Associate LD'],
                ['assistant_ld','Assistant LD'],
                ['production_electrician','Production electrician'],
                ['programmer','Programmer'],
              ].map(([field, label]) => (
                <div key={field}>
                  <label style={labelStyle}>{label}</label>
                  <input style={inputStyle} value={form[field]}
                    onChange={e => updateForm(field, e.target.value)} placeholder={label} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spots ({spots.length})</div>
              {spots.length < 4 && (
                <button onClick={addSpot} style={{ background: 'none', border: '1px solid #534AB7', borderRadius: '6px', color: '#534AB7', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}>+ Add spot</button>
              )}
            </div>
            {spots.map((spot, i) => (
              <SpotSetup key={i} spot={spot} spotNumber={i + 1}
                onChange={data => updateSpot(i, data)}
                onRemove={() => removeSpot(i)} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
const { ipcRenderer } = window.require('electron');

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

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px',
  fontSize: '13px', outline: 'none', boxSizing: 'border-box',
};

export default function ShowInfoPanel({ show, onShowUpdate, onClose }) {
  const [form, setForm] = useState({
    title: show.title || '',
    theatre: show.theatre || '',
    producer: show.producer || '',
    designer: show.designer || '',
    associate_ld: show.associate_ld || '',
    assistant_ld: show.assistant_ld || '',
    production_electrician: show.production_electrician || '',
    programmer: show.programmer || '',
    logo_path: show.logo_path || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaving(true);
    ipcRenderer.sendSync('db-update-show', { showId: show.id, ...form });
    setSaving(false);
    onShowUpdate({ ...show, ...form, id: show.id });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Show title</div>
          <input style={{ ...inputStyle, fontSize: '15px' }} value={form.title} onChange={e => update('title', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Theatre</div>
          <input style={inputStyle} value={form.theatre} onChange={e => update('theatre', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Producer</div>
          <input style={inputStyle} value={form.producer} onChange={e => update('producer', e.target.value)} />
        </div>
      </div>

      <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lighting team</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        {[
          ['designer', 'Lighting designer'],
          ['associate_ld', 'Associate LD'],
          ['assistant_ld', 'Assistant LD'],
          ['production_electrician', 'Production electrician'],
          ['programmer', 'Programmer'],
        ].map(([field, label]) => (
          <div key={field}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>{label}</div>
            <input style={inputStyle} value={form[field]} onChange={e => update(field, e.target.value)} />
          </div>
        ))}
      </div>

      <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Show logo</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div onClick={() => { const r = ipcRenderer.sendSync('dialog-open-image'); if (r) update('logo_path', r); }}
          style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
          {form.logo_path && getImageSrc(form.logo_path) ? (
            <img src={getImageSrc(form.logo_path)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.28)' }}>Click to add logo</div>
          )}
        </div>
        {form.logo_path && (
          <button onClick={() => update('logo_path', '')}
            style={{ padding: '5px 10px', background: 'rgba(255,69,58,0.14)', border: 'none', borderRadius: '6px', color: '#FF453A', fontSize: '11px', cursor: 'pointer' }}>
            Remove logo
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
        {saved && <span style={{ fontSize: '13px', color: '#30D158', fontWeight: '600' }}>Changes saved</span>}
        <button onClick={save} disabled={saving}
          style={{ padding: '8px 20px', background: '#0A84FF', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
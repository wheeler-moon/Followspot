import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');
import AppHeader from '../components/AppHeader';
import ShowSettingsModal from './ShowSettingsModal';
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

export default function ShowDashboard({ show: initialShow, navigate }) {
  const [currentShow, setCurrentShow] = React.useState(initialShow);
  const show = currentShow;

  const reloadShow = () => {
    const updated = ipcRenderer.sendSync('db-get-show', initialShow.id);
    if (updated) setCurrentShow(updated);
  };
  const [stats, setStats] = useState({ cues: 0, scenes: 0, characters: 0, spots: [] });
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const reloadStats = () => {
    const result = ipcRenderer.sendSync('db-get-show-stats', show.id);
    if (result) setStats(result);
  };

  useEffect(() => {
    reloadStats();
  }, [show.id]);
const startEdit = () => {
    setEditForm({
      title: show.title || '',
      theatre: show.theatre || '',
      producer: show.producer || '',
      designer: show.designer || '',
      associate_ld: show.associate_ld || '',
      assistant_ld: show.assistant_ld || '',
      production_electrician: show.production_electrician || '',
      programmer: show.programmer || '',
    });
    setEditing(true);
  };
    useEffect(() => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.on('menu-export-show', () => {
      const result = ipcRenderer.sendSync('db-export-show', show.id);
      if (result.success) alert('Show exported successfully!');
      else if (!result.cancelled) alert('Export failed: ' + result.error);
    });
    return () => {
      ipcRenderer.removeAllListeners('menu-export-show');
    };
  }, []);

  const saveEdit = () => {
    setSaving(true);
    const result = ipcRenderer.sendSync('db-update-show', { showId: show.id, form: editForm });
    if (result.success) {
      Object.assign(show, editForm);
      setEditing(false);
    }
    setSaving(false);
  };

  const updateEdit = (field, value) => setEditForm(f => ({ ...f, [field]: value }));
  const navCards = [
    { label: 'Cue list', icon: '≡', desc: 'Enter and edit followspot cues', dest: 'cue-list', color: '#409CFF' },
    { label: 'Scenes', icon: '◎', desc: 'Manage scenes and act breaks', dest: 'scenes', color: '#30D158' },
    { label: 'Characters', icon: '◈', desc: 'Characters and cast list', dest: 'characters', color: '#AC8E68' },
    { label: 'Spot Notes', icon: '✎', desc: 'View and manage spot notes', dest: 'spot-notes', color: '#FFD60A' },
    { label: 'Print options', icon: '⎙', desc: 'Generate PDF paperwork', dest: 'print', color: '#30D158' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1E1E1E' }}>
           <AppHeader title={show.title} onBack={() => navigate('home')} backLabel="All shows">
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{show.theatre}</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => {
          const result = ipcRenderer.sendSync('db-export-show', show.id);
          if (result.success) alert(`Show exported successfully!`);
          else if (!result.cancelled) alert('Export failed: ' + result.error);
        }} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>
          ↑ Export
        </button>
        <button onClick={() => navigate('cue-list', show)} style={{ padding: '8px 18px', background: '#0A84FF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          Open cue list →
        </button>
      </AppHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ marginBottom: '32px' }}>
            {editing ? (
              <div style={{ background: '#2A2A2A', border: '1px solid #0A84FF', borderRadius: '12px', padding: '20px', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#409CFF', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit show info</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Show title</div>
                    <input value={editForm.title} onChange={e => updateEdit('title', e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Theatre</div>
                    <input value={editForm.theatre} onChange={e => updateEdit('theatre', e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>Producer</div>
                    <input value={editForm.producer} onChange={e => updateEdit('producer', e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lighting team</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {[
                    ['designer', 'Lighting designer'],
                    ['associate_ld', 'Associate LD'],
                    ['assistant_ld', 'Assistant LD'],
                    ['production_electrician', 'Production electrician'],
                    ['programmer', 'Programmer'],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '4px' }}>{label}</div>
                      <input value={editForm[field]} onChange={e => updateEdit(field, e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditing(false)} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={saveEdit} disabled={saving} style={{ padding: '7px 14px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
                <div style={{ gridColumn: '1 / -1', marginBottom: '4px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.52)', marginBottom: '6px' }}>Show logo (optional)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#0A84FF'; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                      onDrop={e => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          const result = ipcRenderer.sendSync('dialog-open-image');
                          if (result) updateEdit('logo_path', result);
                        }
                      }}
                      onClick={() => {
                        const result = ipcRenderer.sendSync('dialog-open-image');
                        if (result) updateEdit('logo_path', result);
                      }}
                      style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}>
                      {editForm.logo_path ? (
                        <img src={getImageSrc(editForm.logo_path)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ textAlign: 'center', padding: '8px' }}>
                          <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.28)' }}>+</div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)' }}>Drop or click</div>
                        </div>
                      )}
                    </div>
                    {editForm.logo_path && (
                      <button onClick={() => updateEdit('logo_path', '')}
                        style={{ padding: '5px 10px', background: 'rgba(255,69,58,0.14)', border: 'none', borderRadius: '6px', color: '#FF453A', fontSize: '11px', cursor: 'pointer' }}>
                        Remove logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {show.logo_path && getImageSrc(show.logo_path) && (
                    <img src={getImageSrc(show.logo_path)} style={{ height: '60px', maxWidth: '120px', objectFit: 'contain', borderRadius: '6px' }} />
                  )}
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>{show.title}</div>
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.52)' }}>{show.theatre}{show.producer ? ` · ${show.producer}` : ''}</div>
                  </div>
                </div>
                  <button onClick={() => setShowSettings(true)}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)'; }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '28px', padding: '0 14px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '14px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginTop: '4px' }}>
                    <span style={{ fontSize: '14px' }}>⚙︎</span> Show Settings
                  </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {[
              { label: 'Spots', value: stats.spots.length },
              { label: 'Cues', value: stats.cues },
              { label: 'Scenes', value: stats.scenes },
              { label: 'Characters', value: stats.characters },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Lighting team</div>
            <div style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                ['Designer', show.designer],
                ['Associate LD', show.associate_ld],
                ['Assistant LD', show.assistant_ld],
                ['Prod. electrician', show.production_electrician],
                ['Programmer', show.programmer],
              ].filter(([, val]) => val).map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginBottom: '2px', fontWeight: '500' }}>{label}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.78)' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Spots</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {stats.spots.map(spot => (
                <div key={spot.id} style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', color: '#409CFF', fontWeight: '600', marginBottom: '4px' }}>Spot {spot.spot_number}</div>
                  <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: '500', marginBottom: '2px' }}>{spot.operator_name || 'No operator'}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{spot.location || 'No location'}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', marginTop: '4px' }}>{spot.fixture_type || 'No fixture'}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Navigate</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
              {navCards.map(card => (
                <div key={card.dest} onClick={() => navigate(card.dest, show)}
                  style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{card.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>{card.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{card.desc}</div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
      {showSettings && (
        <ShowSettingsModal
          show={show}
          onClose={() => { setShowSettings(false); reloadStats(); }}
          onShowUpdate={(updated) => { setCurrentShow(updated); }}
        />
      )}
    </div>
  );
}
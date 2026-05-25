import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');
import AppHeader from '../components/AppHeader';

export default function ShowDashboard({ show, navigate }) {
  const [stats, setStats] = useState({ cues: 0, scenes: 0, characters: 0, spots: [] });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const result = ipcRenderer.sendSync('db-get-show-stats', show.id);
    if (result) setStats(result);
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
    { label: 'Cue list', icon: '≡', desc: 'Enter and edit followspot cues', dest: 'cue-list', color: '#534AB7' },
    { label: 'Scenes', icon: '◎', desc: 'Manage scenes and act breaks', dest: 'scenes', color: '#0F6E56' },
    { label: 'Characters', icon: '◈', desc: 'Characters and cast list', dest: 'characters', color: '#854F0B' },
    { label: 'Spot settings', icon: '⚙', desc: 'Edit spots, fixtures and gels', dest: 'spot-settings', color: '#185FA5' },
    { label: 'Print options', icon: '⎙', desc: 'Generate PDF paperwork', dest: 'print', color: '#3B6D11' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f' }}>
           <AppHeader title={show.title} onBack={() => navigate('home')} backLabel="All shows">
        <span style={{ fontSize: '12px', color: '#555' }}>{show.theatre}</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => navigate('cue-list', show)} style={{ padding: '8px 18px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
          Open cue list →
        </button>
      </AppHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          <div style={{ marginBottom: '32px' }}>
            {editing ? (
              <div style={{ background: '#1a1a1a', border: '1px solid #534AB7', borderRadius: '12px', padding: '20px', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#534AB7', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit show info</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Show title</div>
                    <input value={editForm.title} onChange={e => updateEdit('title', e.target.value)}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Theatre</div>
                    <input value={editForm.theatre} onChange={e => updateEdit('theatre', e.target.value)}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Producer</div>
                    <input value={editForm.producer} onChange={e => updateEdit('producer', e.target.value)}
                      style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '10px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lighting team</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {[
                    ['designer', 'Lighting designer'],
                    ['associate_ld', 'Associate LD'],
                    ['assistant_ld', 'Assistant LD'],
                    ['production_electrician', 'Production electrician'],
                    ['programmer', 'Programmer'],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>{label}</div>
                      <input value={editForm[field]} onChange={e => updateEdit(field, e.target.value)}
                        style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditing(false)} style={{ padding: '7px 14px', background: 'none', border: '1px solid #333', borderRadius: '6px', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={saveEdit} disabled={saving} style={{ padding: '7px 14px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#f0f0f0', marginBottom: '4px' }}>{show.title}</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{show.theatre}{show.producer ? ` · ${show.producer}` : ''}</div>
                </div>
                <button onClick={startEdit} style={{ padding: '6px 14px', background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#666', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}>
                  Edit show info
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {[
              { label: 'Spots', value: show.num_spots },
              { label: 'Cues', value: stats.cues },
              { label: 'Scenes', value: stats.scenes },
              { label: 'Characters', value: stats.characters },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f0f0f0', marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Lighting team</div>
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                ['Designer', show.designer],
                ['Associate LD', show.associate_ld],
                ['Assistant LD', show.assistant_ld],
                ['Prod. electrician', show.production_electrician],
                ['Programmer', show.programmer],
              ].filter(([, val]) => val).map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: '10px', color: '#555', marginBottom: '2px', fontWeight: '500' }}>{label}</div>
                  <div style={{ fontSize: '13px', color: '#ccc' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Spots</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {stats.spots.map(spot => (
                <div key={spot.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', color: '#534AB7', fontWeight: '600', marginBottom: '4px' }}>Spot {spot.spot_number}</div>
                  <div style={{ fontSize: '13px', color: '#f0f0f0', fontWeight: '500', marginBottom: '2px' }}>{spot.operator_name || 'No operator'}</div>
                  <div style={{ fontSize: '11px', color: '#555' }}>{spot.location || 'No location'}</div>
                  <div style={{ fontSize: '11px', color: '#444', marginTop: '4px' }}>{spot.fixture_type || 'No fixture'}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Navigate</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
              {navCards.map(card => (
                <div key={card.dest} onClick={() => navigate(card.dest, show)}
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{card.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f0f0', marginBottom: '4px' }}>{card.label}</div>
                  <div style={{ fontSize: '11px', color: '#555' }}>{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
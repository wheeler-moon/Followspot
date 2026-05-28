import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');
import { getCachedLicense } from '../license';
import AppHeader from '../components/AppHeader';

export default function HomeScreen({ navigate }) {
  const [shows, setShows] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const result = ipcRenderer.sendSync('db-get-shows');
    if (result) setShows(result);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppHeader title="SpotPlot">
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowSettings(true)} style={{ padding: '8px 14px', background: 'none', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#666', fontSize: '13px', cursor: 'pointer' }}>
          ⚙ Settings
        </button>
        <button onClick={() => {
          const result = ipcRenderer.sendSync('db-import-show');
          if (result.success) {
            alert('Show imported successfully!');
            const updated = ipcRenderer.sendSync('db-get-shows');
            setShows(Array.isArray(updated) ? updated : []);
          } else if (!result.cancelled) alert('Import failed: ' + result.error);
        }} style={{ padding: '8px 14px', background: 'none', border: '1px solid #534AB7', borderRadius: '8px', color: '#534AB7', fontSize: '13px', cursor: 'pointer' }}>
          ↓ Import
        </button>
        <button onClick={() => navigate('new-show')} style={{ padding: '8px 18px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>+ New Show</button>
      </AppHeader>
      <div style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
        {shows.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: '12px' }}>
            <div style={{ fontSize: '40px' }}>✦</div>
            <div style={{ fontSize: '16px', color: '#666' }}>No shows yet</div>
            <div style={{ fontSize: '13px', color: '#444' }}>Create your first show to get started</div>
            <button onClick={() => navigate('new-show')} style={{ marginTop: '8px', padding: '10px 24px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>+ New Show</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {shows.map(show => (
              <div key={show.id} onClick={() => navigate('show', show)}
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#534AB7'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>{show.title}</div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>{show.theatre || 'No theatre set'}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', background: '#2a2a2a',
                    borderRadius: '20px', color: '#888' }}>{show.num_spots} spot{show.num_spots !== 1 ? 's' : ''}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${show.title}"? This cannot be undone.`)) {
                        ipcRenderer.sendSync('db-delete-show', show.id);
                        setShows(shows.filter(s => s.id !== show.id));
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: '#c44', fontSize: '11px', cursor: 'pointer', opacity: 0.4, padding: '2px 6px' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0.4}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setShowSettings(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ width: '340px', background: '#1a1a1a', borderLeft: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#f0f0f0' }}>Settings</span>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Account</div>
                <div style={{ background: '#111', borderRadius: '10px', padding: '16px' }}>
                  {[
                    ['Email', getCachedLicense()?.email || '—'],
                    ['License key', getCachedLicense()?.license_key || '—'],
                    ['Plan', getCachedLicense()?.plan || '—'],
                    ['Status', getCachedLicense()?.status || '—'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '10px', color: '#555', marginBottom: '3px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                      <div style={{ fontSize: '13px', color: '#ccc', fontFamily: label === 'License key' ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>About SpotPlot</div>
                <div style={{ background: '#111', borderRadius: '10px', padding: '16px' }}>
                  {[
                    ['Version', 'Beta 0.1.0'],
                    ['Built for', 'Broadway & theatre professionals'],
                    ['Support', 'wheeler@wheelermoon.com'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '10px', color: '#555', marginBottom: '3px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                      <div style={{ fontSize: '13px', color: '#ccc' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Links</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    ['🌐 Visit spotplot.app', 'https://spotplot.app'],
                    ['📧 Contact support', 'mailto:wheeler@wheelermoon.com'],
                  ].map(([label, url]) => (
                    <button key={label} onClick={() => { const { shell } = window.require('electron'); shell.openExternal(url); }}
                      style={{ padding: '10px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#888', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }}
                style={{ width: '100%', padding: '10px', background: 'none', border: '1px solid #3a1a1a', borderRadius: '8px', color: '#c44', fontSize: '13px', cursor: 'pointer' }}>
                Sign out / Deactivate license
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

export default function HomeScreen({ navigate }) {
  const [shows, setShows] = useState([]);

  useEffect(() => {
    const result = ipcRenderer.sendSync('db-get-shows');
    if (result) setShows(result);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '20px', fontWeight: '600' }}>Followspot Tracker</span>
        <button onClick={() => navigate('new-show')} style={{ padding: '8px 18px', background: '#534AB7', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>+ New Show</button>
      </div>
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
                <span style={{ fontSize: '11px', padding: '3px 8px', background: '#2a2a2a', borderRadius: '20px', color: '#888' }}>{show.num_spots} spot{show.num_spots !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
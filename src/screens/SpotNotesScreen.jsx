import React, { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
const { ipcRenderer } = window.require('electron');

export default function SpotNotesScreen({ show, navigate }) {
  const [spots, setSpots] = useState([]);
  const [cues, setCues] = useState([]);
  const [spotCues, setSpotCues] = useState([]);
  const [scenes, setScenes] = useState([]);
  const [selectedSpotId, setSelectedSpotId] = useState(null);

  useEffect(() => {
    const result = ipcRenderer.sendSync('db-get-cue-list', show.id);
    if (result) {
      setSpots(result.spots || []);
      setCues(result.cues || []);
      setSpotCues(result.spotCues || []);
      setScenes(result.scenes || []);
      if (result.spots && result.spots.length > 0) {
        setSelectedSpotId(result.spots[0].id);
      }
    }
  }, []);

  const sceneMap = {};
  scenes.forEach(s => { sceneMap[s.id] = s; });

  const notesForSpot = (spotId) => {
    return spotCues
      .filter(sc => sc.spot_id === spotId && sc.spot_note && sc.spot_note.trim())
      .map(sc => {
        const cue = cues.find(c => c.id === sc.cue_id);
        return { sc, cue };
      })
      .filter(({ cue }) => cue)
      .sort((a, b) => (a.cue?.sort_order || 0) - (b.cue?.sort_order || 0));
  };

  const deleteNote = (spotCueId) => {
    ipcRenderer.sendSync('db-update-spot-cue', { spotCueId, field: 'spot_note', value: '' });
    setSpotCues(prev => prev.map(sc => sc.id === spotCueId ? { ...sc, spot_note: '' } : sc));
  };

  const selectedSpot = spots.find(s => s.id === selectedSpotId);
  const notes = selectedSpotId ? notesForSpot(selectedSpotId) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f' }}>
      <AppHeader title="Spot Notes" onBack={() => navigate('show', show)} backLabel={show.title}>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {spots.map(spot => (
            <button key={spot.id} onClick={() => setSelectedSpotId(spot.id)}
              style={{ padding: '6px 14px', background: selectedSpotId === spot.id ? '#534AB7' : 'none', border: `1px solid ${selectedSpotId === spot.id ? '#534AB7' : '#2a2a2a'}`, borderRadius: '6px', color: selectedSpotId === spot.id ? '#fff' : '#666', fontSize: '12px', cursor: 'pointer' }}>
              Spot {spot.spot_number}{spot.operator_name ? ' · ' + spot.operator_name : ''}
            </button>
          ))}
        </div>
      </AppHeader>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#333', fontSize: '14px' }}>
              No notes for {selectedSpot?.operator_name || 'this spot'} yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notes.map(({ sc, cue }) => {
                const scene = sceneMap[cue.scene_id];
                return (
                  <div key={sc.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: '#f0f0f0' }}>LQ {cue.lq_number || '—'}</span>
                          <span style={{ fontSize: '11px', color: '#555' }}>T·{cue.track_number}</span>
                          {scene && <span style={{ fontSize: '11px', color: '#534AB7', fontWeight: '600' }}>{scene.label}</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteNote(sc.id)}
                        style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#c44', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
                        Delete note
                      </button>
                    </div>
                    <div style={{ fontSize: '14px', color: '#ccc', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {sc.spot_note}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
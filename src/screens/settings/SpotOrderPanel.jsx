import React, { useState, useEffect, useRef } from 'react';
const { ipcRenderer } = window.require('electron');

export default function SpotOrderPanel({ show }) {
  const [spots, setSpots] = useState([]);
  const [dragOverId, setDragOverId] = useState(null);
  const dragItem = useRef(null);

  const load = () => {
    const s = ipcRenderer.sendSync('db-get-spots', show.id);
    setSpots(Array.isArray(s) ? s : []);
  };

  useEffect(() => { load(); }, []);

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverId(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragItem.current === null || dragItem.current === index) { setDragOverId(null); return; }
    const newSpots = [...spots];
    const dragged = newSpots.splice(dragItem.current, 1)[0];
    newSpots.splice(index, 0, dragged);
    const updates = newSpots.map((s, i) => ({ id: s.id, display_order: (i + 1) * 1000 }));
    ipcRenderer.sendSync('db-reorder-spots', updates);
    dragItem.current = null;
    setDragOverId(null);
    load();
  };

  return (
    <div>
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
        Drag to reorder how spots appear in the cue list. Default is numerical order.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {spots.map((spot, index) => (
          <div key={spot.id}
            draggable
            onDragStart={e => handleDragStart(e, index)}
            onDragOver={e => handleDragOver(e, index)}
            onDrop={e => handleDrop(e, index)}
            onDragLeave={() => setDragOverId(null)}
            style={{
              background: dragOverId === index ? '#1a1a2e' : '#111',
              border: `1px solid ${dragOverId === index ? '#534AB7' : '#2a2a2a'}`,
              borderRadius: '10px', padding: '14px 16px',
              cursor: 'grab', display: 'flex', alignItems: 'center', gap: '12px',
            }}>
            <div style={{ color: '#333', fontSize: '18px' }}>⠿</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#f0f0f0' }}>
                Spot {spot.spot_number}
              </div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                {spot.operator_name || 'No operator'}{spot.location ? ' · ' + spot.location : ''}
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#444' }}>Position {index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
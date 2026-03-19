import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

export default function PrintScreen({ show, navigate }) {
  const [spots, setSpots] = useState([]);
  const [label, setLabel] = useState('');
  const [generating, setGenerating] = useState(false);
    const [hideOff, setHideOff] = useState(false);
  const [hideTracked, setHideTracked] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const result = ipcRenderer.sendSync('db-get-cue-list', show.id);
    console.log('print screen result:', result);
    if (result) setSpots(result.spots || []);
  }, []);

  const generateCallerPDF = () => {
    if (!label.trim()) { setMessage('Please enter a label first'); return; }
    setGenerating(true);
    setMessage('');
    const result = ipcRenderer.sendSync('db-generate-caller-pdf', {
      showId: show.id, label, hideOff, hideTracked,
      rangeStart: rangeStart ? parseInt(rangeStart) : null,
      rangeEnd: rangeEnd ? parseInt(rangeEnd) : null,
    });
    setGenerating(false);
    if (result.success) setMessage('Caller sheet saved successfully!');
    else if (!result.cancelled) setMessage('Error generating PDF. Please try again.');
  };
const generateColorLoadPDF = () => {
    if (!label.trim()) { setMessage('Please enter a label first'); return; }
    setGenerating(true);
    setMessage('');
    const result = ipcRenderer.sendSync('db-generate-color-load-pdf', { showId: show.id, label });
    setGenerating(false);
    if (result.success) setMessage('Color load sheet saved successfully!');
    else if (!result.cancelled) setMessage('Error generating PDF. Please try again.');
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0f0f' }}>
      <div style={{ padding: '14px 24px', borderBottom: '1px solid #2a2a2a', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('show', show)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer' }}>← {show.title}</button>
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#f0f0f0' }}>Print Options</span>
      </div>

      <div style={{ flex: 1, padding: '32px 24px', overflowY: 'hidden' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Print label</div>
            <input value={label} onChange={e => setLabel(e.target.value)}
              placeholder='e.g. "2-24 Dress Run" or "Prev #3"'
              style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '8px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ fontSize: '11px', color: '#444', marginTop: '6px' }}>Appears on every page header</div>
          </div><div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={hideOff} onChange={e => setHideOff(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#534AB7', cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: '13px', color: '#f0f0f0' }}>Hide off cues</div>
                  <div style={{ fontSize: '11px', color: '#444' }}>Skip cues where this spot is off</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={hideTracked} onChange={e => setHideTracked(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#534AB7', cursor: 'pointer' }} />
                <div>
                  <div style={{ fontSize: '13px', color: '#f0f0f0' }}>Hide tracked cues</div>
                  <div style={{ fontSize: '11px', color: '#444' }}>Only print cues where something changes</div>
                </div>
              </label>
            </div>

            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Print range (optional)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>Start ref #</div>
                <input value={rangeStart} onChange={e => setRangeStart(e.target.value)}
                  placeholder="e.g. 1"
                  style={{ width: '80px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '6px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <div style={{ color: '#444', marginTop: '16px' }}>→</div>
              <div>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>End ref #</div>
                <input value={rangeEnd} onChange={e => setRangeEnd(e.target.value)}
                  placeholder="e.g. 50"
                  style={{ width: '80px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '6px 10px', fontSize: '13px', outline: 'none' }} />
              </div>
              <button onClick={() => { setRangeStart(''); setRangeEnd(''); }}
                style={{ marginTop: '16px', padding: '6px 12px', background: 'none', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#666', fontSize: '12px', cursor: 'pointer' }}>
                Clear
              </button>
            </div>
            <div style={{ fontSize: '11px', color: '#444', marginTop: '6px' }}>Use tracking reference numbers (T·1, T·2 etc)</div>
          </div>

          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Individual spot sheets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {spots.map(spot => (
                <div key={spot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', borderRadius: '8px', padding: '12px 16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#534AB7' }}>Spot {spot.spot_number}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{spot.operator_name || 'No operator'} · {spot.location || 'No location'}</div>
                  </div>
                  <button onClick={() => generatePDF(spot.id)} disabled={generating}
                    style={{ padding: '7px 16px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '500', cursor: generating ? 'wait' : 'pointer', opacity: generating ? 0.6 : 1 }}>
                    {generating ? 'Generating...' : 'Generate PDF'}
                  </button>
                </div>
              ))}
            </div>
          </div>
<div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Caller sheet — all spots</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', borderRadius: '8px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f0f0' }}>All {spots.length} spots</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{spots.length <= 2 ? 'Portrait' : 'Landscape'} · All spots side by side</div>
              </div>
              <button onClick={() => generateCallerPDF()} disabled={generating}
                style={{ padding: '7px 16px', background: '#0F6E56', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '500', cursor: generating ? 'wait' : 'pointer', opacity: generating ? 0.6 : 1 }}>
                {generating ? 'Generating...' : 'Generate PDF'}
              </button>
            </div>
          </div>
          {message && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: message.includes('success') ? '#0a1a10' : '#1a0a0a', border: `1px solid ${message.includes('success') ? '#1a3a24' : '#3a1a1a'}`, color: message.includes('success') ? '#1D9E75' : '#c44', fontSize: '13px' }}>
              {message}
            </div>
          )}
<div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Color load sheet</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', borderRadius: '8px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0f0f0' }}>All spots gel frames</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Gel numbers, names and load checklist</div>
              </div>
              <button onClick={() => generateColorLoadPDF()} disabled={generating}
                style={{ padding: '7px 16px', background: '#854F0B', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '500', cursor: generating ? 'wait' : 'pointer', opacity: generating ? 0.6 : 1 }}>
                {generating ? 'Generating...' : 'Generate PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
}
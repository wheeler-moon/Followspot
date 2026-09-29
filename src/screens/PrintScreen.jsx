import React, { useState, useEffect, useRef } from 'react';
import AppHeader from '../components/AppHeader';
const { ipcRenderer } = window.require('electron');

const PX_PER_INCH = 96;
const sectionLabel = { fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' };
const fieldStyle = { width: '100%', boxSizing: 'border-box', height: '28px', background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '6px', color: '#fff', padding: '0 10px', fontSize: '13px', outline: 'none' };

function Switch({ on, onChange, label, hint }) {
  return (
    <div onClick={() => onChange(!on)} role="switch" aria-checked={on}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
      <div style={{ width: '44px', height: '20px', borderRadius: '10px', background: on ? '#534AB7' : 'rgba(255,255,255,0.10)', position: 'relative', flexShrink: 0, transition: 'background 0.15s' }}>
        <div style={{ position: 'absolute', top: '2px', left: on ? '16px' : '2px', width: '26px', height: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.85)', boxShadow: '0 3px 8px rgba(0,0,0,0.15)', transition: 'left 0.15s' }} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#fff' }}>{label}</div>
        {hint && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{hint}</div>}
      </div>
    </div>
  );
}

// The sheet's HTML on a white "paper" at its real page width, scaled to fit the preview area
function SheetPreview({ sheet }) {
  const box = useRef();
  const frame = useRef();
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(800);

  const pageWidth = (sheet.landscape ? 11 : 8.5) * PX_PER_INCH;
  const m = side => parseFloat(sheet.margin[side]) * PX_PER_INCH;
  const paperHeight = contentHeight + m('top') + m('bottom');

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (box.current) setScale(Math.min(1.25, (box.current.clientWidth - 48) / pageWidth));
    });
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [pageWidth]);

  const measure = () => {
    const doc = frame.current?.contentDocument;
    if (doc) setContentHeight(doc.documentElement.scrollHeight);
  };

  return (
    <div ref={box} style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#262626' }}>
      <div style={{ width: pageWidth * scale, height: paperHeight * scale, margin: '0 auto' }}>
        <div style={{ width: pageWidth, height: paperHeight, transform: `scale(${scale})`, transformOrigin: 'top left', background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', boxSizing: 'border-box', padding: `${m('top')}px ${m('right')}px ${m('bottom')}px ${m('left')}px` }}>
          <iframe ref={frame} srcDoc={sheet.html} onLoad={measure} title="Print preview" scrolling="no"
            style={{ display: 'block', width: '100%', height: contentHeight, border: 'none' }} />
        </div>
      </div>
    </div>
  );
}

export default function PrintScreen({ show, navigate }) {
  const [spots, setSpots] = useState([]);
  const [selected, setSelected] = useState(null); // item from the "what to print" list
  const [label, setLabel] = useState('');
  const [hideOff, setHideOff] = useState(false);
  const [hideTracked, setHideTracked] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [notesSpotId, setNotesSpotId] = useState(null); // null = all spots
  const [showCostumeNotes, setShowCostumeNotes] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(null); // { ok, text, path }

  useEffect(() => {
    const result = ipcRenderer.sendSync('db-get-spots', show.id);
    setSpots(Array.isArray(result) ? result : []);
  }, []);

  const items = [
    ...spots.map(s => ({ key: 'spot-' + s.id, kind: 'spot', spotId: s.id, title: 'Spot ' + s.spot_number, sub: s.operator_name || 'Spot sheet' })),
    { key: 'caller', kind: 'caller', title: 'Caller sheet', sub: 'All spots side by side' },
    { key: 'color', kind: 'color', title: 'Color load', sub: 'Gel frames for every spot' },
    { key: 'notes', kind: 'notes', title: 'Spot notes', sub: 'Notes for operators' },
    { key: 'characters', kind: 'characters', title: 'Characters', sub: 'Cast photos, actors & costumes' },
  ];

  const request = () => {
    if (!selected) return null;
    const req = { kind: selected.kind, showId: show.id, label };
    if (selected.kind === 'spot') {
      Object.assign(req, { spotId: selected.spotId, hideOff, hideTracked,
        rangeStart: rangeStart ? parseInt(rangeStart) : null, rangeEnd: rangeEnd ? parseInt(rangeEnd) : null });
    }
    if (selected.kind === 'notes') req.spotId = notesSpotId;
    if (selected.kind === 'characters') req.showCostumeNotes = showCostumeNotes;
    return req;
  };

  // Re-render the preview whenever the sheet or an option changes (short pause so typing stays smooth)
  useEffect(() => {
    const req = request();
    if (!req) { setSheet(null); return; }
    const t = setTimeout(() => {
      const result = ipcRenderer.sendSync('print-preview', req);
      if (result?.success) { setSheet(result); setPreviewError(''); }
      else setPreviewError(result?.error || 'Could not build the preview.');
    }, 200);
    return () => clearTimeout(t);
  }, [selected?.key, label, hideOff, hideTracked, rangeStart, rangeEnd, notesSpotId, showCostumeNotes]);

  const exportPDF = () => {
    const req = request();
    if (!req) return;
    setExporting(true);
    setMessage(null);
    // Let the "Saving…" state paint before the save dialog blocks
    setTimeout(() => {
      const result = ipcRenderer.sendSync('print-export', req);
      setExporting(false);
      if (result?.success) setMessage({ ok: true, text: 'PDF saved.', path: result.path });
      else if (!result?.cancelled) setMessage({ ok: false, text: 'Could not save the PDF: ' + (result?.error || 'unknown error') });
    }, 30);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f0f0f', overflow: 'hidden' }}>
      <AppHeader title="Print" onBack={() => navigate('show', show)} backLabel={show.title}>
        <div style={{ flex: 1 }} />
        {message && (
          <span style={{ fontSize: '13px', color: message.ok ? '#30D158' : '#FF4245', marginRight: '12px' }}>
            {message.text}
            {message.path && (
              <span onClick={() => ipcRenderer.send('reveal-file', message.path)}
                style={{ color: '#8A82E0', cursor: 'pointer', marginLeft: '8px' }}>Show in Finder</span>
            )}
          </span>
        )}
        <button onClick={exportPDF} disabled={!selected || exporting}
          style={{ height: '28px', padding: '0 16px', background: '#534AB7', border: 'none', borderRadius: '14px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: selected && !exporting ? 'pointer' : 'default', opacity: selected && !exporting ? 1 : 0.5 }}>
          {exporting ? 'Saving…' : 'Export PDF…'}
        </button>
      </AppHeader>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* What to print + its options */}
        <div style={{ width: '260px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.10)', overflowY: 'auto', padding: '20px 16px' }}>
          <div style={sectionLabel}>What do you want to print?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
            {items.map(item => {
              const isSel = selected?.key === item.key;
              return (
                <div key={item.key} onClick={() => { setSelected(item); setMessage(null); }}
                  style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', background: isSel ? 'rgba(83,74,183,0.30)' : 'transparent' }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: isSel ? '#fff' : '#f0f0f0' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{item.sub}</div>
                </div>
              );
            })}
          </div>

          {selected && (
            <>
              <div style={sectionLabel}>Label</div>
              <input value={label} onChange={e => setLabel(e.target.value)} placeholder='e.g. "2-24 Dress Run"' style={fieldStyle} />
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', margin: '4px 0 20px' }}>Appears in the page header</div>

              {selected.kind === 'spot' && (
                <>
                  <div style={sectionLabel}>Options</div>
                  <Switch on={hideOff} onChange={setHideOff} label="Hide Off cues" hint="Skip cues where this spot is off" />
                  <Switch on={hideTracked} onChange={setHideTracked} label="Hide Tracked cues" hint="Only cues where something changes" />
                  <div style={{ ...sectionLabel, marginTop: '8px' }}>Cue range</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input value={rangeStart} onChange={e => setRangeStart(e.target.value.replace(/\D/g, ''))} placeholder="From T·" style={fieldStyle} />
                    <span style={{ color: 'rgba(255,255,255,0.25)' }}>→</span>
                    <input value={rangeEnd} onChange={e => setRangeEnd(e.target.value.replace(/\D/g, ''))} placeholder="To T·" style={fieldStyle} />
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '4px' }}>Tracking numbers (T·1, T·2…). Leave blank for all.</div>
                </>
              )}

              {selected.kind === 'characters' && (
                <>
                  <div style={sectionLabel}>Options</div>
                  <Switch on={showCostumeNotes} onChange={setShowCostumeNotes} label="Costume notes" hint="Show each character's costume notes" />
                </>
              )}

              {selected.kind === 'notes' && (
                <>
                  <div style={sectionLabel}>Which spot</div>
                  <select value={notesSpotId ?? ''} onChange={e => setNotesSpotId(e.target.value ? parseInt(e.target.value) : null)} style={fieldStyle}>
                    <option value="">All spots</option>
                    {spots.map(s => <option key={s.id} value={s.id}>Spot {s.spot_number}{s.operator_name ? ' (' + s.operator_name + ')' : ''}</option>)}
                  </select>
                </>
              )}
            </>
          )}
        </div>

        {/* Live preview */}
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#262626', color: 'rgba(255,255,255,0.55)', fontSize: '15px' }}>
            Select what you want to print
          </div>
        ) : previewError ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#262626', color: '#FF4245', fontSize: '13px' }}>
            {previewError}
          </div>
        ) : sheet ? (
          <SheetPreview sheet={sheet} />
        ) : (
          <div style={{ flex: 1, background: '#262626' }} />
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import useEscape from '../useEscape';
const { ipcRenderer } = window.require('electron');

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px', color: '#FFFFFF', padding: '5px 8px',
  fontSize: '11px', outline: 'none', boxSizing: 'border-box',
};

// Search box for one gel. Pick from the catalog, or type anything: a gel that isn't in the catalog
// is kept exactly as typed (as its number, so it prints) and is drawn clear/white wherever colors show.
// Typing an exact catalog number (e.g. "r4615") fills in the proper number and name on leaving the box.
export function GelPicker({ value, onChange, placeholder, borderColor }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  useEscape(() => setOpen(false), open);   // closes the results list, not the window it's in
  const ref = useRef();

  // Searches only while typing: a saved gel (or a custom color typed earlier) just shows its text
  // when Spot Settings opens, instead of popping the catalog list open
  const search = (text) => {
    setQuery(text);
    const r = text.length < 1 ? [] : (ipcRenderer.sendSync('db-search-gels', text) || []);
    setResults(r);
    setOpen(r.length > 0);
  };

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (gel) => {
    setQuery(gel.gel_number + ' ' + gel.gel_name);
    onChange({ gel_number: gel.gel_number, gel_name: gel.gel_name });
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input style={borderColor ? { ...inputStyle, borderColor } : inputStyle}
        value={query}
        placeholder={placeholder || 'Gel number or name'}
        onChange={e => { search(e.target.value); onChange({ gel_number: e.target.value.trim(), gel_name: '' }); }}
        onBlur={() => {
          const typed = query.trim();
          if (!typed) return;
          const exact = (ipcRenderer.sendSync('db-search-gels', typed) || []).find(g => g.gel_number.toUpperCase() === typed.toUpperCase());
          if (exact) select(exact);
        }}
        onFocus={() => query.length > 0 && results.length > 0 && setOpen(true)} />
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '6px', maxHeight: '180px', overflowY: 'auto', marginTop: '2px', minWidth: '220px' }}>
          {results.map((gel, i) => (
            <div key={i} onMouseDown={() => select(gel)}
              style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: '#409CFF', fontWeight: '600', minWidth: '50px' }}>{gel.gel_number}</span>
              <span style={{ color: 'rgba(255,255,255,0.78)' }}>{gel.gel_name}</span>
              <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 'auto' }}>{gel.manufacturer}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// A frame can hold more than one gel (e.g. R02+R132). They're stored together in the frame's
// gel_number ("R02+R132") and gel_name ("Bastard Amber + Light Hamburg"), so prints, exports and
// the iPad app need no changes.
const splitFrame = (gelNumber, gelName) => {
  const nums = (gelNumber || '').split('+').map(s => s.trim()).filter(Boolean);
  const names = (gelName || '').split(' + ').map(s => s.trim());
  if (nums.length <= 1) return [{ gel_number: nums[0] || '', gel_name: gelName || '' }];
  return nums.map((n, i) => ({ gel_number: n, gel_name: names.length === nums.length ? names[i] : (i === 0 ? gelName : '') }));
};
const joinFrame = (gels) => {
  const used = gels.filter(g => g.gel_number || g.gel_name);
  // Names stay paired with numbers: a typed gel with no name stands in with its own text
  const multi = used.length > 1;
  return { gel_number: used.map(g => g.gel_number || g.gel_name).filter(Boolean).join('+'),
    gel_name: multi ? used.map(g => g.gel_name || g.gel_number).join(' + ') : (used[0]?.gel_name || '') };
};

// compact: no "+ Add gel" line under the box; instead a small + shows at the box's right edge
// while showControls is on (the frame is hovered), next to any other controls passed in.
export function GelFramePicker({ gelNumber, gelName, onChange, placeholder, compact, showControls, controls, borderColor }) {
  const [gels, setGels] = useState(() => splitFrame(gelNumber, gelName));
  const update = (next) => { setGels(next); onChange(joinFrame(next)); };
  const hasFirst = gels[0] && (gels[0].gel_number || gels[0].gel_name);
  const link = { fontSize: '11px', color: '#409CFF', cursor: 'pointer', background: 'none', border: 'none', padding: 0 };

  return (
    <div>
      {gels.map((g, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: i ? '4px' : 0, position: 'relative' }}>
          {i > 0 && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', width: '10px', textAlign: 'center' }}>+</span>}
          <GelPicker value={[g.gel_number, g.gel_name].filter(Boolean).join(' ')}
            onChange={gel => update(gels.map((x, j) => j === i ? gel : x))}
            placeholder={i ? 'Add another gel' : placeholder} borderColor={borderColor} />
          {i > 0 && (
            <button onClick={() => update(gels.filter((_, j) => j !== i))} title="Remove this gel"
              style={{ ...link, color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: 1, padding: '0 2px' }}>×</button>
          )}
          {compact && i === 0 && showControls && (
            <div style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '3px' }}>
              {hasFirst && (
                <button onClick={() => setGels([...gels, { gel_number: '', gel_name: '' }])} title="Add another gel to this frame" aria-label="Add gel"
                  style={{ width: '16px', height: '16px', borderRadius: '8px', border: 'none', padding: 0, background: 'rgba(10,132,255,0.22)', color: '#409CFF', fontSize: '13px', lineHeight: '16px', cursor: 'pointer' }}>+</button>
              )}
              {controls}
            </div>
          )}
        </div>
      ))}
      {!compact && hasFirst && (
        <button onClick={() => setGels([...gels, { gel_number: '', gel_name: '' }])} style={{ ...link, marginTop: '5px' }}>+ Add gel</button>
      )}
    </div>
  );
}

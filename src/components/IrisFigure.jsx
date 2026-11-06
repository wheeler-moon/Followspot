import React, { useState, useRef } from 'react';
import useEscape from '../useEscape';
import { FIGURE_BOX } from '../irisSizes';

// Iris size pictures: a stick figure in the iris amethyst with a white circle showing how much of a person
// that size lights. The circle is { x, y, r } in the figure's drawing units (see src/irisSizes.js).

const AMETHYST = '#A066D3';
const PAD = 35;        // extra room each side of the figure, so a big circle fits
const STAGE_W = FIGURE_BOX.w + PAD * 2;

function Figure({ color = AMETHYST, width = 3 }) {
  const line = { stroke: color, strokeWidth: width, strokeLinecap: 'round', fill: 'none' };
  return (
    <g>
      <circle cx="60" cy="24" r="10" {...line} />
      <line x1="60" y1="34" x2="60" y2="92" {...line} />
      <line x1="60" y1="48" x2="38" y2="80" {...line} />
      <line x1="60" y1="48" x2="82" y2="80" {...line} />
      <line x1="60" y1="92" x2="44" y2="150" {...line} />
      <line x1="60" y1="92" x2="76" y2="150" {...line} />
    </g>
  );
}

// The small picture on each Iris Sizes row (a size with no circle yet shows just the figure)
export function IrisFigure({ pic, height = 34 }) {
  return (
    <svg viewBox={`${-PAD} 0 ${STAGE_W} ${FIGURE_BOX.h}`} height={height} width={height * STAGE_W / FIGURE_BOX.h} style={{ display: 'block', overflow: 'hidden' }}>
      <Figure width={6} />
      {pic && <circle cx={pic.x} cy={pic.y} r={pic.r} fill="rgba(255,255,255,0.10)" stroke="#FFFFFF" strokeWidth="5" />}
    </svg>
  );
}

const STAGE_H = 340;   // the editor's figure, in screen pixels
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

// The window: drag inside the circle to move it, drag its edge (or the dot) to make it bigger or smaller.
// defaultPic: what Reset goes back to (a built-in size's default), or null. Saving the untouched default
// saves null, so the size keeps following SpotPlot's default.
export function IrisPictureEditor({ size, pic, defaultPic, onSave, onClose }) {
  const [c, setC] = useState(() => (pic && pic !== defaultPic ? pic : defaultPic) || { x: 60, y: 60, r: 30 });
  const [hover, setHover] = useState(null);   // 'move' | 'resize' | null, for the cursor
  const svgRef = useRef(null);
  const drag = useRef(null);
  useEscape(onClose);

  const scale = STAGE_H / FIGURE_BOX.h;
  const toUnits = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale - PAD, y: (e.clientY - r.top) / scale };
  };
  const partAt = (p) => {
    const d = Math.hypot(p.x - c.x, p.y - c.y);
    if (Math.abs(d - c.r) <= 6) return 'resize';
    return d < c.r ? 'move' : null;
  };
  const down = (e) => {
    const p = toUnits(e);
    const part = partAt(p);
    if (!part) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { part, start: p, from: c };
  };
  const move = (e) => {
    const p = toUnits(e);
    const d = drag.current;
    if (!d) { setHover(partAt(p)); return; }
    if (d.part === 'move') {
      setC({ ...d.from, x: clamp(d.from.x + p.x - d.start.x, -PAD, FIGURE_BOX.w + PAD), y: clamp(d.from.y + p.y - d.start.y, 0, FIGURE_BOX.h) });
    } else {
      setC({ ...d.from, r: clamp(Math.hypot(p.x - d.from.x, p.y - d.from.y), 4, 110) });
    }
  };
  const up = () => { drag.current = null; };
  const round = (v) => Math.round(v * 10) / 10;

  const button = (primary) => ({ height: '28px', padding: '0 14px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit',
    background: primary ? '#0A84FF' : 'rgba(255,255,255,0.10)', color: '#FFFFFF' });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '18px 20px 16px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>{size.value}</div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '2px 0 12px' }}>Drag the circle to move it. Drag its edge to resize.</div>
        <div style={{ background: '#191919', borderRadius: '8px', display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <svg ref={svgRef} viewBox={`${-PAD} 0 ${STAGE_W} ${FIGURE_BOX.h}`} height={STAGE_H} width={STAGE_H * STAGE_W / FIGURE_BOX.h}
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
            style={{ display: 'block', overflow: 'hidden', touchAction: 'none', cursor: drag.current ? (drag.current.part === 'move' ? 'grabbing' : 'nwse-resize') : hover === 'move' ? 'grab' : hover === 'resize' ? 'nwse-resize' : 'default' }}>
            <line x1="5" y1="151" x2="115" y2="151" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <Figure width={3} />
            <circle cx={c.x} cy={c.y} r={c.r} fill="rgba(255,255,255,0.08)" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx={c.x + c.r * Math.SQRT1_2} cy={c.y + c.r * Math.SQRT1_2} r="3" fill="#FFFFFF" />
          </svg>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', alignItems: 'center' }}>
          {defaultPic && <button onClick={() => setC(defaultPic)} style={button(false)}>Reset</button>}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={button(false)}>Cancel</button>
          <button onClick={() => onSave(c === defaultPic ? null : { x: round(c.x), y: round(c.y), r: round(c.r) })} style={button(true)}>Done</button>
        </div>
      </div>
    </div>
  );
}

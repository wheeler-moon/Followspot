import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

// First-run tips: the first time a screen shows a control, dim the window around it and explain it
// in a small popover (Next / Skip tips). Controls are marked with data-tour="<target>".
// Each tip is remembered once seen (per Mac, in localStorage). A tip whose control isn't on screen yet
// (e.g. cue tips before the first cue) waits until it appears. Help > Show Tips Again resets them.

const SEEN_KEY = 'spotplot_tips_seen';
const RESET_EVENT = 'spotplot-tips-reset';

const getSeen = () => {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); } catch (e) { return new Set(); }
};
const markSeen = (ids) => {
  try {
    const seen = getSeen();
    ids.forEach(id => seen.add(id));
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch (e) {}
};
export const resetTips = () => {
  try { localStorage.removeItem(SEEN_KEY); } catch (e) {}
  window.dispatchEvent(new Event(RESET_EVENT));
};

// Scroll positions of every scrolled area, so the tour can put them back when it ends
const saveScroll = () => [...document.querySelectorAll('*')]
  .filter(el => el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
  .map(el => [el, el.scrollTop, el.scrollLeft]);
const restoreScroll = (saved) => saved.forEach(([el, top, left]) => { el.scrollTop = top; el.scrollLeft = left; });

const findTarget = (target) => {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? el : null;
};

// steps: [{ id, target, title, body }]. watch: re-check for newly visible controls when it changes.
export default function Tips({ steps, watch }) {
  const [queue, setQueue] = useState([]); // steps to show now
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [popSize, setPopSize] = useState({ w: 300, h: 160 });
  const popRef = useRef(null);
  const [resetCount, setResetCount] = useState(0);
  const savedScroll = useRef([]);

  // Look for unseen tips whose control is on screen (after the screen has rendered its data)
  useEffect(() => {
    if (queue.length) return;
    const timer = setTimeout(() => {
      const seen = getSeen();
      const ready = steps.filter(s => !seen.has(s.id) && findTarget(s.target));
      if (ready.length) { savedScroll.current = saveScroll(); setIndex(0); setQueue(ready); }
    }, 450);
    return () => clearTimeout(timer);
  }, [watch, resetCount, queue.length]);

  useEffect(() => {
    const onReset = () => { setQueue([]); setResetCount(c => c + 1); };
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, []);

  const step = queue[index];

  // Measure the current control (scrolling it into view first) and keep it measured on resize
  useLayoutEffect(() => {
    if (!step) return;
    const measure = () => {
      const el = findTarget(step.target);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    const el = findTarget(step.target);
    // Its control went away before the tip showed: move on (it shows again once the control is back)
    if (!el) { advance(); return; }
    // Center it, so it isn't hidden under pinned headers (like the cue list's spot and scene rows)
    if (el) el.scrollIntoView({ block: 'center', inline: 'nearest' });
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [step]);

  useLayoutEffect(() => {
    if (popRef.current) {
      const r = popRef.current.getBoundingClientRect();
      if (r.width !== popSize.w || r.height !== popSize.h) setPopSize({ w: r.width, h: r.height });
    }
  });

  const finish = () => { restoreScroll(savedScroll.current); savedScroll.current = []; setQueue([]); setIndex(0); setRect(null); };
  // Go to the next tip whose control is still on screen, or end the tour
  const advance = () => {
    let i = index + 1;
    while (i < queue.length && !findTarget(queue[i].target)) i++;
    if (i < queue.length) setIndex(i); else finish();
  };
  const next = () => { markSeen([step.id]); advance(); };
  const skipAll = () => { markSeen(steps.map(s => s.id)); finish(); };

  useEffect(() => {
    if (!step) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); skipAll(); }
      else if (e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); next(); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  if (!step || !rect) return null;

  // Spotlight around the control, popover below it (or above when there's no room)
  const pad = 6, gap = 12, margin = 16;
  const spot = { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 };
  const below = spot.top + spot.height + gap + popSize.h <= window.innerHeight - margin;
  const above = spot.top - gap - popSize.h >= margin;
  let top = below ? spot.top + spot.height + gap : above ? spot.top - gap - popSize.h : window.innerHeight - margin - popSize.h;
  top = Math.max(margin, Math.min(top, window.innerHeight - margin - popSize.h));
  let left = spot.left + spot.width / 2 - popSize.w / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - margin - popSize.w));
  const isLast = index === queue.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200000 }} onMouseDown={e => e.stopPropagation()}>
      <div style={{ position: 'fixed', ...spot, borderRadius: '10px', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)', outline: '2px solid #0A84FF', outlineOffset: '0px', pointerEvents: 'none', transition: 'all 0.2s ease' }} />
      <div ref={popRef} role="dialog" aria-label={step.title}
        style={{ position: 'fixed', top, left, width: '300px', background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '20px', boxShadow: '0 18px 48px rgba(0,0,0,0.45)', padding: '18px 20px 16px', color: '#FFFFFF' }}>
        {queue.length > 1 && (
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '6px', fontVariantNumeric: 'tabular-nums' }}>
            {index + 1} of {queue.length}
          </div>
        )}
        <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>{step.title}</div>
        <div style={{ fontSize: '13px', lineHeight: '18px', color: 'rgba(255,255,255,0.78)' }}>{step.body}</div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
          <button onClick={skipAll} style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.55)', fontSize: '13px', cursor: 'pointer' }}>
            Skip tips
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={next} autoFocus
            style={{ height: '28px', padding: '0 16px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer', outline: 'none' }}>
            {isLast ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

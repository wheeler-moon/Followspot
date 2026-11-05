import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import NotesSidebar from '../components/NotesSidebar';
import { INTENSITIES, TIMES, ENDS_OFF, cueDefaults, fieldsForPick } from '../cueDefaults';
import useEscape from '../useEscape';
import { actionNameMap, displayAction } from '../actionNames';
import Tips from '../components/Tips';
import { TIPS } from '../tips';
import AppHeader from '../components/AppHeader';
import RichLine from '../components/RichLine';
import { safeRich } from '../richText';
import { cueFieldSettings } from '../cueFields';
import { irisSizeList } from '../irisSizes';
import { gelColor } from '../gelColors';
import { MAX_CHARACTERS, extraCharacters, extraCharactersJSON } from '../characterNames';
import { setUndoTarget } from '../undoTarget';
const { ipcRenderer } = window.require('electron');
// A gel's swatch color: the maker's color, white for a gel typed by hand, dark for an empty frame
function getGelColor(gelNum) {
  if (!gelNum) return '#2a2a2a';
  return gelColor(gelNum) || '#FFFFFF';
}

const ACTIONS = [
  { name: 'Pick Up', short: 'Pick Up', color: '#30D158', intensityDefault: 'Full', timeDefault: null },
  { name: 'Increase', short: 'Increase', color: '#30D158', intensityDefault: null, timeDefault: null },
  { name: 'Decrease', short: 'Decrease', color: '#FF453A', intensityDefault: null, timeDefault: null },
  { name: 'Fade Out', short: 'Fade Out', color: '#FF453A', intensityDefault: 'Out', timeDefault: null },
  { name: 'Fade In Place', short: 'Fade In Plce', color: '#FF453A', intensityDefault: 'Out', timeDefault: null },
  { name: 'Bump Up', short: 'Bump Up', color: '#30D158', intensityDefault: 'Full', timeDefault: '0' },
  { name: 'Bump Out', short: 'Bump Out', color: '#FF453A', intensityDefault: 'Out', timeDefault: '0' },
  { name: 'Swap To', short: 'Swap To', color: '#64D2FF', intensityDefault: null, timeDefault: null },
  { name: 'Slide To', short: 'Slide To', color: '#64D2FF', intensityDefault: null, timeDefault: null },
  { name: 'Stay With', short: 'Stay With', color: '#64D2FF', intensityDefault: null, timeDefault: null },
  { name: 'Iris In', short: 'Iris In', color: '#A066D3', intensityDefault: null, timeDefault: null },
  { name: 'Iris Out', short: 'Iris Out', color: '#A066D3', intensityDefault: null, timeDefault: null },
  { name: 'Iris/Fade Up', short: 'Iris/Fade Up', color: '#A066D3', intensityDefault: null, timeDefault: null },
  { name: 'Iris/Fade Down', short: 'Iris/Fade Dn', color: '#A066D3', intensityDefault: null, timeDefault: null },
  { name: 'Iris/Fade Out', short: 'Iris/Fade Out', color: '#A066D3', intensityDefault: 'Out', timeDefault: null },
  { name: 'Up & Out', short: 'Up & Out', color: '#AC8E68', intensityDefault: 'Full', timeDefault: null },
  { name: 'Dump & Restore', short: 'Dump & Rest.', color: '#AC8E68', intensityDefault: null, timeDefault: null },
  { name: 'Bump Color', short: 'Bump Color', color: '#AC8E68', intensityDefault: null, timeDefault: '0' },
  { name: 'Roll Color', short: 'Roll Color', color: '#AC8E68', intensityDefault: null, timeDefault: null },
  { name: 'Ballyhoo', short: 'Ballyhoo', color: '#FF9F0A', intensityDefault: null, timeDefault: null },
  { name: 'Off', short: 'Off', color: '#444', intensityDefault: 'Out', timeDefault: null },
  { name: 'Tracked', short: 'TRK', color: '#555555' },
];

const IRIS_SIZES = ['Full Body', '3/4 Body', '1/2 Body', 'Head & Shoulders', 'Head', 'Custom'];

// Background for a highlighted When or Notes line (stronger than the whole-cell tint so a thin line reads)
const lineHighlightStyle = (color) => color === 'yellow' ? { background: 'rgba(255,214,10,0.25)', padding: '2px 4px' }
  : color === 'red' ? { background: 'rgba(255,69,58,0.25)', padding: '2px 4px' } : {};
const selectStyle = {
  width: '100%', background: 'rgba(255,255,255,0.08)', border: 'none',
  borderRadius: '6px', color: 'rgba(255,255,255,0.62)', padding: '3px 6px',
  fontSize: '11px', outline: 'none',
};

function ActionIcon({ action, size = 20 }) {
  const s = size;
  switch (action) {
    case 'Pick Up': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 24,20 8,20" fill="#30D158"/><polygon points="16,14 22,26 10,26" fill="#6BD58A" opacity="0.5"/></svg>;
    case 'Increase': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,5 23,18 9,18" fill="#30D158"/></svg>;
    case 'Decrease': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,27 23,14 9,14" fill="#FF453A"/></svg>;
    case 'Fade Out': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,28 24,12 8,12" fill="#FF453A"/><polygon points="16,18 22,6 10,6" fill="#FF6961" opacity="0.5"/></svg>;
    case 'Fade In Place': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#FF453A" strokeWidth="2"/><polygon points="16,27 23,14 9,14" fill="#FF453A"/></svg>;
    case 'Bump Up': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="5" y="4" width="22" height="5" rx="1.5" fill="#30D158"/><polygon points="16,11 25,22 19.5,22 19.5,28 12.5,28 12.5,22 7,22" fill="#30D158"/></svg>;
    case 'Bump Out': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="5" y="23" width="22" height="5" rx="1.5" fill="#FF453A"/><polygon points="16,21 25,10 19.5,10 19.5,4 12.5,4 12.5,10 7,10" fill="#FF453A"/></svg>;
    case 'Swap To': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="8" cy="23" r="3.5" fill="#64D2FF" opacity="0.4"/><circle cx="24" cy="23" r="3.5" fill="#64D2FF"/><path d="M9 17 Q16 4 22.5 14.5" fill="none" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><polygon points="19.5,14.5 25,17.5 24.5,11.5" fill="#64D2FF"/></svg>;
    case 'Slide To': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="6" y1="16" x2="26" y2="16" stroke="#64D2FF" strokeWidth="2.5" strokeLinecap="round"/><polygon points="22,10 30,16 22,22" fill="#64D2FF"/><polygon points="10,10 2,16 10,22" fill="#64D2FF"/></svg>;
    case 'Stay With': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="none" stroke="#64D2FF" strokeWidth="2.25"/><circle cx="16" cy="16" r="3" fill="#64D2FF"/><line x1="16" y1="3" x2="16" y2="6.5" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><line x1="16" y1="25.5" x2="16" y2="29" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><line x1="3" y1="16" x2="6.5" y2="16" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/><line x1="25.5" y1="16" x2="29" y2="16" stroke="#64D2FF" strokeWidth="2.25" strokeLinecap="round"/></svg>;
    case 'Iris In': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#A066D3" strokeWidth="2"/><line x1="8" y1="16" x2="11" y2="16" stroke="#A066D3" strokeWidth="2" strokeLinecap="round"/><polygon points="10,12.5 14.5,16 10,19.5" fill="#A066D3"/><line x1="24" y1="16" x2="21" y2="16" stroke="#A066D3" strokeWidth="2" strokeLinecap="round"/><polygon points="22,12.5 17.5,16 22,19.5" fill="#A066D3"/></svg>;
    case 'Iris Out': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#A066D3" strokeWidth="2"/><line x1="8" y1="16" x2="24" y2="16" stroke="#A066D3" strokeWidth="2" strokeLinecap="round"/><polygon points="10,12 6,16 10,20" fill="#A066D3"/><polygon points="22,12 26,16 22,20" fill="#A066D3"/></svg>;
    case 'Iris/Fade Up': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="18" r="9" fill="none" stroke="#A066D3" strokeWidth="2"/><polygon points="16,4 22,14 10,14" fill="#30D158"/></svg>;
    case 'Iris/Fade Down': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="14" r="9" fill="none" stroke="#A066D3" strokeWidth="2"/><polygon points="16,28 22,18 10,18" fill="#FF453A"/></svg>;
    case 'Iris/Fade Out': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="none" stroke="#A066D3" strokeWidth="2"/><line x1="9" y1="16" x2="11.5" y2="16" stroke="#FF453A" strokeWidth="2" strokeLinecap="round"/><polygon points="10.5,12.5 14.5,16 10.5,19.5" fill="#FF453A"/><line x1="23" y1="16" x2="20.5" y2="16" stroke="#FF453A" strokeWidth="2" strokeLinecap="round"/><polygon points="21.5,12.5 17.5,16 21.5,19.5" fill="#FF453A"/></svg>;
    case 'Up & Out': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 22,14 10,14" fill="#30D158"/><polygon points="16,28 22,18 10,18" fill="#FF453A"/></svg>;
    case 'Dump & Restore': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="10,4 22,4 16,14" fill="#FF453A"/><polygon points="16,18 22,28 10,28" fill="#30D158"/></svg>;
    case 'Bump Color': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#FF9F0A" strokeWidth="1.5"/><rect x="12" y="11" width="3" height="10" fill="#6BD58A"/><rect x="16" y="11" width="3" height="10" fill="#FF6961"/></svg>;
    case 'Roll Color': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#FF9F0A" strokeWidth="1.5"/><rect x="9" y="8" width="3.5" height="16" rx="1" fill="#FF6961"/><rect x="12.5" y="8" width="3.5" height="16" fill="#FFB340"/><rect x="16" y="8" width="3.5" height="16" fill="#6BD58A"/><rect x="19.5" y="8" width="3.5" height="16" rx="1" fill="#64D2FF"/></svg>;
    case 'Ballyhoo': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="10.5" cy="16" r="7.5" fill="none" stroke="#FF9F0A" strokeWidth="2.25"/><circle cx="21.5" cy="16" r="7.5" fill="none" stroke="#FF9F0A" strokeWidth="2.25"/></svg>;
    // Plain colored circles: extra icons for custom actions (Show Settings → Custom Actions)
    case 'Green Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#30D158"/></svg>;
    case 'Red Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#FF453A"/></svg>;
    case 'Yellow Circle': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="#FFD60A"/></svg>;
    case 'Off': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="8" y1="8" x2="24" y2="24" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/><line x1="24" y1="8" x2="8" y2="24" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/></svg>;
    case 'Tracked': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="6" y1="16" x2="26" y2="16" stroke="#555" strokeWidth="2.5" strokeLinecap="round"/><polygon points="20,10 26,16 20,22" fill="#555"/></svg>;
    default: return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="#333"/></svg>;
  }
}

// The action menu, attached to its cue's action button (anchorRef). It sits inside the cue's box
// (position absolute), so it scrolls with the list smoothly on its own. When it opens it goes below the
// button if it fits in the visible cue list, else above, else on the roomier side with its own scroll.
// It closes once the button scrolls out of sight, and on a click anywhere else.
const PICKER_WIDTH = 280;
function scrollParent(el) {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if (o === 'auto' || o === 'scroll') return p;
  }
  return null;
}
function ActionPicker({ value, onChange, onClose, anchorRef, customActions, actionNames }) {
  useEscape(onClose);
  const menuRef = useRef();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useLayoutEffect(() => {
    const menu = menuRef.current, anchor = anchorRef.current;
    if (!menu || !anchor) return;
    const scroller = scrollParent(anchor);
    const visible = () => {
      const box = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
      return { top: Math.max(box.top, 0) + 8, bottom: Math.min(box.bottom, window.innerHeight) - 8 };
    };
    const place = () => {
      const a = anchor.getBoundingClientRect();
      const { top, bottom } = visible();
      menu.style.maxHeight = '';
      const h = menu.scrollHeight + 2;
      const below = bottom - (a.bottom + 4), above = (a.top - 4) - top;
      let y;
      if (h <= below) y = a.bottom + 4;
      else if (h <= above) y = a.top - 4 - h;
      else if (below >= above) { y = a.bottom + 4; menu.style.maxHeight = below + 'px'; }
      else { y = top; menu.style.maxHeight = above + 'px'; }
      // Window spots → spots inside the box the menu belongs to
      const p = (menu.offsetParent || document.body).getBoundingClientRect();
      menu.style.top = (y - p.top) + 'px';
      menu.style.left = (Math.min(Math.max(a.left, 8), window.innerWidth - PICKER_WIDTH - 8) - p.left) + 'px';
      menu.style.visibility = 'visible';
    };
    place();
    // Scrolling moves the menu by itself; only check whether its button has gone out of sight
    const onScroll = () => {
      const a = anchor.getBoundingClientRect();
      const { top, bottom } = visible();
      if (a.bottom < top - 8 || a.top > bottom + 8) closeRef.current();
    };
    const onDown = (e) => { if (!menu.contains(e.target) && !anchor.contains(e.target)) closeRef.current(); };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', place);
    document.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('mousedown', onDown);
    };
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'absolute', top: 0, left: 0, visibility: 'hidden', overflowY: 'auto', boxSizing: 'border-box', zIndex: 99999, background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '10px', padding: '8px', width: PICKER_WIDTH + 'px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
      {[...ACTIONS, ...(customActions || []).map(a => ({ name: a.name, short: a.name.substring(0, 4), color: a.color || 'rgba(255,255,255,0.62)', icon: a.icon || null, builtinIcon: a.builtinIcon || null }))].map(a => (
        <div key={a.name} onClick={() => { onChange(a); onClose(); }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 4px', borderRadius: '6px', cursor: 'pointer', background: value === a.name ? 'rgba(10,132,255,0.16)' : 'transparent', border: value === a.name ? '1px solid #0A84FF' : '1px solid transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = value === a.name ? 'rgba(10,132,255,0.16)' : 'transparent'}>
          {a.builtinIcon ? <ActionIcon action={a.builtinIcon} size={28} /> : a.icon ? <img src={(() => { try { const fs = window.require('fs'); const d = fs.readFileSync(a.icon); const ext = a.icon.split('.').pop().toLowerCase(); return `data:image/${ext};base64,${d.toString('base64')}`; } catch(e) { return ''; } })()} style={{ width: 28, height: 28, objectFit: 'contain' }} /> : <ActionIcon action={a.name} size={28} />}
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.62)', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>{displayAction(a.name, actionNames)}</span>
        </div>
      ))}
    </div>
  );
}
// Iris chips in a sideways-scrolling strip; edges fade and an arrow appears when more sizes are hidden
function IrisStrip({ sizes, selected, onPick, same }) {
  const ref = useRef();
  const [more, setMore] = useState({ left: false, right: false });

  const measure = () => {
    const el = ref.current;
    if (!el) return;
    setMore({ left: el.scrollLeft > 1, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Start with the chosen size in view
    const chip = el.querySelector('[data-selected="true"]');
    if (chip && (chip.offsetLeft + chip.offsetWidth > el.clientWidth)) el.scrollLeft = chip.offsetLeft - 8;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sizes.length]);

  const fade = `linear-gradient(to right, ${more.left ? 'transparent' : '#000'} 0, #000 ${more.left ? '16px' : '0'}, #000 calc(100% - ${more.right ? '16px' : '0px'}), ${more.right ? 'transparent' : '#000'} 100%)`;

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '2px' }}>
      {/* Arrows on either side show there are more sizes that way; click to scroll */}
      {more.left && (
        <div onClick={() => { ref.current.scrollLeft -= 80; }} title="Earlier iris sizes"
          style={{ flexShrink: 0, fontSize: '13px', fontWeight: '700', color: '#409CFF', cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>‹</div>
      )}
      {/* Absolutely positioned so the chips never widen the table column; they scroll inside it instead */}
      <div style={{ flex: 1, minWidth: 0, position: 'relative', height: '20px' }}>
      <div ref={ref} className="no-scrollbar" onScroll={measure}
        onWheel={e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) ref.current.scrollLeft += e.deltaY; }}
        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: '3px', overflowX: 'auto', scrollBehavior: 'smooth', WebkitMaskImage: fade, maskImage: fade }}>
        {sizes.map(iris => {
          const isSel = selected === iris.value;
          return (
            <div key={iris.value} data-selected={isSel} onClick={() => onPick(iris.value)} title={iris.value}
              style={{ flexShrink: 0, padding: '2px 6px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', background: isSel ? (same ? 'rgba(10,132,255,0.35)' : '#0A84FF') : '#2A2A2A', color: isSel ? (same ? 'rgba(255,255,255,0.6)' : '#FFFFFF') : 'rgba(255,255,255,0.28)', border: `1px solid ${isSel ? (same ? 'transparent' : '#0A84FF') : 'rgba(255,255,255,0.1)'}` }}>
              {iris.label}
            </div>
          );
        })}
      </div>
      </div>
      {more.right && (
        <div onClick={() => { ref.current.scrollLeft += 80; }} title="More iris sizes"
          style={{ flexShrink: 0, fontSize: '13px', fontWeight: '700', color: '#409CFF', cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>›</div>
      )}
    </div>
  );
}

// A small square button beside a character box: + adds another character, × removes this one
const charButtonStyle = { width: '24px', height: '32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '6px', color: 'rgba(255,255,255,0.62)', fontSize: '16px', lineHeight: 1,
  cursor: 'pointer', padding: 0, fontFamily: 'inherit' };
const charBoxStyle = { ...selectStyle, flex: '1 1 0', minWidth: 0, height: '32px', fontSize: '14px', fontWeight: '600', borderRadius: '6px', padding: '0 8px' };

// A second or third character in a spot cue ("Pick Up Bob & Matt"): a character box like the first,
// under it, with × to take it out. value is a character id, a typed name, or null while just added.
// onChange gets the new value; onNewName(name) runs after a typed name that isn't a character yet.
function ExtraCharacterBox({ value, characters, onChange, onRemove, onNewName, column }) {
  const [typing, setTyping] = useState(false);
  const done = useRef(false);
  const commit = (text) => {
    if (done.current) return;
    done.current = true;
    setTyping(false);
    const name = text.trim();
    if (!name) return;
    const existing = characters.find(c => (c.name || '').trim().toLowerCase() === name.toLowerCase());
    if (existing) { onChange(existing.id); return; }
    onChange(name);
    if (name !== value) onNewName(name);
  };
  const typed = typeof value === 'string' ? value : '';
  return (
    <>
      {typing ? (
        <input autoFocus defaultValue={typed} placeholder="Character name"
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(e.target.value); if (e.key === 'Escape') { done.current = true; setTyping(false); } }}
          style={{ ...charBoxStyle, gridColumn: column, color: '#FFFFFF' }} />
      ) : (
        <select value={typeof value === 'number' ? value : ''} onChange={e => {
          if (e.target.value === 'custom') { done.current = false; setTyping(true); }
          else if (e.target.value) onChange(parseInt(e.target.value));
        }} style={{ ...charBoxStyle, gridColumn: column, color: value ? '#FFFFFF' : 'rgba(255,255,255,0.28)' }}>
          <option value="">{typed || 'Character…'}</option>
          {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          <option value="custom">+ Type custom name...</option>
        </select>
      )}
      <button onClick={onRemove} title="Remove this character" aria-label="Remove this character" style={{ ...charButtonStyle, gridColumn: '3', color: 'rgba(255,255,255,0.45)' }}>×</button>
    </>
  );
}

// Right-click Copy Cue / Paste Cue: what a spot does in a cue. Kept while the app is open,
// for pasting within the same show (characters belong to a show)
const COPY_FIELDS = ['action', 'character_id', 'custom_character', 'extra_characters', 'frame_size', 'intensity', 'fade_time', 'active_frames',
  'description', 'with_lq', 'notes', 'no_color', 'highlight', 'when_highlight', 'notes_highlight'];
let cueClipboard = null;
// What a Tracked box carries on from the cue above, and keeps following until someone changes it
const TRACK_FOLLOW_FIELDS = ['character_id', 'custom_character', 'extra_characters', 'frame_size', 'active_frames', 'no_color'];
const isTrackedAction = (action) => !action || action === 'Tracked';
const sameTrackValue = (a, b) => {
  const n = (v) => (v == null || v === '' || v === 0 || v === '0') ? '' : String(v);
  return n(a) === n(b);
};
// Copy Whole Cue / Paste Whole Cue: what every spot does in one cue, by spot id (same show only)
let wholeCueClipboard = null;

function SpotCueCell({ above, onDragEnd, onContextMenu, spotCue, spot, cue, fieldsShown = {}, characters, colorSlots, onUpdate, onNewCustomCharacter, lqNumber, onDragStart, onDragOver, onDragLeave, onDrop, isDragTarget, isMenuTarget, colorSame, irisSame, onDoubleClick, irisSizes, customActions, actionNames, defaults, fromOff }) {
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [hoveredFrame, setHoveredFrame] = useState(null);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [showCustomChar, setShowCustomChar] = useState(!!spotCue?.custom_character);
  const [addingChar, setAddingChar] = useState(false);   // a new, still-empty character box under the first
  const [addingOffNote, setAddingOffNote] = useState(false);   // + Note clicked in an Off box, nothing typed yet
  const customCharDone = useRef(false);
  const [customTimeVal, setCustomTimeVal] = useState('');
  const ref = useRef();
  const actionBtnRef = useRef();
  const isOff = spotCue?.action === 'Off' || !spotCue?.action;

  if (!spotCue) return (
    <td
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onContextMenu={onContextMenu}
      onDragOver={(e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        onDragOver(e);
        return false;
      }}
      onDragEnter={(e) => { e.preventDefault(); onDragOver(e); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) onDragLeave(e); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(e); }}
      onDoubleClick={onDoubleClick}
      style={{ padding: '8px 18px', borderRight: '1px solid rgba(255,255,255,0.12)', verticalAlign: 'top', minWidth: '260px', minHeight: '80px', background: isDragTarget ? 'rgba(10,132,255,0.16)' : '#191919', outline: isDragTarget || isMenuTarget ? '2px solid #0A84FF' : 'none', outlineOffset: '-2px', cursor: 'grab' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.22)', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>—</div>
    </td>
  );

const actionDef = ACTIONS.find(a => a.name === spotCue?.action) || (customActions || []).find(a => a.name === spotCue?.action);
  const activeFrames = spotCue.active_frames ? spotCue.active_frames.split(',').filter(Boolean) : [];

  const handleActionSelect = (a) => {
    if (a.name === 'Tracked') {
      // Tracked starts clean, then carries on from this spot's cue above: same character(s), iris and color frames
      const cleared = { action: '', intensity: '', fade_time: '', description: '', with_lq: 0, when_highlight: null,
        notes: '', notes_highlight: null, highlight: null };
      const carried = {
        character_id: above?.character_id ?? null, custom_character: above?.custom_character ?? null,
        extra_characters: above?.extra_characters ?? null, frame_size: above?.frame_size ?? '',
        active_frames: above?.active_frames ?? '', no_color: above?.no_color ?? 0,
      };
      for (const [field, value] of Object.entries({ ...cleared, ...carried })) {
        if ((spotCue[field] ?? null) !== (value ?? null)) onUpdate(spotCue.id, field, value);
      }
      setShowCustomChar(!!carried.custom_character);
      setAddingChar(false);
      setShowActionPicker(false);
      return;
    }
    onUpdate(spotCue.id, 'action', a.name);
    // Turning a spot Off starts its box clean: the active cue's note doesn't carry into the Off note
    if (a.name === 'Off' && spotCue.action !== 'Off') {
      if (spotCue.notes) onUpdate(spotCue.id, 'notes', '');
      if (spotCue.notes_highlight) onUpdate(spotCue.id, 'notes_highlight', null);
    }
    // The action's own intensity/time, then this show's Cue Defaults for anything still empty (src/cueDefaults.js)
    const frames = (colorSlots || []).map(sl => 'F' + sl.slot_number);
    for (const [field, value] of Object.entries(fieldsForPick(a, spotCue, { defaults, fromOff, frames }))) onUpdate(spotCue.id, field, value);
  };

  // Finished typing a custom character name (Enter or clicking away). A name that is already a
  // character just links to it; a new one asks whether to add it to the show's characters.
  const commitCustomChar = (value) => {
    if (customCharDone.current) return;
    customCharDone.current = true;
    setShowCustomChar(false);
    const name = value.trim();
    const existing = name && characters.find(c => (c.name || '').trim().toLowerCase() === name.toLowerCase());
    if (existing) {
      onUpdate(spotCue.id, 'character_id', existing.id);
      onUpdate(spotCue.id, 'custom_character', null);
      return;
    }
    onUpdate(spotCue.id, 'custom_character', value);
    if (name && name !== (spotCue.custom_character || '').trim()) onNewCustomCharacter(spotCue.id, name);
  };

  // Which top boxes show (Show Settings → Cue Settings) and where the character box sits in the grid
  const showAction = fieldsShown.action !== false;
  const showChar = fieldsShown.character !== false;
  const charColumn = showAction ? '2' : '1 / 3';
  // Second and third characters (src/characterNames.js)
  const extras = extraCharacters(spotCue.extra_characters);
  const setExtras = (list) => onUpdate(spotCue.id, 'extra_characters', extraCharactersJSON(list));
  const hasFirstChar = !!(spotCue.character_id || spotCue.custom_character);
  const canAddChar = hasFirstChar && extras.length + (addingChar ? 1 : 0) < MAX_CHARACTERS - 1;
  const extraBoxes = [...extras, ...(addingChar ? [null] : [])];
  const changeExtra = (i, value) => {
    const next = [...extras];
    if (i < extras.length) next[i] = value; else next.push(value);
    if (i >= extras.length) setAddingChar(false);
    setExtras(next);
    return next;
  };
  const removeExtra = (i) => {
    if (i >= extras.length) { setAddingChar(false); return; }
    setExtras(extras.filter((_, j) => j !== i));
  };

  const toggleFrame = (frame) => {
    const current = spotCue.active_frames ? spotCue.active_frames.split(',').filter(Boolean) : [];
    const next = current.includes(frame) ? current.filter(f => f !== frame) : [...current, frame];
    onUpdate(spotCue.id, 'active_frames', next.join(','));
  };

  const withLQ = !!spotCue.with_lq;
  const toggleWLQ = () => onUpdate(spotCue.id, 'with_lq', withLQ ? 0 : 1);

  if (spotCue.action === 'Off') {
    const showOffNote = fieldsShown.notes !== false && (addingOffNote || !!safeRich(spotCue.notes));
    return (
      <td
        draggable
        onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onContextMenu={onContextMenu}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(e); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) onDragLeave(e); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(e); }}
        style={{ padding: '8px 18px', borderRight: '1px solid rgba(255,255,255,0.12)', verticalAlign: 'top', minWidth: '260px', background: isDragTarget ? 'rgba(10,132,255,0.16)' : '#191919', outline: isDragTarget || isMenuTarget ? '2px solid #0A84FF' : 'none', outlineOffset: '-2px', position: 'relative' }}>
        <div ref={ref} style={{ position: 'relative', zIndex: showActionPicker ? 99999 : 'auto' }}>
          <div ref={actionBtnRef} data-tour="cue-action" onClick={() => setShowActionPicker(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 7px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
            <ActionIcon action="Off" size={16} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', fontWeight: '500' }}>Off</span>
          </div>
{showActionPicker && <ActionPicker value={spotCue.action} onChange={handleActionSelect} onClose={() => setShowActionPicker(false)} anchorRef={actionBtnRef} customActions={customActions} actionNames={actionNames} />}
          {/* A note for the op while the spot is off. It's the cue's regular note, so it carries over if the spot comes back on */}
          {showOffNote ? (
            <div onBlur={() => setAddingOffNote(false)} style={{ marginTop: '6px' }}>
              <RichLine value={spotCue.notes} autoFocus={addingOffNote}
                onSave={html => onUpdate(spotCue.id, 'notes', html)}
                placeholder="Note for the op…"
                style={{ textAlign: 'center', borderRadius: '6px', color: 'rgba(255,255,255,0.85)', padding: '2px 4px', fontSize: '13px', fontWeight: '500', ...lineHighlightStyle(spotCue.notes_highlight) }} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)', fontStyle: 'italic', fontWeight: '600', pointerEvents: 'none' }}>spot inactive</span>
              {fieldsShown.notes !== false && (
                <button onClick={() => setAddingOffNote(true)} title="Add a note for the operator while this spot is off"
                  style={{ height: '20px', padding: '0 7px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  + Note
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    );
  }

  return (
    <td
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onContextMenu={onContextMenu}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); onDragOver(e); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) onDragLeave(e); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(e); }}
      onDoubleClick={onDoubleClick}
      data-tour="cue-cell"
      style={{ 
        padding: '8px 18px', 
        borderRight: '1px solid rgba(255,255,255,0.12)', 
        verticalAlign: 'top', 
        minWidth: '260px', 
        position: 'relative',
        outline: isDragTarget || isMenuTarget ? '2px solid #0A84FF' : 'none', outlineOffset: '-2px', 
        background: isDragTarget ? 'rgba(10,132,255,0.16)' : spotCue?.highlight === 'yellow' ? 'rgba(255,214,10,0.12)' : spotCue?.highlight === 'red' ? 'rgba(255,69,58,0.12)' : spotCue?.ignored ? 'rgba(255,69,58,0.08)' : 'transparent',
        cursor: 'grab',
        opacity: spotCue?.ignored ? 0.5 : 1,
        textDecoration: spotCue?.ignored ? 'line-through' : 'none',
      }}>
        {spotCue?.spot_note && (
        <div style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#FFD60A' }} />
      )}
      {isDragTarget && <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,132,255,0.3)', pointerEvents: 'none', zIndex: 5 }} />}
      <div ref={ref} style={{ position: 'relative', zIndex: showActionPicker ? 9999 : 'auto' }}>
        {/* One grid for action / character (+ more characters) / intensity / time, so the boxes line up:
            intensity under action, time under character and its + */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) 24px', columnGap: '6px', rowGap: '6px', alignItems: 'center', marginBottom: '5px' }}>
          <div ref={actionBtnRef} data-tour="cue-action" onClick={() => setShowActionPicker(v => !v)}
            style={{ display: fieldsShown.action === false ? 'none' : 'flex', alignItems: 'center', gap: '6px', height: '32px', boxSizing: 'border-box', padding: '0 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', minWidth: 0, gridColumn: showChar ? '1' : '1 / 4' }}>
            {spotCue.action ? (
              <>
                {(() => {
                  const customAction = (customActions || []).find(a => a.name === spotCue.action);
                  if (customAction?.builtinIcon) return <ActionIcon action={customAction.builtinIcon} size={20} />;
                  if (customAction?.icon) {
                    try {
                      const fs = window.require('fs');
                      const d = fs.readFileSync(customAction.icon);
                      const ext = customAction.icon.split('.').pop().toLowerCase();
                      const src = `data:image/${ext};base64,${d.toString('base64')}`;
                      return <img src={src} style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }} />;
                    } catch(e) {}
                  }
                  return <ActionIcon action={spotCue.action} size={20} />;
                })()}
                <span style={{ fontSize: '14px', color: actionDef ? actionDef.color : 'rgba(255,255,255,0.62)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayAction(spotCue.action, actionNames)}</span>
              </>
            ) : (
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Action…</span>
            )}
          </div>
{showActionPicker && <ActionPicker value={spotCue.action} onChange={handleActionSelect} onClose={() => setShowActionPicker(false)} anchorRef={actionBtnRef} customActions={customActions} actionNames={actionNames} />}
                {showCustomChar ? (
                    <input
            autoFocus
            defaultValue={spotCue.custom_character || ''}
            onBlur={e => commitCustomChar(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitCustomChar(e.target.value); }}
            placeholder="Character name"
            style={{ ...charBoxStyle, display: showChar ? undefined : 'none', gridColumn: charColumn, color: '#FFFFFF' }}
          />
        ) : (
          <select value={spotCue.character_id || ''} onChange={e => {
            if (e.target.value === 'custom') {
              customCharDone.current = false;
              onUpdate(spotCue.id, 'character_id', null);
              setShowCustomChar(true);
            } else if (!e.target.value && extras.length) {
              // Clearing the first character moves the second one up
              onUpdate(spotCue.id, 'character_id', typeof extras[0] === 'number' ? extras[0] : null);
              onUpdate(spotCue.id, 'custom_character', typeof extras[0] === 'string' ? extras[0] : null);
              setExtras(extras.slice(1));
            } else {
              onUpdate(spotCue.id, 'character_id', e.target.value ? parseInt(e.target.value) : null);
              onUpdate(spotCue.id, 'custom_character', null);
            }
          }} style={{ ...charBoxStyle, display: showChar ? undefined : 'none', gridColumn: charColumn, color: (spotCue.character_id || spotCue.custom_character) ? '#FFFFFF' : 'rgba(255,255,255,0.28)' }}>
            <option value="">{spotCue.custom_character || 'Character…'}</option>
            {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="custom">+ Type custom name...</option>
          </select>
        )}
        {showChar && (
          <button onClick={() => setAddingChar(true)} title="Add another character" aria-label="Add another character"
            style={{ ...charButtonStyle, gridColumn: '3', visibility: canAddChar ? 'visible' : 'hidden' }}>+</button>
        )}
        {showChar && extraBoxes.map((value, i) => (
          <React.Fragment key={i < extras.length ? 'x' + i : 'new'}>
            {showAction && <div style={{ gridColumn: '1', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.40)' }}>&amp;</div>}
            <ExtraCharacterBox value={value} characters={characters} column={charColumn}
              onChange={v => changeExtra(i, v)}
              onRemove={() => removeExtra(i)}
              onNewName={name => onNewCustomCharacter(spotCue.id, name, (id) => {
                // The typed name was just saved in place i; link it to the new character instead
                const list = [...extras];
                list[i] = id;
                setExtras(list);
              })} />
          </React.Fragment>
        ))}

          <select value={spotCue.intensity || ''} onChange={e => onUpdate(spotCue.id, 'intensity', e.target.value)}
            style={{ ...selectStyle, display: fieldsShown.intensity === false ? 'none' : undefined, gridColumn: fieldsShown.time === false ? '1 / 4' : '1', color: spotCue.intensity ? '#FFFFFF' : 'rgba(255,255,255,0.28)' }}>
            <option value="">Int…</option>
            {INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <div style={{ gridColumn: fieldsShown.intensity === false ? '1 / 4' : '2 / 4', minWidth: 0, display: fieldsShown.time === false ? 'none' : undefined }}>
            {showCustomTime ? (
              <input autoFocus value={customTimeVal} onChange={e => setCustomTimeVal(e.target.value)}
                onBlur={() => { onUpdate(spotCue.id, 'fade_time', customTimeVal); setShowCustomTime(false); }}
                onKeyDown={e => { if (e.key === 'Enter') { onUpdate(spotCue.id, 'fade_time', customTimeVal); setShowCustomTime(false); } if (e.key === 'Escape') setShowCustomTime(false); }}
                style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid #0A84FF', borderRadius: '6px', color: '#FFFFFF', padding: '3px 4px', fontSize: '11px', outline: 'none' }}
                placeholder="Seconds, e.g. 2.5" />
            ) : (
              <select value={spotCue.fade_time || ''} onChange={e => { if (e.target.value === 'Custom') { setShowCustomTime(true); setCustomTimeVal(TIMES.includes(spotCue.fade_time) ? '' : (spotCue.fade_time || '')); } else onUpdate(spotCue.id, 'fade_time', e.target.value); }}
                style={{ ...selectStyle, color: spotCue.fade_time ? '#FFFFFF' : 'rgba(255,255,255,0.28)' }}>
                <option value="">Time…</option>
                {/* A typed custom time isn't in the list, so add it as its own choice to show it */}
                {spotCue.fade_time && !TIMES.includes(spotCue.fade_time) && <option value={spotCue.fade_time}>{spotCue.fade_time}s</option>}
                {TIMES.map(t => <option key={t} value={t}>{t === 'Custom' ? 'Custom…' : t + 's'}</option>)}
              </select>
            )}
          </div>
        </div>

<div data-tour="cue-look" style={{ display: 'flex', alignItems: 'center', marginBottom: '3px', gap: '8px' }}>
          {fieldsShown.iris === false ? <div style={{ flex: 1 }} /> : <IrisStrip sizes={irisSizes || []}
            selected={spotCue.frame_size} same={irisSame}
            onPick={value => onUpdate(spotCue.id, 'frame_size', spotCue.frame_size === value ? '' : value)} />}
          <div style={{ display: fieldsShown.color === false ? 'none' : 'flex', gap: '3px', alignItems: 'center', flexShrink: 0 }}>
            <div
              onClick={() => {
                const isNC = spotCue.no_color === 1;
                onUpdate(spotCue.id, 'no_color', isNC ? 0 : 1);
                if (!isNC) onUpdate(spotCue.id, 'active_frames', '');
              }}
              style={{ padding: '2px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', background: spotCue.no_color ? (colorSame ? 'rgba(172,142,104,0.4)' : '#AC8E68') : '#2A2A2A', color: spotCue.no_color ? (colorSame ? 'rgba(255,255,255,0.6)' : '#FFFFFF') : 'rgba(255,255,255,0.45)', border: `1px solid ${spotCue.no_color ? (colorSame ? 'transparent' : '#AC8E68') : 'rgba(255,255,255,0.1)'}` }}>
              NC
            </div>
            {colorSlots.map(slot => {
              const isActive = activeFrames.includes('F' + slot.slot_number);
              const isHovered = hoveredFrame === slot.id;
              return (
                <div key={slot.id} style={{ position: 'relative' }}>
                  <div
                    onClick={() => toggleFrame('F' + slot.slot_number)}
                    onMouseEnter={() => setHoveredFrame(slot.id)}
                    onMouseLeave={() => setHoveredFrame(null)}
                    style={{ padding: '2px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', background: isActive ? (colorSame ? 'rgba(10,132,255,0.35)' : '#0A84FF') : '#2A2A2A', color: isActive ? (colorSame ? 'rgba(255,255,255,0.6)' : '#FFFFFF') : 'rgba(255,255,255,0.45)', border: `1px solid ${isActive ? (colorSame ? 'transparent' : '#0A84FF') : 'rgba(255,255,255,0.1)'}` }}>
                    F{slot.slot_number}
                  </div>
                  {isHovered && slot.gel_number && (
                    <div style={{ position: 'fixed', zIndex: 99999, transform: 'translateX(-50%)', marginTop: '4px', background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px', padding: '8px 10px', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', minWidth: '120px' }}
                      ref={el => {
                        if (el) {
                          const btn = el.previousSibling;
                          if (btn) {
                            const rect = btn.getBoundingClientRect();
                            el.style.top = (rect.bottom + 6) + 'px';
                            el.style.left = (rect.left + rect.width / 2) + 'px';
                          }
                        }
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: getGelColor(slot.gel_number), flexShrink: 0, border: '1px solid rgba(255,255,255,0.18)' }} />
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>{slot.gel_number}</div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.62)' }}>{slot.gel_name}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: fieldsShown.when === false ? 'none' : 'flex', gap: '4px', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '4px', alignItems: 'center', borderRadius: '6px', ...lineHighlightStyle(spotCue.when_highlight) }}>
          {withLQ && (
            <span style={{ fontSize: '12px', color: '#FFFFFF', whiteSpace: 'nowrap', padding: '2px 0' }}>
              w/ LQ {lqNumber || '?'}
            </span>
          )}
          <RichLine value={spotCue.description}
            onSave={html => onUpdate(spotCue.id, 'description', html)}
            placeholder={withLQ ? '' : 'When…'}
            style={{ flex: 1, minWidth: 0, borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.62)', padding: '2px 0', fontSize: '12px' }} />
          </div>
          <div data-tour="cue-wlq" onClick={toggleWLQ} role="switch" aria-checked={withLQ}
            title={withLQ ? 'Linked to this cue\'s LQ number — click to unlink' : 'Link to this cue\'s LQ number'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: '44px', height: '20px', borderRadius: '10px', background: withLQ ? '#0A84FF' : 'rgba(255,255,255,0.10)', position: 'relative', transition: 'background 0.15s' }}>
              <div style={{ position: 'absolute', top: '2px', left: withLQ ? '16px' : '2px', width: '26px', height: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.85)', boxShadow: '0 3px 8px rgba(0,0,0,0.15)', transition: 'left 0.15s' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: withLQ ? '#409CFF' : 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>w/LQ</span>
          </div>
        </div>

        <RichLine value={spotCue.notes}
          onSave={html => onUpdate(spotCue.id, 'notes', html)}
          placeholder="Notes…"
          style={{ display: fieldsShown.notes === false ? 'none' : undefined, borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: 'rgba(255,255,255,0.62)', padding: '2px 0', fontSize: '12px', ...lineHighlightStyle(spotCue.notes_highlight) }} />
      </div>
    </td>
  );
}

function InsertButton({ onInsert }) {
  const [hover, setHover] = useState(false);
  const insertRef = useRef(false);
  return (
    <tr style={{ height: hover ? '24px' : '4px', transition: 'height 0.1s' }}>
      <td colSpan={99}
        style={{ padding: 0, textAlign: 'center', verticalAlign: 'middle', overflow: 'visible', position: 'relative', zIndex: 0 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        {hover ? (
          <div onClick={e => { 
            e.stopPropagation(); 
            if (insertRef.current) return;
            insertRef.current = true;
            onInsert();
            setTimeout(() => { insertRef.current = false; }, 500);
          }}
            style={{ fontSize: '10px', color: '#409CFF', cursor: 'pointer', padding: '2px 6px', background: 'rgba(10,132,255,0.16)', borderRadius: '6px', display: 'inline-block', position: 'relative', zIndex: 1 }}>
            + insert cue here
          </div>
        ) : (
          <div style={{ width: '100%', height: '4px', pointerEvents: 'none' }} />
        )}
      </td>
    </tr>
  );
}

// Header button that shows/hides a spot's color load: a few of the spot's colors as overlapping dots
function ColorLoadButton({ slots, open, onClick }) {
  const colors = slots.filter(sl => sl.gel_number).slice(0, 3).map(sl => getGelColor(sl.gel_number));
  return (
    <button onClick={onClick} title={open ? 'Hide color load' : 'Show color load'} aria-label={open ? 'Hide color load' : 'Show color load'} aria-expanded={open}
      style={{ flexShrink: 0, height: '22px', display: 'flex', alignItems: 'center', gap: '5px', padding: '0 7px', marginTop: '2px', border: 'none', borderRadius: '6px', cursor: 'pointer',
        background: open ? 'rgba(10,132,255,0.22)' : 'rgba(255,255,255,0.08)', color: open ? '#409CFF' : 'rgba(255,255,255,0.55)' }}>
      <span style={{ display: 'flex' }}>
        {(colors.length ? colors : ['#3a3a3a']).map((c, i) => (
          <span key={i} style={{ width: '9px', height: '9px', borderRadius: '50%', background: c, marginLeft: i ? '-3px' : 0, boxShadow: '0 0 0 1.5px #262626' }} />
        ))}
      </span>
      <span style={{ fontSize: '9px', lineHeight: 1 }}>{open ? '▲' : '▼'}</span>
    </button>
  );
}

// A spot's full color load, shown under its name in the cue list header. Always one row: the
// chips share the column's width, each taking the room its gel number needs (a color strip on top,
// then the frame and gel number), and a long
// gel number is cut short with "…" in a narrow column. Hover a chip for the full gel name.
function HeaderColorLoad({ slots, perm }) {
  const chip = (key, label, gelNumber, gelName, isPerm) => {
    const nums = (gelNumber || '').split('+').map(g => g.trim()).filter(Boolean);
    const colors = nums.map(n => gelColor(n) || '#FFFFFF');
    // A frame with several gels shows each gel's color side by side in the strip
    const strip = !nums.length ? 'transparent'
      : colors.length === 1 ? colors[0]
      : `linear-gradient(to right, ${colors.map((c, i) => `${c} ${(i * 100) / colors.length}% ${((i + 1) * 100) / colors.length}%`).join(', ')})`;
    const text = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' };
    return (
      <div key={key} title={[label, gelNumber, gelName].filter(Boolean).join(' · ') || label + ' · Empty'}
        style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '3px 2px 4px', borderRadius: '5px',
          background: 'rgba(255,255,255,0.06)', border: isPerm ? '1px solid rgba(255,214,10,0.35)' : '1px solid transparent' }}>
        <div style={{ alignSelf: 'stretch', height: '5px', borderRadius: '2px', background: strip, border: nums.length ? 'none' : '1px dashed rgba(255,255,255,0.25)', boxSizing: 'border-box' }} />
        <div style={{ ...text, fontSize: '9px', fontWeight: '600', color: isPerm ? '#C8A26B' : 'rgba(255,255,255,0.45)' }}>{label}</div>
        <div style={{ ...text, fontSize: '10.5px', fontWeight: '500', letterSpacing: '-0.01em', color: nums.length ? '#FFFFFF' : 'rgba(255,255,255,0.3)' }}>{nums.length ? nums.join('+') : '—'}</div>
      </div>
    );
  };
  return (
    <div style={{ display: 'flex', gap: '2px', marginTop: '7px' }}>
      {slots.map(sl => chip(sl.id, 'F' + sl.slot_number, sl.gel_number, sl.gel_name, false))}
      {perm && chip('perm', 'PERM', perm.gel_number, perm.gel_name, true)}
    </div>
  );
}

function CueRow({ onDragFinished, onCellMenu, onCueMenu, menuCell, colorChangesBySpot, irisChangesBySpot, cue, isLastCue, fieldsShown, spots, spotCues, characters, colorSlotsBySpot, scenes, onUpdateCue, onUpdateSpotCue, onNewCustomCharacter, onDelete, onInsertAfter, dragSource, dragTarget, setDragSource, setDragTarget, setShowDragModal, onCueDoubleClick, irisSizes, customActions, actionNames, defaults, fromOffCells, aboveCells }) {
  const [editingLQ, setEditingLQ] = useState(false);
  const [lqVal, setLqVal] = useState(cue.lq_number || '');

  useEffect(() => { setLqVal(cue.lq_number || ''); }, [cue.lq_number]);
  // Script page the cue is on (typed, so "13" or "13a" both work)
  const [editingPage, setEditingPage] = useState(false);
  const [pageVal, setPageVal] = useState(cue.page || '');
  useEffect(() => { setPageVal(cue.page || ''); }, [cue.page]);
  const savePage = () => {
    setEditingPage(false);
    const v = pageVal.trim();
    if (v !== (cue.page || '')) onUpdateCue(cue.id, 'page', v || null);
  };

  const saveLQ = () => {
    setEditingLQ(false);
    onUpdateCue(cue.id, 'lq_number', lqVal);
  };

  return (
    <>
      <tr data-cue-id={cue.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <td onContextMenu={e => { if (e.target.closest('input, select')) return; e.preventDefault(); onCueMenu(cue); }}
          style={{ padding: '8px 6px', borderRight: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'top', width: '90px', minWidth: '90px', position: 'relative' }}>
          {cue.all_spots_note && cue.all_spots_note.trim() && (
            <div title={`Note for all spots: ${cue.all_spots_note}`} style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#FFD60A' }} />
          )}
          <div data-tour="cue-lq" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            {editingLQ ? (
              <input autoFocus value={lqVal} onChange={e => setLqVal(e.target.value)}
                onBlur={saveLQ} onKeyDown={e => { if (e.key === 'Enter') saveLQ(); if (e.key === 'Escape') { setLqVal(cue.lq_number || ''); setEditingLQ(false); } }}
                style={{ width: '100%', maxWidth: '78px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid #0A84FF', borderRadius: '6px', color: '#FFFFFF', padding: '3px 2px', fontSize: '16px', fontWeight: '700', textAlign: 'center', outline: 'none', fontVariantNumeric: 'tabular-nums' }} />
            ) : (
              <div onClick={() => setEditingLQ(true)} style={{ fontSize: '20px', fontWeight: '700', color: lqVal ? '#FFFFFF' : 'rgba(255,255,255,0.28)', cursor: 'pointer', minHeight: '24px', fontVariantNumeric: 'tabular-nums' }}>
                {lqVal || '—'}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
              <span>T·{cue.track_number}</span>
              {fieldsShown.page === false ? null : editingPage ? (
                <input autoFocus value={pageVal} onChange={e => setPageVal(e.target.value)}
                  onBlur={savePage} onKeyDown={e => { if (e.key === 'Enter') savePage(); if (e.key === 'Escape') { setPageVal(cue.page || ''); setEditingPage(false); } }}
                  placeholder="pg" style={{ width: '34px', background: 'rgba(255,255,255,0.05)', border: '1px solid #0A84FF', borderRadius: '4px', color: '#FFFFFF', padding: '0 3px', fontSize: '10px', textAlign: 'center', outline: 'none' }} />
              ) : (
                <span onClick={() => setEditingPage(true)} title="Script page"
                  style={{ cursor: 'pointer', color: pageVal ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)' }}>
                  pg {pageVal || '–'}
                </span>
              )}
            </div>
            <select value={cue.scene_id || ''} onChange={e => onUpdateCue(cue.id, 'scene_id', e.target.value ? parseInt(e.target.value) : null)}
              style={{ width: '74px', height: '20px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', color: 'rgba(255,255,255,0.45)', padding: '0 4px', fontSize: '10px', outline: 'none', marginTop: '4px' }}>
              <option value="">No scene</option>
              {scenes.map(s => <option key={s.id} value={s.id}>{s.label}{s.song ? ' · ' + s.song : ''}</option>)}
            </select>
            <div onClick={() => { if (window.confirm('Delete this cue? It\'s removed for every spot. ⌘Z brings it back.')) onDelete(cue.id); }}
              style={{ fontSize: '10px', fontWeight: '500', color: '#FF453A', cursor: 'pointer', marginTop: '2px', padding: '1px 6px', borderRadius: '6px', opacity: 0.45 }}
              onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(255,69,58,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = 0.45; e.currentTarget.style.background = 'transparent'; }}>
              Delete
            </div>
          </div>
        </td>
        {spots.map(spot => {
          const sc = spotCues.find(sc => sc.spot_id === spot.id && sc.cue_id === cue.id);
          const slots = colorSlotsBySpot[spot.id] || [];
          return (
            <SpotCueCell key={spot.id} spotCue={sc} spot={spot} cue={cue} fieldsShown={fieldsShown}
              characters={characters} colorSlots={slots}
              defaults={defaults} fromOff={!!fromOffCells?.has(`${cue.id}:${spot.id}`)} above={aboveCells?.get(`${cue.id}:${spot.id}`)}
              onUpdate={onUpdateSpotCue} onNewCustomCharacter={onNewCustomCharacter} lqNumber={lqVal}
              onDragStart={() => setDragSource({ spotCue: sc, spot, cue })}
              onDragOver={(e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                setDragTarget({ spotCue: sc, spot, cue }); 
              }}
              onDragLeave={(e) => { 
                if (!e.currentTarget.contains(e.relatedTarget)) setDragTarget(null); 
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragSource && !(dragSource.spot?.id === spot?.id && dragSource.cue?.id === cue?.id)) {
                  setDragTarget({ spotCue: sc, spot, cue });
                  setShowDragModal(true);
                  onDragFinished(true);
                }
              }}
              onDragEnd={() => onDragFinished(false)}
              onContextMenu={(e) => { e.preventDefault(); onCellMenu({ x: e.clientX, y: e.clientY, spotCue: sc, spot, cue }); }}
              isDragTarget={dragTarget?.cue?.id === cue?.id && dragTarget?.spot?.id === spot?.id}
              isMenuTarget={menuCell?.cueId === cue.id && (menuCell?.spotId === spot.id || menuCell?.spotId === 'all')}
              colorSame={!!sc && sc.action !== 'Off' && !!(sc.no_color || sc.active_frames) && !colorChangesBySpot?.[spot.id]?.has(cue.id)}
              irisSame={!!sc && sc.action !== 'Off' && !!sc.frame_size && !irisChangesBySpot?.[spot.id]?.has(cue.id)}
              irisSizes={irisSizes}
              customActions={customActions}
              actionNames={actionNames}
              onDoubleClick={(e) => {
                // Inside a text box (When, Notes, a typed name or time), double-click selects a word as usual
                if (e.target.closest('input, textarea, [contenteditable]')) return;
                onCueDoubleClick(cue, spot, sc);
              }}
            />
          );
        })}
      </tr>
      {!isLastCue && <InsertButton onInsert={() => onInsertAfter(cue.id, cue.scene_id)} />}
    </>
  );
}

// Notes sidebar open or closed (remembered on this Mac). Kept outside the cue list screen's own state so
// opening it only redraws the button and the sidebar, not every cue row (which made the slide lag).
const notesOpen = {
  value: (() => { try { return localStorage.getItem('spotplot_notes_sidebar') === '1'; } catch (e) { return false; } })(),
  listeners: new Set(),
  set(v) {
    this.value = v;
    try { localStorage.setItem('spotplot_notes_sidebar', v ? '1' : '0'); } catch (e) {}
    this.listeners.forEach(f => f(v));
  },
};
function useNotesOpen() {
  const [open, setOpen] = useState(notesOpen.value);
  useEffect(() => { notesOpen.listeners.add(setOpen); return () => notesOpen.listeners.delete(setOpen); }, []);
  return open;
}

// iPads connected to this show right now: one green dot each (past 6, one dot and the number), like the
// dashboard's iPad Sync button, and Send to iPads: iPads only get changes when you send them.
// Only while this show lets iPads connect.
// Renumber T·: just "Renumber" when the window is narrow
function RenumberButton({ onClick }) {
  const narrow = useNarrowWindow(900);
  return (
    <button onClick={onClick} title="Renumber T· 1, 2, 3… top to bottom. Cue order doesn't change."
      style={{ height: '28px', padding: '0 12px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
      {narrow ? 'Renumber' : 'Renumber T·'}
    </button>
  );
}

// A small icon button for the top bar (an SVG drawn in a 20×20 box)
function HeaderIconButton({ title, onClick, children }) {
  return (
    <button onClick={onClick} title={title} aria-label={title}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      style={{ width: '32px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', borderRadius: '6px', color: '#FFFFFF', cursor: 'pointer' }}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
    </button>
  );
}

// True when the window is narrow (half a screen): the top bar drops words it can do without
function useNarrowWindow(limit = 1150) {
  const [narrow, setNarrow] = useState(() => window.innerWidth < limit);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < limit);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [limit]);
  return narrow;
}

function IpadDots({ showId }) {
  const [state, setState] = useState({ enabled: false, online: 0, unsent: false });
  const [sending, setSending] = useState(false);
  const narrow = useNarrowWindow();
  const read = (st) => setState({ enabled: !!st?.enabled, online: (st?.devices || []).filter(d => d.online).length, unsent: !!st?.unsent || !st?.sentAt });
  useEffect(() => {
    const check = () => read(ipcRenderer.sendSync('ipad-sync-state', showId));
    check();
    const timer = setInterval(check, 3000);
    return () => clearInterval(timer);
  }, [showId]);
  if (!state.enabled) return null;
  const n = state.online;
  const send = async () => {
    if (sending || !state.unsent) return;
    setSending(true);
    const result = await ipcRenderer.invoke('ipad-sync-send', showId);
    setSending(false);
    if (result?.success) read(result.state);
    else window.alert('Could not send to the iPads: ' + (result?.error || 'unknown error'));
  };
  const ready = state.unsent && !sending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0, whiteSpace: 'nowrap' }}>
      <span title={n ? `${n} iPad${n === 1 ? '' : 's'} connected` : 'No iPads connected'}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'rgba(255,255,255,0.62)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          {Array.from({ length: n > 6 ? 1 : Math.max(n, 1) }).map((_, i) => (
            <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: n ? '#30D158' : 'rgba(255,255,255,0.35)' }} />
          ))}
          {n > 6 && <span style={{ fontWeight: '600', color: '#30D158', marginLeft: '2px', fontVariantNumeric: 'tabular-nums' }}>{n}</span>}
        </span>
        {narrow ? (n || '') : n ? `${n} iPad${n === 1 ? '' : 's'}` : 'No iPads'}
      </span>
      <button onClick={send} disabled={!ready}
        title={sending ? 'Sending…' : state.unsent ? 'Send your changes to the iPads. Operators choose when to update.' : 'The iPads have everything'}
        style={{ height: '28px', padding: '0 12px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500',
          background: ready ? '#0A84FF' : 'rgba(255,255,255,0.10)', color: ready ? '#FFFFFF' : 'rgba(255,255,255,0.45)', cursor: ready ? 'pointer' : 'default' }}>
        {sending ? 'Sending…' : state.unsent ? (narrow ? 'Send' : 'Send to iPads') : 'Sent'}
      </button>
    </span>
  );
}

function NotesButton({ count }) {
  const open = useNotesOpen();
  return (
    <button data-tour="notes-toggle" aria-label="Notes" onClick={() => notesOpen.set(!notesOpen.value)} title={open ? 'Hide notes' : 'Show notes, and take notes during a run'}
      style={{ flexShrink: 0, height: '28px', padding: '0 8px', background: open ? 'rgba(10,132,255,0.22)' : 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: open ? '#409CFF' : '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      {/* A page with a pen: the Notes sidebar */}
      <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12.5 2.5H5a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 5 17.5h9a1.5 1.5 0 0 0 1.5-1.5v-3" />
        <path d="M6.5 7h4M6.5 10h3M6.5 13h2.5" />
        <path d="M16.6 3.4a1.4 1.4 0 0 1 2 2L12.5 11.5l-2.7.7.7-2.7z" />
      </svg>{count ? <span style={{ minWidth: '16px', height: '16px', borderRadius: '8px', background: '#FFD60A', color: '#1a1a1a', fontSize: '10px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{count}</span> : null}
    </button>
  );
}

// The Notes sidebar's frame: slides in and out from the right edge. Its width grows from 0, so the cue
// list makes room as it comes in. The slide starts on the click itself (the 0 width is measured before
// the change, so the browser animates it straight away). Instant when the Mac is set to reduce motion.
function SlidePanel({ width, children }) {
  const open = useNotesOpen();
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (open && !mounted) { setMounted(true); return; }
    if (open && mounted && !shown) { void ref.current?.offsetWidth; setShown(true); return; }
    if (!open && shown) setShown(false);
  }, [open, mounted, shown]);
  useEffect(() => {
    if (open || !mounted) return;
    const t = setTimeout(() => setMounted(false), 260);   // keep it drawn while it slides out
    return () => clearTimeout(t);
  }, [open, mounted]);
  if (!mounted) return null;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <div ref={ref} style={{ width: shown ? width : 0, flexShrink: 0, overflow: 'hidden', display: 'flex', transition: reduce ? 'none' : 'width 240ms cubic-bezier(0.2, 0.8, 0.2, 1)', willChange: 'width' }}>
      {children}
    </div>
  );
}

// Double-clicked scene header: rename the scene right there (Enter or clicking away saves, Escape cancels).
// Its own component so typing only redraws these two boxes, not the whole cue list.
const sceneInputStyle = { height: '22px', background: 'rgba(0,0,0,0.25)', border: '1px solid #0A84FF', borderRadius: '5px', padding: '0 6px', fontSize: '12px', outline: 'none', fontFamily: 'inherit', textAlign: 'center' };
function SceneNameEditor({ label: startLabel, song: startSong, actBreak, onSave }) {
  const [label, setLabel] = useState(startLabel);
  const [song, setSong] = useState(startSong);
  const save = () => onSave(label, song);
  return (
    <span onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) save(); }}
      style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
      <input autoFocus value={label} placeholder="Scene" onChange={e => setLabel(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); }}
        style={{ ...sceneInputStyle, width: '180px', fontWeight: '700', color: actBreak ? '#FF9F0A' : '#30D158' }} />
      <input value={song} placeholder="Song or title" onChange={e => setSong(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); }}
        style={{ ...sceneInputStyle, width: '220px', color: actBreak ? 'rgba(255,159,10,0.85)' : 'rgba(48,209,88,0.85)' }} />
    </span>
  );
}

export default function CueListScreen({ show, navigate }) {
  const [data, setData] = useState({ spots: [], scenes: [], cues: [], spotCues: [] });
  const [characters, setCharacters] = useState([]);
  const [colorSlotsBySpot, setColorSlotsBySpot] = useState({});
  const [permSlotBySpot, setPermSlotBySpot] = useState({});
  // Spots whose color load is shown in the header. Remembered per show on this Mac (not show data).
  const colorLoadKey = 'spotplot_cuelist_colorload_' + show.id;
  const [openColorLoads, setOpenColorLoads] = useState(() => {
    try { return JSON.parse(localStorage.getItem(colorLoadKey)) || []; } catch (e) { return []; }
  });
  const toggleColorLoad = (spotId) => setOpenColorLoads(prev => {
    const next = prev.includes(spotId) ? prev.filter(id => id !== spotId) : [...prev, spotId];
    try { localStorage.setItem(colorLoadKey, JSON.stringify(next)); } catch (e) {}
    return next;
  });
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showCharModal, setShowCharModal] = useState(false);
  useEscape(() => setShowSceneModal(false), showSceneModal);
  useEscape(() => setShowCharModal(false), showCharModal);
  const [newSceneLabel, setNewSceneLabel] = useState('');
  const [newSceneSong, setNewSceneSong] = useState('');
  const [newCharName, setNewCharName] = useState('');
  const [newCharActor, setNewCharActor] = useState('');
  const [selectedSceneId, setSelectedSceneId] = useState(null);   // where new cues go
  const [jumpSceneId, setJumpSceneId] = useState('');   // the Jump to menu: starts as "Jump to scene…" each time
  const scrollRef = useRef(null);
  // Sticky scene headers sit just under the sticky spot header
  const theadRef = useRef(null);
  const [theadHeight, setTheadHeight] = useState(48);
  // The pinned scene header whose first cue has scrolled past (shown in [brackets])
  const [continuedScene, setContinuedScene] = useState(null);
  useEffect(() => {
    if (!theadRef.current) return;
    const ro = new ResizeObserver(() => setTheadHeight(theadRef.current?.getBoundingClientRect().height || 48));
    ro.observe(theadRef.current);
    return () => ro.disconnect();
  });
  const updateContinuedScene = () => {
    const container = scrollRef.current;
    if (!container) return;
    let current = null;
    container.querySelectorAll('tr[data-scene-key]').forEach(row => {
      // Measure the header cell: it's what sticks (the row itself keeps its original place)
      const headerCell = row.firstElementChild;
      const firstCue = row.nextElementSibling;
      if (headerCell && firstCue && !firstCue.hasAttribute('data-scene-key') &&
          firstCue.getBoundingClientRect().top < headerCell.getBoundingClientRect().bottom - 1) {
        current = row.getAttribute('data-scene-key');
      }
    });
    setContinuedScene(current);
  };
  const [irisSizes, setIrisSizes] = useState([]);
  // Which cue fields this show shows on the cue list (Show Settings > Cue Settings)
  const [listFields, setListFields] = useState({});
  const [customActions, setCustomActions] = useState([]);
  const [actionNames, setActionNames] = useState({});   // built-in actions renamed for this show
  const [showCueDefaults, setShowCueDefaults] = useState(() => cueDefaults(null));   // Show Settings → Cue Defaults
  const [dragSource, setDragSource] = useState(null);
  // A drag that ends anywhere other than another cell (or back on its own cell) clears the highlight.
  // Drops onto another cell open the copy/swap menu, whose buttons clear it when done.
  const dropOpenedMenu = useRef(false);
  const dragFinished = (openedMenu) => {
    if (openedMenu) { dropOpenedMenu.current = true; return; }
    if (!dropOpenedMenu.current) { setDragSource(null); setDragTarget(null); }
    dropOpenedMenu.current = false;
  };
  const [dragTarget, setDragTarget] = useState(null);
  const [showDragModal, setShowDragModal] = useState(false);
  useEscape(() => { setShowDragModal(false); setDragSource(null); setDragTarget(null); setDragModalStep('action'); }, showDragModal);
  const [dragModalStep, setDragModalStep] = useState('action');
  const [cuePopup, setCuePopup] = useState(null);
  // Escape closes the cue box's options (saving the spot note), the drag box, and the add scene / character boxes
  const closeCuePopup = () => {
    const ta = document.getElementById('popup-note-textarea');
    if (ta && cuePopup?.spotCue?.id) updateSpotCue(cuePopup.spotCue.id, 'spot_note', ta.value);
    setCuePopup(null);
  };
  useEscape(() => closeCuePopup(), !!cuePopup);
  // ⌘Z / ⇧⌘Z in the cue list. Every change records how to take it back (pushUndo); everything changed by
  // one click or menu choice (an action plus the time and intensity it fills in, a pasted cue…) is one step.
  // Kinds: 'spot-cue' / 'cue' (a field: puts back oldValue), 'tracks' (T· numbers), 'scene' (name),
  // 'cue-created' / 'cue-deleted' (with what it held), 'note-given' / 'note-restored',
  // 'scene-created' / 'scene-deleted', 'character-created' / 'character-deleted', 'batch'.
  // Undoing a step records its opposite on the redo stack, and redoing records it back.
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const undoGroupRef = useRef(null);
  const pushUndo = (entry) => {
    redoStackRef.current = [];   // a new change ends the redo trail
    const entries = entry.type === 'batch' ? entry.entries : [entry];
    if (!entries.length) return;
    if (undoGroupRef.current) { undoGroupRef.current.entries.push(...entries); return; }
    const group = { type: 'batch', entries: [...entries] };
    undoGroupRef.current = group;
    undoStackRef.current = [...undoStackRef.current.slice(-49), group];
    queueMicrotask(() => { undoGroupRef.current = null; });
  };
  const [popupNote, setPopupNote] = useState('');

  // False until the cues have been read once, so the "No cues yet" screen never flashes while loading
  const [loaded, setLoaded] = useState(false);

  const load = () => {
    const result = ipcRenderer.sendSync('db-get-cue-list', show.id);
    const safe = result && typeof result === 'object' ? result : { spots: [], scenes: [], cues: [], spotCues: [] };
    setData(safe);
    setLoaded(true);
    const chars = ipcRenderer.sendSync('db-get-characters', show.id);
    setCharacters(Array.isArray(chars) ? chars : []);
    const slotsBySpot = {}, permBySpot = {};
    for (const spot of (safe.spots || [])) {
      const all = ipcRenderer.sendSync('db-get-color-slots-all', spot.id);
      slotsBySpot[spot.id] = (Array.isArray(all) ? all : []).filter(sl => !sl.is_permanent);
      permBySpot[spot.id] = (Array.isArray(all) ? all : []).find(sl => sl.is_permanent && (sl.gel_number || sl.gel_name)) || null;
    }
    setColorSlotsBySpot(slotsBySpot);
    setPermSlotBySpot(permBySpot);
    const updatedShow = ipcRenderer.sendSync('db-get-show', show.id);
    // The show's iris sizes in order (defaults, possibly renamed or moved, plus custom ones)
    setIrisSizes(irisSizeList(updatedShow?.iris_sizes));
    const customActionData = updatedShow?.custom_actions ? JSON.parse(updatedShow.custom_actions) : [];
    setCustomActions(customActionData);
    setActionNames(actionNameMap(updatedShow?.action_names));
    setShowCueDefaults(cueDefaults(updatedShow?.cue_defaults));
    setListFields(Object.fromEntries(Object.entries(cueFieldSettings(updatedShow?.cue_fields)).map(([k, v]) => [k, v.list])));
    if (safe.scenes && safe.scenes.length > 0 && !selectedSceneId) setSelectedSceneId(safe.scenes[0].id);
  };

  useEffect(() => { load(); }, []);

  // Coming back to the cue list reopens exactly where you left off (kept per show while SpotPlot is open).
  // The position is put back once the cues are drawn; until then scrolling isn't saved, so it can't be overwritten.
  const scrollRestored = useRef(false);
  const restoreStarted = useRef(false);   // runs once: a later data change mustn't start a second restore over a jump
  useEffect(() => {
    if (!loaded || restoreStarted.current) return;
    restoreStarted.current = true;
    // Spot Notes → Go to Cue: show that cue (in the middle) and outline the note's spot for a moment
    const jump = JSON.parse(sessionStorage.getItem(`cueJump_${show.id}`) || 'null');
    if (jump) {
      sessionStorage.removeItem(`cueJump_${show.id}`);
      // A big show can take a few seconds to draw, and rows above settle in height while it does, so wait
      // for the row (up to 8s) and keep it in the middle for a few frames once it's there
      const started = Date.now();
      let settled = 0;
      const show_ = () => {
        const el = scrollRef.current;
        const row = el && el.querySelector(`tr[data-cue-id="${jump.cueId}"]`);
        if (!row) {
          if (Date.now() - started < 8000) requestAnimationFrame(show_); else scrollRestored.current = true;
          return;
        }
        el.scrollTop += row.getBoundingClientRect().top - el.getBoundingClientRect().top - (el.clientHeight - row.offsetHeight) / 2;
        if (settled === 0) {
          setMenuCell({ cueId: jump.cueId, spotId: jump.spotId });
          setTimeout(() => setMenuCell(m => (m && m.cueId === jump.cueId ? null : m)), 1800);
        }
        if (++settled < 15) requestAnimationFrame(show_); else scrollRestored.current = true;
      };
      requestAnimationFrame(show_);
      return;
    }
    const saved = JSON.parse(sessionStorage.getItem(`cueScroll_${show.id}`) || 'null');
    if (!saved) { scrollRestored.current = true; return; }
    // Put the cue that was at the top back at the same spot (rows above can settle to slightly different
    // heights while the list draws, so a pixel count alone would drift). Re-checked for a few frames.
    let tries = 0;
    const put = () => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollLeft = saved.left || 0;
      const row = saved.cueId && el.querySelector(`tr[data-cue-id="${saved.cueId}"]`);
      if (row) el.scrollTop += (row.getBoundingClientRect().top - el.getBoundingClientRect().top) - saved.offset;
      else el.scrollTop = saved.top;
      if (++tries > 20) scrollRestored.current = true;
      else requestAnimationFrame(put);
    };
    requestAnimationFrame(put);
  }, [loaded, data]);

    const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    const handler = () => {
      const cues = dataRef.current?.cues || [];
      if (cues.length > 0) {
        const lastCue = [...cues].sort((a, b) => a.sort_order - b.sort_order)[cues.length - 1];
        insertCueAfter(lastCue.id, lastCue.scene_id);
      } else {
        addCue();
      }
    };
    ipcRenderer.on('menu-add-cue', handler);
    return () => {
      ipcRenderer.removeListener('menu-add-cue', handler);
    };
  }, []);

  // Applies one recorded step and returns its opposite (for the other stack). Refreshed every render so
  // it sees the latest data and functions.
  const stepRef = useRef(null);
  stepRef.current = (from, to) => {
    const last = from.current[from.current.length - 1];
    if (!last) return;
    from.current = from.current.slice(0, -1);
    let reload = false;
    const applyOne = (u) => {
      if (!['spot-cue', 'cue', 'tracks', 'batch'].includes(u.type)) reload = true;   // cues, scenes or characters come and go
      if (u.type === 'spot-cue') {
        ipcRenderer.sendSync('db-update-spot-cue', { spotCueId: u.spotCueId, field: u.field, value: u.oldValue });
        setData(d => ({ ...d, spotCues: (d?.spotCues || []).map(sc => sc.id === u.spotCueId ? { ...sc, [u.field]: u.oldValue } : sc) }));
        return { ...u, oldValue: u.newValue, newValue: u.oldValue };
      }
      if (u.type === 'cue') {
        ipcRenderer.sendSync('db-update-cue', { cueId: u.cueId, field: u.field, value: u.oldValue });
        setData(d => ({ ...d, cues: (d?.cues || []).map(c => c.id === u.cueId ? { ...c, [u.field]: u.oldValue } : c) }));
        return { ...u, oldValue: u.newValue, newValue: u.oldValue };
      }
      if (u.type === 'tracks') {
        const now = (dataRef.current?.cues || []).map(c => ({ id: c.id, track_number: c.track_number }));
        ipcRenderer.sendSync('db-restore-tracks', { showId: show.id, tracks: u.before });
        const old = new Map(u.before.map(t => [t.id, t.track_number]));
        setData(d => ({ ...d, cues: (d?.cues || []).map(c => old.has(c.id) ? { ...c, track_number: old.get(c.id) } : c) }));
        return { type: 'tracks', before: now };
      }
      if (u.type === 'scene') {
        const sc = (dataRef.current?.scenes || []).find(x => x.id === u.sceneId);
        ipcRenderer.sendSync('db-update-scene', { sceneId: u.sceneId, label: u.label, song: u.song, actBreak: u.actBreak });
        return sc ? { type: 'scene', sceneId: sc.id, label: sc.label, song: sc.song || '', actBreak: !!sc.act_break } : null;
      }
      if (u.type === 'cue-created') {
        const r = ipcRenderer.sendSync('db-delete-cue', u.cueId);
        return r?.snapshot ? { type: 'cue-deleted', snapshot: r.snapshot } : null;
      }
      if (u.type === 'cue-deleted') {
        ipcRenderer.sendSync('db-restore-cue', u.snapshot);
        return { type: 'cue-created', cueId: u.snapshot.cue.id };
      }
      if (u.type === 'note-given') {
        const r = ipcRenderer.sendSync('db-restore-given-note', u.givenId);
        return r?.restored ? { type: 'note-restored', ...r.restored } : null;
      }
      if (u.type === 'note-restored') {
        const r = ipcRenderer.sendSync('db-give-note', u.spotCueId ? { spotCueId: u.spotCueId } : { cueId: u.cueId });
        return r?.id ? { type: 'note-given', givenId: r.id } : null;
      }
      if (u.type === 'scene-created') {
        const row = (dataRef.current?.scenes || []).find(x => x.id === u.sceneId);
        ipcRenderer.sendSync('db-delete-scene', u.sceneId);
        return row ? { type: 'scene-deleted', row } : null;
      }
      if (u.type === 'scene-deleted') {
        ipcRenderer.sendSync('db-restore-row', { table: 'scenes', row: u.row });
        return { type: 'scene-created', sceneId: u.row.id };
      }
      if (u.type === 'character-created') {
        const row = (ipcRenderer.sendSync('db-get-characters', show.id) || []).find(c => c.id === u.characterId);
        ipcRenderer.sendSync('db-delete-character', u.characterId);
        return row ? { type: 'character-deleted', row } : null;
      }
      if (u.type === 'character-deleted') {
        ipcRenderer.sendSync('db-restore-row', { table: 'characters', row: u.row });
        return { type: 'character-created', characterId: u.row.id };
      }
      if (u.type === 'batch') return { type: 'batch', entries: [...u.entries].reverse().map(applyOne).filter(Boolean) };
      return null;
    };
    const opposite = applyOne(last);
    if (opposite) to.current = [...to.current.slice(-49), opposite];
    if (reload) load();
  };

  // Edit → Undo / Redo and ⌘Z / ⇧⌘Z (App.jsx sends them here unless you're typing in a box)
  useEffect(() => {
    setUndoTarget((what) => {
      if (what === 'redo') stepRef.current(redoStackRef, undoStackRef);
      else stepRef.current(undoStackRef, redoStackRef);
    });
    return () => setUndoTarget(null);
  }, []);

  const addCue = () => {
    const lastCue = (data?.cues || [])[(data?.cues || []).length - 1];
    const sceneId = selectedSceneId || (lastCue ? lastCue.scene_id : null);
    const r = ipcRenderer.sendSync('db-create-cue', { showId: show.id, sceneId });
    if (r?.success) pushUndo({ type: 'cue-created', cueId: r.id });
    load();
  };

  // The strip under a scene header: a new first cue for that scene. In an act break with no cues yet, it
  // goes where the act break is (after the last cue before it), so it picks up what each spot was doing.
  const insertCueAtSceneTop = (group) => {
    let place = {};
    if (group.cues.length) place = { beforeCueId: group.cues[0].id };
    else {
      const groups = groupedCues();
      const i = groups.findIndex(g => g.sceneId === group.sceneId);
      const before = groups.slice(0, i).flatMap(g => g.cues), after = groups.slice(i + 1).flatMap(g => g.cues);
      if (before.length) place = { afterCueId: before[before.length - 1].id };
      else if (after.length) place = { beforeCueId: after[0].id };
    }
    const r = ipcRenderer.sendSync('db-create-cue', { showId: show.id, sceneId: group.sceneId, ...place });
    if (r?.success) pushUndo({ type: 'cue-created', cueId: r.id });
    load();
  };

  const insertCueAfter = (afterCueId, sceneId) => {
    const r = ipcRenderer.sendSync('db-create-cue', { showId: show.id, sceneId, afterCueId });
    if (r?.success) pushUndo({ type: 'cue-created', cueId: r.id });
    load();
  };

    const updateCue = (cueId, field, value) => {
    const oldCue = (data?.cues || []).find(c => c.id === cueId);
    const oldValue = oldCue ? oldCue[field] : null;
    ipcRenderer.sendSync('db-update-cue', { cueId, field, value });
      pushUndo({ type: 'cue', cueId, field, oldValue, newValue: value });
    if (field === 'scene_id') {
      load();
    } else {
      setData(d => ({ ...d, cues: (d?.cues || []).map(c => c.id === cueId ? { ...c, [field]: value } : c) }));
    }
  };

      const updateSpotCue = (spotCueId, field, value, skipUndo = false) => {
    const oldSpotCue = (data?.spotCues || []).find(sc => sc.id === spotCueId);
    const oldValue = oldSpotCue ? oldSpotCue[field] : null;
    ipcRenderer.sendSync('db-update-spot-cue', { spotCueId, field, value });
    setData(d => ({ ...d, spotCues: (d?.spotCues || []).map(sc => sc.id === spotCueId ? { ...sc, [field]: value } : sc) }));
    if (!skipUndo) {
      pushUndo({ type: 'spot-cue', spotCueId, field, oldValue, newValue: value });
    }
    // Tracked cues follow: the same spot's Tracked box in the next cue takes the change too (and on down
    // the line), unless someone set that box to something else. Its own ⌘Z entry, grouped with this click.
    if (oldSpotCue && TRACK_FOLLOW_FIELDS.includes(field)) {
      const cues = [...(data?.cues || [])].sort((a, b) => a.sort_order - b.sort_order);
      const next = cues[cues.findIndex(c => c.id === oldSpotCue.cue_id) + 1];
      const below = next && (data?.spotCues || []).find(x => x.cue_id === next.id && x.spot_id === oldSpotCue.spot_id);
      if (below && isTrackedAction(below.action) && sameTrackValue(below[field], oldValue) && !sameTrackValue(below[field], value)) {
        updateSpotCue(below.id, field, value);
      }
    }
  };
  const upsertSpotCue = (spotId, cueId, field, value) => {
    const result = ipcRenderer.sendSync('db-upsert-spot-cue', { spotId, cueId, field, value });
    if (result.success) {
      setData(d => {
        const existing = (d?.spotCues || []).find(sc => sc.spot_id === spotId && sc.cue_id === cueId);
        if (existing) {
          return { ...d, spotCues: d.spotCues.map(sc => sc.spot_id === spotId && sc.cue_id === cueId ? { ...sc, [field]: value } : sc) };
        } else {
          return { ...d, spotCues: [...(d.spotCues || []), { spot_id: spotId, cue_id: cueId, id: result.id, [field]: value }] };
        }
      });
    }
    return result;
  };
  const setPopupSpotCueField = (field, value) => {
    if (cuePopup.spotCue?.id) {
      updateSpotCue(cuePopup.spotCue.id, field, value);
      setCuePopup(p => ({ ...p, spotCue: { ...p.spotCue, [field]: value } }));
    } else {
      const result = upsertSpotCue(cuePopup.spot.id, cuePopup.cue.id, field, value);
      setCuePopup(p => ({ ...p, spotCue: { ...p.spotCue, spot_id: p.spot.id, cue_id: p.cue.id, id: result?.id, [field]: value } }));
    }
  };

  // For each spot, the cues where its color changes (its first color counts too), as the prints mark
  // in yellow. In other cues a lit frame that's the same as before shows muted, so changes stand out.
  const colorChangesBySpot = React.useMemo(() => {
    const out = {};
    const cues = [...(data?.cues || [])].sort((a, b) => a.sort_order - b.sort_order);
    const byKey = new Map((data?.spotCues || []).map(x => [x.cue_id + ':' + x.spot_id, x]));
    for (const spot of data?.spots || []) {
      const changed = new Set();
      let last = null;
      for (const cue of cues) {
        const sc = byKey.get(cue.id + ':' + spot.id);
        if (!sc || sc.action === 'Off') continue;
        const color = sc.no_color ? 'NC' : (sc.active_frames || '').split(',').filter(Boolean).sort().join(',');
        if (!color) continue;
        if (color !== last) changed.add(cue.id);
        last = color;
      }
      out[spot.id] = changed;
    }
    return out;
  }, [data]);
  // Same for iris size: bright blue where it changes, muted while it stays the same
  const irisChangesBySpot = React.useMemo(() => {
    const out = {};
    const cues = [...(data?.cues || [])].sort((a, b) => a.sort_order - b.sort_order);
    const byKey = new Map((data?.spotCues || []).map(x => [x.cue_id + ':' + x.spot_id, x]));
    for (const spot of data?.spots || []) {
      const changed = new Set();
      let last = null;
      for (const cue of cues) {
        const sc = byKey.get(cue.id + ':' + spot.id);
        if (!sc || sc.action === 'Off' || !sc.frame_size) continue;
        if (sc.frame_size !== last) changed.add(cue.id);
        last = sc.frame_size;
      }
      out[spot.id] = changed;
    }
    return out;
  }, [data]);

  // Right-click menu on a cue cell: a real macOS menu (main.js 'show-context-menu'). The cell stays
  // outlined while its menu is open; the chosen item comes back as 'context-menu-action'.
  const [menuCell, setMenuCell] = useState(null);
  const menuTargetRef = useRef(null);
  const menuActionRef = useRef(null);
  useEffect(() => {
    const onAction = (_e, id) => menuActionRef.current?.(id);
    const onClosed = () => setMenuCell(null);
    ipcRenderer.on('context-menu-action', onAction);
    ipcRenderer.on('context-menu-closed', onClosed);
    return () => {
      ipcRenderer.removeListener('context-menu-action', onAction);
      ipcRenderer.removeListener('context-menu-closed', onClosed);
    };
  }, []);

  // Clear cue: puts everything this spot does in this cue back to blank. One ⌘Z brings it all back.
  const BLANK_SPOT_CUE = {
    action: '', character_id: null, custom_character: null, extra_characters: null, frame_size: '', intensity: '', fade_time: '',
    location: '', active_frames: '', description: '', notes: '', ignore: 0, ignored: 0, highlight: null,
    spot_note: null, no_color: 0, note_checked: 0, when_highlight: null, notes_highlight: null, with_lq: 0,
  };
  // A spot that's Off stays Off; only what's filled in gets cleared.
  const isBlank = (v) => v === null || v === undefined || v === '' || v === 0;
  const fieldsToClear = (sc) => sc ? Object.keys(BLANK_SPOT_CUE).filter(f => !isBlank(sc[f]) && !(f === 'action' && sc.action === 'Off')) : [];
  const canClear = (sc) => fieldsToClear(sc).length > 0;
  const clearSpotCue = (sc) => {
    const entries = fieldsToClear(sc)
      .map(field => ({ type: 'spot-cue', spotCueId: sc.id, field, oldValue: sc[field], newValue: BLANK_SPOT_CUE[field] }));
    if (!entries.length) return;
    entries.forEach(e => updateSpotCue(sc.id, e.field, e.newValue, true));
    pushUndo({ type: 'batch', entries });
  };

  // The changes that setting these fields would make (for undo)
  const fieldEntries = (row, values) => Object.keys(values)
    .filter(f => (row[f] ?? null) !== (values[f] ?? null))
    .map(f => ({ type: 'spot-cue', spotCueId: row.id, field: f, oldValue: row[f] ?? null, newValue: values[f] ?? null }));
  // Sets several fields of one spot cue as a single ⌘Z step
  const setSpotCueFields = (row, values) => {
    const entries = fieldEntries(row, values);
    if (!entries.length) return;
    entries.forEach(e => updateSpotCue(row.id, e.field, e.newValue, true));
    pushUndo({ type: 'batch', entries });
  };
  // Every spot has a row for every cue, but make one if it's somehow missing
  const ensureSpotCue = (spot, cue, sc) => {
    if (sc?.id) return sc;
    const result = upsertSpotCue(spot.id, cue.id, 'action', '');
    return { spot_id: spot.id, cue_id: cue.id, id: result?.id, action: '' };
  };
  const cueName = (cue) => cue.lq_number ? `LQ ${cue.lq_number}` : `T·${cue.track_number}`;

  const openCellMenu = ({ spotCue: sc, spot, cue }) => {
    const clip = cueClipboard && cueClipboard.showId === show.id ? cueClipboard : null;
    const sep = { type: 'separator' };
    const highlightItems = (field, label) => [
      { label, enabled: false },
      { id: `hl:${field}:yellow`, label: 'Yellow', checked: sc?.[field] === 'yellow' },
      { id: `hl:${field}:red`, label: 'Red', checked: sc?.[field] === 'red' },
    ];
    const items = [
      { label: `Spot ${spot.spot_number} · ${cueName(cue)}`, enabled: false },
      sep,
      { id: 'copy', label: 'Copy Cue', enabled: !!sc },
      { id: 'paste', label: clip ? `Paste Cue (Spot ${clip.spotNumber} · ${clip.cueName})` : 'Paste Cue', enabled: !!clip },
      { id: 'paste-no-char', label: 'Paste Cue Without Character', enabled: !!clip },
      ...wholeCueItems(cue),
      sep,
      { label: 'Highlight', submenu: [...highlightItems('highlight', 'Whole Cue'), sep, ...highlightItems('when_highlight', 'When Line'), sep, ...highlightItems('notes_highlight', 'Notes Line')] },
      { id: 'ignore', label: 'Ignore Cue', checked: !!sc?.ignored },
      { id: 'note', label: sc?.spot_note ? 'Edit Spot Note…' : 'Add Spot Note…' },
      sep,
      { id: 'insert-above', label: 'Insert Cue Above' },
      { id: 'insert-below', label: 'Insert Cue Below' },
      { id: 'delete', label: `Delete ${cueName(cue)}…` },
      sep,
      { id: 'clear', label: 'Clear Cue', enabled: canClear(sc) },
    ];
    menuTargetRef.current = { spotCue: sc, spot, cue };
    setMenuCell({ spotId: spot.id, cueId: cue.id });
    ipcRenderer.send('show-context-menu', items);
  };

  // Spot boxes where the spot is coming out of Off (first cue, or the cue before left it off): picking an
  // action there fills in Cue Defaults for intensity, iris and color too, not just time
  const fromOffCells = new Set();
  const aboveCells = new Map();   // each spot box → that spot's box in the cue above (what Tracked carries on from)
  {
    const last = {}, prev = {};
    const scBy = new Map((data?.spotCues || []).map(sc => [`${sc.cue_id}:${sc.spot_id}`, sc]));
    for (const cue of [...(data?.cues || [])].sort((a, b) => a.sort_order - b.sort_order)) {
      for (const spot of data?.spots || []) {
        const sc = scBy.get(`${cue.id}:${spot.id}`);
        if (!(spot.id in last) || ENDS_OFF.includes(last[spot.id]) || sc?.action === 'Off') fromOffCells.add(`${cue.id}:${spot.id}`);
        if (prev[spot.id]) aboveCells.set(`${cue.id}:${spot.id}`, prev[spot.id]);
        prev[spot.id] = sc;
        if (sc && sc.action && sc.action !== 'Tracked') last[spot.id] = sc.action;
        else if (!(spot.id in last)) last[spot.id] = 'Off';
      }
    }
  }
  const openNoteCount = (data?.spotCues || []).filter(sc => sc.spot_note && sc.spot_note.trim() && !sc.note_checked).length
    + (data?.cues || []).filter(c => c.all_spots_note && c.all_spots_note.trim() && !c.all_spots_note_checked).length;
  // A note typed in the sidebar: found by its LQ, saved as that cue's spot note (added under any note already there)
  const addRunNote = (lqText, spotId, text) => {
    if (!lqText) return 'Type the LQ first.';
    const cue = [...(data?.cues || [])].sort((a, b) => a.sort_order - b.sort_order)
      .find(c => String(c.lq_number || '').trim().toLowerCase() === lqText.toLowerCase());
    if (!cue) return `There's no LQ ${lqText} in this show.`;
    if (spotId === 'all') {   // a note for every spot, kept on the cue
      const existing = (cue.all_spots_note || '').trim();
      updateCue(cue.id, 'all_spots_note', existing ? `${existing}\n${text}` : text);
      return null;
    }
    const spot = (data?.spots || []).find(sp => sp.id === spotId);
    if (!spot) return 'Pick a spot.';
    const row = ensureSpotCue(spot, cue, (data?.spotCues || []).find(x => x.spot_id === spot.id && x.cue_id === cue.id));
    const existing = (row.spot_note || '').trim();
    setSpotCueFields(row, { spot_note: existing ? `${existing}\n${text}` : text });
    return null;
  };
  // ✓ in the sidebar: the note is given, so it leaves the cue (no more yellow dot) and goes to Spot Notes → Given
  const giveNote = (n) => {
    const r = ipcRenderer.sendSync('db-give-note', n.allSpots ? { cueId: n.cue_id } : { spotCueId: n.id });
    if (r?.id) pushUndo({ type: 'note-given', givenId: r.id });
    setData(d => ({ ...d,
      cues: n.allSpots ? (d?.cues || []).map(c => c.id === n.cue_id ? { ...c, all_spots_note: '' } : c) : d.cues,
      spotCues: n.allSpots ? d.spotCues : (d?.spotCues || []).map(sc => sc.id === n.id ? { ...sc, spot_note: '' } : sc) }));
  };
  // Scrolls the cue list to a cue (in the middle) and outlines that spot's box for a moment (every box for 'all')
  const showCue = (cueId, spotId) => {
    const el = scrollRef.current;
    const row = el && el.querySelector(`tr[data-cue-id="${cueId}"]`);
    if (!row) return;
    el.scrollTo({ top: el.scrollTop + row.getBoundingClientRect().top - el.getBoundingClientRect().top - (el.clientHeight - row.offsetHeight) / 2, behavior: 'smooth' });
    setMenuCell({ cueId, spotId });
    setTimeout(() => setMenuCell(m => (m && m.cueId === cueId ? null : m)), 1800);
  };

  // Copy / Paste Whole Cue items (in both right-click menus)
  const wholeCueItems = (cue) => {
    const clip = wholeCueClipboard && wholeCueClipboard.showId === show.id ? wholeCueClipboard : null;
    return [
      { type: 'separator' },
      { id: 'copy-row', label: 'Copy Whole Cue (All Spots)' },
      { id: 'paste-row', label: clip ? `Paste Whole Cue (${clip.cueName})` : 'Paste Whole Cue', enabled: !!clip && clip.cueId !== cue.id },
    ];
  };
  // Right-click an LQ number: whole-cue copy and paste, insert, delete
  const openCueMenu = (cue) => {
    const sep = { type: 'separator' };
    menuTargetRef.current = { spotCue: null, spot: null, cue };
    ipcRenderer.send('show-context-menu', [
      { label: cueName(cue), enabled: false },
      ...wholeCueItems(cue),
      sep,
      { id: 'insert-above', label: 'Insert Cue Above' },
      { id: 'insert-below', label: 'Insert Cue Below' },
      { id: 'delete', label: `Delete ${cueName(cue)}…` },
    ]);
  };
  const copyWholeCue = (cue) => {
    const bySpot = {};
    for (const sp of data?.spots || []) {
      const row = (data?.spotCues || []).find(x => x.spot_id === sp.id && x.cue_id === cue.id);
      bySpot[sp.id] = Object.fromEntries(COPY_FIELDS.map(f => [f, row?.[f] ?? null]));
    }
    wholeCueClipboard = { showId: show.id, cueId: cue.id, cueName: cueName(cue), bySpot };
  };
  // Every spot takes what it did in the copied cue; one ⌘Z puts the whole cue back
  const pasteWholeCue = (cue) => {
    if (!wholeCueClipboard || wholeCueClipboard.showId !== show.id) return;
    const entries = [];
    for (const sp of data?.spots || []) {
      const values = wholeCueClipboard.bySpot[sp.id];
      if (!values) continue;
      const row = ensureSpotCue(sp, cue, (data?.spotCues || []).find(x => x.spot_id === sp.id && x.cue_id === cue.id));
      entries.push(...fieldEntries(row, values));
    }
    if (!entries.length) return;
    entries.forEach(e => updateSpotCue(e.spotCueId, e.field, e.newValue, true));
    pushUndo({ type: 'batch', entries });
  };

  // Runs the chosen menu item (refreshed every render so it sees the latest cues)
  menuActionRef.current = (id) => {
    const target = menuTargetRef.current;
    if (!target) return;
    const { spot, cue } = target;
    if (id === 'copy-row') return copyWholeCue(cue);
    if (id === 'paste-row') return pasteWholeCue(cue);
    const sc = spot ? ((data?.spotCues || []).find(x => x.spot_id === spot.id && x.cue_id === cue.id) || target.spotCue) : null;
    if (id === 'copy') {
      cueClipboard = { showId: show.id, spotNumber: spot.spot_number, cueName: cueName(cue),
        values: Object.fromEntries(COPY_FIELDS.map(f => [f, sc?.[f] ?? null])) };
    } else if (id === 'paste' || id === 'paste-no-char') {
      if (!cueClipboard || cueClipboard.showId !== show.id) return;
      const values = { ...cueClipboard.values };
      if (id === 'paste-no-char') { delete values.character_id; delete values.custom_character; delete values.extra_characters; }
      // Keep only frames this spot has (spots can have fewer frames)
      const frames = new Set((colorSlotsBySpot[spot.id] || []).map(s => 'F' + s.slot_number));
      values.active_frames = (values.active_frames || '').split(',').filter(f => frames.has(f)).join(',');
      setSpotCueFields(ensureSpotCue(spot, cue, sc), values);
    } else if (id.startsWith('hl:')) {
      const [, field, color] = id.split(':');
      setSpotCueFields(ensureSpotCue(spot, cue, sc), { [field]: sc?.[field] === color ? null : color });
    } else if (id === 'ignore') {
      setSpotCueFields(ensureSpotCue(spot, cue, sc), { ignored: sc?.ignored ? 0 : 1 });
    } else if (id === 'note') {
      const row = ensureSpotCue(spot, cue, sc);
      setCuePopup({ cue, spot, spotCue: row });
      setPopupNote(row.spot_note || '');
      setTimeout(() => document.getElementById('popup-note-textarea')?.focus(), 50);
    } else if (id === 'insert-above') {
      const r = ipcRenderer.sendSync('db-create-cue', { showId: show.id, sceneId: cue.scene_id, beforeCueId: cue.id });
      if (r?.success) pushUndo({ type: 'cue-created', cueId: r.id });
      load();
    } else if (id === 'insert-below') {
      insertCueAfter(cue.id, cue.scene_id);
    } else if (id === 'delete') {
      if (window.confirm(`Delete ${cueName(cue)}? It's removed for every spot. ⌘Z brings it back.`)) deleteCue(cue.id);
    } else if (id === 'clear') {
      clearSpotCue(sc);
    }
  };

  const deleteCue = (cueId) => {
    const r = ipcRenderer.sendSync('db-delete-cue', cueId);
    if (r?.snapshot) pushUndo({ type: 'cue-deleted', snapshot: r.snapshot });
    load();
  };

  const addScene = () => {
    if (!newSceneLabel.trim()) return;
    const result = ipcRenderer.sendSync('db-create-scene', { showId: show.id, label: newSceneLabel, song: newSceneSong });
    if (result.success) { pushUndo({ type: 'scene-created', sceneId: result.id }); setSelectedSceneId(result.id); setNewSceneLabel(''); setNewSceneSong(''); setShowSceneModal(false); load(); }
  };

  // A new custom name was typed in a cue: ask (the Mac's own question box) whether to add it to the show's
  // characters (starts unticked for printing on the Characters sheet) and link the cue to it. "Remember my
  // choice for this show" saves the answer on the show and stops asking; View → Ask About New Characters
  // Again clears it.
  // link(id): where the new character goes (a second or third character box); the first box by default
  const addCustomCharacterToShow = (spotCueId, name, link) => {
    const choice = ipcRenderer.sendSync('db-get-show', show.id)?.new_character_choice;
    if (choice === 'custom') return;
    if (choice === 'add') { linkNewCharacter(spotCueId, name, link); return; }
    const answer = ipcRenderer.sendSync('dialog-add-character', name) || {};
    if (answer.remember) ipcRenderer.sendSync('db-update-show', { showId: show.id, new_character_choice: answer.add ? 'add' : 'custom' });
    if (answer.add) linkNewCharacter(spotCueId, name, link);
  };
  const linkNewCharacter = (spotCueId, name, link) => {
    const result = ipcRenderer.sendSync('db-create-character', { showId: show.id, name, actorName: '', printOnSheet: 0 });
    if (!result?.success) return;
    pushUndo({ type: 'character-created', characterId: result.id });
    const chars = ipcRenderer.sendSync('db-get-characters', show.id);
    setCharacters(Array.isArray(chars) ? chars : []);
    if (link) { link(result.id); return; }
    updateSpotCue(spotCueId, 'character_id', result.id);
    updateSpotCue(spotCueId, 'custom_character', null);
  };

  const addCharacter = () => {
    if (!newCharName.trim()) return;
    const r = ipcRenderer.sendSync('db-create-character', { showId: show.id, name: newCharName, actorName: newCharActor });
    if (r?.success) pushUndo({ type: 'character-created', characterId: r.id });
    setNewCharName(''); setNewCharActor(''); setShowCharModal(false);
    const chars = ipcRenderer.sendSync('db-get-characters', show.id);
    setCharacters(Array.isArray(chars) ? chars : []);
  };

// Renumber T· 1, 2, 3… top to bottom, exactly as the list shows (cues in a deleted scene, which the
  // list can't show, go last). Only the T· numbers change; cue order, scenes and LQs stay as they are.
  const renumberTracks = () => {
    const shown = groupedCues().flatMap(g => g.cues);
    const shownIds = new Set(shown.map(c => c.id));
    const rest = [...(data?.cues || [])].filter(c => !shownIds.has(c.id)).sort((a, b) => a.sort_order - b.sort_order);
    const ordered = [...shown, ...rest];
    if (!ordered.length) return;
    if (ordered.every((c, i) => c.track_number === i + 1)) { alert('T· numbers are already in order (1 to ' + ordered.length + ').'); return; }
    if (!window.confirm(`Renumber spot cues T·1 to T·${ordered.length}, top to bottom?\n\nT· numbers are the spot cue numbers operators use to keep their place, printed beside each LQ. Renumbering cleans them up after cues were inserted.\n\nThe order of your cues, their scenes and LQ numbers won't change. If you've already handed out sheets, reprint them so everyone's T· numbers match.\n\nChanged your mind? Press ⌘Z to put the old numbers back.`)) return;
    const before = (data?.cues || []).map(c => ({ id: c.id, track_number: c.track_number }));
    const result = ipcRenderer.sendSync('db-renumber-tracks', { showId: show.id, cueIds: ordered.map(c => c.id) });
    if (!result?.success) { alert('Could not renumber: ' + (result?.error || 'unknown error')); return; }
    // One ⌘Z puts every cue's old T· number back
    pushUndo({ type: 'tracks', before });
    load();
  };

  // Renaming a scene from its header in the cue list (saved to the scene, so it changes everywhere)
  const [editingScene, setEditingScene] = useState(null);   // scene id
  useEscape(() => setEditingScene(null), !!editingScene);
  const saveSceneName = (sceneId, label, song) => {
    setEditingScene(null);
    const scene = (data?.scenes || []).find(sc => sc.id === sceneId);
    if (!scene || !label.trim() || (label.trim() === scene.label && song.trim() === (scene.song || ''))) return;
    ipcRenderer.sendSync('db-update-scene', { sceneId: scene.id, label: label.trim(), song: song.trim(), actBreak: !!scene.act_break });
    pushUndo({ type: 'scene', sceneId: scene.id, label: scene.label, song: scene.song || '', actBreak: !!scene.act_break });
    setData(d => ({ ...d, scenes: (d?.scenes || []).map(sc => sc.id === scene.id ? { ...sc, label: label.trim(), song: song.trim() } : sc) }));
  };

const groupedCues = () => {
    const cues = data?.cues || [];
    const scenes = data?.scenes || [];
    const sorted = [...cues].sort((a, b) => a.sort_order - b.sort_order);
    const groups = [];

    const sceneOrder = scenes.map(s => s.id);
    const usedSceneIds = new Set();

    for (const sceneId of sceneOrder) {
      const sceneCues = sorted.filter(c => c.scene_id === sceneId);
      const scene = scenes.find(s => s.id === sceneId);
      // A scene with no cues is left out, but an act break always shows: it's a header ("Act One") that
      // usually has no cues of its own, and the list should open on it
      if (sceneCues.length === 0 && !scene?.act_break) continue;
      groups.push({
        sceneId,
        sceneLabel: scene ? scene.label : 'Unknown',
        sceneSong: scene ? scene.song : '',
        actBreak: scene ? !!scene.act_break : false,
        cues: sceneCues,
      });
      usedSceneIds.add(sceneId);
    }

    const unassigned = sorted.filter(c => !c.scene_id);
    if (unassigned.length > 0) {
      groups.push({ sceneId: null, sceneLabel: 'Unassigned', sceneSong: '', cues: unassigned });
    }

    return groups;
  };

  // The bottom cue of the list (no insert button after it)
  const lastCueId = (() => { const all = groupedCues().flatMap(g => g.cues); return all.length ? all[all.length - 1].id : null; })();

      return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1E1E1E' }}>
    <AppHeader title="Cue List" onBack={() => navigate('show', show)} backLabel={show.title}>
        <div style={{ flex: 1 }} />
        <select value={jumpSceneId} onChange={e => {
          const sceneId = e.target.value ? parseInt(e.target.value) : null;
          setSelectedSceneId(sceneId);
          setJumpSceneId(e.target.value);
          if (sceneId && scrollRef.current) {
            const sceneRow = document.querySelector(`[data-scene-id="${sceneId}"]`);
            if (sceneRow && scrollRef.current) {
              const containerTop = scrollRef.current.getBoundingClientRect().top;
              const target = sceneRow.nextElementSibling || sceneRow;
              const headerHeight = sceneRow.getBoundingClientRect().height;
              const offset = target.getBoundingClientRect().top - containerTop;
              scrollRef.current.scrollBy({ top: offset - theadHeight - headerHeight, behavior: 'smooth' });
            }
          }
        }}
          style={{ height: '28px', flex: '0 4 240px', minWidth: '110px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', padding: '0 8px', fontSize: '13px', outline: 'none' }}>
          <option value="">Jump to scene…</option>
          {(data?.scenes || []).map(s => <option key={s.id} value={s.id}>{s.label}{s.song ? ' · ' + s.song : ''}</option>)}
        </select>
        <RenumberButton onClick={renumberTracks} />
        {/* Add to the show: a scene, a character. Icons in one small group */}
        <span data-tour="add-scene" style={{ display: 'inline-flex', gap: '2px', padding: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', flexShrink: 0 }}>
          <HeaderIconButton title="Add Scene" onClick={() => setShowSceneModal(true)}>
            {/* a scene: a stack of rows */}
            <path d="M3 5.5h9M3 9.5h9M3 13.5h6" /><path d="M15.5 11v6M12.5 14h6" />
          </HeaderIconButton>
          <HeaderIconButton title="Add Character" onClick={() => setShowCharModal(true)}>
            {/* a character: a person */}
            <circle cx="8" cy="6" r="2.6" /><path d="M3 16c0-2.8 2.2-4.6 5-4.6s5 1.8 5 4.6" /><path d="M15.5 8v6M12.5 11h6" />
          </HeaderIconButton>
        </span>
        <IpadDots showId={show.id} />
        <NotesButton count={openNoteCount} />
      </AppHeader>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
      <div ref={scrollRef} onScroll={() => {
        updateContinuedScene();
        const el = scrollRef.current;
        if (el && scrollRestored.current) {
          // The first cue row below the pinned spot names, and how far down it sits
          const topEdge = el.getBoundingClientRect().top + theadHeight;
          const row = [...el.querySelectorAll('tr[data-cue-id]')].find(r => r.getBoundingClientRect().bottom > topEdge);
          sessionStorage.setItem(`cueScroll_${show.id}`, JSON.stringify({ top: el.scrollTop, left: el.scrollLeft,
            cueId: row ? row.dataset.cueId : null, offset: row ? row.getBoundingClientRect().top - el.getBoundingClientRect().top : 0 }));
        }
      }} style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'auto' }}>
        {!loaded ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%', color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
            Loading cues…
          </div>
        ) : (data?.cues || []).length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: '12px', color: 'rgba(255,255,255,0.28)' }}>
            <div style={{ fontSize: '36px' }}>✦</div>
            <div style={{ fontSize: '15px' }}>No cues yet</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)' }}>Add a scene first, then create your first cue</div>
            <button data-tour="first-cue" onClick={addCue} style={{ marginTop: '8px', padding: '8px 20px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>+ Add first cue</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative' }}>
            <thead ref={theadRef} style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              {/* The bar's bottom line is drawn inside each cell (boxShadow): a table border wouldn't move with the pinned bar */}
              <tr style={{ background: '#262626' }}>
                <th style={{ boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.1)', padding: '8px', textAlign: 'left', fontSize: '10px', color: 'rgba(255,255,255,0.28)', fontWeight: '600', width: '90px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>CUE</th>
                {(data?.spots || []).map(spot => (
                  <th key={spot.id} style={{ boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.1)', padding: '8px 18px', textAlign: 'left', verticalAlign: 'top', borderRight: '1px solid rgba(255,255,255,0.12)', minWidth: '260px', width: `${100 / (data?.spots || []).length}%` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', color: '#409CFF', fontWeight: '700' }}>SPOT {spot.spot_number}</div>
                        {spot.operator_name && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.62)', fontWeight: '500', marginTop: '1px' }}>{spot.operator_name}</div>}
                      </div>
                      <ColorLoadButton slots={colorSlotsBySpot[spot.id] || []} open={openColorLoads.includes(spot.id)}
                        onClick={() => toggleColorLoad(spot.id)} />
                    </div>
                    {openColorLoads.includes(spot.id) && (
                      <HeaderColorLoad slots={colorSlotsBySpot[spot.id] || []} perm={permSlotBySpot[spot.id]} />
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedCues().map((group) => (
                <React.Fragment key={group.sceneId || 'unassigned'}>
                  <tr data-scene-id={group.sceneId} data-scene-key={group.sceneId || 'unassigned'}>
                    <td colSpan={(data?.spots || []).length + 1} style={{ position: 'sticky', top: Math.floor(theadHeight) - 1, zIndex: 6, padding: '7px 14px', textAlign: 'center', background: group.actBreak ? '#3E301B' : '#203A2A',
                      // Lines drawn inside the cell: a table's own borders don't move with a pinned (sticky) cell, which left
                      // a see-through sliver above it. Tucked 1px under the spot-name bar so no cue shows between them.
                      boxShadow: `inset 0 1px 0 ${group.actBreak ? 'rgba(255,159,10,0.35)' : 'rgba(48,209,88,0.32)'}, inset 0 -1px 0 ${group.actBreak ? 'rgba(255,159,10,0.35)' : 'rgba(48,209,88,0.32)'}` }}>
                      {editingScene && editingScene === group.sceneId ? (
                        <SceneNameEditor label={group.sceneLabel || ''} song={group.sceneSong || ''} actBreak={group.actBreak}
                          onSave={(label, song) => saveSceneName(group.sceneId, label, song)} />
                      ) : (
                        <span title={group.sceneId ? 'Double-click to rename' : undefined}
                          onDoubleClick={() => group.sceneId && setEditingScene(group.sceneId)}
                          style={{ cursor: group.sceneId ? 'text' : 'default' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: group.actBreak ? '#FF9F0A' : '#30D158', letterSpacing: '0.01em' }}>
                            {continuedScene === String(group.sceneId || 'unassigned') ? `[${group.sceneLabel}]` : group.sceneLabel}
                          </span>
                          {group.sceneSong && <span style={{ fontSize: '12px', color: group.actBreak ? 'rgba(255,159,10,0.75)' : 'rgba(48,209,88,0.72)', marginLeft: '8px' }}>{group.sceneSong}</span>}
                        </span>
                      )}
                    </td>
                  </tr>
                  <InsertButton onInsert={() => insertCueAtSceneTop(group)} />
                  {group.cues.map((cue) => (
                    <CueRow key={cue.id} cue={cue} fieldsShown={listFields}
                      isLastCue={cue.id === lastCueId}
                      spots={data?.spots || []}
                      spotCues={data?.spotCues || []} characters={characters}
                      colorSlotsBySpot={colorSlotsBySpot} scenes={data?.scenes || []} colorChangesBySpot={colorChangesBySpot} irisChangesBySpot={irisChangesBySpot}
                      onUpdateCue={updateCue} onUpdateSpotCue={updateSpotCue} onNewCustomCharacter={addCustomCharacterToShow}
                      onDelete={deleteCue} onInsertAfter={insertCueAfter}
                      dragSource={dragSource} dragTarget={dragTarget}
                      setDragSource={setDragSource} setDragTarget={setDragTarget} onDragFinished={dragFinished} onCellMenu={openCellMenu} onCueMenu={openCueMenu} menuCell={menuCell}
                      setShowDragModal={setShowDragModal}
                      irisSizes={irisSizes}
                      customActions={customActions}
                      actionNames={actionNames}
                      defaults={showCueDefaults} fromOffCells={fromOffCells} aboveCells={aboveCells}
                      onCueDoubleClick={(cue, spot, spotCue) => {
                      setCuePopup({ cue, spot, spotCue });
                       setPopupNote(spotCue?.spot_note || '');
               }}/>
                  ))}
                </React.Fragment>
              ))}
              <tr>
                <td colSpan={(data?.spots || []).length + 1} style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div
                    onClick={() => {
                      const cues = data?.cues || [];
                      if (cues.length > 0) {
                        const lastCue = [...cues].sort((a, b) => a.sort_order - b.sort_order)[cues.length - 1];
                        insertCueAfter(lastCue.id, lastCue.scene_id);
                      } else {
                        addCue();
                      }
                    }}
                    data-tour="add-cue-end"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '6px', borderRadius: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', fontSize: '11px', fontWeight: '600' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(10,132,255,0.16)'; e.currentTarget.style.color = '#409CFF'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}>
                    + Add cue at end
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={(data?.spots || []).length + 1} style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.28)', fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  — End of Show —
                </td>
              </tr>
            </tbody>
          </table>
        )}
        {cuePopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => {
            const ta = document.getElementById('popup-note-textarea');
            if (ta && cuePopup.spotCue?.id) updateSpotCue(cuePopup.spotCue.id, 'spot_note', ta.value);
            setCuePopup(null);
          }}>
          <div style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '28px', width: '420px' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>
                  LQ {cuePopup.cue.lq_number || '—'} · Spot {cuePopup.spot.spot_number}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                  {cuePopup.spot.operator_name || 'No operator'}
                </div>
              </div>
              <button onClick={() => {
                const ta = document.getElementById('popup-note-textarea');
                if (ta && cuePopup.spotCue?.id) updateSpotCue(cuePopup.spotCue.id, 'spot_note', ta.value);
                setCuePopup(null);
              }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => {
                  const newVal = cuePopup.spotCue?.ignored ? 0 : 1;
                  if (cuePopup.spotCue) {
                    updateSpotCue(cuePopup.spotCue.id, 'ignored', newVal);
                  } else {
                    upsertSpotCue(cuePopup.spot.id, cuePopup.cue.id, 'ignored', newVal);
                  }
                  setCuePopup(p => ({ ...p, spotCue: { ...p.spotCue, ignored: newVal } }));
                }}
                style={{ flex: 1, padding: '12px', background: cuePopup.spotCue?.ignored ? 'rgba(255,69,58,0.18)' : 'rgba(255,255,255,0.06)', border: `1px solid ${cuePopup.spotCue?.ignored ? '#FF453A' : 'rgba(255,255,255,0.14)'}`, borderRadius: '8px', color: cuePopup.spotCue?.ignored ? '#FF453A' : 'rgba(255,255,255,0.62)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
                  <div>{cuePopup.spotCue?.ignored ? 'Ignored' : 'Ignore cue'}</div>
                  <div style={{ fontSize: '11px', fontWeight: '400', marginTop: '2px', opacity: 0.7 }}>Cross out this cue without deleting</div>
                </button>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Highlight</div>
                {[{ field: 'highlight', label: 'Whole cue' }, { field: 'when_highlight', label: 'When line' }, { field: 'notes_highlight', label: 'Notes line' }].map(({ field, label }) => (
                  <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '80px', fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>{label}</div>
                    <div style={{ flex: 1, display: 'flex', gap: '2px', padding: '2px', height: '28px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.07)', borderRadius: '6px' }}>
                      {[{ value: null, text: 'None', color: '#FFFFFF', bg: 'rgba(255,255,255,0.14)' }, { value: 'yellow', text: 'Yellow', color: '#FFD60A', bg: 'rgba(255,214,10,0.30)' }, { value: 'red', text: 'Red', color: '#FF453A', bg: 'rgba(255,69,58,0.30)' }].map(opt => {
                        const selected = (cuePopup.spotCue?.[field] || null) === opt.value;
                        return (
                          <div key={opt.text} onClick={() => setPopupSpotCueField(field, opt.value)}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', background: selected ? opt.bg : 'transparent', color: selected ? opt.color : 'rgba(255,255,255,0.55)' }}>
                            {opt.text}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Spot note</div>
              <textarea
                key={cuePopup.spotCue?.id}
                defaultValue={cuePopup.spotCue?.spot_note || ''}
                id="popup-note-textarea"
                onBlur={e => {
                  if (cuePopup.spotCue?.id) {
                    updateSpotCue(cuePopup.spotCue.id, 'spot_note', e.target.value);
                  }
                }}
                placeholder="Note for the operator"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFFFFF', padding: '10px 12px', fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
              <button onClick={() => {
                const ta = document.getElementById('popup-note-textarea');
                if (ta && cuePopup.spotCue?.id) updateSpotCue(cuePopup.spotCue.id, 'spot_note', ta.value);
                setCuePopup(null);
              }} style={{ marginTop: '10px', width: '100%', padding: '10px', background: '#0A84FF', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
        {showDragModal && dragSource && dragTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '28px', width: '400px' }}>
            {dragModalStep === 'action' ? (
              <>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>Move cue data</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.52)', marginBottom: '24px' }}>
                  What do you want to do with <span style={{ color: '#409CFF' }}>Spot {dragSource.spot.spot_number} / {dragSource.cue.lq_number || 'T·' + dragSource.cue.track_number}</span>?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={async () => {
                    const srcData = { ...dragSource.spotCue };
                    const tgtData = dragTarget.spotCue ? { ...dragTarget.spotCue } : {};
                    const fields = ['action','character_id','custom_character','extra_characters','frame_size','intensity','fade_time','active_frames','description','with_lq','notes','no_color'];

                    const swapUndoEntries = [];
                    if (dragSource.spotCue) {
                      fields.forEach(f => swapUndoEntries.push({ type: 'spot-cue', spotCueId: dragSource.spotCue.id, field: f, oldValue: srcData[f] || '', newValue: tgtData[f] || '' }));
                    }
                    if (dragTarget.spotCue) {
                      fields.forEach(f => swapUndoEntries.push({ type: 'spot-cue', spotCueId: dragTarget.spotCue.id, field: f, oldValue: tgtData[f] || '', newValue: srcData[f] || '' }));
                    }
                    pushUndo({ type: 'batch', entries: swapUndoEntries });

                    if (dragSource.spotCue) {
                      fields.forEach(f => updateSpotCue(dragSource.spotCue.id, f, tgtData[f] !== undefined ? tgtData[f] : '', true));
                    } else {
                      fields.forEach(f => upsertSpotCue(dragSource.spot.id, dragSource.cue.id, f, srcData[f] || ''));
                    }
                    if (dragTarget.spotCue) {
                      fields.forEach(f => updateSpotCue(dragTarget.spotCue.id, f, srcData[f] !== undefined ? srcData[f] : '', true));
                    } else {
                      fields.forEach(f => upsertSpotCue(dragTarget.spot.id, dragTarget.cue.id, f, srcData[f] || ''));
                    }
                    load();
                    setShowDragModal(false);
                    setDragSource(null);
                    setDragTarget(null);
                    setDragModalStep('action');
                  }} style={{ padding: '12px', background: '#0A84FF', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
                    <div>Swap</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Exchange data between both spots</div>
                  </button>
                  <button onClick={() => setDragModalStep('character')}
                    style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
                    <div>Copy</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Copy source data into target spot</div>
                  </button>
                  <button onClick={() => { setShowDragModal(false); setDragSource(null); setDragTarget(null); setDragModalStep('action'); }}
                    style={{ padding: '8px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '13px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>Copy character?</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.52)', marginBottom: '24px' }}>
                  Should the character name also be copied, or keep the existing character in the target spot?
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => {
                    const srcData = { ...dragSource.spotCue };
                    const fields = ['action','character_id','custom_character','extra_characters','frame_size','intensity','fade_time','active_frames','description','with_lq','notes'];
                    if (dragTarget.spotCue) {
                      fields.forEach(f => updateSpotCue(dragTarget.spotCue.id, f, srcData[f] || ''));
                    } else {
                      fields.forEach(f => upsertSpotCue(dragTarget.spot.id, dragTarget.cue.id, f, srcData[f] || ''));
                    }
                    setShowDragModal(false);
                    setDragSource(null);
                    setDragTarget(null);
                    setDragModalStep('action');
                  }} style={{ padding: '12px', background: '#0A84FF', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
                    <div>Copy everything including character</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Target spot will have the same character</div>
                  </button>
                  <button onClick={() => {
                    const srcData = { ...dragSource.spotCue };
                    const fields = ['action','frame_size','intensity','fade_time','active_frames','description','with_lq','notes'];
                    if (dragTarget.spotCue) {
                      fields.forEach(f => updateSpotCue(dragTarget.spotCue.id, f, srcData[f] || ''));
                    } else {
                      fields.forEach(f => upsertSpotCue(dragTarget.spot.id, dragTarget.cue.id, f, srcData[f] || ''));
                    }
                    setShowDragModal(false);
                    setDragSource(null);
                    setDragTarget(null);
                    setDragModalStep('action');
                  }} style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '8px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
                    <div>Copy everything except character</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', opacity: 0.7, marginTop: '2px' }}>Keep the existing character in the target spot</div>
                  </button>
                  <button onClick={() => setDragModalStep('action')}
                    style={{ padding: '8px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '13px', cursor: 'pointer' }}>
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </div>
      <SlidePanel width={300}>
        <NotesSidebar spots={data?.spots || []} cues={[...(data?.cues || [])].sort((a, b) => a.sort_order - b.sort_order)} spotCues={data?.spotCues || []}
          onAddNote={addRunNote} onCheck={giveNote} onShowCue={showCue} onClose={() => notesOpen.set(false)} />
      </SlidePanel>
      </div>

      {showSceneModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px', padding: '24px', width: '360px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#FFFFFF' }}>Add Scene</div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.62)', display: 'block', marginBottom: '4px' }}>Scene label *</label>
              <input autoFocus value={newSceneLabel} onChange={e => setNewSceneLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addScene()}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Scene name, e.g. Act 1, Scene 1" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.62)', display: 'block', marginBottom: '4px' }}>Song (optional)</label>
              <input value={newSceneSong} onChange={e => setNewSceneSong(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addScene()}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Song or title (optional)" />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSceneModal(false)} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addScene} style={{ padding: '7px 14px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>Add Scene</button>
            </div>
          </div>
        </div>
      )}

      {showCharModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px', padding: '24px', width: '360px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#FFFFFF' }}>Add Character</div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.62)', display: 'block', marginBottom: '4px' }}>Character name *</label>
              <input autoFocus value={newCharName} onChange={e => setNewCharName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCharacter()}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Character name" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.62)', display: 'block', marginBottom: '4px' }}>Performer (optional)</label>
              <input value={newCharActor} onChange={e => setNewCharActor(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCharacter()}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFFFFF', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Performer's name" />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCharModal(false)} style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addCharacter} style={{ padding: '7px 14px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer' }}>Add Character</button>
            </div>
          </div>
        </div>
      )}
      <Tips steps={TIPS.cueList} watch={(data?.cues || []).length} />
    </div>
  );
}

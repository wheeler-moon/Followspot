import React, { useState, useEffect, useRef } from 'react';
import Tips from '../components/Tips';
import { TIPS } from '../tips';
import AppHeader from '../components/AppHeader';
import useEscape from '../useEscape';
import { CUE_FIELDS, cueFieldSettings } from '../cueFields';
const { ipcRenderer } = window.require('electron');

const sectionLabel = { fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' };
const fieldStyle = { width: '100%', boxSizing: 'border-box', height: '28px', background: '#1E1E1E', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '6px', color: '#FFFFFF', padding: '0 10px', fontSize: '13px', outline: 'none' };
const smallField = { ...fieldStyle, width: '64px', height: '24px', padding: '0 8px', textAlign: 'center' };
const borderedButton = { height: '28px', padding: '0 16px', background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: '14px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer' };
const primaryButton = { ...borderedButton, background: '#0A84FF' };

// Everything you can set for a sheet. Page Setup edits a copy and Save puts it back.
const DEFAULT_OPTIONS = {
  hideOff: false, keepOffNotes: true, hideTracked: false, showTracks: true, coverPage: false,
  usedOnly: false, showCostumeNotes: true, notesSpotId: null,
  pages: {},   // paper, orientation and range for each kind of sheet (all spot sheets share one)
};
// orientation null = the sheet's usual one
const DEFAULT_PAGE = { paper: 'letter', orientation: null, rangeMode: 'all', pageFrom: '', pageTo: '', rangeStart: '', rangeEnd: '' };
const pageOf = (o, kind) => ({ ...DEFAULT_PAGE, ...((o.pages || {})[kind] || {}) });

// Spot sheets only print portrait and the caller sheet only landscape (main.js buildSheet)
const fixedOrientation = (kind) => kind === 'spot' ? 'portrait' : kind === 'caller' ? 'landscape' : null;
const hasCueRange = (kind) => kind === 'spot' || kind === 'caller';
function orientationFor(kind, o, spotCount) {
  return fixedOrientation(kind) || pageOf(o, kind).orientation || (kind === 'color' && spotCount > 2 ? 'landscape' : 'portrait');
}

function buildRequest(selected, o, label, showId, cueFields) {
  if (!selected) return null;
  const pg = pageOf(o, selected.kind);
  const req = { kind: selected.kind, showId, label, paper: pg.paper };
  if (cueFields) req.cueFields = cueFields;   // Page Setup's unsaved Cue Details
  if (!fixedOrientation(selected.kind) && pg.orientation) req.orientation = pg.orientation;
  if (pg.rangeMode === 'pages') Object.assign(req, { pageFrom: pg.pageFrom || null, pageTo: pg.pageTo || null });
  if (pg.rangeMode === 'cues' && hasCueRange(selected.kind)) {
    Object.assign(req, { rangeStart: pg.rangeStart ? parseInt(pg.rangeStart) : null, rangeEnd: pg.rangeEnd ? parseInt(pg.rangeEnd) : null });
  }
  if (selected.kind === 'spot') Object.assign(req, { spotId: selected.spotId, hideOff: o.hideOff && (o.keepOffNotes ? 'unnoted' : 'all'), hideTracked: o.hideTracked });
  if (selected.kind === 'spot' || selected.kind === 'caller') Object.assign(req, { showTracks: o.showTracks, cover: o.coverPage });
  if (selected.kind === 'actions') req.usedOnly = o.usedOnly;
  if (selected.kind === 'notes') req.spotId = o.notesSpotId;
  if (selected.kind === 'characters') req.showCostumeNotes = o.showCostumeNotes;
  return req;
}

// Re-renders the preview PDF whenever the request changes (short pause so typing stays smooth).
// Only the newest request's result is shown.
function usePreview(req) {
  const [preview, setPreview] = useState(null); // { pdf, pages, totalPages }
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const latest = useRef(0);
  const key = JSON.stringify(req);
  useEffect(() => {
    if (!req) { setPreview(null); setUpdating(false); return; }
    const id = ++latest.current;
    setUpdating(true);
    const t = setTimeout(async () => {
      const result = await ipcRenderer.invoke('print-preview', req);
      if (id !== latest.current) return;
      setUpdating(false);
      if (result?.success) { setPreview(result); setError(''); }
      else setError(result?.error || 'Could not build the preview.');
    }, 250);
    return () => clearTimeout(t);
  }, [key]);
  return { preview, updating, error };
}

function Switch({ on, onChange, label, hint }) {
  return (
    <div onClick={() => onChange(!on)} role="switch" aria-checked={on}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
      <div style={{ width: '44px', height: '20px', borderRadius: '10px', background: on ? '#0A84FF' : 'rgba(255,255,255,0.10)', position: 'relative', flexShrink: 0, transition: 'background 0.15s' }}>
        <div style={{ position: 'absolute', top: '2px', left: on ? '16px' : '2px', width: '26px', height: '16px', borderRadius: '8px', background: 'rgba(255,255,255,0.85)', boxShadow: '0 3px 8px rgba(0,0,0,0.15)', transition: 'left 0.15s' }} />
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#FFFFFF' }}>{label}</div>
        {hint && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{hint}</div>}
      </div>
    </div>
  );
}

// The on/off options for a sheet; the sidebar and Page Setup both show them
function SheetOptions({ kind, o, set, spots }) {
  if (kind === 'spot') return (
    <>
      <Switch on={o.hideOff} onChange={v => set({ hideOff: v })} label="Hide Off cues" hint="Skip cues where this spot is off" />
      {o.hideOff && (
        <div style={{ marginLeft: '54px', marginTop: '-4px' }}>
          <Switch on={o.keepOffNotes} onChange={v => set({ keepOffNotes: v })} label="Keep ones with notes" hint="Off cues with a note still print" />
        </div>
      )}
      <Switch on={o.hideTracked} onChange={v => set({ hideTracked: v })} label="Hide Tracked cues" hint="Only cues where something changes" />
      <Switch on={o.showTracks} onChange={v => set({ showTracks: v })} label="T· numbers" hint="Under each LQ" />
      <Switch on={o.coverPage} onChange={v => set({ coverPage: v })} label="Cover page" hint="Logo, team, colors and an action key" />
    </>
  );
  if (kind === 'caller') return (
    <>
      <Switch on={o.showTracks} onChange={v => set({ showTracks: v })} label="T· numbers" hint="Under each LQ" />
      <Switch on={o.coverPage} onChange={v => set({ coverPage: v })} label="Cover page" hint="Logo, team, colors and an action key" />
    </>
  );
  if (kind === 'actions') return <Switch on={o.usedOnly} onChange={v => set({ usedOnly: v })} label="Only this show's actions" hint="Leave out actions no cue uses" />;
  if (kind === 'characters') return <Switch on={o.showCostumeNotes} onChange={v => set({ showCostumeNotes: v })} label="Costume notes" />;
  if (kind === 'notes') return (
    <select value={o.notesSpotId ?? ''} onChange={e => set({ notesSpotId: e.target.value ? parseInt(e.target.value) : null })} style={{ ...fieldStyle, marginBottom: '12px' }}>
      <option value="">All spots</option>
      {spots.map(s => <option key={s.id} value={s.id}>Spot {s.spot_number}{s.operator_name ? ' (' + s.operator_name + ')' : ''}</option>)}
    </select>
  );
  return null;
}

// The real PDF in the built-in viewer, a whole page at a time
function PdfPreview({ preview, updating }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const u = URL.createObjectURL(new Blob([preview.pdf], { type: 'application/pdf' }));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [preview]);

  return (
    <div data-tour="print-preview" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#161616' }}>
      <div style={{ flexShrink: 0, height: '32px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.10)', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
        <span>{preview.pages === preview.totalPages || !preview.totalPages
          ? `${preview.pages} page${preview.pages === 1 ? '' : 's'}`
          : `${preview.pages} of ${preview.totalPages} pages`}</span>
        {updating && <span style={{ color: '#409CFF' }}>Updating…</span>}
      </div>
      {url && <iframe key={url} src={url + '#toolbar=0&navpanes=0&view=Fit'} title="Print preview" style={{ flex: 1, width: '100%', border: 'none' }} />}
    </div>
  );
}

function PreviewArea({ selected, preview, updating, error, empty }) {
  const center = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#161616', color: 'rgba(255,255,255,0.55)', fontSize: '13px' };
  if (!selected) return <div style={{ ...center, fontSize: '15px' }}>{empty}</div>;
  if (error) return <div style={{ ...center, color: '#FF453A' }}>{error}</div>;
  if (preview) return <PdfPreview preview={preview} updating={updating} />;
  return <div style={center}>Preparing preview…</div>;
}

// Page Setup's preview: every page as a picture on its own grey, like the Mac's print window. Scroll
// through them; each page is drawn when it comes into view, and "Page 3 of 12" follows along.
function PreviewPage({ req, page, aspect, root, onVisible }) {
  const ref = useRef();
  const [image, setImage] = useState(null);
  const [wanted, setWanted] = useState(false);
  const key = JSON.stringify(req);
  useEffect(() => { setImage(null); }, [key]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) setWanted(true);
        if (e.intersectionRatio > 0.5) onVisible(page);
      }
    }, { root: root.current, rootMargin: '400px 0px', threshold: [0, 0.5] });
    io.observe(el);
    return () => io.disconnect();
  }, [page]);
  useEffect(() => {
    if (!wanted || !req) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const result = await ipcRenderer.invoke('print-page-image', { ...req, page });
      if (!cancelled && result?.success) setImage(result.image);
    }, 120);
    return () => { cancelled = true; clearTimeout(t); };
  }, [key, wanted]);
  return (
    <div ref={ref} style={{ width: '100%', maxWidth: aspect >= 1 ? '100%' : `calc((100vh - 200px) * ${aspect})`, aspectRatio: String(aspect), background: '#FFFFFF', boxShadow: '0 4px 18px rgba(0,0,0,0.35)', flexShrink: 0 }}>
      {image && <img src={image} alt={`Page ${page}`} style={{ display: 'block', width: '100%', height: '100%' }} />}
    </div>
  );
}

function PagePreview({ req, preview, updating, error, aspect }) {
  const scroller = useRef();
  const [current, setCurrent] = useState(1);
  const pages = preview?.pages || 0;
  const first = req && req.pageFrom ? Math.max(1, parseInt(req.pageFrom) || 1) : 1;   // pages kept start here
  const key = JSON.stringify(req);
  useEffect(() => { setCurrent(1); if (scroller.current) scroller.current.scrollTop = 0; }, [key]);
  return (
    <div style={{ flex: 1, minWidth: 0, position: 'relative', background: '#38383A' }}>
      <div ref={scroller} style={{ position: 'absolute', inset: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '24px 28px 72px', opacity: updating ? 0.6 : 1, transition: 'opacity 0.15s' }}>
        {error ? <div style={{ margin: 'auto', color: '#FF453A', fontSize: '13px' }}>{error}</div>
          : !pages ? <div style={{ margin: 'auto', color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>Preparing preview…</div>
          : Array.from({ length: pages }, (_, i) => (
            <PreviewPage key={key + ':' + i} req={req} page={first + i} aspect={aspect} root={scroller} onVisible={(p) => setCurrent(p - first + 1)} />
          ))}
      </div>
      {pages > 0 && (
        <div style={{ position: 'absolute', left: '50%', bottom: '16px', transform: 'translateX(-50%)', height: '30px', padding: '0 16px', display: 'flex', alignItems: 'center', borderRadius: '15px', background: 'rgba(30,30,30,0.88)', fontSize: '13px', color: '#FFFFFF', pointerEvents: 'none' }}>
          Page {current} of {pages}
        </div>
      )}
    </div>
  );
}

// Page outline icons for the orientation buttons
const PageIcon = ({ landscape }) => (
  <svg width="18" height="18" viewBox="0 0 18 18"><rect x={landscape ? 1.5 : 4} y={landscape ? 4 : 1.5} width={landscape ? 15 : 10} height={landscape ? 10 : 15} rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg>
);

// Page Setup: paper, orientation, which pages, the sheet's options and which cue details print,
// with a live preview. Save keeps the changes; Cancel (or Escape) throws them away.
function PageSetup({ selected, options, label, show, spots, onSave, onCancel }) {
  const [draft, setDraft] = useState(options);
  const set = (patch) => setDraft(d => ({ ...d, ...patch }));
  // Cue Details: the show's "Show on print" boxes from Show Settings → Cue Settings
  const [cueFields, setCueFields] = useState(() => cueFieldSettings(ipcRenderer.sendSync('db-get-show', show.id)?.cue_fields));
  const [cueFieldsChanged, setCueFieldsChanged] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const toggleField = (key) => { setCueFields(f => ({ ...f, [key]: { ...f[key], print: !f[key].print } })); setCueFieldsChanged(true); };
  const showsCues = selected.kind === 'spot' || selected.kind === 'caller';
  const draftRequest = buildRequest(selected, draft, label, show.id, showsCues && cueFieldsChanged ? cueFields : null);
  const { preview, updating, error } = usePreview(draftRequest);
  const save = () => {
    if (cueFieldsChanged) {
      // Keep the cue list's own boxes as they are now; only the print ones change
      const current = cueFieldSettings(ipcRenderer.sendSync('db-get-show', show.id)?.cue_fields);
      const next = Object.fromEntries(Object.keys(current).map(k => [k, { ...current[k], print: cueFields[k].print }]));
      ipcRenderer.sendSync('db-update-show', { showId: show.id, cue_fields: JSON.stringify(next) });
    }
    onSave(draft);
  };
  useEscape(onCancel);
  const kind = selected.kind;
  const fixed = fixedOrientation(kind);
  const orientation = orientationFor(kind, draft, spots.length);
  const pg = pageOf(draft, kind);
  const setPage = (patch) => setDraft(d => ({ ...d, pages: { ...(d.pages || {}), [kind]: { ...pageOf(d, kind), ...patch } } }));
  const digits = (v) => v.replace(/\D/g, '');

  const row = { display: 'grid', gridTemplateColumns: '96px 1fr', alignItems: 'center', columnGap: '12px', marginBottom: '14px' };
  const rowLabel = { fontSize: '13px', color: 'rgba(255,255,255,0.85)', textAlign: 'right' };
  const segment = (active, disabled) => ({
    width: '44px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '6px',
    background: active ? '#0A84FF' : 'transparent', color: active ? '#FFFFFF' : 'rgba(255,255,255,0.85)',
    opacity: disabled ? 0.35 : 1, cursor: disabled ? 'default' : 'pointer',
  });

  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Enter' && e.target.tagName !== 'SELECT') save(); }}
        style={{ width: 'min(960px, calc(100vw - 48px))', height: 'min(640px, calc(100vh - 48px))', display: 'flex', background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 18px 48px rgba(0,0,0,0.45)' }}>
        {/* Live preview of the draft */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', borderRight: '1px solid rgba(255,255,255,0.10)' }}>
          <PagePreview req={draftRequest} preview={preview} updating={updating} error={error}
            aspect={(() => { const land = orientation === 'landscape', legal = pg.paper === 'legal'; const w = land ? (legal ? 14 : 11) : 8.5, h = land ? 8.5 : (legal ? 14 : 11); return w / h; })()} />
        </div>

        {/* Settings */}
        <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF' }}>Page Setup</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>{selected.title}</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            <div style={row}>
              <span style={rowLabel}>Paper Size</span>
              <select value={pg.paper} onChange={e => setPage({ paper: e.target.value })} style={{ ...fieldStyle, height: '24px' }}>
                <option value="letter">US Letter (8.5 × 11 in)</option>
                <option value="legal">US Legal (8.5 × 14 in)</option>
              </select>
            </div>
            <div style={{ ...row, alignItems: 'start' }}>
              <span style={{ ...rowLabel, lineHeight: '24px' }}>Orientation</span>
              <div>
                <div style={{ display: 'inline-flex', gap: '2px', padding: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                  {['portrait', 'landscape'].map(v => (
                    <button key={v} title={v === 'portrait' ? 'Portrait' : 'Landscape'} disabled={!!fixed}
                      onClick={() => !fixed && setPage({ orientation: v })}
                      style={segment(orientation === v, fixed && fixed !== v)}>
                      <PageIcon landscape={v === 'landscape'} />
                    </button>
                  ))}
                </div>
                {fixed && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '4px' }}>
                  {kind === 'spot' ? 'Spot sheets print portrait.' : 'The caller sheet prints landscape.'}</div>}
              </div>
            </div>
            <div style={{ ...row, alignItems: 'start' }}>
              <span style={{ ...rowLabel, lineHeight: '24px' }}>Print</span>
              <div>
                <select value={pg.rangeMode === 'cues' && !hasCueRange(kind) ? 'all' : pg.rangeMode} onChange={e => setPage({ rangeMode: e.target.value })} style={{ ...fieldStyle, height: '24px' }}>
                  <option value="all">All Pages</option>
                  <option value="pages">Page Range</option>
                  {hasCueRange(kind) && <option value="cues">T· Range</option>}
                </select>
                {pg.rangeMode === 'pages' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>
                    From <input autoFocus value={pg.pageFrom} onChange={e => setPage({ pageFrom: digits(e.target.value) })} placeholder="1" style={smallField} />
                    to <input value={pg.pageTo} onChange={e => setPage({ pageTo: digits(e.target.value) })} placeholder={preview?.totalPages ? String(preview.totalPages) : 'end'} style={smallField} />
                  </div>
                )}
                {pg.rangeMode === 'cues' && hasCueRange(kind) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>
                    T· <input autoFocus value={pg.rangeStart} onChange={e => setPage({ rangeStart: digits(e.target.value) })} placeholder="first" style={smallField} />
                    to <input value={pg.rangeEnd} onChange={e => setPage({ rangeEnd: digits(e.target.value) })} placeholder="last" style={smallField} />
                  </div>
                )}
              </div>
            </div>
            {['spot', 'caller', 'actions', 'characters', 'notes'].includes(kind) && (
              <>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.10)', margin: '4px 0 16px' }} />
                <div style={sectionLabel}>{kind === 'notes' ? 'Which spot' : 'Options'}</div>
                <SheetOptions kind={kind} o={draft} set={set} spots={spots} />
              </>
            )}
            {showsCues && (
              <>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.10)', margin: '4px 0 12px' }} />
                <div onClick={() => setDetailsOpen(o => !o)} role="button" aria-expanded={detailsOpen}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#FFFFFF', marginBottom: '8px' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" style={{ transform: detailsOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>
                    <path d="M3 1.5 L7 5 L3 8.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Cue Details
                </div>
                {detailsOpen && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '6px 12px', marginLeft: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', margin: '4px 0 6px' }}>What prints. Same as Cue Settings.</div>
                    {CUE_FIELDS.map(({ key, label: fieldLabel }) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '26px', fontSize: '13px', color: '#FFFFFF', cursor: 'pointer' }}>
                        <input type="checkbox" checked={cueFields[key].print} onChange={() => toggleField(key)}
                          style={{ width: '15px', height: '15px', accentColor: '#0A84FF', margin: 0, cursor: 'pointer' }} />
                        {fieldLabel}
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.10)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={onCancel} style={borderedButton}>Cancel</button>
            <button onClick={save} style={primaryButton}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// What you picked on the Print screen is remembered for each show on this Mac
const savedKey = (showId) => 'spotplot_print_' + showId;
function loadSaved(showId) {
  try { return JSON.parse(localStorage.getItem(savedKey(showId))) || {}; } catch (e) { return {}; }
}

export default function PrintScreen({ show, navigate }) {
  const saved = useRef(loadSaved(show.id)).current;
  const [spots, setSpots] = useState([]);
  const [selected, setSelected] = useState(null); // item from the "what to print" list
  const [label, setLabel] = useState(saved.label || '');
  const [options, setOptions] = useState({ ...DEFAULT_OPTIONS, ...(saved.options || {}) });
  const setOpt = (patch) => setOptions(o => ({ ...o, ...patch }));
  const [setupOpen, setSetupOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(null); // { ok, text, path }
  const { preview, updating, error: previewError } = usePreview(buildRequest(selected, options, label, show.id));

  useEffect(() => {
    const result = ipcRenderer.sendSync('db-get-spots', show.id);
    setSpots(Array.isArray(result) ? result : []);
  }, []);
  // Reopen on the sheet picked last time (once the spot sheets are known)
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || !saved.selectedKey) return;
    const item = items.find(i => i.key === saved.selectedKey);
    if (item) { setSelected(item); restored.current = true; }
  }, [spots]);
  useEffect(() => {
    try { localStorage.setItem(savedKey(show.id), JSON.stringify({ label, options, selectedKey: selected?.key || saved.selectedKey || null })); } catch (e) {}
  }, [label, options, selected?.key]);

  const items = [
    ...spots.map(s => ({ key: 'spot-' + s.id, kind: 'spot', spotId: s.id, title: 'Spot ' + s.spot_number, sub: s.operator_name || 'Spot sheet' })),
    { key: 'caller', kind: 'caller', title: 'Caller sheet', sub: 'All spots side by side' },
    { key: 'color', kind: 'color', title: 'Color load', sub: 'Gel frames for every spot' },
    { key: 'notes', kind: 'notes', title: 'Spot notes', sub: 'Notes for operators' },
    { key: 'characters', kind: 'characters', title: 'Characters', sub: 'Cast photos, performers & costumes' },
    { key: 'scenes', kind: 'scenes', title: 'Scene list', sub: 'Scenes, songs, cues and pages' },
    { key: 'actions', kind: 'actions', title: 'Action key', sub: 'What every action symbol means' },
  ];

  // File → Print… (⌘P) opens Page Setup (for the caller sheet if nothing is picked yet)
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    const onPrint = () => {
      setSelected(s => s || itemsRef.current.find(i => i.kind === 'caller'));
      setSetupOpen(true);
    };
    ipcRenderer.on('menu-print', onPrint);
    return () => ipcRenderer.removeListener('menu-print', onPrint);
  }, []);

  // Leaving the print screen: let the app shut down the preview's background Chrome
  useEffect(() => () => ipcRenderer.send('print-closed'), []);

  const exportPDF = () => {
    const req = buildRequest(selected, options, label, show.id);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1E1E1E', overflow: 'hidden' }}>
      <AppHeader title="Print" onBack={() => navigate('show', show)} backLabel={show.title}>
        <div style={{ flex: 1 }} />
        {message && (
          <span style={{ fontSize: '13px', color: message.ok ? '#30D158' : '#FF453A', marginRight: '12px' }}>
            {message.text}
            {message.path && (
              <span onClick={() => ipcRenderer.send('reveal-file', message.path)}
                style={{ color: '#409CFF', cursor: 'pointer', marginLeft: '8px' }}>Show in Finder</span>
            )}
          </span>
        )}
        <button data-tour="print-export" onClick={exportPDF} disabled={!selected || exporting}
          style={{ ...primaryButton, cursor: selected && !exporting ? 'pointer' : 'default', opacity: selected && !exporting ? 1 : 0.5 }}>
          {exporting ? 'Saving…' : 'Export PDF…'}
        </button>
      </AppHeader>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* What to print + its options */}
        <div style={{ width: '260px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.10)', overflowY: 'auto', padding: '20px 16px' }}>
          <div style={sectionLabel}>What do you want to print?</div>
          <div data-tour="print-items" style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
            {items.map(item => {
              const isSel = selected?.key === item.key;
              return (
                <div key={item.key} onClick={() => { setSelected(item); setMessage(null); }}
                  style={{ padding: '8px 10px', borderRadius: '6px', cursor: 'pointer', background: isSel ? 'rgba(10,132,255,0.30)' : 'transparent' }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{item.sub}</div>
                </div>
              );
            })}
          </div>

          {selected && (
            <>
              <div style={sectionLabel}>Label</div>
              <input data-tour="print-label" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. 2-24 Dress Run" style={fieldStyle} />
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', margin: '4px 0 20px' }}>Appears in the page header</div>

              {['spot', 'caller', 'actions', 'characters', 'notes'].includes(selected.kind) && (
                <>
                  <div style={sectionLabel}>{selected.kind === 'notes' ? 'Which spot' : 'Options'}</div>
                  <SheetOptions kind={selected.kind} o={options} set={setOpt} spots={spots} />
                </>
              )}

              <button onClick={() => setSetupOpen(true)} style={{ ...borderedButton, width: '100%', marginTop: '8px' }}>Page Setup…</button>
            </>
          )}
        </div>

        {/* Live preview */}
        <PreviewArea selected={selected} preview={preview} updating={updating} error={previewError} empty="Select what you want to print" />
      </div>
      {setupOpen && selected && (
        <PageSetup selected={selected} options={options} label={label} show={show} spots={spots}
          onSave={(draft) => { setOptions(draft); setSetupOpen(false); }} onCancel={() => setSetupOpen(false)} />
      )}
      {!setupOpen && <Tips steps={TIPS.print} watch={selected ? (preview ? 2 : 1) : 0} />}
    </div>
  );
}

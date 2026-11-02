import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');
import SettingsPanel from '../components/SettingsPanel';
import WhatsNew, { justUpdated } from '../components/WhatsNew';
import FileMakerImport from '../components/FileMakerImport';
import AppHeader from '../components/AppHeader';
import Tips from '../components/Tips';
import { TIPS } from '../tips';
import { getMyName, setMyName } from '../license';

const getImageSrc = (path) => {
  if (!path) return null;
  try {
    const fs = window.require('fs');
    const data = fs.readFileSync(path);
    const ext = path.split('.').pop().toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
    return `data:${mime};base64,${data.toString('base64')}`;
  } catch(e) { return null; }
};

// "Modified today at 3:42 PM", "Modified yesterday at 9:10 AM", "Modified 5 days ago", then the date.
// ts is the database's UTC time ("2026-11-02 15:42:10"); shown in this Mac's time zone.
export function modifiedText(ts) {
  if (!ts) return '';
  const d = new Date(String(ts).replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(ts) ? '' : 'Z'));
  if (isNaN(d)) return '';
  const now = new Date();
  const dayStart = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const days = Math.round((dayStart(now) - dayStart(d)) / 86400000);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (days <= 0) return `Modified today at ${time}`;
  if (days === 1) return `Modified yesterday at ${time}`;
  if (days < 7) return `Modified ${days} days ago`;
  return 'Modified ' + d.toLocaleDateString([], { month: 'short', day: 'numeric', ...(d.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) });
}

// Grid / list switch: two icon segments, like Finder's view buttons (remembered on this Mac)
const VIEW_KEY = 'spotplot_home_view';
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
    <rect x="1" y="1" width="5" height="5" rx="1.2" /><rect x="8" y="1" width="5" height="5" rx="1.2" />
    <rect x="1" y="8" width="5" height="5" rx="1.2" /><rect x="8" y="8" width="5" height="5" rx="1.2" />
  </svg>
);
const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
    <rect x="1" y="2" width="2" height="2" rx="1" /><rect x="4.5" y="2.25" width="8.5" height="1.5" rx="0.75" />
    <rect x="1" y="6" width="2" height="2" rx="1" /><rect x="4.5" y="6.25" width="8.5" height="1.5" rx="0.75" />
    <rect x="1" y="10" width="2" height="2" rx="1" /><rect x="4.5" y="10.25" width="8.5" height="1.5" rx="0.75" />
  </svg>
);
function ViewSwitch({ view, onChange }) {
  const seg = (on) => ({ width: '30px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '5px', cursor: 'pointer', padding: 0,
    background: on ? 'rgba(255,255,255,0.14)' : 'transparent', color: on ? '#FFFFFF' : 'rgba(255,255,255,0.55)' });
  return (
    <div role="group" aria-label="View" style={{ display: 'flex', gap: '2px', padding: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '7px' }}>
      <button title="Grid" aria-label="Grid" aria-pressed={view === 'grid'} onClick={() => onChange('grid')} style={seg(view === 'grid')}><GridIcon /></button>
      <button title="List" aria-label="List" aria-pressed={view === 'list'} onClick={() => onChange('list')} style={seg(view === 'list')}><ListIcon /></button>
    </div>
  );
}

// The person's account: a head-and-shoulders icon and their name, opening the Settings sidebar
const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,0.16)" />
    <circle cx="10" cy="7.6" r="3.2" fill="rgba(255,255,255,0.85)" />
    <path d="M3.9 16.4c1.2-2.7 3.5-4.1 6.1-4.1s4.9 1.4 6.1 4.1A9.9 9.9 0 0 1 10 19.9a9.9 9.9 0 0 1-6.1-3.5z" fill="rgba(255,255,255,0.85)" />
  </svg>
);

// Asked once when a license has no name yet (licenses activated before names were asked for)
function NamePrompt({ onDone }) {
  const [name, setName] = useState('');
  const save = () => { if (name.trim()) onDone(setMyName(name)); };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div role="dialog" aria-label="What's your name?" style={{ width: '300px', background: '#2A2A2A', borderRadius: '16px', padding: '20px', boxShadow: '0 18px 48px rgba(0,0,0,0.45)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}><div style={{ transform: 'scale(2)', margin: '10px' }}><PersonIcon /></div></div>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: '6px' }}>What’s your name?</div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.62)', textAlign: 'center', lineHeight: '17px', marginBottom: '14px' }}>
          It goes on your SpotPlot account and here on the Home screen. You can change it in Settings.
        </div>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') save(); }}
          placeholder="First and last name" autoComplete="name"
          style={{ width: '100%', boxSizing: 'border-box', height: '28px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', color: '#FFFFFF', padding: '0 10px', fontSize: '13px', outline: 'none', marginBottom: '12px', fontFamily: 'inherit' }} />
        <button onClick={save} disabled={!name.trim()}
          style={{ width: '100%', height: '28px', borderRadius: '14px', border: 'none', background: '#0A84FF', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: name.trim() ? 'pointer' : 'default', opacity: name.trim() ? 1 : 0.5, fontFamily: 'inherit' }}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default function HomeScreen({ navigate }) {
  const [shows, setShows] = useState([]);
  const [search, setSearch] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [myName, setMyNameState] = useState(() => getMyName());
  // The first time SpotPlot opens after an update, show what's new in it
  const [appVersion] = useState(() => ipcRenderer.sendSync('get-device-info')?.appVersion || '');
  const [showWhatsNew, setShowWhatsNew] = useState(() => justUpdated(appVersion));
  const [fileMakerSummary, setFileMakerSummary] = useState(null);   // Import from FileMaker, once a file is chosen
  const [view, setView] = useState(() => { try { return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid'; } catch (e) { return 'grid'; } });
  const changeView = (v) => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch (e) {} };

  const refreshShows = () => {
    const updated = ipcRenderer.sendSync('db-get-shows');
    setShows(Array.isArray(updated) ? updated : []);
    return Array.isArray(updated) ? updated : [];
  };
  const importSpotPlotFile = () => {
    const result = ipcRenderer.sendSync('db-import-show');
    if (result.success) {
      alert('Show imported successfully!');
      refreshShows();
    } else if (!result.cancelled) alert('Import failed: ' + result.error);
  };
  const chooseFileMakerFile = () => {
    const result = ipcRenderer.sendSync('filemaker-choose');
    if (result.success) setFileMakerSummary(result.summary);
    else if (!result.cancelled) alert(result.error);
  };
  // Import ▾: a SpotPlot show file, or a FileMaker show
  useEffect(() => {
    const onAction = (_e, id) => {
      if (id === 'import-spotplot') importSpotPlotFile();
      if (id === 'import-filemaker') chooseFileMakerFile();
    };
    const onMenu = () => chooseFileMakerFile();
    ipcRenderer.on('context-menu-action', onAction);
    ipcRenderer.on('menu-import-filemaker', onMenu);
    return () => {
      ipcRenderer.removeListener('context-menu-action', onAction);
      ipcRenderer.removeListener('menu-import-filemaker', onMenu);
    };
  }, []);

  useEffect(() => {
    const result = ipcRenderer.sendSync('db-get-shows');
    if (result) setShows(result);
  }, []);
    useEffect(() => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.on('menu-new-show', () => navigate('new-show'));
    ipcRenderer.on('menu-import-show', () => {
      const result = ipcRenderer.sendSync('db-import-show');
      if (result.success) {
        const shows = ipcRenderer.sendSync('db-get-shows');
        if (shows) setShows(shows);
      }
    });
    // A .spotplot file was double-clicked in Finder and imported
    ipcRenderer.on('show-imported', () => {
      const shows = ipcRenderer.sendSync('db-get-shows');
      if (shows) setShows(shows);
    });
    return () => {
      ipcRenderer.removeAllListeners('menu-new-show');
      ipcRenderer.removeAllListeners('menu-import-show');
      ipcRenderer.removeAllListeners('show-imported');
    };
  }, []);

  const shown = shows.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || (s.theatre || '').toLowerCase().includes(search.toLowerCase()));
  const listColumns = '32px minmax(0, 1fr) 56px 200px 56px';
  const DeleteButton = ({ show }) => (
    <button
      onClick={e => {
        e.stopPropagation();
        if (window.confirm(`Delete "${show.title}"? This cannot be undone.`)) {
          ipcRenderer.sendSync('db-delete-show', show.id);
          setShows(shows.filter(s => s.id !== show.id));
        }
      }}
      style={{ background: 'none', border: 'none', color: '#FF453A', fontSize: '11px', cursor: 'pointer', opacity: 0.4, padding: '2px 6px', flexShrink: 0 }}
      onMouseEnter={e => e.currentTarget.style.opacity = 1}
      onMouseLeave={e => e.currentTarget.style.opacity = 0.4}>
      Delete
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppHeader title="SpotPlot">
        <div style={{ flex: 1 }} />
        {shows.length > 0 && <ViewSwitch view={view} onChange={changeView} />}
        <button onClick={() => setShowSettings(true)} title="Account and Settings"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '220px', padding: '6px 12px 6px 8px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
          <PersonIcon />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{myName || 'Settings'}</span>
        </button>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search shows"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#FFFFFF', padding: '6px 12px', fontSize: '13px', outline: 'none', width: '200px' }}
        />
        <button data-tour="import-show" onClick={() => ipcRenderer.send('show-context-menu', [
          { id: 'import-spotplot', label: 'SpotPlot Show File…' },
          { id: 'import-filemaker', label: 'FileMaker Show…' },
        ])} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.10)', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
          ↓ Import ▾
        </button>
        <button data-tour="new-show" onClick={() => navigate('new-show')} style={{ padding: '8px 18px', background: '#0A84FF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>+ New Show</button>
      </AppHeader>
      <div style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
        {shows.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: '12px' }}>
            <div style={{ fontSize: '40px' }}>✦</div>
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.52)' }}>No shows yet</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.28)' }}>Create your first show to get started</div>
            <button onClick={() => navigate('new-show')} style={{ marginTop: '8px', padding: '10px 24px', background: '#0A84FF', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>+ New Show</button>
          </div>
        ) : (
          view === 'list' ? (
            // List: one row per show, newest change first, like Finder's list view
            <div style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: listColumns, gap: '12px', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.40)' }}>
                <span />
                <span>Name</span>
                <span>Spots</span>
                <span>Modified</span>
                <span />
              </div>
              {shown.map((show, i) => {
                const logo = getImageSrc(show.logo_path);
                return (
                  <div key={show.id} data-tour={i === 0 ? 'show-card' : undefined} onClick={() => navigate('show', show)}
                    style={{ display: 'grid', gridTemplateColumns: listColumns, gap: '12px', alignItems: 'center', padding: '8px 16px', cursor: 'pointer',
                      borderTop: i ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {logo && <img src={logo} style={{ maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', borderRadius: '4px' }} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{show.title}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.52)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{show.theatre || 'No theatre set'}</div>
                    </div>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.62)' }}>{show.num_spots}</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.62)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{modifiedText(show.updated_at || show.created_at).replace(/^Modified /, '')}</span>
                    <DeleteButton show={show} />
                  </div>
                );
              })}
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {shown.map(show => (
              <div key={show.id} data-tour="show-card" onClick={() => navigate('show', show)}
                style={{ background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#0A84FF'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  {show.logo_path && getImageSrc(show.logo_path) && (
                    <img src={getImageSrc(show.logo_path)} style={{ height: '36px', maxWidth: '60px', objectFit: 'contain', borderRadius: '6px' }} />
                  )}
                  <div style={{ fontSize: '16px', fontWeight: '600' }}>{show.title}</div>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.52)', marginBottom: '12px' }}>{show.theatre || 'No theatre set'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(255,255,255,0.1)',
                    borderRadius: '20px', color: 'rgba(255,255,255,0.62)', flexShrink: 0 }}>{show.num_spots} spot{show.num_spots !== 1 ? 's' : ''}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: '11px', color: 'rgba(255,255,255,0.40)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {modifiedText(show.updated_at || show.created_at)}
                  </span>
                  <DeleteButton show={show} />
                </div>
              </div>
            ))}
          </div>
          )
        )}
      </div>
      <Tips steps={TIPS.home} watch={shows.length} />
      {showSettings && <SettingsPanel onClose={() => { setShowSettings(false); setMyNameState(getMyName()); }} />}
      {!myName && !showWhatsNew && <NamePrompt onDone={(n) => setMyNameState(n)} />}
      {fileMakerSummary && <FileMakerImport summary={fileMakerSummary} onCancel={() => setFileMakerSummary(null)}
        onImported={(showId) => {
          setFileMakerSummary(null);
          const show = refreshShows().find(s => s.id === showId);
          if (show) navigate('show', show);
        }} />}
      {showWhatsNew && <WhatsNew version={appVersion} onClose={() => setShowWhatsNew(false)} />}
    </div>
  );
}
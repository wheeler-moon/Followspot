import React, { useState, useEffect, useRef } from 'react';
const { ipcRenderer } = window.require('electron');

const ACTIONS = [
  { name: 'Pick Up', short: 'Pick Up', color: '#3B6D11', intensityDefault: 'Full', timeDefault: null },
  { name: 'Fade Up', short: 'Fade Up', color: '#3B6D11', intensityDefault: null, timeDefault: null },
  { name: 'Fade Down', short: 'Fade Down', color: '#A32D2D', intensityDefault: null, timeDefault: null },
  { name: 'Fade Out', short: 'Fade Out', color: '#A32D2D', intensityDefault: 'Out', timeDefault: null },
  { name: 'Fade In Place', short: 'Fade In Place', color: '#A32D2D', intensityDefault: 'Out', timeDefault: null },
  { name: 'Bump Up', short: 'Bump Up', color: '#3B6D11', intensityDefault: 'Full', timeDefault: '0' },
  { name: 'Bump Out', short: 'Bump Out', color: '#A32D2D', intensityDefault: 'Out', timeDefault: '0' },
  { name: 'Swap To', short: 'Swap To', color: '#185FA5', intensityDefault: null, timeDefault: null },
  { name: 'Slide To', short: 'Slide To', color: '#185FA5', intensityDefault: null, timeDefault: null },
  { name: 'Stay With', short: 'Stay With', color: '#185FA5', intensityDefault: null, timeDefault: null },
  { name: 'Iris In', short: 'Iris In', color: '#534AB7', intensityDefault: null, timeDefault: null },
  { name: 'Iris Out', short: 'Iris Out', color: '#534AB7', intensityDefault: null, timeDefault: null },
  { name: 'Iris/Fade Up', short: 'Iris/Fade Up', color: '#534AB7', intensityDefault: null, timeDefault: null },
  { name: 'Iris/Fade Down', short: 'Iris/Fade Dn', color: '#534AB7', intensityDefault: null, timeDefault: null },
  { name: 'Iris/Fade Out', short: 'Iris/Fade Out', color: '#534AB7', intensityDefault: 'Out', timeDefault: null },
  { name: 'Up & Out', short: 'Up & Out', color: '#854F0B', intensityDefault: 'Out', timeDefault: null },
  { name: 'Bump Color', short: 'Bump Color', color: '#854F0B', intensityDefault: null, timeDefault: '0' },
  { name: 'Roll Color', short: 'Roll Color', color: '#854F0B', intensityDefault: null, timeDefault: null },
  { name: 'Ballyhoo', short: 'Ballyhoo', color: '#D85A30', intensityDefault: null, timeDefault: null },
  { name: 'Off', short: 'Off', color: '#444', intensityDefault: 'Out', timeDefault: null },
];

const INTENSITIES = ['Full', '90%', '80%', '75%', '70%', '60%', '50%', '40%', '30%', '25%', '20%', '10%', 'Glow', 'Out'];
const TIMES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Custom'];

function ActionIcon({ action, size = 20 }) {
  const s = size;
  const h = s / 2;
  switch (action) {
    case 'Pick Up': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 24,20 8,20" fill="#3B6D11"/><polygon points="16,14 22,26 10,26" fill="#639922" opacity="0.5"/></svg>;
    case 'Fade Up': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,5 23,18 9,18" fill="#3B6D11"/></svg>;
    case 'Fade Down': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,27 23,14 9,14" fill="#A32D2D"/></svg>;
    case 'Fade Out': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,28 24,12 8,12" fill="#A32D2D"/><polygon points="16,18 22,6 10,6" fill="#E24B4A" opacity="0.5"/></svg>;
    case 'Fade In Place': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#A32D2D" stroke-width="2"/><polygon points="16,27 23,14 9,14" fill="#A32D2D"/></svg>;
    case 'Bump Up': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="8" y="10" width="16" height="3" rx="1.5" fill="#3B6D11"/><rect x="10" y="15" width="12" height="3" rx="1.5" fill="#3B6D11" opacity="0.6"/><rect x="12" y="20" width="8" height="3" rx="1.5" fill="#3B6D11" opacity="0.3"/></svg>;
    case 'Bump Out': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="8" y="19" width="16" height="3" rx="1.5" fill="#A32D2D"/><rect x="10" y="14" width="12" height="3" rx="1.5" fill="#A32D2D" opacity="0.6"/><rect x="12" y="9" width="8" height="3" rx="1.5" fill="#A32D2D" opacity="0.3"/></svg>;
    case 'Swap To': return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M10 10 C10 6 22 6 22 10 L22 16 C22 20 16 24 16 24 C16 24 10 20 10 16 Z" fill="none" stroke="#185FA5" stroke-width="2"/><path d="M20 20 L26 24 L22 26 L20 20Z" fill="#185FA5"/></svg>;
    case 'Slide To': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="6" y1="16" x2="26" y2="16" stroke="#185FA5" stroke-width="2.5" stroke-linecap="round"/><polygon points="22,10 30,16 22,22" fill="#185FA5"/><polygon points="10,10 2,16 10,22" fill="#185FA5"/></svg>;
    case 'Stay With': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="#E6F1FB" stroke="#185FA5" stroke-width="1.5"/><circle cx="12" cy="16" r="3" fill="#185FA5"/><circle cx="20" cy="16" r="3" fill="#185FA5"/></svg>;
    case 'Iris In': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#534AB7" stroke-width="2"/><line x1="8" y1="16" x2="24" y2="16" stroke="#534AB7" stroke-width="2" stroke-linecap="round"/><polygon points="10,12 6,16 10,20" fill="#534AB7"/><polygon points="22,12 26,16 22,20" fill="#534AB7"/></svg>;
    case 'Iris Out': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="none" stroke="#534AB7" stroke-width="2"/><line x1="8" y1="16" x2="24" y2="16" stroke="#534AB7" stroke-width="2" stroke-linecap="round"/><polygon points="6,12 10,16 6,20" fill="#534AB7"/><polygon points="26,12 22,16 26,20" fill="#534AB7"/></svg>;
    case 'Iris/Fade Up': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="18" r="9" fill="none" stroke="#534AB7" stroke-width="2"/><polygon points="16,4 22,14 10,14" fill="#3B6D11"/></svg>;
    case 'Iris/Fade Down': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="14" r="9" fill="none" stroke="#534AB7" stroke-width="2"/><polygon points="16,28 22,18 10,18" fill="#A32D2D"/></svg>;
    case 'Iris/Fade Out': return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="9" fill="none" stroke="#534AB7" stroke-width="2"/><line x1="9" y1="16" x2="23" y2="16" stroke="#A32D2D" stroke-width="2"/><polygon points="11,12 7,16 11,20" fill="#A32D2D"/><polygon points="21,12 25,16 21,20" fill="#A32D2D"/></svg>;
    case 'Up & Out': return <svg width={s} height={s} viewBox="0 0 32 32"><polygon points="16,4 22,14 10,14" fill="#3B6D11"/><polygon points="16,28 22,18 10,18" fill="#A32D2D"/></svg>;
    case 'Bump Color': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#BA7517" stroke-width="1.5"/><rect x="12" y="11" width="3" height="10" fill="#639922"/><rect x="16" y="11" width="3" height="10" fill="#E24B4A"/></svg>;
    case 'Roll Color': return <svg width={s} height={s} viewBox="0 0 32 32"><rect x="9" y="8" width="14" height="16" rx="2" fill="none" stroke="#BA7517" stroke-width="1.5"/><rect x="9" y="8" width="3.5" height="16" rx="1" fill="#E24B4A"/><rect x="12.5" y="8" width="3.5" height="16" fill="#EF9F27"/><rect x="16" y="8" width="3.5" height="16" fill="#639922"/><rect x="19.5" y="8" width="3.5" height="16" rx="1" fill="#185FA5"/></svg>;
    case 'Ballyhoo': return <svg width={s} height={s} viewBox="0 0 32 32"><path d="M8 16 C8 10 12 6 16 6 C20 6 24 10 24 16 C24 22 20 26 16 26 C12 26 8 22 8 16 Z" fill="none" stroke="#D85A30" stroke-width="2.5"/><path d="M16 6 C16 6 20 16 16 26" fill="none" stroke="#D85A30" stroke-width="2"/><path d="M16 6 C16 6 12 16 16 26" fill="none" stroke="#D85A30" stroke-width="2"/></svg>;
    case 'Off': return <svg width={s} height={s} viewBox="0 0 32 32"><line x1="8" y1="8" x2="24" y2="24" stroke="#555" stroke-width="2.5" stroke-linecap="round"/><line x1="24" y1="8" x2="8" y2="24" stroke="#555" stroke-width="2.5" stroke-linecap="round"/></svg>;
    default: return <svg width={s} height={s} viewBox="0 0 32 32"><circle cx="16" cy="16" r="8" fill="#333"/></svg>;
  }
}

function ActionPicker({ value, onChange, onClose }) {
  return (
    <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 2000, background: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '10px', padding: '8px', width: '280px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '4px' }}>
      {ACTIONS.map(a => (
        <div key={a.name} onClick={() => { onChange(a); onClose(); }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 4px', borderRadius: '6px', cursor: 'pointer', background: value === a.name ? '#2a2a3a' : 'transparent', border: value === a.name ? '1px solid #534AB7' : '1px solid transparent' }}
          onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
          onMouseLeave={e => e.currentTarget.style.background = value === a.name ? '#2a2a3a' : 'transparent'}>
          <ActionIcon action={a.name} size={22} />
          <span style={{ fontSize: '9px', color: '#888', textAlign: 'center', lineHeight: 1.2 }}>{a.short}</span>
        </div>
      ))}
    </div>
  );
}

function SpotCueCell({ spotCue, spot, cue, characters, colorSlots, onUpdate }) {
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTimeVal, setCustomTimeVal] = useState('');
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowActionPicker(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!spotCue) return (
    <td style={{ padding: '8px 10px', borderRight: '1px solid #1e1e1e', verticalAlign: 'top', minWidth: '160px' }}>
      <div style={{ fontSize: '11px', color: '#333' }}>—</div>
    </td>
  );

  const actionDef = ACTIONS.find(a => a.name === spotCue.action);
  const activeFrames = spotCue.active_frames ? spotCue.active_frames.split(',').filter(Boolean) : [];
  const character = characters.find(c => c.id === spotCue.character_id);

  const handleActionSelect = (a) => {
    onUpdate(spotCue.id, 'action', a.name);
    if (a.intensityDefault) onUpdate(spotCue.id, 'intensity', a.intensityDefault);
    if (a.timeDefault !== null) onUpdate(spotCue.id, 'fade_time', a.timeDefault);
  };

  const toggleFrame = (frame) => {
    const current = spotCue.active_frames ? spotCue.active_frames.split(',').filter(Boolean) : [];
    const next = current.includes(frame) ? current.filter(f => f !== frame) : [...current, frame];
    onUpdate(spotCue.id, 'active_frames', next.join(','));
  };

  return (
    <td style={{ padding: '8px 10px', borderRight: '1px solid #1e1e1e', verticalAlign: 'top', minWidth: '180px', position: 'relative' }}>
      <div ref={ref} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
          <div onClick={() => setShowActionPicker(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 7px', borderRadius: '5px', background: actionDef ? '#1e1e2e' : '#1a1a1a', border: `1px solid ${actionDef ? actionDef.color + '55' : '#2a2a2a'}`, cursor: 'pointer', flex: 1 }}>
            {spotCue.action ? (
              <>
                <ActionIcon action={spotCue.action} size={16} />
                <span style={{ fontSize: '11px', color: actionDef ? actionDef.color : '#888', fontWeight: '500' }}>{spotCue.action}</span>
              </>
            ) : (
              <span style={{ fontSize: '11px', color: '#444' }}>Select action...</span>
            )}
          </div>
          {showActionPicker && <ActionPicker value={spotCue.action} onChange={handleActionSelect} onClose={() => setShowActionPicker(false)} />}
        </div>

        <select
          value={spotCue.character_id || ''}
          onChange={e => onUpdate(spotCue.id, 'character_id', e.target.value ? parseInt(e.target.value) : null)}
          style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '4px', color: spotCue.character_id ? '#f0f0f0' : '#444', padding: '3px 6px', fontSize: '12px', marginBottom: '5px', outline: 'none' }}>
          <option value="">Character...</option>
          {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
          <select value={spotCue.intensity || ''} onChange={e => onUpdate(spotCue.id, 'intensity', e.target.value)}
            style={{ flex: 1, background: '#111', border: '1px solid #2a2a2a', borderRadius: '4px', color: spotCue.intensity ? '#f0f0f0' : '#444', padding: '3px 4px', fontSize: '11px', outline: 'none' }}>
            <option value="">Int...</option>
            {INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <div style={{ flex: 1 }}>
            {showCustomTime ? (
              <input autoFocus value={customTimeVal}
                onChange={e => setCustomTimeVal(e.target.value)}
                onBlur={() => { onUpdate(spotCue.id, 'fade_time', customTimeVal); setShowCustomTime(false); }}
                onKeyDown={e => { if (e.key === 'Enter') { onUpdate(spotCue.id, 'fade_time', customTimeVal); setShowCustomTime(false); }}}
                style={{ width: '100%', background: '#111', border: '1px solid #534AB7', borderRadius: '4px', color: '#f0f0f0', padding: '3px 4px', fontSize: '11px', outline: 'none' }}
                placeholder="e.g. 2.5" />
            ) : (
              <select value={spotCue.fade_time || ''} onChange={e => { if (e.target.value === 'Custom') { setShowCustomTime(true); setCustomTimeVal(''); } else onUpdate(spotCue.id, 'fade_time', e.target.value); }}
                style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '4px', color: spotCue.fade_time ? '#f0f0f0' : '#444', padding: '3px 4px', fontSize: '11px', outline: 'none' }}>
                <option value="">Time...</option>
                {TIMES.map(t => <option key={t} value={t}>{t === 'Custom' ? 'Custom...' : t + 's'}</option>)}
              </select>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '3px', marginBottom: '5px', flexWrap: 'wrap' }}>
          {colorSlots.filter(s => !s.is_permanent).map(slot => (
            <div key={slot.id} onClick={() => toggleFrame('F' + slot.slot_number)}
              style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', background: activeFrames.includes('F' + slot.slot_number) ? '#534AB7' : '#1a1a1a', color: activeFrames.includes('F' + slot.slot_number) ? '#fff' : '#555', border: `1px solid ${activeFrames.includes('F' + slot.slot_number) ? '#534AB7' : '#2a2a2a'}` }}>
              F{slot.slot_number}
            </div>
          ))}
        </div>

        <input value={spotCue.description || ''}
          onChange={e => onUpdate(spotCue.id, 'description', e.target.value)}
          placeholder="Note..."
          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #1e1e1e', color: '#888', padding: '2px 0', fontSize: '11px', outline: 'none', fontStyle: 'italic' }} />
      </div>
    </td>
  );
}

function CueRow({ cue, spots, spotCues, characters, colorSlotsBySpot, onUpdateCue, onUpdateSpotCue, onDelete }) {
  const [editingLQ, setEditingLQ] = useState(false);
  const [lqVal, setLqVal] = useState(cue.lq_number || '');

  const saveLQ = () => {
    setEditingLQ(false);
    onUpdateCue(cue.id, 'lq_number', lqVal);
  };

  const handleWLQ = (spotCueId) => {
    if (!lqVal.trim()) return;
    onUpdateSpotCue(spotCueId, 'description', 'w/ LQ ' + lqVal);
  };

  return (
    <tr style={{ borderBottom: '1px solid #1a1a1a' }}
      onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <td style={{ padding: '8px', borderRight: '1px solid #1e1e1e', verticalAlign: 'top', width: '80px', minWidth: '80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          {editingLQ ? (
            <input autoFocus value={lqVal} onChange={e => setLqVal(e.target.value)}
              onBlur={saveLQ} onKeyDown={e => e.key === 'Enter' && saveLQ()}
              style={{ width: '60px', background: '#111', border: '1px solid #534AB7', borderRadius: '4px', color: '#f0f0f0', padding: '3px 6px', fontSize: '16px', fontWeight: '600', textAlign: 'center', outline: 'none' }} />
          ) : (
            <div onClick={() => setEditingLQ(true)} style={{ fontSize: '18px', fontWeight: '700', color: lqVal ? '#f0f0f0' : '#333', cursor: 'pointer', minHeight: '24px' }}>
              {lqVal || '—'}
            </div>
          )}
          <div style={{ fontSize: '10px', color: '#444' }}>T·{cue.track_number}</div>
          <div onClick={() => { if (window.confirm('Delete this cue?')) onDelete(cue.id); }}
            style={{ fontSize: '10px', color: '#c44', cursor: 'pointer', marginTop: '4px', opacity: 0.5 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
            del
          </div>
        </div>
      </td>
      {spots.map(spot => {
        const sc = spotCues.find(sc => sc.spot_id === spot.id && sc.cue_id === cue.id);
        const slots = colorSlotsBySpot[spot.id] || [];
        return (
          <React.Fragment key={spot.id}>
            <SpotCueCell spotCue={sc} spot={spot} cue={cue} characters={characters} colorSlots={slots} onUpdate={onUpdateSpotCue} />
            <td style={{ padding: '4px', borderRight: '1px solid #1e1e1e', verticalAlign: 'top', width: '32px', minWidth: '32px' }}>
              <div onClick={() => sc && handleWLQ(sc.id)}
                title={'w/ LQ ' + lqVal}
                style={{ fontSize: '9px', color: '#444', cursor: 'pointer', padding: '3px 2px', borderRadius: '3px', textAlign: 'center', lineHeight: 1.3, border: '1px solid #222' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#444'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.borderColor = '#222'; }}>
                w/<br/>LQ
              </div>
            </td>
          </React.Fragment>
        );
      })}
    </tr>
  );
}

export default function CueListScreen({ show, navigate }) {
 const [data, setData] = useState({ spots: [], scenes: [], cues: [], spotCues: [] });
  const [characters, setCharacters] = useState([]);
  const [colorSlotsBySpot, setColorSlotsBySpot] = useState({});
  const [showSceneModal, setShowSceneModal] = useState(false);
  const [showCharModal, setShowCharModal] = useState(false);
  const [newSceneLabel, setNewSceneLabel] = useState('');
  const [newSceneSong, setNewSceneSong] = useState('');
  const [newCharName, setNewCharName] = useState('');
  const [newCharActor, setNewCharActor] = useState('');
  const [selectedSceneId, setSelectedSceneId] = useState(null);

  const load = () => {
    const result = ipcRenderer.sendSync('db-get-cue-list', show.id);
        console.log('db-get-cue-list result:', result);
    const safe = result && typeof result === 'object' ? result : { spots: [], scenes: [], cues: [], spotCues: [] };
    setData(safe);
    const chars = ipcRenderer.sendSync('db-get-characters', show.id);
    setCharacters(Array.isArray(chars) ? chars : []);
    const slotsBySpot = {};
    for (const spot of (safe.spots || [])) {
      const slots = ipcRenderer.sendSync('db-get-color-slots', spot.id);
      slotsBySpot[spot.id] = Array.isArray(slots) ? slots : [];
    }
    setColorSlotsBySpot(slotsBySpot);
    if (safe.scenes && safe.scenes.length > 0 && !selectedSceneId) {
      setSelectedSceneId(safe.scenes[safe.scenes.length - 1].id);
    }
  };

  useEffect(() => { load(); }, []);
const groupedCues = () => {
    const cues = data?.cues || [];
    const groups = [];
    let currentScene = null;
    let currentGroup = null;
    for (const cue of cues) {
      const sceneLabel = cue.scene_label || cue.scene_id;
      if (sceneLabel !== currentScene) {
        currentScene = sceneLabel;
        currentGroup = { sceneId: cue.scene_id, sceneLabel: cue.scene_label, sceneSong: cue.scene_song, cues: [] };
        groups.push(currentGroup);
      }
            if (currentGroup) currentGroup.cues.push(cue);
    }
    const unassigned = cues.filter(c => !c.scene_id);
    if (unassigned.length > 0) {
      groups.unshift({ sceneId: null, sceneLabel: 'Unassigned', cues: unassigned });
    }
    return groups;
  };
  const addCue = () => {
    const lastCue = (data?.cues || [])[(data?.cues || []).length - 1];
    const sceneId = selectedSceneId || (lastCue ? lastCue.scene_id : null);
    const result = ipcRenderer.sendSync('db-create-cue', { showId: show.id, sceneId });
    if (result.success) load();
  };

  const updateCue = (cueId, field, value) => {
    ipcRenderer.sendSync('db-update-cue', { cueId, field, value });
    setData(d => ({ ...d, cues: (d?.cues || []).map(c => c.id === cueId ? { ...c, [field]: value } : c) }));
  };

  const updateSpotCue = (spotCueId, field, value) => {
    ipcRenderer.sendSync('db-update-spot-cue', { spotCueId, field, value });
    setData(d => ({ ...d, spotCues: (d?.spotCues || []).map(sc => sc.id === spotCueId ? { ...sc, [field]: value } : sc) }));
  };

  const deleteCue = (cueId) => {
    ipcRenderer.sendSync('db-delete-cue', cueId);
    load();
  };

  const addScene = () => {
    if (!newSceneLabel.trim()) return;
    const result = ipcRenderer.sendSync('db-create-scene', { showId: show.id, label: newSceneLabel, song: newSceneSong });
    if (result.success) { setSelectedSceneId(result.id); setNewSceneLabel(''); setNewSceneSong(''); setShowSceneModal(false); load(); }
  };

  const addCharacter = () => {
    if (!newCharName.trim()) return;
    ipcRenderer.sendSync('db-create-character', { showId: show.id, name: newCharName, actorName: newCharActor });
    setNewCharName(''); setNewCharActor(''); setShowCharModal(false);
    const chars = ipcRenderer.sendSync('db-get-characters', show.id);
    setCharacters(chars);
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e1e1e', background: '#141414', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button onClick={() => navigate('show', show)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '12px', cursor: 'pointer' }}>← {show.title}</button>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#f0f0f0' }}>Cue List</span>
        <div style={{ flex: 1 }} />
        <select value={selectedSceneId || ''} onChange={e => setSelectedSceneId(e.target.value ? parseInt(e.target.value) : null)}
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#ccc', padding: '5px 8px', fontSize: '12px', outline: 'none' }}>
          <option value="">No scene</option>
          {(data?.scenes || []).map(s => <option key={s.id} value={s.id}>{s.label}{s.song ? ' · ' + s.song : ''}</option>)}
        </select>
        <button onClick={() => setShowSceneModal(true)} style={{ padding: '5px 10px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', fontSize: '12px', cursor: 'pointer' }}>+ Scene</button>
        <button onClick={() => setShowCharModal(true)} style={{ padding: '5px 10px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#888', fontSize: '12px', cursor: 'pointer' }}>+ Character</button>
        <button onClick={addCue} style={{ padding: '6px 14px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ Cue</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
        {!data || (data?.cues || []).length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: '12px', color: '#444' }}>
            <div style={{ fontSize: '36px' }}>✦</div>
            <div style={{ fontSize: '15px' }}>No cues yet</div>
            <div style={{ fontSize: '12px', color: '#333' }}>Add a scene first, then create your first cue</div>
            <button onClick={addCue} style={{ marginTop: '8px', padding: '8px 20px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>+ Add first cue</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#141414', borderBottom: '1px solid #2a2a2a' }}>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', color: '#555', fontWeight: '600', width: '80px', borderRight: '1px solid #1e1e1e' }}>CUE</th>
                {(data?.spots || []).map(spot => (
                  <React.Fragment key={spot.id}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '10px', color: '#534AB7', fontWeight: '600', borderRight: '1px solid #1e1e1e' }}>
                      SPOT {spot.spot_number} {spot.operator_name ? '· ' + spot.operator_name : ''}
                    </th>
                    <th style={{ width: '32px', borderRight: '1px solid #1e1e1e' }}></th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {(groupedCues() || []).map(group => (
                <React.Fragment key={group.sceneId || 'unassigned'}>
                  <tr>
                    <td colSpan={data.spots.length * 2 + 1} style={{ padding: '6px 12px', background: '#0f1a14', borderTop: '1px solid #1a3a24', borderBottom: '1px solid #1a3a24' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {group.sceneLabel || 'Unassigned'}
                      </span>
                      {group.sceneSong && <span style={{ fontSize: '11px', color: '#0F6E56', marginLeft: '8px' }}>· {group.sceneSong}</span>}
                    </td>
                  </tr>
                  {group.cues.map(cue => (
                    <CueRow key={cue.id} cue={cue} spots={data.spots} spotCues={(data?.spotCues || [])}
                      characters={characters} colorSlotsBySpot={colorSlotsBySpot}
                      onUpdateCue={updateCue} onUpdateSpotCue={updateSpotCue} onDelete={deleteCue} />
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showSceneModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '12px', padding: '24px', width: '360px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add Scene</div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Scene label *</label>
              <input autoFocus value={newSceneLabel} onChange={e => setNewSceneLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addScene()}
                style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. Scene 1 - The Road" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Song (optional)</label>
              <input value={newSceneSong} onChange={e => setNewSceneSong(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addScene()}
                style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. Time Is My Enemy" />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSceneModal(false)} style={{ padding: '7px 14px', background: 'none', border: '1px solid #333', borderRadius: '6px', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addScene} style={{ padding: '7px 14px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Add Scene</button>
            </div>
          </div>
        </div>
      )}

      {showCharModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
          <div style={{ background: '#1a1a1a', border: '1px solid #3a3a3a', borderRadius: '12px', padding: '24px', width: '360px' }}>
            <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Add Character</div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Character name *</label>
              <input autoFocus value={newCharName} onChange={e => setNewCharName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCharacter()}
                style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. MARIO" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Actor name (optional)</label>
              <input value={newCharActor} onChange={e => setNewCharActor(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCharacter()}
                style={{ width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', color: '#f0f0f0', padding: '7px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="e.g. John Smith" />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCharModal(false)} style={{ padding: '7px 14px', background: 'none', border: '1px solid #333', borderRadius: '6px', color: '#888', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={addCharacter} style={{ padding: '7px 14px', background: '#534AB7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Add Character</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
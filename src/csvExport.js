// Export → Spreadsheet (CSV): a folder of CSV files with everything in a show, for Excel, Numbers or
// Google Sheets (budgets, paperwork in another format, sharing with a production manager…).
// One file can't hold a show well (cues × spots, plus spots, scenes and characters), so it's a folder:
//
//   Cue List.csv    one row per cue, each spot's columns side by side, like the cue list
//   Spot Cues.csv   one row per cue per spot: easy to sort and filter (all of Spot 2, every Pickup…)
//   Spots.csv       operator, location, fixture and color frames
//   Scenes.csv      scene order, songs, act breaks and how many cues each has
//   Characters.csv  characters, performers and costume notes
//   Spot Notes.csv  every spot note (and All Spots note), still to give or already given
//
// Ids are turned into names (characters, scenes, frames → gels), actions use this show's names,
// When/Notes formatting is dropped, and everything is exported, even details hidden in Cue Settings.
// Files are UTF-8 with a byte-order mark and Windows line endings, which Excel opens correctly.

const { actionNameMap, displayAction } = require('./actionNames');

// One CSV cell. Quoted when needed; a cell that starts like a formula gets a leading ' so a
// spreadsheet shows it as text instead of running it.
function cell(value) {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+@\t\r]/.test(s) || (/^-/.test(s) && isNaN(Number(s)))) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const toCSV = (rows) => '﻿' + rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n';

// When/Notes are stored as simple HTML (<b>, <i>, <u>): plain text for a spreadsheet
function plain(html) {
  return String(html || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}
const yesNo = (v) => (v ? 'Yes' : 'No');
const gelText = (slot) => (slot ? [slot.gel_number, slot.gel_name].filter(Boolean).join(' ') : '');

function buildShowCSVs(db, showId) {
  const show = db.prepare('SELECT * FROM shows WHERE id = ?').get(showId);
  const spots = db.prepare('SELECT * FROM spots WHERE show_id = ? ORDER BY COALESCE(display_order, spot_number * 1000)').all(showId);
  const scenes = db.prepare('SELECT * FROM scenes WHERE show_id = ? ORDER BY sort_order').all(showId);
  const characters = db.prepare('SELECT * FROM characters WHERE show_id = ? ORDER BY sort_order, id').all(showId);
  const allCues = db.prepare('SELECT * FROM cues WHERE show_id = ? ORDER BY sort_order').all(showId);
  const spotCues = db.prepare('SELECT sc.* FROM spot_cues sc JOIN cues c ON sc.cue_id = c.id WHERE c.show_id = ?').all(showId);
  const slots = {};
  for (const spot of spots) slots[spot.id] = db.prepare('SELECT * FROM color_slots WHERE spot_id = ? ORDER BY slot_number').all(spot.id);
  const actionNames = actionNameMap(show.action_names);

  // Cues in cue-list order: scene by scene, then any cues without a scene
  const sceneIndex = new Map(scenes.map((s, i) => [s.id, i]));
  const cues = [...allCues].sort((a, b) =>
    ((sceneIndex.get(a.scene_id) ?? 1e9) - (sceneIndex.get(b.scene_id) ?? 1e9)) || ((a.sort_order || 0) - (b.sort_order || 0)));
  const sceneById = new Map(scenes.map(s => [s.id, s]));
  const charById = new Map(characters.map(c => [c.id, c]));
  const scFor = new Map(spotCues.map(sc => [`${sc.cue_id}:${sc.spot_id}`, sc]));
  const spotName = (spot) => `Spot ${spot.spot_number}`;

  // What one spot does in one cue, as words
  const describe = (sc, spot, cue) => {
    if (!sc) return { action: '', character: '', performer: '', intensity: '', iris: '', frames: '', gels: '', time: '', when: '', notes: '' };
    const char = charById.get(sc.character_id);
    const frames = (sc.active_frames || '').split(',').map(f => f.trim()).filter(Boolean)
      .sort((a, b) => (parseInt(a.slice(1)) || 0) - (parseInt(b.slice(1)) || 0));
    const frameSlots = frames.map(f => (slots[spot.id] || []).find(sl => !sl.is_permanent && `F${sl.slot_number}` === f));
    return {
      action: sc.action && sc.action !== 'Tracked' ? displayAction(sc.action, actionNames) : '',
      character: char ? char.name : (sc.custom_character || ''),
      performer: char ? (char.actor_name || '') : '',
      intensity: sc.intensity || '',
      iris: sc.frame_size || '',
      frames: sc.no_color ? 'NC' : frames.join('+'),
      gels: sc.no_color ? 'No color' : frameSlots.map(gelText).filter(Boolean).join(' + '),
      time: sc.fade_time === null || sc.fade_time === undefined || sc.fade_time === '' ? '' : String(sc.fade_time),
      when: [sc.with_lq ? `w/ LQ ${cue.lq_number || ''}`.trim() : '', plain(sc.description)].filter(Boolean).join(' '),
      notes: plain(sc.notes),
    };
  };
  const cueInfo = (cue) => {
    const scene = sceneById.get(cue.scene_id);
    return [scene ? scene.label : '', scene ? (scene.song || '') : '', cue.lq_number || '', cue.track_number ?? '', cue.page || ''];
  };

  const files = {};

  // Cue List: wide, one row per cue
  const perSpot = ['Action', 'Character', 'Intensity', 'Iris', 'Frames', 'Gels', 'Time (s)', 'When', 'Notes'];
  files['Cue List.csv'] = toCSV([
    ['Scene', 'Song', 'LQ', 'Track', 'Page', ...spots.flatMap(spot => perSpot.map(f => `${spotName(spot)} ${f}`))],
    ...cues.map(cue => [...cueInfo(cue), ...spots.flatMap(spot => {
      const d = describe(scFor.get(`${cue.id}:${spot.id}`), spot, cue);
      return [d.action, d.character, d.intensity, d.iris, d.frames, d.gels, d.time, d.when, d.notes];
    })]),
  ]);

  // Spot Cues: long, one row per cue per spot
  files['Spot Cues.csv'] = toCSV([
    ['Cue Order', 'Scene', 'Song', 'LQ', 'Track', 'Page', 'Spot', 'Operator', 'Action', 'Character', 'Performer', 'Intensity', 'Iris', 'Frames', 'Gels', 'Time (s)', 'When', 'Notes', 'Highlight', 'Skipped', 'Spot Note'],
    ...cues.flatMap((cue, i) => spots.map(spot => {
      const sc = scFor.get(`${cue.id}:${spot.id}`);
      const d = describe(sc, spot, cue);
      const highlight = sc?.highlight ? sc.highlight[0].toUpperCase() + sc.highlight.slice(1) : '';
      return [i + 1, ...cueInfo(cue), spotName(spot), spot.operator_name || '', d.action, d.character, d.performer, d.intensity, d.iris,
        d.frames, d.gels, d.time, d.when, d.notes, highlight, yesNo(sc?.ignored), sc?.spot_note || ''];
    })),
  ]);

  // Spots: the most frames any spot has, plus the permanent color
  const maxFrames = Math.max(0, ...spots.map(spot => Math.max(0, ...(slots[spot.id] || []).filter(sl => !sl.is_permanent).map(sl => sl.slot_number || 0))));
  files['Spots.csv'] = toCSV([
    ['Spot', 'Operator', 'Location', 'Fixture', ...Array.from({ length: maxFrames }, (_, i) => `F${i + 1}`), 'Permanent Color'],
    ...spots.map(spot => {
      const list = slots[spot.id] || [];
      return [spotName(spot), spot.operator_name || '', spot.location || '', spot.fixture_type || '',
        ...Array.from({ length: maxFrames }, (_, i) => gelText(list.find(sl => !sl.is_permanent && sl.slot_number === i + 1))),
        gelText(list.find(sl => sl.is_permanent))];
    }),
  ]);

  // Scenes
  files['Scenes.csv'] = toCSV([
    ['Order', 'Scene', 'Song', 'Act Break', 'Cues', 'First LQ', 'Last LQ'],
    ...scenes.map((scene, i) => {
      const own = cues.filter(c => c.scene_id === scene.id);
      return [i + 1, scene.label, scene.song || '', yesNo(scene.act_break), own.length, own[0]?.lq_number || '', own[own.length - 1]?.lq_number || ''];
    }),
  ]);

  // Characters
  files['Characters.csv'] = toCSV([
    ['Character', 'Performer', 'Costume Notes', 'On Characters Sheet'],
    ...characters.map(c => [c.name, c.actor_name || '', c.costume_notes || '', yesNo(c.print_on_sheet !== 0)]),
  ]);

  // Spot Notes, in cue order (All Spots first within a cue): notes still to give, then given ones
  let given = [];
  try { given = db.prepare('SELECT * FROM given_notes WHERE show_id = ? ORDER BY given_at, id').all(showId); } catch (e) {}
  const spotById = new Map(spots.map(s => [s.id, s]));
  const noteRows = [];
  for (const cue of cues) {
    const scene = sceneById.get(cue.scene_id);
    const base = [cue.lq_number || '', cue.track_number ?? '', cue.page || '', scene ? scene.label : ''];
    if (cue.all_spots_note && cue.all_spots_note.trim()) noteRows.push([...base, 'All Spots', '', cue.all_spots_note, 'No', '']);
    for (const spot of spots) {
      const sc = scFor.get(`${cue.id}:${spot.id}`);
      if (sc?.spot_note && sc.spot_note.trim()) noteRows.push([...base, spotName(spot), spot.operator_name || '', sc.spot_note, 'No', '']);
    }
    for (const g of given.filter(x => x.cue_id === cue.id)) {
      const spot = g.spot_id === null ? null : spotById.get(g.spot_id);
      if (g.spot_id !== null && !spot) continue;
      noteRows.push([...base, spot ? spotName(spot) : 'All Spots', spot ? (spot.operator_name || '') : '', g.note, 'Yes', g.given_at || '']);
    }
  }
  files['Spot Notes.csv'] = toCSV([['LQ', 'Track', 'Page', 'Scene', 'Spot', 'Operator', 'Note', 'Given', 'Given At (UTC)'], ...noteRows]);

  return { title: show.title || 'Show', files };
}

module.exports = { buildShowCSVs };

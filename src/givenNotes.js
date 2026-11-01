// Given notes: a spot note that's been checked off leaves the cue (so the cue list's yellow dot goes
// away and the Spot Notes list only shows notes still to give) and is kept here, in given_notes,
// for the Spot Notes screen's "Given" tray. A cue can collect several given notes over a run.
// spot_id is null for a note that was for All Spots. Restoring puts the note back on its cue.
//
// Older data marked a note as given in place (spot_cues.note_checked, cues.all_spots_note_checked);
// moveCheckedNotes() turns those into given notes. It runs when SpotPlot opens a database and after
// a show file is imported, so older files and databases end up the same way.

function ensureTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS given_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      show_id INTEGER NOT NULL,
      cue_id INTEGER NOT NULL,
      spot_id INTEGER,
      note TEXT NOT NULL,
      given_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE CASCADE,
      FOREIGN KEY (cue_id) REFERENCES cues(id) ON DELETE CASCADE
    );
  `);
}

// Notes still marked as checked in place (older data) become given notes (all shows, or one show)
function moveCheckedNotes(db, showId = null) {
  const only = showId === null ? '' : ' AND c.show_id = ?';
  const args = showId === null ? [] : [showId];
  db.transaction(() => {
    for (const sc of db.prepare(`SELECT sc.id, sc.cue_id, sc.spot_id, sc.spot_note, c.show_id FROM spot_cues sc JOIN cues c ON sc.cue_id = c.id
        WHERE sc.note_checked = 1 AND TRIM(COALESCE(sc.spot_note, '')) <> ''${only}`).all(...args)) {
      db.prepare('INSERT INTO given_notes (show_id, cue_id, spot_id, note) VALUES (?, ?, ?, ?)').run(sc.show_id, sc.cue_id, sc.spot_id, sc.spot_note);
      db.prepare("UPDATE spot_cues SET spot_note = '', note_checked = 0 WHERE id = ?").run(sc.id);
    }
    for (const c of db.prepare(`SELECT c.id, c.show_id, c.all_spots_note FROM cues c
        WHERE c.all_spots_note_checked = 1 AND TRIM(COALESCE(c.all_spots_note, '')) <> ''${only}`).all(...args)) {
      db.prepare('INSERT INTO given_notes (show_id, cue_id, spot_id, note) VALUES (?, ?, NULL, ?)').run(c.show_id, c.id, c.all_spots_note);
      db.prepare("UPDATE cues SET all_spots_note = '', all_spots_note_checked = 0 WHERE id = ?").run(c.id);
    }
    db.exec('UPDATE spot_cues SET note_checked = 0 WHERE note_checked = 1');
    db.exec('UPDATE cues SET all_spots_note_checked = 0 WHERE all_spots_note_checked = 1');
  })();
}

// Checks off a note: { spotCueId } for a spot's note, { cueId } for an All Spots note
function giveNote(db, { spotCueId, cueId }) {
  db.transaction(() => {
    if (spotCueId) {
      const sc = db.prepare('SELECT sc.*, c.show_id FROM spot_cues sc JOIN cues c ON sc.cue_id = c.id WHERE sc.id = ?').get(spotCueId);
      if (!sc || !(sc.spot_note || '').trim()) return;
      db.prepare('INSERT INTO given_notes (show_id, cue_id, spot_id, note) VALUES (?, ?, ?, ?)').run(sc.show_id, sc.cue_id, sc.spot_id, sc.spot_note);
      db.prepare("UPDATE spot_cues SET spot_note = '', note_checked = 0 WHERE id = ?").run(spotCueId);
    } else {
      const c = db.prepare('SELECT * FROM cues WHERE id = ?').get(cueId);
      if (!c || !(c.all_spots_note || '').trim()) return;
      db.prepare('INSERT INTO given_notes (show_id, cue_id, spot_id, note) VALUES (?, ?, NULL, ?)').run(c.show_id, c.id, c.all_spots_note);
      db.prepare("UPDATE cues SET all_spots_note = '', all_spots_note_checked = 0 WHERE id = ?").run(cueId);
    }
  })();
}

// Puts a given note back on its cue (under any note written there since) and out of the tray
function restoreNote(db, id) {
  db.transaction(() => {
    const g = db.prepare('SELECT * FROM given_notes WHERE id = ?').get(id);
    if (!g) return;
    const join = (now) => ((now || '').trim() ? `${now.trim()}\n${g.note}` : g.note);
    if (g.spot_id === null) {
      const c = db.prepare('SELECT all_spots_note FROM cues WHERE id = ?').get(g.cue_id);
      if (c) db.prepare('UPDATE cues SET all_spots_note = ? WHERE id = ?').run(join(c.all_spots_note), g.cue_id);
    } else {
      const sc = db.prepare('SELECT id, spot_note FROM spot_cues WHERE cue_id = ? AND spot_id = ?').get(g.cue_id, g.spot_id);
      if (sc) db.prepare('UPDATE spot_cues SET spot_note = ? WHERE id = ?').run(join(sc.spot_note), sc.id);
      else db.prepare("INSERT INTO spot_cues (cue_id, spot_id, action, spot_note) VALUES (?, ?, 'Off', ?)").run(g.cue_id, g.spot_id, g.note);
    }
    db.prepare('DELETE FROM given_notes WHERE id = ?').run(id);
  })();
}

module.exports = { ensureTable, moveCheckedNotes, giveNote, restoreNote };

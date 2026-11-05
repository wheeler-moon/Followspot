// How a change in one cue carries down to the same spot's later cues (cue list, CueListScreen updateSpotCue).
//
// Character (the first, a typed name, the 2nd/3rd): the spot stays on that person until something says
// otherwise, so a new name carries down through every later cue that was on the old person:
//   - Tracked cues, and cues that keep working the same person (Increase, Decrease, the irises,
//     Stay With, Bump Color, Roll Color, Dump & Restore, Ballyhoo, custom actions) take the new name
//     and it keeps going.
//   - Cues that end the spot (Fade Out, Bump Out, Up & Out, Fade In Place, Iris/Fade Out) take the new
//     name (you fade out of the person you picked up) and it stops there: the spot is out after them.
//   - It stops before: an Off cue; a cue that picks someone new (Pick Up, Bump Up, Swap To, Slide To);
//     and any cue whose character isn't the old one (someone else, or changed by hand).
//   - Changing the character on a cue that ends the spot, or on an Off cue, carries nothing down.
//
// Iris size and color frames: only Tracked cues follow (any action can set its own iris or color),
// stopping at the first cue with an action or a different value.

const CHARACTER_FIELDS = ['character_id', 'custom_character', 'extra_characters'];
const FOLLOW_FIELDS = [...CHARACTER_FIELDS, 'frame_size', 'active_frames', 'no_color'];
const ENDS_SPOT = ['Fade Out', 'Bump Out', 'Up & Out', 'Fade In Place', 'Iris/Fade Out'];
const NEW_TARGET = ['Pick Up', 'Bump Up', 'Swap To', 'Slide To'];

const isTracked = (action) => !action || action === 'Tracked';
const same = (a, b) => {
  const n = (v) => (v == null || v === '' || v === 0 || v === '0' || v === '[]') ? '' : String(v);
  return n(a) === n(b);
};

// rows: this spot's boxes in cue order (one per cue; a missing box is null). from: the index of the box
// that changed. Returns the ids of the later boxes that should take the new value.
function followDown(rows, from, field, oldValue, newValue) {
  if (!FOLLOW_FIELDS.includes(field) || same(oldValue, newValue)) return [];
  const start = rows[from];
  const ids = [];
  if (CHARACTER_FIELDS.includes(field)) {
    if (!start || start.action === 'Off' || ENDS_SPOT.includes(start.action)) return [];
    for (let i = from + 1; i < rows.length; i++) {
      const sc = rows[i];
      if (!sc || sc.action === 'Off' || NEW_TARGET.includes(sc.action)) break;
      if (!same(sc[field], oldValue)) break;
      ids.push(sc.id);
      if (ENDS_SPOT.includes(sc.action)) break;
    }
  } else {
    for (let i = from + 1; i < rows.length; i++) {
      const sc = rows[i];
      if (!sc || !isTracked(sc.action) || !same(sc[field], oldValue)) break;
      ids.push(sc.id);
    }
  }
  return ids;
}

module.exports = { followDown, FOLLOW_FIELDS, CHARACTER_FIELDS, ENDS_SPOT, NEW_TARGET, isTracked, same };

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
// Iris size and color frames follow the spot until it goes out, like a character:
//   - Every later cue that still has the old value takes the new one, whatever its action.
//   - A cue that ends the spot (Fade Out, Bump Out, …) takes it too, and it stops there.
//   - It stops before: an Off cue, and any cue with a different value (changed by hand).
//   - Iris also stops before an iris action (Iris In, Iris Out, Iris/Fade …), and color before a color
//     action (Bump Color, Roll Color): those set their own. Changing it on that cue carries down from
//     there by the same rules.
//   - Changing them on a cue that ends the spot, or on an Off cue, carries nothing down.
//
// Custom actions (Show Settings → Actions) say for themselves, in `tracking`:
//   { character, iris, color }: true lets a change above carry through the action's cue; false (the
//   default, also for older actions without `tracking`) stops it before that cue.
//   goesOut: the spot is out after the action, like Fade Out. What carries in stops there, and a change
//   on that cue carries nothing down.
// A custom cue works like any other as the start: a change on it carries down unless it goes out.

const CHARACTER_FIELDS = ['character_id', 'custom_character', 'extra_characters'];
const FOLLOW_FIELDS = [...CHARACTER_FIELDS, 'frame_size', 'active_frames', 'no_color'];
const ENDS_SPOT = ['Fade Out', 'Bump Out', 'Up & Out', 'Fade In Place', 'Iris/Fade Out'];
const NEW_TARGET = ['Pick Up', 'Bump Up', 'Swap To', 'Slide To'];
const IRIS_ACTIONS = ['Iris In', 'Iris Out', 'Iris/Fade Up', 'Iris/Fade Down', 'Iris/Fade Out'];
const COLOR_ACTIONS = ['Bump Color', 'Roll Color'];

const KIND = { frame_size: 'iris', active_frames: 'color', no_color: 'color' };
const customFor = (action, customActions) => (customActions || []).find(a => a.name === action) || null;
const goesOut = (action, customActions) => ENDS_SPOT.includes(action) || !!customFor(action, customActions)?.tracking?.goesOut;

const isTracked = (action) => !action || action === 'Tracked';
const same = (a, b) => {
  const n = (v) => (v == null || v === '' || v === 0 || v === '0' || v === '[]') ? '' : String(v);
  return n(a) === n(b);
};

// rows: this spot's boxes in cue order (one per cue; a missing box is null). from: the index of the box
// that changed. Returns the ids of the later boxes that should take the new value.
function followDown(rows, from, field, oldValue, newValue, customActions = []) {
  if (!FOLLOW_FIELDS.includes(field) || same(oldValue, newValue)) return [];
  const start = rows[from];
  const ids = [];
  if (!start || start.action === 'Off' || goesOut(start.action, customActions)) return [];
  const kind = KIND[field] || 'character';
  const blocked = (action) => { const c = customFor(action, customActions); return !!c && !c.tracking?.[kind]; };
  if (CHARACTER_FIELDS.includes(field)) {
    for (let i = from + 1; i < rows.length; i++) {
      const sc = rows[i];
      if (!sc || sc.action === 'Off' || NEW_TARGET.includes(sc.action) || blocked(sc.action)) break;
      if (!same(sc[field], oldValue)) break;
      ids.push(sc.id);
      if (goesOut(sc.action, customActions)) break;
    }
  } else {
    for (let i = from + 1; i < rows.length; i++) {
      const sc = rows[i];
      if (!sc || sc.action === 'Off' || blocked(sc.action) || !same(sc[field], oldValue)) break;
      if (field === 'frame_size' && IRIS_ACTIONS.includes(sc.action)) break;
      if (field !== 'frame_size' && COLOR_ACTIONS.includes(sc.action)) break;
      ids.push(sc.id);
      if (goesOut(sc.action, customActions)) break;
    }
  }
  return ids;
}

module.exports = { goesOut, followDown, FOLLOW_FIELDS, CHARACTER_FIELDS, ENDS_SPOT, NEW_TARGET, IRIS_ACTIONS, COLOR_ACTIONS, isTracked, same };

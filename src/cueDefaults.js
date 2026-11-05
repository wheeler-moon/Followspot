// Cue Defaults (Show Settings → Cue Defaults): starting values for a spot's intensity, time, iris size
// and color, stored on the show as JSON in shows.cue_defaults:
//   { intensity, fade_time, frame_size, active_frames ("F1,F3"), no_color (0/1) }   ('' / 0 = no default)
//
// They're filled in when an action is picked for a spot in a cue, and only into boxes that are empty:
//   - Time: on any action. An action with its own time still wins (Bump Up → 0).
//   - Intensity, iris and color: only when the spot is coming out of Off (no earlier cue, or the cue
//     before left it off), so a spot that's already up keeps tracking its look. An action with its own
//     intensity still wins (Pick Up → Full, Fade Out → Out).

const INTENSITIES = ['Full', '90%', '80%', '75%', '70%', '60%', '50%', '40%', '30%', '25%', '20%', '10%', 'Glow', 'Out'];
const TIMES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Custom'];
// Actions that leave the spot off at the end of the cue
const ENDS_OFF = ['Off', 'Fade Out', 'Bump Out', 'Fade In Place', 'Up & Out', 'Iris/Fade Out'];

function cueDefaults(json) {
  let saved = {};
  try { saved = (typeof json === 'string' ? JSON.parse(json) : json) || {}; } catch (e) { saved = {}; }
  return {
    intensity: saved.intensity || '',
    fade_time: saved.fade_time === null || saved.fade_time === undefined ? '' : String(saved.fade_time),
    frame_size: saved.frame_size || '',
    active_frames: saved.active_frames || '',
    no_color: saved.no_color ? 1 : 0,
  };
}

// The fields to set when action `a` ({ name, intensityDefault?, timeDefault? }) is picked for spot cue `sc`.
// fromOff: the spot is coming out of Off. frames: the frames this spot has, e.g. ['F1', 'F2', ...].
function fieldsForPick(a, sc, { defaults, fromOff, frames = [] }) {
  const out = {};
  if (!a || a.name === 'Off' || a.name === 'Tracked') return out;
  const d = defaults || cueDefaults(null);
  if (a.timeDefault !== null && a.timeDefault !== undefined) out.fade_time = a.timeDefault;
  else if (!sc.fade_time && d.fade_time) out.fade_time = d.fade_time;
  if (a.intensityDefault) out.intensity = a.intensityDefault;
  else if (fromOff && !sc.intensity && d.intensity) out.intensity = d.intensity;
  if (fromOff && !sc.frame_size && d.frame_size) out.frame_size = d.frame_size;
  if (fromOff && !sc.active_frames && !sc.no_color) {
    if (d.no_color) out.no_color = 1;
    else {
      const have = new Set(frames);
      const pick = d.active_frames.split(',').filter(f => f && have.has(f)).join(',');
      if (pick) out.active_frames = pick;
    }
  }
  return out;
}

module.exports = { INTENSITIES, TIMES, ENDS_OFF, cueDefaults, fieldsForPick };

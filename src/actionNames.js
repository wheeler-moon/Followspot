// A show can rename SpotPlot's built-in actions ("Pick Up" → "Pickup"), stored on the show as JSON in
// shows.action_names: { [built-in name]: name shown in this show }. Cues keep the built-in name, so
// symbols, colors and behaviour don't change; only the name people see does (cue list, action menu,
// prints, action key, iPad). Custom actions are renamed for real instead (their cues follow).
//
// A custom action can also borrow one of SpotPlot's own symbols: custom_actions[i].builtinIcon holds
// the built-in action whose symbol it uses (instead of, or before, an uploaded image in .icon).

function actionNameMap(json) {
  let saved = {};
  try { saved = (typeof json === 'string' ? JSON.parse(json) : json) || {}; } catch (e) { saved = {}; }
  const out = {};
  for (const [k, v] of Object.entries(saved)) if (typeof v === 'string' && v.trim() && v.trim() !== k) out[k] = v.trim();
  return out;
}

// The name to show for an action in this show
function displayAction(name, map) {
  return (name && map && map[name]) || name;
}

module.exports = { actionNameMap, displayAction };

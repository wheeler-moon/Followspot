// A show's iris sizes, in order. Stored on the show as JSON in shows.iris_sizes.
// Each size: { label, value, builtin?, key?, pic? }. Built-in sizes keep `key`, their original full name,
// so a renamed one can be reset. `label` is the short button text on the cue list (e.g. "FB");
// `value` is the full name saved in cues and printed (e.g. "Full Body").
//
// Older shows stored only their custom sizes (no `builtin` entries). Those still load as
// the defaults followed by the customs. Saved lists are always a plain array so older
// SpotPlot versions can still read them.
//
// pic: where that size's circle sits on the stick figure (Show Settings → Iris Sizes), as { x, y, r } in
// the figure's drawing units (FIGURE_BOX wide and tall; the figure stands at x 60, head at the top, feet
// at y 150). Built-in sizes without one use DEFAULT_IRIS_PICS; custom sizes without one have no picture yet.

const DEFAULT_IRIS_SIZES = [
  { label: 'FB', value: 'Full Body' },
  { label: '3/4', value: '3/4 Body' },
  { label: '1/2', value: '1/2 Body' },
  { label: 'H&S', value: 'Head & Shoulders' },
  { label: 'Hd', value: 'Head' },
];

const FIGURE_BOX = { w: 120, h: 170 };
const DEFAULT_IRIS_PICS = {
  'Full Body': { x: 60, y: 82, r: 70 },
  '3/4 Body': { x: 60, y: 68, r: 56 },
  '1/2 Body': { x: 60, y: 53, r: 40 },
  'Head & Shoulders': { x: 60, y: 36, r: 23 },
  'Head': { x: 60, y: 24, r: 13 },
};
const validPic = (p) => p && [p.x, p.y, p.r].every(n => typeof n === 'number' && isFinite(n)) && p.r > 0;
// The circle to draw for a size: its own, else its built-in default, else null
const irisPic = (size) => (size && validPic(size.pic) ? size.pic : (size && size.builtin && DEFAULT_IRIS_PICS[size.key]) || null);

function irisSizeList(json) {
  let saved = null;
  try { saved = typeof json === 'string' ? JSON.parse(json) : json; } catch (e) { saved = null; }
  if (!Array.isArray(saved)) saved = [];
  const sizes = saved.filter(s => s && s.value);
  if (sizes.some(s => s.builtin)) {
    return sizes.map(s => {
      const out = { label: s.label || s.value, value: s.value, builtin: !!s.builtin };
      if (validPic(s.pic)) out.pic = { x: s.pic.x, y: s.pic.y, r: s.pic.r };
      if (s.builtin) {
        const original = DEFAULT_IRIS_SIZES.find(d => d.value === s.key) || DEFAULT_IRIS_SIZES.find(d => d.value === s.value || d.label === s.label);
        if (original) out.key = original.value;
      }
      return out;
    });
  }
  // Older format: only custom sizes were saved
  return [...DEFAULT_IRIS_SIZES.map(s => ({ ...s, builtin: true, key: s.value })), ...sizes.map(s => ({ label: s.label || s.value, value: s.value, builtin: false, ...(validPic(s.pic) ? { pic: s.pic } : {}) }))];
}

module.exports = { DEFAULT_IRIS_SIZES, irisSizeList, FIGURE_BOX, DEFAULT_IRIS_PICS, irisPic };

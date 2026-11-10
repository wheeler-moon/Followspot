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
  'Full Body': { x: 60, y: 82, r: 74.6 },
  '3/4 Body': { x: 60, y: 68, r: 56 },
  '1/2 Body': { x: 59.7, y: 52.5, r: 43.1 },
  'Head & Shoulders': { x: 60, y: 36, r: 26.9 },
  'Head': { x: 60.1, y: 24.9, r: 21 },
};
// The stick figure, in those units: a head and five lines (body, arms, legs). Drawn by the Mac (IrisFigure.jsx)
// and on prints (irisFigureSVG); the iPad should draw the same.
const FIGURE_HEAD = { cx: 60, cy: 24, r: 10 };
const FIGURE_LINES = [[60, 34, 60, 92], [60, 48, 38, 80], [60, 48, 82, 80], [60, 92, 44, 150], [60, 92, 76, 150]];

// An SVG string of a size's picture, for prints: the figure, and its circle when it has one
function irisFigureSVG(pic, { height = '0.38in', pad = 15, figure = '#6A2C9E', circle = '#1a1a1a' } = {}) {
  const w = FIGURE_BOX.w + pad * 2;
  const stroke = `stroke="${figure}" stroke-width="6" stroke-linecap="round" fill="none"`;
  return `<svg viewBox="${-pad} 0 ${w} ${FIGURE_BOX.h}" style="height:${height};width:calc(${height} * ${w / FIGURE_BOX.h});display:block;overflow:hidden">`
    + `<circle cx="${FIGURE_HEAD.cx}" cy="${FIGURE_HEAD.cy}" r="${FIGURE_HEAD.r}" ${stroke}/>`
    + FIGURE_LINES.map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${stroke}/>`).join('')
    + (pic ? `<circle cx="${pic.x}" cy="${pic.y}" r="${pic.r}" fill="none" stroke="${circle}" stroke-width="5"/>` : '')
    + '</svg>';
}

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

module.exports = { DEFAULT_IRIS_SIZES, irisSizeList, FIGURE_BOX, FIGURE_HEAD, FIGURE_LINES, DEFAULT_IRIS_PICS, irisPic, irisFigureSVG };

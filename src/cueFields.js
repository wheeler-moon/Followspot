// Cue fields a show can hide, separately on the cue list and on printed sheets.
// Stored on the show as JSON in shows.cue_fields: { [key]: { list: bool, print: bool } }.
// Missing keys use each field's default: shown, except the page number on prints (off until turned on).
// So older shows (and older show files) look as they did.
// Hiding never deletes data.

const CUE_FIELDS = [
  { key: 'action', label: 'Action' },
  { key: 'character', label: 'Character' },
  { key: 'intensity', label: 'Intensity' },
  { key: 'iris', label: 'Iris size' },
  { key: 'color', label: 'Color frames' },
  { key: 'time', label: 'Time' },
  { key: 'when', label: 'When' },
  { key: 'notes', label: 'Notes' },
  { key: 'page', label: 'Page number', defaultPrint: false },   // the cue's script page ("pg 13")
];

function cueFieldSettings(json) {
  let saved = {};
  try { saved = (typeof json === 'string' ? JSON.parse(json) : json) || {}; } catch (e) { saved = {}; }
  const out = {};
  for (const { key, defaultPrint = true } of CUE_FIELDS) {
    out[key] = { list: saved[key]?.list !== false, print: typeof saved[key]?.print === 'boolean' ? saved[key].print : defaultPrint };
  }
  return out;
}

module.exports = { CUE_FIELDS, cueFieldSettings };

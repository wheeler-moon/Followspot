// Cue fields a show can hide, separately on the cue list and on printed sheets.
// Stored on the show as JSON in shows.cue_fields: { [key]: { list: bool, print: bool } }.
// Missing keys default to shown, so older shows (and older show files) show everything.
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
];

function cueFieldSettings(json) {
  let saved = {};
  try { saved = (typeof json === 'string' ? JSON.parse(json) : json) || {}; } catch (e) { saved = {}; }
  const out = {};
  for (const { key } of CUE_FIELDS) {
    out[key] = { list: saved[key]?.list !== false, print: saved[key]?.print !== false };
  }
  return out;
}

module.exports = { CUE_FIELDS, cueFieldSettings };

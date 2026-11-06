// Finding a cue by what someone types (⌘G Go to Cue, and the Notes sidebar's LQ box).
// LQs can have more than a number in them ("14*", "In 14", "14A", "102.5"), so:
//   1. an LQ that matches what was typed exactly (ignoring case and spaces) wins;
//   2. then an LQ whose number is the typed number ("14" finds "14*" or "In 14");
//   3. otherwise the cue whose number is nearest (on a tie, the earlier one).
// Cues without a number in their LQ only match exactly. Returns the cue, or null.

const lqNumber = (lq) => {
  const m = String(lq ?? '').match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};
const squash = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, '');

function findCue(cues, typed, { nearest = true } = {}) {
  const want = squash(typed);
  if (!want) return null;
  const list = [...(cues || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const exact = list.find(c => squash(c.lq_number) === want);
  if (exact) return exact;
  const n = lqNumber(typed);
  if (n === null) return list.find(c => squash(c.lq_number).includes(want)) || null;
  const numbered = list.filter(c => lqNumber(c.lq_number) !== null);
  const same = numbered.find(c => lqNumber(c.lq_number) === n);
  if (same || !nearest) return same || null;
  let best = null;
  for (const c of numbered) {
    const d = Math.abs(lqNumber(c.lq_number) - n);
    if (!best || d < best.d) best = { c, d };
  }
  return best ? best.c : null;
}

module.exports = { findCue, lqNumber };

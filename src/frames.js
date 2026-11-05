// A spot's color frames keep their numbers when one is removed (Frame 4 removed leaves 1, 2, 3, 5, 6),
// and everywhere they're shown the removed one keeps its place as an empty slot, so a glance shows the gap.
//
// withGaps(slots): the spot's regular (not permanent) frames from Frame 1 to its highest frame, with
// { gap: true, slot_number } standing in for any frame that was removed.

function withGaps(slots) {
  const regular = (slots || []).filter(s => !s.is_permanent).sort((a, b) => a.slot_number - b.slot_number);
  const max = regular.length ? regular[regular.length - 1].slot_number : 0;
  const out = [];
  for (let n = 1; n <= max; n++) out.push(regular.find(s => s.slot_number === n) || { gap: true, slot_number: n, id: 'gap-' + n });
  return out;
}

module.exports = { withGaps };

// Drag-to-reorder lists (scenes, characters, iris sizes, spot order): while dragging, a blue line shows
// exactly where the item will land, above or below the row under the pointer, instead of highlighting
// that row. See DESIGN.md → Reordering.

const LINE = '#0A84FF';

// Where a drop over this row would go: above it (top half) or below it (bottom half)
// (horizontal: items side by side, like Spot Order; left half / right half)
export function dropSlot(e, index, horizontal = false) {
  const r = e.currentTarget.getBoundingClientRect();
  return { index, after: horizontal ? e.clientX > r.left + r.width / 2 : e.clientY > r.top + r.height / 2 };
}

// The position the dragged item ends up at, once it's taken out of the list
export function moveTo(from, slot) {
  let to = slot.after ? slot.index + 1 : slot.index;
  if (from < to) to -= 1;
  return to;
}

// Moves one item of a list to where the slot says; returns a new list
export function moveItem(list, from, slot) {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(moveTo(from, slot), 0, moved);
  return next;
}

// Which edge of this row the line goes on: 'before', 'after', or null (not this row, or nothing would move)
export function dropLineSide(slot, index, from) {
  if (!slot || slot.index !== index || from === null || from === undefined || moveTo(from, slot) === from) return null;
  return slot.after ? 'after' : 'before';
}

// The line on this row, if the drop would land at its top or bottom edge (none where nothing would move)
export function dropLineStyle(slot, index, from, horizontal = false) {
  if (!dropLineSide(slot, index, from)) return {};
  if (horizontal) return { boxShadow: slot.after ? `inset -3px 0 0 ${LINE}` : `inset 3px 0 0 ${LINE}` };
  return { boxShadow: slot.after ? `inset 0 -2px 0 ${LINE}` : `inset 0 2px 0 ${LINE}` };
}

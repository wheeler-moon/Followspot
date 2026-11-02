// Edit → Undo / Redo (⌘Z / ⇧⌘Z) go through the menu (main.js sends 'menu-undo'), so the menu and the keys
// do the same thing. A screen with its own undo (the cue list) registers here; App.jsx calls it unless
// the person is typing in a text box, where the Mac's own text undo runs instead.
let target = null;

const setUndoTarget = (fn) => { target = fn; };
const getUndoTarget = () => target;

// A box the person types in, where ⌘Z should undo their typing
const isTextBox = (el) => !!el && (el.isContentEditable || el.tagName === 'TEXTAREA'
  || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'button', 'submit', 'color', 'file'].includes(el.type)));

module.exports = { setUndoTarget, getUndoTarget, isTextBox };

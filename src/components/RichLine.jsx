import React, { useRef, useEffect } from 'react';
import { safeRich } from '../richText';

const FORMAT_KEYS = { b: 'bold', i: 'italic', u: 'underline' };

// Single-line text field that supports Cmd+B / Cmd+I / Cmd+U on selected words.
// Saves sanitized HTML on blur or Enter.
export default function RichLine({ value, onSave, placeholder, style }) {
  const ref = useRef();

  // Show the saved value, and follow outside changes (undo, Tracked, swap) while not editing
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el) el.innerHTML = safeRich(value);
  }, [value]);

  // The cue cell is draggable, which would stop you dragging to select text; switch it off while pressing in here
  const holdCellDrag = () => {
    const cell = ref.current?.closest('[draggable="true"]');
    if (!cell) return;
    cell.setAttribute('draggable', 'false');
    const restore = () => { cell.setAttribute('draggable', 'true'); document.removeEventListener('mouseup', restore); };
    document.addEventListener('mouseup', restore);
  };

  const save = () => {
    const html = safeRich(ref.current.innerHTML);
    if (!html) ref.current.innerHTML = '';
    if (html !== safeRich(value)) onSave(html);
  };

  return (
    <div ref={ref} contentEditable suppressContentEditableWarning
      className="rich-line" data-placeholder={placeholder}
      onMouseDown={holdCellDrag}
      onBlur={save}
      onInput={() => { if (!ref.current.textContent) ref.current.innerHTML = ''; }}
      onKeyDown={e => {
        if (e.key === 'Enter') { e.preventDefault(); ref.current.blur(); return; }
        const cmd = (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && FORMAT_KEYS[e.key.toLowerCase()];
        if (cmd) { e.preventDefault(); document.execCommand('styleWithCSS', false, false); document.execCommand(cmd); }
      }}
      onPaste={e => {
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain').replace(/\s*\n\s*/g, ' '));
      }}
      style={{ outline: 'none', whiteSpace: 'normal', overflowWrap: 'anywhere', cursor: 'text', minHeight: '1.3em', ...style }} />
  );
}

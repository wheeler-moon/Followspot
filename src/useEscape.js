import { useEffect, useRef } from 'react';

// Escape closes whatever is on top: a menu, pop-up or dialog calls useEscape(close) while it's open.
// They stack, so Escape closes only the newest one (a confirm box above Show Settings closes first,
// then Show Settings). Something that already handled Escape (e.g. the first-run tips, which call
// preventDefault) is left alone.

const stack = [];
let listening = false;

function onKeyDown(e) {
  if (e.key !== 'Escape' || e.defaultPrevented || !stack.length) return;
  e.preventDefault();
  stack[stack.length - 1].current();
}

export default function useEscape(onEscape, active = true) {
  const handler = useRef(onEscape);
  handler.current = onEscape;
  useEffect(() => {
    if (!active) return;
    stack.push(handler);
    if (!listening) { window.addEventListener('keydown', onKeyDown); listening = true; }
    return () => {
      const i = stack.lastIndexOf(handler);
      if (i >= 0) stack.splice(i, 1);
    };
  }, [active]);
}

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getMyName } from '../license';
const { ipcRenderer } = window.require('electron');

// Shown once on a Mac, right after SpotPlot is first activated (LicenseScreen). The activation screen's
// SpotPlot icon grows and moves up while everything else fades away; then "Welcome to SpotPlot" and the
// person's first name are revealed left to right, a beat, and a button fades up to make their first show.
// WELCOMED_KEY remembers it was shown. Reduce Motion shows the end state straight away.
export const WELCOMED_KEY = 'spotplot_welcomed';
export function shouldWelcome() {
  try { return !localStorage.getItem(WELCOMED_KEY); } catch (e) { return false; }
}

const ICON = 168;   // the icon's size once it has landed
const css = `
  .welcome { position: fixed; inset: 0; z-index: 3000; }
  /* Timing (a first impression, so unhurried): icon lands 0–1.6s · title wipes 1.8–3.2s · a beat ·
     name wipes 3.9–5.0s · a beat · button fades up 5.9–6.8s */
  .welcome-icon { position: fixed; border-radius: 22.5%; transition: left 1.6s cubic-bezier(0.2, 0.8, 0.2, 1), top 1.6s cubic-bezier(0.2, 0.8, 0.2, 1),
    width 1.6s cubic-bezier(0.2, 0.8, 0.2, 1), height 1.6s cubic-bezier(0.2, 0.8, 0.2, 1); }
  .welcome-text { position: fixed; left: 0; right: 0; top: calc(50% - 30px); display: flex; flex-direction: column; align-items: center; text-align: center; }
  /* Revealed left to right: the text is there, uncovered by a moving edge */
  .welcome-wipe { clip-path: inset(0 100% 0 0); animation: welcome-wipe 1.4s cubic-bezier(0.55, 0, 0.25, 1) forwards; }
  @keyframes welcome-wipe { to { clip-path: inset(0 0 0 0); } }
  .welcome-title { font-size: 52px; font-weight: 800; letter-spacing: -1.2px; line-height: 1.15; color: #FFFFFF; animation-delay: 1.8s; }
  .welcome-name { font-size: 30px; font-weight: 600; line-height: 1.25; color: rgba(255,255,255,0.78); margin-top: 8px; animation-duration: 1.1s; animation-delay: 3.9s; }
  .welcome-button { margin-top: 40px; height: 36px; padding: 0 22px; border-radius: 18px; border: none; background: #0A84FF; color: #FFFFFF;
    font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit;
    opacity: 0; animation: welcome-rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) 5.9s forwards; }
  @keyframes welcome-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  .welcome-button:hover { background: #409CFF; }
  .welcome-button:focus-visible { outline: 3px solid rgba(10,132,255,0.5); outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) {
    .welcome-icon { transition: none; }
    .welcome-wipe, .welcome-button { animation: none; clip-path: none; opacity: 1; transform: none; }
  }
`;

// from: where the activation screen's icon is ({ left, top, width, height }), so the move starts there
export default function WelcomeScreen({ iconSrc, from, onDone }) {
  const buttonRef = useRef();
  const iconRef = useRef();
  const [landed, setLanded] = useState(false);
  const first = (getMyName() || '').split(' ')[0];
  // Someone activating again on a Mac that already has shows goes to them instead
  const [hasShows] = useState(() => { try { return (ipcRenderer.sendSync('db-get-shows') || []).length > 0; } catch (e) { return false; } });

  // Start exactly where the icon was, then (next frame) move to the landing spot so it animates
  useLayoutEffect(() => {
    void iconRef.current?.offsetWidth;
    const raf = requestAnimationFrame(() => setLanded(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  // Return presses the button once it's there
  useEffect(() => {
    const t = setTimeout(() => buttonRef.current?.focus(), 6000);
    return () => clearTimeout(t);
  }, []);

  const finish = () => {
    try { localStorage.setItem(WELCOMED_KEY, '1'); } catch (e) {}
    onDone(hasShows ? 'home' : 'new-show');
  };

  const at = landed || !from
    ? { left: `calc(50% - ${ICON / 2}px)`, top: `calc(50% - ${ICON + 62}px)`, width: ICON + 'px', height: ICON + 'px' }
    : { left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px' };

  return (
    <div className="welcome" role="dialog" aria-label="Welcome to SpotPlot">
      <style>{css}</style>
      <img ref={iconRef} className="welcome-icon" src={iconSrc} alt="" style={at} />
      <div className="welcome-text">
        <div className="welcome-wipe welcome-title">Welcome to SpotPlot</div>
        {first && <div className="welcome-wipe welcome-name">{first}</div>}
        <button ref={buttonRef} className="welcome-button" onClick={finish}>
          {hasShows ? 'Go to My Shows' : 'Create Your First Show'}
        </button>
      </div>
    </div>
  );
}

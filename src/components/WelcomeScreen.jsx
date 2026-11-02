import React, { useEffect, useRef } from 'react';
import { getMyName } from '../license';
const { ipcRenderer } = window.require('electron');

// Shown once on a Mac, right after SpotPlot is first activated: "Welcome to SpotPlot" and the person's
// first name fade in on a dark screen, then a button to make their first show.
// WELCOMED_KEY remembers it was shown. Motion is skipped when the Mac's Reduce Motion is on.
export const WELCOMED_KEY = 'spotplot_welcomed';
export function shouldWelcome() {
  try { return !localStorage.getItem(WELCOMED_KEY); } catch (e) { return false; }
}

const css = `
  .welcome { position: fixed; inset: 0; z-index: 3000; background: #111112; overflow: hidden;
    display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .welcome-line { position: relative; opacity: 0; animation: welcome-rise 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  @keyframes welcome-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  .welcome-title { font-size: 52px; font-weight: 800; letter-spacing: -1.2px; color: #FFFFFF; animation-delay: 0.3s; }
  .welcome-name { font-size: 30px; font-weight: 600; color: rgba(255,255,255,0.78); margin-top: 10px; animation-delay: 0.9s; }
  .welcome-button { margin-top: 40px; height: 36px; padding: 0 22px; border-radius: 18px; border: none; background: #0A84FF; color: #FFFFFF;
    font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; animation-delay: 1.6s; }
  .welcome-button:hover { background: #409CFF; }
  .welcome-button:focus-visible { outline: 3px solid rgba(10,132,255,0.5); outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) {
    .welcome-line { animation: none; opacity: 1; transform: none; }
  }
`;

export default function WelcomeScreen({ onDone }) {
  const buttonRef = useRef();
  const first = (getMyName() || '').split(' ')[0];
  // Someone activating again on a Mac that already has shows goes to them instead
  const hasShows = (() => { try { return (ipcRenderer.sendSync('db-get-shows') || []).length > 0; } catch (e) { return false; } })();

  const finish = () => {
    try { localStorage.setItem(WELCOMED_KEY, '1'); } catch (e) {}
    onDone(hasShows ? 'home' : 'new-show');
  };

  // Return presses the button once it's there
  useEffect(() => {
    const t = setTimeout(() => buttonRef.current?.focus(), 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="welcome" role="dialog" aria-label="Welcome to SpotPlot">
      <style>{css}</style>
      <div className="window-drag-strip" />
      <div className="welcome-line welcome-title">Welcome to SpotPlot</div>
      {first && <div className="welcome-line welcome-name">{first}</div>}
      <button ref={buttonRef} className="welcome-line welcome-button" onClick={finish}>
        {hasShows ? 'Go to My Shows' : 'Create Your First Show'}
      </button>
    </div>
  );
}

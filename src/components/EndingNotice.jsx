import React, { useState } from 'react';
import { getCachedLicense, lastDayText } from '../license';
const { shell } = window.require('electron');

// A small notice in the bottom-left corner during a license's last week, when it has an end date that
// won't renew (beta, complimentary, a canceled plan): "Your SpotPlot license ends Dec 31." The × hides it
// for the rest of the day. Paid plans that renew never show it.
const HIDDEN_KEY = 'spotplot_ending_notice_hidden';
const today = () => new Date().toLocaleDateString('en-CA');

export default function EndingNotice() {
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(HIDDEN_KEY) === today(); } catch (e) { return false; } });
  const lic = getCachedLicense();
  const end = lic?.ends_at || (!lic?.renews_at && lic?.expires_at);
  if (hidden || !end) return null;
  const msLeft = new Date(end) - Date.now();
  if (msLeft <= 0 || msLeft > 7 * 86400000) return null;
  const day = lastDayText(lic.expires_at || end);
  const beta = day === 'Dec 31, 2026' && ['beta', 'comped'].includes(lic.plan);
  const hide = () => { try { localStorage.setItem(HIDDEN_KEY, today()); } catch (e) {} setHidden(true); };

  return (
    <div role="status" style={{ position: 'fixed', left: '16px', bottom: '16px', zIndex: 2500, display: 'flex', alignItems: 'center', gap: '10px',
      background: '#2A2A2A', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px', padding: '10px 10px 10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.40)', maxWidth: '420px' }}>
      <span aria-hidden="true" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF9F0A', flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: '#FFFFFF', lineHeight: '17px' }}>
        {beta ? `The SpotPlot beta ends ${day}. Thank you for testing!` : `Your SpotPlot license ends ${day}.`}
      </span>
      <button onClick={() => shell.openExternal('https://spotplotapp.com')}
        style={{ height: '24px', padding: '0 10px', background: '#0A84FF', border: 'none', borderRadius: '6px', color: '#FFFFFF', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
        Get SpotPlot
      </button>
      <button onClick={hide} title="Hide for today" aria-label="Hide for today"
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '16px', lineHeight: 1, cursor: 'pointer', padding: '0 2px' }}>×</button>
    </div>
  );
}

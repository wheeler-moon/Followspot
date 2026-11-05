import UpdateNotice from './components/UpdateNotice';
import EndingNotice from './components/EndingNotice';
import React, { useState, useEffect } from 'react';
import HomeScreen from './screens/HomeScreen';
import NewShowScreen from './screens/NewShowScreen';
import ShowDashboard from './screens/ShowDashboard';
import CueListScreen from './screens/CueListScreen';
import PrintScreen from './screens/PrintScreen';
import ScenesScreen from './screens/ScenesScreen';
import CharactersScreen from './screens/CharactersScreen';
import SpotNotesScreen from './screens/SpotNotesScreen';
import LicenseScreen from './screens/LicenseScreen';
import ExpiredScreen from './screens/ExpiredScreen';
import { getCachedLicense, isCacheValid, validateLicense, setCachedLicense, isPastEnd, lastDayText } from './license';
import { resetTips } from './components/Tips';
import { getUndoTarget, isTextBox } from './undoTarget';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [currentShow, setCurrentShow] = useState(null);
  const [licenseStatus, setLicenseStatus] = useState('checking');
  const [ended, setEnded] = useState(null);   // why the license stopped (the server's answer), for the ended screen

  useEffect(() => {
    checkLicense();
  }, []);

  const checkLicense = async () => {
    const cached = getCachedLicense();
    
    if (isCacheValid(cached)) {
      setLicenseStatus('valid');
      validateInBackground(cached.license_key);
      return;
    }

    if (cached && cached.license_key) {
      const result = await validateLicense(cached.license_key);
      if (result && result.valid) {
        setCachedLicense({ ...cached, ...result, valid: true, cached_at: new Date().toISOString() });
        setLicenseStatus('valid');
        return;
      } else if (result && !result.valid) {
        markInvalid(cached, result);
        return;
      } else {
        if (cached.valid && !isPastEnd(cached)) {
          setLicenseStatus('valid');
          return;
        }
        if (cached.valid) { markInvalid(cached, { code: 'expired', plan: cached.plan, expires_at: cached.expires_at }); return; }
      }
    }

    setLicenseStatus('unlicensed');
  };

  // The server said no: expired, revoked, or this Mac would be a 3rd device on the license
  const markInvalid = (cached, result) => {
    setCachedLicense({ ...cached, valid: false });
    setEnded(result);
    setLicenseStatus(result.code === 'device_limit' ? 'device_limit' : 'expired');
  };

  const validateInBackground = async (licenseKey) => {
    const result = await validateLicense(licenseKey);
    if (result && !result.valid) {
      markInvalid(getCachedLicense(), result);
    } else if (result && result.valid) {
      // Keep the account details (plan, renewal date…) current for Settings
      const cached = getCachedLicense();
      setCachedLicense({ ...cached, ...result, valid: true, cached_at: new Date().toISOString() });
    }
  };

  // While SpotPlot is open, check in every 15 minutes so the license admin can see this Mac is in use
  useEffect(() => {
    if (licenseStatus !== 'valid') return;
    const timer = setInterval(() => {
      const cached = getCachedLicense();
      if (cached && cached.license_key) validateInBackground(cached.license_key);
      // Past its end date with no answer from the server (offline): it ends here too
      if (cached && isPastEnd(cached)) markInvalid(cached, { code: 'expired', plan: cached.plan, expires_at: cached.expires_at });
    }, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [licenseStatus]);

  // Help > Show Tips Again: forget which tips were seen so each screen shows its tips again
  useEffect(() => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.on('menu-show-tips', resetTips);
    return () => ipcRenderer.removeListener('menu-show-tips', resetTips);
  }, []);

  // Edit → Undo / Redo (⌘Z / ⇧⌘Z): typing in a box undoes the typing; otherwise the screen's own undo
  // (the cue list), if it has one (src/undoTarget.js)
  useEffect(() => {
    const { ipcRenderer } = window.require('electron');
    const onUndo = (e, what) => {
      const target = getUndoTarget();
      // In an empty box there's no typing to undo, so ⌘Z undoes the screen's last step
      // (e.g. right after adding a scene, when the cursor is back in the empty name box)
      const el = document.activeElement;
      const emptyBox = isTextBox(el) && !el.isContentEditable && !el.value;
      if (target && (!isTextBox(el) || emptyBox)) target(what);
      else ipcRenderer.send('native-edit', what);
    };
    ipcRenderer.on('menu-undo', onUndo);
    return () => ipcRenderer.removeListener('menu-undo', onUndo);
  }, []);

  // View → Ask About New Characters Again: forget this show's remembered "Add to Characters?" answer
  useEffect(() => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send('show-open', !!currentShow);
    if (!currentShow) return;
    const reset = () => ipcRenderer.sendSync('db-update-show', { showId: currentShow.id, new_character_choice: null });
    ipcRenderer.on('menu-reset-character-choice', reset);
    return () => ipcRenderer.removeListener('menu-reset-character-choice', reset);
  }, [currentShow]);

  // File → Print… (⌘P) from anywhere in a show opens the Print screen (it opens Print Setup itself when already there)
  useEffect(() => {
    const { ipcRenderer } = window.require('electron');
    const onPrint = () => { if (screen !== 'print' && currentShow) navigate('print', currentShow); };
    ipcRenderer.on('menu-print', onPrint);
    return () => ipcRenderer.removeListener('menu-print', onPrint);
  }, [screen, currentShow]);

  const navigate = (dest, data) => {
    setCurrentShow(data || null);
    setScreen(dest);
  };
  const dragStrip = <div className="window-drag-strip" />;
  if (licenseStatus === 'checking') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1E1E1E', color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
        {dragStrip}Loading SpotPlot...
      </div>
    );
  }

  if (licenseStatus === 'unlicensed') {
    // The very first activation on this Mac ends with the welcome (in LicenseScreen), whose button says where to go
    return <>{dragStrip}<LicenseScreen onActivated={(dest) => { if (dest) setScreen(dest); setLicenseStatus('valid'); }} /></>;
  }

  if (licenseStatus === 'device_limit') {
    return <>{dragStrip}<ExpiredScreen
      title="License in use on 2 Macs"
      message="This SpotPlot license is already active on 2 other Macs, which is the limit. A Mac that hasn't opened SpotPlot for 30 days frees its spot automatically. Otherwise, contact support to free a slot, or use a different license."
      onRetry={checkLicense}
      onNewLicense={() => {
        localStorage.removeItem('spotplot_license');
        setLicenseStatus('unlicensed');
      }}
    /></>;
  }

  if (licenseStatus === 'expired') {
    const lastDay = lastDayText(ended?.expires_at);
    const free = ['beta', 'comped'].includes(ended?.plan);
    const words = ended?.code === 'revoked'
      ? { title: 'License turned off', message: 'This SpotPlot license has been turned off. Your shows are safe on this Mac. If you think this is a mistake, contact support at spotplotapp.com.' }
      : lastDay === 'Dec 31, 2026' && free
        ? { title: 'The SpotPlot beta has ended', message: 'Thank you for testing SpotPlot! Beta licenses ended on Dec 31, 2026. Your shows are safe on this Mac: get SpotPlot at spotplotapp.com to keep working on them.' }
        : { title: free ? 'Your SpotPlot license has ended' : 'Subscription ended',
            message: `${free ? 'Your free SpotPlot license' : 'Your SpotPlot subscription'} ended${lastDay ? ' on ' + lastDay : ''}. Your shows are safe on this Mac: get SpotPlot at spotplotapp.com to keep working on them.` };
    return <>{dragStrip}<ExpiredScreen
      {...words}
      onGetSpotPlot={() => window.require('electron').shell.openExternal('https://spotplotapp.com')}
      onRetry={checkLicense} 
      onNewLicense={() => {
        localStorage.removeItem('spotplot_license');
        setLicenseStatus('unlicensed');
      }}
    /></>;
  }

  return (
    <div style={{ height: '100vh', background: '#1E1E1E', color: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
      {screen === 'home' && <HomeScreen navigate={navigate} />}
      {screen === 'new-show' && <NewShowScreen navigate={navigate} />}
      {screen === 'show' && <ShowDashboard show={currentShow} navigate={navigate} />}
      {screen === 'cue-list' && <CueListScreen show={currentShow} navigate={navigate} />}
      {screen === 'print' && <PrintScreen show={currentShow} navigate={navigate} />}
      {screen === 'scenes' && <ScenesScreen show={currentShow} navigate={navigate} />}
      {screen === 'characters' && <CharactersScreen show={currentShow} navigate={navigate} />}
      {screen === 'spot-notes' && <SpotNotesScreen show={currentShow} navigate={navigate} />}
      <UpdateNotice />
      <EndingNotice />
    </div>
  );
}
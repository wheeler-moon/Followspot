// App updates (update.electronjs.org, from the GitHub releases of wheeler-moon/Followspot).
// Settings → Updates shows what's happening and lets people turn automatic checks off (kept per Mac in
// userData/settings.json). While an update downloads, and once it's ready, a small notice shows in the
// corner of every screen (src/components/UpdateNotice.jsx). SpotPlot → Check for Updates… always answers:
// up to date, downloading, ready, or couldn't check.
const { autoUpdater, ipcMain, dialog, net } = require('electron');
const path = require('path');
const fs = require('fs');

const RECHECK_HOURS = 4;

function initUpdates({ app, getWindow }) {
  const settingsFile = path.join(app.getPath('userData'), 'settings.json');
  const readSettings = () => { try { return JSON.parse(fs.readFileSync(settingsFile, 'utf8')); } catch (e) { return {}; } };
  const writeSettings = (patch) => { try { fs.writeFileSync(settingsFile, JSON.stringify({ ...readSettings(), ...patch }, null, 2)); } catch (e) {} };

  // state: idle | checking | downloading | up-to-date | ready | error | dev
  const status = {
    auto: readSettings().autoUpdate !== false,
    state: app.isPackaged ? 'idle' : 'dev',
    lastChecked: readSettings().lastUpdateCheck || null,
    version: null,
    error: null,
  };
  const publish = (patch) => {
    Object.assign(status, patch);
    const win = getWindow();
    if (win && !win.isDestroyed()) win.webContents.send('updates-status', status);
  };

  // A check from the menu says what it found, even "you're up to date"; automatic checks stay quiet
  let manual = false;
  const box = (opts) => { const win = getWindow(); return win && !win.isDestroyed() ? dialog.showMessageBox(win, opts) : dialog.showMessageBox(opts); };
  const tell = (message, detail) => box({ type: 'info', message, detail, buttons: ['OK'] });
  const askInstall = () => box({
    type: 'info',
    message: `SpotPlot ${status.version || ''} is ready to install.`.replace('  ', ' '),
    detail: 'SpotPlot will quit, update and open again.',
    buttons: ['Install Now', 'Later'],
    defaultId: 0,
  }).then(({ response }) => { if (response === 0) autoUpdater.quitAndInstall(); });

  const check = ({ fromMenu = false } = {}) => {
    if (!app.isPackaged) {
      publish({ state: 'dev' });
      if (fromMenu) tell('Updates work in the installed SpotPlot.', 'This copy is running from the project, so it doesn\'t check for updates.');
      return;
    }
    if (fromMenu && status.state === 'downloading') { tell(`Downloading ${status.version ? 'SpotPlot ' + status.version : 'an update'}…`, 'SpotPlot will ask you to install it when it\'s ready.'); return; }
    if (fromMenu && status.state === 'ready') { askInstall(); return; }
    if (status.state === 'checking') { if (fromMenu) manual = true; return; }
    if (status.state === 'downloading' || status.state === 'ready') return;
    manual = fromMenu;
    const now = new Date().toISOString();
    writeSettings({ lastUpdateCheck: now });
    publish({ state: 'checking', lastChecked: now, error: null });
    try { autoUpdater.checkForUpdates(); } catch (e) { publish({ state: 'error', error: e.message }); }
  };

  ipcMain.on('updates-get', (event) => { event.returnValue = status; });
  ipcMain.on('updates-check-now', () => check());
  ipcMain.on('updates-install-prompt', () => { if (status.state === 'ready') askInstall(); });
  ipcMain.on('updates-set-auto', (event, on) => {
    writeSettings({ autoUpdate: !!on });
    publish({ auto: !!on });
    event.returnValue = status;
  });
  ipcMain.on('updates-install', () => { if (status.state === 'ready') autoUpdater.quitAndInstall(); });

  if (!app.isPackaged) return { check };

  autoUpdater.setFeedURL({
    url: `https://update.electronjs.org/wheeler-moon/Followspot/${process.platform}/${app.getVersion()}`,
  });
  // Squirrel doesn't say which version it's downloading; the update server's answer does ({ name, notes, url })
  const fetchVersion = async () => {
    try {
      const res = await net.fetch(`https://update.electronjs.org/wheeler-moon/Followspot/${process.platform}/${app.getVersion()}`);
      if (res.status !== 200) return null;
      const name = String((await res.json()).name || '');
      return (name.match(/\d+\.\d+\.\d+/) || [null])[0];
    } catch (e) { return null; }
  };
  autoUpdater.on('update-available', () => {
    publish({ state: 'downloading', version: null });
    fetchVersion().then(v => { if (v && status.state === 'downloading') publish({ version: v }); });
    if (manual) { manual = false; tell('An update is available.', 'SpotPlot is downloading it now and will ask you to install it when it\'s ready.'); }
  });
  autoUpdater.on('update-not-available', () => {
    publish({ state: 'up-to-date' });
    if (manual) { manual = false; tell('You\'re up to date.', `SpotPlot ${app.getVersion()} is the newest version.`); }
  });
  autoUpdater.on('error', (err) => {
    console.error('Updater error:', err);
    publish({ state: 'error', error: err?.message || String(err) });
    if (manual) { manual = false; tell('Couldn\'t check for updates.', 'Check your internet connection and try again.'); }
  });
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const v = (String(releaseName || '').match(/\d+\.\d+\.\d+/) || [null])[0] || status.version;
    publish({ state: 'ready', version: v });
    askInstall();
  });

  // First check shortly after opening, then every few hours while the app stays open
  setTimeout(() => { if (status.auto) check(); }, 10000);
  setInterval(() => { if (status.auto) check(); }, RECHECK_HOURS * 60 * 60 * 1000);

  return { check };
}

module.exports = { initUpdates };

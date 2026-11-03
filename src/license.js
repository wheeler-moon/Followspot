const { ipcRenderer } = window.require('electron');

const LICENSE_CACHE_KEY = 'spotplot_license';
const SERVER_URL = 'https://spotplot-server.onrender.com';

export function getCachedLicense() {
  try {
    const cached = localStorage.getItem(LICENSE_CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch(e) { return null; }
}

// Screens showing account details (the Home screen's name) listen for this to refresh
export const ACCOUNT_CHANGED_EVENT = 'spotplot-account-changed';

export function setCachedLicense(data) {
  try {
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({
      ...data,
      cached_at: new Date().toISOString(),
    }));
  } catch(e) {}
  window.dispatchEvent(new Event(ACCOUNT_CHANGED_EVENT));
}

// A license with an end date (beta, complimentary, a canceled plan) stops at that moment, even when this Mac
// can't reach the server. After a failed renewal payment it keeps working PAYMENT_GRACE_HOURS longer.
const PAYMENT_GRACE_HOURS = 24;
export function isPastEnd(cached) {
  if (!cached?.expires_at) return false;
  return Date.now() >= new Date(cached.expires_at).getTime() + (cached.payment_failed ? PAYMENT_GRACE_HOURS * 3600000 : 0);
}

// The last day a license works, e.g. "Dec 31, 2026" (end dates are whole days, New York time)
export function lastDayText(expiresAt) {
  if (!expiresAt) return '';
  return new Date(new Date(expiresAt).getTime() - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
}

export function isCacheValid(cached) {
  if (!cached) return false;
  if (isPastEnd(cached)) return false;
  const cachedAt = new Date(cached.cached_at);
  const now = new Date();
  const daysSinceCached = (now - cachedAt) / (1000 * 60 * 60 * 24);
  if (daysSinceCached > 7) return false;
  return cached.valid === true;
}

// This Mac's anonymous ID and SpotPlot version, sent with every license check (2-Mac limit)
let deviceInfo = null;
function device() {
  if (!deviceInfo) {
    const info = ipcRenderer.sendSync('get-device-info');
    deviceInfo = { device_id: info.deviceId, app_version: info.appVersion };
  }
  return deviceInfo;
}

// The person's name (Home screen, Settings → Account). Kept in the license cache; a name typed on this
// Mac waits in NAME_PENDING_KEY until the license server has it (sent with the next check).
const NAME_PENDING_KEY = 'spotplot_name_pending';
export function getMyName() {
  try { return localStorage.getItem(NAME_PENDING_KEY) || getCachedLicense()?.name || ''; } catch (e) { return ''; }
}
export function setMyName(name) {
  const clean = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  if (!clean) return '';
  try {
    localStorage.setItem(NAME_PENDING_KEY, clean);
    const cached = getCachedLicense();
    if (cached) localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({ ...cached, name: clean }));
  } catch (e) {}
  window.dispatchEvent(new Event(ACCOUNT_CHANGED_EVENT));
  if (getCachedLicense()?.license_key) validateLicense(getCachedLicense().license_key);   // tell the server now if it's reachable
  return clean;
}

export async function validateLicense(licenseKey) {
  try {
    const pending = (() => { try { return localStorage.getItem(NAME_PENDING_KEY); } catch (e) { return null; } })();
    const response = await fetch(SERVER_URL + '/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey, ...device(), ...(pending ? { name: pending } : {}) }),
    });
    const result = await response.json();
    // The server has the new name now (an older server ignores it: keep showing ours)
    if (pending && result?.valid) { try { if (result.name === pending) localStorage.removeItem(NAME_PENDING_KEY); } catch (e) {} }
    if (result?.valid && !result.name && pending) result.name = pending;
    return result;
  } catch(e) {
    console.error('Validation error:', e);
    return null;
  }
}

export async function activateLicense(licenseKey, email, name) {
  try {
    const response = await fetch(SERVER_URL + '/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey, email, ...(name ? { name } : {}), ...device() }),
    });
    const data = await response.json();
    return data;
  } catch(e) {
    return null;
  }
}
// Settings → Sign Out: takes this Mac off the license on the server, so its slot is
// free for another Mac. Returns true only when the server confirmed it.
export async function deactivateLicense(licenseKey) {
  try {
    const response = await fetch(SERVER_URL + '/deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey, device_id: device().device_id }),
    });
    const data = await response.json();
    return !!data?.success;
  } catch(e) {
    return false;
  }
}

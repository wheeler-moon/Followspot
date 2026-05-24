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

export function setCachedLicense(data) {
  try {
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify({
      ...data,
      cached_at: new Date().toISOString(),
    }));
  } catch(e) {}
}

export function isCacheValid(cached) {
  if (!cached) return false;
  const cachedAt = new Date(cached.cached_at);
  const now = new Date();
  const daysSinceCached = (now - cachedAt) / (1000 * 60 * 60 * 24);
  if (daysSinceCached > 7) return false;
  return cached.valid === true;
}

export async function validateLicense(licenseKey) {
  try {
    console.log('Validating license:', licenseKey);
    const response = await fetch('https://spotplot-server.onrender.com/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey }),
    });
    const data = await response.json();
    console.log('Validation result:', data);
    return data;
  } catch(e) {
    console.error('Validation error:', e);
    return null;
  }
}

export async function activateLicense(licenseKey, email) {
  try {
    const response = await fetch(SERVER_URL + '/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey, email }),
    });
    const data = await response.json();
    return data;
  } catch(e) {
    return null;
  }
}
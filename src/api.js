import { storage } from './utils/storage';

const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || '/api';

const isCapacitor = window.location.protocol === 'capacitor:';

export const getApiBase = () => {
  let base = storage.get('hub_api_base_url');

  if (!base) {
    base = DEFAULT_API_BASE;
  }

  if (isCapacitor && (base === '/api' || !base.startsWith('http'))) {
    console.warn("Running in Capacitor with relative API path. External backend may be unreachable.");
    // If we're in Capacitor and base is relative, and we have a VITE_API_URL, use it as a secondary fallback
    if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('http')) {
       return import.meta.env.VITE_API_URL;
    }
  }
  return base;
};

export const setApiBase = (url) => {
  if (url) {
    storage.set('hub_api_base_url', url);
  } else {
    storage.remove('hub_api_base_url');
  }
};

export const getUrl = (path) => {
  if (path.startsWith('http')) return path;

  const base = getApiBase();

  // If base is a full URL, handle it
  if (base.startsWith('http')) {
    if (path.startsWith('/api')) {
      return base + path.substring(4);
    }
    return base + path;
  }

  // Standard relative handling
  if (path.startsWith('/api')) {
    return path.replace('/api', base);
  }
  return path;
};

const API_BASE = getApiBase();
export default API_BASE;

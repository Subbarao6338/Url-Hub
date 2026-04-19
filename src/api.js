const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || '/api';

const isCapacitor = window.location.protocol === 'capacitor:';

export const getApiBase = () => {
  const base = localStorage.getItem('hub_api_base_url') || DEFAULT_API_BASE;
  if (isCapacitor && (base === '/api' || !base.startsWith('http'))) {
    console.warn("Running in Capacitor with relative API path. External backend may be unreachable.");
  }
  return base;
};

export const setApiBase = (url) => {
  if (url) {
    localStorage.setItem('hub_api_base_url', url);
  } else {
    localStorage.removeItem('hub_api_base_url');
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

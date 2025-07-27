let base = process.env.REACT_APP_API_URL;

if (!base && typeof window !== 'undefined') {
  base = window.location.port === '3000'
    ? 'http://localhost:8080'
    : window.location.origin;
}

export const API_BASE = base || 'http://localhost:8080';

const { getToken, getApiUrl } = require('./config');

async function request(path, options = {}) {
  const token = options.token || getToken();
  const baseUrl = options.apiUrl || getApiUrl();

  if (!token && options.requireAuth !== false) {
    throw Object.assign(new Error('Not authenticated. Run: cli.js login'), { status: 401 });
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/vibe${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

module.exports = { request };

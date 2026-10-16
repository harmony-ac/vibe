const { request } = require('../api');
const { saveToken, getApiUrl, parseArgs } = require('../config');
const { openBrowser } = require('../open-browser');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async function login(args) {
  const parsed = parseArgs(args);
  const baseUrl = parsed.apiUrl || getApiUrl();

  console.log('Requesting device code...');

  const deviceResponse = await request('/auth/device', {
    method: 'POST',
    body: JSON.stringify({ client_id: 'harmony-cli' }),
    requireAuth: false,
    apiUrl: baseUrl,
  });

  const { device_code, user_code, verification_uri, expires_in, interval } = deviceResponse;
  const fullUrl = `${verification_uri}?code=${user_code}`;

  console.log('');
  console.log('Please authenticate at:');
  console.log(fullUrl);
  console.log('');
  console.log('User code:', user_code);
  console.log('');

  try {
    openBrowser(fullUrl);
    console.log('Browser opened automatically.');
  } catch {
    console.log('Could not open browser. Please open the URL manually.');
  }

  console.log('Waiting for authentication...');

  const startTime = Date.now();
  const expiresMs = (expires_in || 600) * 1000;
  const pollInterval = (interval || 5) * 1000;

  while (Date.now() - startTime < expiresMs) {
    await sleep(pollInterval);

    try {
      const tokenResponse = await request('/auth/token', {
        method: 'POST',
        body: JSON.stringify({ device_code }),
        requireAuth: false,
        apiUrl: baseUrl,
      });

      if (tokenResponse.access_token) {
        saveToken(tokenResponse.access_token);
        console.log('');
        console.log('Authenticated successfully!');
        return;
      }
    } catch (err) {
      if (err.data?.error === 'authorization_pending') {
        process.stdout.write('.');
        continue;
      }
      throw err;
    }
  }

  throw new Error('Authentication timed out. Please try again.');
};

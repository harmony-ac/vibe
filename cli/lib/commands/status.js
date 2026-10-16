const { request } = require('../api');

module.exports = async function status() {
  const health = await request('/health', { requireAuth: false });
  console.log('Server status:', health.status);
  console.log('Version:', health.version);

  try {
    await request('/health', { requireAuth: true });
    console.log('Authentication: valid');
  } catch (err) {
    if (err.status === 401) {
      console.log('Authentication: invalid or expired');
      console.log('Run: cli.js login');
    } else {
      throw err;
    }
  }
};

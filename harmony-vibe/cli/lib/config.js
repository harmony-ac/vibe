const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.harmony');
const TOKEN_FILE = path.join(CONFIG_DIR, 'token');

function getToken() {
  try {
    return fs.readFileSync(TOKEN_FILE, 'utf8').trim();
  } catch {
    return null;
  }
}

function saveToken(token) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
}

function getApiUrl() {
  return process.env.HARMONY_API_URL || 'https://cloud.harmony.ac';
}

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--api-url' && i + 1 < args.length) parsed.apiUrl = args[++i];
    else if (arg === '--token' && i + 1 < args.length) parsed.token = args[++i];
    else if (arg === '--file' && i + 1 < args.length) parsed.file = args[++i];
    else if (arg === '--out' && i + 1 < args.length) parsed.out = args[++i];
    else if (arg === '--feature-id' && i + 1 < args.length) parsed.featureId = args[++i];
  }
  return parsed;
}

module.exports = {
  getToken,
  saveToken,
  getApiUrl,
  parseArgs,
};

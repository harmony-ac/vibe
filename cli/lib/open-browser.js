const { spawn } = require('child_process');
const process = require('process');

function openBrowser(url) {
  const platform = process.platform;
  const cmd = platform === 'darwin' ? 'open' :
              platform === 'win32' ? 'start' :
              'xdg-open';

  const child = spawn(cmd, [url], {
    detached: true,
    stdio: 'ignore',
  });

  child.unref();
}

module.exports = { openBrowser };

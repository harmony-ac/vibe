#!/usr/bin/env node

const commands = {
  login: require('./lib/commands/login'),
  status: require('./lib/commands/status'),
  analyze: require('./lib/commands/analyze'),
  'test-design': require('./lib/commands/test-design'),
};

async function main() {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);

  if (!cmd || cmd === '--help' || cmd === '-h') {
    console.log('Usage: cli.js <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  login         Authenticate with Harmony (device-code flow)');
    console.log('  status        Check server health and token validity');
    console.log('  analyze       Analyze requirements for anomalies');
    console.log('  test-design   Generate test design from requirements');
    console.log('');
    console.log('Options:');
    console.log('  --api-url <url>    Override API base URL');
    console.log('  --token <token>    Override auth token');
    console.log('  --file <path>      Path to requirements Markdown file');
    console.log('  --out <path>       Write output to file instead of stdout');
    console.log('  --feature-id <id>  Stable feature identifier');
    console.log('');
    console.log('Environment variables:');
    console.log('  HARMONY_API_URL    Default API base URL');
    process.exit(0);
  }

  const handler = commands[cmd];
  if (!handler) {
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
  }

  try {
    await handler(args);
  } catch (err) {
    if (err.status || err.data) {
      console.error(`Error (${err.status || 'unknown'}): ${err.message}`);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

main();

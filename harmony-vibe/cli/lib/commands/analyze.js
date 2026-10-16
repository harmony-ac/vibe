const fs = require('fs');
const { request } = require('../api');
const { parseArgs } = require('../config');

module.exports = async function analyze(args) {
  const parsed = parseArgs(args);

  if (!parsed.file) {
    throw new Error('Usage: cli.js analyze --file <path> [--out <path>] [--feature-id <id>]');
  }

  const requirements = fs.readFileSync(parsed.file, 'utf8');

  const result = await request('/analyze', {
    method: 'POST',
    body: JSON.stringify({
      requirements,
      feature_id: parsed.featureId || undefined,
    }),
  });

  const output = JSON.stringify(result, null, 2);

  if (parsed.out) {
    fs.writeFileSync(parsed.out, output);
    console.log(`Analysis written to ${parsed.out}`);
  } else {
    console.log(output);
  }
};

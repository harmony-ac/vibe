const fs = require('fs');
const { request } = require('../api');
const { parseArgs } = require('../config');

module.exports = async function testDesign(args) {
  const parsed = parseArgs(args);

  if (!parsed.file) {
    throw new Error('Usage: cli.js test-design --file <path> [--out <path>] [--feature-id <id>]');
  }

  const requirements = fs.readFileSync(parsed.file, 'utf8');

  const result = await request('/test-design', {
    method: 'POST',
    body: JSON.stringify({
      requirements,
      feature_id: parsed.featureId || undefined,
    }),
  });

  const output = result.test_design;

  if (parsed.out) {
    fs.writeFileSync(parsed.out, output);
    console.log(`Test design written to ${parsed.out}`);
  } else {
    console.log(output);
  }
};

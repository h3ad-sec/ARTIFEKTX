const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, 'data/artifacts');
const OUTPUT = path.join(__dirname, 'data/artifacts-manifest.json');

const GROUPS = ['registry', 'execution', 'user-activity', 'filesystem', 'eventlogs', 'persistence', 'browser'];
const artifacts = [];

for (const group of GROUPS) {
  const groupDir = path.join(ARTIFACTS_DIR, group);
  if (!fs.existsSync(groupDir)) continue;

  const files = fs.readdirSync(groupDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(groupDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const artifact = JSON.parse(content);
    artifact.group = group;
    artifact.file = `data/artifacts/${group}/${file}`;
    artifacts.push(artifact);
  }
}

const manifest = {
  generated: new Date().toISOString(),
  count: artifacts.length,
  artifacts
};

fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
console.log(`Generated artifacts-manifest.json — ${artifacts.length} artifacts across ${GROUPS.length} groups.`);

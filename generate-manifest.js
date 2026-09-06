const fs = require('fs');
const path = require('path');

// Each OS defines its own category set. Windows uses the SANS FOR500 poster's
// own section titles (Application Execution, File and Folder Opening, etc.)
// plus a few of this project's own (Registry Hives, Event Logs, Persistence,
// Memory Forensics, Communication, Filesystem Artifacts). Linux/macOS/Mobile
// will define their own categories entirely once populated; don't reuse this
// list for them, and don't algorithmically title-case their folder names
// either, just add them to a similar explicit map once real titles exist.
const CATEGORY_TITLES = {
  windows: {
    'registry-hives': 'Registry Hives',
    'application-execution': 'Application Execution',
    'file-and-folder-opening': 'File and Folder Opening',
    'deleted-items-and-file-existence': 'Deleted Items and File Existence',
    'browser-activity': 'Browser Activity',
    'cloud-storage': 'Cloud Storage',
    'external-device-usb-usage': 'External Device/USB Usage',
    'system-information': 'System Information',
    'account-usage': 'Account Usage',
    'network-activity': 'Network Activity and Physical Location',
    'eventlogs': 'Event Logs',
    'persistence': 'Persistence',
    'memory': 'Memory Forensics',
    'communication': 'Communication',
    'filesystem': 'Filesystem Artifacts'
  },
  linux: {},
  macos: {},
  mobile: {}
};

const OS_DISPLAY_NAME = { windows: 'Windows', linux: 'Linux', macos: 'macOS', mobile: 'Mobile' };

const ARTIFACTS_DIR = path.join(__dirname, 'data/artifacts');
const OUT_DIR = path.join(__dirname, 'data/os');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

for (const osName of Object.keys(CATEGORY_TITLES)) {
  const osDir = path.join(ARTIFACTS_DIR, osName);
  const categories = {};
  let count = 0;

  if (fs.existsSync(osDir)) {
    const categoryDirs = fs.readdirSync(osDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort();

    for (const categoryDir of categoryDirs) {
      const dirPath = path.join(osDir, categoryDir);
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
      if (!files.length) continue;
      const items = files.map(file => JSON.parse(fs.readFileSync(path.join(dirPath, file), 'utf8')));
      const title = CATEGORY_TITLES[osName][categoryDir] || categoryDir;
      categories[title] = items;
      count += items.length;
    }
  }

  const manifest = { os: OS_DISPLAY_NAME[osName], generated: new Date().toISOString(), count, categories };
  fs.writeFileSync(path.join(OUT_DIR, `${osName}.json`), JSON.stringify(manifest, null, 2));
  console.log(`Generated data/os/${osName}.json — ${count} artifacts across ${Object.keys(categories).length} categories.`);
}

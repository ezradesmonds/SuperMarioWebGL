// Snapshot the current website without modifying its source or animation functions.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const target = path.resolve(__dirname, '../public/world');
for (const dir of ['js', 'characters']) {
  fs.mkdirSync(path.join(target, dir), {recursive: true});
  for (const name of fs.readdirSync(path.join(root, dir))) {
    if (name.endsWith('.js') && !name.startsWith('trailer')) {
      fs.copyFileSync(path.join(root, dir, name), path.join(target, dir, name));
    }
  }
}
console.log('Website models, environment and animations synchronized.');

#!/usr/bin/env node
/**
 * scaffold.js
 *
 * Creates a new project folder from /templates/PROJECT_TEMPLATE.
 *
 * Usage:
 *   node scripts/scaffold.js --name "My Project Name" [--dest scratch|projects]
 *
 * Options:
 *   --name   Required. Human-readable project name. Will be slugified for the folder.
 *   --dest   Optional. Target directory: 'scratch' (default) or 'projects'.
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const name = get('--name');
const dest = get('--dest') || 'scratch';

if (!name) {
  console.error('Error: --name is required');
  console.error('Usage: node scripts/scaffold.js --name "My Project Name" [--dest scratch|projects]');
  process.exit(1);
}

if (!['scratch', 'projects'].includes(dest)) {
  console.error('Error: --dest must be "scratch" or "projects"');
  process.exit(1);
}

const slug = name
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-');

const root = path.resolve(__dirname, '..');
const templateDir = path.join(root, 'templates', 'PROJECT_TEMPLATE');
const destDir = path.join(root, dest, slug);

if (!fs.existsSync(templateDir)) {
  console.error(`Error: Template not found at ${templateDir}`);
  process.exit(1);
}

if (fs.existsSync(destDir)) {
  console.error(`Error: Destination already exists: ${destDir}`);
  process.exit(1);
}

const today = new Date().toISOString().split('T')[0];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, 'utf8');
      // Replace placeholders
      content = content
        .replace(/\[Project Name\]/g, name)
        .replace(/"Project Name"/g, `"${name}"`)
        .replace(/"project-name"/g, `"${slug}"`)
        .replace(/YYYY-MM-DD/g, today);
      fs.writeFileSync(destPath, content, 'utf8');
    }
  }
}

copyDir(templateDir, destDir);

console.log(`\nScaffolded: ${dest}/${slug}`);
console.log(`\nNext steps:`);
console.log(`  1. Edit ${dest}/${slug}/README.md`);
console.log(`  2. Fill in ${dest}/${slug}/manifest.json`);
console.log(`  3. Add your first decision to ${dest}/${slug}/decision-log.md`);
if (dest === 'scratch') {
  console.log(`\nWhen it's ready, move it to /projects and update manifest.json status to "prototype".`);
}

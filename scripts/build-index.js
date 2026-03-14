#!/usr/bin/env node
/**
 * build-index.js
 *
 * Reads all manifest.json files in /projects and generates:
 *   - projects/index.json   — machine-readable project index
 *
 * Usage:
 *   node scripts/build-index.js
 *
 * Add this to a pre-commit hook or CI step to keep the index current.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const projectsDir = path.join(root, 'projects');
const outputPath = path.join(projectsDir, 'index.json');

if (!fs.existsSync(projectsDir)) {
  console.log('No /projects directory. Nothing to index.');
  process.exit(0);
}

const projects = fs.readdirSync(projectsDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name);

const index = [];

for (const slug of projects) {
  const manifestPath = path.join(projectsDir, slug, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.warn(`Skipping ${slug}: no manifest.json`);
    continue;
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    index.push(manifest);
  } catch (e) {
    console.warn(`Skipping ${slug}: invalid JSON — ${e.message}`);
  }
}

// Sort by created date descending (newest first)
index.sort((a, b) => (b.created || '').localeCompare(a.created || ''));

fs.writeFileSync(outputPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log(`Index written: projects/index.json (${index.length} project${index.length !== 1 ? 's' : ''})`);

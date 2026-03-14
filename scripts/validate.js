#!/usr/bin/env node
/**
 * validate.js
 *
 * Validates all manifest.json files in /projects against the JSON schema.
 * Run before opening a PR that adds or updates a project.
 *
 * Usage:
 *   node scripts/validate.js
 *   node scripts/validate.js --project my-project-slug
 *
 * Exit codes:
 *   0 — all manifests valid
 *   1 — one or more validation errors found
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const targetSlug = args.includes('--project') ? args[args.indexOf('--project') + 1] : null;

const root = path.resolve(__dirname, '..');
const projectsDir = path.join(root, 'projects');
const schemaPath = path.join(root, 'schemas', 'manifest.schema.json');

if (!fs.existsSync(schemaPath)) {
  console.error('Error: Schema not found at schemas/manifest.schema.json');
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Minimal validator — checks required fields, types, and enum values.
// For full JSON Schema validation, install ajv: npm install ajv
function validate(manifest, slug) {
  const errors = [];

  for (const field of schema.required || []) {
    if (manifest[field] === undefined) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  // Slug must match folder name
  if (manifest.slug && manifest.slug !== slug) {
    errors.push(`Slug mismatch: manifest has "${manifest.slug}", folder is "${slug}"`);
  }

  // Enum checks
  const enums = {
    status: ['prototype', 'stable', 'archived'],
    category: ['tool', 'ui-experiment', 'research', 'data', 'generator', 'other'],
  };
  for (const [field, values] of Object.entries(enums)) {
    if (manifest[field] && !values.includes(manifest[field])) {
      errors.push(`Invalid value for "${field}": "${manifest[field]}" — must be one of: ${values.join(', ')}`);
    }
  }

  // Date format
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  for (const field of ['created', 'updated']) {
    if (manifest[field] && !datePattern.test(manifest[field])) {
      errors.push(`Invalid date format for "${field}": "${manifest[field]}" — expected YYYY-MM-DD`);
    }
  }

  // has_demo / demo_url consistency
  if (manifest.has_demo === true && !manifest.demo_url) {
    errors.push(`has_demo is true but demo_url is null or missing`);
  }

  // Description length
  if (manifest.description && manifest.description.length > 160) {
    errors.push(`Description exceeds 160 characters (${manifest.description.length})`);
  }

  return errors;
}

if (!fs.existsSync(projectsDir)) {
  console.log('No /projects directory found. Nothing to validate.');
  process.exit(0);
}

const projects = fs.readdirSync(projectsDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .filter(slug => !targetSlug || slug === targetSlug);

if (projects.length === 0) {
  console.log(targetSlug ? `Project "${targetSlug}" not found in /projects.` : 'No projects found.');
  process.exit(0);
}

let hasErrors = false;

for (const slug of projects) {
  const manifestPath = path.join(projectsDir, slug, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`[FAIL] ${slug}: manifest.json not found`);
    hasErrors = true;
    continue;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.error(`[FAIL] ${slug}: manifest.json is not valid JSON — ${e.message}`);
    hasErrors = true;
    continue;
  }

  const errors = validate(manifest, slug);
  if (errors.length > 0) {
    console.error(`[FAIL] ${slug}:`);
    errors.forEach(e => console.error(`       - ${e}`));
    hasErrors = true;
  } else {
    console.log(`[OK]   ${slug}`);
  }
}

process.exit(hasErrors ? 1 : 0);

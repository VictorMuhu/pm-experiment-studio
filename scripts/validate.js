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
const schemaPath = path.join(root, 'schemas', 'project-manifest.schema.json');

if (!fs.existsSync(schemaPath)) {
  console.error('Error: Schema not found at schemas/project-manifest.schema.json');
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Strip YYYY-MM-DD- date prefix from a folder name to get the slug.
// e.g. "2026-03-14-funnel-drop-tool" → "funnel-drop-tool"
// Folders without a date prefix are returned unchanged.
function extractSlug(folderName) {
  return folderName.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

// Minimal validator — checks required fields, types, and enum values.
// For full JSON Schema validation, install ajv: npm install ajv
function validate(manifest, folderName) {
  const errors = [];
  const expectedSlug = extractSlug(folderName);

  for (const field of schema.required || []) {
    if (manifest[field] === undefined) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  // Slug must match folder name (without date prefix)
  if (manifest.slug && manifest.slug !== expectedSlug) {
    errors.push(`Slug mismatch: manifest has "${manifest.slug}", expected "${expectedSlug}" (folder: "${folderName}")`);
  }

  // Enum checks against new schema
  const enums = {
    status: ['published', 'draft', 'rejected'],
    bucket: ['pm-productivity', 'gtm-workflow', 'analytics-debugging', 'customer-experience', 'internal-tooling', 'decision-support', 'other'],
    complexity: ['simple', 'intermediate', 'complex'],
    publish_recommendation: ['publish', 'hold', 'scratch'],
    style_direction: [
      'editorial-elegance', 'dense-analyst-console', 'premium-saas', 'brutalist-utility',
      'playful-consumer', 'terminal-minimal', 'mobile-ambient', 'executive-monochrome',
      'retro-future', 'tactile-dashboard', 'high-contrast-command', 'warm-productivity'
    ],
  };
  for (const [field, values] of Object.entries(enums)) {
    if (manifest[field] !== undefined && !values.includes(manifest[field])) {
      errors.push(`Invalid value for "${field}": "${manifest[field]}" — must be one of: ${values.join(', ')}`);
    }
  }

  // Date format for date_created and date_updated
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  for (const field of ['date_created', 'date_updated']) {
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

  // Cross-field: published status requires publish recommendation
  if (manifest.status === 'published' && manifest.publish_recommendation !== 'publish') {
    errors.push(`status is "published" but publish_recommendation is "${manifest.publish_recommendation}" — must be "publish"`);
  }

  // Cross-field: rejected status requires scratch recommendation
  if (manifest.status === 'rejected' && manifest.publish_recommendation !== 'scratch') {
    errors.push(`status is "rejected" but publish_recommendation is "${manifest.publish_recommendation}" — must be "scratch"`);
  }

  return errors;
}

if (!fs.existsSync(projectsDir)) {
  console.log('No /projects directory found. Nothing to validate.');
  process.exit(0);
}

const folders = fs.readdirSync(projectsDir, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .filter(folderName => !targetSlug || extractSlug(folderName) === targetSlug || folderName === targetSlug);

if (folders.length === 0) {
  console.log(targetSlug ? `Project "${targetSlug}" not found in /projects.` : 'No projects found.');
  process.exit(0);
}

let hasErrors = false;

for (const folderName of folders) {
  const manifestPath = path.join(projectsDir, folderName, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(`[FAIL] ${folderName}: manifest.json not found`);
    hasErrors = true;
    continue;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.error(`[FAIL] ${folderName}: manifest.json is not valid JSON — ${e.message}`);
    hasErrors = true;
    continue;
  }

  const errors = validate(manifest, folderName);
  if (errors.length > 0) {
    console.error(`[FAIL] ${folderName}:`);
    errors.forEach(e => console.error(`       - ${e}`));
    hasErrors = true;
  } else {
    console.log(`[OK]   ${folderName}`);
  }
}

process.exit(hasErrors ? 1 : 0);

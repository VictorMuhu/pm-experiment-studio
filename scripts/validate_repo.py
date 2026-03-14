#!/usr/bin/env python3
"""
validate_repo.py — PM Experiment Studio project validator

Checks every project folder under /projects for structural completeness,
manifest validity, README section coverage, file presence, slug uniqueness,
and diversity patterns across recent published projects.

Usage:
    python scripts/validate_repo.py [--project SLUG] [--no-color] [--strict]

Options:
    --project SLUG   Validate a single project by slug instead of all projects.
    --no-color       Disable ANSI color output (useful in CI environments).
    --strict         Treat warnings as errors (non-zero exit on any warning).

Exit codes:
    0 — all checks passed (or only warnings, if --strict is not set)
    1 — one or more errors found
"""

import io
import json
import os
import re
import sys
from dataclasses import dataclass, field

# Force UTF-8 output on Windows terminals that default to cp1252.
if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
from datetime import date
from pathlib import Path
from typing import Optional


# ─────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────

REPO_ROOT = Path(__file__).parent.parent
PROJECTS_DIR = REPO_ROOT / "projects"
SCHEMA_PATH = REPO_ROOT / "schemas" / "project-manifest.schema.json"

# All required h2 sections in a published README.
README_REQUIRED_SECTIONS = [
    "Goal",
    "Problem",
    "Why This Exists",
    "Target Persona",
    "Use Cases",
    "Barebones Wireframe",
    "Product Decisions",
    "Tech Stack",
    "How to Run",
    "Screenshots",
    "Future Enhancements",
    "Decision Log",
]

# Known placeholder values that indicate an unfilled template.
PLACEHOLDER_PATTERNS = [
    r"^\[.+\]$",                 # Entire value is a bracketed placeholder
    r"^YYYY-MM-DD$",             # Unfilled date
    r"^Project Name$",           # Template default name
    r"^project-name$",           # Template default slug
    r"^One sentence describing", # Template default description
    r"^The specific problem",    # Template default problem_statement
    r"^Specific description of", # Template default persona
    r"^Describe what the",       # Template default artifact_type
]

# Diversity thresholds — warn when recent projects repeat these fields.
BUCKET_REPEAT_THRESHOLD = 3       # warn if same bucket N times in a row
STYLE_REPEAT_THRESHOLD  = 2       # warn if same style N times in a row

# Folder name pattern: optional YYYY-MM-DD- prefix, then slug.
FOLDER_DATE_PREFIX_RE = re.compile(r"^(\d{4}-\d{2}-\d{2}-)(.+)$")
SLUG_RE               = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
DATE_RE               = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SCREENSHOT_PATH_RE    = re.compile(r"^screenshots/[a-z0-9_\-\.]+\.(png|jpg|webp)$")
TAG_RE                = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


# ─────────────────────────────────────────────
# Output helpers
# ─────────────────────────────────────────────

USE_COLOR = True  # overridden by --no-color

def _c(code: str, text: str) -> str:
    if not USE_COLOR:
        return text
    return f"\033[{code}m{text}\033[0m"

def ok(msg):    return f"  {_c('32', '[OK]')}   {msg}"
def err(msg):   return f"  {_c('31', '[ERR]')}  {msg}"
def warn(msg):  return f"  {_c('33', '[WARN]')} {msg}"
def info(msg):  return f"  {_c('36', '[INFO]')} {msg}"
def rule(char="-", width=60): return _c("90", char * width)
def bold(text): return _c("1", text)


# ─────────────────────────────────────────────
# Result accumulator
# ─────────────────────────────────────────────

@dataclass
class Result:
    errors:   list = field(default_factory=list)
    warnings: list = field(default_factory=list)
    notes:    list = field(default_factory=list)

    def error(self, msg):   self.errors.append(msg)
    def warning(self, msg): self.warnings.append(msg)
    def note(self, msg):    self.notes.append(msg)

    @property
    def passed(self) -> bool:
        return len(self.errors) == 0


# ─────────────────────────────────────────────
# Schema loader
# ─────────────────────────────────────────────

def load_schema() -> Optional[dict]:
    """Load project-manifest.schema.json. Return None if missing."""
    if not SCHEMA_PATH.exists():
        return None
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        return json.load(f)


def extract_schema_rules(schema: dict) -> dict:
    """Pull the constraints we validate against out of the schema."""
    props = schema.get("properties", {})
    return {
        "required":   set(schema.get("required", [])),
        "enums":      {k: v["enum"] for k, v in props.items() if "enum" in v},
        "min_lengths":{k: v["minLength"] for k, v in props.items() if "minLength" in v},
        "max_lengths":{k: v["maxLength"] for k, v in props.items() if "maxLength" in v},
    }


# ─────────────────────────────────────────────
# Check 1 — Required files
# ─────────────────────────────────────────────

def check_files(project_dir: Path) -> Result:
    r = Result()

    manifest      = project_dir / "manifest.json"
    readme        = project_dir / "README.md"
    decision_log  = project_dir / "decision-log.md"
    screenshots   = project_dir / "screenshots"

    if manifest.exists():
        r.note(ok("manifest.json exists"))
    else:
        r.error("manifest.json is missing")

    if readme.exists():
        r.note(ok("README.md exists"))
    else:
        r.error("README.md is missing")

    if decision_log.exists():
        r.note(ok("decision-log.md exists"))
    else:
        r.error("decision-log.md is missing")

    if screenshots.is_dir():
        png_files = list(screenshots.glob("*.png")) + list(screenshots.glob("*.jpg")) + list(screenshots.glob("*.webp"))
        gitkeep   = screenshots / ".gitkeep"
        pending   = screenshots / "PENDING.md"

        if png_files:
            r.note(ok(f"screenshots/ contains {len(png_files)} image(s)"))
        elif pending.exists():
            r.warning("screenshots/ has no images — PENDING.md present, capture required before publish")
        elif gitkeep.exists() and not png_files:
            r.warning("screenshots/ is empty (.gitkeep only) — add a screenshot or create PENDING.md")
        else:
            r.warning("screenshots/ exists but contains no images and no PENDING.md")
    else:
        r.error("screenshots/ directory is missing")

    return r


# ─────────────────────────────────────────────
# Check 2 — manifest.json validity
# ─────────────────────────────────────────────

def check_manifest(project_dir: Path, schema_rules: Optional[dict]) -> tuple[Result, Optional[dict]]:
    """
    Returns (Result, manifest_dict).
    manifest_dict is None if the file couldn't be loaded.
    """
    r = Result()
    manifest_path = project_dir / "manifest.json"

    if not manifest_path.exists():
        return r, None

    # Parse JSON
    try:
        with open(manifest_path, encoding="utf-8") as f:
            m = json.load(f)
    except json.JSONDecodeError as e:
        r.error(f"manifest.json is not valid JSON — {e}")
        return r, None

    # ── Required fields ──
    required = schema_rules["required"] if schema_rules else {
        "name", "slug", "date_created", "bucket", "persona", "problem_statement",
        "complexity", "artifact_type", "style_direction", "stack", "status",
        "publish_recommendation", "tags",
    }
    missing = [f for f in sorted(required) if f not in m]
    if missing:
        for f in missing:
            r.error(f"manifest.json — missing required field: \"{f}\"")
    else:
        r.note(ok("manifest.json — all required fields present"))

    # ── Enum values ──
    enums = schema_rules["enums"] if schema_rules else {
        "bucket":      ["pm-productivity","gtm-workflow","analytics-debugging",
                        "customer-experience","internal-tooling","decision-support","other"],
        "complexity":  ["simple","intermediate","complex"],
        "status":      ["published","draft","rejected"],
        "publish_recommendation": ["publish","hold","scratch"],
        "style_direction": [
            "editorial-elegance","dense-analyst-console","premium-saas",
            "brutalist-utility","playful-consumer","terminal-minimal",
            "mobile-ambient","executive-monochrome","retro-future",
            "tactile-dashboard","high-contrast-command","warm-productivity",
        ],
    }
    for field_name, allowed in enums.items():
        val = m.get(field_name)
        if val is not None and val not in allowed:
            r.error(
                f"manifest.json — \"{field_name}\" has invalid value \"{val}\"\n"
                f"         allowed: {', '.join(allowed)}"
            )

    # ── Slug format and folder match ──
    slug = m.get("slug", "")
    if slug:
        if not SLUG_RE.match(slug):
            r.error(f"manifest.json — \"slug\" must be lowercase-hyphenated, got: \"{slug}\"")
        else:
            # Derive expected slug from folder name (strip date prefix if present)
            folder_name = project_dir.name
            match = FOLDER_DATE_PREFIX_RE.match(folder_name)
            expected_slug = match.group(2) if match else folder_name
            if slug != expected_slug:
                r.error(
                    f"manifest.json — \"slug\" is \"{slug}\" but folder implies \"{expected_slug}\"\n"
                    f"         folder: {folder_name}"
                )
            else:
                r.note(ok(f"manifest.json — slug \"{slug}\" matches folder"))

    # ── Date fields ──
    for date_field in ("date_created", "date_updated"):
        val = m.get(date_field)
        if val is not None:
            if not DATE_RE.match(str(val)):
                r.error(f"manifest.json — \"{date_field}\" must be YYYY-MM-DD, got: \"{val}\"")

    # ── tags ──
    tags = m.get("tags")
    if tags is not None:
        if not isinstance(tags, list):
            r.error("manifest.json — \"tags\" must be an array")
        else:
            if len(tags) == 0:
                r.warning("manifest.json — \"tags\" is empty; add at least one tag")
            bad_tags = [t for t in tags if not TAG_RE.match(str(t))]
            if bad_tags:
                r.error(f"manifest.json — tags must be lowercase-hyphenated: {bad_tags}")

    # ── stack ──
    stack = m.get("stack")
    if stack is not None:
        if not isinstance(stack, list):
            r.error("manifest.json — \"stack\" must be an array")
        elif len(stack) == 0:
            r.warning("manifest.json — \"stack\" is empty; list the actual technologies used")

    # ── description length ──
    desc = m.get("description", "")
    if desc:
        if len(desc) > 160:
            r.error(f"manifest.json — \"description\" exceeds 160 characters ({len(desc)} chars)")
        if desc.rstrip().endswith("."):
            r.warning("manifest.json — \"description\" ends with a period; convention is no trailing period")

    # ── Cross-field: has_demo ↔ demo_url ──
    has_demo = m.get("has_demo")
    demo_url = m.get("demo_url")
    if has_demo is True and not demo_url:
        r.error("manifest.json — \"has_demo\" is true but \"demo_url\" is null or missing")
    if has_demo is False and demo_url:
        r.warning("manifest.json — \"demo_url\" is set but \"has_demo\" is false")

    # ── Cross-field: status ↔ publish_recommendation ──
    status  = m.get("status")
    pub_rec = m.get("publish_recommendation")
    if status == "published" and pub_rec != "publish":
        r.error(
            f"manifest.json — status is \"published\" but publish_recommendation is \"{pub_rec}\"; "
            "must be \"publish\""
        )
    if status == "rejected" and pub_rec != "scratch":
        r.error(
            f"manifest.json — status is \"rejected\" but publish_recommendation is \"{pub_rec}\"; "
            "must be \"scratch\""
        )
    if pub_rec == "publish" and status not in ("published", "draft"):
        r.error(
            f"manifest.json — publish_recommendation is \"publish\" but status is \"{status}\"; "
            "expected \"published\" or \"draft\""
        )

    # ── screenshot path format ──
    screenshot = m.get("screenshot")
    if screenshot and screenshot is not None:
        if not SCREENSHOT_PATH_RE.match(str(screenshot)):
            r.error(
                f"manifest.json — \"screenshot\" path format is invalid: \"{screenshot}\"\n"
                "         expected: screenshots/filename.png (or .jpg or .webp)"
            )
        else:
            # Check the file actually exists
            screenshot_path = project_dir / screenshot
            if not screenshot_path.exists():
                r.error(
                    f"manifest.json — \"screenshot\" references a file that does not exist: {screenshot}"
                )

    # ── Placeholder detection ──
    str_fields = ["name", "slug", "persona", "problem_statement", "artifact_type", "description"]
    for fname in str_fields:
        val = str(m.get(fname, ""))
        if val and any(re.search(p, val) for p in PLACEHOLDER_PATTERNS):
            r.error(
                f"manifest.json — \"{fname}\" appears to contain unfilled placeholder text: \"{val[:80]}\""
            )

    return r, m


# ─────────────────────────────────────────────
# Check 3 — README.md section coverage
# ─────────────────────────────────────────────

def check_readme(project_dir: Path) -> Result:
    r = Result()
    readme_path = project_dir / "README.md"

    if not readme_path.exists():
        return r  # already flagged in check_files

    content = readme_path.read_text(encoding="utf-8")

    # Find all h2 headings present in the file.
    present = set(re.findall(r"^## (.+)", content, re.MULTILINE))

    missing_sections = []
    for section in README_REQUIRED_SECTIONS:
        if section in present:
            pass
        else:
            missing_sections.append(section)

    if missing_sections:
        for s in missing_sections:
            r.error(f"README.md — missing required section: \"## {s}\"")
    else:
        r.note(ok(f"README.md — all {len(README_REQUIRED_SECTIONS)} required sections present"))

    # Placeholder detection — check for unfilled template brackets in content.
    bracket_matches = re.findall(r"\[.{5,80}\]", content)
    # Filter out markdown link syntax [text](url) and image syntax
    real_placeholders = [
        m for m in bracket_matches
        if not re.match(r"\[.+\]\(.+\)", m + "(x)")  # crude link filter
        and not m.startswith("[!")                     # image alt text
    ]
    if real_placeholders:
        sample = real_placeholders[:3]
        r.warning(
            f"README.md — {len(real_placeholders)} possible unfilled placeholder(s) found: "
            + ", ".join(f'\"{s}\"' for s in sample)
            + (" ..." if len(real_placeholders) > 3 else "")
        )

    return r


# ─────────────────────────────────────────────
# Check 4 — Duplicate slugs
# ─────────────────────────────────────────────

def check_duplicate_slugs(manifests: list[tuple[str, dict]]) -> Result:
    """manifests is a list of (folder_name, manifest_dict) pairs."""
    r = Result()
    seen = {}  # slug → folder_name

    for folder_name, m in manifests:
        slug = m.get("slug", "")
        if not slug:
            continue
        if slug in seen:
            r.error(
                f"Duplicate slug \"{slug}\" found in:\n"
                f"         {seen[slug]}\n"
                f"         {folder_name}"
            )
        else:
            seen[slug] = folder_name

    if not r.errors:
        r.note(ok(f"No duplicate slugs found across {len(manifests)} project(s)"))

    return r


# ─────────────────────────────────────────────
# Check 5 — Diversity patterns
# ─────────────────────────────────────────────

def check_diversity(manifests: list[tuple[str, dict]]) -> Result:
    """
    Inspect published projects sorted by date_created.
    Warn if the same bucket or style_direction repeats too many times in a row.
    """
    r = Result()

    published = [
        (folder, m) for folder, m in manifests
        if m.get("status") == "published"
    ]

    if len(published) < 2:
        r.note(info(f"Diversity check skipped — fewer than 2 published projects ({len(published)} found)"))
        return r

    # Sort by date_created ascending, then by folder name as tiebreaker.
    def sort_key(item):
        _, m = item
        return (m.get("date_created") or "0000-00-00", item[0])

    published.sort(key=sort_key)

    # ── Bucket repetition ──
    buckets = [(folder, m.get("bucket", "")) for folder, m in published]
    _check_consecutive(r, buckets, "bucket", BUCKET_REPEAT_THRESHOLD)

    # ── Style repetition ──
    styles = [(folder, m.get("style_direction", "")) for folder, m in published]
    _check_consecutive(r, styles, "style_direction", STYLE_REPEAT_THRESHOLD)

    # ── Artifact type repetition (softer — warn at 3 in a row) ──
    artifacts = [(folder, m.get("artifact_type", "")[:60]) for folder, m in published]
    _check_consecutive(r, artifacts, "artifact_type (first 60 chars)", 3)

    if not r.errors and not r.warnings:
        r.note(ok(
            f"Diversity looks healthy across {len(published)} published project(s) "
            f"(bucket threshold: {BUCKET_REPEAT_THRESHOLD}, style threshold: {STYLE_REPEAT_THRESHOLD})"
        ))

    return r


def _check_consecutive(r: Result, items: list[tuple[str, str]], field_label: str, threshold: int):
    """
    Walk `items` (list of (folder_name, value)) and warn when the same
    non-empty value appears >= threshold times consecutively.
    """
    if not items:
        return

    run_value  = items[0][1]
    run_count  = 1
    run_start  = 0

    for i in range(1, len(items)):
        folder, val = items[i]
        if val and val == run_value:
            run_count += 1
        else:
            if run_count >= threshold:
                folders_in_run = [items[j][0] for j in range(run_start, i)]
                r.warning(
                    f"Diversity — \"{field_label}\" is \"{run_value}\" "
                    f"{run_count} times in a row:\n"
                    + "".join(f"         • {f}\n" for f in folders_in_run).rstrip()
                )
            run_value = val
            run_count = 1
            run_start = i

    # Flush final run
    if run_count >= threshold:
        folders_in_run = [items[j][0] for j in range(run_start, len(items))]
        r.warning(
            f"Diversity — \"{field_label}\" is \"{run_value}\" "
            f"{run_count} times in a row:\n"
            + "".join(f"         • {f}\n" for f in folders_in_run).rstrip()
        )


# ─────────────────────────────────────────────
# Check 6 — Completeness gate
# ─────────────────────────────────────────────

def check_completeness(project_dir: Path, manifest: Optional[dict]) -> Result:
    """
    A project is considered incomplete (and flagged as an error, not a warning) if:
    - status is "published" but required artifacts are missing or contain placeholders
    - publish_recommendation is "publish" but there are obvious gaps
    """
    r = Result()

    if manifest is None:
        return r

    status  = manifest.get("status", "")
    pub_rec = manifest.get("publish_recommendation", "")

    if status not in ("published",) and pub_rec not in ("publish",):
        return r  # Not claiming to be publish-ready; skip completeness gate

    # Check screenshot exists if not CLI-only
    screenshot = manifest.get("screenshot")
    artifact_type = manifest.get("artifact_type", "").lower()
    is_cli = "cli" in artifact_type

    if not screenshot and not is_cli:
        r.error(
            "Completeness — project is marked publish-ready but \"screenshot\" is null "
            "and artifact_type does not indicate a CLI tool"
        )

    # Check description is non-trivial
    desc = manifest.get("description", "")
    if len(desc) < 20:
        r.error(
            f"Completeness — project is marked publish-ready but \"description\" is too short ({len(desc)} chars)"
        )

    # Check problem_statement is non-trivial
    problem = manifest.get("problem_statement", "")
    if len(problem) < 40:
        r.error(
            f"Completeness — project is marked publish-ready but \"problem_statement\" is too short ({len(problem)} chars)"
        )

    # Check persona is non-trivial
    persona = manifest.get("persona", "")
    if len(persona) < 20:
        r.error(
            f"Completeness — project is marked publish-ready but \"persona\" is too short ({len(persona)} chars)"
        )

    # Check stack is not empty
    stack = manifest.get("stack", [])
    if not stack:
        r.error("Completeness — project is marked publish-ready but \"stack\" is empty")

    # Check tags is not empty
    tags = manifest.get("tags", [])
    if not tags:
        r.error("Completeness — project is marked publish-ready but \"tags\" is empty")

    if not r.errors:
        r.note(ok("Completeness — publish-ready project passes completeness gate"))

    return r


# ─────────────────────────────────────────────
# Project scanner
# ─────────────────────────────────────────────

def find_project_dirs(single_slug: Optional[str] = None) -> list[Path]:
    """Return project directories under /projects, optionally filtered by slug."""
    if not PROJECTS_DIR.exists():
        return []

    dirs = sorted(
        p for p in PROJECTS_DIR.iterdir()
        if p.is_dir() and not p.name.startswith(".")
    )

    if single_slug:
        # Match on folder name or slug portion after date prefix
        filtered = []
        for d in dirs:
            match = FOLDER_DATE_PREFIX_RE.match(d.name)
            slug_part = match.group(2) if match else d.name
            if d.name == single_slug or slug_part == single_slug:
                filtered.append(d)
        return filtered

    return dirs


# ─────────────────────────────────────────────
# Report renderer
# ─────────────────────────────────────────────

def print_project_report(folder_name: str, results: list[Result]) -> tuple[int, int]:
    """Print all results for one project. Returns (error_count, warning_count)."""
    total_errors   = sum(len(r.errors)   for r in results)
    total_warnings = sum(len(r.warnings) for r in results)

    status_tag = (
        _c("31", "X FAIL") if total_errors > 0 else
        _c("33", "! WARN") if total_warnings > 0 else
        _c("32", "* PASS")
    )

    print(f"\n{rule()}")
    print(f"  {bold(folder_name)}  {status_tag}")
    print(rule())

    all_notes = []
    for r in results:
        all_notes.extend(r.notes)
        for e in r.errors:
            print(err(e))
        for w in r.warnings:
            print(warn(w))

    # Print OK notes only if there were no errors (avoids noise in failing output)
    if total_errors == 0:
        for n in all_notes:
            print(n)

    return total_errors, total_warnings


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

def main():
    global USE_COLOR

    args     = sys.argv[1:]
    no_color = "--no-color" in args
    strict   = "--strict" in args
    single   = None

    if "--project" in args:
        idx = args.index("--project")
        if idx + 1 < len(args):
            single = args[idx + 1]
        else:
            print("Error: --project requires a slug argument", file=sys.stderr)
            sys.exit(1)

    if no_color:
        USE_COLOR = False

    # Header
    print(f"\n{rule('=')}")
    print(f"  {bold('PM Experiment Studio -- Repo Validator')}")
    print(rule("="))

    # Load schema
    schema = load_schema()
    schema_rules = extract_schema_rules(schema) if schema else None
    if schema:
        print(info(f"Schema loaded: {SCHEMA_PATH.relative_to(REPO_ROOT)}"))
    else:
        print(warn(f"Schema not found at {SCHEMA_PATH.relative_to(REPO_ROOT)} — using built-in fallback rules"))

    # Find projects
    project_dirs = find_project_dirs(single)

    if not project_dirs:
        if single:
            print(f"\n{err(f'No project found matching slug \"{single}\" in {PROJECTS_DIR}')}")
        else:
            print(f"\n{info(f'No projects found in {PROJECTS_DIR} — nothing to validate.')}")
        sys.exit(0)

    print(info(f"Scanning {PROJECTS_DIR.relative_to(REPO_ROOT)} — {len(project_dirs)} project(s) found"))

    # Per-project checks
    total_errors   = 0
    total_warnings = 0
    all_manifests: list[tuple[str, dict]] = []

    for project_dir in project_dirs:
        folder_name = project_dir.name
        results = []

        # 1. File presence
        file_result = check_files(project_dir)
        results.append(file_result)

        # 2. Manifest validity
        manifest_result, manifest = check_manifest(project_dir, schema_rules)
        results.append(manifest_result)

        if manifest:
            all_manifests.append((folder_name, manifest))

        # 3. README sections
        readme_result = check_readme(project_dir)
        results.append(readme_result)

        # 4. Completeness gate
        completeness_result = check_completeness(project_dir, manifest)
        results.append(completeness_result)

        # Print and accumulate
        e, w = print_project_report(folder_name, results)
        total_errors   += e
        total_warnings += w

    # Repo-wide checks (only if we scanned all projects)
    if not single:
        print(f"\n{rule()}")
        print(f"  {bold('REPO-WIDE CHECKS')}")
        print(rule())

        # 5. Duplicate slugs
        dup_result = check_duplicate_slugs(all_manifests)
        for e in dup_result.errors:
            print(err(e))
            total_errors += 1
        for w in dup_result.warnings:
            print(warn(w))
            total_warnings += 1
        for n in dup_result.notes:
            print(n)

        # 6. Diversity patterns
        div_result = check_diversity(all_manifests)
        for e in div_result.errors:
            print(err(e))
            total_errors += 1
        for w in div_result.warnings:
            print(warn(w))
            total_warnings += 1
        for n in div_result.notes:
            print(n)

    # Summary
    print(f"\n{rule('=')}")
    print(f"  {bold('SUMMARY')}")
    print(rule("="))
    print(f"  Projects scanned : {len(project_dirs)}")
    print(
        f"  Errors           : " +
        (_c("31", str(total_errors)) if total_errors else _c("32", "0"))
    )
    print(
        f"  Warnings         : " +
        (_c("33", str(total_warnings)) if total_warnings else _c("32", "0"))
    )

    if total_errors == 0 and total_warnings == 0:
        print(f"\n  {_c('32', 'All checks passed.')}\n")
        sys.exit(0)
    elif total_errors == 0 and not strict:
        print(f"\n  {_c('33', 'Passed with warnings. Run --strict to treat warnings as errors.')}\n")
        sys.exit(0)
    elif total_errors == 0 and strict:
        print(f"\n  {_c('31', 'FAILED -- warnings treated as errors (--strict mode).')}\n")
        sys.exit(1)
    else:
        print(f"\n  {_c('31', 'FAILED -- fix errors before publishing.')}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()

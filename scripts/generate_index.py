#!/usr/bin/env python3
"""
generate_index.py — Project index generator for PM Experiment Studio

Scans /projects, reads each manifest.json, and writes a formatted markdown
table into README.md between the marker comments:

    <!-- PROJECT_INDEX_START -->
    ...generated content...
    <!-- PROJECT_INDEX_END -->

The markers must exist in README.md before running this script.
If they are absent, the script exits with an error and prints the generated
table to stdout so you can place it manually.

Usage:
    python scripts/generate_index.py [--dry-run] [--no-color] [--sort FIELD]

Options:
    --dry-run        Print generated index to stdout without writing README.md.
    --no-color       Disable ANSI color output.
    --sort FIELD     Sort projects by this manifest field.
                     Default: date_created (descending — newest first).
                     Options: date_created, name, bucket, complexity.

Exit codes:
    0 — index written (or printed in dry-run mode)
    1 — error: markers missing, no readable manifests, or write failure
"""

import io
import json
import re
import sys
from pathlib import Path

# Force UTF-8 output on Windows terminals that default to cp1252.
if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

REPO_ROOT    = Path(__file__).parent.parent
PROJECTS_DIR = REPO_ROOT / "projects"
README_PATH  = REPO_ROOT / "README.md"

INDEX_START  = "<!-- PROJECT_INDEX_START -->"
INDEX_END    = "<!-- PROJECT_INDEX_END -->"

# Folder name pattern for date-prefixed projects: 2026-03-14-slug
FOLDER_DATE_PREFIX_RE = re.compile(r"^(\d{4}-\d{2}-\d{2}-)(.+)$")

VALID_SORT_FIELDS = ("date_created", "name", "bucket", "complexity")

# Complexity sort order for --sort complexity
COMPLEXITY_ORDER = {"simple": 0, "intermediate": 1, "complex": 2, "": 9}

# Bucket display labels — shorten for table readability without losing meaning
BUCKET_LABELS = {
    "pm-productivity":    "PM productivity",
    "gtm-workflow":       "GTM workflow",
    "analytics-debugging":"Analytics / debugging",
    "customer-experience":"Customer experience",
    "internal-tooling":   "Internal tooling",
    "decision-support":   "Decision support",
    "other":              "Other",
}


# ─────────────────────────────────────────────
# Output helpers
# ─────────────────────────────────────────────

USE_COLOR = True

def _c(code: str, text: str) -> str:
    return f"\033[{code}m{text}\033[0m" if USE_COLOR else text

def ok(msg):   return f"  {_c('32', '[OK]')}   {msg}"
def err(msg):  return f"  {_c('31', '[ERR]')}  {msg}"
def info(msg): return f"  {_c('36', '[INFO]')} {msg}"


# ─────────────────────────────────────────────
# Manifest reader
# ─────────────────────────────────────────────

def load_manifests() -> list[dict]:
    """
    Scan all subdirectories of /projects, load manifest.json from each,
    and return a list of dicts with a '_folder' key injected for linking.
    Skips directories that have no manifest or unreadable JSON with a warning.
    """
    if not PROJECTS_DIR.exists():
        return []

    results = []
    for entry in sorted(PROJECTS_DIR.iterdir()):
        if not entry.is_dir() or entry.name.startswith("."):
            continue

        manifest_path = entry / "manifest.json"
        if not manifest_path.exists():
            print(info(f"Skipping {entry.name} — no manifest.json"))
            continue

        try:
            with open(manifest_path, encoding="utf-8") as f:
                data = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            print(err(f"Could not read {entry.name}/manifest.json: {e}"))
            continue

        # Inject the folder name for building relative paths and links.
        data["_folder"] = entry.name
        results.append(data)

    return results


# ─────────────────────────────────────────────
# Field accessors with fallbacks
# ─────────────────────────────────────────────
# The repo has two manifest schemas in circulation:
#   - old: created, category, tech, problem
#   - new: date_created, bucket, stack, problem_statement
# Read new fields first, fall back to old field names.

def get_date(m: dict) -> str:
    return m.get("date_created") or m.get("created") or ""

def get_bucket(m: dict) -> str:
    raw = m.get("bucket") or m.get("category") or ""
    return BUCKET_LABELS.get(raw, raw)

def get_complexity(m: dict) -> str:
    return m.get("complexity") or ""

def get_style(m: dict) -> str:
    return m.get("style_direction") or ""

def get_description(m: dict) -> str:
    desc = m.get("description") or ""
    # Strip any trailing period (schema says no period, but be defensive)
    return desc.rstrip(".")

def get_status(m: dict) -> str:
    return m.get("status") or ""

def get_relative_path(m: dict) -> str:
    return f"projects/{m['_folder']}"


# ─────────────────────────────────────────────
# Sorting
# ─────────────────────────────────────────────

def sort_manifests(manifests: list[dict], field: str) -> list[dict]:
    if field == "date_created":
        # Descending — newest first
        return sorted(manifests, key=lambda m: get_date(m), reverse=True)
    elif field == "name":
        return sorted(manifests, key=lambda m: m.get("name", "").lower())
    elif field == "bucket":
        return sorted(manifests, key=lambda m: get_bucket(m).lower())
    elif field == "complexity":
        return sorted(manifests, key=lambda m: COMPLEXITY_ORDER.get(m.get("complexity", ""), 9))
    return manifests


# ─────────────────────────────────────────────
# Table renderer
# ─────────────────────────────────────────────

def render_table(manifests: list[dict]) -> str:
    """
    Return the full markdown block to inject between the index markers.
    Includes a header comment showing the generation timestamp and count,
    the table itself, and a footer note.
    """
    if not manifests:
        return (
            "_No published projects yet._\n\n"
            "Run `node scripts/scaffold.js` to start one, "
            "or see `prompts/idea-matrix.yaml` for project seeds."
        )

    lines = []

    # Count only published projects for the summary line
    published_count = sum(1 for m in manifests if get_status(m) == "published")
    total_count     = len(manifests)
    summary_parts   = [f"{total_count} project{'s' if total_count != 1 else ''}"]
    if published_count < total_count:
        draft_count = total_count - published_count
        summary_parts.append(f"{published_count} published, {draft_count} in progress")

    lines.append(f"<!-- {', '.join(summary_parts)} — regenerate with: python scripts/generate_index.py -->")
    lines.append("")

    # Table header
    lines.append("| Project | Date | Bucket | Complexity | Style | Description | Path |")
    lines.append("|---------|------|--------|------------|-------|-------------|------|")

    for m in manifests:
        name        = m.get("name") or m.get("slug") or m["_folder"]
        date        = get_date(m)
        bucket      = get_bucket(m)
        complexity  = get_complexity(m)
        style       = get_style(m)
        description = get_description(m)
        path        = get_relative_path(m)
        status      = get_status(m)

        # Link project name to its folder. Use HTML strikethrough for archived projects.
        if status == "archived":
            linked_name = f"~~[{name}]({path})~~"
        else:
            linked_name = f"[{name}]({path})"

        # Status badge inline with name for non-published projects
        if status == "draft":
            linked_name += " `draft`"
        elif status == "rejected":
            linked_name += " `rejected`"

        # Truncate description at 100 chars to keep the table scannable
        if len(description) > 100:
            description = description[:97].rstrip() + "..."

        # Escape pipe characters in any field (they'd break the table)
        def esc(s: str) -> str:
            return s.replace("|", "\\|")

        lines.append(
            f"| {esc(linked_name)} "
            f"| {esc(date)} "
            f"| {esc(bucket)} "
            f"| {esc(complexity)} "
            f"| {esc(style)} "
            f"| {esc(description)} "
            f"| `{esc(path)}` |"
        )

    lines.append("")
    lines.append(
        f"*Sorted by date, newest first. "
        f"Regenerate with `python scripts/generate_index.py`.*"
    )

    return "\n".join(lines)


# ─────────────────────────────────────────────
# README patcher
# ─────────────────────────────────────────────

def patch_readme(table_content: str) -> bool:
    """
    Read README.md, replace content between the index markers, write it back.
    Returns True on success, False if markers are not found.
    """
    if not README_PATH.exists():
        print(err(f"README.md not found at {README_PATH}"))
        return False

    original = README_PATH.read_text(encoding="utf-8")

    # Verify both markers exist
    if INDEX_START not in original:
        print(err(f"Marker not found in README.md: {INDEX_START}"))
        return False
    if INDEX_END not in original:
        print(err(f"Marker not found in README.md: {INDEX_END}"))
        return False

    # Replace everything between (and including) the markers
    pattern     = re.compile(
        re.escape(INDEX_START) + r".*?" + re.escape(INDEX_END),
        re.DOTALL
    )
    replacement = f"{INDEX_START}\n\n{table_content}\n\n{INDEX_END}"
    patched, n  = re.subn(pattern, replacement, original)

    if n == 0:
        print(err("Marker pattern matched zero times — README.md was not modified"))
        return False

    README_PATH.write_text(patched, encoding="utf-8")
    return True


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

def main():
    global USE_COLOR

    args     = sys.argv[1:]
    dry_run  = "--dry-run" in args
    no_color = "--no-color" in args
    sort_by  = "date_created"

    if no_color:
        USE_COLOR = False

    if "--sort" in args:
        idx = args.index("--sort")
        if idx + 1 >= len(args):
            print(err("--sort requires a field name"))
            print(f"  Valid options: {', '.join(VALID_SORT_FIELDS)}")
            sys.exit(1)
        sort_by = args[idx + 1]
        if sort_by not in VALID_SORT_FIELDS:
            print(err(f"Invalid sort field: \"{sort_by}\""))
            print(f"  Valid options: {', '.join(VALID_SORT_FIELDS)}")
            sys.exit(1)

    # Load
    print(info(f"Scanning {PROJECTS_DIR.relative_to(REPO_ROOT)}..."))
    manifests = load_manifests()

    if not manifests:
        print(info("No manifests found — will write empty state to README.md"))
    else:
        print(info(f"Found {len(manifests)} project(s) — sorting by {sort_by}"))

    # Sort and render
    manifests = sort_manifests(manifests, sort_by)
    table     = render_table(manifests)

    if dry_run:
        print(f"\n{_c('90', '─' * 60)}")
        print(f"  {_c('1', 'DRY RUN — generated index (not written to README.md)')}")
        print(f"{_c('90', '─' * 60)}\n")
        print(f"{INDEX_START}\n\n{table}\n\n{INDEX_END}")
        print(f"\n{_c('90', '─' * 60)}")
        print(ok("Dry run complete. Run without --dry-run to write."))
        sys.exit(0)

    # Patch README
    success = patch_readme(table)
    if not success:
        print()
        print(info("Markers were not found. Generated index printed below."))
        print(info(f"Add these markers to README.md and re-run:"))
        print(f"\n  {INDEX_START}\n  {INDEX_END}\n")
        print("Generated content:")
        print(f"\n{table}")
        sys.exit(1)

    published = sum(1 for m in manifests if get_status(m) == "published")
    print(ok(f"README.md updated — {len(manifests)} project(s) indexed ({published} published)"))
    print(ok(f"Markers: {INDEX_START} ... {INDEX_END}"))
    sys.exit(0)


if __name__ == "__main__":
    main()

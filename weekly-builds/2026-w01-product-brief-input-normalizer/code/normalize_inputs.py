"""
normalize_inputs.py

Loads three raw product input files (customer signals, metrics, experiment notes),
normalizes them into a consistent structure, and writes a combined output file.

This is a preprocessing step for the Product Brief Generator (Project #02).
No AI is used here — this is schema enforcement and data normalization only.

Usage:
    python normalize_inputs.py

Output:
    output/normalized_brief_inputs.json
"""

import json
import os
import sys

# --- File paths ---

EXAMPLES_DIR = os.path.join(os.path.dirname(__file__), "..", "examples")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "normalized_brief_inputs.json")

INPUT_FILES = {
    "customer_signals": os.path.join(EXAMPLES_DIR, "sample_customer_signals.json"),
    "metrics": os.path.join(EXAMPLES_DIR, "sample_metrics.json"),
    "experiments": os.path.join(EXAMPLES_DIR, "sample_experiment_notes.json"),
}

# Valid severity values for customer signals
VALID_SEVERITY = {"low", "medium", "high"}

# Valid trend values for metrics
VALID_TREND = {"up", "down", "flat"}


def load_json(filepath, label):
    """Load a JSON file. Raises a readable error if the file is missing or invalid."""
    if not os.path.exists(filepath):
        print(f"[ERROR] Missing input file for '{label}': {filepath}")
        sys.exit(1)
    with open(filepath, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError as e:
            print(f"[ERROR] Could not parse JSON for '{label}': {e}")
            sys.exit(1)


def normalize_customer_signals(raw):
    """
    Normalize customer signal entries.
    Required fields: channel, theme, evidence, severity
    Coerces severity to lowercase. Passes through non-standard values with a warning.
    """
    normalized = []
    for i, entry in enumerate(raw):
        severity = str(entry.get("severity", "")).lower()
        if severity not in VALID_SEVERITY:
            print(f"[WARNING] Signal {i}: unexpected severity value '{severity}' — passing through")

        normalized.append({
            "channel": entry.get("channel", ""),
            "theme": entry.get("theme", ""),
            "evidence": entry.get("evidence", ""),
            "severity": severity,
        })
    return normalized


def normalize_metrics(raw):
    """
    Normalize metric entries.
    Required fields: metric_name, current_value, previous_value, trend
    Coerces trend to lowercase. Passes through non-standard values with a warning.
    """
    normalized = []
    for i, entry in enumerate(raw):
        trend = str(entry.get("trend", "")).lower()
        if trend not in VALID_TREND:
            print(f"[WARNING] Metric {i}: unexpected trend value '{trend}' — passing through")

        normalized.append({
            "metric_name": entry.get("metric_name", ""),
            "current_value": entry.get("current_value"),
            "previous_value": entry.get("previous_value"),
            "trend": trend,
        })
    return normalized


def normalize_experiments(raw):
    """
    Normalize experiment note entries.
    Required fields: experiment_name, hypothesis, result, interpretation
    """
    normalized = []
    for entry in raw:
        normalized.append({
            "experiment_name": entry.get("experiment_name", ""),
            "hypothesis": entry.get("hypothesis", ""),
            "result": entry.get("result", ""),
            "interpretation": entry.get("interpretation", ""),
        })
    return normalized


def main():
    # Load raw inputs
    raw_signals = load_json(INPUT_FILES["customer_signals"], "customer_signals")
    raw_metrics = load_json(INPUT_FILES["metrics"], "metrics")
    raw_experiments = load_json(INPUT_FILES["experiments"], "experiments")

    # Normalize each input type
    normalized = {
        "customer_signals": normalize_customer_signals(raw_signals),
        "metrics": normalize_metrics(raw_metrics),
        "experiments": normalize_experiments(raw_experiments),
    }

    # Print summary
    print(f"[OK] Normalized {len(normalized['customer_signals'])} customer signals")
    print(f"[OK] Normalized {len(normalized['metrics'])} metrics")
    print(f"[OK] Normalized {len(normalized['experiments'])} experiments")

    # Write output
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(normalized, f, indent=2)

    print(f"\n[DONE] Output written to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()

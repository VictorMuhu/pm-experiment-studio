"""
Offline eval runner for the triage script.

Runs 5 test cases covering the core quality dimensions defined in EVALS.md:
  - correct category classification
  - urgency score accuracy (including ambiguous-signal bias-high rule)
  - KB topic stays within controlled vocabulary
  - summary length under 20 words

Usage:
  python test_tickets.py

Prints a pass/fail result per case and an overall pass rate.
"""

import json
import sys
from pathlib import Path

# Add src to path so triage imports cleanly
sys.path.insert(0, str(Path(__file__).parent))
from triage import triage

# ── Test cases ────────────────────────────────────────────────────────────────
# Each case has:
#   ticket:            raw ticket text
#   expected_category: exact expected value
#   min_urgency:       minimum acceptable urgency score
#   max_urgency:       maximum acceptable urgency score
#   kb_topic_contains: substring the kb_topic should contain (or None)
#   label:             short name for reporting

TEST_CASES = [
    {
        "label": "TC1 — billing refund, clear urgency",
        "ticket": (
            "Hi, I was charged twice for my subscription this month. "
            "I need a refund for the duplicate charge. Order #A8823."
        ),
        "expected_category": "billing",
        "min_urgency": 3,
        "max_urgency": 4,
        "kb_topic_contains": "billing",
    },
    {
        "label": "TC2 — account locked, high urgency",
        "ticket": (
            "I cannot log into my account and I have a client demo in 30 minutes. "
            "I've tried resetting my password twice and it still says invalid credentials."
        ),
        "expected_category": "account",
        "min_urgency": 4,
        "max_urgency": 5,
        "kb_topic_contains": "account",
    },
    {
        "label": "TC3 — product bug, medium urgency",
        "ticket": (
            "The export to CSV button on the reports page doesn't do anything when I click it. "
            "I've tried Chrome and Firefox. This has been happening since yesterday."
        ),
        "expected_category": "product",
        "min_urgency": 2,
        "max_urgency": 4,
        "kb_topic_contains": "product",
    },
    {
        "label": "TC4 — technical integration, ambiguous urgency (should bias high)",
        "ticket": (
            "Our webhook is sometimes not firing. It works maybe 70% of the time. "
            "Not sure if it's our end or yours."
        ),
        "expected_category": "technical",
        "min_urgency": 3,   # ambiguous signal — should score at least 3
        "max_urgency": 5,
        "kb_topic_contains": "technical",
    },
    {
        "label": "TC5 — low urgency general question",
        "ticket": (
            "Just wondering if there's a way to export my data as JSON instead of CSV? "
            "Not urgent, just curious if the feature exists."
        ),
        "expected_category": "product",
        "min_urgency": 1,
        "max_urgency": 2,
        "kb_topic_contains": None,
    },
]

# ── Runner ────────────────────────────────────────────────────────────────────

def run_evals():
    passed = 0
    results = []

    for tc in TEST_CASES:
        print(f"\n{tc['label']}")
        print(f"  Ticket: {tc['ticket'][:80]}...")

        try:
            output = triage(tc["ticket"])
            print(f"  Output: {json.dumps(output)}")

            failures = []

            if output.get("category") != tc["expected_category"]:
                failures.append(
                    f"category: got '{output.get('category')}', "
                    f"expected '{tc['expected_category']}'"
                )

            urgency = output.get("urgency", 0)
            if not (tc["min_urgency"] <= urgency <= tc["max_urgency"]):
                failures.append(
                    f"urgency: got {urgency}, "
                    f"expected {tc['min_urgency']}–{tc['max_urgency']}"
                )

            summary = output.get("summary", "")
            word_count = len(summary.split())
            if word_count > 20:
                failures.append(f"summary too long: {word_count} words (max 20)")

            if tc["kb_topic_contains"]:
                kb = output.get("kb_topic", "")
                if tc["kb_topic_contains"] not in kb:
                    failures.append(
                        f"kb_topic: '{kb}' does not contain '{tc['kb_topic_contains']}'"
                    )

            if failures:
                print(f"  FAIL")
                for f in failures:
                    print(f"    - {f}")
                results.append({"label": tc["label"], "pass": False, "failures": failures})
            else:
                print(f"  PASS")
                passed += 1
                results.append({"label": tc["label"], "pass": True})

        except Exception as e:
            print(f"  ERROR: {e}")
            results.append({"label": tc["label"], "pass": False, "failures": [str(e)]})

    print(f"\n{'='*60}")
    print(f"Result: {passed} / {len(TEST_CASES)} passed")

    if passed == len(TEST_CASES):
        print("All tests passed. Build is eval-ready.")
    else:
        print("Some tests failed. Review failures above before publishing.")

    return passed == len(TEST_CASES)


if __name__ == "__main__":
    success = run_evals()
    sys.exit(0 if success else 1)
